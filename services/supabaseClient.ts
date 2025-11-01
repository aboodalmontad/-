import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://izoleoyxztoroznaowzx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6b2xlb3l4enRvcm96bmFvd3p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjA3MjIsImV4cCI6MjA3NzQ5NjcyMn0.oKjeHTP1dVTYbSjp8B4merQ2TGjBfrp3z6Te1Icxu2I';

export const supabase = createClient(supabaseUrl, supabaseKey);
