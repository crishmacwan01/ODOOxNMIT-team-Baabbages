import { createClient } from '@supabase/supabase-js'

// Use environment variables or fallback to demo values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key'

// Check if we have valid Supabase credentials
const hasValidConfig = supabaseUrl !== 'https://demo.supabase.co' && 
                      supabaseAnonKey !== 'demo-key' && 
                      supabaseUrl.includes('supabase.co') &&
                      supabaseAnonKey.length > 20

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Export configuration status for components to use
export const isSupabaseConfigured = hasValidConfig

// Database types
export interface Profile {
  id: string
  email: string
  full_name: string
  role: 'team' | 'manager'
  avatar_url?: string
  department?: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  title: string
  description: string
  status: 'planning' | 'active' | 'review' | 'completed' | 'on_hold'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  manager_id: string
  team_members: string[]
  progress: number
  start_date: string
  due_date?: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  project_id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to: string
  created_by: string
  due_date?: string
  estimated_hours?: number
  actual_hours?: number
  created_at: string
  updated_at: string
}

export interface TeamMessage {
  id: string
  project_id?: string
  sender_id: string
  content: string
  message_type: 'text' | 'file' | 'system'
  reply_to?: string
  created_at: string
}

export interface ActivityLog {
  id: string
  user_id: string
  action: string
  entity_type: 'project' | 'task' | 'message' | 'team'
  entity_id: string
  details: Record<string, any>
  created_at: string
}