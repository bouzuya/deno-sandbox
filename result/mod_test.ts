import { assertEquals } from "https://deno.land/std@0.92.0/testing/asserts.ts";
import { Result, err, ok, unwrap } from "./mod.ts";

Deno.test("err", () => {
  const result: Result<never, string> = err('err');
  assertEquals(result.isOk, false);
  assertEquals(result.isOk ? null : result.error, 'err');
});

Deno.test("ok", () => {
  const result: Result<number, never> = ok(123);
  assertEquals(result.isOk, true);
  assertEquals(result.isOk ? result.value : null, 123);
});

Deno.test("unwrap", () => {
  const okResult: Result<number, never> = ok(123);
  const errResult: Result<never, string> = err('err');
  assertEquals(unwrap(okResult), 123);
  try {
    unwrap(errResult);
  } catch (e) {
    assertEquals(e.message, 'err');
  }
});
