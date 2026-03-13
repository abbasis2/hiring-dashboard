import { AxiosError } from "axios";
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/useAuth";

export default function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (auth.isAuthenticated) {
    return <Navigate replace to="/" />;
  }

  const returnTo = (location.state as { from?: string } | undefined)?.from ?? "/";
  const signupSuccess = (location.state as { signupSuccess?: string } | undefined)?.signupSuccess;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="card-shell w-full max-w-md space-y-5">
        <div>
          <h1 className="text-3xl font-semibold">Login</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Enter your account credentials to access the dashboard.</p>
        </div>

        {signupSuccess ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{signupSuccess}</div> : null}

        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setError("");
            setSubmitting(true);
            try {
              await auth.login(email, password);
              navigate(returnTo, { replace: true });
            } catch (err) {
              const message =
                err instanceof AxiosError
                  ? (err.response?.data?.detail as string | undefined) ?? "Unable to login"
                  : "Unable to login";
              setError(message);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <label className="space-y-2">
            <span className="text-sm text-[var(--text-secondary)]">Email</span>
            <input
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-[var(--text-secondary)]">Password</span>
            <input
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </label>

          {error ? <div className="rounded-xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger-text)]">{error}</div> : null}

          <button
            className="w-full rounded-xl bg-[var(--accent-primary)] px-5 py-3 font-semibold text-[var(--text-on-accent)] transition-all duration-200 hover:bg-[var(--accent-primary-strong)] disabled:opacity-70"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-sm text-[var(--text-secondary)]">
          New user?{" "}
          <Link className="font-semibold text-[var(--accent-primary)] hover:underline" to="/signup">
            Create an account
          </Link>
        </p>
      </section>
    </div>
  );
}
