import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { RegisterPage } from '@/features/authentication/pages/RegisterPage'

const registerSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/_auth/register')({
  validateSearch: registerSearchSchema,
  component: RegisterPage,
})
