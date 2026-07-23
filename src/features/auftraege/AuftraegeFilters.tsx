import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ALL_STATUSES, type Status } from '@/domain/status'
import { STATUS_LABELS } from './auftrag-labels'
import type { KundeOption } from './AuftragForm'

export interface AuftraegeFilterState {
  status: Status | 'alle'
  /** A customer id, or the sentinel 'alle' for no customer filter. */
  kundeId: string
  von: string
  bis: string
}

interface AuftraegeFiltersProps {
  value: AuftraegeFilterState
  onChange: (next: AuftraegeFilterState) => void
  kundenOptions: KundeOption[]
}

export function AuftraegeFilters({
  value,
  onChange,
  kundenOptions,
}: AuftraegeFiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-1.5">
        <Label htmlFor="filter-status">Status</Label>
        <Select
          value={value.status}
          onValueChange={(status) =>
            onChange({ ...value, status: status as Status | 'alle' })
          }
        >
          <SelectTrigger id="filter-status" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle Status</SelectItem>
            {ALL_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="filter-kunde">Kunde</Label>
        <Select
          value={value.kundeId}
          onValueChange={(kundeId) => onChange({ ...value, kundeId })}
        >
          <SelectTrigger id="filter-kunde" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle Kunden</SelectItem>
            {kundenOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="filter-von">Erstellt von</Label>
        <Input
          id="filter-von"
          type="date"
          value={value.von}
          onChange={(event) => onChange({ ...value, von: event.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="filter-bis">Erstellt bis</Label>
        <Input
          id="filter-bis"
          type="date"
          value={value.bis}
          onChange={(event) => onChange({ ...value, bis: event.target.value })}
        />
      </div>
    </div>
  )
}
