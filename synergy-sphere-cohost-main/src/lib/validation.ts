import { z } from 'zod'

// Common validation schemas
export const emailSchema = z.string().email('Please enter a valid email address')
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters')
export const nameSchema = z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters')
export const roleSchema = z.enum(['team', 'manager'], { errorMap: () => ({ message: 'Role must be either team or manager' }) })

// Profile validation
export const profileSchema = z.object({
  full_name: nameSchema,
  role: roleSchema,
  department: z.string().optional(),
  avatar_url: z.string().url().optional().or(z.literal(''))
})

// Project validation
export const projectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  status: z.enum(['planning', 'active', 'review', 'completed', 'on_hold'], {
    errorMap: () => ({ message: 'Invalid project status' })
  }),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    errorMap: () => ({ message: 'Invalid priority level' })
  }),
  manager_id: z.string().uuid('Invalid manager ID'),
  team_members: z.array(z.string().uuid('Invalid team member ID')).default([]),
  progress: z.number().min(0, 'Progress must be at least 0').max(100, 'Progress must be at most 100').default(0),
  start_date: z.string().datetime('Invalid start date'),
  due_date: z.string().datetime('Invalid due date').optional()
})

// Task validation
export const taskSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'done'], {
    errorMap: () => ({ message: 'Invalid task status' })
  }),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    errorMap: () => ({ message: 'Invalid priority level' })
  }),
  assigned_to: z.string().uuid('Invalid assigned user ID'),
  created_by: z.string().uuid('Invalid creator ID'),
  due_date: z.string().datetime('Invalid due date').optional(),
  estimated_hours: z.number().min(0, 'Estimated hours must be positive').optional(),
  actual_hours: z.number().min(0, 'Actual hours must be positive').optional()
})

// Message validation
export const messageSchema = z.object({
  project_id: z.string().uuid('Invalid project ID').optional(),
  sender_id: z.string().uuid('Invalid sender ID'),
  content: z.string().min(1, 'Message content is required').max(1000, 'Message must be less than 1000 characters'),
  message_type: z.enum(['text', 'file', 'system'], {
    errorMap: () => ({ message: 'Invalid message type' })
  }).default('text'),
  reply_to: z.string().uuid('Invalid reply message ID').optional()
})

// Authentication validation
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: nameSchema,
  role: roleSchema
})

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
})

// Form validation helpers
export const validateForm = <T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; errors?: Record<string, string> } => {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        errors[path] = err.message
      })
      return { success: false, errors }
    }
    return { success: false, errors: { general: 'Validation failed' } }
  }
}

// Field validation helpers
export const validateField = (schema: z.ZodSchema, value: unknown): { success: boolean; error?: string } => {
  try {
    schema.parse(value)
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message }
    }
    return { success: false, error: 'Invalid value' }
  }
}

// Date validation helpers
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

export const isFutureDate = (dateString: string): boolean => {
  const date = new Date(dateString)
  const now = new Date()
  return date > now
}

export const isPastDate = (dateString: string): boolean => {
  const date = new Date(dateString)
  const now = new Date()
  return date < now
}

// URL validation
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// File validation
export const validateFile = (file: File, maxSize: number = 5 * 1024 * 1024, allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif']): { success: boolean; error?: string } => {
  if (file.size > maxSize) {
    return { success: false, error: `File size must be less than ${maxSize / (1024 * 1024)}MB` }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: `File type must be one of: ${allowedTypes.join(', ')}` }
  }
  
  return { success: true }
}

// Password strength validation
export const validatePasswordStrength = (password: string): { score: number; feedback: string[] } => {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push('At least 8 characters')
  }

  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('At least one lowercase letter')
  }

  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('At least one uppercase letter')
  }

  if (/[0-9]/.test(password)) {
    score += 1
  } else {
    feedback.push('At least one number')
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1
  } else {
    feedback.push('At least one special character')
  }

  return { score, feedback }
}

// Export all schemas for easy access
export const schemas = {
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  role: roleSchema,
  profile: profileSchema,
  project: projectSchema,
  task: taskSchema,
  message: messageSchema,
  signUp: signUpSchema,
  signIn: signInSchema
}
