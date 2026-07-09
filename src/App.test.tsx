import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { STORAGE_KEYS } from './storage/local';

const writeTextMock = vi.fn();

function selectSite(siteId = 'hatch') {
  fireEvent.change(screen.getByLabelText('Select site'), {
    target: { value: siteId },
  });
}

function enterAndAnalyze(value: string, siteId = 'hatch') {
  selectSite(siteId);
  fireEvent.change(screen.getByLabelText('paste or type CR/MPL/Work order number'), {
    target: { value },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));
}

beforeEach(() => {
  window.history.pushState({}, '', '/');
  localStorage.clear();
  writeTextMock.mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: {
      writeText: writeTextMock,
    },
  });
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  writeTextMock.mockReset();
  window.history.pushState({}, '', '/');
});

describe('planner MVP app shell', () => {
  it('renders the intake screen with site selection before lookup', () => {
    render(<App />);

    expect(screen.getByRole('link', { name: 'Skip to main content' })).toBeInTheDocument();
    expect(screen.getByLabelText('Select site')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Plant Farley' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Vogtle 1 and 2' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Vogtle 3 and 4' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Hatch' })).toBeInTheDocument();
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

  it('requires a site and a fake record input before analysis', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));
    expect(screen.getByText('Select a site before analyzing a fake CR, MPL, or work order.')).toBeInTheDocument();

    selectSite();
    fireEvent.click(screen.getByRole('button', { name: 'Analyze' }));
    expect(screen.getByText('Enter a fake CR, MPL, work order number, or demo condition note before analyzing.')).toBeInTheDocument();
  });

  it('analyzes a fake sample and shows site metadata, relationship mapping, and Maximo tabs', async () => {
    render(<App />);

    enterAndAnalyze('DEMO-CR-1001');

    expect(await screen.findByRole('heading', { name: 'Demo pump seal leakage planning review' })).toBeInTheDocument();
    expect(screen.getByText('CR record: DEMO-CR-1001')).toBeInTheDocument();
    expect(screen.getByText('Hatch')).toBeInTheDocument();
    expect(screen.getByText('Relationship Mapping')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /DEMO-WO-3004 - Seal inspection history/i })).toBeInTheDocument();
    expect(screen.getByText('Condition Report')).toBeInTheDocument();
    expect(screen.getByText('Significant Nuclear Challenge')).toBeInTheDocument();
    expect(screen.getByText('Verified Facts')).toBeInTheDocument();
    expect(screen.getByText('Similar WOs Found')).toBeInTheDocument();
    expect(screen.queryByText('Planning assistant guidance')).not.toBeInTheDocument();
    expect(screen.queryByText('Planner edit summary')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export refinement JSON' })).not.toBeInTheDocument();
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

  it('clicks relationship nodes to jump to related Maximo tabs', async () => {
    render(<App />);

    enterAndAnalyze('DEMO-CR-1001');

    await screen.findByRole('heading', { name: 'Demo pump seal leakage planning review' });
    fireEvent.click(screen.getByRole('button', { name: /DEMO-MPL-2007 - Pump bay walkdown list/i }));

    expect(screen.getByLabelText('Planner final text for copy/paste for Logic')).toBeInTheDocument();
  });

  it('uses the selected response mode in the generated result', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Research \/ Planning Basis/i }));
    enterAndAnalyze('DEMO-MPL-2001');

    expect(await screen.findByRole('heading', { name: 'Demo breaker inspection planning list item' })).toBeInTheDocument();
    expect(screen.getAllByText('Research / Planning Basis').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('tab', { name: 'Plans' }));
    expect(screen.queryByLabelText('Planner final text for copy/paste for Plans')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'WORK SCOPE' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Copy long description' })).toHaveLength(7);
    expect((screen.getByLabelText('Task 20 long description for HIGH-LEVEL WORK INSTRUCTIONS') as HTMLTextAreaElement).value).toContain(
      '- Treat history as context, not authority.',
    );
  });

  it('copies only the edited Plans long-description body for a task block', async () => {
    render(<App />);

    enterAndAnalyze('DEMO-WO-3001');

    fireEvent.click(await screen.findByRole('tab', { name: 'Plans' }));
    const task10 = screen.getByLabelText('Task 10 long description for WORK SCOPE') as HTMLTextAreaElement;
    fireEvent.change(task10, {
      target: { value: 'Edited body for Maximo long description only.' },
    });
    fireEvent.click(screen.getAllByRole('button', { name: 'Copy long description' })[0]);

    await waitFor(() => expect(writeTextMock).toHaveBeenCalledWith('Edited body for Maximo long description only.'));
    expect(writeTextMock.mock.calls[0][0]).not.toContain('Task 10');
    expect(writeTextMock.mock.calls[0][0]).not.toContain('WORK SCOPE');
  });

  it('uses a conservative generic package when no fake sample matches', async () => {
    render(<App />);

    enterAndAnalyze('demo unknown condition for planner review', 'plant-farley');

    expect(await screen.findByRole('heading', { name: 'Generic demo planner review package' })).toBeInTheDocument();
    expect(screen.getByText('Plant Farley')).toBeInTheDocument();
    expect(screen.getByText('Generic fallback')).toBeInTheDocument();
    expect(screen.getAllByText('Needs planner confirmation').length).toBeGreaterThan(0);
  });

  it('keeps refinement changes hidden from normal planner view', async () => {
    render(<App />);

    enterAndAnalyze('DEMO-CR-1001');

    const editBox = (await screen.findByLabelText('Planner final text for copy/paste for Workorder')) as HTMLTextAreaElement;
    expect(screen.getByText('Agent generated baseline')).toBeInTheDocument();
    expect(screen.queryByText('What changed for agent refinement')).not.toBeInTheDocument();

    fireEvent.change(editBox, {
      target: { value: `${editBox.value}\nPlanner edit: confirm the approved source document before copy/paste.` },
    });

    expect(screen.queryByText('Kept: 11 | Removed: 0 | Added: 1 | Edited: 0')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export refinement Markdown' })).not.toBeInTheDocument();
  });

  it('shows refinement changes and exports only in admin mode', async () => {
    window.history.pushState({}, '', '/?admin=1');
    render(<App />);

    enterAndAnalyze('DEMO-CR-1001');

    const editBox = (await screen.findByLabelText('Planner final text for copy/paste for Workorder')) as HTMLTextAreaElement;
    expect(screen.getByText('Admin view')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export refinement JSON' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export refinement Markdown' })).toBeInTheDocument();
    expect(screen.getByText('What changed for agent refinement')).toBeInTheDocument();
    expect(screen.getByText('All 11 agent-generated lines are currently kept for copy/paste.')).toBeInTheDocument();

    fireEvent.change(editBox, {
      target: { value: `${editBox.value}\nPlanner edit: confirm the approved source document before copy/paste.` },
    });

    expect(screen.getAllByText('Changed tabs: 1').length).toBeGreaterThan(0);
    expect(screen.getByText('Kept: 11 | Removed: 0 | Added: 1 | Edited: 0')).toBeInTheDocument();
    expect(screen.getByText('Line 12 added: Planner edit: confirm the approved source document before copy/paste.')).toBeInTheDocument();
  });

  it('saves planner edits, logs refinement snapshots, and resumes from local storage', async () => {
    render(<App />);

    enterAndAnalyze('DEMO-WO-3001', 'vogtle-1-2');

    const editBox = (await screen.findByLabelText('Planner final text for copy/paste for Workorder')) as HTMLTextAreaElement;
    fireEvent.change(editBox, {
      target: { value: `${editBox.value}\nPlanner edit: preserve as-found notes for later review.` },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save progress' }));

    expect(screen.getByText('Progress saved')).toBeInTheDocument();
    const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.plannerRefinementLogs) ?? '[]');
    expect(logs).toHaveLength(1);
    expect(logs[0].siteLabel).toBe('Vogtle 1 and 2');
    expect(logs[0].report.tabs[0].plannerFinalText).toContain('Planner edit: preserve as-found notes for later review.');

    cleanup();
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Resume saved progress' }));

    expect(await screen.findByRole('heading', { name: 'Demo valve actuator slow stroke draft review' })).toBeInTheDocument();
    expect(screen.getByText('Vogtle 1 and 2')).toBeInTheDocument();
    expect((screen.getByLabelText('Planner final text for copy/paste for Workorder') as HTMLTextAreaElement).value).toContain(
      'Planner edit: preserve as-found notes for later review.',
    );
  });

  it('saves and resumes edited Plans task long descriptions', async () => {
    render(<App />);

    enterAndAnalyze('DEMO-CR-1001');

    fireEvent.click(await screen.findByRole('tab', { name: 'Plans' }));
    const task10 = screen.getByLabelText('Task 10 long description for WORK SCOPE') as HTMLTextAreaElement;
    fireEvent.change(task10, {
      target: { value: `${task10.value}\nPlanner edit: paste this into the Maximo task 10 long description.` },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save progress' }));

    const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.plannerRefinementLogs) ?? '[]');
    expect(logs[0].report.tabs.find((tab: { tabId: string }) => tab.tabId === 'plans').plannerFinalText).toContain(
      'Planner edit: paste this into the Maximo task 10 long description.',
    );

    cleanup();
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Resume saved progress' }));
    fireEvent.click(await screen.findByRole('tab', { name: 'Plans' }));

    expect((screen.getByLabelText('Task 10 long description for WORK SCOPE') as HTMLTextAreaElement).value).toContain(
      'Planner edit: paste this into the Maximo task 10 long description.',
    );
  });
});
