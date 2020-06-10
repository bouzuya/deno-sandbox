import { assertEquals } from "https://deno.land/std@v0.55.0/testing/asserts.ts";
import { parse } from "./mod.ts";

Deno.test("parse", () => {
  assertEquals(parse(""), {});
  assertEquals(parse("\n"), {});
  assertEquals(parse("k"), {});
  assertEquals(parse("# k=v"), {});
  assertEquals(parse("k=v"), { k: "v" });
  assertEquals(parse("k= v "), { k: " v " }); // != npm:dotenv
  assertEquals(parse("k=' v '"), { k: "' v '" }); // != npm:dotenv
  assertEquals(parse('k=" v "'), { k: '" v "' }); // != npm:dotenv
  assertEquals(parse("k1=v1\nk2=v2"), { k1: "v1", k2: "v2" });
});
