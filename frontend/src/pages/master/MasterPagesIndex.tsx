import { Link } from "react-router-dom";

import { useMasterOptions } from "../../api/masterOptions";
import {
  MASTER_FIELD_DESCRIPTIONS,
  MASTER_FIELD_KEYS,
  MASTER_FIELD_LABELS,
  MASTER_FIELD_ROUTE_LABELS,
} from "../../constants";

export default function MasterPagesIndex() {
  const query = useMasterOptions();

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold">Master Pages</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Manage reusable dropdown values from one place. New values added here appear across the app.
        </p>
      </section>

      {query.isError ? (
        <div className="card-shell border-[var(--danger-border)] bg-[var(--danger-soft)] text-sm text-[var(--danger-text)]">
          Unable to load master values. Please refresh and try again.
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {MASTER_FIELD_KEYS.map((fieldKey) => (
          <Link
            key={fieldKey}
            className="card-shell group border-[var(--border)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-primary)] hover:shadow-[0_16px_30px_rgba(17,35,59,0.08)]"
            to={`/master-pages/${fieldKey}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{MASTER_FIELD_ROUTE_LABELS[fieldKey]}</h2>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{MASTER_FIELD_DESCRIPTIONS[fieldKey]}</p>
              </div>
              <span className="rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1 text-xs text-[var(--text-secondary)] group-hover:border-[var(--accent-primary)]">
                {MASTER_FIELD_LABELS[fieldKey]}
              </span>
            </div>
            <div className="mt-4">
              {query.isLoading ? (
                <span className="text-xs text-[var(--text-secondary)]">Loading options...</span>
              ) : (
                <span className="text-xs text-[var(--text-secondary)]">
                  {query.data?.[fieldKey]?.length ?? 0} values configured
                </span>
              )}
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
