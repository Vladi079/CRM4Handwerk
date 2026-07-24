import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/use-auth'
import type { Tables, TablesUpdate } from '@/types/database'

export type Profile = Tables<'profiles'>

export const profileKeys = {
  detail: (userId: string | undefined) => ['profile', userId] as const,
}

/** The current user's profile (company settings). Auto-created on sign-up. */
export function useProfile() {
  const { user } = useAuth()
  return useQuery({
    queryKey: profileKeys.detail(user?.id),
    enabled: user !== null,
    queryFn: async (): Promise<Profile> => {
      if (!user) throw new Error('Nicht angemeldet.')
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (error) throw error
      return data
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (patch: TablesUpdate<'profiles'>): Promise<Profile> => {
      if (!user) throw new Error('Nicht angemeldet.')
      const { data, error } = await supabase
        .from('profiles')
        .update(patch)
        .eq('id', user.id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKeys.detail(user?.id), profile)
    },
  })
}
