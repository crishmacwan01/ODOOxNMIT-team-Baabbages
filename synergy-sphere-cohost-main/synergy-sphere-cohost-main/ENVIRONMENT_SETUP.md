# SynergySphere - Environment Setup

## Quick Start (Demo Mode)

The application is configured to work in demo mode out of the box. Simply run:

```bash
npm install
npm run dev
```

The app will automatically use demo data and you can test all features without setting up a backend.

## Full Backend Setup (Supabase)

To connect to a real Supabase backend:

1. **Create a Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the project to be ready

2. **Get Your Credentials:**
   - Go to Settings > API
   - Copy your Project URL and anon public key

3. **Create Environment File:**
   - Create a `.env` file in the root directory
   - Add your credentials:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Set Up Database Tables:**
   Run these SQL commands in your Supabase SQL editor:

   ```sql
   -- Create profiles table
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users(id) PRIMARY KEY,
     email TEXT UNIQUE NOT NULL,
     full_name TEXT,
     role TEXT CHECK (role IN ('team', 'manager')) DEFAULT 'team',
     avatar_url TEXT,
     department TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create projects table
   CREATE TABLE projects (
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
   CREATE TABLE tasks (
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
   CREATE TABLE team_messages (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
     sender_id UUID REFERENCES profiles(id) NOT NULL,
     content TEXT NOT NULL,
     message_type TEXT CHECK (message_type IN ('text', 'file', 'system')) DEFAULT 'text',
     reply_to UUID REFERENCES team_messages(id),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create activity_logs table
   CREATE TABLE activity_logs (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES profiles(id) NOT NULL,
     action TEXT NOT NULL,
     entity_type TEXT CHECK (entity_type IN ('project', 'task', 'message', 'team')) NOT NULL,
     entity_id UUID NOT NULL,
     details JSONB,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
   ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
   ALTER TABLE team_messages ENABLE ROW LEVEL SECURITY;
   ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

   -- Create RLS policies
   CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
   CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

   CREATE POLICY "Managers can view all projects" ON projects FOR SELECT USING (
     manager_id = auth.uid() OR auth.uid() = ANY(team_members)
   );
   CREATE POLICY "Managers can create projects" ON projects FOR INSERT WITH CHECK (manager_id = auth.uid());
   CREATE POLICY "Managers can update projects" ON projects FOR UPDATE USING (manager_id = auth.uid());
   CREATE POLICY "Managers can delete projects" ON projects FOR DELETE USING (manager_id = auth.uid());

   CREATE POLICY "Users can view assigned tasks" ON tasks FOR SELECT USING (
     assigned_to = auth.uid() OR created_by = auth.uid()
   );
   CREATE POLICY "Users can create tasks" ON tasks FOR INSERT WITH CHECK (created_by = auth.uid());
   CREATE POLICY "Users can update assigned tasks" ON tasks FOR UPDATE USING (assigned_to = auth.uid());
   CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (created_by = auth.uid());

   -- Create function to handle new user signup
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO public.profiles (id, email, full_name, role)
     VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'role');
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   -- Create trigger for new user signup
   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
   ```

5. **Restart the Application:**
   ```bash
   npm run dev
   ```

## Features

- **Authentication**: Sign up/Sign in with role-based access (Manager/Team)
- **Project Management**: Create, view, and manage projects
- **Task Management**: Assign and track tasks with priorities
- **Team Collaboration**: Real-time messaging and notifications
- **AI Insights**: Smart analytics and recommendations
- **Responsive Design**: Works on desktop and mobile

## Demo Accounts

When in demo mode, you can use these test accounts:
- Manager: `manager@demo.com` / `demo123`
- Team Member: `team@demo.com` / `demo123`

Or create new accounts through the signup form.
