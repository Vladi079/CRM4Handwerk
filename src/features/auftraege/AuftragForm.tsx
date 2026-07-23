import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { auftragSchema, type AuftragFormValues } from './auftrag-schema'
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

export interface KundeOption {
  value: string
  label: string
}

interface AuftragFormProps {
  formId: string
  defaultValues: AuftragFormValues
  kundenOptions: KundeOption[]
  onSubmit: (values: AuftragFormValues) => void | Promise<void>
}

export function AuftragForm({
  formId,
  defaultValues,
  kundenOptions,
  onSubmit,
}: AuftragFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AuftragFormValues>({
    resolver: zodResolver(auftragSchema),
    defaultValues,
  })

  const submit = handleSubmit((values) => onSubmit(values))

  return (
    <form
      id={formId}
      onSubmit={(event) => void submit(event)}
      noValidate
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor={`${formId}-kunde`}>Kunde</Label>
        <Controller
          control={control}
          name="kunde_id"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                id={`${formId}-kunde`}
                className="w-full"
                aria-invalid={errors.kunde_id ? true : undefined}
              >
                <SelectValue placeholder="Kunde auswählen" />
              </SelectTrigger>
              <SelectContent>
                {kundenOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.kunde_id && (
          <p role="alert" className="text-destructive text-sm">
            {errors.kunde_id.message}
          </p>
        )}
      </div>

      <TextField
        label="Titel"
        error={errors.titel?.message}
        {...register('titel')}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Nettobetrag (€)"
          inputMode="decimal"
          placeholder="0,00"
          error={errors.betrag_netto?.message}
          {...register('betrag_netto')}
        />
        <div className="space-y-2">
          <Label htmlFor={`${formId}-mwst`}>MwSt.-Satz</Label>
          <Controller
            control={control}
            name="mwst_satz"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id={`${formId}-mwst`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="19">19 %</SelectItem>
                  <SelectItem value="7">7 %</SelectItem>
                  <SelectItem value="0">0 %</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <TextareaField
        label="Beschreibung"
        rows={3}
        error={errors.beschreibung?.message}
        {...register('beschreibung')}
      />
    </form>
  )
}
