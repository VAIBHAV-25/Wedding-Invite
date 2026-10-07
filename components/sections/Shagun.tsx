'use client';

import { useEffect, useRef, useState } from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { upiUrl, inr } from '@/lib/share';
import { useReveal } from '@/lib/hooks';
import type { WeddingConfig } from '@/lib/types';

/**
 * The UPI QR is generated in the guest's own browser from the couple's UPI id.
 * No payment ever touches this site and nothing is recorded.
 */
export function Shagun({ config }: { config: WeddingConfig }) {
  const { shagun, couple } = config;
  const [amount, setAmount] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [dataUrl, setDataUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { ref, revealed } = useReveal<HTMLDivElement>(0.1);

  const link = upiUrl({
    upiId: shagun.upiId,
    payeeName: shagun.payeeName,
    amount: amount ?? undefined,
    note: 'Shagun',
  });

  // The QR library is only fetched once this section is actually approached.
  useEffect(() => {
    if (!revealed || shagun.qrOverride || !shagun.upiId) return;
    let cancelled = false;
    void (async () => {
      const QRCode = (await import('qrcode')).default;
      const url = await QRCode.toDataURL(link, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 520,
        color: { dark: '#3A1A1A', light: '#FFF8EC' },
      });
      if (!cancelled) setDataUrl(url);
    })();
    return () => {
      cancelled = true;
    };
  }, [revealed, link, shagun.qrOverride, shagun.upiId]);

  /** Draws the monogram into the centre. Error correction H tolerates it. */
  useEffect(() => {
    const src = shagun.qrOverride || dataUrl;
    const canvas = canvasRef.current;
    if (!src || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const size = 260;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);

      // Keep the badge under a fifth of the area so scanners still read it.
      const badge = size * 0.19;
      const c = size / 2;
      ctx.fillStyle = '#FFF8EC';
      ctx.beginPath();
      ctx.arc(c, c, badge / 2 + 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#8A6A1C';
      ctx.font = `600 ${badge * 0.42}px Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(couple.monogram, c, c + 1);
    };
    img.src = src;
  }, [dataUrl, shagun.qrOverride, couple.monogram]);

  if (!shagun.enabled || !shagun.upiId) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shagun.upiId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard blocked — the id is on screen to copy by hand.
    }
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'shagun-qr.png';
    a.click();
  };

  return (
    <section className="sec ivory-field" id="shagun" ref={ref}>
      <SectionHeading label="If you wish to bless us" title="Shagun" lead={shagun.note} />

      <Reveal variant="scale">
        <div className="shagun-card double-gold">
          <canvas ref={canvasRef} className="qr" aria-label={`UPI QR code for ${shagun.payeeName}`} role="img" />

          <p className="upi-id">{shagun.upiId}</p>
          <p className="upi-payee t-caps">{shagun.payeeName}</p>

          {shagun.presets.length > 0 && (
            <div className="chips" role="group" aria-label="Choose an amount">
              {shagun.presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  className="chip"
                  data-selected={amount === p}
                  onClick={() => setAmount(amount === p ? null : p)}
                >
                  ₹{inr(p)}
                </button>
              ))}
              <button
                type="button"
                className="chip"
                data-selected={amount === null}
                onClick={() => setAmount(null)}
              >
                Any amount
              </button>
            </div>
          )}

          <div className="shagun-actions">
            <a className="btn-solid" href={link}>
              Pay with any UPI app
            </a>
            <button type="button" className="btn-ghost" onClick={copy}>
              {copied ? 'Copied' : 'Copy UPI ID'}
            </button>
            <button type="button" className="btn-ghost" onClick={download}>
              Download QR
            </button>
          </div>

          {shagun.secondary && (
            <p className="shagun-second">
              Or send to {shagun.secondary.payeeName}: <strong>{shagun.secondary.upiId}</strong>
            </p>
          )}

          <p className="shagun-trust">
            Payments go straight through your own UPI app. This site never sees or stores anything.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
