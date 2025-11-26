/*
  # Create wallet checks table

  1. New Tables
    - `wallet_checks`
      - `id` (uuid, primary key) - Unique identifier for each check
      - `wallet_address` (text, unique) - Solana wallet address (44 characters)
      - `status` (text) - Either "Nice" or "Naughty"
      - `message` (text) - The message displayed to user
      - `gift` (text) - The gift assigned to the wallet
      - `age` (integer) - User's age when they checked
      - `survey_q1` (text) - Answer to survey question 1
      - `survey_q2` (text) - Answer to survey question 2
      - `created_at` (timestamptz) - When the check was first performed
      - `last_checked_at` (timestamptz) - When the check was last accessed
      - `check_count` (integer) - Number of times this address was checked

  2. Security
    - Enable RLS on `wallet_checks` table
    - Add policy for public read access (anyone can view results)
    - Add policy for public insert access (anyone can create new checks)
    - Add policy for public update access (anyone can update check count)

  3. Indexes
    - Add unique index on wallet_address for fast lookups
*/

CREATE TABLE IF NOT EXISTS wallet_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  status text NOT NULL,
  message text NOT NULL,
  gift text NOT NULL,
  age integer DEFAULT 0,
  survey_q1 text DEFAULT '',
  survey_q2 text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  last_checked_at timestamptz DEFAULT now(),
  check_count integer DEFAULT 1
);

ALTER TABLE wallet_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view wallet checks"
  ON wallet_checks
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert wallet checks"
  ON wallet_checks
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update wallet checks"
  ON wallet_checks
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_wallet_address ON wallet_checks(wallet_address);