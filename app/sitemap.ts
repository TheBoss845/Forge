import type { MetadataRoute } from "next";

import { getAppUrl } from "@/lib/utilities/app-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getAppUrl();
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/demo`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/try`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/register`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/login`, changeFrequency: "monthly", priority: 0.4 },
  ];
}
