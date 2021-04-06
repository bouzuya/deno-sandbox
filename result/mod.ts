declare const errSymbol: unique symbol;
declare const okSymbol: unique symbol;
type Err<E> = Readonly<{ isOk: false; error: E, [errSymbol]: never }>;
type Ok<T> = Readonly<{ isOk: true; value: T, [okSymbol]: never }>;
export type Result<T, E> = Ok<T> | Err<E>;

export function err<T, E>(error: E): Result<T, E> {
  return { isOk: false, error } as Err<E>;
}

export function ok<T, E>(value: T): Result<T, E> {
  return { isOk: true, value } as Ok<T>;
}

export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.isOk) return result.value;
  throw new Error(`${result.error}`);
}
