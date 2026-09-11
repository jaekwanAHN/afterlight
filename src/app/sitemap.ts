import type { MetadataRoute } from "next";
import { SITE_URL } from "./site";
// `/game` is the same page as `/` and is canonicalised to it, so only `/` is listed.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_URL, changeFrequency: "monthly", priority: 1 }];
}
