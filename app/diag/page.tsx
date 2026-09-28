"use client";

import { getSupabase, supabase } from "@/src/lib/supabase";

export default function DiagPage() {
  let directSucceeded = false;
  try {
    getSupabase();
    directSucceeded = true;
  } catch {
    directSucceeded = false;
  }

  let proxySucceeded = false;
  try {
    void supabase.auth;
    proxySucceeded = true;
  } catch {
    proxySucceeded = false;
  }

  return (
    <div style={{ padding: 20, fontFamily: "monospace" }}>
      <h1>Proxy Diagnostic</h1>
      <pre>{JSON.stringify({ directGetSupabase: directSucceeded, proxyPropertyAccess: proxySucceeded }, null, 2)}</pre>
    </div>
  );
}
