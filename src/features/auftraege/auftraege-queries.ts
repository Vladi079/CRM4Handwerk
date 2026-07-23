import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/use-auth'
import { generateAuftragsnummer } from '@/domain/auftragsnummer'
import {
  toAuftragPayload,
  type Auftrag,
  type AuftragFormValues,
} from './auftrag-schema'

export type { Auftrag }

export const auftraegeKeys = {
  all: ['auftraege'] as const,
  list: () => [...auftraegeKeys.all, 'list'] as const,
  detail: (id: string) => [...auftraegeKeys.all, 'detail', id] as const,
}

/** Today's date as an ISO 'YYYY-MM-DD' string in local time. */
function todayIso(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

/** All jobs of the current user, newest first. RLS scopes the rows. */
export function useAuftraege() {
  return useQuery({
    queryKey: auftraegeKeys.list(),
    queryFn: async (): Promise<Auftrag[]> => {
      const { data, error } = await supabase
        .from('auftraege')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useAuftrag(id: string) {
  return useQuery({
    queryKey: auftraegeKeys.detail(id),
    queryFn: async (): Promise<Auftrag> => {
      const { data, error } = await supabase
        .from('auftraege')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
  })
}

export function useCreateAuftrag() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (values: AuftragFormValues): Promise<Auftrag> => {
      if (!user) throw new Error('Nicht angemeldet.')

      // Generate the next Auftragsnummer from the user's existing numbers.
      const { data: existing, error: readError } = await supabase
        .from('auftraege')
        .select('auftragsnummer')
      if (readError) throw readError
      const auftragsnummer = generateAuftragsnummer(
        existing.map((row) => row.auftragsnummer),
        new Date(),
      )

      // A new job starts as 'angebot'; entering a status stamps its date (see
      // getDatumForStatus) — for 'angebot' that is angebot_datum.
      const { data, error } = await supabase
        .from('auftraege')
        .insert({
          ...toAuftragPayload(values),
          owner_id: user.id,
          auftragsnummer,
          status: 'angebot',
          angebot_datum: todayIso(),
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: auftraegeKeys.list() })
    },
  })
}

export function useUpdateAuftrag(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: AuftragFormValues): Promise<Auftrag> => {
      const { data, error } = await supabase
        .from('auftraege')
        .update(toAuftragPayload(values))
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (auftrag) => {
      void queryClient.invalidateQueries({ queryKey: auftraegeKeys.list() })
      queryClient.setQueryData(auftraegeKeys.detail(id), auftrag)
    },
  })
}

export function useDeleteAuftrag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from('auftraege').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: auftraegeKeys.list() })
    },
  })
}
