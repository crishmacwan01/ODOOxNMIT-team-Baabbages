import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useProjects } from '@/hooks/useProjects'
import { useTeam } from '@/hooks/useTeam'
import { useToast } from '@/hooks/use-toast'
import { CalendarIcon, Plus, Users } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface ProjectDialogProps {
  children: React.ReactNode
}

const ProjectDialog = ({ children }: ProjectDialogProps) => {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'planning' as const,
    priority: 'medium' as const,
    start_date: new Date(),
    due_date: undefined as Date | undefined,
    team_members: [] as string[]
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { createProject, loading } = useProjects()
  const { members } = useTeam()
  const { toast } = useToast()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Project title is required'
    }

    if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters'
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters'
    }

    if (formData.due_date && formData.due_date < formData.start_date) {
      newErrors.due_date = 'Due date must be after start date'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    try {
      const projectData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        status: formData.status,
        priority: formData.priority,
        manager_id: 'current-user-id', // This would be the current user's ID
        team_members: formData.team_members,
        progress: 0,
        start_date: formData.start_date.toISOString(),
        due_date: formData.due_date?.toISOString()
      }

      await createProject(projectData)
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        start_date: new Date(),
        due_date: undefined,
        team_members: []
      })
      setErrors({})
      setOpen(false)

      toast({
        title: "Project created",
        description: `${formData.title} has been successfully created.`,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    }
  }

  const handleTeamMemberToggle = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      team_members: prev.team_members.includes(memberId)
        ? prev.team_members.filter(id => id !== memberId)
        : [...prev.team_members, memberId]
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                placeholder="Enter project title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter project description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={errors.description ? 'border-destructive' : ''}
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'planning' | 'active' | 'review' | 'completed' | 'on_hold') => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => 
                    setFormData(prev => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Timeline</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.start_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.start_date ? format(formData.start_date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.start_date}
                      onSelect={(date) => date && setFormData(prev => ({ ...prev, start_date: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.due_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.due_date ? format(formData.due_date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.due_date}
                      onSelect={(date) => setFormData(prev => ({ ...prev, due_date: date }))}
                      disabled={(date) => date < formData.start_date}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.due_date && (
                  <p className="text-sm text-destructive">{errors.due_date}</p>
                )}
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Team Members</h3>
            
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleTeamMemberToggle(member.id)}
                >
                  <input
                    type="checkbox"
                    checked={formData.team_members.includes(member.id)}
                    onChange={() => handleTeamMemberToggle(member.id)}
                    className="rounded border-border"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{member.full_name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground capitalize">{member.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ProjectDialog
