export type Interval = {
  start: string; // "08:30:00"
  end: string; // "09:30:00"
};

const base = "2000-01-01T";

export function toDate(time: string) {
  return new Date(base + time);
}

export function toTimeString(date: Date) {
  return date.toTimeString().slice(0, 8);
}

export function isOverlap(a: Interval, b: Interval) {
  return a.start < b.end && a.end > b.start;
}

export function generateIntervals(
  start: string,
  end: string,
  stepMinutes = 60,
): Interval[] {
  const result: Interval[] = [];

  let current = toDate(start);
  const endDate = toDate(end);

  while (current < endDate) {
    const next = new Date(current);
    next.setMinutes(next.getMinutes() + stepMinutes);

    if (next > endDate) break;

    result.push({
      start: toTimeString(current),
      end: toTimeString(next),
    });

    current = next;
  }

  return result;
}
