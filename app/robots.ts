import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://directcarehub.ca";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing", "/privacy", "/terms", "/login", "/signup"],
        disallow: [
          "/dashboard/",
          "/payroll/",
          "/protocols/",
          "/attendants/",
          "/vault/",
          "/training/",
          "/settings/",
          "/api/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
