import denoXmlParser from "https://denopkg.com/nekobato/deno-xml-parser/index.ts";

type Rss1 = {
  // TODO: channel
  items: Array<Rss1Item>;
};

type Rss1Item = {
  // TODO: description
  link: string;
  title: string;
};

export async function fetchFeed(): Promise<string> {
  const response = await fetch("https://b.hatena.ne.jp/hotentry.rss");
  const body = await response.text();
  return body;
}

export function parse(s: string): Rss1 {
  const parsed = denoXmlParser(s);
  const root = parsed.root;
  if (typeof root === "undefined") throw new Error("root is undefined");
  if (root.name !== "rdf:RDF") throw new Error("root.name is not rdf:RDF");
  const nodeContent = (node: unknown): string | null => {
    if (typeof node !== "object" || node === null) return null;
    const content = (node as { [key: string]: unknown })["content"];
    if (typeof content !== "string") return null;
    return content.replace(/&#x(....);/g, (_, codeString) => {
      const code = Number.parseInt(codeString, 16);
      return String.fromCharCode(code);
    });
  };
  const nodeName = (node: unknown): string | null => {
    if (typeof node !== "object" || node === null) return null;
    const name = (node as { [key: string]: unknown })["name"];
    if (typeof name !== "string") return null;
    return name;
  };
  return {
    items: root.children
      .filter((node) => nodeName(node) === "item")
      .map((item, index): Rss1Item => {
        const titleNode = item.children.find((node: unknown) =>
          nodeName(node) === "title"
        );
        if (typeof titleNode === "undefined") {
          throw new Error(`item[${index}]/title is undefined`);
        }
        const title = nodeContent(titleNode);
        if (title === null) throw new Error("title is nothing");
        const linkNode = item.children.find((node: unknown) =>
          nodeName(node) === "link"
        );
        if (typeof linkNode === "undefined") {
          throw new Error(`item[${index}]/link is undefined`);
        }
        const link = nodeContent(linkNode);
        if (link === null) throw new Error("link is nothing");
        return {
          link,
          title,
        };
      }),
  };
}

export async function main() {
  const denyUrlPatterns = [
    /twitter\.com/,
    /togetter\.com/,
  ];
  const feedString = await fetchFeed();
  const rss1 = parse(feedString);
  const message = rss1.items.filter(({ link }) =>
    denyUrlPatterns.every((p) => link.match(p) === null)
  ).map((item) => `${item.title}\n${item.link}\n`)
    .join(
      "\n",
    );
  console.log(message);
}

main();
