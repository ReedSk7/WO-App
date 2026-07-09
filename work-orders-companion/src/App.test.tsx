import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

async function startDashboard(input = 'DEMO-CR-1001') {
  const user = userEvent.setup();
  render(<App />);

  await user.selectOptions(screen.getByRole('combobox', { name: /^Site$/i }), 'HATCH-U1');
  await user.type(screen.getByLabelText(/CR, WO, PM, or condition note/i), input);
  await user.click(screen.getByRole('button', { name: /Analyze record/i }));

  return user;
}

describe('CR Planning Companion', () => {
  it('requires controlled entrance values before opening the dashboard', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole('heading', { name: /Select SNC site and source record/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Plant Hatch' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Plant Farley' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Vogtle 1/2' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Vogtle 3/4' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Plant Hatch Unit 1/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Analyze record/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/Select a site/i);
  });

  it('opens the CR dashboard and avoids old WR terminology', async () => {
    await startDashboard();

    expect(screen.getByRole('heading', { name: /CR Details - DEMO-CR-1001/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Planner Command Center/i })).toBeInTheDocument();
    expect(screen.getByText(/Databricks Agent Output/i)).toBeInTheDocument();
    expect(screen.queryByText(/\bWR\b/)).not.toBeInTheDocument();
  });

  it('updates the details panel when a source record row is selected', async () => {
    const user = await startDashboard();

    await user.click(screen.getByRole('button', { name: /Select DEMO-PM-2001/i }));

    expect(screen.getByRole('heading', { name: /PM Planning Record - DEMO-PM-2001/i })).toBeInTheDocument();
    expect(screen.getByText(/Missed milestone on preventive maintenance activity/i)).toBeInTheDocument();
    expect(screen.getByText(/Recommended WO type DL - Delinquent Maintenance/i)).toBeInTheDocument();
  });

  it('adds a local demo condition report from the Add CR flow', async () => {
    const user = await startDashboard();

    await user.click(screen.getByRole('button', { name: /Add CR/i }));
    await user.clear(screen.getByLabelText(/Description/i));
    await user.type(screen.getByLabelText(/Description/i), 'Demo breaker cabinet inspection note');
    await user.click(screen.getByRole('button', { name: /Add demo CR/i }));

    expect(screen.getByRole('heading', { name: /CR Details - DEMO-CR-0436/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Demo breaker cabinet inspection note/i).length).toBeGreaterThan(0);
  });
});
