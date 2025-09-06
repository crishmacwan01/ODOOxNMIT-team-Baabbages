import { useState, useEffect } from 'react'
import { Task, FilterParams } from '@/lib/supabase'
import { useAuthContext } from '@/components/Auth/AuthProvider'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { apiService } from '@/services/apiService'

export const useTasks = (filters: FilterParams = {}) => {
  const { user } = useAuthContext()
  const [tasks, setTasks] = useState<Task[]>([])

  // Fetch tasks using the new API service
  const { data: fetchedTasks, loading, error, refetch } = useApi(
    () => apiService.getTasks(filters),
    [JSON.stringify(filters)],
    true
  )

  // Update local state when data changes
  useEffect(() => {
    if (fetchedTasks) {
      setTasks(fetchedTasks)
    }
  }, [fetchedTasks])

  // Create task mutation
  const createTaskMutation = useApiMutation(
    (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => 
      apiService.createTask(taskData),
    (newTask) => {
      setTasks(prev => [newTask, ...prev])
    }
  )

  // Update task mutation
  const updateTaskMutation = useApiMutation(
    ({ id, updates }: { id: string; updates: Partial<Task> }) => 
      apiService.updateTask(id, updates),
    (updatedTask) => {
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t))
    }
  )

  // Delete task mutation
  const deleteTaskMutation = useApiMutation(
    (taskId: string) => apiService.deleteTask(taskId),
    (_, taskId) => {
      setTasks(prev => prev.filter(t => t.id !== taskId))
    }
  )

  const createTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    return createTaskMutation.mutate(taskData)
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    return updateTaskMutation.mutate({ id, updates })
  }

  const deleteTask = async (id: string) => {
    return deleteTaskMutation.mutate(id)
  }

  // Get tasks by project
  const getTasksByProject = (projectId: string) => {
    return tasks.filter(task => task.project_id === projectId)
  }

  // Get tasks by status
  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status)
  }

  // Get tasks by priority
  const getTasksByPriority = (priority: Task['priority']) => {
    return tasks.filter(task => task.priority === priority)
  }

  // Get overdue tasks
  const getOverdueTasks = () => {
    const now = new Date()
    return tasks.filter(task => 
      task.due_date && 
      new Date(task.due_date) < now && 
      task.status !== 'done'
    )
  }

  // Get tasks due soon (within next 7 days)
  const getTasksDueSoon = () => {
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    return tasks.filter(task => 
      task.due_date && 
      new Date(task.due_date) >= now && 
      new Date(task.due_date) <= nextWeek &&
      task.status !== 'done'
    )
  }

  // Get task statistics
  const getTaskStats = () => {
    const total = tasks.length
    const completed = tasks.filter(t => t.status === 'done').length
    const inProgress = tasks.filter(t => t.status === 'in_progress').length
    const todo = tasks.filter(t => t.status === 'todo').length
    const review = tasks.filter(t => t.status === 'review').length
    const overdue = getOverdueTasks().length
    const dueSoon = getTasksDueSoon().length

    return {
      total,
      completed,
      inProgress,
      todo,
      review,
      overdue,
      dueSoon,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  }

  return {
    tasks,
    loading: loading || createTaskMutation.loading || updateTaskMutation.loading || deleteTaskMutation.loading,
    error: error || createTaskMutation.error || updateTaskMutation.error || deleteTaskMutation.error,
    createTask,
    updateTask,
    deleteTask,
    refetch,
    getTasksByProject,
    getTasksByStatus,
    getTasksByPriority,
    getOverdueTasks,
    getTasksDueSoon,
    getTaskStats
  }
}