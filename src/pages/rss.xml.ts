import rss from "@astrojs/rss"
import type { APIContext } from "astro"
import { SITE, TOPICS } from "../site"
import { articleUrl, getArticles } from "../lib/articles"

export async function GET(context: APIContext) {
  const articles = await getArticles()
  return rss({
    title: `${SITE.name} fact-checks`,
    description: SITE.description,
    site: context.site!,
    trailingSlash: true,
    stylesheet: "/rss.xsl",
    customData: "<language>en-us</language>",
    items: articles.map(a => ({
      title: a.data.title,
      link: articleUrl(a),
      pubDate: a.data.date,
      description: `Verdict: ${a.data.verdict}. ${a.data.description}`,
      categories: a.data.tags.map(t => TOPICS[t].label),
    })),
  })
}
