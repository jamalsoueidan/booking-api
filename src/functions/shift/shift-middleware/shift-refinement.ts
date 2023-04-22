export function isDurationAtLeastOneHour(start: Date, end: Date) {
  const durationInHours = (end.getTime() - start.getTime()) / 1000 / 60 / 60;
  return start < end && durationInHours >= 1;
}
