import type { MetadataRoute } from "next";

import { getAppUrl } from "@/lib/utilities/app-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Authenticated and API surfaces have no business in search results.
      disallow: [
        "/api/",
        "/dashboard",
        "/projects",
        "/settings",
        "/onboarding",
      ],
    },
    sitemap: `${getAppUrl()}/sitemap.xml`,
  };
}
