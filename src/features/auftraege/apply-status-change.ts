import {
  canTransition,
  getDatumForStatus,
  getResetTarget,
  type Status,
} from '@/domain/status'
import type { Auftrag } from './auftrag-schema'

/** The subset of columns a status change may write. */
export interface StatusUpdate {
  status: Status
  angebot_datum?: string | null
  beauftragt_datum?: string | null
  erledigt_datum?: string | null
  bezahlt_datum?: string | null
}

/**
 * Compute the database update for moving `auftrag` to `to`, applying the state
 * machine rules:
 *  - a forward transition stamps the target's date with today if it is null;
 *  - a single-step reset clears the date the *current* status had stamped;
 *  - anything else is rejected (returns null) so callers never write an
 *    illegal transition.
 * Pure: `todayIso` is passed in.
 */
export function buildStatusUpdate(
  auftrag: Auftrag,
  to: Status,
  todayIso: string,
): StatusUpdate | null {
  const from = auftrag.status

  if (canTransition(from, to)) {
    const update: StatusUpdate = { status: to }
    const datum = getDatumForStatus(to)
    if (datum && auftrag[datum] == null) {
      update[datum] = todayIso
    }
    return update
  }

  if (getResetTarget(from) === to) {
    const update: StatusUpdate = { status: to }
    const datum = getDatumForStatus(from)
    if (datum) {
      update[datum] = null
    }
    return update
  }

  return null
}
