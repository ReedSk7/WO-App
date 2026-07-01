import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from './App';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('planner MVP app shell', () => {
  it('renders the simple intake screen without the old multi-page navigation', () => {
    render(<App />);

    expect(screen.getByRole('link', { name: 'Skip to main content' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Work Order Draft/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Review Work Order/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Research \/ Planning Basis/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /General Guidance/i })).toBeInTheDocument();
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
    expect(screen.getAllByText('Create Work Order Draft').length).toBeGreaterThan(0);
    expect(screen.getByText('Planning assistant guidance')).toBeInTheDocument();
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

  it('uses the selected response mode in the generated result', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Research \/ Planning Basis/i }));
    fireEvent.change(screen.getByLabelText('paste or type CR/MPL/Work order number'), {
      target: { value: 'DEMO-MPL-2001' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));

    expect(await screen.findByRole('heading', { name: 'Demo breaker inspection planning list item' })).toBeInTheDocument();
    expect(screen.getAllByText('Research / Planning Basis').length).toBeGreaterThan(0);
    expect(screen.getByText('No live system access, work authorization, or operability decision is represented.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Plans' }));
    expect((screen.getByLabelText('Planner edited version for Plans') as HTMLTextAreaElement).value).toContain(
      '- Treat history as context, not authority.',
    );
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

  it('shows generated output beside planner edits and summarizes changes before copy', async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText('paste or type CR/MPL/Work order number'), {
      target: { value: 'DEMO-CR-1001' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));

    const editBox = (await screen.findByLabelText('Planner edited version for Workorder')) as HTMLTextAreaElement;
    expect(screen.getByText('Generated output')).toBeInTheDocument();
    expect(screen.getByText('No planner edits on this tab yet.')).toBeInTheDocument();

    fireEvent.change(editBox, {
      target: { value: `${editBox.value}\nPlanner edit: confirm the approved source document before copy/paste.` },
    });

    expect(screen.getAllByText('Changed tabs: 1').length).toBeGreaterThan(0);
    expect(screen.getByText('Added: 1 | Removed: 0 | Changed: 0')).toBeInTheDocument();
    expect(screen.getByText('Line 12 added: Planner edit: confirm the approved source document before copy/paste.')).toBeInTheDocument();
  });

  it('saves planner edits and resumes them from local storage', async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText('paste or type CR/MPL/Work order number'), {
      target: { value: 'DEMO-WO-3001' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));

    const editBox = (await screen.findByLabelText('Planner edited version for Workorder')) as HTMLTextAreaElement;
    fireEvent.change(editBox, {
      target: { value: `${editBox.value}\nPlanner edit: preserve as-found notes for later review.` },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save progress' }));

    expect(screen.getByText('Progress saved')).toBeInTheDocument();

    cleanup();
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Resume saved progress' }));

    expect(await screen.findByRole('heading', { name: 'Demo valve actuator slow stroke draft review' })).toBeInTheDocument();
    expect((screen.getByLabelText('Planner edited version for Workorder') as HTMLTextAreaElement).value).toContain(
      'Planner edit: preserve as-found notes for later review.',
    );
  });
});
