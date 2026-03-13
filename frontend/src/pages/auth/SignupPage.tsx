import { AxiosError } from "axios";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/useAuth";

export default function SignupPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (auth.isAuthenticated) {
    return <Navigate replace to="/" />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="card-shell w-full max-w-md space-y-5">
        <div>
          <h1 className="text-3xl font-semibold">Sign Up</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Create an account and verify your email before logging in.
          </p>
        </div>

        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setError("");
            setMessage("");
            setSubmitting(true);
            try {
              const payload = await auth.signup({
                email,
                confirm_email: confirmEmail,
                password,
              });
              const previewCode = payload.verification_code ? ` Verification code: ${payload.verification_code}` : "";
              setMessage(`${payload.message}${previewCode}`);
              navigate(`/verify-email?email=${encodeURIComponent(payload.email)}`, { replace: true, state: { previewCode: payload.verification_code } });
            } catch (err) {
              const detail =
                err instanceof AxiosError
                  ? (err.response?.data?.detail as string | undefined) ?? "Unable to signup"
                  : "Unable to signup";
              setError(detail);
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
            <span className="text-sm text-[var(--text-secondary)]">Confirm Email</span>
            <input
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3"
              onChange={(event) => setConfirmEmail(event.target.value)}
              type="email"
              value={confirmEmail}
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-[var(--text-secondary)]">Password</span>
            <input
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </label>

          {message ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
          {error ? <div className="rounded-xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger-text)]">{error}</div> : null}

          <button
            className="w-full rounded-xl bg-[var(--accent-primary)] px-5 py-3 font-semibold text-[var(--text-on-accent)] transition-all duration-200 hover:bg-[var(--accent-primary-strong)] disabled:opacity-70"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-sm text-[var(--text-secondary)]">
          Already have an account?{" "}
          <Link className="font-semibold text-[var(--accent-primary)] hover:underline" to="/login">
            Login
          </Link>
        </p>
      </section>
    </div>
  );
}
