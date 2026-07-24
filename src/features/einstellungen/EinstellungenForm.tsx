import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { TextField } from '@/components/form/TextField'
import {
  einstellungenSchema,
  profileToFormValues,
  toProfilePayload,
  type EinstellungenFormValues,
} from './einstellungen-schema'
import { useUpdateProfile, type Profile } from './profile-queries'

export function EinstellungenForm({ profile }: { profile: Profile }) {
  const updateProfile = useUpdateProfile()
  const [saved, setSaved] = useState(false)
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EinstellungenFormValues>({
    resolver: zodResolver(einstellungenSchema),
    defaultValues: profileToFormValues(profile),
  })

  const kleinunternehmer = useWatch({ control, name: 'kleinunternehmer' })

  const submit = handleSubmit(async (values) => {
    setSaved(false)
    await updateProfile.mutateAsync(toProfilePayload(values))
    setSaved(true)
  })

  return (
    <form
      onSubmit={(event) => void submit(event)}
      className="max-w-lg space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Firmendaten</CardTitle>
        </CardHeader>
        <CardContent>
          <TextField
            label="Firmenname"
            error={errors.firma_name?.message}
            {...register('firma_name')}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Steuer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="kleinunternehmer">
                Kleinunternehmer (§19 UStG)
              </Label>
              <p className="text-muted-foreground text-sm">
                Keine Umsatzsteuer ausweisen.
              </p>
            </div>
            <Controller
              control={control}
              name="kleinunternehmer"
              render={({ field }) => (
                <Switch
                  id="kleinunternehmer"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="standard-mwst">Standard-MwSt.-Satz</Label>
            <Controller
              control={control}
              name="standard_mwst_satz"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={kleinunternehmer}
                >
                  <SelectTrigger id="standard-mwst" className="w-full">
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
            {kleinunternehmer && (
              <p className="text-muted-foreground text-xs">
                Als Kleinunternehmer wird ohnehin keine MwSt. ausgewiesen.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={updateProfile.isPending}>
          {updateProfile.isPending ? 'Wird gespeichert …' : 'Speichern'}
        </Button>
        {saved && !updateProfile.isPending && (
          <span role="status" className="text-muted-foreground text-sm">
            Gespeichert.
          </span>
        )}
        {updateProfile.isError && (
          <span role="alert" className="text-destructive text-sm">
            Speichern fehlgeschlagen.
          </span>
        )}
      </div>
    </form>
  )
}
