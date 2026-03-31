import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pkiucgfewahmthlulpqt.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBraXVjZ2Zld2FobXRobHVscHF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNjc3MDMsImV4cCI6MjA4ODc0MzcwM30.vbms5eYN1kiL7VFKig3OSCaf8oodgEsaFRiTvF3BsZY";

export const supabase = createClient(supabaseUrl, supabaseKey);
