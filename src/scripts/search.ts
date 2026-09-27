type Result = { url: string; excerpt: string; meta: { title?: string; verdict?: string } }
type Pagefind = {
  init(): Promise<void>
  debouncedSearch(
    query: string,
    options?: object,
    ms?: number,
  ): Promise<{ results: { data(): Promise<Result> }[] } | null>
}

const PAGEFIND = "/pagefind/pagefind.js"
const dialog = document.getElementById("search") as HTMLDialogElement
const input = document.getElementById("search-input") as HTMLInputElement
const results = document.getElementById("search-results") as HTMLElement
let pagefind: Promise<Pagefind> | undefined

const load = () =>
  (pagefind ??= import(/* @vite-ignore */ PAGEFIND).then(async (pf: Pagefind) => {
    await pf.init()
    return pf
  }))

const escape = (s = "") =>
  s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)

const slug = (s: string) => s.toLowerCase().replace(/\s+/g, "-")

function message(text: string) {
  results.innerHTML = `<p class="empty">${text}</p>`
}

async function run(query: string) {
  if (!query.trim()) return results.replaceChildren()
  let pf: Pagefind
  try {
    pf = await load()
  } catch {
    pagefind = undefined
    return message("Search is available on the built site.")
  }
  const search = await pf.debouncedSearch(query, {}, 120)
  if (!search || input.value !== query) return
  const items = await Promise.all(search.results.slice(0, 8).map(r => r.data()))
  if (input.value !== query) return
  if (!items.length) return message(`No fact-checks match “${escape(query)}”.`)
  results.innerHTML = `<ul>${items
    .map(
      r => `<li><a href="${r.url}">
        <span class="title">${escape(r.meta.title)}</span>
        ${r.meta.verdict ? `<span class="verdict verdict--sm verdict--${slug(r.meta.verdict)}">${escape(r.meta.verdict)}</span>` : ""}
        <span class="excerpt">${r.excerpt}</span>
      </a></li>`,
    )
    .join("")}</ul>`
}

input.addEventListener("input", () => run(input.value))
dialog.querySelector("form")!.addEventListener("submit", e => {
  e.preventDefault()
  results.querySelector("a")?.click()
})
dialog.querySelector("[data-search-close]")!.addEventListener("click", () => dialog.close())
dialog.addEventListener("click", e => {
  if (e.target === dialog) dialog.close()
})

export function open(query = "") {
  if (!dialog.open) dialog.showModal()
  if (query) input.value = query
  input.focus()
  input.select()
  load().catch(() => {})
  if (input.value) run(input.value)
}
