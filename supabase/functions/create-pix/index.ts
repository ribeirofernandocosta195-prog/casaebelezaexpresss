// Supabase Edge Function: create-pix
// Communicates directly with Nexum Pay API using encrypted backend credentials

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { orderId } = await req.json();

    if (!orderId) {
      return new Response(JSON.stringify({ error: "Missing orderId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Fetch order details
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Fetch payment credentials
    const { data: paySettings, error: payErr } = await supabase
      .from("payment_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (payErr || !paySettings || !paySettings.is_active) {
      return new Response(JSON.stringify({ error: "Nexum Pay is not configured or active" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prepare payload for Nexum Pay
    const sanitizedName = (order.customer_name || "Cliente")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z\s]/g, "")
      .trim();
    const sanitizedDocument = (order.customer_cpf || "").replace(/\D/g, "");

    const nexumPayload = {
      amount: Number(order.total_amount),
      generatedName: sanitizedName,
      generatedEmail: order.customer_email,
      generatedDocument: sanitizedDocument,
      webhook: {
        url: `${Deno.env.get("APP_URL") || supabaseUrl}/api/pix/webhook`,
        token: paySettings.webhook_secret_token || "nexum_secret_token",
      },
      externalReference: order.order_number,
    };

    // Note: in edge function, headers use decrypted credentials
    const response = await fetch("https://nexumpay.squareweb.app/api/public/pix/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Chat-Id": paySettings.encrypted_chat_id || "",
        "X-API-Credential": paySettings.encrypted_credential || "",
      },
      body: JSON.stringify(nexumPayload),
    });

    const result = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: result.message || "Failed to create Pix at Nexum" }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update order with Pix QR code details
    await supabase
      .from("orders")
      .update({
        pix_tx_id: result.tx_id,
        pix_qr_code_text: result.qr_code_text,
        pix_qr_code_base64: result.qr_code_base64,
        pix_expires_at: new Date(Date.now() + (result.expires_in_seconds || 1800) * 1000).toISOString(),
      })
      .eq("id", order.id);

    return new Response(JSON.stringify({ success: true, pix: result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
