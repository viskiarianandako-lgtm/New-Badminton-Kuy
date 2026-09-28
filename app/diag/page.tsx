"use client";

import { useEffect, useState } from "react";
import { login } from "@/src/lib/api";

export default function DiagPage() {
  const [trace, setTrace] = useState({
    submit_started: false,
    login_function_called: false,
    auth_request_started: false,
    auth_request_completed: false,
    auth_success: false,
    auth_failed: false,
    redirect_called: false,
  });

  useEffect(() => {
    async function runDiagnostic() {
      // Step 1: submit_started
      setTrace((prev) => ({ ...prev, submit_started: true }));

      // Step 2: login_function_called
      try {
        setTrace((prev) => ({ ...prev, login_function_called: true }));

        // Step 3: auth_request_started
        setTrace((prev) => ({ ...prev, auth_request_started: true }));

        // Call login with test credentials
        await login("testuser1790559317322@gmail.com", "TestPass123");

        // Step 4: auth_request_completed
        setTrace((prev) => ({ ...prev, auth_request_completed: true }));

        // Step 5: auth_success
        setTrace((prev) => ({ ...prev, auth_success: true }));

        // Step 6: redirect_called
        setTrace((prev) => ({ ...prev, redirect_called: true }));
      } catch (error) {
        // Step 4: auth_request_completed (even on error)
        setTrace((prev) => ({ ...prev, auth_request_completed: true }));

        // Step 5: auth_failed
        setTrace((prev) => ({ ...prev, auth_failed: true }));
      }
    }

    runDiagnostic();
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "monospace" }}>
      <h1>Login Trace Diagnostic</h1>
      <pre>{JSON.stringify(trace, null, 2)}</pre>
    </div>
  );
}
