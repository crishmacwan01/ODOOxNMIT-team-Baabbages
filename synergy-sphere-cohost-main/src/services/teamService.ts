import { apiService } from './apiService'
import { Profile } from '@/lib/supabase'

export interface TeamMember extends Profile {
  status: 'active' | 'pending' | 'inactive'
  joined_at: string
  last_active: string
}

export interface TeamInvitation {
  id: string
  email: string
  role: 'team' | 'manager'
  invited_by: string
  project_id?: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  expires_at: string
  created_at: string
}

export interface TeamStats {
  totalMembers: number
  activeMembers: number
  pendingInvitations: number
  managers: number
  teamMembers: number
}

class TeamService {
  private static instance: TeamService

  static getInstance(): TeamService {
    if (!TeamService.instance) {
      TeamService.instance = new TeamService()
    }
    return TeamService.instance
  }

  // Get all team members
  async getTeamMembers(): Promise<{ data: TeamMember[] | null; error: string | null; success: boolean }> {
    try {
      const response = await apiService.getAllProfiles()
      
      if (!response.success || !response.data) {
        return { data: null, error: response.error, success: false }
      }

      // Transform profiles to team members
      const teamMembers: TeamMember[] = response.data.map(profile => ({
        ...profile,
        status: 'active' as const,
        joined_at: profile.created_at,
        last_active: profile.updated_at
      }))

      return { data: teamMembers, error: null, success: true }
    } catch (error: any) {
      return { data: null, error: error.message, success: false }
    }
  }

  // Get team statistics
  async getTeamStats(): Promise<{ data: TeamStats | null; error: string | null; success: boolean }> {
    try {
      const membersResponse = await this.getTeamMembers()
      
      if (!membersResponse.success || !membersResponse.data) {
        return { data: null, error: membersResponse.error, success: false }
      }

      const members = membersResponse.data
      const stats: TeamStats = {
        totalMembers: members.length,
        activeMembers: members.filter(m => m.status === 'active').length,
        pendingInvitations: 0, // This would come from invitations table
        managers: members.filter(m => m.role === 'manager').length,
        teamMembers: members.filter(m => m.role === 'team').length
      }

      return { data: stats, error: null, success: true }
    } catch (error: any) {
      return { data: null, error: error.message, success: false }
    }
  }

  // Create team invitation
  async createInvitation(email: string, role: 'team' | 'manager', projectId?: string): Promise<{ data: TeamInvitation | null; error: string | null; success: boolean }> {
    try {
      // In a real implementation, this would create an invitation in the database
      // For now, we'll simulate the invitation creation
      const invitation: TeamInvitation = {
        id: `invitation-${Date.now()}`,
        email,
        role,
        invited_by: 'current-user-id', // This would be the current user's ID
        project_id: projectId,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        created_at: new Date().toISOString()
      }

      // In a real app, you would send an email here
      console.log('Invitation created:', invitation)

      return { data: invitation, error: null, success: true }
    } catch (error: any) {
      return { data: null, error: error.message, success: false }
    }
  }

  // Get pending invitations
  async getPendingInvitations(): Promise<{ data: TeamInvitation[] | null; error: string | null; success: boolean }> {
    try {
      // In a real implementation, this would fetch from the invitations table
      const invitations: TeamInvitation[] = [
        {
          id: 'invitation-1',
          email: 'newuser@example.com',
          role: 'team',
          invited_by: 'current-user-id',
          status: 'pending',
          expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]

      return { data: invitations, error: null, success: true }
    } catch (error: any) {
      return { data: null, error: error.message, success: false }
    }
  }

  // Cancel invitation
  async cancelInvitation(invitationId: string): Promise<{ data: boolean | null; error: string | null; success: boolean }> {
    try {
      // In a real implementation, this would update the invitation status
      console.log('Invitation cancelled:', invitationId)
      return { data: true, error: null, success: true }
    } catch (error: any) {
      return { data: null, error: error.message, success: false }
    }
  }

  // Update team member role
  async updateMemberRole(memberId: string, newRole: 'team' | 'manager'): Promise<{ data: TeamMember | null; error: string | null; success: boolean }> {
    try {
      const response = await apiService.updateProfile(memberId, { role: newRole })
      
      if (!response.success || !response.data) {
        return { data: null, error: response.error, success: false }
      }

      const teamMember: TeamMember = {
        ...response.data,
        status: 'active',
        joined_at: response.data.created_at,
        last_active: response.data.updated_at
      }

      return { data: teamMember, error: null, success: true }
    } catch (error: any) {
      return { data: null, error: error.message, success: false }
    }
  }

  // Remove team member
  async removeMember(memberId: string): Promise<{ data: boolean | null; error: string | null; success: boolean }> {
    try {
      // In a real implementation, this would deactivate the user or remove them from projects
      console.log('Member removed:', memberId)
      return { data: true, error: null, success: true }
    } catch (error: any) {
      return { data: null, error: error.message, success: false }
    }
  }

  // Search team members
  async searchMembers(query: string): Promise<{ data: TeamMember[] | null; error: string | null; success: boolean }> {
    try {
      const response = await this.getTeamMembers()
      
      if (!response.success || !response.data) {
        return { data: null, error: response.error, success: false }
      }

      const filteredMembers = response.data.filter(member =>
        member.full_name.toLowerCase().includes(query.toLowerCase()) ||
        member.email.toLowerCase().includes(query.toLowerCase()) ||
        member.department?.toLowerCase().includes(query.toLowerCase())
      )

      return { data: filteredMembers, error: null, success: true }
    } catch (error: any) {
      return { data: null, error: error.message, success: false }
    }
  }
}

export const teamService = TeamService.getInstance()
