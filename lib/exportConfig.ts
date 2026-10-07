import type { WeddingConfig } from './types';

/**
 * Serialises a config back into the `config/wedding.config.ts` file.
 *
 * The Content Studio edits a draft in the browser; this is how that draft
 * becomes something you can commit and deploy. Keeping the output as the same
 * TypeScript file means there is still exactly one source of truth, and it
 * stays readable and hand-editable afterwards.
 */

function quote(value: string): string {
  // Single-quoted with escapes, so newlines in the shloka survive the trip.
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '')}'`;
}

function render(value: unknown, indent: number): string {
  const pad = '  '.repeat(indent);
  const padIn = '  '.repeat(indent + 1);

  if (value === null) return 'null';
  if (typeof value === 'string') return quote(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const simple = value.every((v) => typeof v === 'string' || typeof v === 'number');
    if (simple) return `[${value.map((v) => render(v, 0)).join(', ')}]`;
    return `[\n${value.map((v) => `${padIn}${render(v, indent + 1)}`).join(',\n')},\n${pad}]`;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    const body = entries
      .map(([k, v]) => {
        // Quote keys only when they are not plain identifiers.
        const key = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) ? k : `'${k}'`;
        return `${padIn}${key}: ${render(v, indent + 1)}`;
      })
      .join(',\n');
    return `{\n${body},\n${pad}}`;
  }

  return 'undefined';
}

export function toConfigFile(config: WeddingConfig): string {
  return `import type { WeddingConfig } from '@/lib/types';

/* ============================================================================
 *  EVERY WORD, DATE, COLOUR, PHOTO, SONG AND LINK ON THIS SITE LIVES HERE.
 *
 *  Exported from the Content Studio at /admin on ${new Date().toISOString().slice(0, 10)}.
 *  Replace config/wedding.config.ts with this file and redeploy.
 * ========================================================================== */

export const wedding: WeddingConfig = ${render(config, 0)};

export default wedding;
`;
}

export function download(filename: string, contents: string, type = 'text/plain'): void {
  const blob = new Blob([contents], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
