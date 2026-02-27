export interface Metadata {
  readonly title?: string;
  readonly description?: string;
  readonly image?: string;
  readonly favicon?: string;
}

function extractMetaContent(
  html: string,
  property: string,
): string | undefined {
  const pattern = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']` +
      `|<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
    "i",
  );
  const match = html.match(pattern);
  return match?.[1] ?? match?.[2];
}

function extractTitle(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match?.[1]?.trim();
}

function extractFavicon(html: string): string | undefined {
  const match = html.match(
    /<link[^>]+rel=["'](?:icon|shortcut icon)["'][^>]+href=["']([^"']+)["']/i,
  );
  return match?.[1];
}

export function parseMetadata(html: string): Metadata {
  const ogTitle = extractMetaContent(html, "og:title");
  const title = ogTitle ?? extractTitle(html);
  const description = extractMetaContent(html, "og:description");
  const image = extractMetaContent(html, "og:image");
  const favicon = extractFavicon(html);

  return { title, description, image, favicon };
}
