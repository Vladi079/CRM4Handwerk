import { QueryClient } from '@tanstack/react-query'

// One shared client for the app. Conservative defaults: data is fresh for a
// short while, one retry, and no refetch on window focus (a small CRM doesn't
// need aggressive background refetching).
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
