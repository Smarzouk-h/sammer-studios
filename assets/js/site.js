/* ==========================================================================
   Sammer Studios, shared behaviour
   Header, navigation, reveals, cart badge, form submission, toasts.
   ========================================================================== */

/* ------------------------------------------------------------------ utils */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const money = n =>
  SITE.currencySymbol + Number(n).toFixed(2).replace(/\.00$/, "");

const esc = s => String(s ?? "").replace(/[&<>"']/g,
  c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const IG_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5.2"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none"/></svg>`;

const MARK_SVG = `<svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
  <circle cx="20" cy="20" r="18.5" stroke="currentColor" stroke-width="1.3" opacity=".55"/>
  <circle cx="20" cy="20" r="11" stroke="currentColor" stroke-width="1.3"/>
  <path d="M20 9v22M9.5 14.5l21 11M9.5 25.5l21-11" stroke="currentColor" stroke-width="1.1" opacity=".38"/>
  <circle cx="20" cy="20" r="3.4" fill="currentColor"/>
</svg>`;

/* ------------------------------------------------------------------ chrome */
const NAV = [
  ["index.html",     "Home"],
  ["portfolio.html", "Portfolio"],
  ["prints.html",    "Prints"],
  ["about.html",     "About"],
];

function buildHeader() {
  const host = $("#site-head");
  if (!host) return;
  const here = location.pathname.split("/").pop() || "index.html";

  host.innerHTML = `
    <a class="brand" href="index.html" aria-label="${esc(SITE.name)}, home">
      ${MARK_SVG}
      <span class="brand-text">
        <span class="brand-name">Sammer Studios</span>
        <span class="brand-sub">${esc(SITE.photographer)}</span>
      </span>
    </a>
    <button class="burger" aria-label="Menu" aria-expanded="false" aria-controls="site-nav">
      <span></span><span></span><span></span>
    </button>
    <nav class="nav" id="site-nav">
      ${NAV.map(([href, label]) =>
        `<a href="${href}"${href === here ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
      <a class="cart-pill" href="prints.html#cart" id="cart-pill">
        Cart <b data-cart-count>0</b>
      </a>
      <a class="nav-cta" href="book.html"${here === "book.html" ? ' aria-current="page"' : ""}>Book a session</a>
    </nav>`;

  const burger = $(".burger", host);
  burger.addEventListener("click", () => {
    const open = host.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
  });
  $$(".nav a", host).forEach(a => a.addEventListener("click", () => {
    host.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  }));

  const onScroll = () => host.classList.toggle("is-stuck", window.scrollY > 24);
  onScroll();
  addEventListener("scroll", onScroll, { passive: true });
}

function buildFooter() {
  const host = $("#site-foot");
  if (!host) return;
  const ig = SITE.social;
  host.innerHTML = `
    <div class="wrap">
      <div class="foot-grid">
        <div class="foot-brand">
          <a class="brand" href="index.html">
            ${MARK_SVG}
            <span class="brand-text">
              <span class="brand-name">Sammer Studios</span>
              <span class="brand-sub">${esc(SITE.photographer)}</span>
            </span>
          </a>
          <p>${esc(SITE.tagline)}</p>
          <p class="arabic-mark" aria-hidden="true">${esc(SITE.arabicMark || "")}</p>
        </div>
        <div class="foot-col">
          <h4>Site</h4>
          <ul>
            ${NAV.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join("")}
            <li><a href="book.html">Book a session</a></li>
          </ul>
        </div>
        <div class="foot-col">
          <h4>Elsewhere</h4>
          <ul>
            <li><a class="ig" href="https://instagram.com/${esc(ig.studioInstagram)}" target="_blank" rel="noopener">${IG_SVG} @${esc(ig.studioInstagram)}</a></li>
            <li><a class="ig" href="https://instagram.com/${esc(ig.personalInstagram)}" target="_blank" rel="noopener">${IG_SVG} @${esc(ig.personalInstagram)}</a></li>
            <li><a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a></li>
            ${SITE.phone ? `<li><a href="tel:${esc(SITE.phone.replace(/\s/g, ""))}">${esc(SITE.phone)}</a></li>` : ""}
          </ul>
        </div>
      </div>
      <div class="foot-base">
        <span>© ${new Date().getFullYear()} ${esc(SITE.name)}. All photographs by ${esc(SITE.photographer)}.</span>
        <span>Please don't reproduce these without asking.</span>
      </div>
    </div>`;
}

/* ----------------------------------------------------------------- reveals
   Sections fade in as they scroll into view.

   This deliberately does NOT use IntersectionObserver. Most of the page is
   built by JavaScript, so anything injected after a one-shot observer pass
   would sit at opacity 0 forever, and that is exactly how the collections
   section ended up blank. A rect check on scroll is simple, catches content
   whenever it appears, and cannot leave anything permanently invisible. */
let lastRevealPass = 0;

function revealPass() {
  lastRevealPass = Date.now();
  const limit = innerHeight * 0.94;
  $$(".reveal:not(.is-in)").forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < limit && r.bottom > 0) el.classList.add("is-in");
  });
}

// Throttled on a timestamp rather than requestAnimationFrame. The set being
// measured shrinks to nothing as sections reveal, so this stays cheap, and it
// keeps working in contexts where the frame loop is throttled or stalled.
function queueRevealPass() {
  if (Date.now() - lastRevealPass < 80) return;
  revealPass();
}

function initReveals() {
  // No JS, no animation: the stylesheet only hides .reveal once this class is
  // set, so the content is visible by default and can never be stranded.
  document.documentElement.classList.add("reveal-ready");
  revealPass();
  addEventListener("scroll", queueRevealPass, { passive: true });
  addEventListener("resize", queueRevealPass, { passive: true });
  addEventListener("load", revealPass);

  // Anything added later (collections, filmstrip, galleries) gets picked up.
  new MutationObserver(queueRevealPass)
    .observe(document.body, { childList: true, subtree: true });

  // Last resort: if something above has gone wrong, never leave a section
  // invisible. Better an un-animated page than a blank one.
  setTimeout(() => $$(".reveal").forEach(e => e.classList.add("is-in")), 4000);
}

/* ------------------------------------------------------------------ toast */
let toastTimer;
function toast(msg) {
  let el = $(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    document.body.appendChild(el);
  }
  el.textContent = msg;
  requestAnimationFrame(() => el.classList.add("is-up"));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("is-up"), 3200);
}

/* ------------------------------------------------------------------- cart */
const CART_KEY = "sammerstudios.cart.v1";

const Cart = {
  read() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  },
  write(items) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch { /* private mode */ }
    Cart.paint();
    document.dispatchEvent(new CustomEvent("cart:change"));
  },
  add(line) {
    const items = Cart.read();
    const hit = items.find(i => i.slug === line.slug && i.productId === line.productId);
    if (hit) hit.qty += line.qty;
    else items.push(line);
    Cart.write(items);
  },
  remove(i) { const items = Cart.read(); items.splice(i, 1); Cart.write(items); },
  clear() { Cart.write([]); },
  count() { return Cart.read().reduce((n, i) => n + i.qty, 0); },
  subtotal() { return Cart.read().reduce((n, i) => n + i.qty * i.price, 0); },
  total() { const s = Cart.subtotal(); return s ? s + SITE.shippingFlat : 0; },
  paint() {
    const n = Cart.count();
    $$("[data-cart-count]").forEach(el => (el.textContent = n));
    const pill = $("#cart-pill");
    if (pill) pill.classList.toggle("is-visible", n > 0);
  },
};

/* ------------------------------------------------------- form submission */
/**
 * Sends a form. Uses the configured endpoint when present; otherwise falls
 * back to a pre-filled mailto so the site still works before setup.
 * Returns "sent" | "mailto".
 */
async function sendForm(subject, fields) {
  const body = Object.entries(fields)
    .filter(([, v]) => v !== "" && v != null)
    .map(([k, v]) => `${k}:\n${v}\n`)
    .join("\n");

  const openMail = () => {
    const href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    // Very long bodies get truncated by mail clients; trim the detail.
    location.href = href.length > 1900
      ? `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body.slice(0, 1500) + "\n\n[continued. Please send and I will follow up]")}`
      : href;
    return "mailto";
  };

  if (!SITE.formEndpoint) return openMail();

  // If the endpoint is unreachable, unactivated, or simply having a bad day,
  // fall back to the visitor's mail app rather than losing the enquiry.
  try {
    const payload = { _subject: subject, ...fields };
    // FormSubmit understands these; other backends ignore unknown keys.
    if (SITE.formEndpoint.includes("formsubmit")) {
      payload._template = "table";
      payload._captcha = "false";
    }
    const res = await fetch(SITE.formEndpoint, {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Form endpoint returned " + res.status);

    // FormSubmit answers 200 with {success:"false"} when the address has not
    // been confirmed yet, so a bare status check is not enough.
    let data = null;
    try { data = await res.json(); } catch { /* some backends return no body */ }
    if (data && String(data.success) === "false") throw new Error(data.message || "rejected");

    return "sent";
  } catch (err) {
    console.warn("Form endpoint failed, falling back to email:", err.message);
    return openMail();
  }
}

function showStatus(el, kind, msg) {
  if (!el) return;
  el.className = `form-status is-shown ${kind}`;
  el.textContent = msg;
  el.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

/* ------------------------------------------------------------------- boot */
document.addEventListener("DOMContentLoaded", () => {
  buildHeader();
  buildFooter();
  initReveals();
  Cart.paint();

  // Fill any element tagged with a config key, e.g. <span data-site="email">
  $$("[data-site]").forEach(el => {
    const val = el.dataset.site.split(".").reduce((o, k) => (o || {})[k], SITE);
    if (val != null) el.textContent = val;
  });
});
