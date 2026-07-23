import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { credentialsSchema, type Credentials } from './auth-schema'
import type { AuthActionResult } from './auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CredentialsFormProps {
  submitLabel: string
  pendingLabel: string
  passwordAutoComplete: 'current-password' | 'new-password'
  onSubmit: (values: Credentials) => Promise<AuthActionResult>
}

/**
 * Shared email + password form for login and registration. It is deliberately
 * "dumb": the parent passes an onSubmit, so this component has no Supabase
 * dependency and is easy to unit-test. Accessibility is wired by hand — each
 * field links its error via aria-describedby and sets aria-invalid.
 */
export function CredentialsForm({
  submitLabel,
  pendingLabel,
  passwordAutoComplete,
  onSubmit,
}: CredentialsFormProps) {
  const emailId = useId()
  const passwordId = useId()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Credentials>({ resolver: zodResolver(credentialsSchema) })

  const submit = handleSubmit(async (values) => {
    setServerError(null)
    const { error } = await onSubmit(values)
    if (error) setServerError(error)
  })

  return (
    <form
      onSubmit={(event) => void submit(event)}
      noValidate
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor={emailId}>E-Mail</Label>
        <Input
          id={emailId}
          type="email"
          autoComplete="email"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? `${emailId}-error` : undefined}
          {...register('email')}
        />
        {errors.email && (
          <p
            id={`${emailId}-error`}
            role="alert"
            className="text-destructive text-sm"
          >
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={passwordId}>Passwort</Label>
        <Input
          id={passwordId}
          type="password"
          autoComplete={passwordAutoComplete}
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? `${passwordId}-error` : undefined}
          {...register('password')}
        />
        {errors.password && (
          <p
            id={`${passwordId}-error`}
            role="alert"
            className="text-destructive text-sm"
          >
            {errors.password.message}
          </p>
        )}
      </div>

      {serverError && (
        <p
          role="alert"
          aria-live="assertive"
          className="text-destructive text-sm"
        >
          {serverError}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? pendingLabel : submitLabel}
      </Button>
    </form>
  )
}
