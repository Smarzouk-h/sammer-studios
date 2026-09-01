/* ==========================================================================
   Sammer Studios, print shop
   Size picker, cart, and the order form that lands in Sammer's inbox.
   ========================================================================== */

const PRODUCTS  = SITE.printProducts;
const FAMILIES  = [...new Set(PRODUCTS.map(p => p.family))];
const productById = id => PRODUCTS.find(p => p.id === id);

/* ------------------------------------------------------------ size picker */
const PrintPicker = {
  el: null, slug: null, family: FAMILIES[0], productId: null, lastFocus: null,

  mount() {
    if (this.el) return this.el;
    const el = document.createElement("div");
    el.className = "modal";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", "Choose a print size");
    el.innerHTML = `
      <div class="modal-box">
        <div class="modal-head">
          <div>
            <p class="eyebrow eyebrow--gold" style="margin-bottom:.5rem">Order a print</p>
            <h2 data-pp-title></h2>
            <p class="meta" style="font-size:.75rem;letter-spacing:.14em;text-transform:uppercase;color:var(--paper-dim);margin:.5rem 0 0" data-pp-loc></p>
          </div>
          <button class="icon-btn" data-pp-close aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 4l12 12M16 4L4 16"/></svg>
          </button>
        </div>

        <img data-pp-img alt="" style="width:100%;max-height:230px;object-fit:cover;border-radius:3px;margin-bottom:1.5rem">

        <div class="fam-tabs" role="group" aria-label="Print type"></div>
        <p class="fam-note" data-pp-famnote></p>
        <div class="size-list" role="radiogroup" aria-label="Print size"></div>

        <div class="field-row" style="align-items:end">
          <div class="field">
            <label for="pp-qty">Quantity</label>
            <input id="pp-qty" type="number" min="1" max="25" value="1" inputmode="numeric">
          </div>
          <div class="field">
            <button class="btn btn--gold btn--block" data-pp-add>Add to cart</button>
          </div>
        </div>
        <p class="form-note" style="margin-top:.2rem">
          Prints are cropped to the shape you choose, so a little of the edge may go.
          Tell me in the order notes if you want a particular crop and I will send you a proof first.
        </p>
      </div>`;
    document.body.appendChild(el);
    this.el = el;

    $("[data-pp-close]", el).addEventListener("click", () => this.close());
    el.addEventListener("click", e => { if (e.target === el) this.close(); });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && el.classList.contains("is-open")) this.close();
    });
    $("[data-pp-add]", el).addEventListener("click", () => this.add());
    return el;
  },

  open(slug) {
    const p = bySlug[slug];
    if (!p) return;
    // Guards the prints.html#order-<slug> deep link as well as the grid.
    if (typeof forSale === "function" && !forSale(p)) {
      toast("That one is not sold as a print");
      return;
    }
    this.mount();
    this.slug = slug;
    this.family = FAMILIES[0];
    this.productId = null;
    this.lastFocus = document.activeElement;

    $("[data-pp-title]", this.el).textContent = p.title;
    $("[data-pp-loc]", this.el).textContent = `${p.location} · ${collectionName(p.collection)}`;
    const img = $("[data-pp-img]", this.el);
    img.src = photoURL(p, "thumb");
    img.alt = `${p.title}, ${p.location}`;
    $("#pp-qty", this.el).value = 1;

    this.paintTabs();
    this.paintSizes();
    document.body.style.overflow = "hidden";
    this.el.classList.add("is-open");
    $("[data-pp-close]", this.el).focus();
  },

  close() {
    if (!this.el) return;
    this.el.classList.remove("is-open");
    document.body.style.overflow = "";
    this.lastFocus && this.lastFocus.focus();
  },

  paintTabs() {
    const host = $(".fam-tabs", this.el);
    host.innerHTML = FAMILIES.map(f =>
      `<button class="fam-tab" data-fam="${esc(f)}" aria-pressed="${f === this.family}">${esc(f)}</button>`).join("");
    $$(".fam-tab", host).forEach(b => b.addEventListener("click", () => {
      this.family = b.dataset.fam;
      this.productId = null;
      this.paintTabs();
      this.paintSizes();
    }));
    $("[data-pp-famnote]", this.el).textContent = SITE.familyNotes[this.family] || "";
  },

  paintSizes() {
    const host = $(".size-list", this.el);
    const opts = PRODUCTS.filter(p => p.family === this.family);
    host.innerHTML = opts.map(o => `
      <label class="size-opt${o.id === this.productId ? " is-on" : ""}">
        <span class="lbl">
          <input type="radio" name="pp-size" value="${o.id}" ${o.id === this.productId ? "checked" : ""}>
          <span>${esc(o.size)}</span>
          <span class="ratio">${esc(o.ratio)}</span>
        </span>
        <span class="amt">${money(o.price)}</span>
      </label>`).join("");
    $$('input[name="pp-size"]', host).forEach(r => r.addEventListener("change", () => {
      this.productId = r.value;
      $$(".size-opt", host).forEach(l => l.classList.toggle("is-on", $("input", l).checked));
    }));
  },

  add() {
    if (!this.productId) { toast("Pick a size first"); return; }
    const prod = productById(this.productId);
    const photo = bySlug[this.slug];
    const qty = Math.max(1, Math.min(25, parseInt($("#pp-qty", this.el).value, 10) || 1));
    Cart.add({
      slug: this.slug, title: photo.title, location: photo.location,
      productId: prod.id, family: prod.family, size: prod.size,
      price: prod.price, qty,
    });
    this.close();
    toast(`${photo.title}: ${prod.family} ${prod.size} added`);
  },
};
window.PrintPicker = PrintPicker;

/** Payment buttons. Amount is passed through so the customer sees the total
    they owe next to the button they are about to press. */
function renderPayment(host, amount) {
  if (!host) return;
  const pay = SITE.payment || {};
  const links = [];
  if (pay.venmo) {
    links.push(`<a class="btn btn--gold btn--block pay-btn" target="_blank" rel="noopener"
       href="https://venmo.com/u/${encodeURIComponent(pay.venmo)}">
       Pay ${money(amount)} with Venmo</a>`);
  }
  if (pay.paypal) {
    links.push(`<a class="btn btn--ghost btn--block pay-btn" target="_blank" rel="noopener"
       href="https://paypal.me/${encodeURIComponent(pay.paypal)}/${Number(amount).toFixed(2)}">
       Pay ${money(amount)} with PayPal</a>`);
  }
  if (!links.length) return;
  host.innerHTML = `
    <div class="pay-panel">
      <p class="eyebrow eyebrow--gold" style="margin-bottom:.6rem">Paying</p>
      ${links.join("")}
      <p class="form-note" style="margin-top:.8rem">${esc(pay.note || "")}</p>
      <p class="form-note">Venmo <b style="color:var(--paper)">@${esc(pay.venmo || "")}</b></p>
    </div>`;
}

/* -------------------------------------------------------------- cart view */
function paintCart() {
  const host = $("#cart-body");
  if (!host) return;
  const items = Cart.read();

  if (!items.length) {
    host.innerHTML = `<p class="cart-empty">Nothing here yet.<br>Choose a photograph and pick a size.</p>`;
    return;
  }

  host.innerHTML = `
    <ul class="cart-lines">
      ${items.map((it, i) => `
        <li class="cart-line">
          <img src="${photoURL(it.slug, "thumb")}" alt="" width="46" height="46" loading="lazy">
          <div>
            <b>${esc(it.title)}</b>
            <span>${esc(it.family)} · ${esc(it.size)} · ×${it.qty}</span>
          </div>
          <div style="display:flex;align-items:center;gap:.5rem">
            <span>${money(it.price * it.qty)}</span>
            <button class="rm" data-rm="${i}" aria-label="Remove ${esc(it.title)}">×</button>
          </div>
        </li>`).join("")}
    </ul>
    <div class="cart-tot">
      <div class="row"><span>Subtotal</span><span>${money(Cart.subtotal())}</span></div>
      <div class="row"><span>Shipping</span><span>${money(SITE.shippingFlat)}</span></div>
      <div class="row grand"><span>Total</span><span>${money(Cart.total())}</span></div>
    </div>
    <button class="btn btn--gold btn--block" id="checkout-btn" style="margin-top:1.4rem">Place order</button>
    <button class="btn btn--ghost btn--block btn--sm" id="clear-btn" style="margin-top:.6rem">Empty cart</button>
    <p class="form-note">${esc(SITE.fulfilmentNote)}</p>`;

  $$("[data-rm]", host).forEach(b =>
    b.addEventListener("click", () => Cart.remove(Number(b.dataset.rm))));
  $("#clear-btn", host).addEventListener("click", () => { Cart.clear(); toast("Cart emptied"); });
  $("#checkout-btn", host).addEventListener("click", () => Checkout.open());
}

/* ---------------------------------------------------------------- checkout */
const Checkout = {
  el: null, lastFocus: null,

  mount() {
    if (this.el) return this.el;
    const el = document.createElement("div");
    el.className = "modal";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", "Place your print order");
    el.innerHTML = `
      <div class="modal-box">
        <div class="modal-head">
          <div>
            <p class="eyebrow eyebrow--gold" style="margin-bottom:.5rem">Almost there</p>
            <h2>Where should these go?</h2>
          </div>
          <button class="icon-btn" data-co-close aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 4l12 12M16 4L4 16"/></svg>
          </button>
        </div>

        <div data-co-summary style="margin-bottom:1.6rem"></div>

        <form id="order-form" novalidate>
          <div class="field-row">
            <div class="field">
              <label for="co-name">Name <span class="req">*</span></label>
              <input id="co-name" name="name" required autocomplete="name">
            </div>
            <div class="field">
              <label for="co-email">Email <span class="req">*</span></label>
              <input id="co-email" name="email" type="email" required autocomplete="email">
            </div>
          </div>
          <div class="field">
            <label for="co-addr">Shipping address <span class="req">*</span></label>
            <textarea id="co-addr" name="address" required autocomplete="street-address"
              placeholder="Street, city, state, ZIP, country" style="min-height:96px"></textarea>
          </div>
          <div class="field">
            <label for="co-notes">Notes on cropping, framing, deadlines</label>
            <textarea id="co-notes" name="notes" style="min-height:80px"
              placeholder="Anything I should know before I send these to print"></textarea>
          </div>
          <button class="btn btn--gold btn--block" type="submit">Send order</button>
          <p class="form-note">${esc(SITE.fulfilmentNote)}</p>
          <div class="form-status" data-co-status role="status"></div>
          <div data-co-pay></div>
        </form>
      </div>`;
    document.body.appendChild(el);
    this.el = el;

    $("[data-co-close]", el).addEventListener("click", () => this.close());
    el.addEventListener("click", e => { if (e.target === el) this.close(); });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && el.classList.contains("is-open")) this.close();
    });
    $("#order-form", el).addEventListener("submit", e => this.submit(e));
    return el;
  },

  open() {
    if (!Cart.count()) { toast("Your cart is empty"); return; }
    this.mount();
    const items = Cart.read();
    $("[data-co-summary]", this.el).innerHTML = `
      <div class="cart-tot" style="border-top:0;padding-top:0">
        ${items.map(it => `
          <div class="row"><span>${esc(it.title)}, ${esc(it.family)} ${esc(it.size)} ×${it.qty}</span>
          <span>${money(it.price * it.qty)}</span></div>`).join("")}
        <div class="row"><span>Shipping</span><span>${money(SITE.shippingFlat)}</span></div>
        <div class="row grand"><span>Total</span><span>${money(Cart.total())}</span></div>
      </div>`;
    this.lastFocus = document.activeElement;
    document.body.style.overflow = "hidden";
    this.el.classList.add("is-open");
    $("#co-name", this.el).focus();
  },

  close() {
    if (!this.el) return;
    this.el.classList.remove("is-open");
    document.body.style.overflow = "";
    this.lastFocus && this.lastFocus.focus();
  },

  async submit(e) {
    e.preventDefault();
    const form = e.target;
    const status = $("[data-co-status]", this.el);
    const btn = $('button[type="submit"]', form);

    if (!form.checkValidity()) {
      showStatus(status, "err", "Please fill in your name, email, and shipping address.");
      form.reportValidity();
      return;
    }

    const items = Cart.read();
    const total = Cart.total();
    const lines = items.map(it =>
      `• ${it.title} (${it.slug}) / ${it.family} ${it.size} / qty ${it.qty} / ${money(it.price * it.qty)}`
    ).join("\n");

    const fields = {
      "Order": lines,
      "Subtotal": money(Cart.subtotal()),
      "Shipping": money(SITE.shippingFlat),
      "Total": money(Cart.total()),
      "Name": form.name.value.trim(),
      "Email": form.email.value.trim(),
      "Shipping address": form.address.value.trim(),
      "Notes": form.notes.value.trim(),
    };

    btn.disabled = true;
    btn.textContent = "Sending…";
    try {
      const how = await sendForm(
        `Print order: ${fields.Name}, ${money(Cart.total())}`, fields);
      showStatus(status, "ok", how === "sent"
        ? "Order received, thank you. Pay whenever you are ready using the buttons below."
        : "Your email app should be open with the order in it. Send that message, then pay below.");
      // `total` was captured before the cart is emptied.
      renderPayment($("[data-co-pay]", this.el), total);
      if (how === "sent") { Cart.clear(); form.reset(); }
      btn.textContent = "Sent";
    } catch (err) {
      showStatus(status, "err",
        `That didn't go through. Email the order to ${SITE.email} and I will sort it out.`);
      btn.disabled = false;
      btn.textContent = "Send order";
    }
  },
};

/* -------------------------------------------------------------------- boot */
document.addEventListener("DOMContentLoaded", () => {
  if (!$("#cart-body")) return;
  paintCart();
  document.addEventListener("cart:change", paintCart);

  const m = location.hash.match(/^#order-(.+)$/);
  if (m && bySlug[m[1]]) PrintPicker.open(m[1]);
});
