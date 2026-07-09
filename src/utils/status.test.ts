import { describe, expect, it } from 'vitest';
import type { MissingInfoItem } from '../types';
import { deriveDraftStatus } from './status';

const blocking: MissingInfoItem = { id: 'missing-cr', message: 'Missing CR number.', severity: 'blocking' };
const caution: MissingInfoItem = { id: 'missing-pmt', message: 'PMT placeholder.', severity: 'caution' };

describe('deriveDraftStatus', () => {
  it('returns Needs Info when blocking flags exist', () => {
    expect(deriveDraftStatus([blocking], 100)).toBe('Needs Info');
  });

  it('returns Draft when no blocking flags and checklist is below threshold', () => {
    expect(deriveDraftStatus([caution], 79)).toBe('Draft');
  });

  it('returns Review Ready when no blocking flags and checklist meets threshold', () => {
    expect(deriveDraftStatus([caution], 80)).toBe('Review Ready');
  });
});
