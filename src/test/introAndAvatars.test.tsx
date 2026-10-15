import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SPROUTY_TIPS, nextTipOrder } from '../data/sproutyTips';
import { AVATAR_CHARACTERS, isKnownAvatar } from '../data/avatars';
import { CharacterAvatar } from '../components/avatar/CharacterAvatar';

describe('Sprouty tips', () => {
  it('each round shows every tip exactly once', () => {
    const order = nextTipOrder(SPROUTY_TIPS.length);
    expect([...order].sort((a, b) => a - b)).toEqual(SPROUTY_TIPS.map((_, i) => i));
  });

  it('never repeats a tip across the boundary between rounds', () => {
    let last = -1;
    for (let round = 0; round < 200; round++) {
      const order = nextTipOrder(SPROUTY_TIPS.length, last < 0 ? undefined : last);
      expect(order[0]).not.toBe(last);
      for (let i = 1; i < order.length; i++) expect(order[i]).not.toBe(order[i - 1]);
      last = order[order.length - 1];
    }
  });

  it('tips are unique', () => {
    const texts = SPROUTY_TIPS.map((t) => `${t.lead}${t.hl}${t.tail ?? ''}`);
    expect(new Set(texts).size).toBe(texts.length);
  });
});

describe('avatars', () => {
  it('has 16 characters with unique ids and names', () => {
    expect(AVATAR_CHARACTERS).toHaveLength(16);
    expect(new Set(AVATAR_CHARACTERS.map((a) => a.id)).size).toBe(16);
    expect(new Set(AVATAR_CHARACTERS.map((a) => a.name)).size).toBe(16);
  });

  it('keeps every id that saved profiles may already use', () => {
    for (const id of ['avatar-leaf', 'avatar-tree', 'avatar-flower', 'avatar-earth', 'avatar-water', 'avatar-sun', 'avatar-rain', 'avatar-mountain']) {
      expect(isKnownAvatar(id)).toBe(true);
    }
  });

  it('every character renders in both framings', () => {
    for (const a of AVATAR_CHARACTERS) {
      const { container, unmount } = render(
        <>
          <CharacterAvatar look={a.look} title={a.name} />
          <CharacterAvatar look={a.look} framing="bust" />
        </>,
      );
      expect(container.querySelectorAll('svg')).toHaveLength(2);
      unmount();
    }
  });
});
