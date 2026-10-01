import type { APIRoute } from "astro"
import { citationCount, getArticles, topicCounts } from "../../../../lib/articles"
import { renderShareCard, type ShareCard } from "../../../../lib/share-card"

const kinds = ["home", "articles", "topics", "about", "methodology", "contact", "privacy"] as const
type Kind = (typeof kinds)[number]

export function getStaticPaths() {
  return kinds.map(kind => ({ params: { kind }, props: { kind } }))
}

export const GET: APIRoute = async ({ props }) => {
  const kind = props.kind as Kind
  const articles = await getArticles()
  const count = articles.length
  const topics = topicCounts(articles).length
  const sources = articles.reduce((total, article) => total + citationCount(article), 0)
  const cards: Record<Kind, ShareCard> = {
    home: {
      center: { kind: "brand" },
      left: {
        eyebrow: "H3 claims",
        title: "Fact checks with full context",
        detail: "Ethan Klein, Hila Klein and the H3 Podcast.",
      },
      right: {
        eyebrow: "Evidence first",
        title: `${count} fact checks`,
        detail: `${topics} topics · ${sources} cited sources. Clear verdicts, full clips and public records.`,
      },
    },
    articles: {
      center: { kind: "text", title: "Fact checks" },
      left: {
        eyebrow: "The archive",
        title: "H3 claims, checked",
        detail: "Browse claims about Ethan Klein, Hila Klein and the H3 Podcast.",
      },
      right: {
        eyebrow: "Browse",
        title: `${count} fact checks`,
        detail: `${topics} topics. Every claim has a verdict and cited sources.`,
      },
    },
    topics: {
      center: { kind: "text", title: "Topics" },
      left: {
        eyebrow: "Explore",
        title: "Find claims by subject",
        detail: "From past content to lawsuits and public statements.",
      },
      right: {
        eyebrow: "Browse",
        title: `${topics} topics`,
        detail: `${count} fact checks, each linked to its source material.`,
      },
    },
    about: {
      center: { kind: "text", title: "About" },
      left: {
        eyebrow: "SnarkBrain",
        title: "Why this site exists",
        detail: "H3 claims traced back to their original context.",
      },
      right: {
        eyebrow: "Read",
        title: "About the project",
        detail: "Who writes the fact checks and how to examine the evidence yourself.",
      },
    },
    methodology: {
      center: { kind: "text", title: "Methodology" },
      left: {
        eyebrow: "Our process",
        title: "Primary sources first",
        detail: "Full episodes, public records and direct citations.",
      },
      right: { eyebrow: "Read", title: "How verdicts work", detail: "How claims are selected, rated and corrected." },
    },
    contact: {
      center: { kind: "text", title: "Contact" },
      left: {
        eyebrow: "Get in touch",
        title: "Suggest a claim",
        detail: "Send links and timestamps for something we should check.",
      },
      right: {
        eyebrow: "Feedback",
        title: "Report an error",
        detail: "Share evidence or a correction for a published fact check.",
      },
    },
    privacy: {
      center: { kind: "text", title: "Privacy" },
      left: {
        eyebrow: "SnarkBrain",
        title: "How the site handles data",
        detail: "Read about visits, contact and external links.",
      },
      right: {
        eyebrow: "Policy",
        title: "Privacy information",
        detail: "The site's current privacy terms and practices.",
      },
    },
  }
  const image = await renderShareCard(cards[kind])
  return new Response(new Uint8Array(image), { headers: { "Content-Type": "image/jpeg" } })
}
