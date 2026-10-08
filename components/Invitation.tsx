'use client';

import { useCallback, useEffect, useState } from 'react';
import { EnvelopeGate } from '@/components/gate/EnvelopeGate';
import { OrnamentDefs } from '@/components/ornaments';
import { PetalCanvas } from '@/components/ui/PetalCanvas';
import { SoundButton } from '@/components/ui/SoundButton';
import { Reactions } from '@/components/ui/Reactions';
import { RsvpChip } from '@/components/ui/RsvpChip';
import { Blessing } from '@/components/sections/Blessing';
import { Hero } from '@/components/sections/Hero';
import { ScratchDate } from '@/components/sections/ScratchDate';
import { Countdown } from '@/components/sections/Countdown';
import { Mantra } from '@/components/sections/Mantra';
import { Memories } from '@/components/sections/Memories';
import { Festivities } from '@/components/sections/Festivities';
import { Venue } from '@/components/sections/Venue';
import { Rsvp } from '@/components/sections/Rsvp';
import { Shagun } from '@/components/sections/Shagun';
import { Closing } from '@/components/sections/Closing';
import { activeTrack, mergeConfig, readDraft } from '@/lib/content';
import { music } from '@/lib/audio';
import type { WeddingConfig } from '@/lib/types';

const SESSION_KEY = 'mewar:opened';

export function Invitation({ config: committed }: { config: WeddingConfig }) {
  // A Content Studio draft, if this browser has one, is layered over the
  // committed config. Guests never have one, so they see the published site.
  const [config, setConfig] = useState(committed);

  /**
   * The gate renders on the server and in the first client render, so the
   * envelope is painted from the HTML alone — before any JavaScript arrives.
   * Returning visitors never see it, because the inline script in the layout
   * sets data-opened on <html> and the CSS hides it before first paint.
   */
  const [gateOpen, setGateOpen] = useState(true);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const draft = readDraft();
    if (draft) setConfig(mergeConfig(committed, draft));
  }, [committed]);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      /* private mode — showing the opening is the nicer failure */
    }
    const replay = new URLSearchParams(window.location.search).get('replay') === '1';
    if (seen && !replay) {
      setGateOpen(false);
      setRevealed(true);
    }
  }, []);

  useEffect(() => {
    const track = activeTrack(config);
    if (track) music.load(track);
  }, [config]);

  // The page behind the gate must not scroll while the envelope is up. The
  // CSS does this from the <html> attribute too, so it holds before hydration.
  useEffect(() => {
    document.body.dataset.locked = revealed ? 'false' : 'true';
    return () => {
      document.body.dataset.locked = 'false';
    };
  }, [revealed]);

  useEffect(() => {
    const onVis = () => music.handleVisibility(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const onReveal = useCallback(() => {
    setRevealed(true);
    // Deliberately not setting data-opened here: that attribute hides the gate
    // outright, and the card is still scaling up through the vortex.
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* nothing to remember */
    }
  }, []);

  const onFinished = useCallback(() => setGateOpen(false), []);

  const { features, theme } = config;

  return (
    <>
      <OrnamentDefs />

      {gateOpen && (
        <EnvelopeGate
          monogram={config.couple.monogram}
          sealStyle={config.intro.sealStyle}
          tapHint={config.intro.tapHint}
          deity={config.intro.deity}
          deityImage={config.intro.deityImage}
          salutation={config.invitation.mantra.salutation}
          mantraLines={config.invitation.mantra.lines}
          onReveal={onReveal}
          onFinished={onFinished}
        />
      )}

      <div className="stage">
        <main className="reel" data-revealed={revealed ? 'true' : undefined}>
          <Blessing config={config} />
          <Hero config={config} />
          <ScratchDate config={config} />
          {features.countdown && <Countdown config={config} />}
          {features.gallery && <Memories config={config} />}
          <Festivities config={config} />
          <Venue config={config} />
          {/* The invocation, just before the ask. */}
          <Mantra config={config} />
          <Rsvp config={config} />
          {features.shagun && <Shagun config={config} />}
          <Closing config={config} />
        </main>
      </div>

      {/* Petals sit above the page but below every control. */}
      <PetalCanvas
        enabled={theme.petals.enabled && revealed}
        density={theme.petals.density}
        colors={theme.petals.colors}
      />

      {revealed && (
        <>
          <SoundButton hasTrack={Boolean(activeTrack(config))} />
          <Reactions enabled={features.reactions} />
          <RsvpChip enabled={config.rsvp.enabled} />
        </>
      )}
    </>
  );
}
