import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://omogle.vercel.app';
  const now = new Date();

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'always',
      priority: 1,
    },
    {
      url: `${baseUrl}/battle`,
      lastModified: now,
      changeFrequency: 'always',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/mogged`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/hunter-eyes-test`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.82,
    },
    {
      url: `${baseUrl}/looksmax`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.80,
    },
  ];
}
