export function parse(s: string): { [k: string]: string } {
  const lines = s.split("\n");
  return lines.reduce((obj, line) => {
    if (line.length === 0) return obj;
    if (line.startsWith("#")) return obj;
    const index = line.indexOf("=");
    if (index < 0) return obj;
    const key = line.substring(0, index);
    const value = line.substring(index + 1);
    return {
      ...obj,
      [key]: value,
    };
  }, {});
}

export async function main(): Promise<void> {
  const input = await Deno.readAll(Deno.stdin);
  const inputString = new TextDecoder("utf-8").decode(input);
  console.log(JSON.stringify(parse(inputString)));
}
