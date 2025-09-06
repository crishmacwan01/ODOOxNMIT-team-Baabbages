import { useState, useEffect, useCallback } from 'react'
import { TeamMessage } from '@/lib/supabase'
import { useAuthContext } from '@/components/Auth/AuthProvider'
import { useApi, useApiMutation } from '@/hooks/useApi'
import { apiService } from '@/services/apiService'

export const useMessages = (projectId?: string) => {
  const { user } = useAuthContext()
  const [messages, setMessages] = useState<TeamMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)

  // Fetch messages using the new API service
  const { data: fetchedMessages, loading, error, refetch } = useApi(
    () => apiService.getMessages(projectId),
    [projectId],
    true
  )

  // Update local state when data changes
  useEffect(() => {
    if (fetchedMessages) {
      setMessages(fetchedMessages)
    }
  }, [fetchedMessages])

  // Create message mutation
  const createMessageMutation = useApiMutation(
    (messageData: Omit<TeamMessage, 'id' | 'created_at'>) => 
      apiService.createMessage(messageData),
    (newMessage) => {
      setMessages(prev => [newMessage, ...prev])
    }
  )

  // Set up real-time subscription
  useEffect(() => {
    if (!projectId || !user) return

    const subscription = apiService.subscribeToMessages(projectId, (payload) => {
      console.log('New message received:', payload)
      
      if (payload.eventType === 'INSERT') {
        const newMessage = payload.new as TeamMessage
        setMessages(prev => [newMessage, ...prev])
      } else if (payload.eventType === 'UPDATE') {
        const updatedMessage = payload.new as TeamMessage
        setMessages(prev => prev.map(msg => 
          msg.id === updatedMessage.id ? updatedMessage : msg
        ))
      } else if (payload.eventType === 'DELETE') {
        const deletedMessage = payload.old as TeamMessage
        setMessages(prev => prev.filter(msg => msg.id !== deletedMessage.id))
      }
    })

    setIsConnected(true)

    return () => {
      subscription.unsubscribe()
      setIsConnected(false)
    }
  }, [projectId, user])

  const sendMessage = useCallback(async (content: string, messageType: 'text' | 'file' | 'system' = 'text', replyTo?: string) => {
    if (!user || !projectId) {
      throw new Error('User or project ID is required')
    }

    const messageData: Omit<TeamMessage, 'id' | 'created_at'> = {
      project_id: projectId,
      sender_id: user.id,
      content,
      message_type: messageType,
      reply_to: replyTo
    }

    return createMessageMutation.mutate(messageData)
  }, [user, projectId, createMessageMutation])

  const sendFileMessage = useCallback(async (file: File, description?: string) => {
    if (!user || !projectId) {
      throw new Error('User or project ID is required')
    }

    // In a real implementation, you would upload the file to Supabase Storage
    // For now, we'll just send a text message with file info
    const content = `📎 File: ${file.name}${description ? ` - ${description}` : ''}`
    
    return sendMessage(content, 'file')
  }, [user, projectId, sendMessage])

  const replyToMessage = useCallback(async (messageId: string, content: string) => {
    return sendMessage(content, 'text', messageId)
  }, [sendMessage])

  // Get messages by sender
  const getMessagesBySender = (senderId: string) => {
    return messages.filter(msg => msg.sender_id === senderId)
  }

  // Get replies to a specific message
  const getReplies = (messageId: string) => {
    return messages.filter(msg => msg.reply_to === messageId)
  }

  // Get recent messages (last 24 hours)
  const getRecentMessages = () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    return messages.filter(msg => new Date(msg.created_at) > yesterday)
  }

  // Get message statistics
  const getMessageStats = () => {
    const total = messages.length
    const textMessages = messages.filter(m => m.message_type === 'text').length
    const fileMessages = messages.filter(m => m.message_type === 'file').length
    const systemMessages = messages.filter(m => m.message_type === 'system').length
    const replies = messages.filter(m => m.reply_to).length

    return {
      total,
      textMessages,
      fileMessages,
      systemMessages,
      replies,
      uniqueSenders: new Set(messages.map(m => m.sender_id)).size
    }
  }

  return {
    messages,
    loading: loading || createMessageMutation.loading,
    error: error || createMessageMutation.error,
    isConnected,
    sendMessage,
    sendFileMessage,
    replyToMessage,
    refetch,
    getMessagesBySender,
    getReplies,
    getRecentMessages,
    getMessageStats
  }
}
