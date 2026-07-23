import { z } from 'zod'
import type { Tables } from '@/types/database'

export type Auftrag = Tables<'auftraege'>

/**
 * Validation for the job form. This form edits the master fields only; status
 * transitions happen elsewhere (via the state machine), and Auftragsnummer is
 * generated on create. Money is kept as a string here and parsed on save.
 */
export const auftragSchema = z.object({
  kunde_id: z.string().min(1, 'Bitte wähle einen Kunden.'),
  titel: z.string().trim().min(1, 'Bitte gib einen Titel ein.'),
  beschreibung: z.string().trim(),
  betrag_netto: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || /^\d+([.,]\d{1,2})?$/.test(value),
      'Bitte gib einen gültigen Betrag ein (z. B. 1234,56).',
    ),
  mwst_satz: z.enum(['0', '7', '19']),
})

export type AuftragFormValues = z.infer<typeof auftragSchema>

export const emptyAuftragFormValues: AuftragFormValues = {
  kunde_id: '',
  titel: '',
  beschreibung: '',
  betrag_netto: '',
  mwst_satz: '19',
}

/** Map a stored job to form values for editing. */
export function auftragToFormValues(auftrag: Auftrag): AuftragFormValues {
  return {
    kunde_id: auftrag.kunde_id,
    titel: auftrag.titel,
    beschreibung: auftrag.beschreibung ?? '',
    betrag_netto: auftrag.betrag_netto.toFixed(2).replace('.', ','),
    mwst_satz: String(auftrag.mwst_satz) as AuftragFormValues['mwst_satz'],
  }
}

function parseNetto(input: string): number {
  const normalized = input.trim().replace(',', '.')
  if (normalized === '') return 0
  const value = Number(normalized)
  return Number.isFinite(value) ? value : 0
}

/** Map validated form values to a database payload (master fields only). */
export function toAuftragPayload(values: AuftragFormValues) {
  return {
    kunde_id: values.kunde_id,
    titel: values.titel.trim(),
    beschreibung: values.beschreibung.trim() || null,
    betrag_netto: parseNetto(values.betrag_netto),
    mwst_satz: Number(values.mwst_satz),
  }
}
