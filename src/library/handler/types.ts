import { AuthSession } from "~/functions/auth/auth.types";

type PickByValueType<T, ValueType> = Pick<
  T,
  { [K in keyof T]-?: T[K] extends ValueType ? K : never }[keyof T]
>;

export type SessionKey<
  T extends {
    query?: any;
    body?: any;
  }
> = PickByValueType<T, object> & {
  session: AuthSession;
};
