import { useState, useEffect } from 'react'
import { Project } from '@/lib/supabase'
import { useAuthContext } from '@/components/Auth/AuthProvider'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { apiService } from '@/services/apiService'

export const useProjects = () => {
  const { user, isManager } = useAuthContext()
  const [projects, setProjects] = useState<Project[]>([])

  // Fetch projects using the new API service
  const { data: fetchedProjects, loading, error, refetch } = useApi(
    () => apiService.getProjects(user?.id || '', isManager),
    [user?.id, isManager],
    !!user
  )

  // Update local state when data changes
  useEffect(() => {
    if (fetchedProjects) {
      setProjects(fetchedProjects)
    }
  }, [fetchedProjects])

  // Create project mutation
  const createProjectMutation = useApiMutation(
    (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => 
      apiService.createProject(projectData),
    (newProject) => {
      setProjects(prev => [newProject, ...prev])
    }
  )

  // Update project mutation
  const updateProjectMutation = useApiMutation(
    ({ id, updates }: { id: string; updates: Partial<Project> }) => 
      apiService.updateProject(id, updates),
    (updatedProject) => {
      setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p))
    }
  )

  // Delete project mutation
  const deleteProjectMutation = useApiMutation(
    (projectId: string) => apiService.deleteProject(projectId),
    () => {
      // The project will be removed from the list by the refetch
    }
  )

  const createProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    if (!isManager) {
      throw new Error('Only managers can create projects')
    }
    return createProjectMutation.mutate(projectData)
  }

  const updateProject = async (id: string, updates: Partial<Project>) => {
    return updateProjectMutation.mutate({ id, updates })
  }

  const deleteProject = async (id: string) => {
    if (!isManager) {
      throw new Error('Only managers can delete projects')
    }
    return deleteProjectMutation.mutate(id)
  }

  return {
    projects,
    loading: loading || createProjectMutation.loading || updateProjectMutation.loading || deleteProjectMutation.loading,
    error: error || createProjectMutation.error || updateProjectMutation.error || deleteProjectMutation.error,
    createProject,
    updateProject,
    deleteProject,
    refetch
  }
}