import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { GameProvider } from '../store/GameContext';
import { answerQuestion, classifyWaste, normalize } from '../utils/sproutyChat';
import { KNOWLEDGE, SUGGESTED_QUESTIONS } from '../data/knowledge';
import { WASTE_ITEMS, WASTE_EXAMPLES } from '../data/wasteItems';
import { WasteSorter } from '../pages/WasteSorter';
import { Dashboard } from '../pages/Dashboard';
import { storageService } from '../services/storageService';

const profile = {
  id: 'p1', displayName: 'Tester', avatarId: 'avatar-leaf', createdAt: '2026-10-01T00:00:00.000Z', updatedAt: '',
  preferences: { reducedMotion: true, selectedGoalIds: [], profileColor: 'mint', celebrations: false },
};

describe('waste sorter matching (Thai 4-colour bins)', () => {
  it.each([
    ['ขวดน้ำพลาสติก', 'yellow'],
    ['ขวด น้ำ', 'yellow'],
    ['เปลือกกล้วย', 'green'],
    ['เศษอาหาร', 'green'],
    ['กล่องโฟม', 'blue'],
    ['ซองขนม', 'blue'],
    ['ถ่านไฟฉาย', 'red'],
    ['หลอดไฟ', 'red'],
    ['กล่องนม', 'yellow'],
    ['ทิชชู', 'blue'],
  ])('%s → %s', (name, bin) => {
    expect(classifyWaste(name)[0]?.bin.id).toBe(bin);
  });

  it('says it doesn’t know rather than guessing', () => {
    expect(classifyWaste('xyz')).toEqual([]);
    expect(classifyWaste('')).toEqual([]);
  });

  it('every example chip and every listed name is found as itself', () => {
    for (const w of WASTE_EXAMPLES) expect(classifyWaste(w)[0]?.name).toBe(w);
    for (const item of WASTE_ITEMS) expect(classifyWaste(item.names[0])[0]?.item).toBe(item);
  });
});

describe('Sprouty answers from the in-app knowledge base', () => {
  it('answers the suggested questions, with a source when there are numbers', () => {
    for (const q of SUGGESTED_QUESTIONS) {
      const r = answerQuestion(q);
      expect(r.unknown, q).toBeFalsy();
    }
    expect(answerQuestion('ขยะพลาสติกย่อยสลายกี่ปี?').source?.name).toContain('NOAA');
    expect(answerQuestion('ขวดพลาสติกย่อยสลายกี่ปี').text).toContain('450 ปี');
    expect(answerQuestion('ถุงพลาสติกย่อยสลายนานแค่ไหน').text).toContain('10–20 ปี');
  });

  it('routes "which bin" questions to the waste list, and general bin questions to the overview', () => {
    expect(answerQuestion('ถ่านไฟฉายทิ้งถังไหน').text).toContain('ถังสีแดง');
    expect(answerQuestion('ถังขยะแต่ละสีทิ้งอะไร?').text).toContain('ถังขยะ 4 สี');
  });

  it('is honest about questions it has no knowledge for', () => {
    const r = answerQuestion('ใครเป็นนายกรัฐมนตรี');
    expect(r.unknown).toBe(true);
    expect(r.text).toContain('ยังไม่รู้');
  });

  it('every knowledge entry with a figure carries a source', () => {
    for (const e of KNOWLEDGE) {
      if (/\d/.test(e.answer.replace(/^\d\./gm, '').replace(/[1-4]\. /g, '')) && !e.id.startsWith('quiz-') && !['xp', 'water-sprouty', 'bins', '3r', 'compost', 'save-electricity'].includes(e.id)) {
        expect(e.source, e.id).toBeDefined();
      }
    }
    expect(normalize('CO₂e คือ อะไร?')).toBe('co2eคืออะไร');
  });
});

describe('screens', () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('ecoquest_profile', JSON.stringify(profile));
    localStorage.setItem('ecoquest_progress', JSON.stringify(storageService.getDefaultProgress()));
  });

  it('the sorter shows the right coloured bin and a tip', async () => {
    render(
      <MotionConfig reducedMotion="always">
        <MemoryRouter>
          <GameProvider>
            <WasteSorter />
          </GameProvider>
        </MemoryRouter>
      </MotionConfig>,
    );
    fireEvent.change(screen.getByLabelText('ชื่อขยะ'), { target: { value: 'ขวดน้ำ' } });
    fireEvent.click(screen.getByRole('button', { name: /ตรวจสอบ/ }));
    const result = await screen.findByTestId('waste-result', {}, { timeout: 3000 });
    expect(within(result).getByText('ถังสีเหลือง')).toBeInTheDocument();
    expect(within(result).getByText('ขยะรีไซเคิล')).toBeInTheDocument();
  });

  it('Home has the 🤖 button and the sorter shortcut; the chat answers with Sprouty thinking first', async () => {
    render(
      <MotionConfig reducedMotion="always">
        <MemoryRouter>
          <GameProvider>
            <Dashboard />
          </GameProvider>
        </MemoryRouter>
      </MotionConfig>,
    );
    expect(screen.getByRole('link', { name: 'แยกขยะกับ Sprouty' })).toHaveAttribute('href', '/sort');
    fireEvent.click(screen.getByRole('button', { name: 'เปิดแชตถามความรู้กับ Sprouty' }));
    const dialog = screen.getByRole('dialog', { name: 'คุยกับ Sprouty' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'ทำไมโลกร้อน?' }));
    expect(within(dialog).getByText('กำลังคิดคำตอบ…')).toBeInTheDocument();
    expect(await within(dialog).findByText(/IPCC สรุปว่า/, {}, { timeout: 3000 })).toBeInTheDocument();
    expect(within(dialog).getByText(/ที่มา: IPCC/)).toBeInTheDocument();
  }, 15_000);
});
