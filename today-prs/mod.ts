import { parse as parseFlags } from "https://deno.land/std@v0.61.0/flags/mod.ts";

interface PullRequest {
  assignee: string | null;
  closedAt: string | null;
  url: string;
  title: string;
  updatedAt: string;
}

async function fetchIssuesOrPullRequestsOrderByUpdatedDesc(
  githubToken: string,
  q: string
): Promise<PullRequest[]> {
  const urlObj = new URL("https://api.github.com/search/issues");
  urlObj.searchParams.append("order", "desc");
  urlObj.searchParams.append("q", q);
  urlObj.searchParams.append("sort", "updated");
  const url = urlObj.toString();
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `token ${githubToken}`,
      "Content-Type": "application/json",
      "User-Agent": "github-today",
    },
  });
  const body: {
    items: {
      assignee: { login: string } | null;
      closed_at: string | null;
      html_url: string;
      title: string;
      updated_at: string;
    }[];
  } = await response.json();
  return body.items.map(
    ({
      assignee,
      closed_at: closedAt,
      html_url: url,
      title,
      updated_at: updatedAt,
    }) => ({
      assignee: assignee?.login ?? null,
      closedAt,
      title,
      url,
      updatedAt,
    })
  );
}

function startOfDay(d: Date): Date {
  const sday = new Date(d.getTime());
  sday.setHours(0);
  sday.setMinutes(0);
  sday.setSeconds(0);
  sday.setMilliseconds(0);
  return sday;
}

function dateToStringWithoutMs(d: Date): string {
  return d.toISOString().substring(0, "YYYY-MM-DDTHH:MM:SS".length) + "Z";
}

function format(
  user: string,
  org: string,
  closed: PullRequest[],
  inReview: PullRequest[],
  wip: PullRequest[]
): string {
  function formatPullRequests(prs: PullRequest[]): string {
    return prs.map(({ title, url }) => `- ${title}\n  <${url}>`).join("\n");
  }
  return `
# 今日やったこと

今日やること: <>

# 今日マージされた PR

${formatPullRequests(closed)}

<https://github.com/pulls?q=archived%3Afalse+author%3A${user}+is%3Aclosed+is%3Apr+org%3A${org}+sort%3Aupdated-desc>

# まだマージされていない PR

${formatPullRequests(inReview)}

<https://github.com/pulls?q=archived%3Afalse+-assignee:${user}+author%3A${user}+is%3Aopen+is%3Apr+org%3A${org}+sort%3Aupdated-desc>

# 作業中の PR

${formatPullRequests(wip)}

<https://github.com/pulls?q=archived%3Afalse+assignee:${user}+author%3A${user}+is%3Aopen+is%3Apr+org%3A${org}+sort%3Aupdated-desc>
  `.trim();
}

function parseArgs(args: string[]): { org: string; user: string } {
  const flags = parseFlags(args, {
    string: ["org", "user"],
  });
  const org: string | undefined = flags["org"];
  const user: string | undefined = flags["user"];
  if (typeof org === "undefined") throw new Error("org is undefined");
  if (typeof user === "undefined") throw new Error("user is undefined");
  return { org, user };
}

export async function main(): Promise<void> {
  const githubToken = Deno.env.get("GITHUB_TOKEN");
  if (typeof githubToken === "undefined")
    throw new Error("GITHUB_TOKEN is undefined");
  const { org, user } = parseArgs(Deno.args);

  const prs = await fetchIssuesOrPullRequestsOrderByUpdatedDesc(
    githubToken,
    `archived:false author:${user} is:pr org:${org}`
  );

  const since = dateToStringWithoutMs(startOfDay(new Date()));
  const closed = prs.filter(
    ({ closedAt, updatedAt }) =>
      updatedAt >= since && closedAt !== null && closedAt >= since
  );
  const inReview = prs.filter(
    ({ assignee, closedAt }) => closedAt === null && assignee !== user
  );
  const wip = prs.filter(
    ({ assignee, closedAt }) => closedAt === null && assignee === user
  );
  const message = format(user, org, closed, inReview, wip);
  console.log(message);
}
