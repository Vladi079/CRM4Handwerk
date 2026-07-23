/**
 * Status state machine for an Auftrag.
 *
 *   angebot → beauftragt → erledigt → bezahlt
 *      ↓           ↓
 *   abgelehnt   storniert
 *
 * Forward-only, no skipping steps. `abgelehnt` and `storniert` are terminal.
 * A separate `zurücksetzen` action can step back exactly one step and clears
 * the date stamped by the step being undone.
 *
 * The UI must derive its buttons from these functions — never hardcode
 * transitions.
 */

export type Status =
  'angebot' | 'beauftragt' | 'erledigt' | 'bezahlt' | 'abgelehnt' | 'storniert'

/** The date column a status stamps the first time it is entered. */
export type DatumField =
  'angebot_datum' | 'beauftragt_datum' | 'erledigt_datum' | 'bezahlt_datum'

/** All statuses in display order (used e.g. for the Kanban columns). */
export const ALL_STATUSES: readonly Status[] = [
  'angebot',
  'beauftragt',
  'erledigt',
  'bezahlt',
  'abgelehnt',
  'storniert',
]

/** Allowed forward transitions from each status. */
const FORWARD_TRANSITIONS: Record<Status, readonly Status[]> = {
  angebot: ['beauftragt', 'abgelehnt'],
  beauftragt: ['erledigt', 'storniert'],
  erledigt: ['bezahlt'],
  bezahlt: [],
  abgelehnt: [],
  storniert: [],
}

/** The status a reset lands on, or null when there is no previous step. */
const PREVIOUS_STATUS: Record<Status, Status | null> = {
  angebot: null,
  beauftragt: 'angebot',
  erledigt: 'beauftragt',
  bezahlt: 'erledigt',
  abgelehnt: 'angebot',
  storniert: 'beauftragt',
}

/** The date column each status stamps. Branch statuses stamp nothing. */
const STATUS_DATUM: Partial<Record<Status, DatumField>> = {
  angebot: 'angebot_datum',
  beauftragt: 'beauftragt_datum',
  erledigt: 'erledigt_datum',
  bezahlt: 'bezahlt_datum',
}

/** The forward transitions offered from a status. */
export function getAllowedTransitions(from: Status): Status[] {
  return [...FORWARD_TRANSITIONS[from]]
}

/** Whether a forward transition from `from` to `to` is permitted. */
export function canTransition(from: Status, to: Status): boolean {
  return FORWARD_TRANSITIONS[from].includes(to)
}

/** A status is terminal when no forward transition leaves it. */
export function isTerminalStatus(status: Status): boolean {
  return FORWARD_TRANSITIONS[status].length === 0
}

/** Whether the `zurücksetzen` (step back one) action is available. */
export function canReset(status: Status): boolean {
  return PREVIOUS_STATUS[status] !== null
}

/** The status a reset moves to, or null if there is no previous step. */
export function getResetTarget(status: Status): Status | null {
  return PREVIOUS_STATUS[status]
}

/**
 * The date column a status stamps when first entered (and therefore the column
 * to clear when that status is undone). Null for branch statuses.
 */
export function getDatumForStatus(status: Status): DatumField | null {
  return STATUS_DATUM[status] ?? null
}
