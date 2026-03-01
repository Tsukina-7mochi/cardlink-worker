import { stringify } from "@std/yaml";
import { parseMetadata } from "./parse-metadata.ts";

function buildCardlink(url: string, html: string): string {
  const meta = parseMetadata(html);
  const host = new URL(url).hostname;

  const fields: Record<string, string> = { url };
  if (meta.title) fields.title = meta.title;
  if (meta.description) fields.description = meta.description;
  fields.host = host;
  if (meta.favicon) {
    fields.favicon = meta.favicon.startsWith("http")
      ? meta.favicon
      : new URL(meta.favicon, url).href;
  }
  if (meta.image) {
    fields.image = meta.image.startsWith("http")
      ? meta.image
      : new URL(meta.image, url).href;
  }

  const yaml = stringify(fields, { lineWidth: -1 }).trimEnd();
  return "```cardlink\n" + yaml + "\n```";
}

export default {
  async fetch(request: Request): Promise<Response> {
    const path = new URL(request.url).pathname.slice(1);

    if (!path) {
      return new Response("Usage: /{url-encoded-target-url}", { status: 400 });
    }

    let targetUrl: string;
    try {
      targetUrl = decodeURIComponent(path);
    } catch {
      return new Response("Invalid URL encoding", { status: 400 });
    }

    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      return new Response("URL must start with http:// or https://", {
        status: 400,
      });
    }

    let html: string;
    try {
      const res = await fetch(targetUrl);
      html = await res.text();
    } catch (error) {
      return new Response(
        `Failed to fetch target URL: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        { status: 502 },
      );
    }

    const cardlink = buildCardlink(targetUrl, html);

    return new Response(cardlink, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  },
} satisfies ExportedHandler<Env>;
