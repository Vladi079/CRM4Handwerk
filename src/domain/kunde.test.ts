import type { Anrede, KundeTyp } from './kunde'
import { canDeleteKunde, kundeAnzeigename } from './kunde'
import type { Database } from '@/types/database'

// Compile-time guards: the domain value types must match the database columns.
type AssertEqual<A, B> = [A] extends [B]
  ? [B] extends [A]
    ? true
    : false
  : false
const _typMatchesDb: AssertEqual<
  KundeTyp,
  Database['public']['Tables']['kunden']['Row']['typ']
> = true
const _anredeMatchesDb: AssertEqual<
  Anrede,
  NonNullable<Database['public']['Tables']['kunden']['Row']['anrede']>
> = true
void _typMatchesDb
void _anredeMatchesDb

describe('kundeAnzeigename', () => {
  it('uses "Vorname Nachname" for private customers', () => {
    expect(
      kundeAnzeigename({
        typ: 'privat',
        firma_name: null,
        vorname: 'Anna',
        nachname: 'Bauer',
      }),
    ).toBe('Anna Bauer')
  })

  it('uses the company name for firms', () => {
    expect(
      kundeAnzeigename({
        typ: 'firma',
        firma_name: 'Bauer GmbH',
        vorname: 'Anna',
        nachname: 'Bauer',
      }),
    ).toBe('Bauer GmbH')
  })

  it('falls back to the person if a firm has no company name', () => {
    expect(
      kundeAnzeigename({
        typ: 'firma',
        firma_name: '   ',
        vorname: 'Anna',
        nachname: 'Bauer',
      }),
    ).toBe('Anna Bauer')
  })
})

describe('canDeleteKunde', () => {
  it('allows deleting a customer without jobs', () => {
    expect(canDeleteKunde(0)).toEqual({ allowed: true, reason: null })
  })

  it('blocks deletion and explains why (singular)', () => {
    const result = canDeleteKunde(1)
    expect(result.allowed).toBe(false)
    // "1 Auftrag und" — the singular count phrase, not "1 Aufträge".
    expect(result.reason).toContain('1 Auftrag und')
  })

  it('blocks deletion and explains why (plural)', () => {
    const result = canDeleteKunde(3)
    expect(result.allowed).toBe(false)
    expect(result.reason).toContain('3 Aufträge und')
  })
})
