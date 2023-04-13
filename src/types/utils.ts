import { Aggregate } from "mongoose";

type UnwrapAggregate<T> = T extends Aggregate<infer R> ? R : T;

export type ResolveReturnType<T extends (...args: any) => any> =
  UnwrapAggregate<ReturnType<T> extends Promise<infer R> ? R : ReturnType<T>>;
