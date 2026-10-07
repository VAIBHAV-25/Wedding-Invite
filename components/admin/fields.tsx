'use client';

/** The small form primitives the Content Studio is built from. */

export function Text({
  label,
  value,
  onChange,
  placeholder,
  hint,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  type?: string;
}) {
  return (
    <label className="af">
      <span className="af-label">{label}</span>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      {hint && <span className="af-hint">{hint}</span>}
    </label>
  );
}

export function Area({
  label,
  value,
  onChange,
  rows = 3,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
}) {
  return (
    <label className="af">
      <span className="af-label">{label}</span>
      <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
      {hint && <span className="af-hint">{hint}</span>}
    </label>
  );
}

export function Pick<T extends string>({
  label,
  value,
  options,
  onChange,
  hint,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  hint?: string;
}) {
  return (
    <label className="af">
      <span className="af-label">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && <span className="af-hint">{hint}</span>}
    </label>
  );
}

export function Toggle({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="af af-toggle">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <span className="af-label">{label}</span>
        {hint && <span className="af-hint">{hint}</span>}
      </span>
    </label>
  );
}

export function Colour({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="af af-colour">
      <span className="af-label">{label}</span>
      <span className="af-colour-row">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} />
      </span>
    </label>
  );
}

/** A collapsible group, so the whole form is not one endless scroll. */
export function Group({
  title,
  children,
  open = false,
}: {
  title: string;
  children: React.ReactNode;
  open?: boolean;
}) {
  return (
    <details className="ag" open={open}>
      <summary>{title}</summary>
      <div className="ag-body">{children}</div>
    </details>
  );
}

export function Row({ children }: { children: React.ReactNode }) {
  return <div className="af-row">{children}</div>;
}
