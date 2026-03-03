import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mkddtyfhuxxxoxnwvbrt.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rZGR0eWZodXh4eG94bnd2YnJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MTEwMDAsImV4cCI6MjA4NzA4NzAwMH0.bWuxpD-WrYcCVw5kck23Em2Tbc0QuIjbBSQvJZ5Z4Pk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
