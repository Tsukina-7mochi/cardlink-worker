import * as cheerio from "cheerio";

export interface Metadata {
  readonly title?: string;
  readonly description?: string;
  readonly image?: string;
  readonly favicon?: string;
}

export function parseMetadata(html: string): Metadata {
  const $ = cheerio.load(html);

  const ogTitle = $('meta[property="og:title"]').attr("content");
  const title = ogTitle || $("title").text().trim() || undefined;
  const description = $('meta[property="og:description"]').attr("content") ||
    undefined;
  const image = $('meta[property="og:image"]').attr("content") || undefined;
  const favicon =
    $('link[rel="icon"], link[rel="shortcut icon"]').attr("href") || undefined;

  return { title, description, image, favicon };
}
