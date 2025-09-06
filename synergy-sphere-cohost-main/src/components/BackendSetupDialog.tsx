import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Database, 
  Copy, 
  CheckCircle, 
  ExternalLink, 
  Code, 
  Settings,
  Wifi,
  WifiOff
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface BackendSetupDialogProps {
  children: React.ReactNode
}

const BackendSetupDialog = ({ children }: BackendSetupDialogProps) => {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const { toast } = useToast()

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      setTimeout(() => setCopied(null), 2000)
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy to clipboard",
      })
    }
  }

  const sqlScript = `-- SynergySphere Database Setup
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

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

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

CREATE POLICY "Users can view own activity logs" ON activity_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create activity logs" ON activity_logs FOR INSERT WITH CHECK (user_id = auth.uid());

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
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();`

  const envExample = `# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Enable debug mode
VITE_DEBUG=true

# Optional: API timeout (in milliseconds)
VITE_API_TIMEOUT=10000`

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Backend Setup Guide
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="supabase">Supabase</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="env">Environment</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <WifiOff className="w-8 h-8 text-warning" />
                  <div>
                    <h3 className="font-semibold">Current Status</h3>
                    <p className="text-sm text-muted-foreground">Demo Mode</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your app is currently running in demo mode with mock data. 
                  To enable full functionality, connect to a Supabase backend.
                </p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Wifi className="w-8 h-8 text-success" />
                  <div>
                    <h3 className="font-semibold">After Setup</h3>
                    <p className="text-sm text-muted-foreground">Live Backend</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Real-time data sync, persistent storage, user authentication, 
                  and all advanced features will be available.
                </p>
              </Card>
            </div>

            <Card className="p-4">
              <h3 className="font-semibold mb-3">Setup Steps</h3>
              <ol className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
                  <span>Create a Supabase project at supabase.com</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
                  <span>Get your Project URL and API key from Settings → API</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
                  <span>Run the database setup script in SQL Editor</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">4</span>
                  <span>Create .env file with your credentials</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">5</span>
                  <span>Restart the application</span>
                </li>
              </ol>
            </Card>
          </TabsContent>

          <TabsContent value="supabase" className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-3">1. Create Supabase Project</h3>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">supabase.com</a> and create a new project.
                </p>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Supabase
                    </a>
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3">2. Get Your Credentials</h3>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  In your Supabase dashboard, go to Settings → API to find:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    Project URL
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    Anon public key
                  </li>
                </ul>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Database Setup Script</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Copy and run this script in your Supabase SQL Editor:
              </p>
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                  <code>{sqlScript}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(sqlScript, 'SQL Script')}
                >
                  {copied === 'SQL Script' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="env" className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Environment Configuration</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Create a <code className="bg-muted px-1 rounded">.env</code> file in your project root:
              </p>
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                  <code>{envExample}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(envExample, 'Environment File')}
                >
                  {copied === 'Environment File' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3">Quick Setup Command</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Or use our automated setup script:
              </p>
              <div className="flex items-center space-x-2">
                <code className="bg-muted px-2 py-1 rounded text-sm">npm run setup-backend</code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard('npm run setup-backend', 'Setup Command')}
                >
                  {copied === 'Setup Command' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button onClick={() => setOpen(false)}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default BackendSetupDialog

