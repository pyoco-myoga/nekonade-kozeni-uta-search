import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

export const supabase = createClient<Database>(
  'https://tmcyzmiotxguxohbwuga.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtY3l6bWlvdHhndXhvaGJ3dWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2MTAwNDIsImV4cCI6MjA1ODE4NjA0Mn0.IhxYSptxUK99uc9WTKt4w_kyIpBOrSOYqsZmJHV2UsQ'
);
