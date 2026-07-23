import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './use-auth'
import { CredentialsForm } from './CredentialsForm'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

/** Login + registration screen. Redirects to the app once authenticated. */
export function AuthPage() {
  const { user, signIn, signUp } = useAuth()
  const [registerInfo, setRegisterInfo] = useState<string | null>(null)

  if (user) {
    return <Navigate to="/" replace />
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Handwerk CRM
          </h1>
          <CardDescription>
            Melde dich an oder erstelle ein Konto, um loszulegen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Anmelden</TabsTrigger>
              <TabsTrigger value="register">Registrieren</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="pt-4">
              <CredentialsForm
                submitLabel="Anmelden"
                pendingLabel="Wird angemeldet …"
                passwordAutoComplete="current-password"
                onSubmit={(values) => signIn(values.email, values.password)}
              />
            </TabsContent>

            <TabsContent value="register" className="pt-4">
              {registerInfo ? (
                <p role="status" className="text-muted-foreground text-sm">
                  {registerInfo}
                </p>
              ) : (
                <CredentialsForm
                  submitLabel="Registrieren"
                  pendingLabel="Wird registriert …"
                  passwordAutoComplete="new-password"
                  onSubmit={async (values) => {
                    const result = await signUp(values.email, values.password)
                    if (!result.error) {
                      setRegisterInfo(
                        'Registrierung erfolgreich. Falls erforderlich, ' +
                          'bestätige bitte deine E-Mail-Adresse.',
                      )
                    }
                    return result
                  }}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  )
}
