import fs from "node:fs"
import path from "node:path"
import { defineConfig, fontProviders } from "astro/config"
import sitemap from "@astrojs/sitemap"
import { satteri } from "@astrojs/markdown-satteri"

const SITE = "https://snarkbrain.com"

const articleSlugs = () =>
  fs
    .readdirSync("content/blog", { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)

const VIDEO = /\.(mp4|webm)$/i
const VIDEO_TYPES = { ".mp4": "video/mp4", ".webm": "video/webm" }

// Astro only processes images in content folders, so videos next to an article are served and copied alongside its page.
const articleVideos = {
  name: "article-videos",
  hooks: {
    "astro:server:setup": ({ server }) => {
      server.middlewares.use((req, res, next) => {
        const [slug, file] = decodeURI(req.url.split("?")[0]).split("/").filter(Boolean)
        const src = file && VIDEO.test(file) && path.join("content/blog", slug, file)
        if (!src || !fs.existsSync(src)) return next()
        const size = fs.statSync(src).size
        const [, from, to] = /bytes=(\d*)-(\d*)/.exec(req.headers.range ?? "") ?? []
        const start = from ? Number(from) : 0
        const end = to ? Number(to) : size - 1
        res.setHeader("Content-Type", VIDEO_TYPES[path.extname(file).toLowerCase()])
        res.setHeader("Accept-Ranges", "bytes")
        if (req.headers.range) {
          res.statusCode = 206
          res.setHeader("Content-Range", `bytes ${start}-${end}/${size}`)
        }
        res.setHeader("Content-Length", end - start + 1)
        fs.createReadStream(src, { start, end }).pipe(res)
      })
    },
    "astro:build:done": ({ dir }) => {
      for (const slug of articleSlugs()) {
        for (const file of fs.readdirSync(path.join("content/blog", slug)).filter(f => VIDEO.test(f))) {
          fs.copyFileSync(path.join("content/blog", slug, file), new URL(`${slug}/${file}`, dir))
        }
      }
    },
  },
}

const externalLinks = {
  name: "external-links",
  element: {
    filter: ["a"],
    visit(node, ctx) {
      const href = node.properties?.href
      if (typeof href !== "string" || !/^https?:\/\//.test(href) || href.startsWith(SITE)) return
      ctx.setProperty(node, "target", "_blank")
      ctx.setProperty(node, "rel", ["noopener", "noreferrer"])
    },
  },
}

const lastmod = new Map(
  articleSlugs().map(slug => {
    const fm = fs.readFileSync(`content/blog/${slug}/index.md`, "utf8")
    const date = fm.match(/^updated:\s*(\S+)/m)?.[1] ?? fm.match(/^date:\s*(\S+)/m)?.[1]
    return [`${SITE}/${slug}/`, date]
  }),
)

export default defineConfig({
  site: SITE,
  trailingSlash: "always",
  // Compression drops the newline between text and a following inline element, gluing words to links.
  compressHTML: false,
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  integrations: [
    articleVideos,
    sitemap({
      filter: page => !page.endsWith("/404/"),
      serialize: item => {
        const date = lastmod.get(item.url)
        return date ? { ...item, lastmod: new Date(date).toISOString() } : item
      },
    }),
  ],
  markdown: {
    processor: satteri({ hastPlugins: [externalLinks] }),
  },
  fonts: [
    {
      provider: fontProviders.local(),
      name: "Montserrat",
      cssVariable: "--font-sans",
      fallbacks: ["system-ui", "sans-serif"],
      options: {
        variants: [
          {
            src: ["@fontsource-variable/montserrat/files/montserrat-latin-wght-normal.woff2"],
            weight: "100 900",
            style: "normal",
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: "Source Serif 4",
      cssVariable: "--font-serif",
      fallbacks: ["Georgia", "serif"],
      options: {
        variants: [
          {
            src: ["@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-normal.woff2"],
            weight: "200 900",
            style: "normal",
          },
          {
            src: ["@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-italic.woff2"],
            weight: "200 900",
            style: "italic",
          },
        ],
      },
    },
  ],
})
