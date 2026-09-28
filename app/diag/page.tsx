"use client";

import { getSupabase } from "@/src/lib/supabase";

export default function DiagPage() {
  const urlDefined = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKeyDefined = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  let getSupabaseSucceeded = false;
  let getSupabaseError = false;

  try {
    getSupabase();
    getSupabaseSucceeded = true;
  } catch {
    getSupabaseError = true;
  }

  return (
    <div style={{ padding: 20, fontFamily: "monospace" }}>
      <h1>Supabase Initialization Diagnostic</h1>
      <pre>{JSON.stringify({ urlDefined, anonKeyDefined, getSupabaseSucceeded, getSupabaseError }, null, 2)}</pre>
    </div>
  );
}
