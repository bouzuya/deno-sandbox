import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@v0.57.0/testing/asserts.ts";
import { parseArgs } from "./mod.ts";

Deno.test("parseArgs", () => {
  assertThrows(() => parseArgs([]));
  assertThrows(() => parseArgs(["bouzuya"]));
  assertEquals(parseArgs(["--cache-path=/path/to/cache", "bouzuya"]), {
    cachePath: "/path/to/cache",
    userName: "bouzuya",
  });
});
