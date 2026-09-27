-- Badminton Kuy Database Schema for Supabase
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Hosts table (replaces MongoDB hosts collection)
CREATE TABLE IF NOT EXISTS hosts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Sessions table (replaces MongoDB sessions collection)
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    location TEXT NOT NULL,
    num_courts INTEGER DEFAULT 1 CHECK (num_courts >= 1 AND num_courts <= 12),
    scoring_rule TEXT DEFAULT '21' CHECK (scoring_rule IN ('15', '21')),
    rounds_per_player INTEGER DEFAULT 4 CHECK (rounds_per_player >= 1 AND rounds_per_player <= 30),
    non_member_fee DECIMAL DEFAULT 0 CHECK (non_member_fee >= 0),
    shuttle_price DECIMAL DEFAULT 0 CHECK (shuttle_price >= 0),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'finished')),
    host_id UUID REFERENCES hosts(id),
    host_name TEXT,
    matches_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Players table (replaces MongoDB players collection)
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_member BOOLEAN DEFAULT TRUE,
    fee DECIMAL DEFAULT 0,
    shuttlecocks INTEGER DEFAULT 0,
    paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches table (replaces MongoDB matches collection)
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    court INTEGER,
    round INTEGER,
    "order" INTEGER,
    team_a UUID[],
    team_b UUID[],
    team_a_names TEXT[],
    team_b_names TEXT[],
    score_a INTEGER DEFAULT 0,
    score_b INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'finished')),
    winner TEXT CHECK (winner IN ('a', 'b', NULL)),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sessions_code ON sessions(code);
CREATE INDEX IF NOT EXISTS idx_sessions_host_id ON sessions(host_id);
CREATE INDEX IF NOT EXISTS idx_players_session_id ON players(session_id);
CREATE INDEX IF NOT EXISTS idx_matches_session_id ON matches(session_id);

-- Row Level Security (RLS)
ALTER TABLE hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hosts
CREATE POLICY "Hosts can view own data" ON hosts
    FOR SELECT USING (true);

CREATE POLICY "Hosts can insert own data" ON hosts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Hosts can update own data" ON hosts
    FOR UPDATE USING (true);

-- RLS Policies for sessions
CREATE POLICY "Anyone can view active sessions" ON sessions
    FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Authenticated users can create sessions" ON sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Hosts can update own sessions" ON sessions
    FOR UPDATE USING (true);

CREATE POLICY "Hosts can delete own sessions" ON sessions
    FOR DELETE USING (true);

-- RLS Policies for players
CREATE POLICY "Anyone can view players" ON players
    FOR SELECT USING (true);

CREATE POLICY "Anyone can join sessions" ON players
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Hosts can update players" ON players
    FOR UPDATE USING (true);

CREATE POLICY "Hosts can remove players" ON players
    FOR DELETE USING (true);

-- RLS Policies for matches
CREATE POLICY "Anyone can view matches" ON matches
    FOR SELECT USING (true);

CREATE POLICY "Hosts can manage matches" ON matches
    FOR ALL USING (true);

-- Realtime subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
