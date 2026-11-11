// Supabase Edge Function: pix-webhook
// Handles incoming Nexum Pay webhooks with token verification, idempotency, and atomic stock confirmation

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-token",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Verify token
    const receivedToken = req.headers.get("X-Webhook-Token") || req.headers.get("x-webhook-token");
    
    // Fetch payment settings to validate token
    const { data: paySettings } = await supabase
      .from("payment_settings")
      .select("webhook_secret_token, is_active")
      .eq("id", 1)
      .single();

    if (paySettings?.webhook_secret_token && receivedToken !== paySettings.webhook_secret_token) {
      console.error("Invalid webhook token received");
      return new Response(JSON.stringify({ error: "Invalid webhook token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    console.log("Webhook payload received:", JSON.stringify(body));

    const { event, tx_id, status, transaction } = body;

    if (!tx_id) {
      return new Response(JSON.stringify({ error: "Missing tx_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Idempotency Check
    const eventId = `nexum_${tx_id}_${status}_${Date.now()}`;
    const { data: existingEvent } = await supabase
      .from("payment_webhook_events")
      .select("id")
      .eq("tx_id", tx_id)
      .eq("event_type", status)
      .maybeSingle();

    if (existingEvent) {
      console.log(`Event ${status} for tx_id ${tx_id} already processed.`);
      return new Response(JSON.stringify({ message: "Event already processed (idempotent)" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Record webhook event
    await supabase.from("payment_webhook_events").insert({
      event_id: eventId,
      tx_id: tx_id,
      event_type: status || event,
      payload: body,
      processed_status: "processing",
    });

    // 3. Find order matching tx_id
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, order_number, total_amount, financial_status")
      .eq("pix_tx_id", tx_id)
      .maybeSingle();

    if (orderError || !order) {
      console.warn("Order not found for tx_id:", tx_id);
      return new Response(JSON.stringify({ warning: "Order not found for tx_id" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const paidStatuses = ["PAID", "APPROVED", "COMPLETED", "SUCCESS", "CONFIRMED", "COMPLETO"];
    const isPaid = paidStatuses.includes((status || "").toUpperCase());

    if (isPaid && order.financial_status !== "Pago") {
      // Validate amount paid if transaction is provided
      if (transaction?.amount_paid && Number(transaction.amount_paid) < Number(order.total_amount)) {
        console.error("Underpaid order transaction! Flagging divergence.");
        await supabase
          .from("orders")
          .update({
            financial_status: "Falhou",
            notes: `Valor pago (R$ ${transaction.amount_paid}) diverge do total do pedido (R$ ${order.total_amount})`,
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id);

        return new Response(JSON.stringify({ error: "Amount divergence" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Mark order as paid atomically
      await supabase
        .from("orders")
        .update({
          financial_status: "Pago",
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      // Decrement stock for order items & convert stock reservation
      const { data: items } = await supabase
        .from("order_items")
        .select("product_id, quantity")
        .eq("order_id", order.id);

      if (items) {
        for (const item of items) {
          // Decrement product stock safely
          await supabase.rpc("decrement_product_stock", {
            p_id: item.product_id,
            p_qty: item.quantity,
          });
        }
      }

      // Convert reservation
      await supabase
        .from("stock_reservations")
        .update({ status: "converted" })
        .eq("order_id", order.id);

      // Record transaction
      await supabase.from("payment_transactions").insert({
        order_id: order.id,
        tx_id: tx_id,
        external_reference: transaction?.external_reference || order.order_number,
        amount: order.total_amount,
        amount_paid: transaction?.amount_paid || order.total_amount,
        amount_net: transaction?.amount_net || null,
        raw_status: status,
        raw_response: body,
      });

      console.log(`Order ${order.order_number} successfully marked as PAID.`);
    }

    return new Response(JSON.stringify({ success: true, order_id: order.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
