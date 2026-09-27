const article = document.querySelector<HTMLElement>(".article")

if (article) {
  const canShare = "share" in navigator && matchMedia("(pointer: coarse)").matches
  const label = canShare ? "Share this quote" : "Copy link to quote"

  const btn = document.createElement("button")
  btn.type = "button"
  btn.className = "quote-link"
  btn.hidden = true
  btn.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5"/></svg><span>${label}</span>`
  document.body.append(btn)
  const text = btn.querySelector("span")!

  let link = ""
  let quote = ""
  let resetTimer: number | undefined

  const norm = (s: string) => s.replace(/\s+/g, " ").trim()
  const words = (s: string) => norm(s).split(" ").filter(Boolean)
  // Text directives reserve "-", "," and "&", so they must be percent-encoded inside terms.
  const enc = (s: string) => encodeURIComponent(s).replace(/-/g, "%2D")
  const count = (hay: string, needle: string) => hay.split(needle).length - 1

  const block = (node: Node) =>
    (node.nodeType === 1 ? (node as Element) : node.parentElement)?.closest(
      "p, li, blockquote, h1, h2, h3, h4, td, th, figcaption",
    ) ?? article

  function contextBefore(range: Range) {
    const r = document.createRange()
    r.setStart(block(range.startContainer), 0)
    r.setEnd(range.startContainer, range.startOffset)
    return words(r.toString()).slice(-3).join(" ")
  }

  function contextAfter(range: Range) {
    const end = block(range.endContainer)
    const r = document.createRange()
    r.setStart(range.endContainer, range.endOffset)
    r.setEnd(end, end.childNodes.length)
    return words(r.toString()).slice(0, 3).join(" ")
  }

  function directive(sel: Selection) {
    const range = sel.getRangeAt(0)
    const lines = sel.toString().split(/\n+/).map(norm).filter(Boolean)
    if (!lines.length) return null
    const single = lines.length === 1 && lines[0].length <= 300
    const start = single ? lines[0] : words(lines[0]).slice(0, 5).join(" ")
    let dir = single ? enc(start) : `${enc(start)},${enc(words(lines.at(-1)!).slice(-5).join(" "))}`

    const page = norm(document.body.innerText).toLowerCase()
    if (count(page, start.toLowerCase()) > 1) {
      const before = contextBefore(range)
      const after = single ? contextAfter(range) : ""
      if (before) dir = `${enc(before)}-,${dir}`
      if (after) dir = `${dir},-${enc(after)}`
    }
    return { dir, quote: lines.join(" ") }
  }

  function place(sel: Selection) {
    const rects = sel.getRangeAt(0).getClientRects()
    const last = rects[rects.length - 1]
    if (!last) return
    btn.hidden = false
    const left = Math.min(Math.max(8, last.right - btn.offsetWidth / 2), innerWidth - btn.offsetWidth - 8)
    btn.style.left = `${left + scrollX}px`
    btn.style.top = `${last.bottom + scrollY + 10}px`
  }

  function update() {
    const sel = getSelection()
    if (!sel || sel.isCollapsed || !sel.rangeCount || norm(sel.toString()).length < 3) {
      if (!btn.classList.contains("done")) btn.hidden = true
      return
    }
    const range = sel.getRangeAt(0)
    if (!article!.contains(range.commonAncestorContainer)) return void (btn.hidden = true)
    const d = directive(sel)
    if (!d) return void (btn.hidden = true)
    link = `${location.origin}${location.pathname}#:~:text=${d.dir}`
    quote = d.quote
    clearTimeout(resetTimer)
    btn.classList.remove("done")
    text.textContent = label
    place(sel)
  }

  let pending = 0
  document.addEventListener("selectionchange", () => {
    clearTimeout(pending)
    pending = window.setTimeout(update, 150)
  })

  btn.addEventListener("mousedown", e => e.preventDefault())
  btn.addEventListener("click", async () => {
    if (canShare) {
      await navigator.share({ url: link, text: `“${quote}”` }).catch(() => {})
      return
    }
    try {
      await navigator.clipboard.writeText(link)
      text.textContent = "Link copied"
    } catch {
      text.textContent = "Couldn't copy"
    }
    btn.classList.add("done")
    resetTimer = window.setTimeout(() => {
      btn.classList.remove("done")
      btn.hidden = true
    }, 1500)
  })
}
