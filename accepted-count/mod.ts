import * as flags from "https://deno.land/std@v0.57.0/flags/mod.ts";
import * as fs from "https://deno.land/std@v0.57.0/node/fs.ts";

type AcceptedCount = Array<{ user_id: string; problem_count: number }>;

type Response = {
  body: AcceptedCount;
  etag: string;
};

export async function loadCache(cachePath: string): Promise<Response | null> {
  try {
    const data: Uint8Array | string | null | undefined = await fs.promises
      .readFile(
        cachePath,
        { encoding: "utf8" },
      );
    if (typeof data !== "string") return null;
    const json = JSON.parse(data);
    // TODO: validate json
    if (typeof json !== "object" || json === null) return null;
    const o = json as { [k: string]: unknown };
    const body = o.body;
    if (!Array.isArray(body)) return null;
    const etag = o.etag;
    if (typeof etag !== "string") return null;
    return { body, etag };
  } catch {
    return null;
  }
}

export async function saveCache(
  cachePath: string,
  cache: Response,
): Promise<void> {
  const data = JSON.stringify(cache);
  return fs.promises.writeFile(cachePath, data, { encoding: "utf8" });
}

async function loadAllAcceptedCount(
  options: { cachePath: string },
): Promise<AcceptedCount> {
  const { cachePath } = options;
  const cache = await loadCache(cachePath);
  const response = await fetch(
    "https://kenkoooo.com/atcoder/resources/ac.json",
    {
      headers: {
        "Accept": "application/json",
        ...(cache !== null ? { "If-None-Match": cache.etag } : {}),
      },
    },
  );
  if (response.status === 200) {
    const body = await response.json();
    const etag = response.headers.get("etag");
    if (etag !== null) await saveCache(cachePath, { body, etag });
    return body;
  } else if (response.status === 304 && cache !== null) {
    return cache.body;
  } else {
    throw new Error(
      `invalid status: ${response.status} or status: 304 && cache === null`,
    );
  }
}

export function parseArgs(
  args: string[],
): { cachePath: string; userName: string } {
  const parsed = flags.parse(args, {
    string: ["cache-path"],
  });
  const userName = parsed["_"][0];
  if (typeof userName !== "string") {
    throw new Error("userName is not string");
  }
  const cachePath = parsed["cache-path"];
  if (typeof cachePath !== "string") {
    throw new Error("cachePath is not string");
  }
  return { cachePath, userName };
}

export async function main(): Promise<void> {
  const { cachePath, userName } = parseArgs(Deno.args);
  const acceptedCount = await loadAllAcceptedCount({ cachePath });
  const foundUser = acceptedCount.find(({ user_id }) => user_id === userName);
  if (typeof foundUser === "undefined") {
    throw new Error(`user "${userName}" not found`);
  }
  console.log(foundUser.problem_count);
}
