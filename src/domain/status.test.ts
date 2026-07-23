import type { AuftragStatus } from '@/types/database'
import {
  ALL_STATUSES,
  canReset,
  canTransition,
  getAllowedTransitions,
  getDatumForStatus,
  getResetTarget,
  isTerminalStatus,
  type Status,
} from './status'

// Compile-time guard: the domain Status union and the database status union
// must stay identical. This fails to typecheck if they ever drift apart.
type AssertEqual<A, B> = [A] extends [B]
  ? [B] extends [A]
    ? true
    : false
  : false
const _statusMatchesDb: AssertEqual<Status, AuftragStatus> = true
void _statusMatchesDb

describe('canTransition', () => {
  it('allows the forward main chain', () => {
    expect(canTransition('angebot', 'beauftragt')).toBe(true)
    expect(canTransition('beauftragt', 'erledigt')).toBe(true)
    expect(canTransition('erledigt', 'bezahlt')).toBe(true)
  })

  it('allows the branch-offs', () => {
    expect(canTransition('angebot', 'abgelehnt')).toBe(true)
    expect(canTransition('beauftragt', 'storniert')).toBe(true)
  })

  it('forbids skipping a step', () => {
    expect(canTransition('angebot', 'erledigt')).toBe(false)
    expect(canTransition('angebot', 'bezahlt')).toBe(false)
    expect(canTransition('beauftragt', 'bezahlt')).toBe(false)
  })

  it('forbids going backwards', () => {
    expect(canTransition('beauftragt', 'angebot')).toBe(false)
    expect(canTransition('bezahlt', 'erledigt')).toBe(false)
  })

  it('forbids leaving a terminal status', () => {
    expect(canTransition('bezahlt', 'erledigt')).toBe(false)
    expect(canTransition('abgelehnt', 'angebot')).toBe(false)
    expect(canTransition('storniert', 'beauftragt')).toBe(false)
  })
})

describe('getAllowedTransitions', () => {
  it('returns the permitted next statuses', () => {
    expect(getAllowedTransitions('angebot')).toEqual([
      'beauftragt',
      'abgelehnt',
    ])
    expect(getAllowedTransitions('beauftragt')).toEqual([
      'erledigt',
      'storniert',
    ])
    expect(getAllowedTransitions('erledigt')).toEqual(['bezahlt'])
  })

  it('returns an empty list for terminal statuses', () => {
    expect(getAllowedTransitions('bezahlt')).toEqual([])
    expect(getAllowedTransitions('abgelehnt')).toEqual([])
    expect(getAllowedTransitions('storniert')).toEqual([])
  })

  it('returns a fresh array (callers cannot mutate the internal table)', () => {
    const list = getAllowedTransitions('angebot')
    list.push('bezahlt')
    expect(getAllowedTransitions('angebot')).toEqual([
      'beauftragt',
      'abgelehnt',
    ])
  })
})

describe('isTerminalStatus', () => {
  it('is true only for bezahlt, abgelehnt and storniert', () => {
    expect(isTerminalStatus('bezahlt')).toBe(true)
    expect(isTerminalStatus('abgelehnt')).toBe(true)
    expect(isTerminalStatus('storniert')).toBe(true)
    expect(isTerminalStatus('angebot')).toBe(false)
    expect(isTerminalStatus('beauftragt')).toBe(false)
    expect(isTerminalStatus('erledigt')).toBe(false)
  })
})

describe('reset (zurücksetzen)', () => {
  it('steps back exactly one step along the main chain', () => {
    expect(getResetTarget('bezahlt')).toBe('erledigt')
    expect(getResetTarget('erledigt')).toBe('beauftragt')
    expect(getResetTarget('beauftragt')).toBe('angebot')
  })

  it('undoes a branch back to where it forked', () => {
    expect(getResetTarget('abgelehnt')).toBe('angebot')
    expect(getResetTarget('storniert')).toBe('beauftragt')
  })

  it('cannot step back from the initial status', () => {
    expect(canReset('angebot')).toBe(false)
    expect(getResetTarget('angebot')).toBeNull()
  })

  it('reports availability consistently with the target', () => {
    for (const status of ALL_STATUSES) {
      expect(canReset(status)).toBe(getResetTarget(status) !== null)
    }
  })
})

describe('getDatumForStatus', () => {
  it('maps main-chain statuses to their date column', () => {
    expect(getDatumForStatus('angebot')).toBe('angebot_datum')
    expect(getDatumForStatus('beauftragt')).toBe('beauftragt_datum')
    expect(getDatumForStatus('erledigt')).toBe('erledigt_datum')
    expect(getDatumForStatus('bezahlt')).toBe('bezahlt_datum')
  })

  it('returns null for branch statuses (they stamp no date)', () => {
    expect(getDatumForStatus('abgelehnt')).toBeNull()
    expect(getDatumForStatus('storniert')).toBeNull()
  })
})
