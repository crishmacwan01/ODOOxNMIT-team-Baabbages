import { supabase, isSupabaseConfigured, Profile } from '@/lib/supabase'
import { User, Session } from '@supabase/supabase-js'

export interface AuthUser extends User {
  profile?: Profile
}

export class AuthService {
  private static instance: AuthService
  private currentUser: AuthUser | null = null
  private currentSession: Session | null = null

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    if (!isSupabaseConfigured) {
      return this.getDemoUser()
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      this.currentSession = session
      
      if (session?.user) {
        this.currentUser = await this.fetchUserProfile(session.user)
        return this.currentUser
      }
      
      return null
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  async signUp(email: string, password: string, fullName: string, role: 'team' | 'manager'): Promise<{ user: AuthUser | null; error: any }> {
    if (!isSupabaseConfigured) {
      const demoUser = this.createDemoUser(email, fullName, role)
      this.currentUser = demoUser
      return { user: demoUser, error: null }
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role
          }
        }
      })

      if (error) throw error

      if (data.user) {
        this.currentUser = await this.fetchUserProfile(data.user)
        return { user: this.currentUser, error: null }
      }

      return { user: null, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { user: null, error }
    }
  }

  async signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: any }> {
    if (!isSupabaseConfigured) {
      const demoUser = this.createDemoUser(email, email.includes('manager') ? 'Demo Manager' : 'Demo Team Member', email.includes('manager') ? 'manager' : 'team')
      this.currentUser = demoUser
      return { user: demoUser, error: null }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      if (data.user) {
        this.currentUser = await this.fetchUserProfile(data.user)
        this.currentSession = data.session
        return { user: this.currentUser, error: null }
      }

      return { user: null, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { user: null, error }
    }
  }

  async signOut(): Promise<{ error: any }> {
    if (!isSupabaseConfigured) {
      this.currentUser = null
      this.currentSession = null
      return { error: null }
    }

    try {
      const { error } = await supabase.auth.signOut()
      this.currentUser = null
      this.currentSession = null
      return { error }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error }
    }
  }

  async updateProfile(updates: Partial<Profile>): Promise<{ error: any }> {
    if (!isSupabaseConfigured) {
      if (this.currentUser?.profile) {
        this.currentUser.profile = { ...this.currentUser.profile, ...updates }
      }
      return { error: null }
    }

    try {
      if (!this.currentUser) throw new Error('No user logged in')

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', this.currentUser.id)

      if (error) throw error

      // Refresh user profile
      if (this.currentUser) {
        this.currentUser = await this.fetchUserProfile(this.currentUser)
      }

      return { error: null }
    } catch (error) {
      console.error('Update profile error:', error)
      return { error }
    }
  }

  private async fetchUserProfile(authUser: User): Promise<AuthUser> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return { ...authUser, profile } as AuthUser
    } catch (error) {
      console.error('Error fetching profile:', error)
      return authUser as AuthUser
    }
  }

  private getDemoUser(): AuthUser {
    return {
      id: 'demo-user-id',
      email: 'demo@synergysphere.com',
      profile: {
        id: 'demo-user-id',
        email: 'demo@synergysphere.com',
        full_name: 'Demo User',
        role: 'manager',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    } as AuthUser
  }

  private createDemoUser(email: string, fullName: string, role: 'team' | 'manager'): AuthUser {
    return {
      id: 'demo-user-id',
      email: email,
      profile: {
        id: 'demo-user-id',
        email: email,
        full_name: fullName,
        role: role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    } as AuthUser
  }

  // Listen for auth state changes
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    if (!isSupabaseConfigured) {
      // Demo mode - no real auth state changes
      return { data: { subscription: { unsubscribe: () => {} } } }
    }

    return supabase.auth.onAuthStateChange(callback)
  }

  get isConfigured(): boolean {
    return isSupabaseConfigured
  }

  get user(): AuthUser | null {
    return this.currentUser
  }

  get session(): Session | null {
    return this.currentSession
  }
}

export const authService = AuthService.getInstance()
