import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'smartygym:checkins';

export interface CheckIn {
  code: string;
  timestamp: number;
}

export async function getCheckIns(): Promise<CheckIn[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CheckIn[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function addCheckIn(code: string): Promise<CheckIn[]> {
  const existing = await getCheckIns();
  // Build the timestamp from the caller side is not possible (Date is fine in app
  // runtime), so we stamp here.
  const next: CheckIn[] = [{ code, timestamp: Date.now() }, ...existing].slice(0, 100);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export async function clearCheckIns(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}

/** Returns the count of consecutive days (ending today or yesterday) with a check-in. */
export function computeStreak(checkIns: CheckIn[]): number {
  if (checkIns.length === 0) return 0;

  const dayKey = (ts: number) => {
    const d = new Date(ts);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  };

  const days = new Set(checkIns.map((c) => dayKey(c.timestamp)));

  const oneDay = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const todayKey = dayKey(now);
  const yesterdayKey = dayKey(now - oneDay);

  // Streak only counts if there's a check-in today or yesterday.
  let cursor: number;
  if (days.has(todayKey)) cursor = now;
  else if (days.has(yesterdayKey)) cursor = now - oneDay;
  else return 0;

  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor -= oneDay;
  }
  return streak;
}
