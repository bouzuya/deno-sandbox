# today-prs

## Installation

```bash
$ org=xxx # your github org
$ user=xxx # your github user
$ deno install --allow-env --allow-net=api.github.com --name=today-prs main.ts --org "${org}" --user "${user}"
Download https://deno.land/std@v0.71.0/flags/mod.ts
Download https://deno.land/std@v0.71.0/_util/assert.ts
Check file:///Users/bouzuya/ghq/github.com/bouzuya/deno-sandbox/today-prs/main.ts
✅ Successfully installed today-prs
/Users/bouzuya/.deno/bin/today-prs
```

## Usage

```bash
$ export GITHUB_TOKEN=xxx
$ today-prs
# 今日やったこと

昨日やったこと: <>

## 今日マージされた PR

- pull request title 1
  <https://github.com/ORG/repo1/pull/1>

<https://github.com/pulls?q=archived%3Afalse+author%3Abouzuya+is%3Aclosed+is%3Apr+org%3AORG+sort%3Aupdated-desc>

## まだマージされていない PR

- pull request title 2
  <https://github.com/ORG/repo1/pull/2>

<https://github.com/pulls?q=archived%3Afalse+-assignee:bouzuya&author%3Abouzuya+is%3Aopen+is%3Apr+org%3AORG+sort%3Aupdated-desc>

## 作業中の PR

- pull request title 3
  <https://github.com/ORG/repo1/pull/3>

<https://github.com/pulls?q=archived%3Afalse+assignee:bouzuya&author%3Abouzuya+is%3Aopen+is%3Apr+org%3AORG+sort%3Aupdated-desc>

## 明日やること
```
