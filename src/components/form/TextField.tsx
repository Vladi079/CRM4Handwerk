import { useId, type ComponentProps } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface TextFieldProps extends Omit<ComponentProps<'input'>, 'id'> {
  label: string
  error?: string
}

/**
 * A labelled text input that wires accessibility consistently: the label points
 * at the input, and any error is linked via aria-describedby and announced as an
 * alert. Spread react-hook-form's register() onto it.
 */
export function TextField({ label, error, ...inputProps }: TextFieldProps) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      {error && (
        <p id={errorId} role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
    </div>
  )
}
