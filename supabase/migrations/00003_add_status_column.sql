-- Add status column to todos table for Kanban board support
-- Possible values: 'todo', 'in_progress', 'completed'

ALTER TABLE public.todos
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'todo'
CHECK (status IN ('todo', 'in_progress', 'completed'));

-- Migrate existing data: sync status with is_completed
UPDATE public.todos SET status = 'completed' WHERE is_completed = true;
UPDATE public.todos SET status = 'todo' WHERE is_completed = false;
