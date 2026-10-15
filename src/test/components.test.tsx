import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProgressBar } from '../components/ui/ProgressBar';
import { SegmentedControl, FilterChips } from '../components/ui/Controls';
import { ConfirmationDialog } from '../components/ui/Modal';
import { EcoMascot } from '../components/ui/EcoMascot';

describe('ProgressBar', () => {
  it('exposes clamped progress to assistive tech', () => {
    render(<ProgressBar value={1.4} label="XP" />);
    const bar = screen.getByRole('progressbar', { name: 'XP' });
    expect(bar).toHaveAttribute('aria-valuenow', '100');
  });

  it('shows custom value text when labelled', () => {
    render(<ProgressBar value={0.5} label="เลเวล" showLabel valueText="25/50 XP" />);
    expect(screen.getByText('25/50 XP')).toBeInTheDocument();
  });
});

describe('SegmentedControl', () => {
  it('marks the active option and reports changes', () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl
        ariaLabel="สถานะ"
        value="all"
        onChange={onChange}
        options={[{ value: 'all', label: 'ทั้งหมด' }, { value: 'done', label: 'ทำแล้ว' }]}
      />,
    );
    expect(screen.getByRole('radio', { name: 'ทั้งหมด' })).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(screen.getByRole('radio', { name: 'ทำแล้ว' }));
    expect(onChange).toHaveBeenCalledWith('done');
  });
});

describe('FilterChips', () => {
  it('toggles pressed state on the selected chip', () => {
    const onChange = vi.fn();
    render(
      <FilterChips ariaLabel="หมวด" value="a" onChange={onChange} options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]} />,
    );
    expect(screen.getByRole('button', { name: 'A' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'B' }));
    expect(onChange).toHaveBeenCalledWith('b');
  });
});

describe('ConfirmationDialog', () => {
  it('renders nothing when closed', () => {
    render(<ConfirmationDialog open={false} title="ลบ?" description="d" confirmLabel="ลบ" onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls confirm and cancel handlers', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<ConfirmationDialog open title="ลบข้อมูล?" description="ไม่สามารถกู้คืนได้" confirmLabel="ลบทั้งหมด" onConfirm={onConfirm} onCancel={onCancel} />);
    expect(screen.getByRole('dialog', { name: 'ลบข้อมูล?' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'ลบทั้งหมด' }));
    expect(onConfirm).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'ยกเลิก' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('closes on Escape', () => {
    const onCancel = vi.fn();
    render(<ConfirmationDialog open title="t" description="d" confirmLabel="ok" onConfirm={() => {}} onCancel={onCancel} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalled();
  });
});

describe('EcoMascot', () => {
  it('is an accessible image', () => {
    render(<EcoMascot title="Sprouty" />);
    expect(screen.getByRole('img', { name: 'Sprouty' })).toBeInTheDocument();
  });
});
