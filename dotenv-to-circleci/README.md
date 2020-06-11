# dotenv-to-circleci

## Installation

```bash
$ deno install --allow-env --allow-net=circleci.com --name=dotenv-to-circleci main.ts
Download https://deno.land/std@v0.55.0/flags/mod.ts
Download https://deno.land/std@v0.55.0/testing/asserts.ts
Download https://deno.land/std@v0.55.0/fmt/colors.ts
Download https://deno.land/std@v0.55.0/testing/diff.ts
Compile file:///Users/bouzuya/ghq/github.com/bouzuya/deno-sandbox/dotenv-to-circleci/main.ts
✅ Successfully installed dotenv-to-circleci
/Users/bouzuya/.deno/bin/dotenv-to-circleci
```

## Usage

```bash
$ echo 'foo=bar' | dotenv-to-circleci --vcs gh --owner bouzuya --repo repo1
{ name: "foo", value: "xxxxr" }
```


