import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/database'

export type Notiz = Tables<'notizen'>

export const notizenKeys = {
  list: (auftragId: string) => ['notizen', auftragId] as const,
}

/** Notes for a job, oldest first. RLS scopes them via the parent Auftrag. */
export function useNotizen(auftragId: string) {
  return useQuery({
    queryKey: notizenKeys.list(auftragId),
    queryFn: async (): Promise<Notiz[]> => {
      const { data, error } = await supabase
        .from('notizen')
        .select('*')
        .eq('auftrag_id', auftragId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data
    },
  })
}

export function useCreateNotiz(auftragId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (text: string): Promise<Notiz> => {
      const { data, error } = await supabase
        .from('notizen')
        .insert({ auftrag_id: auftragId, text })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: notizenKeys.list(auftragId),
      })
    },
  })
}

export function useDeleteNotiz(auftragId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from('notizen').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: notizenKeys.list(auftragId),
      })
    },
  })
}
