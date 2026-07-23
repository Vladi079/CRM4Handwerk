import { Link } from 'react-router-dom'
import { MoreHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { kundeAnzeigename } from '@/domain/kunde'
import type { Kunde } from './kunden-queries'

interface KundeListItemProps {
  kunde: Kunde
  onEdit: (kunde: Kunde) => void
  onDelete: (kunde: Kunde) => void
}

export function KundeListItem({ kunde, onEdit, onDelete }: KundeListItemProps) {
  const name = kundeAnzeigename(kunde)

  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border p-4">
      <Link to={`/kunden/${kunde.id}`} className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{name}</span>
          <Badge variant="secondary">
            {kunde.typ === 'firma' ? 'Firma' : 'Privat'}
          </Badge>
        </div>
        <p className="text-muted-foreground truncate text-sm">
          {[kunde.plz, kunde.ort].filter(Boolean).join(' ')}
        </p>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Aktionen für ${name}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => onEdit(kunde)}>
            Bearbeiten
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => onDelete(kunde)}
          >
            Löschen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  )
}
