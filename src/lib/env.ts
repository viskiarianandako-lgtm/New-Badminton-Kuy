/**
 * Environment variables validation
 * 
 * This module validates that all required environment variables are present
 * at runtime. It throws descriptive errors if any are missing.
 */

export function validateEnv() {
  const required = [
    { key: "NEXT_PUBLIC_SUPABASE_URL", description: "Supabase project URL" },
    { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", description: "Supabase anonymous key" },
  ];

  const missing = required.filter(({ key }) => !process.env[key]);

  if (missing.length > 0) {
    const details = missing
      .map(({ key, description }) => `  - ${key}: ${description}`)
      .join("\n");

    throw new Error(
      `Missing required environment variables:\n\n${details}\n\n` +
        `Please check your .env.local file. See .env.example for reference.`
    );
  }

  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  };
}

// Safe getter that returns null instead of throwing
export function getEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return { supabaseUrl, supabaseAnonKey };
}
