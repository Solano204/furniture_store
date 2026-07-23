import { createClient, SupabaseClient } from '@supabase/supabase-js';

const bucket = 'main-bucket';

// Created lazily, not at module scope: this file is transitively imported by
// routes that never touch Supabase storage (e.g. /auth/password), and Next.js's
// build-time page-data collection imports every route module just to inspect
// it - eager createClient() would fail the whole build on an invalid/missing
// SUPABASE_URL even for pages that never call uploadImage/deleteImage.
let client: SupabaseClient | undefined;

const supabase = () => {
  if (!client) {
    client = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_KEY as string
    );
  }
  return client;
};

export const uploadImage = async (image: File) => {
  const timestamp = Date.now();
  // const newName = `/users/${timestamp}-${image.name}`;
  const newName = `${timestamp}-${image.name}`;

  const { data, error } = await supabase().storage
    .from(bucket)
    .upload(newName, image, {
      cacheControl: '3600',
    });
  if (!data) throw new Error('Image upload failed');
  return supabase().storage.from(bucket).getPublicUrl(newName).data.publicUrl;
};

export const deleteImage = (url: string) => {
  const imageName = url.split('/').pop();
  if (!imageName) throw new Error('Invalid URL');
  return supabase().storage.from(bucket).remove([imageName]);
};

