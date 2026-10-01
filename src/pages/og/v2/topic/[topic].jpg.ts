import type { APIRoute } from "astro"
import { getArticles } from "../../../../lib/articles"
import { renderShareCard } from "../../../../lib/share-card"
import { TOPICS, type Topic } from "../../../../site"

export async function getStaticPaths() {
  const articles = await getArticles()
  return (Object.keys(TOPICS) as Topic[])
    .filter(topic => articles.some(article => article.data.tags.includes(topic)))
    .map(topic => ({
      params: { topic },
      props: { topic, count: articles.filter(a => a.data.tags.includes(topic)).length },
    }))
}

export const GET: APIRoute = async ({ props }) => {
  const topic = props.topic as Topic
  const count = props.count as number
  const { label, description } = TOPICS[topic]
  const image = await renderShareCard({
    center: { kind: "text", title: label },
    left: { eyebrow: "Topic", title: label, detail: "H3 claims, checked against the full record." },
    right: { eyebrow: "Browse", title: `${count} fact check${count === 1 ? "" : "s"}`, detail: description },
  })
  return new Response(new Uint8Array(image), { headers: { "Content-Type": "image/jpeg" } })
}
