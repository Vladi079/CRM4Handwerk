/** Customer value types. Expressed as CHECK constraints in the database. */
export type KundeTyp = 'privat' | 'firma'
export type Anrede = 'Herr' | 'Frau' | 'Divers'

/** The minimal shape needed to render a customer's display name. */
export interface KundeNameInput {
  typ: KundeTyp
  firma_name: string | null
  vorname: string
  nachname: string
}

/** Display name: the company name for firms, otherwise "Vorname Nachname". */
export function kundeAnzeigename(kunde: KundeNameInput): string {
  const person = `${kunde.vorname} ${kunde.nachname}`.trim()
  if (kunde.typ === 'firma') {
    const firma = kunde.firma_name?.trim()
    return firma ? firma : person
  }
  return person
}

export interface DeletionCheck {
  allowed: boolean
  /** A ready-to-display German explanation when deletion is blocked. */
  reason: string | null
}

/**
 * A Kunde with at least one Auftrag must not be hard-deleted (the database
 * enforces this too, via ON DELETE RESTRICT). Returns a German explanation
 * when deletion is blocked.
 */
export function canDeleteKunde(auftragCount: number): DeletionCheck {
  if (auftragCount > 0) {
    const auftragWord = auftragCount === 1 ? 'Auftrag' : 'Aufträge'
    return {
      allowed: false,
      reason:
        `Dieser Kunde hat noch ${auftragCount} ${auftragWord} und kann nicht ` +
        `gelöscht werden. Bitte lösche zuerst die zugehörigen Aufträge.`,
    }
  }
  return { allowed: true, reason: null }
}
