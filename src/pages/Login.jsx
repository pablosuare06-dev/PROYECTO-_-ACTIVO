import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { auth } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, Mail, Lock, Loader2, Shield } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { loginSchema, recordFormView, checkFormSubmissionTiming, validateHoneypot } from "@/lib/security";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAuthorizationCode, setShowAuthorizationCode] = useState(false);

  // Record form view time for anti-bot detection
  useEffect(() => {
    recordFormView('login-form');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Anti-bot: Check honeypot
    if (!validateHoneypot('email-confirm', honeypot)) {
      console.warn('Honeypot triggered');
      return;
    }

    // Anti-bot: Check form submission timing (minimum 2 seconds)
    const timingCheck = checkFormSubmissionTiming('login-form', 2000);
    if (!timingCheck.valid) {
      setError("Please wait before submitting");
      return;
    }

    // Validate input with Zod
    try {
      loginSchema.parse({ email, password });
    } catch (validationErr) {
      setError(validationErr.errors[0]?.message || "Invalid input");
      return;
    }

    setLoading(true);
    try {
      await auth.loginViaEmailPassword(email, password);
      setShowAuthorizationCode(true);
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorizationSubmit = (e) => {
    e.preventDefault();
    if (authCode.trim()) {
      window.location.href = "/";
    } else {
      setError("Please enter the authorization code");
    }
  };

  const handleGoogle = () => {
    auth.loginWithProvider("google", "/");
  };

  if (showAuthorizationCode) {
    return (
      <AuthLayout
        icon={Shield}
        title="Authorization Required"
        subtitle="Complete your login"
        footer={null}
      >
        <Card className="border-0 bg-transparent shadow-none">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-lg font-semibold">
              Por su seguridad introduzca el código de autorización que enviamos a su <strong className="text-black">CORREO</strong> o <strong className="text-black">SMS</strong> para completar el inicio de sesión
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleAuthorizationSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="authCode">Código de Autorización</Label>
                <Input
                  id="authCode"
                  type="text"
                  placeholder="Ingrese el código"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  className="h-12"
                  required
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 font-medium"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  "Aceptar"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={LogIn}
      title="Welcome back"
      subtitle="Log in to your account"
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium mb-6"
        onClick={handleGoogle}
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        Continue with Google
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">or</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot field (hidden from real users) */}
        <input
          type="text"
          name="email-confirm"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          style={{ display: 'none', visibility: 'hidden' }}
          tabIndex="-1"
          autoComplete="off"
          aria-hidden="true"
        />

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Logging in...
            </>
          ) : (
            "Log in"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
