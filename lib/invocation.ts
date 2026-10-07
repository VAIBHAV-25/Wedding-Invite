import type { Deity } from './types';

/**
 * The invocation that goes with each deity, so changing `intro.deity` keeps
 * the envelope crest and the blessing section saying the same thing.
 *
 * Anything you write in `invitation.shloka` overrides this.
 */
export const INVOCATIONS: Record<Exclude<Deity, 'none'>, {
  shloka: string;
  transliteration: string;
  english: string;
  salutation: string;
}> = {
  ganesha: {
    shloka: '॥ श्री गणेशाय नमः ॥\nवक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।\nनिर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥',
    transliteration:
      'Vakratunda Mahakaya Suryakoti Samaprabha · Nirvighnam Kuru Me Deva Sarvakaryeshu Sarvada',
    english:
      'O Lord of the curved trunk, radiant as a million suns, keep our path free of obstacles, always.',
    salutation: 'With the blessings of Lord Ganesha',
  },
  mahavira: {
    shloka: '॥ श्री महावीराय नमः ॥\nणमो अरिहंताणं, णमो सिद्धाणं।\nअहिंसा परमो धर्मः॥',
    transliteration: 'Namo Arihantanam · Namo Siddhanam · Ahimsa Paramo Dharmah',
    english:
      'Reverence to the enlightened and the liberated. Non-violence is the highest of all virtues.',
    salutation: 'With the blessings of Bhagwan Mahavir',
  },
};

export function invocationFor(deity: Deity) {
  return deity === 'none' ? null : INVOCATIONS[deity];
}
