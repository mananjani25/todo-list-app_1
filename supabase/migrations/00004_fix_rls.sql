-- FIX RLS ISSUES
-- Run this in the Supabase SQL Editor to ensure data isolation

-- 1. Ensure RLS is enabled
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts/duplicates
DROP POLICY IF EXISTS "Users can select their own todos" ON public.todos;
DROP POLICY IF EXISTS "Users can insert their own todos" ON public.todos;
DROP POLICY IF EXISTS "Users can update their own todos" ON public.todos;
DROP POLICY IF EXISTS "Users can delete their own todos" ON public.todos;
DROP POLICY IF EXISTS "Users can manage their own todos" ON public.todos;

-- 3. Re-create strict policies
CREATE POLICY "Users can manage their own todos"
ON public.todos
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Verify
-- You can run: SELECT * FROM pg_policies WHERE tablename = 'todos';
