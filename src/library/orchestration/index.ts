export function activityType<T extends (...args: any) => any>(
  data: Parameters<T>[0]
): Parameters<T>[0] {
  return data;
}

export type StatusResponse = {
  id: string;
  statusQueryGetUri: string;
  sendEventPostUri: string;
  terminatePostUri: string;
  rewindPostUri: string;
  purgeHistoryDeleteUri: string;
  restartPostUri: string;
  suspendPostUri: string;
  resumePostUri: string;
};
