const links = document.querySelectorAll<HTMLAnchorElement>('.prose sup a[href^="#ref"]')

if (links.length) {
  const pop = document.createElement("div")
  pop.id = "ref-popover"
  pop.className = "ref-popover"
  pop.popover = "manual"
  document.body.append(pop)

  let active: HTMLAnchorElement | null = null
  let hideTimer: number | undefined

  function show(a: HTMLAnchorElement) {
    const li = document.getElementById(a.hash.slice(1))?.closest("li")
    if (!li) return false
    clearTimeout(hideTimer)
    const clone = li.cloneNode(true) as HTMLElement
    clone.querySelectorAll("[id]").forEach(el => el.removeAttribute("id"))
    const label = document.createElement("span")
    label.className = "ref-popover-n"
    label.textContent = a.textContent!.replace(/[[\]]/g, "")
    pop.replaceChildren(label, ...clone.childNodes)

    active?.setAttribute("aria-expanded", "false")
    active = a
    a.setAttribute("aria-expanded", "true")
    if (!pop.matches(":popover-open")) pop.showPopover()
    place(a)
    return true
  }

  function place(a: HTMLAnchorElement) {
    const r = a.getBoundingClientRect()
    if (r.bottom < 0 || r.top > innerHeight) return hide()
    const left = Math.min(Math.max(8, r.left + r.width / 2 - pop.offsetWidth / 2), innerWidth - pop.offsetWidth - 8)
    const below = r.bottom + 8 + pop.offsetHeight < innerHeight
    pop.style.left = `${left}px`
    pop.style.top = `${below ? r.bottom + 8 : r.top - pop.offsetHeight - 8}px`
  }

  function hide() {
    clearTimeout(hideTimer)
    active?.setAttribute("aria-expanded", "false")
    active = null
    if (pop.matches(":popover-open")) pop.hidePopover()
  }

  const scheduleHide = () => {
    hideTimer = window.setTimeout(hide, 200)
  }

  for (const a of links) {
    a.setAttribute("aria-controls", pop.id)
    a.setAttribute("aria-expanded", "false")
    // First activation previews the source; a second one follows the link to the reference list.
    a.addEventListener("click", e => {
      if (active === a) return hide()
      if (show(a)) e.preventDefault()
    })
    a.addEventListener("pointerenter", e => e.pointerType === "mouse" && show(a))
    a.addEventListener("pointerleave", e => e.pointerType === "mouse" && scheduleHide())
  }

  pop.addEventListener("pointerenter", () => clearTimeout(hideTimer))
  pop.addEventListener("pointerleave", scheduleHide)
  document.addEventListener("pointerdown", e => {
    const t = e.target as Element
    if (active && !pop.contains(t) && !t.closest('sup a[href^="#ref"]')) hide()
  })
  document.addEventListener("keydown", e => e.key === "Escape" && active && hide())
  let frame = 0
  const follow = () => {
    if (!active || frame) return
    frame = requestAnimationFrame(() => {
      frame = 0
      if (active) place(active)
    })
  }
  addEventListener("scroll", follow, { passive: true })
  addEventListener("resize", follow, { passive: true })
}
