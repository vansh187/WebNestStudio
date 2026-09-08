import { z } from 'zod'

export const newProjectSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(80, 'Keep the title under 80 characters'),
  language: z.string().min(1, 'Pick a language'),
})

export const shareSchema = z.object({
  title: z.string().trim().max(80, 'Keep the title under 80 characters').optional(),
})
