import type { Status } from '@/domain/status'

/** German labels for the job statuses (presentation, not domain logic). */
export const STATUS_LABELS: Record<Status, string> = {
  angebot: 'Angebot',
  beauftragt: 'Beauftragt',
  erledigt: 'Erledigt',
  bezahlt: 'Bezahlt',
  abgelehnt: 'Abgelehnt',
  storniert: 'Storniert',
}

/** A dot colour per status, used next to the label in the badge. */
export const STATUS_DOT: Record<Status, string> = {
  angebot: 'bg-blue-500',
  beauftragt: 'bg-amber-500',
  erledigt: 'bg-purple-500',
  bezahlt: 'bg-green-500',
  abgelehnt: 'bg-red-500',
  storniert: 'bg-gray-400',
}
