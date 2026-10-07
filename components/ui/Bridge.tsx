/**
 * The soft join between a velvet section and the ivory above or below it.
 *
 * These are real elements rather than ::before/::after, because the velvet
 * surface already uses both of its pseudo-elements — one for the fibre grain,
 * one for the edge vignette — and reusing them silently erased the texture.
 */
export function Bridge({ edge }: { edge: 'top' | 'bottom' | 'both' }) {
  return (
    <>
      {(edge === 'top' || edge === 'both') && <span className="bridge bridge-top" aria-hidden="true" />}
      {(edge === 'bottom' || edge === 'both') && <span className="bridge bridge-bottom" aria-hidden="true" />}
    </>
  );
}
