import { randomUUID } from 'crypto';

export type AdminDocument = {
  id: string;
  title: string;
  type: string;         // Contract | Payslip | Invoice | Policy | Procedure | Template | Report | Other | ...
  description?: string;
  originalName: string;
  mimeType: string;
  diskPath: string;     // server file path
  createdAt: number;
};

const g = globalThis as any;
if (!g.__adminDocsStore) {
  g.__adminDocsStore = new Map<string, AdminDocument>();
}
const store = g.__adminDocsStore as Map<string, AdminDocument>;

export function addDocument(doc: Omit<AdminDocument, 'id' | 'createdAt'>) {
  const id = randomUUID();
  const createdAt = Date.now();
  const full: AdminDocument = { id, createdAt, ...doc };
  store.set(id, full);
  return full;
}

export function listDocuments(): AdminDocument[] {
  return Array.from(store.values()).sort((a, b) => b.createdAt - a.createdAt);
}

export function getDocument(id: string): AdminDocument | undefined {
  return store.get(id);
}

export function deleteDocument(id: string): boolean {
  return store.delete(id);
}
