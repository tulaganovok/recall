import { z } from 'zod'

export const signInFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const signUpFormSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
})
