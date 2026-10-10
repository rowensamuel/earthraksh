import { supabase, isSupabaseConfigured } from './supabaseClient';

export type StorageBucketName =
  | 'produce-images'
  | 'equipment-images'
  | 'profile-images'
  | 'soil-reports';

export const storageService = {
  /**
   * Upload an agricultural media file to Supabase Storage
   */
  async uploadFile(
    bucket: StorageBucketName,
    path: string,
    file: File | Blob
  ): Promise<{ publicUrl: string | null; error: string | null }> {
    if (!isSupabaseConfigured || !supabase) {
      // Return temporary object URL for local demonstration
      return { publicUrl: URL.createObjectURL(file), error: null };
    }

    try {
      const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
        upsert: true
      });

      if (error) {
        return { publicUrl: null, error: error.message };
      }

      if (bucket === 'soil-reports') {
        // Soil reports are private documents; signed URL is required
        const { data: signedData, error: signError } = await supabase.storage
          .from(bucket)
          .createSignedUrl(data.path, 3600); // 1 hour access
        if (signError) {
          return { publicUrl: null, error: signError.message };
        }
        return { publicUrl: signedData.signedUrl, error: null };
      }

      // Public media buckets (produce, equipment, profile)
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
      return { publicUrl: urlData.publicUrl, error: null };
    } catch (err: any) {
      return { publicUrl: null, error: err.message || 'File upload failed.' };
    }
  },

  /**
   * Get secure URL for private document (e.g. soil lab diagnostic report)
   */
  async getSecureDocumentUrl(path: string, expiresIn = 3600): Promise<string | null> {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }
    const { data, error } = await supabase.storage
      .from('soil-reports')
      .createSignedUrl(path, expiresIn);
    return error ? null : data.signedUrl;
  }
};
