import { assertEquals, assertStringIncludes } from "@std/assert";
import worker from "./src/mod.ts";

const SAMPLE_HTML = `<!DOCTYPE html>
<html>
<head>
  <title>Example Domain</title>
  <meta property="og:title" content="Example OG Title" />
  <meta property="og:description" content="This is an example." />
  <meta property="og:image" content="https://example.com/image.png" />
  <link rel="icon" href="/favicon.ico" />
</head>
<body></body>
</html>`;

const MINIMAL_HTML = `<!DOCTYPE html>
<html><head><title>Minimal</title></head><body></body></html>`;

function mockFetch(html: string): typeof globalThis.fetch {
  return (_input: string | URL | Request) =>
    Promise.resolve(new Response(html, { status: 200 }));
}

function makeRequest(path: string): Request {
  return new Request(`https://worker.test/${path}`);
}

const originalFetch = globalThis.fetch;

function withMockFetch(
  html: string,
  fn: () => Promise<void>,
): () => Promise<void> {
  return async () => {
    globalThis.fetch = mockFetch(html);
    try {
      await fn();
    } finally {
      globalThis.fetch = originalFetch;
    }
  };
}

Deno.test("returns 404 for non-api paths (static assets handled by CF)", async () => {
  const res = await worker.fetch(makeRequest(""));
  assertEquals(res.status, 404);
});

Deno.test("returns 400 for empty api path", async () => {
  const res = await worker.fetch(makeRequest("api/"));
  assertEquals(res.status, 400);
});

Deno.test("returns 400 for non-http URL", async () => {
  const res = await worker.fetch(
    makeRequest("api/ftp%3A%2F%2Fexample.com"),
  );
  assertEquals(res.status, 400);
  const text = await res.text();
  assertStringIncludes(text, "http");
});

Deno.test(
  "returns cardlink with all OGP fields",
  withMockFetch(SAMPLE_HTML, async () => {
    const target = encodeURIComponent("https://example.com");
    const res = await worker.fetch(makeRequest(`api/${target}`));

    assertEquals(res.status, 200);
    assertEquals(res.headers.get("content-type"), "text/plain; charset=utf-8");

    const text = await res.text();
    assertStringIncludes(text, "```cardlink");
    assertStringIncludes(text, "url: 'https://example.com'");
    assertStringIncludes(text, "title: Example OG Title");
    assertStringIncludes(text, "description: This is an example.");
    assertStringIncludes(text, "host: example.com");
    assertStringIncludes(text, "favicon: 'https://example.com/favicon.ico'");
    assertStringIncludes(text, "image: 'https://example.com/image.png'");
  }),
);

Deno.test(
  "returns cardlink with minimal fields",
  withMockFetch(MINIMAL_HTML, async () => {
    const target = encodeURIComponent("https://example.com/page");
    const res = await worker.fetch(makeRequest(`api/${target}`));

    assertEquals(res.status, 200);
    const text = await res.text();
    assertStringIncludes(text, "url: 'https://example.com/page'");
    assertStringIncludes(text, "title: Minimal");
    assertStringIncludes(text, "host: example.com");
  }),
);

Deno.test("returns 502 when fetch fails", async () => {
  globalThis.fetch = () => Promise.reject(new Error("Connection refused"));
  try {
    const target = encodeURIComponent("https://unreachable.test");
    const res = await worker.fetch(makeRequest(`api/${target}`));
    assertEquals(res.status, 502);
    const text = await res.text();
    assertStringIncludes(text, "Connection refused");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
