import fs from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"
import type { APIRoute } from "astro"
import { getArticles } from "../../lib/articles"

const W = 1200
const H = 630

export async function getStaticPaths() {
  return (await getArticles()).map(a => ({ params: { slug: a.id }, props: { file: a.filePath! } }))
}

// Screenshots vary in size and shape, so the full image is centered over a blurred fill instead of cropped or distorted.
export const GET: APIRoute = async ({ props }) => {
  const file = props.file as string
  const rel = (await fs.readFile(file, "utf8")).match(/^featuredImage:\s*(\S+)/m)![1]
  const src = await fs.readFile(path.join(path.dirname(file), rel))

  const fill = await sharp(src).resize(W, H, { fit: "cover" }).blur(40).modulate({ brightness: 0.65 }).toBuffer()
  const photo = await sharp(src).resize(W, H, { fit: "inside" }).toBuffer()
  const jpeg = await sharp(fill)
    .composite([{ input: photo, gravity: "center" }])
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer()

  return new Response(new Uint8Array(jpeg), { headers: { "Content-Type": "image/jpeg" } })
}
