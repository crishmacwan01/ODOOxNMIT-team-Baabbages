import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTeam } from '@/hooks/useTeam'
import { useToast } from '@/hooks/use-toast'
import { 
  Users, 
  UserPlus, 
  Search, 
  Mail, 
  Crown, 
  User, 
  MoreVertical,
  Trash2,
  Edit,
  Clock,
  CheckCircle,
  XCircle,
  Building
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const TeamManagement = () => {
  const { 
    members, 
    invitations, 
    stats, 
    loading, 
    error,
    createInvitation, 
    cancelInvitation, 
    updateMemberRole, 
    removeMember,
    getMembersByRole,
    getActiveMembers,
    getPendingInvitations,
    getDepartments,
    isManager
  } = useTeam()
  
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'team' as 'team' | 'manager'
  })

  const handleInvite = async () => {
    if (!inviteForm.email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an email address",
      })
      return
    }

    try {
      await createInvitation(inviteForm.email, inviteForm.role)
      setInviteForm({ email: '', role: 'team' })
      setIsInviteDialogOpen(false)
      toast({
        title: "Invitation sent",
        description: `Invitation sent to ${inviteForm.email}`,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await cancelInvitation(invitationId)
      toast({
        title: "Invitation cancelled",
        description: "The invitation has been cancelled",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    }
  }

  const handleUpdateRole = async (memberId: string, newRole: 'team' | 'manager') => {
    try {
      await updateMemberRole(memberId, newRole)
      toast({
        title: "Role updated",
        description: "Member role has been updated",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    }
  }

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from the team?`)) {
      return
    }

    try {
      await removeMember(memberId)
      toast({
        title: "Member removed",
        description: `${memberName} has been removed from the team`,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    }
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDepartment = selectedDepartment === 'all' || member.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  const managers = getMembersByRole('manager')
  const teamMembers = getMembersByRole('team')
  const activeMembers = getActiveMembers()
  const pendingInvitations = getPendingInvitations()
  const departments = getDepartments()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <XCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Team</h3>
        <p className="text-muted-foreground">{error}</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Management</h2>
          <p className="text-muted-foreground">Manage your team members and invitations</p>
        </div>
        {isManager && (
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={inviteForm.role}
                    onValueChange={(value: 'team' | 'manager') => setInviteForm(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="team">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          Team Member
                        </div>
                      </SelectItem>
                      <SelectItem value="manager">
                        <div className="flex items-center">
                          <Crown className="w-4 h-4 mr-2" />
                          Manager
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleInvite} className="w-full">
                  Send Invitation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold">{stats.totalMembers}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Members</p>
                <p className="text-2xl font-bold">{stats.activeMembers}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Managers</p>
                <p className="text-2xl font-bold">{stats.managers}</p>
              </div>
              <Crown className="w-8 h-8 text-warning" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Invitations</p>
                <p className="text-2xl font-bold">{stats.pendingInvitations}</p>
              </div>
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          {isManager && <TabsTrigger value="invitations">Invitations</TabsTrigger>}
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-2" />
                      {dept}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Members List */}
          <div className="space-y-4">
            {filteredMembers.length === 0 ? (
              <Card className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No members found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || selectedDepartment !== 'all' 
                    ? 'Try adjusting your search criteria' 
                    : 'No team members yet'
                  }
                </p>
              </Card>
            ) : (
              filteredMembers.map((member) => (
                <Card key={member.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={member.avatar_url} />
                        <AvatarFallback>
                          {member.full_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">{member.full_name}</h4>
                          {member.role === 'manager' && (
                            <Crown className="w-4 h-4 text-warning" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        {member.department && (
                          <div className="flex items-center mt-1">
                            <Building className="w-3 h-3 mr-1 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{member.department}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={member.role === 'manager' ? 'default' : 'secondary'}>
                        {member.role}
                      </Badge>
                      {isManager && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => handleUpdateRole(
                                member.id, 
                                member.role === 'manager' ? 'team' : 'manager'
                              )}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              {member.role === 'manager' ? 'Make Team Member' : 'Make Manager'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRemoveMember(member.id, member.full_name)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {isManager && (
          <TabsContent value="invitations" className="space-y-4">
            {pendingInvitations.length === 0 ? (
              <Card className="p-8 text-center">
                <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No pending invitations</h3>
                <p className="text-muted-foreground">All invitations have been accepted or expired</p>
              </Card>
            ) : (
              pendingInvitations.map((invitation) => (
                <Card key={invitation.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{invitation.email}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{invitation.role}</Badge>
                          <span className="text-xs text-muted-foreground">
                            Expires {new Date(invitation.expires_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelInvitation(invitation.id)}
                    >
                      Cancel
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

export default TeamManagement

