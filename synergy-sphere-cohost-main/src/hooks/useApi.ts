import { useState, useEffect, useCallback } from 'react'
import { apiService, ApiResponse } from '@/services/apiService'
import { useToast } from '@/hooks/use-toast'

export interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  success: boolean
}

export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = [],
  immediate: boolean = true
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false
  })
  const { toast } = useToast()

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await apiCall()
      
      setState({
        data: response.data,
        loading: false,
        error: response.error,
        success: response.success
      })

      if (!response.success && response.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.error,
        })
      }

      return response
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred'
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false
      })
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })

      return {
        data: null,
        error: errorMessage,
        success: false
      }
    }
  }, dependencies)

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  const refetch = useCallback(() => {
    return execute()
  }, [execute])

  return {
    ...state,
    refetch,
    execute
  }
}

export function useApiMutation<T, P = any>(
  mutationFn: (params: P) => Promise<ApiResponse<T>>,
  onSuccess?: (data: T) => void,
  onError?: (error: string) => void
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false
  })
  const { toast } = useToast()

  const mutate = useCallback(async (params: P) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await mutationFn(params)
      
      setState({
        data: response.data,
        loading: false,
        error: response.error,
        success: response.success
      })

      if (response.success && response.data) {
        onSuccess?.(response.data)
        toast({
          title: "Success",
          description: "Operation completed successfully.",
        })
      } else if (!response.success && response.error) {
        onError?.(response.error)
        toast({
          variant: "destructive",
          title: "Error",
          description: response.error,
        })
      }

      return response
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred'
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false
      })
      
      onError?.(errorMessage)
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })

      return {
        data: null,
        error: errorMessage,
        success: false
      }
    }
  }, [mutationFn, onSuccess, onError])

  return {
    ...state,
    mutate
  }
}
