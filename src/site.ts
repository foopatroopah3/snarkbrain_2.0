export const SITE = {
  name: "SnarkBrain",
  url: "https://snarkbrain.com",
  tagline: "Fact-checking H3 claims with full context and cited sources",
  description:
    "Fact checks on claims about Ethan Klein, Hila Klein and the H3 Podcast, with clear verdicts, full clips, public records and cited sources.",
  email: "contact@snarkbrain.com",
  locale: "en_US",
}

export const VERDICTS = {
  False: {
    slug: "false",
    rating: 1,
    summary: "The claim is not supported by the evidence.",
  },
  Misleading: {
    slug: "misleading",
    rating: 2,
    summary: "The claim is built on something real, but distorts it or strips it of context.",
  },
  Mixed: {
    slug: "mixed",
    rating: 3,
    summary: "The claim is partly accurate and partly inaccurate.",
  },
  True: {
    slug: "true",
    rating: 5,
    summary: "The claim is accurate and supported by the evidence.",
  },
} as const

export type Verdict = keyof typeof VERDICTS
export const VERDICT_NAMES = Object.keys(VERDICTS) as [Verdict, ...Verdict[]]

export const TOPICS = {
  "israel-palestine": {
    label: "Israel & Palestine",
    description:
      "Claims about Ethan and Hila Klein's views on Israel, Zionism and Gaza, Hila's IDF service, and their reactions to the war.",
  },
  "bigotry-allegations": {
    label: "Bigotry Allegations",
    description: "Accusations of racism, Islamophobia and anti-Arab bias, and what the full record shows.",
  },
  "lawsuits-copyright": {
    label: "Lawsuits & Copyright",
    description:
      "The Content Nuke lawsuits against Denims, Frogan and Kaceytron, the Hasan Piker fallout, DMCA takedowns, fair use and clip channels.",
  },
  "censorship-claims": {
    label: "Censorship Claims",
    description: "Claims that takedowns, reports and moderation were used to silence critics.",
  },
  "family-home": {
    label: "Family & Home",
    description: "Claims about the Klein household, their children, their pets and the CPS report.",
  },
  doxxing: {
    label: "Doxxing Claims",
    description: "Accusations of exposing private information about critics and defendants.",
  },
  "past-content": {
    label: "Past Content",
    description: "Old videos and podcast moments resurfaced without their original context.",
  },
  "show-guests": {
    label: "Guests & Crew",
    description: "How the H3 Podcast has treated its guests, crew and recurring personalities.",
  },
  business: {
    label: "Business & Money",
    description: "Sponsorships, Teddy Fresh and community fundraising.",
  },
  "fabricated-evidence": {
    label: "Fabricated Evidence",
    description: "Hoaxes built on doctored screenshots, edited clips and staged claims.",
  },
} as const

export type Topic = keyof typeof TOPICS
export const TOPIC_SLUGS = Object.keys(TOPICS) as [Topic, ...Topic[]]
