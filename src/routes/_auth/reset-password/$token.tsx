import { createFileRoute } from '@tanstack/react-router'
import { ResetPasswordPage } from '@/features/authentication/pages/ResetPasswordPage'

export const Route = createFileRoute('/_auth/reset-password/$token')({
  component: ResetPasswordPage,
})