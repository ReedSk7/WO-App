import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('Work Orders Companion', () => {
  it('updates the details panel when a work request row is selected', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole('heading', { name: /WR Details - WR-2026-0412/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Select WR-2026-0398/i }));

    expect(screen.getByRole('heading', { name: /WR Details - WR-2026-0398/i })).toBeInTheDocument();
    expect(screen.getByText(/Missed milestone on PM activity/i)).toBeInTheDocument();
    expect(screen.getByText(/Recommended type DL - Delinquent Maintenance/i)).toBeInTheDocument();
  });

  it('adds a local demo work request from the Add WR flow', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /Add WR/i }));
    await user.clear(screen.getByLabelText(/Description/i));
    await user.type(screen.getByLabelText(/Description/i), 'Demo breaker cabinet inspection note');
    await user.click(screen.getByRole('button', { name: /Add demo WR/i }));

    expect(screen.getByRole('heading', { name: /WR Details - WR-2026-0436/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Demo breaker cabinet inspection note/i).length).toBeGreaterThan(0);
  });
});
