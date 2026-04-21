import { promises as fs } from "node:fs";
import path from "node:path";

const WRITING_DIR = path.join(process.cwd(), "app", "writing", "(posts)");

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  pubDate: string;
  tags?: string[];
};

// Minimal ES-module-metadata extraction. Each post is
// app/writing/<slug>/page.mdx and starts with an `export const metadata = {...}`
// block. We avoid compiling the full MDX here — just parse the frontmatter-
// style object out of the source file with a regex.
const META_RE = /export\s+const\s+metadata\s*=\s*({[\s\S]*?\n})\s*;/;

function unquoteKey(s: string): string {
  return s.replace(/^["'](.+)["']$/, "$1");
}

function parseMetadataBlock(src: string): Partial<PostMeta> | null {
  const match = src.match(META_RE);
  if (!match) return null;
  const body = match[1];
  // Strip braces, split on top-level commas. Posts keep metadata shallow
  // (strings + simple arrays), so naive parsing is fine here.
  const inner = body.replace(/^{/, "").replace(/}\s*$/, "");
  const entries: Partial<PostMeta> = {};
  // Match key: "value" or key: [..] entries.
  const pairRe = /(\w+)\s*:\s*(?:"([^"]*)"|'([^']*)'|\[([^\]]*)\])/g;
  let m: RegExpExecArray | null;
  while ((m = pairRe.exec(inner)) !== null) {
    const key = m[1];
    if (m[2] !== undefined || m[3] !== undefined) {
      (entries as Record<string, unknown>)[key] = m[2] ?? m[3];
    } else if (m[4] !== undefined) {
      (entries as Record<string, unknown>)[key] = m[4]
        .split(",")
        .map((x) => unquoteKey(x.trim()))
        .filter(Boolean);
    }
  }
  return entries;
}

export async function getAllPosts(): Promise<PostMeta[]> {
  const entries = await fs.readdir(WRITING_DIR, { withFileTypes: true });
  const posts: PostMeta[] = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const mdx = path.join(WRITING_DIR, e.name, "page.mdx");
    try {
      const src = await fs.readFile(mdx, "utf8");
      const meta = parseMetadataBlock(src);
      if (meta?.title && meta.pubDate && meta.description) {
        posts.push({
          slug: e.name,
          title: meta.title,
          description: meta.description,
          pubDate: meta.pubDate,
          tags: meta.tags,
        });
      }
    } catch {
      // not a post directory
    }
  }
  return posts.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );
}
