import { z } from 'zod'
import type { TablesUpdate } from '@/types/database'
import type { Profile } from './profile-queries'

export const einstellungenSchema = z.object({
  firma_name: z.string().trim(),
  kleinunternehmer: z.boolean(),
  standard_mwst_satz: z.enum(['0', '7', '19']),
})

export type EinstellungenFormValues = z.infer<typeof einstellungenSchema>

export function profileToFormValues(profile: Profile): EinstellungenFormValues {
  const satz = [0, 7, 19].includes(profile.standard_mwst_satz)
    ? (String(
        profile.standard_mwst_satz,
      ) as EinstellungenFormValues['standard_mwst_satz'])
    : '19'
  return {
    firma_name: profile.firma_name ?? '',
    kleinunternehmer: profile.kleinunternehmer,
    standard_mwst_satz: satz,
  }
}

export function toProfilePayload(
  values: EinstellungenFormValues,
): TablesUpdate<'profiles'> {
  return {
    firma_name: values.firma_name.trim() || null,
    kleinunternehmer: values.kleinunternehmer,
    standard_mwst_satz: Number(values.standard_mwst_satz),
  }
}
