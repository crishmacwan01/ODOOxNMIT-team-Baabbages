import { useState, useEffect } from 'react'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { teamService, TeamMember, TeamInvitation, TeamStats } from '@/services/teamService'
import { useAuthContext } from '@/components/Auth/AuthProvider'

export const useTeam = () => {
  const { user, isManager } = useAuthContext()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [invitations, setInvitations] = useState<TeamInvitation[]>([])
  const [stats, setStats] = useState<TeamStats | null>(null)

  // Fetch team members
  const { data: fetchedMembers, loading: membersLoading, error: membersError, refetch: refetchMembers } = useApi(
    () => teamService.getTeamMembers(),
    [],
    true
  )

  // Fetch team stats
  const { data: fetchedStats, loading: statsLoading, error: statsError, refetch: refetchStats } = useApi(
    () => teamService.getTeamStats(),
    [],
    true
  )

  // Fetch pending invitations
  const { data: fetchedInvitations, loading: invitationsLoading, error: invitationsError, refetch: refetchInvitations } = useApi(
    () => teamService.getPendingInvitations(),
    [],
    isManager // Only managers can see invitations
  )

  // Update local state when data changes
  useEffect(() => {
    if (fetchedMembers) {
      setMembers(fetchedMembers)
    }
  }, [fetchedMembers])

  useEffect(() => {
    if (fetchedStats) {
      setStats(fetchedStats)
    }
  }, [fetchedStats])

  useEffect(() => {
    if (fetchedInvitations) {
      setInvitations(fetchedInvitations)
    }
  }, [fetchedInvitations])

  // Create invitation mutation
  const createInvitationMutation = useApiMutation(
    ({ email, role, projectId }: { email: string; role: 'team' | 'manager'; projectId?: string }) => 
      teamService.createInvitation(email, role, projectId),
    (newInvitation) => {
      setInvitations(prev => [newInvitation, ...prev])
    }
  )

  // Cancel invitation mutation
  const cancelInvitationMutation = useApiMutation(
    (invitationId: string) => teamService.cancelInvitation(invitationId),
    (_, invitationId) => {
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId))
    }
  )

  // Update member role mutation
  const updateMemberRoleMutation = useApiMutation(
    ({ memberId, newRole }: { memberId: string; newRole: 'team' | 'manager' }) => 
      teamService.updateMemberRole(memberId, newRole),
    (updatedMember) => {
      setMembers(prev => prev.map(member => 
        member.id === updatedMember.id ? updatedMember : member
      ))
    }
  )

  // Remove member mutation
  const removeMemberMutation = useApiMutation(
    (memberId: string) => teamService.removeMember(memberId),
    (_, memberId) => {
      setMembers(prev => prev.filter(member => member.id !== memberId))
    }
  )

  // Search members mutation
  const searchMembersMutation = useApiMutation(
    (query: string) => teamService.searchMembers(query),
    (searchResults) => {
      // This would typically be handled differently in a real app
      // For now, we'll just log the results
      console.log('Search results:', searchResults)
    }
  )

  // Public methods
  const createInvitation = async (email: string, role: 'team' | 'manager', projectId?: string) => {
    if (!isManager) {
      throw new Error('Only managers can create invitations')
    }
    return createInvitationMutation.mutate({ email, role, projectId })
  }

  const cancelInvitation = async (invitationId: string) => {
    if (!isManager) {
      throw new Error('Only managers can cancel invitations')
    }
    return cancelInvitationMutation.mutate(invitationId)
  }

  const updateMemberRole = async (memberId: string, newRole: 'team' | 'manager') => {
    if (!isManager) {
      throw new Error('Only managers can update member roles')
    }
    return updateMemberRoleMutation.mutate({ memberId, newRole })
  }

  const removeMember = async (memberId: string) => {
    if (!isManager) {
      throw new Error('Only managers can remove members')
    }
    return removeMemberMutation.mutate(memberId)
  }

  const searchMembers = async (query: string) => {
    return searchMembersMutation.mutate(query)
  }

  // Helper functions
  const getMembersByRole = (role: 'team' | 'manager') => {
    return members.filter(member => member.role === role)
  }

  const getActiveMembers = () => {
    return members.filter(member => member.status === 'active')
  }

  const getPendingInvitations = () => {
    return invitations.filter(invitation => invitation.status === 'pending')
  }

  const getExpiredInvitations = () => {
    const now = new Date()
    return invitations.filter(invitation => 
      invitation.status === 'pending' && 
      new Date(invitation.expires_at) < now
    )
  }

  const getMembersByDepartment = (department: string) => {
    return members.filter(member => member.department === department)
  }

  const getDepartments = () => {
    const departments = new Set(members.map(member => member.department).filter(Boolean))
    return Array.from(departments)
  }

  return {
    // Data
    members,
    invitations,
    stats,
    
    // Loading states
    loading: membersLoading || statsLoading || invitationsLoading,
    membersLoading,
    statsLoading,
    invitationsLoading,
    
    // Error states
    error: membersError || statsError || invitationsError,
    membersError,
    statsError,
    invitationsError,
    
    // Actions
    createInvitation,
    cancelInvitation,
    updateMemberRole,
    removeMember,
    searchMembers,
    
    // Refetch functions
    refetchMembers,
    refetchStats,
    refetchInvitations,
    
    // Helper functions
    getMembersByRole,
    getActiveMembers,
    getPendingInvitations,
    getExpiredInvitations,
    getMembersByDepartment,
    getDepartments,
    
    // Permissions
    isManager
  }
}
