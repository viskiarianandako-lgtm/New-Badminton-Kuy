"use client";

import { useEffect, useState } from "react";
import { getSessionByCode, listPlayers, listMatches } from "@/src/lib/api";

export default function DiagPage() {
  const [results, setResults] = useState({
    sessionApi: false,
    playersApi: false,
    matchesApi: false,
  });

  useEffect(() => {
    async function testApis() {
      let sessionSuccess = false;
      let playersSuccess = false;
      let matchesSuccess = false;

      try {
        await getSessionByCode("JBXA8F");
        sessionSuccess = true;
      } catch {
        sessionSuccess = false;
      }

      try {
        await listPlayers("JBXA8F");
        playersSuccess = true;
      } catch {
        playersSuccess = false;
      }

      try {
        await listMatches("JBXA8F");
        matchesSuccess = true;
      } catch {
        matchesSuccess = false;
      }

      setResults({
        sessionApi: sessionSuccess,
        playersApi: playersSuccess,
        matchesApi: matchesSuccess,
      });
    }

    testApis();
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "monospace" }}>
      <h1>Session API Diagnostic</h1>
      <pre>{JSON.stringify(results, null, 2)}</pre>
    </div>
  );
}
