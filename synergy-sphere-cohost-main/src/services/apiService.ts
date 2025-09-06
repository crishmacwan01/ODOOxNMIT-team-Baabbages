import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Project, Task, Profile, TeamMessage, ActivityLog } from '@/lib/supabase'

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface FilterParams {
  status?: string
  priority?: string
  assigned_to?: string
  project_id?: string
  search?: string
}

class ApiService {
  private static instance: ApiService
  private baseTimeout = 10000

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService()
    }
    return ApiService.instance
  }

  private async makeRequest<T>(
    operation: () => Promise<{ data: T | null; error: any }>,
    fallbackData?: T
  ): Promise<ApiResponse<T>> {
    try {
      if (!isSupabaseConfigured && fallbackData) {
        return {
          data: fallbackData,
          error: null,
          success: true
        }
      }

      const { data, error } = await operation()
      
      if (error) {
        console.error('API Error:', error)
        return {
          data: null,
          error: error.message || 'An error occurred',
          success: false
        }
      }

      return {
        data,
        error: null,
        success: true
      }
    } catch (error: any) {
      console.error('API Request Failed:', error)
      return {
        data: null,
        error: error.message || 'Request failed',
        success: false
      }
    }
  }

  // Profile Operations
  async getProfile(userId: string): Promise<ApiResponse<Profile>> {
    return this.makeRequest(
      () => supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single(),
      {
        id: userId,
        email: 'demo@synergysphere.com',
        full_name: 'Demo User',
        role: 'manager',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Profile
    )
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<ApiResponse<Profile>> {
    return this.makeRequest(
      () => supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()
    )
  }

  async getAllProfiles(): Promise<ApiResponse<Profile[]>> {
    return this.makeRequest(
      () => supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false }),
      [
        {
          id: 'demo-user-1',
          email: 'manager@demo.com',
          full_name: 'Demo Manager',
          role: 'manager',
          department: 'Engineering',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'demo-user-2',
          email: 'team@demo.com',
          full_name: 'Demo Team Member',
          role: 'team',
          department: 'Engineering',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ] as Profile[]
    )
  }

  // Project Operations
  async getProjects(userId: string, isManager: boolean = false): Promise<ApiResponse<Project[]>> {
    return this.makeRequest(
      () => {
        let query = supabase.from('projects').select('*')
        
        if (!isManager) {
          query = query.contains('team_members', [userId])
        }
        
        return query.order('created_at', { ascending: false })
      },
      [
        {
          id: 'demo-project-1',
          title: 'Website Redesign',
          description: 'Complete redesign of the company website with modern UI/UX',
          status: 'active',
          priority: 'high',
          manager_id: userId,
          team_members: [userId],
          progress: 65,
          start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        }
      ] as Project[]
    )
  }

  async getProject(projectId: string): Promise<ApiResponse<Project>> {
    return this.makeRequest(
      () => supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()
    )
  }

  async createProject(projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Project>> {
    return this.makeRequest(
      () => supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single()
    )
  }

  async updateProject(projectId: string, updates: Partial<Project>): Promise<ApiResponse<Project>> {
    return this.makeRequest(
      () => supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .select()
        .single()
    )
  }

  async deleteProject(projectId: string): Promise<ApiResponse<boolean>> {
    return this.makeRequest(
      () => supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .then(() => ({ data: true, error: null })),
      true
    )
  }

  // Task Operations
  async getTasks(filters: FilterParams = {}): Promise<ApiResponse<Task[]>> {
    return this.makeRequest(
      () => {
        let query = supabase.from('tasks').select('*')
        
        if (filters.project_id) {
          query = query.eq('project_id', filters.project_id)
        }
        if (filters.assigned_to) {
          query = query.eq('assigned_to', filters.assigned_to)
        }
        if (filters.status) {
          query = query.eq('status', filters.status)
        }
        if (filters.priority) {
          query = query.eq('priority', filters.priority)
        }
        
        return query.order('created_at', { ascending: false })
      },
      [
        {
          id: 'demo-task-1',
          project_id: 'demo-project-1',
          title: 'Design new homepage layout',
          description: 'Create wireframes and mockups for the new homepage design',
          status: 'in_progress',
          priority: 'high',
          assigned_to: 'demo-user-2',
          created_by: 'demo-user-1',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          estimated_hours: 16,
          actual_hours: 8,
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        }
      ] as Task[]
    )
  }

  async getTask(taskId: string): Promise<ApiResponse<Task>> {
    return this.makeRequest(
      () => supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single()
    )
  }

  async createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Task>> {
    return this.makeRequest(
      () => supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single()
    )
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<ApiResponse<Task>> {
    return this.makeRequest(
      () => supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single()
    )
  }

  async deleteTask(taskId: string): Promise<ApiResponse<boolean>> {
    return this.makeRequest(
      () => supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .then(() => ({ data: true, error: null })),
      true
    )
  }

  // Team Messages Operations
  async getMessages(projectId?: string): Promise<ApiResponse<TeamMessage[]>> {
    return this.makeRequest(
      () => {
        let query = supabase.from('team_messages').select('*')
        
        if (projectId) {
          query = query.eq('project_id', projectId)
        }
        
        return query.order('created_at', { ascending: false })
      },
      [
        {
          id: 'demo-message-1',
          project_id: 'demo-project-1',
          sender_id: 'demo-user-1',
          content: 'Welcome to the project! Let\'s make this great.',
          message_type: 'text',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ] as TeamMessage[]
    )
  }

  async createMessage(messageData: Omit<TeamMessage, 'id' | 'created_at'>): Promise<ApiResponse<TeamMessage>> {
    return this.makeRequest(
      () => supabase
        .from('team_messages')
        .insert([messageData])
        .select()
        .single()
    )
  }

  // Activity Logs Operations
  async getActivityLogs(userId: string): Promise<ApiResponse<ActivityLog[]>> {
    return this.makeRequest(
      () => supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50),
      [
        {
          id: 'demo-activity-1',
          user_id: userId,
          action: 'created_project',
          entity_type: 'project',
          entity_id: 'demo-project-1',
          details: { project_name: 'Website Redesign' },
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ] as ActivityLog[]
    )
  }

  async logActivity(activityData: Omit<ActivityLog, 'id' | 'created_at'>): Promise<ApiResponse<ActivityLog>> {
    return this.makeRequest(
      () => supabase
        .from('activity_logs')
        .insert([activityData])
        .select()
        .single()
    )
  }

  // Real-time subscriptions
  subscribeToProjects(userId: string, callback: (payload: any) => void) {
    if (!isSupabaseConfigured) return { unsubscribe: () => {} }
    
    return supabase
      .channel('projects')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'projects',
          filter: `manager_id=eq.${userId}`
        }, 
        callback
      )
      .subscribe()
  }

  subscribeToTasks(userId: string, callback: (payload: any) => void) {
    if (!isSupabaseConfigured) return { unsubscribe: () => {} }
    
    return supabase
      .channel('tasks')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tasks',
          filter: `assigned_to=eq.${userId}`
        }, 
        callback
      )
      .subscribe()
  }

  subscribeToMessages(projectId: string, callback: (payload: any) => void) {
    if (!isSupabaseConfigured) return { unsubscribe: () => {} }
    
    return supabase
      .channel('messages')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'team_messages',
          filter: `project_id=eq.${projectId}`
        }, 
        callback
      )
      .subscribe()
  }
}

export const apiService = ApiService.getInstance()
