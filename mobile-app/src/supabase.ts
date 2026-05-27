import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";

// In Expo, use EXPO_PUBLIC_ prefix for env variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
