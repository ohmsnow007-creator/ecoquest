import { useEffect, useState } from 'react';
import { getTimeOfDay, type TimeOfDay } from '../../utils/timeOfDay';

/** The device's part of the day, kept current (checked every minute). */
export function useTimeOfDay(): TimeOfDay {
  const [time, setTime] = useState(() => getTimeOfDay(new Date().getHours()));
  useEffect(() => {
    const t = window.setInterval(() => setTime(getTimeOfDay(new Date().getHours())), 60_000);
    return () => window.clearInterval(t);
  }, []);
  return time;
}
