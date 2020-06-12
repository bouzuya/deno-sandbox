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
  value: string,
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
  return response.status === 201 ? Promise.resolve(body) : Promise.reject(body);
}

export async function deleteEnvVar(
  circleToken: string,
  vcsSlug: string,
  orgName: string,
  repoName: string,
  name: string,
): Promise<{ message: string }> {
  const projectSlug = `${vcsSlug}/${orgName}/${repoName}`;
  const url =
    `https://circleci.com/api/v2/project/${projectSlug}/envvar/${name}`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Circle-Token": circleToken,
      "Content-Type": "application/json",
    },
    method: "DELETE",
  });
  const body = await response.json();
  return response.status === 200 ? Promise.resolve(body) : Promise.reject(body);
}

export function isAction(s: string): s is "create" | "delete" {
  return ["create", "delete"].includes(s);
}

export function parseArgs(
  args: string[],
): { action: "create" | "delete"; vcs: string; owner: string; repo: string } {
  const flags = parseFlags(args, {
    string: ["action", "owner", "repo", "vcs"],
  });
  const action: string = flags["action"] ?? "create";
  const vcs: string | undefined = flags["vcs"];
  const owner: string | undefined = flags["owner"];
  const repo: string | undefined = flags["repo"];
  if (!isAction(action)) throw new Error("action is invalid");
  if (typeof vcs === "undefined") throw new Error("vcs is undefined");
  if (typeof owner === "undefined") throw new Error("owner is undefined");
  if (typeof repo === "undefined") throw new Error("repo is undefined");
  return { action, owner, repo, vcs };
}

export async function main(): Promise<void> {
  const circleToken = Deno.env.get("CIRCLE_TOKEN");
  if (typeof circleToken === "undefined") throw new Error("CIRCLE_TOKEN");

  const input = await readStdin();
  const json = parseDotenv(input);
  const { action, owner, repo, vcs } = parseArgs(Deno.args);
  for await (const [name, value] of Object.entries(json)) {
    switch (action) {
      case "create": {
        const responseBody = await createEnvVar(
          circleToken,
          vcs,
          owner,
          repo,
          name,
          value,
        );
        console.log(responseBody);
        break;
      }
      case "delete": {
        const responseBody = await deleteEnvVar(
          circleToken,
          vcs,
          owner,
          repo,
          name,
        );
        console.log(responseBody);
        break;
      }
      default:
        throw new Error("unreachable");
    }
  }
}
