import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { formatDate } from '@/lib/formatters'
import { useCreateNotiz, useDeleteNotiz, useNotizen } from './notizen-queries'

export function AuftragNotizen({ auftragId }: { auftragId: string }) {
  const { data: notizen, isLoading } = useNotizen(auftragId)
  const createNotiz = useCreateNotiz(auftragId)
  const deleteNotiz = useDeleteNotiz(auftragId)
  const [text, setText] = useState('')

  const submit = async () => {
    const trimmed = text.trim()
    if (!trimmed) return
    await createNotiz.mutateAsync(trimmed)
    setText('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Notizen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void submit()
          }}
          className="space-y-2"
        >
          <Textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={2}
            aria-label="Neue Notiz"
            placeholder="Notiz hinzufügen …"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={createNotiz.isPending || text.trim().length === 0}
            >
              Hinzufügen
            </Button>
          </div>
        </form>

        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : notizen && notizen.length > 0 ? (
          <ul className="space-y-3">
            {notizen.map((notiz) => (
              <li
                key={notiz.id}
                className="flex items-start justify-between gap-3 border-t pt-3"
              >
                <div className="min-w-0">
                  <p className="text-sm whitespace-pre-wrap">{notiz.text}</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {formatDate(notiz.created_at.slice(0, 10))}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0"
                  aria-label="Notiz löschen"
                  disabled={deleteNotiz.isPending}
                  onClick={() => void deleteNotiz.mutateAsync(notiz.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">Noch keine Notizen.</p>
        )}
      </CardContent>
    </Card>
  )
}
