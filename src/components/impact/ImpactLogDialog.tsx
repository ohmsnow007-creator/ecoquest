import { useId, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import type { ImpactActivityType, WasteType } from '../../types';
import { IMPACT_ACTIVITIES, WASTE_TYPE_LABELS, getActivityMeta } from '../../data/impactActivities';
import { getFactorFor } from '../../data/emissionFactors';
import { getLocalDate } from '../../utils/streak';
import { useGame } from '../../store/GameContext';
import { Modal } from '../ui/Modal';
import { PrimaryButton, SecondaryButton } from '../ui/Button';

interface ImpactLogDialogProps {
  open: boolean;
  initialType?: ImpactActivityType;
  onClose: () => void;
}

export function ImpactLogDialog({ open, initialType = 'electricity-saved', onClose }: ImpactLogDialogProps) {
  const { addImpactRecord, notify } = useGame();
  const today = getLocalDate();
  const [type, setType] = useState<ImpactActivityType>(initialType);
  const [quantity, setQuantity] = useState('');
  const [date, setDate] = useState(today);
  const [month, setMonth] = useState(today.slice(0, 7));
  const [wasteType, setWasteType] = useState<WasteType>('plastic');
  const [error, setError] = useState<string | null>(null);
  const qtyId = useId();
  const dateId = useId();

  const meta = getActivityMeta(type);
  const factor = getFactorFor(type);
  const isUsage = type === 'electricity-usage';

  const submit = () => {
    const value = Number(quantity.replace(/,/g, ''));
    if (!quantity.trim() || !Number.isFinite(value) || value <= 0) return setError('กรุณากรอกปริมาณเป็นตัวเลขที่มากกว่า 0');
    if (value > meta.max) return setError(`ปริมาณมากเกินไป (สูงสุด ${meta.max.toLocaleString('th-TH')} ${meta.unitLabel})`);
    const recordDate = isUsage ? `${month}-01` : date;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(recordDate) || recordDate > today) return setError('กรุณาเลือกวันที่ที่ไม่เกินวันนี้');

    const ok = addImpactRecord({ activityType: type, quantity: value, unit: meta.unit, date: recordDate, ...(type === 'waste-sorted' ? { wasteType } : {}) });
    if (!ok) return setError('บันทึกไม่สำเร็จ เบราว์เซอร์อาจปิดการเก็บข้อมูลไว้ กรุณาลองอีกครั้ง');
    notify(`บันทึก${meta.label} ${value.toLocaleString('th-TH')} ${meta.unitLabel} แล้ว`, 'info');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="บันทึกข้อมูลกิจกรรม"
      footer={
        <>
          <SecondaryButton onClick={onClose}>ยกเลิก</SecondaryButton>
          <PrimaryButton onClick={submit}>บันทึก</PrimaryButton>
        </>
      }
    >
      <fieldset>
        <legend className="mb-2 text-caption font-semibold">ข้อมูลที่ต้องการบันทึก</legend>
        <div className="space-y-1.5">
          {IMPACT_ACTIVITIES.map((a) => (
            <label key={a.type} className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-control border px-3 py-2 ${type === a.type ? 'border-primary bg-pale-mint' : 'border-border'}`}>
              <input type="radio" name="impact-type" value={a.type} checked={type === a.type} onChange={() => setType(a.type)} className="accent-[var(--color-primary)]" />
              <span className="flex-1 text-body">{a.label}</span>
              <span className="text-caption text-muted">{a.unit}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {type === 'waste-sorted' && (
        <label className="mt-4 block">
          <span className="mb-1.5 block text-caption font-semibold">ประเภทขยะ</span>
          <select value={wasteType} onChange={(e) => setWasteType(e.target.value as WasteType)} className="min-h-11 w-full rounded-control border border-border bg-surface px-3 text-body">
            {(Object.keys(WASTE_TYPE_LABELS) as WasteType[]).map((w) => (
              <option key={w} value={w}>{WASTE_TYPE_LABELS[w]}</option>
            ))}
          </select>
        </label>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={qtyId} className="mb-1.5 block text-caption font-semibold">ปริมาณ ({meta.unitLabel})</label>
          <input
            id={qtyId}
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="min-h-11 w-full rounded-control border border-border bg-surface px-3 text-body focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor={dateId} className="mb-1.5 block text-caption font-semibold">{isUsage ? 'เดือนของบิล' : 'วันที่'}</label>
          {isUsage ? (
            <input id={dateId} type="month" max={today.slice(0, 7)} value={month} onChange={(e) => setMonth(e.target.value)} className="min-h-11 w-full rounded-control border border-border bg-surface px-3 text-body" />
          ) : (
            <input id={dateId} type="date" max={today} value={date} onChange={(e) => setDate(e.target.value)} className="min-h-11 w-full rounded-control border border-border bg-surface px-3 text-body" />
          )}
        </div>
      </div>
      <p className="mt-2 text-caption text-muted">{meta.help}</p>
      <p className="mt-1 text-caption text-muted">
        {isUsage
          ? 'ข้อมูลนี้ใช้แสดงกราฟเปรียบเทียบการใช้ไฟฟ้าก่อน-หลังเท่านั้น'
          : factor
            ? `จะคำนวณ CO₂e โดยประมาณด้วยค่าปัจจัย ${factor.kgCO2ePerUnit} kgCO₂e/${factor.unit} จาก ${factor.publisher}`
            : 'ยังไม่มีค่าปัจจัยที่ตรวจสอบได้สำหรับข้อมูลนี้ จะแสดงเป็นปริมาณเท่านั้น ไม่คำนวณ CO₂e'}
      </p>
      <p className="mt-1 text-caption text-muted">การบันทึกปริมาณไม่ได้เพิ่ม XP และระบบบันทึกตามข้อมูลที่คุณกรอก</p>

      {error && (
        <p role="alert" className="mt-3 flex items-start gap-2 text-caption text-danger">
          <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" /> {error}
        </p>
      )}
    </Modal>
  );
}
