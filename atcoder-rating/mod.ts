import * as colorModule from "https://deno.land/std@v0.57.0/fmt/colors.ts";
import cheerio from "https://dev.jspm.io/cheerio@1.0.0-rc.3";

type Color =
  | "red"
  | "orange"
  | "yellow"
  | "blue"
  | "cyan"
  | "green"
  | "brown"
  | "gray"
  | "unrated"
  | "admin";

type User = { color: Color; name: string; rating: number };

async function fetchUserPage(name: string): Promise<string> {
  const response = await fetch(`https://atcoder.jp/users/${name}/?lang=ja`);
  const body = await response.text();
  return body;
}

function parseHtml(html: string): { color: Color; rating: number } {
  const $ = cheerio.load(html);
  const e = $($("#main-container .dl-table tr td span").get(0));
  const color = e.attr().class.split("-")[1];
  const rating = parseInt(e.text(), 10);
  return { color, rating };
}

function toColorCode(color: Color): number {
  const colors = {
    "red": 0xFF0000,
    "orange": 0xFF8000,
    "yellow": 0xC0C000,
    "blue": 0x0000FF,
    "cyan": 0x00C0C0,
    "green": 0x008000,
    "brown": 0x804000,
    "gray": 0x808080,
    "unrated": 0x000000,
    "admin": 0xC000C0,
  };
  return colors[color];
}

function formatUser({ color, name, rating }: User): string {
  return colorModule.rgb24(`${name} (${rating})`, toColorCode(color));
}

export async function main(): Promise<void> {
  const name = Deno.args[0];
  if (typeof name === "undefined") throw new Error("name is undefined");
  const html = await fetchUserPage(name);
  const { color, rating } = parseHtml(html);
  console.log(formatUser({ color, name, rating }));
}
