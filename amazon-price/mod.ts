import cheerio from "https://dev.jspm.io/cheerio@1.0.0-rc.3";

declare const asinSymbol: unique symbol;
type Asin = {
  [asinSymbol]: never;
  readonly value: string;
};

export function fromString(s: string): Asin | null {
  if (s.match(/^[0-9A-Z]{10}$/) === null) return null;
  return { value: s } as Asin;
}

export async function fetchHtml(asin: Asin): Promise<string> {
  const response = await fetch(`https://www.amazon.co.jp/dp/${asin.value}`);
  const body = await response.text();
  return body;
}

export function parsePrice(html: string): number {
  const $ = cheerio.load(html);
  const priceString = $("#priceblock_ourprice").text().replace(/[^0-9]/g, "");
  const price = Number.parseInt(priceString, 10);
  return price;
}

export async function main(args: string[]): Promise<void> {
  const arg1 = args[0];
  if (typeof arg1 === "undefined") throw new Error("asin is undefined");
  const asin = fromString(arg1);
  if (asin === null) throw new Error("asin is invalid");
  const html = await fetchHtml(asin);
  const price = parsePrice(html);
  console.log(price);
}
