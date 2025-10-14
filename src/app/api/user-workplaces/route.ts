// src/app/api/user-workplaces/route.ts
import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/../lib/supabase-server';

export async function POST(req: Request) {
  try {
    const supabase = await getServerSupabase();

    // Auth
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Must be approved profile
    const { data: prof, error: profErr } = await supabase
      .from('profiles')
      .select('profile_status')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profErr) {
      return NextResponse.json({ error: profErr.message }, { status: 400 });
    }
    if ((prof as any)?.profile_status !== 'approved') {
      return NextResponse.json({ error: 'Profile not approved' }, { status: 403 });
    }

    // Payload
    const body = (await req.json().catch(() => null)) as { workplace_id?: string } | null;
    const workplace_id = body?.workplace_id?.trim();
    if (!workplace_id) {
      return NextResponse.json({ error: 'Missing workplace_id' }, { status: 400 });
    }

    // Ensure workplace exists and is active
    const { data: wp, error: wpErr } = await supabase
      .from('workplaces')
      .select('id, is_active')
      .eq('id', workplace_id)
      .maybeSingle();

    if (wpErr) {
      return NextResponse.json({ error: wpErr.message }, { status: 400 });
    }
    if (!wp || (wp as any).is_active === false) {
      return NextResponse.json({ error: 'Workplace is not active' }, { status: 400 });
    }

    // Idempotent add (ignore duplicates)
    // Requires a unique index on (user_id, workplace_id)
    // e.g. CREATE UNIQUE INDEX user_workplaces_unique ON user_workplaces(user_id, workplace_id);
    const { error: upsertErr } = await supabase
      .from('user_workplaces')
      .upsert(
        { user_id: user.id, workplace_id },
        { onConflict: 'user_id,workplace_id', ignoreDuplicates: true }
      );

    if (upsertErr) {
      // If DB returns a conflict message in edge cases, surface it as "already added"
      const msg = String(upsertErr.message || '').toLowerCase();
      if (msg.includes('duplicate') || msg.includes('conflict')) {
        return NextResponse.json({ error: 'Workplace already added' }, { status: 409 });
      }
      return NextResponse.json({ error: upsertErr.message }, { status: 400 });
    }

    // Check whether it was *already* in table to report 409
    const { data: existing, error: checkErr } = await supabase
      .from('user_workplaces')
      .select('user_id')
      .eq('user_id', user.id)
      .eq('workplace_id', workplace_id)
      .maybeSingle();

    if (checkErr) {
      // Non-fatal; just return ok to keep the UX smooth
      return NextResponse.json({ ok: true });
    }
    if (existing) {
      // This is the "already there" outcome for idempotent calls
      return NextResponse.json({ ok: true, already: true }, { status: 200 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e: any) {
    // Any uncaught exception
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await getServerSupabase();

    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const url = new URL(req.url);
    const workplace_id = url.searchParams.get('workplace_id')?.trim();
    if (!workplace_id) {
      return NextResponse.json({ error: 'Missing workplace_id' }, { status: 400 });
    }

    // Remove only the mapping for this user (does not delete the workplace)
    const { error } = await supabase
      .from('user_workplaces')
      .delete()
      .eq('user_id', user.id)
      .eq('workplace_id', workplace_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
