import { AxiosError } from "axios";
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../../auth/useAuth";

export default function VerifyEmailPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const previewCode = (location.state as { previewCode?: string } | undefined)?.previewCode;

  if (auth.isAuthenticated) {
    return <Navigate replace to="/" />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="card-shell w-full max-w-md space-y-5">
        <div>
          <h1 className="text-3xl font-semibold">Verify Email</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Enter your email and the verification code to activate your account.
          </p>
        </div>

        {previewCode ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Local preview verification code: <span className="font-semibold">{previewCode}</span>
          </div>
        ) : null}

        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setError("");
            setMessage("");
            setSubmitting(true);
            try {
              await auth.verifyEmail(email, code);
              setMessage("Email verified. You can now login.");
              navigate("/login", { replace: true });
            } catch (err) {
              const detail =
                err instanceof AxiosError
                  ? (err.response?.data?.detail as string | undefined) ?? "Unable to verify email"
                  : "Unable to verify email";
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
            <span className="text-sm text-[var(--text-secondary)]">Verification Code</span>
            <input
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3"
              onChange={(event) => setCode(event.target.value)}
              value={code}
            />
          </label>

          {message ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
          {error ? <div className="rounded-xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger-text)]">{error}</div> : null}

          <button
            className="w-full rounded-xl bg-[var(--accent-primary)] px-5 py-3 font-semibold text-[var(--text-on-accent)] transition-all duration-200 hover:bg-[var(--accent-primary-strong)] disabled:opacity-70"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <p className="text-sm text-[var(--text-secondary)]">
          Back to{" "}
          <Link className="font-semibold text-[var(--accent-primary)] hover:underline" to="/login">
            Login
          </Link>
        </p>
      </section>
    </div>
  );
}
