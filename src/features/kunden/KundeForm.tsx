import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { kundeSchema, type KundeFormValues } from './kunde-schema'
import { TextField } from '@/components/form/TextField'
import { TextareaField } from '@/components/form/TextareaField'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface KundeFormProps {
  formId: string
  defaultValues: KundeFormValues
  onSubmit: (values: KundeFormValues) => void | Promise<void>
}

/** The customer master-data form. The submit button lives in the dialog footer
 *  and targets this form via `formId`. */
export function KundeForm({ formId, defaultValues, onSubmit }: KundeFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<KundeFormValues>({
    resolver: zodResolver(kundeSchema),
    defaultValues,
  })

  // useWatch (a proper hook) instead of watch() — the latter returns a function
  // the React Compiler cannot memoize safely.
  const typ = useWatch({ control, name: 'typ' })
  const submit = handleSubmit((values) => onSubmit(values))

  return (
    <form
      id={formId}
      onSubmit={(event) => void submit(event)}
      noValidate
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor={`${formId}-typ`}>Typ</Label>
        <Controller
          control={control}
          name="typ"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id={`${formId}-typ`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="privat">Privat</SelectItem>
                <SelectItem value="firma">Firma</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {typ === 'firma' && (
        <TextField
          label="Firmenname"
          error={errors.firma_name?.message}
          {...register('firma_name')}
        />
      )}

      <div className="space-y-2">
        <Label htmlFor={`${formId}-anrede`}>Anrede</Label>
        <Controller
          control={control}
          name="anrede"
          render={({ field }) => (
            <Select
              value={field.value === '' ? 'keine' : field.value}
              onValueChange={(value) =>
                field.onChange(value === 'keine' ? '' : value)
              }
            >
              <SelectTrigger id={`${formId}-anrede`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="keine">Keine</SelectItem>
                <SelectItem value="Herr">Herr</SelectItem>
                <SelectItem value="Frau">Frau</SelectItem>
                <SelectItem value="Divers">Divers</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Vorname"
          autoComplete="given-name"
          error={errors.vorname?.message}
          {...register('vorname')}
        />
        <TextField
          label="Nachname"
          autoComplete="family-name"
          error={errors.nachname?.message}
          {...register('nachname')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="E-Mail"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="Telefon"
          type="tel"
          autoComplete="tel"
          error={errors.telefon?.message}
          {...register('telefon')}
        />
      </div>

      <TextField
        label="Straße und Hausnummer"
        autoComplete="street-address"
        error={errors.strasse?.message}
        {...register('strasse')}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="PLZ"
          autoComplete="postal-code"
          error={errors.plz?.message}
          {...register('plz')}
        />
        <TextField
          label="Ort"
          autoComplete="address-level2"
          error={errors.ort?.message}
          {...register('ort')}
        />
      </div>

      <TextareaField
        label="Notizen"
        rows={3}
        error={errors.notizen?.message}
        {...register('notizen')}
      />
    </form>
  )
}
