import { z } from 'zod'
import type { Tables } from '@/types/database'

export type Kunde = Tables<'kunden'>

/**
 * Validation for the customer form. All fields are strings (controlled inputs),
 * so optional fields use '' for "empty" and are mapped to null before saving.
 * Messages are German because they are shown to the user.
 */
export const kundeSchema = z
  .object({
    typ: z.enum(['privat', 'firma']),
    anrede: z.union([z.literal(''), z.enum(['Herr', 'Frau', 'Divers'])]),
    firma_name: z.string().trim(),
    vorname: z.string().trim().min(1, 'Bitte gib den Vornamen ein.'),
    nachname: z.string().trim().min(1, 'Bitte gib den Nachnamen ein.'),
    email: z.union([z.literal(''), z.email('Keine gültige E-Mail-Adresse.')]),
    telefon: z.string().trim(),
    strasse: z.string().trim().min(1, 'Bitte gib die Straße ein.'),
    plz: z.string().trim().min(1, 'Bitte gib die PLZ ein.'),
    ort: z.string().trim().min(1, 'Bitte gib den Ort ein.'),
    notizen: z.string().trim(),
  })
  // A company customer must have a company name.
  .refine((values) => values.typ !== 'firma' || values.firma_name.length > 0, {
    path: ['firma_name'],
    message: 'Bei Firmenkunden ist der Firmenname erforderlich.',
  })

export type KundeFormValues = z.infer<typeof kundeSchema>

export const emptyKundeFormValues: KundeFormValues = {
  typ: 'privat',
  anrede: '',
  firma_name: '',
  vorname: '',
  nachname: '',
  email: '',
  telefon: '',
  strasse: '',
  plz: '',
  ort: '',
  notizen: '',
}

/** Map a stored customer to form values (null → ''). */
export function kundeToFormValues(kunde: Kunde): KundeFormValues {
  return {
    typ: kunde.typ,
    anrede: kunde.anrede ?? '',
    firma_name: kunde.firma_name ?? '',
    vorname: kunde.vorname,
    nachname: kunde.nachname,
    email: kunde.email ?? '',
    telefon: kunde.telefon ?? '',
    strasse: kunde.strasse,
    plz: kunde.plz,
    ort: kunde.ort,
    notizen: kunde.notizen ?? '',
  }
}

/** Map validated form values to a database payload ('' → null for optionals). */
export function toKundePayload(values: KundeFormValues) {
  const trimmedToNull = (value: string): string | null => {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }

  return {
    typ: values.typ,
    anrede: values.anrede === '' ? null : values.anrede,
    firma_name: trimmedToNull(values.firma_name),
    vorname: values.vorname.trim(),
    nachname: values.nachname.trim(),
    email: trimmedToNull(values.email),
    telefon: trimmedToNull(values.telefon),
    strasse: values.strasse.trim(),
    plz: values.plz.trim(),
    ort: values.ort.trim(),
    notizen: trimmedToNull(values.notizen),
  }
}
