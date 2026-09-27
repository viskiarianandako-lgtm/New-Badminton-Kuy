/**
 * Input validation utilities
 * 
 * Provides validation for user inputs to prevent invalid data.
 */

import { ValidationError, validateEmail, validateSessionCode, sanitizeString } from "./errors";

/**
 * Validate session creation input
 */
export function validateSessionInput(data: {
  name?: string;
  date?: string;
  location?: string;
  num_courts?: number;
  scoring_rule?: string;
  rounds_per_player?: number;
  non_member_fee?: number;
  shuttle_price?: number;
}) {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length < 3) {
    errors.push("Nama sesi minimal 3 karakter");
  }

  if (!data.location || data.location.trim().length < 3) {
    errors.push("Lokasi minimal 3 karakter");
  }

  if (!data.date) {
    errors.push("Tanggal wajib diisi");
  }

  if (data.num_courts !== undefined && (data.num_courts < 1 || data.num_courts > 12)) {
    errors.push("Jumlah lapangan harus antara 1-12");
  }

  if (data.scoring_rule !== undefined && !["15", "21"].includes(data.scoring_rule)) {
    errors.push("Aturan skor harus 15 atau 21");
  }

  if (data.rounds_per_player !== undefined && (data.rounds_per_player < 1 || data.rounds_per_player > 30)) {
    errors.push("Ronde per pemain harus antara 1-30");
  }

  if (data.non_member_fee !== undefined && data.non_member_fee < 0) {
    errors.push("Biaya non-member tidak boleh negatif");
  }

  if (data.shuttle_price !== undefined && data.shuttle_price < 0) {
    errors.push("Harga kok tidak boleh negatif");
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(", "));
  }

  return {
    name: sanitizeString(data.name!),
    date: data.date,
    location: sanitizeString(data.location!),
    num_courts: data.num_courts || 1,
    scoring_rule: data.scoring_rule || "21",
    rounds_per_player: data.rounds_per_player || 4,
    non_member_fee: data.non_member_fee || 0,
    shuttle_price: data.shuttle_price || 0,
  };
}

/**
 * Validate player join input
 */
export function validateJoinInput(data: {
  name?: string;
  is_member?: boolean;
}) {
  if (!data.name || data.name.trim().length < 2) {
    throw new ValidationError("Nama pemain minimal 2 karakter");
  }

  return {
    name: sanitizeString(data.name),
    is_member: data.is_member ?? true,
  };
}

/**
 * Validate score input
 */
export function validateScoreInput(data: {
  score_a?: number;
  score_b?: number;
}) {
  if (data.score_a !== undefined && (data.score_a < 0 || data.score_a > 999)) {
    throw new ValidationError("Skor A tidak valid");
  }

  if (data.score_b !== undefined && (data.score_b < 0 || data.score_b > 999)) {
    throw new ValidationError("Skor B tidak valid");
  }

  return {
    score_a: data.score_a ?? 0,
    score_b: data.score_b ?? 0,
  };
}

/**
 * Validate user registration input
 */
export function validateRegisterInput(data: {
  name?: string;
  email?: string;
  password?: string;
}): { name: string; email: string; password: string } {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push("Nama minimal 2 karakter");
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.push("Email tidak valid");
  }

  if (!data.password || data.password.length < 6) {
    errors.push("Kata sandi minimal 6 karakter");
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(", "));
  }

  return {
    name: sanitizeString(data.name!),
    email: data.email!.toLowerCase().trim(),
    password: data.password!,
  };
}

/**
 * Validate user login input
 */
export function validateLoginInput(data: {
  email?: string;
  password?: string;
}) {
  if (!data.email || !validateEmail(data.email)) {
    throw new ValidationError("Email tidak valid");
  }

  if (!data.password) {
    throw new ValidationError("Kata sandi wajib diisi");
  }

  return {
    email: data.email.toLowerCase().trim(),
    password: data.password,
  };
}
