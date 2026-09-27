import { SITE, TOPICS } from "../site"
import { articleUrl, getArticles, isoDate } from "../lib/articles"

export async function GET() {
  const articles = await getArticles()
  const abs = (path: string) => new URL(path, SITE.url).href

  const body = [
    `# ${SITE.name}`,
    "",
    `> ${SITE.description}`,
    "",
    "Each fact-check states a claim, rates it (False, Misleading, Mixed or True) and cites the primary sources behind the rating.",
    "",
    "## Fact-checks",
    "",
    ...articles.map(
      a =>
        `- [${a.data.title}](${abs(articleUrl(a))}): Verdict: ${a.data.verdict}. Claim: "${a.data.claim}" ${a.data.description} (${isoDate(a.data.date)}; ${a.data.tags.map(t => TOPICS[t].label).join(", ")})`,
    ),
    "",
    "## About",
    "",
    `- [Methodology](${abs("/methodology/")}): sourcing standards and verdict definitions`,
    `- [About](${abs("/about/")}): who writes SnarkBrain`,
    `- [Contact](${abs("/contact/")}): suggest a claim, report an error or submit evidence`,
    "",
  ].join("\n")

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } })
}
