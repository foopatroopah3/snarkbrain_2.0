import type { APIRoute } from "astro"
import { formatDate, getArticles, type Article } from "../../../../lib/articles"
import { ARTICLE_SHARE_LABELS } from "../../../../lib/article-share-labels"
import { renderShareCard, articleCenterTitle } from "../../../../lib/share-card"
import { TOPICS, VERDICTS } from "../../../../site"

export async function getStaticPaths() {
  return (await getArticles()).map(article => ({ params: { slug: article.id }, props: { article } }))
}

export const GET: APIRoute = async ({ props }) => {
  const article = props.article as Article
  const verdict = article.data.verdict
  const image = await renderShareCard({
    center: { kind: "text", title: ARTICLE_SHARE_LABELS[article.id] ?? articleCenterTitle(article.data.title) },
    left: { eyebrow: "Fact check", title: article.data.title, titleSize: 28 },
    right: {
      eyebrow: "Verdict",
      title: verdict,
      titleSize: 48,
      detail: `${VERDICTS[verdict].summary} ${TOPICS[article.data.tags[0]].label} · ${formatDate(article.data.date)}`,
    },
    accent: verdict === "Misleading" ? "#ffd28a" : verdict === "True" ? "#8ae4bd" : "#ff7899",
  })
  return new Response(new Uint8Array(image), { headers: { "Content-Type": "image/jpeg" } })
}
