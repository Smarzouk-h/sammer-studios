/* ==========================================================================
   Sammer Studios, photo grids and lightbox
   ========================================================================== */

const ALL_PHOTOS  = (window.PHOTO_DATA && window.PHOTO_DATA.photos) || [];
const ALL_COLLECTIONS = (window.PHOTO_DATA && window.PHOTO_DATA.collections) || [];

// Hidden collections hold photographs of Sammer taken by other people. They
// are used for About imagery and must never show up as portfolio work or be
// sold as prints.
const HIDDEN = new Set(ALL_COLLECTIONS.filter(c => c.hidden).map(c => c.id));
const COLLECTIONS = ALL_COLLECTIONS.filter(c => !c.hidden);
const PHOTOS      = ALL_PHOTOS.filter(p => !HIDDEN.has(p.collection));

// bySlug still indexes everything, so About pages can reach the hidden ones.
const bySlug = Object.fromEntries(ALL_PHOTOS.map(p => [p.slug, p]));

/** Commissioned photographs of private people are not sold as prints. */
const NO_SALE = new Set(SITE.printExclude || []);
const forSale = p => !!p && !NO_SALE.has(p.collection) && !HIDDEN.has(p.collection);
const collectionName = id => (COLLECTIONS.find(c => c.id === id) || {}).name || id;

/** Featured photos, strongest first, then by collection for variety. */
function featured(limit) {
  const list = PHOTOS.filter(p => p.featured > 0)
    .sort((a, b) => b.featured - a.featured);
  return limit ? list.slice(0, limit) : list;
}

/* ------------------------------------------------------------------ tiles */
function tileHTML(p, { cls = "", sizes = "(max-width: 640px) 50vw, 33vw", eager = false } = {}) {
  // Two candidates per tile. Small grid cells take the 1000px thumb; the big
  // mosaic tiles (and any retina screen) pull the full file instead, which is
  // what stops large tiles looking soft.
  const fullW  = p.w;
  const thumbW = Math.round(p.w * 1000 / Math.max(p.w, p.h));
  return `
    <button class="tile ${cls}" data-slug="${p.slug}"
            aria-label="View ${esc(p.title)}, ${esc(p.location)}">
      <picture>
        <source type="image/webp" sizes="${sizes}"
                srcset="${photoURL(p,"thumb","webp")} ${thumbW}w, ${photoURL(p,"full","webp")} ${fullW}w">
        <img src="${photoURL(p,"thumb")}" alt="${esc(p.title)}, ${esc(p.location)}"
             sizes="${sizes}"
             srcset="${photoURL(p,"thumb")} ${thumbW}w, ${photoURL(p,"full")} ${fullW}w"
             width="${p.w}" height="${p.h}"
             loading="${eager ? "eager" : "lazy"}"${eager ? ' decoding="sync"' : ""}
             style="background-image:url('${p.lqip}')">
      </picture>
      <span class="tile-cap">
        <b>${esc(p.title)}</b>
        <span>${esc(p.location)}</span>
      </span>
    </button>`;
}

/** URL for a photograph, carrying its content hash so a replaced picture is
    never served from cache while unchanged ones stay cached. */
function photoURL(p, size = "full", ext = "jpg") {
  const o = typeof p === "string" ? bySlug[p] : p;
  if (!o) return "";
  return `photos/${size}/${o.slug}.${ext}${o.v ? `?v=${o.v}` : ""}`;
}

/** Inline style for a standalone photograph, e.g. the About portraits.
    Uses the picture's own orientation rather than forcing a shape onto it,
    and honours any focal point set in the config. */
function framedPhoto(p, fallbackRatio = "4/5") {
  const ratio = p.orient === "landscape" ? "3/2"
              : p.orient === "square"    ? "1/1"
              : fallbackRatio;
  const focus = (SITE.focus && SITE.focus[p.slug]) || "50% 50%";
  return `width:100%;aspect-ratio:${ratio};object-fit:cover;object-position:${focus};border-radius:3px`;
}

/** Render a set of photos into a container and wire them to the lightbox. */
function renderGrid(host, list, opts = {}) {
  if (!host) return;
  host.innerHTML = list.map((p, i) =>
    tileHTML(p, { ...opts, eager: i < (opts.eagerCount ?? 4) })).join("");
  host.addEventListener("click", (e) => {
    const tile = e.target.closest(".tile");
    if (!tile) return;
    Lightbox.open(list, list.findIndex(p => p.slug === tile.dataset.slug));
  });
}

/* --------------------------------------------------------------- lightbox */
const Lightbox = {
  list: [], i: 0, lastFocus: null, el: null,

  mount() {
    if (this.el) return this.el;
    const el = document.createElement("div");
    el.className = "lightbox";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", "Photograph viewer");
    el.innerHTML = `
      <div class="lb-bar">
        <span class="lb-count"></span>
        <div class="lb-tools">
          <button class="icon-btn lb-close" aria-label="Close viewer">
            <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 4l12 12M16 4L4 16"/></svg>
          </button>
        </div>
      </div>
      <div class="lb-stage">
        <button class="lb-nav lb-prev" aria-label="Previous photograph">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>
        </button>
        <img alt="">
        <button class="lb-nav lb-next" aria-label="Next photograph">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>
      <div class="lb-foot">
        <div>
          <h3></h3>
          <div class="meta"></div>
        </div>
        <button class="btn btn--gold btn--sm lb-buy">Order a print</button>
      </div>`;
    document.body.appendChild(el);
    this.el = el;

    $(".lb-close", el).addEventListener("click", () => this.close());
    $(".lb-prev",  el).addEventListener("click", () => this.go(-1));
    $(".lb-next",  el).addEventListener("click", () => this.go(1));
    $(".lb-buy",   el).addEventListener("click", () => {
      const p = this.list[this.i];
      if (window.PrintPicker) { this.close(); PrintPicker.open(p.slug); }
      else location.href = `prints.html#order-${p.slug}`;
    });
    el.addEventListener("click", (e) => { if (e.target === el) this.close(); });

    // swipe
    let x0 = null;
    const stage = $(".lb-stage", el);
    stage.addEventListener("touchstart", e => { x0 = e.changedTouches[0].clientX; }, { passive: true });
    stage.addEventListener("touchend", e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 48) this.go(dx < 0 ? 1 : -1);
      x0 = null;
    }, { passive: true });

    document.addEventListener("keydown", (e) => {
      if (!el.classList.contains("is-open")) return;
      if (e.key === "Escape")     { e.preventDefault(); this.close(); }
      if (e.key === "ArrowLeft")  { e.preventDefault(); this.go(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); this.go(1); }
      if (e.key === "Tab") {
        const f = $$('button, [href]', el).filter(n => n.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    return el;
  },

  open(list, i) {
    if (!list || !list.length || i < 0) return;
    this.mount();
    this.list = list;
    this.lastFocus = document.activeElement;
    document.body.style.overflow = "hidden";
    this.el.classList.add("is-open");
    this.show(i);
    $(".lb-close", this.el).focus();
  },

  close() {
    if (!this.el) return;
    this.el.classList.remove("is-open");
    document.body.style.overflow = "";
    if (history.state && history.state.lb) history.replaceState(null, "", location.pathname + location.search);
    this.lastFocus && this.lastFocus.focus();
  },

  go(d) {
    this.show((this.i + d + this.list.length) % this.list.length);
  },

  show(i) {
    this.i = i;
    const p = this.list[i], el = this.el;
    const img = $(".lb-stage img", el);

    img.classList.remove("is-ready");
    const next = new Image();
    next.onload = () => {
      img.src = next.src;
      img.alt = `${p.title}, ${p.location}`;
      img.classList.add("is-ready");
    };
    next.src = photoURL(p, "full");

    $(".lb-count", el).textContent = `${i + 1} / ${this.list.length}`;
    $(".lb-foot h3", el).textContent = p.title;
    $(".lb-foot .meta", el).innerHTML =
      `${esc(p.location)} · ${esc(collectionName(p.collection))}` +
      (p.camera ? ` · <span class="vintage-tag">${esc(p.camera)}</span>` : "");
    $$(".lb-nav", el).forEach(b => b.style.display = this.list.length > 1 ? "" : "none");
    $(".lb-buy", el).style.display = forSale(p) ? "" : "none";

    history.replaceState({ lb: true }, "", `#photo-${p.slug}`);

    // preload neighbours
    [1, -1].forEach(d => {
      const n = this.list[(i + d + this.list.length) % this.list.length];
      if (n) new Image().src = photoURL(n, "full");
    });
  },
};

/** If the URL carries #photo-slug, open that photo once the page is ready. */
function openFromHash(list) {
  const m = location.hash.match(/^#photo-(.+)$/);
  if (!m) return;
  const i = list.findIndex(p => p.slug === m[1]);
  if (i >= 0) Lightbox.open(list, i);
}
