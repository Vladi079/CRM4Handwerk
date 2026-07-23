import { z } from 'zod'

// Validation for both login and registration. Messages are in German because
// they are shown directly to the user.
export const credentialsSchema = z.object({
  email: z
    .string()
    .min(1, 'Bitte gib deine E-Mail-Adresse ein.')
    .email('Das ist keine gültige E-Mail-Adresse.'),
  // Supabase requires at least 6 characters by default.
  password: z
    .string()
    .min(6, 'Das Passwort muss mindestens 6 Zeichen lang sein.'),
})

export type Credentials = z.infer<typeof credentialsSchema>
