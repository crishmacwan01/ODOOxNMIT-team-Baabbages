-- SynergySphere Database Setup
-- Run this script in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('team', 'manager')) DEFAULT 'team',
  avatar_url TEXT,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('planning', 'active', 'review', 'completed', 'on_hold')) DEFAULT 'planning',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  manager_id UUID REFERENCES profiles(id) NOT NULL,
  team_members UUID[] DEFAULT '{}',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('todo', 'in_progress', 'review', 'done')) DEFAULT 'todo',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  assigned_to UUID REFERENCES profiles(id) NOT NULL,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  estimated_hours INTEGER,
  actual_hours INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_messages table
CREATE TABLE IF NOT EXISTS team_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'file', 'system')) DEFAULT 'text',
  reply_to UUID REFERENCES team_messages(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT CHECK (entity_type IN ('project', 'task', 'message', 'team')) NOT NULL,
  entity_id UUID NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('info', 'warning', 'error', 'success')) DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Managers can view all projects" ON projects;
DROP POLICY IF EXISTS "Managers can create projects" ON projects;
DROP POLICY IF EXISTS "Managers can update projects" ON projects;
DROP POLICY IF EXISTS "Managers can delete projects" ON projects;
DROP POLICY IF EXISTS "Users can view assigned tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update assigned tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view project messages" ON team_messages;
DROP POLICY IF EXISTS "Users can create messages" ON team_messages;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for projects
CREATE POLICY "Managers can view all projects" ON projects FOR SELECT USING (
  manager_id = auth.uid() OR auth.uid() = ANY(team_members)
);
CREATE POLICY "Managers can create projects" ON projects FOR INSERT WITH CHECK (manager_id = auth.uid());
CREATE POLICY "Managers can update projects" ON projects FOR UPDATE USING (manager_id = auth.uid());
CREATE POLICY "Managers can delete projects" ON projects FOR DELETE USING (manager_id = auth.uid());

-- Create RLS policies for tasks
CREATE POLICY "Users can view assigned tasks" ON tasks FOR SELECT USING (
  assigned_to = auth.uid() OR created_by = auth.uid()
);
CREATE POLICY "Users can create tasks" ON tasks FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update assigned tasks" ON tasks FOR UPDATE USING (assigned_to = auth.uid());
CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (created_by = auth.uid());

-- Create RLS policies for team_messages
CREATE POLICY "Users can view project messages" ON team_messages FOR SELECT USING (
  sender_id = auth.uid() OR 
  auth.uid() IN (
    SELECT manager_id FROM projects WHERE id = team_messages.project_id
    UNION
    SELECT unnest(team_members) FROM projects WHERE id = team_messages.project_id
  )
);
CREATE POLICY "Users can create messages" ON team_messages FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  auth.uid() IN (
    SELECT manager_id FROM projects WHERE id = team_messages.project_id
    UNION
    SELECT unnest(team_members) FROM projects WHERE id = team_messages.project_id
  )
);

-- Create RLS policies for activity_logs
CREATE POLICY "Users can view own activity logs" ON activity_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create activity logs" ON activity_logs FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create RLS policies for notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'team')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some demo data
INSERT INTO profiles (id, email, full_name, role, department) VALUES
  ('00000000-0000-0000-0000-000000000001', 'manager@demo.com', 'Demo Manager', 'manager', 'Engineering'),
  ('00000000-0000-0000-0000-000000000002', 'team@demo.com', 'Demo Team Member', 'team', 'Engineering')
ON CONFLICT (id) DO NOTHING;

-- Insert demo projects
INSERT INTO projects (id, title, description, status, priority, manager_id, team_members, progress, start_date, due_date) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Website Redesign', 'Complete redesign of the company website with modern UI/UX', 'active', 'high', '00000000-0000-0000-0000-000000000001', ARRAY['00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'], 65, NOW() - INTERVAL '30 days', NOW() + INTERVAL '15 days'),
  ('10000000-0000-0000-0000-000000000002', 'Mobile App Development', 'Native mobile app for iOS and Android platforms', 'planning', 'medium', '00000000-0000-0000-0000-000000000001', ARRAY['00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'], 20, NOW(), NOW() + INTERVAL '60 days'),
  ('10000000-0000-0000-0000-000000000003', 'Database Migration', 'Migrate legacy database to new cloud infrastructure', 'review', 'urgent', '00000000-0000-0000-0000-000000000001', ARRAY['00000000-0000-0000-0000-000000000001'], 90, NOW() - INTERVAL '45 days', NOW() + INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- Insert demo tasks
INSERT INTO tasks (id, project_id, title, description, status, priority, assigned_to, created_by, due_date, estimated_hours, actual_hours) VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Design new homepage layout', 'Create wireframes and mockups for the new homepage design', 'in_progress', 'high', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', NOW() + INTERVAL '7 days', 16, 8),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Implement responsive design', 'Make the website responsive across all device sizes', 'todo', 'medium', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', NOW() + INTERVAL '14 days', 24, 0),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'Set up development environment', 'Configure React Native development environment', 'done', 'low', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '2 days', 8, 6),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', 'Backup current database', 'Create full backup of existing database before migration', 'todo', 'urgent', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', NOW() + INTERVAL '1 day', 4, 0),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'Optimize page load speed', 'Implement performance optimizations for faster loading', 'review', 'medium', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', NOW() + INTERVAL '10 days', 12, 10)
ON CONFLICT (id) DO NOTHING;

-- Insert demo notifications
INSERT INTO notifications (user_id, title, message, type) VALUES
  ('00000000-0000-0000-0000-000000000001', 'New Project Created', 'Website Redesign project has been created', 'info'),
  ('00000000-0000-0000-0000-000000000001', 'Task Assigned', 'You have been assigned to backup current database task', 'warning'),
  ('00000000-0000-0000-0000-000000000002', 'Task Due Soon', 'Design new homepage layout is due in 3 days', 'warning'),
  ('00000000-0000-0000-0000-000000000002', 'Project Update', 'Website Redesign progress updated to 65%', 'info')
ON CONFLICT DO NOTHING;
