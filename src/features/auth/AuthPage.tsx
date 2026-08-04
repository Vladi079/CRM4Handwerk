import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './use-auth'
import { CredentialsForm } from './CredentialsForm'
import { DEMO_EMAIL, DEMO_PASSWORD } from './demo'
import { Button } from '@/components/ui/button'
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
  const [guestLoading, setGuestLoading] = useState(false)
  const [guestError, setGuestError] = useState<string | null>(null)

  if (user) {
    return <Navigate to="/" replace />
  }

  const loginAsGuest = async () => {
    setGuestError(null)
    setGuestLoading(true)
    const { error } = await signIn(DEMO_EMAIL, DEMO_PASSWORD)
    if (error) {
      // On success the redirect above unmounts this component.
      setGuestError(error)
      setGuestLoading(false)
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            CRM4Handwerk
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

          <div className="relative my-4" aria-hidden>
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card text-muted-foreground px-2">oder</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => void loginAsGuest()}
            disabled={guestLoading}
          >
            {guestLoading ? 'Wird geladen …' : 'Als Gast testen'}
          </Button>
          <p className="text-muted-foreground mt-2 text-center text-xs">
            Mit Beispieldaten – ganz ohne Registrierung.
          </p>
          {guestError && (
            <p role="alert" className="text-destructive mt-2 text-sm">
              {guestError}
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
