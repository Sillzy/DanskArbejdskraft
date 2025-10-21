//src/lib/adminDocumentsStore.ts
import 'server-only';
import { getServerSupabase } from '@/../lib/supabase-server';

export type AdminDocument = {
  id: string;
  title: string;
  type: string;                 // Contract | Payslip | Invoice | Policy | Procedure | Template | Report | Other
  description?: string | null;
  createdAt: string;            // ISO string (timestamptz)
};

export async function listDocuments(): Promise<AdminDocument[]> {
  const supabase = await getServerSupabase();

  const { data, error } = await supabase
    .from('admin_documents')
    .select('id, title, type, description, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    // Fail closed but don’t crash the page
    return [];
  }

  return (data ?? []).map((r: any) => ({
    id: r.id,
    title: r.title,
    type: r.type,
    description: r.description,
    createdAt: r.created_at,
  }));
}
