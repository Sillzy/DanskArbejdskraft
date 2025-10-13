// components/admin/DeleteUserButton.tsx
'use client';

export default function DeleteUserButton({ uid }: { uid: string }) {
  return (
    <form action={`/api/admin/delete-user?uid=${uid}`} method="post">
      <button
        type="submit"
        className="rounded border px-2 py-1 text-xs text-red-600"
        onClick={(e) => {
          if (!confirm('Delete this user and profile?')) e.preventDefault();
        }}
      >
        Delete
      </button>
    </form>
  );
}
