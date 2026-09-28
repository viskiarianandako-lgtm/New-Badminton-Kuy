"use client";

export default function DiagPage() {
  const urlDefined = typeof process.env.NEXT_PUBLIC_SUPABASE_URL !== "undefined" && process.env.NEXT_PUBLIC_SUPABASE_URL !== "";
  const anonKeyDefined = typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "undefined" && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "";

  return (
    <div style={{ padding: 20, fontFamily: "monospace" }}>
      <h1>Environment Diagnostic</h1>
      <pre>{JSON.stringify({ urlDefined, anonKeyDefined }, null, 2)}</pre>
    </div>
  );
}
