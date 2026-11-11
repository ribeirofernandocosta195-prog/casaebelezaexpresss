import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('sua-url-supabase')
);

export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as unknown as SupabaseClient);

/**
 * Helper to upload image to Supabase Storage bucket 'products' or 'banners'
 */
export async function uploadImageToStorage(
  file: File,
  bucket: 'products' | 'banners' = 'products'
): Promise<{ url: string | null; error: string | null }> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      url: null,
      error: 'Supabase Storage não está configurado no momento. Use uma URL externa de imagem.',
    };
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      return { url: null, error: uploadError.message };
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return { url: data.publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err.message || 'Falha no upload da imagem.' };
  }
}
