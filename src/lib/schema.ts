import { SITE, TOPICS, VERDICTS } from "../site"
import { isoDate, lastUpdated, type Article } from "./articles"

const ORG_ID = `${SITE.url}/#organization`
const SITE_ID = `${SITE.url}/#website`
const abs = (path: string) => new URL(path, SITE.url).href

export const organization = (logoUrl: string) => ({
  "@type": "Organization",
  "@id": ORG_ID,
  name: SITE.name,
  url: `${SITE.url}/`,
  logo: { "@type": "ImageObject", url: logoUrl },
  email: SITE.email,
  description: SITE.description,
  publishingPrinciples: abs("/methodology/"),
  correctionsPolicy: abs("/methodology/#corrections"),
})

export const website = () => ({
  "@type": "WebSite",
  "@id": SITE_ID,
  url: `${SITE.url}/`,
  name: SITE.name,
  description: SITE.description,
  inLanguage: "en",
  publisher: { "@id": ORG_ID },
  about: [
    { "@type": "Person", name: "Ethan Klein", sameAs: "https://en.wikipedia.org/wiki/Ethan_and_Hila_Klein" },
    { "@type": "Person", name: "Hila Klein", sameAs: "https://en.wikipedia.org/wiki/Ethan_and_Hila_Klein" },
    { "@type": "CreativeWorkSeries", name: "H3 Podcast", sameAs: "https://en.wikipedia.org/wiki/H3_Podcast" },
  ],
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE.url}/articles/?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
})

export const breadcrumbs = (items: { name: string; path: string }[]) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    item: abs(item.path),
  })),
})

export const webPage = (type: string, path: string, name: string, description: string) => ({
  "@type": type,
  "@id": abs(path),
  url: abs(path),
  name,
  description,
  isPartOf: { "@id": SITE_ID },
  publisher: { "@id": ORG_ID },
  inLanguage: "en",
})

export function articleGraph(article: Article, path: string, imageUrl: string) {
  const { title, description, date, claim, claimant, verdict, tags } = article.data
  const url = abs(path)
  const modified = lastUpdated(article) ?? date

  const newsArticle = {
    "@type": "Article",
    "@id": `${url}#article`,
    headline: title,
    description,
    image: [imageUrl],
    datePublished: isoDate(date),
    dateModified: isoDate(modified),
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: url,
    isPartOf: { "@id": SITE_ID },
    articleSection: TOPICS[tags[0]].label,
    keywords: tags.map(t => TOPICS[t].label),
    inLanguage: "en",
  }

  const claimReview = {
    "@type": "ClaimReview",
    "@id": `${url}#claimreview`,
    url,
    claimReviewed: claim,
    datePublished: isoDate(date),
    author: { "@id": ORG_ID },
    itemReviewed: {
      "@type": "Claim",
      ...(claimant && {
        author: { "@type": claimant.startsWith("r/") ? "Organization" : "Person", name: claimant },
      }),
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: VERDICTS[verdict].rating,
      bestRating: 5,
      worstRating: 1,
      alternateName: verdict,
    },
  }

  return [newsArticle, claimReview]
}

export const toJsonLd = (graph: object[]) =>
  JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c")
