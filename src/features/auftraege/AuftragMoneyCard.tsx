import {
  calculateBruttoCents,
  calculateMwstCents,
  effectiveMwstSatz,
  euroToCents,
} from '@/domain/money'
import { formatCurrency } from '@/lib/formatters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Auftrag } from './auftraege-queries'

/** Net / VAT / gross breakdown. Kleinunternehmer (§19 UStG) forces the rate to 0. */
export function AuftragMoneyCard({
  auftrag,
  kleinunternehmer,
}: {
  auftrag: Auftrag
  kleinunternehmer: boolean
}) {
  const nettoCents = euroToCents(auftrag.betrag_netto)
  const satz = effectiveMwstSatz(auftrag.mwst_satz, kleinunternehmer)
  const mwstCents = calculateMwstCents(nettoCents, satz)
  const bruttoCents = calculateBruttoCents(nettoCents, satz)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Betrag</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <Row label="Netto" value={formatCurrency(nettoCents)} />
        <Row label={`MwSt. (${satz} %)`} value={formatCurrency(mwstCents)} />
        <div className="border-t pt-2">
          <Row label="Brutto" value={formatCurrency(bruttoCents)} strong />
        </div>
        {kleinunternehmer && (
          <p className="text-muted-foreground pt-2 text-xs">
            Kein Ausweis von Umsatzsteuer gemäß §19 UStG
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function Row({
  label,
  value,
  strong,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={strong ? 'font-medium' : 'text-muted-foreground'}>
        {label}
      </span>
      <span className={strong ? 'font-semibold tabular-nums' : 'tabular-nums'}>
        {value}
      </span>
    </div>
  )
}
