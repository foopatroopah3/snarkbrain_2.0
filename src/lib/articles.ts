import { getCollection, type CollectionEntry } from "astro:content"
import { TOPICS, type Topic } from "../site"

export type Article = CollectionEntry<"articles">

const byDateDesc = (a: Article, b: Article) =>
  b.data.date.valueOf() - a.data.date.valueOf() || a.data.title.localeCompare(b.data.title)

export async function getArticles() {
  return (await getCollection("articles")).sort(byDateDesc)
}

export const articleUrl = (a: Article) => `/${a.id}/`
export const topicUrl = (t: Topic) => `/topics/${t}/`

// Frontmatter dates are calendar days; format in UTC so they don't shift a day in negative offsets.
const fmt = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" })
export const formatDate = (d: Date) => fmt.format(d)
export const isoDate = (d: Date) => d.toISOString().slice(0, 10)

export const lastUpdated = (a: Article) => {
  const dates = [a.data.updated, ...a.data.corrections.map(c => c.date)].filter(Boolean) as Date[]
  return dates.length ? new Date(Math.max(...dates.map(d => d.valueOf()))) : undefined
}

const wordCount = (a: Article) =>
  (a.body ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\]\([^)]*\)/g, "]")
    .split(/\s+/)
    .filter(Boolean).length

export const readingMinutes = (a: Article) => Math.max(1, Math.round(wordCount(a) / 230))

export const citationCount = (a: Article) => (a.body?.match(/<span id="ref\d+"/g) ?? []).length

export function related(article: Article, all: Article[], limit = 3) {
  const tags = new Set(article.data.tags)
  return all
    .filter(a => a.id !== article.id)
    .map(a => ({ a, score: a.data.tags.filter(t => tags.has(t)).length }))
    .filter(x => x.score > 0)
    .sort((x, y) => y.score - x.score || byDateDesc(x.a, y.a))
    .slice(0, limit)
    .map(x => x.a)
}

export function topicCounts(all: Article[]) {
  return (Object.keys(TOPICS) as Topic[])
    .map(t => ({ topic: t, ...TOPICS[t], count: all.filter(a => a.data.tags.includes(t)).length }))
    .filter(t => t.count > 0)
    .sort((a, b) => b.count - a.count)
}
