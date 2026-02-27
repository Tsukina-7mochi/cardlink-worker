# cardlink-worker

A cloudflare worker to convert URL into obsidian cardlink plugin style
codeblock. Deno + wrangler

## Features

With GET request,

```
https://[worker]/{target url (url encoded)}
```

responses a YAML codeblock like:

```
\`\`\`cardlink
url: {url}
title: {title}
description: {description}
host: {host}
favicon: {favicon}
image: {image url}
\`\`\`
```

These information generated from `title` element and OGP.

For example, with a GET request:

```
https%3A%2F%2Fexample.com
```

the resopnse is:

```
\`\`\`cardlink
url: https://example.com
title: "Example Domain"
host: example.com
\`\`\`
```

## Structure

- `src/mod.ts`: worker file

## Documentation

- Deno + wrangler environment: ./docs/deno-wrangler-setup-instruction.md
