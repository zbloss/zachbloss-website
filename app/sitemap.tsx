import { MetadataRoute } from 'next'
import WebsiteURL from '@/app/components/WebsiteURL'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = ['', '/'].map((route) => ({
    url: `${WebsiteURL}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  return [...routes]
}