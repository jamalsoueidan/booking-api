export function activityType<T extends (...args: any) => any>(
  data: Parameters<T>[0]
): Parameters<T>[0] {
  return data;
}
