/**
 * The envelope's embossed floral paper.
 *
 * Blind deboss on thick cotton stock: the motif is the *same colour as the
 * sheet*. All you ever see is a soft highlight along the edge facing the light
 * and a soft shadow along the edge facing away.
 *
 * The trick is to light the shape twice from opposite sides and show only
 * those two passes. Filling the motif's interior with a dark colour — the
 * obvious approach — is what makes an emboss read as printed ink instead.
 */
export function EmbossPattern({ id = 'emboss', opacity = 1 }: { id?: string; opacity?: number }) {
  const pid = `${id}-pattern`;
  const fid = `${id}-filter`;

  // Fuller, rounder petals press better than narrow ones.
  const petal = 'M0 0 C -10 -7 -11 -20 0 -26 C 11 -20 10 -7 0 0 Z';

  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 390 844"
      style={{ opacity }}
    >
      <defs>
        <pattern id={pid} width="252" height="318" patternUnits="userSpaceOnUse">
          {/* Thick, soft strokes — a die presses a rounded shoulder, not a line. */}
          <g fill="none" stroke="#fff" strokeWidth="2.9" strokeLinecap="round" strokeLinejoin="round">
            <g transform="translate(50 64)">
              {[0, 72, 144, 216, 288].map((a) => (
                <path key={a} d={petal} transform={`rotate(${a})`} />
              ))}
              <circle cx="0" cy="0" r="3.4" />
            </g>

            {/* A sprig of three leaves */}
            <g transform="translate(176 40)">
              <path d="M0 0 C 4 20 6 40 4 60" />
              <path d="M1 14 C -12 10 -18 1 -16 -7 C -7 -7 0 3 1 14 Z" />
              <path d="M3 34 C 16 30 22 21 20 13 C 11 13 4 23 3 34 Z" />
              <path d="M4 52 C -9 48 -15 39 -13 31 C -4 31 3 41 4 52 Z" />
            </g>

            {/* A closed bud */}
            <g transform="translate(206 186)">
              <path d="M0 0 C -9 -6 -11 -18 -6 -25 C -2 -20 1 -12 0 0 Z" />
              <path d="M3 0 C 12 -6 14 -18 9 -25 C 5 -20 2 -12 3 0 Z" />
              <path d="M1.5 0 C 1.5 12 1.5 21 0 29" />
            </g>

            <g transform="translate(92 232) scale(0.82)">
              {[26, 98, 170, 242, 314].map((a) => (
                <path key={a} d={petal} transform={`rotate(${a})`} />
              ))}
              <circle cx="0" cy="0" r="3.4" />
            </g>

            {/* Seeds, scattered off the grid */}
            <circle cx="138" cy="128" r="2" />
            <circle cx="154" cy="144" r="1.5" />
            <circle cx="30" cy="162" r="1.7" />
            <circle cx="224" cy="112" r="1.8" />
            <circle cx="158" cy="276" r="1.7" />
          </g>
        </pattern>

        <filter id={fid} x="-2%" y="-2%" width="104%" height="104%" colorInterpolationFilters="sRGB">
          {/* A generous blur gives the die a rounded shoulder, so the light
              rolls across the edge instead of hitting a cliff. */}
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.65" result="bump" />

          {/* The edge turned toward the light. */}
          <feSpecularLighting
            in="bump"
            surfaceScale="2.4"
            specularConstant="0.8"
            specularExponent="20"
            lightingColor="#ffd2b4"
            result="lit"
          >
            <feDistantLight azimuth="232" elevation="44" />
          </feSpecularLighting>

          {/* The edge turned away. Lit in white so the pass keeps a usable
              alpha, then tinted to the colour of a shadow in the paper —
              a dark lightingColor would come back almost fully transparent. */}
          <feSpecularLighting
            in="bump"
            surfaceScale="2.4"
            specularConstant="0.72"
            specularExponent="20"
            lightingColor="#ffffff"
            result="away"
          >
            <feDistantLight azimuth="52" elevation="44" />
          </feSpecularLighting>
          <feColorMatrix
            in="away"
            type="matrix"
            values="0 0 0 0 0.14
                    0 0 0 0 0.012
                    0 0 0 0 0.035
                    0 0 0 0.95 0"
            result="shade"
          />

          {/* Nothing else is drawn: the paper itself shows between the two. */}
          <feMerge>
            <feMergeNode in="shade" />
            <feMergeNode in="lit" />
          </feMerge>
        </filter>
      </defs>

      <rect width="390" height="844" fill={`url(#${pid})`} filter={`url(#${fid})`} />
    </svg>
  );
}
