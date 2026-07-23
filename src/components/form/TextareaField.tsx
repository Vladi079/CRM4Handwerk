import { useId, type ComponentProps } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface TextareaFieldProps extends Omit<ComponentProps<'textarea'>, 'id'> {
  label: string
  error?: string
}

/** Multiline counterpart to TextField, with the same accessibility wiring. */
export function TextareaField({
  label,
  error,
  ...textareaProps
}: TextareaFieldProps) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...textareaProps}
      />
      {error && (
        <p id={errorId} role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
    </div>
  )
}
