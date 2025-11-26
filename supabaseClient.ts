import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface WalletCheck {
  id?: string;
  wallet_address: string;
  status: 'Nice' | 'Naughty';
  message: string;
  gift: string;
  age?: number;
  survey_q1?: string;
  survey_q2?: string;
  created_at?: string;
  last_checked_at?: string;
  check_count?: number;
}
