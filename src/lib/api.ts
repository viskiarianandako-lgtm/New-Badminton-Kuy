import { supabase, type Session, type Player, type Match } from "./supabase";
import { logger } from "./logger";
import {
  AppError,
  NotFoundError,
  ForbiddenError,
  ValidationError,
  parseErrorMessage,
} from "./errors";
import {
  validateSessionInput,
  validateJoinInput,
  validateScoreInput,
  validateRegisterInput,
  validateLoginInput,
} from "./validation";

// Generate unique session code
function makeCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 6 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}

// Auth API
export async function register(name: string, email: string, password: string) {
  logger.info("register attempt", { email });
  
  try {
    const validated = validateRegisterInput({ name, email, password });
    
    const { data, error } = await supabase.auth.signUp({
      email: validated.email,
      password: validated.password,
      options: {
        data: { name: validated.name },
      },
    });

    if (error) {
      logger.error("register failed", { email, error: error.message });
      throw new AppError(error.message, "AUTH_ERROR", 400);
    }

    logger.info("register success", { email });
    return data;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("register unexpected error", { error });
    throw new AppError(parseErrorMessage(error), "REGISTER_ERROR", 500);
  }
}

export async function login(email: string, password: string) {
  logger.info("login attempt", { email });
  
  try {
    const validated = validateLoginInput({ email, password });
    
    console.log("[LOGIN_TRACE] auth_request_started");
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validated.email,
      password: validated.password,
    });

    if (error) {
      console.log("[LOGIN_TRACE] auth_request_failed");
      logger.error("login failed", { email, error: error.message });
      throw new AppError("Email atau kata sandi salah", "AUTH_ERROR", 401);
    }

    console.log("[LOGIN_TRACE] auth_request_succeeded");
    logger.info("login success", { email });
    return data;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("login unexpected error", { error });
    throw new AppError(parseErrorMessage(error), "LOGIN_ERROR", 500);
  }
}

export async function logout() {
  logger.info("logout");
  
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw new AppError(error.message, "AUTH_ERROR", 400);
    logger.info("logout success");
  } catch (error) {
    logger.error("logout error", { error });
    throw error instanceof AppError ? error : new AppError(parseErrorMessage(error), "LOGOUT_ERROR", 500);
  }
}

export async function getCurrentUser() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    logger.error("getCurrentUser error", { error });
    return null;
  }
}

// Session API
export async function createSession(
  sessionData: {
    name: string;
    date: string;
    location: string;
    num_courts: number;
    scoring_rule: string;
    rounds_per_player: number;
    non_member_fee: number;
    shuttle_price: number;
    host_id: string;
    host_name: string;
  }
) {
  logger.info("createSession attempt", { name: sessionData.name });
  
  try {
    const validated = validateSessionInput(sessionData);
    
    let code = makeCode();
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      const { data } = await supabase
        .from("sessions")
        .select("code")
        .eq("code", code)
        .single();

      if (!data) {
        isUnique = true;
      } else {
        code = makeCode();
        attempts++;
      }
    }

    if (!isUnique) {
      throw new AppError("Gagal membuat kode sesi unik", "CODE_GENERATION_ERROR", 500);
    }

    const { data, error } = await supabase
      .from("sessions")
      .insert({
        ...validated,
        code,
        status: "active",
        matches_generated: false,
        host_id: sessionData.host_id,
        host_name: sessionData.host_name,
      })
      .select()
      .single();

    if (error) {
      logger.error("createSession failed", { error: error.message });
      throw new AppError(error.message, "CREATE_SESSION_ERROR", 500);
    }

    logger.info("createSession success", { code });
    return data;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("createSession unexpected error", { error });
    throw new AppError(parseErrorMessage(error), "CREATE_SESSION_ERROR", 500);
  }
}

export async function getSessionByCode(code: string) {
  logger.debug("getSessionByCode", { code });
  
  try {
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("code", code.toUpperCase())
      .is("deleted_at", null)
      .single();

    if (error || !data) {
      throw new NotFoundError("Sesi tidak ditemukan");
    }

    return data;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    logger.error("getSessionByCode error", { code, error });
    throw new AppError(parseErrorMessage(error), "GET_SESSION_ERROR", 500);
  }
}

export async function listSessions(hostId: string) {
  logger.debug("listSessions", { hostId });
  
  try {
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("host_id", hostId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw new AppError(error.message, "LIST_SESSIONS_ERROR", 500);

    return data;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("listSessions error", { error });
    throw new AppError(parseErrorMessage(error), "LIST_SESSIONS_ERROR", 500);
  }
}

export async function deleteSession(code: string, hostId: string) {
  logger.info("deleteSession attempt", { code });
  
  try {
    const { error } = await supabase
      .from("sessions")
      .update({ deleted_at: new Date().toISOString() })
      .eq("code", code)
      .eq("host_id", hostId);

    if (error) throw new AppError(error.message, "DELETE_SESSION_ERROR", 500);

    logger.info("deleteSession success", { code });
    return { ok: true };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("deleteSession error", { error });
    throw new AppError(parseErrorMessage(error), "DELETE_SESSION_ERROR", 500);
  }
}

export async function finishSession(code: string, hostId: string) {
  logger.info("finishSession attempt", { code });
  
  try {
    const { data, error } = await supabase
      .from("sessions")
      .update({ status: "finished" })
      .eq("code", code)
      .eq("host_id", hostId)
      .select()
      .single();

    if (error) throw new AppError(error.message, "FINISH_SESSION_ERROR", 500);

    logger.info("finishSession success", { code });
    return data;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("finishSession error", { error });
    throw new AppError(parseErrorMessage(error), "FINISH_SESSION_ERROR", 500);
  }
}

// Player API
export async function joinSession(code: string, name: string, isMember: boolean) {
  logger.info("joinSession attempt", { code, name });
  
  try {
    const validated = validateJoinInput({ name, is_member: isMember });
    const session = await getSessionByCode(code);

    if (session.status !== "active") {
      throw new ValidationError("Sesi sudah ditutup");
    }

    // Check for duplicate player name in this session
    const { data: existingPlayer } = await supabase
      .from("players")
      .select("id")
      .eq("session_id", session.id)
      .ilike("name", validated.name)
      .maybeSingle();

    if (existingPlayer) {
      throw new ValidationError("Nama sudah terdaftar di sesi ini");
    }

    const fee = validated.is_member ? 0 : session.non_member_fee || 0;

    const { data, error } = await supabase
      .from("players")
      .insert({
        session_id: session.id,
        name: validated.name,
        is_member: validated.is_member,
        fee,
        shuttlecocks: 0,
        paid: false,
      })
      .select()
      .single();

    if (error) throw new AppError(error.message, "JOIN_SESSION_ERROR", 500);

    logger.info("joinSession success", { code, name });
    return data;
  } catch (error) {
    if (error instanceof AppError || error instanceof ValidationError) throw error;
    logger.error("joinSession error", { error });
    throw new AppError(parseErrorMessage(error), "JOIN_SESSION_ERROR", 500);
  }
}

export async function listPlayers(code: string) {
  logger.debug("listPlayers", { code });
  
  try {
    const session = await getSessionByCode(code);

    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("session_id", session.id)
      .order("created_at", { ascending: true })
      .limit(500);

    if (error) throw new AppError(error.message, "LIST_PLAYERS_ERROR", 500);

    return data;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("listPlayers error", { error });
    throw new AppError(parseErrorMessage(error), "LIST_PLAYERS_ERROR", 500);
  }
}

export async function updatePlayerShuttlecocks(
  code: string,
  playerId: string,
  shuttlecocks: number
) {
  if (shuttlecocks < 0 || shuttlecocks > 999) {
    throw new ValidationError("Jumlah kok tidak valid");
  }

  try {
    const { data, error } = await supabase
      .from("players")
      .update({ shuttlecocks })
      .eq("id", playerId)
      .select()
      .single();

    if (error) throw new AppError(error.message, "UPDATE_PLAYER_ERROR", 500);

    return data;
  } catch (error) {
    if (error instanceof AppError || error instanceof ValidationError) throw error;
    logger.error("updatePlayerShuttlecocks error", { error });
    throw new AppError(parseErrorMessage(error), "UPDATE_PLAYER_ERROR", 500);
  }
}

export async function setPlayerPaid(code: string, playerId: string, paid: boolean) {
  try {
    const { data, error } = await supabase
      .from("players")
      .update({ paid })
      .eq("id", playerId)
      .select()
      .single();

    if (error) throw new AppError(error.message, "UPDATE_PLAYER_ERROR", 500);

    return data;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("setPlayerPaid error", { error });
    throw new AppError(parseErrorMessage(error), "UPDATE_PLAYER_ERROR", 500);
  }
}

export async function removePlayer(code: string, playerId: string) {
  logger.info("removePlayer attempt", { code, playerId });
  
  try {
    const { error } = await supabase.from("players").delete().eq("id", playerId);

    if (error) throw new AppError(error.message, "REMOVE_PLAYER_ERROR", 500);

    logger.info("removePlayer success", { playerId });
    return { ok: true };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("removePlayer error", { error });
    throw new AppError(parseErrorMessage(error), "REMOVE_PLAYER_ERROR", 500);
  }
}

// Match API
export function buildSchedule(
  players: Player[],
  roundsPerPlayer: number,
  numCourts: number,
  sessionId: string
): Omit<Match, "id" | "created_at">[] {
  const ids = players.map((p) => p.id);
  const nameOf: Record<string, string> = {};
  players.forEach((p) => {
    nameOf[p.id] = p.name;
  });

  const n = ids.length;
  if (n < 2) return [];

  const teamSize = n >= 4 ? 2 : 1;
  const slots = teamSize * 2;
  const totalMatches = Math.max(1, Math.round((n * roundsPerPlayer) / slots));

  const appearances: Record<string, number> = {};
  ids.forEach((id) => {
    appearances[id] = 0;
  });

  const matches: Omit<Match, "id" | "created_at">[] = [];

  for (let m = 0; m < totalMatches; m++) {
    const pool = [...ids].sort(
      (a, b) => appearances[a] - appearances[b] || Math.random() - 0.5
    );
    const chosen = pool.slice(0, slots);
    for (const pid of chosen) {
      appearances[pid]++;
    }

    const shuffled = [...chosen].sort(() => Math.random() - 0.5);
    const teamA = shuffled.slice(0, teamSize);
    const teamB = shuffled.slice(teamSize, slots);

    const court = (m % numCourts) + 1;
    const round = Math.floor(m / numCourts) + 1;

    matches.push({
      session_id: sessionId,
      court,
      round,
      order: m,
      team_a: teamA,
      team_b: teamB,
      team_a_names: teamA.map((p) => nameOf[p]),
      team_b_names: teamB.map((p) => nameOf[p]),
      score_a: 0,
      score_b: 0,
      status: "pending",
      winner: null,
    });
  }

  return matches;
}

export async function generateMatches(code: string, hostId: string) {
  logger.info("generateMatches attempt", { code });
  
  try {
    const session = await getSessionByCode(code);

    if (session.host_id !== hostId) {
      throw new ForbiddenError("Bukan sesi Anda");
    }

    const players = await listPlayers(code);

    if (players.length < 2) {
      throw new ValidationError("Butuh minimal 2 pemain untuk membuat pertandingan");
    }

    await supabase.from("matches").delete().eq("session_id", session.id);

    const matches = buildSchedule(
      players,
      session.rounds_per_player,
      session.num_courts,
      session.id
    );

    if (matches.length > 0) {
      const { error } = await supabase.from("matches").insert(matches);
      if (error) throw new AppError(error.message, "GENERATE_MATCHES_ERROR", 500);
    }

    await supabase
      .from("sessions")
      .update({ matches_generated: true })
      .eq("id", session.id);

    logger.info("generateMatches success", { code, count: matches.length });
    return matches;
  } catch (error) {
    if (error instanceof AppError || error instanceof ForbiddenError || error instanceof ValidationError) throw error;
    logger.error("generateMatches error", { error });
    throw new AppError(parseErrorMessage(error), "GENERATE_MATCHES_ERROR", 500);
  }
}

export async function listMatches(code: string) {
  logger.debug("listMatches", { code });
  
  try {
    const session = await getSessionByCode(code);

    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .eq("session_id", session.id)
      .order("order", { ascending: true })
      .limit(1000);

    if (error) throw new AppError(error.message, "LIST_MATCHES_ERROR", 500);

    return data;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("listMatches error", { error });
    throw new AppError(parseErrorMessage(error), "LIST_MATCHES_ERROR", 500);
  }
}

export async function updateMatchScore(
  code: string,
  matchId: string,
  scoreA: number,
  scoreB: number,
  status?: string
) {
  logger.debug("updateMatchScore", { code, matchId, scoreA, scoreB });
  
  try {
    const validated = validateScoreInput({ score_a: scoreA, score_b: scoreB });
    const session = await getSessionByCode(code);
    const target = session.scoring_rule === "15" ? 15 : 21;

    let winner = null;
    let statusVal = status || "in_progress";

    if (validated.score_a >= target && validated.score_a - validated.score_b >= 2) {
      winner = "a";
      statusVal = "finished";
    } else if (validated.score_b >= target && validated.score_b - validated.score_a >= 2) {
      winner = "b";
      statusVal = "finished";
    }

    const { data, error } = await supabase
      .from("matches")
      .update({
        score_a: validated.score_a,
        score_b: validated.score_b,
        status: statusVal,
        winner,
      })
      .eq("id", matchId)
      .select()
      .single();

    if (error) throw new AppError(error.message, "UPDATE_MATCH_ERROR", 500);

    return data;
  } catch (error) {
    if (error instanceof AppError || error instanceof ValidationError) throw error;
    logger.error("updateMatchScore error", { error });
    throw new AppError(parseErrorMessage(error), "UPDATE_MATCH_ERROR", 500);
  }
}

export async function resetMatch(code: string, matchId: string) {
  logger.debug("resetMatch", { code, matchId });
  
  try {
    const { data, error } = await supabase
      .from("matches")
      .update({
        score_a: 0,
        score_b: 0,
        status: "pending",
        winner: null,
      })
      .eq("id", matchId)
      .select()
      .single();

    if (error) throw new AppError(error.message, "RESET_MATCH_ERROR", 500);

    return data;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("resetMatch error", { error });
    throw new AppError(parseErrorMessage(error), "RESET_MATCH_ERROR", 500);
  }
}

// Realtime subscriptions
export function subscribeToSession(code: string, callback: (payload: unknown) => void) {
  const channel = supabase
    .channel(`session-${code}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "sessions",
        filter: `code=eq.${code}`,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToPlayers(code: string, callback: (payload: unknown) => void) {
  const channel = supabase
    .channel(`players-${code}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "players",
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToMatches(code: string, callback: (payload: unknown) => void) {
  const channel = supabase
    .channel(`matches-${code}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "matches",
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
