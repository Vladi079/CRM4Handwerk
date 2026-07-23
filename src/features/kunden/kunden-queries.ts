import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/use-auth'
import type { TablesUpdate } from '@/types/database'
import {
  toKundePayload,
  type Kunde,
  type KundeFormValues,
} from './kunde-schema'

export type { Kunde }

// Centralised query keys so lists and details are invalidated consistently.
export const kundenKeys = {
  all: ['kunden'] as const,
  list: () => [...kundenKeys.all, 'list'] as const,
  detail: (id: string) => [...kundenKeys.all, 'detail', id] as const,
  auftragCount: (id: string) =>
    [...kundenKeys.all, id, 'auftragCount'] as const,
}

/** All customers of the current user, ordered by surname. RLS scopes the rows. */
export function useKunden() {
  return useQuery({
    queryKey: kundenKeys.list(),
    queryFn: async (): Promise<Kunde[]> => {
      const { data, error } = await supabase
        .from('kunden')
        .select('*')
        .order('nachname', { ascending: true })
      if (error) throw error
      return data
    },
  })
}

/** A single customer by id. */
export function useKunde(id: string) {
  return useQuery({
    queryKey: kundenKeys.detail(id),
    queryFn: async (): Promise<Kunde> => {
      const { data, error } = await supabase
        .from('kunden')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
  })
}

/** How many jobs a customer has — needed for the deletion rule. */
export function useKundeAuftragCount(id: string, enabled = true) {
  return useQuery({
    queryKey: kundenKeys.auftragCount(id),
    enabled,
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabase
        .from('auftraege')
        .select('id', { count: 'exact', head: true })
        .eq('kunde_id', id)
      if (error) throw error
      return count ?? 0
    },
  })
}

export function useCreateKunde() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (values: KundeFormValues): Promise<Kunde> => {
      if (!user) throw new Error('Nicht angemeldet.')
      const { data, error } = await supabase
        .from('kunden')
        .insert({ ...toKundePayload(values), owner_id: user.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: kundenKeys.list() })
    },
  })
}

export function useUpdateKunde(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: KundeFormValues): Promise<Kunde> => {
      const payload: TablesUpdate<'kunden'> = toKundePayload(values)
      const { data, error } = await supabase
        .from('kunden')
        .update(payload)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (kunde) => {
      void queryClient.invalidateQueries({ queryKey: kundenKeys.list() })
      queryClient.setQueryData(kundenKeys.detail(id), kunde)
    },
  })
}

export function useDeleteKunde() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from('kunden').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: kundenKeys.list() })
    },
  })
}
