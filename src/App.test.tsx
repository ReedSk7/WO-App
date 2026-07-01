import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from './App';

afterEach(() => {
  cleanup();
});

describe('planner MVP app shell', () => {
  it('renders the simple intake screen without the old multi-page navigation', () => {
    render(<App />);

    expect(screen.getByRole('link', { name: 'Skip to main content' })).toBeInTheDocument();
    expect(screen.getByLabelText('paste or type CR/MPL/Work order number')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Analyze' })).toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Sample CR Library')).not.toBeInTheDocument();
    expect(screen.queryByText('Maximo Field Builder')).not.toBeInTheDocument();
  });

  it('analyzes a fake sample and shows the Maximo-style tabs in order', async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText('paste or type CR/MPL/Work order number'), {
      target: { value: 'DEMO-CR-1001' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));

    expect(await screen.findByRole('heading', { name: 'Demo pump seal leakage planning review' })).toBeInTheDocument();
    expect(screen.getByText('CR record: DEMO-CR-1001')).toBeInTheDocument();
    expect(
      screen.getAllByText('Draft only. Not approved for execution. Requires qualified planner review and applicable organizational approvals.').length,
    ).toBeGreaterThan(0);

    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'Workorder',
      'Plans',
      'Reviews',
      'Engineering',
      'Scheduling',
      'Logic',
      'Related Records',
      'Actuals',
      'Safety Plan',
      'Impact Plans',
      'Log',
      'Specifications',
    ]);
  });

  it('uses a conservative generic package when no fake sample matches', async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText('paste or type CR/MPL/Work order number'), {
      target: { value: 'demo unknown condition for planner review' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));

    expect(await screen.findByRole('heading', { name: 'Generic demo planner review package' })).toBeInTheDocument();
    expect(screen.getByText('Generic fallback')).toBeInTheDocument();
    expect(screen.getAllByText('Needs planner confirmation').length).toBeGreaterThan(0);
  });
});
