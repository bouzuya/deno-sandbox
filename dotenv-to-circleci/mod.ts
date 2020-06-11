import { parse as parseFlags } from "https://deno.land/std@v0.55.0/flags/mod.ts";
import { parse as parseDotenv } from "../dotenv-to-json/mod.ts";

export async function readStdin(): Promise<string> {
  const input = await Deno.readAll(Deno.stdin);
  const inputString = new TextDecoder("utf-8").decode(input);
  return inputString;
}

export async function createEnvVar(
  circleToken: string,
  vcsSlug: string,
  orgName: string,
  repoName: string,
  name: string,
  value: string
): Promise<{ name: string; value: string }> {
  const projectSlug = `${vcsSlug}/${orgName}/${repoName}`;
  const url = `https://circleci.com/api/v2/project/${projectSlug}/envvar`;
  const response = await fetch(url, {
    body: JSON.stringify({
      name,
      value,
    }),
    headers: {
      Accept: "application/json",
      "Circle-Token": circleToken,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const body = await response.json();
  return body;
}

export async function main(): Promise<void> {
  const circleToken = Deno.env.get("CIRCLE_TOKEN");
  if (typeof circleToken === "undefined") throw new Error("CIRCLE_TOKEN");

  const flags = parseFlags(Deno.args, {
    string: ["vcs", "owner", "repo"],
  });
  const vcsSlug: string | undefined = flags["vcs"];
  const orgName: string | undefined = flags["owner"];
  const repoName: string | undefined = flags["repo"];
  if (typeof vcsSlug === "undefined") throw new Error("vcs is undefined");
  if (typeof orgName === "undefined") throw new Error("owner is undefined");
  if (typeof repoName === "undefined") throw new Error("repo is undefined");

  const input = await readStdin();
  const json = parseDotenv(input);
  for await (const [name, value] of Object.entries(json)) {
    const responseBody = await createEnvVar(
      circleToken,
      vcsSlug,
      orgName,
      repoName,
      name,
      value
    );
    console.log(responseBody);
  }
}
