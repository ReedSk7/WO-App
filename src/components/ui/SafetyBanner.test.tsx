import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SafetyBanner } from './SafetyBanner';

describe('SafetyBanner', () => {
  it('renders warning text accessibly', () => {
    render(<SafetyBanner />);
    expect(screen.getByRole('heading', { name: /draft planning content only/i })).toBeInTheDocument();
    expect(screen.getByText(/qualified planner review/i)).toBeInTheDocument();
  });
});
