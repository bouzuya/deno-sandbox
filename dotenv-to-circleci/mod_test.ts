import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@v0.55.0/testing/asserts.ts";
import { parseArgs } from "./mod.ts";

Deno.test("parseArgs", () => {
  assertThrows(() => parseArgs([]));
  assertThrows(() => parseArgs(["--action=create"]));
  assertThrows(() => parseArgs(["--action=create", "--owner=owner1"]));
  assertThrows(() =>
    parseArgs(["--action=create", "--owner=owner1", "--repo=repo1"])
  );
  assertEquals(
    parseArgs(
      ["--action=create", "--owner=owner1", "--repo=repo1", "--vcs=gh"],
    ),
    { action: "create", owner: "owner1", repo: "repo1", vcs: "gh" },
  );
  assertEquals(
    parseArgs(
      ["--action=delete", "--owner=owner1", "--repo=repo1", "--vcs=gh"],
    ),
    { action: "delete", owner: "owner1", repo: "repo1", vcs: "gh" },
  );
  assertThrows(() =>
    parseArgs(["--action=update", "--owner=owner1", "--repo=repo1", "--vcs=gh"])
  );
});
