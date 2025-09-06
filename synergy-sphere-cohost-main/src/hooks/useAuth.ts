import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, Profile, isSupabaseConfigured } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export interface AuthUser extends User {
  profile?: Profile
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // If Supabase is not configured, use demo mode
    if (!isSupabaseConfigured) {
      // Create a demo user for testing
      const demoUser: AuthUser = {
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
      
      setUser(demoUser)
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchUserProfile(session.user)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        if (session?.user) {
          await fetchUserProfile(session.user)
        } else {
          setUser(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (authUser: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      setUser({ ...authUser, profile })
    } catch (error) {
      console.error('Error fetching profile:', error)
      setUser(authUser)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName: string, role: 'team' | 'manager') => {
    try {
      setLoading(true)
      
      // Demo mode - simulate successful signup
      if (!isSupabaseConfigured) {
        const demoUser: AuthUser = {
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
        
        setUser(demoUser)
        setLoading(false)
        toast({
          title: "Demo Account Created!",
          description: "You're now logged in with demo data. Configure Supabase for real authentication.",
        })
        return { data: { user: demoUser }, error: null }
      }

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
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        })
      }

      return { data, error: null }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      // Demo mode - simulate successful signin
      if (!isSupabaseConfigured) {
        const demoUser: AuthUser = {
          id: 'demo-user-id',
          email: email,
          profile: {
            id: 'demo-user-id',
            email: email,
            full_name: email.includes('manager') ? 'Demo Manager' : 'Demo Team Member',
            role: email.includes('manager') ? 'manager' : 'team',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        } as AuthUser
        
        setUser(demoUser)
        setLoading(false)
        toast({
          title: "Demo Mode Active!",
          description: "You're now logged in with demo data. Configure Supabase for real authentication.",
        })
        return { data: { user: demoUser }, error: null }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      toast({
        title: "Welcome back!",
        description: "Successfully signed in.",
      })

      return { data, error: null }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      // Demo mode - just clear user
      if (!isSupabaseConfigured) {
        setUser(null)
        toast({
          title: "Signed out",
          description: "You have been successfully signed out.",
        })
        return
      }

      const { error } = await supabase.auth.signOut()
      if (error) throw error

      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) throw new Error('No user logged in')

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      await fetchUserProfile(user)

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    }
  }

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isManager: user?.profile?.role === 'manager',
    isTeam: user?.profile?.role === 'team'
  }
}