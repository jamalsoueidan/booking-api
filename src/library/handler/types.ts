import { AuthSession } from "../../functions/auth/auth.types";

export type HandlerProps<Q = never, B = never, S = AuthSession> = Pick<
  {
    query: Q;
    body: B;
    session: S;
  },
  | (Q extends object ? "query" : never)
  | (B extends object ? "body" : never)
  | (S extends object ? "session" : never)
>;
