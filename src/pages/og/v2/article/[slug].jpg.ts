import fs from "node:fs/promises"
import path from "node:path"
import type { APIRoute } from "astro"
import { formatDate, getArticles, type Article } from "../../../../lib/articles"
import { renderShareCard } from "../../../../lib/share-card"
import { TOPICS, VERDICTS } from "../../../../site"

export async function getStaticPaths() {
  return (await getArticles()).map(article => ({ params: { slug: article.id }, props: { article } }))
}

export const GET: APIRoute = async ({ props }) => {
  const article = props.article as Article
  const verdict = article.data.verdict
  const file = article.filePath!
  const relativeImage = (await fs.readFile(file, "utf8")).match(/^featuredImage:\s*(\S+)/m)?.[1]
  if (!relativeImage) throw new Error(`Missing featured image for ${article.id}`)
  const thumbnail = await fs.readFile(path.resolve(path.dirname(file), relativeImage))
  const image = await renderShareCard({
    center: { kind: "article", image: thumbnail },
    left: { eyebrow: "Fact check", title: article.data.title, titleSize: 28 },
    right: {
      eyebrow: "Verdict",
      title: verdict,
      titleSize: verdict === "Misleading" ? 38 : 48,
      detail: `${VERDICTS[verdict].summary} ${TOPICS[article.data.tags[0]].label} · ${formatDate(article.data.date)}`,
    },
    accent: verdict === "Misleading" ? "#ffd28a" : verdict === "True" ? "#8ae4bd" : "#ff7899",
  })
  return new Response(new Uint8Array(image), { headers: { "Content-Type": "image/jpeg" } })
}
