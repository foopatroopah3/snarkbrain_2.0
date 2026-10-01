import { readFileSync } from "node:fs"
import path from "node:path"
import { create, type Font } from "fontkitten"
import sharp from "sharp"

const W = 1200
const H = 630
const MIDDLE_LEFT = 285
const MIDDLE_RIGHT = 915

const asset = (name: string) => readFileSync(path.join(process.cwd(), "src", "assets", name))
const fonts = {
  medium: create(asset("share-card-montserrat-500.ttf")) as Font,
  bold: create(asset("share-card-montserrat-800.ttf")) as Font,
}
const logo = asset("logo-mark.png").toString("base64")

type Weight = keyof typeof fonts
type Panel = { eyebrow: string; title: string; detail?: string; titleSize?: number }
export type ShareCard = {
  center: { kind: "brand" } | { kind: "text"; title: string } | { kind: "article"; image: Buffer }
  left: Panel
  right: Panel
  accent?: string
}

function width(value: string, size: number, weight: Weight) {
  const font = fonts[weight]
  return (
    ([...value].reduce((sum, char) => sum + font.glyphForCodePoint(char.codePointAt(0)!).advanceWidth, 0) * size) /
    font.unitsPerEm
  )
}

function text(
  value: string,
  x: number,
  baseline: number,
  size: number,
  color: string,
  weight: Weight,
  align: "start" | "center" = "start",
) {
  const font = fonts[weight]
  const scale = size / font.unitsPerEm
  const start = align === "center" ? x - width(value, size, weight) / 2 : x
  let advance = 0
  const glyphs = [...value]
    .map(char => {
      const glyph = font.glyphForCodePoint(char.codePointAt(0)!)
      const path = `<path transform="translate(${advance} 0)" d="${glyph.path.toSVG()}"/>`
      advance += glyph.advanceWidth
      return path
    })
    .join("")
  return `<g fill="${color}" transform="translate(${start} ${baseline}) scale(${scale} ${-scale})">${glyphs}</g>`
}

function lines(value: string, maxWidth: number, size: number, weight: Weight, maxLines: number) {
  const words = value.trim().split(/\s+/)
  const out: string[] = []
  for (const word of words) {
    const index = out.length - 1
    if (index >= 0 && width(`${out[index]} ${word}`, size, weight) <= maxWidth) {
      out[index] += ` ${word}`
    } else {
      out.push(word)
    }
  }
  if (out.length > maxLines) {
    out.length = maxLines
    let last = out[maxLines - 1]
    while (last && width(`${last}…`, size, weight) > maxWidth) last = last.slice(0, -1)
    out[maxLines - 1] = `${last.trimEnd()}…`
  }
  return out
}

function panel(panel: Panel, x: number, accent: string) {
  const size = panel.titleSize ?? 31
  const title = lines(panel.title, 227, size, "bold", 8)
  const titleTop = 155
  const detailTop = Math.max(288, titleTop + title.length * (size * 1.13) + 22)
  const detail = panel.detail ? lines(panel.detail, 227, 22, "medium", 8) : []
  return [
    `<rect x="${x}" y="48" width="58" height="5" rx="2.5" fill="${accent}"/>`,
    text(panel.eyebrow.toUpperCase(), x, 111, 21, accent, "bold"),
    ...title.map((line, i) => text(line, x, titleTop + i * size * 1.13, size, "#f9f5f6", "bold")),
    ...detail.map((line, i) => text(line, x, detailTop + i * 29, 22, "#c8c0c8", "medium")),
    text(x < MIDDLE_LEFT ? "SNARKBRAIN" : "snarkbrain.com", x, 578, 19, "#9f929d", "medium"),
  ].join("")
}

async function middle(center: ShareCard["center"]) {
  if (center.kind === "brand") {
    return [
      `<image x="388" y="105" width="424" height="240" href="data:image/png;base64,${logo}"/>`,
      text("SnarkBrain", 600, 453, 75, "#fff9fa", "bold", "center"),
    ].join("")
  }
  if (center.kind === "article") {
    const fill = await sharp(center.image)
      .resize(540, 536, { fit: "cover" })
      .blur(30)
      .modulate({ brightness: 0.42 })
      .toBuffer()
    const foreground = await sharp(center.image).resize(540, 536, { fit: "inside" }).toBuffer()
    const thumbnail = await sharp(fill)
      .composite([{ input: foreground, gravity: "center" }])
      .png()
      .toBuffer()
    return [
      `<image x="330" y="47" width="540" height="536" href="data:image/png;base64,${thumbnail.toString("base64")}" clip-path="url(#article-image)"/>`,
      `<rect x="330" y="47" width="540" height="536" rx="20" fill="none" stroke="#ffffff" stroke-opacity=".28" stroke-width="3"/>`,
      `<rect x="733" y="472" width="125" height="98" rx="18" fill="#1c1720" fill-opacity=".93" stroke="#ff7899" stroke-opacity=".6" stroke-width="2"/>`,
      `<image x="744" y="490" width="103" height="59" href="data:image/png;base64,${logo}"/>`,
    ].join("")
  }
  let size = 82
  let wrapped = lines(center.title, 528, size, "bold", 3)
  while (size > 60 && (wrapped.at(-1)?.endsWith("…") || wrapped.some(line => width(line, size, "bold") > 528))) {
    size -= 2
    wrapped = lines(center.title, 528, size, "bold", 3)
  }
  const lineHeight = size * 1.13
  const firstBaseline = wrapped.length === 1 ? 420 : wrapped.length === 2 ? 360 : 310
  const logoY = wrapped.length === 1 ? 112 : wrapped.length === 2 ? 83 : 60
  return [
    `<image x="470" y="${logoY}" width="260" height="147" href="data:image/png;base64,${logo}"/>`,
    ...wrapped.map((line, i) => text(line, 600, firstBaseline + i * lineHeight, size, "#fff9fa", "bold", "center")),
  ].join("")
}

export async function renderShareCard(card: ShareCard) {
  const accent = card.accent ?? "#ff7899"
  const center = await middle(card.center)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <radialGradient id="glow"><stop stop-color="#553044"/><stop offset="1" stop-color="#2a1d2a"/></radialGradient>
      <linearGradient id="edge" x2="0" y2="1"><stop stop-color="#1e1b22"/><stop offset="1" stop-color="#141319"/></linearGradient>
      <clipPath id="middle"><rect x="${MIDDLE_LEFT}" width="630" height="630"/></clipPath>
      <clipPath id="article-image"><rect x="330" y="47" width="540" height="536" rx="20"/></clipPath>
    </defs>
    <rect width="1200" height="630" fill="url(#edge)"/>
    <rect x="${MIDDLE_LEFT}" width="630" height="630" fill="url(#glow)"/>
    <g clip-path="url(#middle)"><circle cx="600" cy="315" r="258" fill="none" stroke="#ff7899" stroke-opacity=".09" stroke-width="2"/></g>
    <path d="M285 0v630M915 0v630" stroke="#594150" stroke-width="2"/>
    <path d="M344 48h512M344 582h512" stroke="${accent}" stroke-opacity=".85" stroke-width="3" stroke-linecap="round"/>
    ${panel(card.left, 34, accent)}
    ${center}
    ${panel(card.right, 948, accent)}
  </svg>`
  return sharp(Buffer.from(svg)).jpeg({ quality: 86, mozjpeg: true }).toBuffer()
}
