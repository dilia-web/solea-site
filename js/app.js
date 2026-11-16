/* =====================================================================
   SOLÉA — Logique du site
   ---------------------------------------------------------------------
   1. Connexion Supabase          6. Panier (tiroir + localStorage)
   2. Chargement des produits      7. Commande → table "orders"
   3. Affichage de la boutique     8. Newsletter → table "newsletter"
   4. Fiche produit (modale)       9. Diagnostic (quiz)
   5. Favoris                      10. Interface (menu, header, animations)
   ===================================================================== */

(function () {
    "use strict";

    /* ---------- Outils ---------- */
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
    const js = (name) => $(`[data-js="${name}"]`);

    const euro = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
    const money = (n) => euro.format(n);

    // Protège l'affichage des textes venant de la base (évite l'injection HTML)
    const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    const store = {
        get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
        set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* stockage indisponible */ } }
    };

    const FREE_SHIPPING = 49;
    const SHIPPING_COST = 4.90;
    const PROMO_CODES = { SOLEIL10: 0.10 };

    const state = {
        products: [],
        source: "local",
        filter: "all",
        search: "",
        sort: "featured",
        cart: store.get("solea_cart", []),   // [{ id, qty }]
        favs: store.get("solea_favs", []),   // [id, id…]
        quiz: {}
    };

    /* =================================================================
       1. CONNEXION SUPABASE
       ================================================================= */
    let db = null;
    const cfg = window.SOLEA_CONFIG || {};
    const configured = cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY &&
        !cfg.SUPABASE_URL.includes("VOTRE") && !cfg.SUPABASE_ANON_KEY.includes("VOTRE");

    if (configured && window.supabase) {
        db = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    }

    /* =================================================================
       2. CHARGEMENT DES PRODUITS
       Supabase : SELECT * FROM products ORDER BY id
       Sinon    : catalogue local js/products.js
       ================================================================= */
    function normalize(p) {
        return {
            ...p,
            id: Number(p.id),
            price: Number(p.price),
            old_price: p.old_price != null ? Number(p.old_price) : null,
            spf: p.spf != null ? Number(p.spf) : null,
            rating: Number(p.rating || 0),
            reviews: Number(p.reviews || 0),
            stock: Number(p.stock ?? 0)
        };
    }

    async function loadProducts() {
        if (db) {
            const { data, error } = await db.from("products").select("*").order("id");
            if (!error && data && data.length) {
                state.products = data.map(normalize);
                state.source = "supabase";
                return;
            }
            console.warn("[SOLÉA] Supabase indisponible, catalogue local utilisé.", error);
        }
        state.products = (window.SOLEA_PRODUCTS || []).map(normalize);
        state.source = "local";
    }

    const byId = (id) => state.products.find((p) => p.id === Number(id));
    const bySlug = (slug) => state.products.find((p) => p.slug === slug);

    /* =================================================================
       3. BOUTIQUE
       ================================================================= */
    const CATEGORY_LABEL = { "visage": "Visage", "corps": "Corps", "apres-soleil": "Après-soleil", "coffret": "Coffret" };

    function stars(r) {
        const full = Math.round(r);
        return "★".repeat(full) + "☆".repeat(5 - full);
    }

    function priceHTML(p) {
        return `${money(p.price)}${p.old_price ? `<del>${money(p.old_price)}</del>` : ""}`;
    }

    function cardHTML(p, i) {
        const isFav = state.favs.includes(p.id);
        const promo = p.badge && p.badge.trim().startsWith("-");
        return `
        <article class="product" data-id="${p.id}" style="animation-delay:${Math.min(i, 8) * 60}ms">
            <div class="product__media" data-action="open">
                ${p.badge ? `<span class="product__badge ${promo ? "product__badge--promo" : ""}">${esc(p.badge)}</span>` : ""}
                ${window.soleaVisual(p)}
                <div class="product__quick">
                    <button class="btn btn--sm" data-action="add">Ajouter au panier</button>
                </div>
            </div>
            <button class="product__fav ${isFav ? "is-active" : ""}" data-action="fav" aria-label="Ajouter aux favoris" aria-pressed="${isFav}">
                <svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>
            </button>
            <div class="product__body">
                <div class="product__meta">
                    <span>${CATEGORY_LABEL[p.category] || esc(p.category)} · ${esc(p.volume)}</span>
                    ${p.spf ? `<span class="product__spf">${window.soleaSpfLabel(p)}</span>` : ""}
                </div>
                <h3 class="product__name" data-action="open">${esc(p.name)}</h3>
                <p class="product__short">${esc(p.short_description)}</p>
                ${p.stock > 0 && p.stock <= 10 ? `<span class="stock-low">Plus que ${p.stock} en stock</span>` : ""}
                <div class="product__foot">
                    <span class="price">${priceHTML(p)}</span>
                    <span class="rating"><b>★</b> ${p.rating.toFixed(1).replace(".", ",")} (${p.reviews})</span>
                </div>
            </div>
        </article>`;
    }

    function visibleProducts() {
        const q = state.search.trim().toLowerCase();
        let list = state.products.filter((p) => {
            if (state.filter === "favoris") return state.favs.includes(p.id);
            if (state.filter !== "all") return p.category === state.filter;
            return true;
        });
        if (q) {
            list = list.filter((p) =>
                [p.name, p.short_description, p.kind, p.category, p.description].join(" ").toLowerCase().includes(q));
        }
        const sorters = {
            "price-asc": (a, b) => a.price - b.price,
            "price-desc": (a, b) => b.price - a.price,
            "rating": (a, b) => b.rating - a.rating,
            "spf": (a, b) => (b.spf || 0) - (a.spf || 0),
            "featured": (a, b) => a.id - b.id
        };
        return [...list].sort(sorters[state.sort]);
    }

    function renderShop() {
        const list = visibleProducts();
        js("product-grid").innerHTML = list.map(cardHTML).join("");
        js("empty").hidden = list.length > 0;
        js("empty").textContent = state.filter === "favoris"
            ? "Vous n'avez pas encore de favoris. Cliquez sur ♡ pour en ajouter."
            : "Aucun produit ne correspond à votre recherche.";
        js("shop-count").textContent = `${list.length} produit${list.length > 1 ? "s" : ""}`;
    }

    function setFilter(filter, scroll) {
        state.filter = filter;
        $$(".chip", js("chips")).forEach((c) => c.classList.toggle("is-active", c.dataset.filter === filter));
        renderShop();
        if (scroll) $("#boutique").scrollIntoView({ behavior: "smooth" });
    }

    // Clics dans la grille (délégation d'événements)
    js("product-grid").addEventListener("click", (e) => {
        const btn = e.target.closest("[data-action]");
        if (!btn) return;
        const id = Number(btn.closest(".product").dataset.id);
        const action = btn.dataset.action;
        if (action === "add") { e.stopPropagation(); addToCart(id, 1); }
        if (action === "fav") toggleFav(id, btn);
        if (action === "open") openProduct(id);
    });

    js("chips").addEventListener("click", (e) => {
        const chip = e.target.closest(".chip");
        if (chip) setFilter(chip.dataset.filter);
    });

    js("search-input").addEventListener("input", (e) => {
        state.search = e.target.value;
        if (state.search && state.filter === "favoris") setFilter("all");
        else renderShop();
    });

    js("sort").addEventListener("change", (e) => { state.sort = e.target.value; renderShop(); });

    // Liens qui filtrent (menu, footer, cartes catégories)
    $$("[data-filter-link]").forEach((a) => a.addEventListener("click", (e) => {
        e.preventDefault();
        closeNav();
        setFilter(a.dataset.filterLink, true);
    }));
    $$("[data-category]").forEach((b) => b.addEventListener("click", () => setFilter(b.dataset.category, true)));

    js("search-open").addEventListener("click", () => {
        $("#boutique").scrollIntoView({ behavior: "smooth" });
        setTimeout(() => js("search-input").focus({ preventScroll: true }), 500);
    });

    /* =================================================================
       4. FICHE PRODUIT (MODALE)
       ================================================================= */
    let modalQty = 1;

    function openProduct(id) {
        const p = byId(id);
        if (!p) return;
        modalQty = 1;
        js("product-modal-body").innerHTML = `
        <div class="pmodal">
            <div class="pmodal__media">${window.soleaVisual(p)}</div>
            <div class="pmodal__body">
                <p class="eyebrow">${CATEGORY_LABEL[p.category] || ""} · ${esc(p.kind)}</p>
                <h3>${esc(p.name)}</h3>
                <span class="rating"><b>${stars(p.rating)}</b> ${p.rating.toFixed(1).replace(".", ",")} · ${p.reviews} avis</span>
                <p class="pmodal__price">${priceHTML(p)}</p>
                <p class="pmodal__desc">${esc(p.description)}</p>
                <dl class="pmodal__specs">
                    <div><dt>Protection</dt><dd>${p.spf ? window.soleaSpfLabel(p) + " · UVA/UVB" : "Soin réparateur"}</dd></div>
                    <div><dt>Contenance</dt><dd>${esc(p.volume)}</dd></div>
                    <div><dt>Disponibilité</dt><dd>${p.stock > 0 ? (p.stock <= 10 ? `Plus que ${p.stock}` : "En stock") : "Rupture"}</dd></div>
                    <div><dt>Livraison</dt><dd>48 h · offerte dès 49 €</dd></div>
                </dl>
                ${p.tip ? `<p class="pmodal__desc"><strong>Le conseil SOLÉA :</strong> ${esc(p.tip)}</p>` : ""}
                <div class="pmodal__actions">
                    <div class="qty">
                        <button data-mq="-1" aria-label="Diminuer">−</button>
                        <span data-js="modal-qty">1</span>
                        <button data-mq="1" aria-label="Augmenter">+</button>
                    </div>
                    <button class="btn btn--sun" data-modal-add="${p.id}" ${p.stock <= 0 ? "disabled" : ""}>Ajouter · ${money(p.price)}</button>
                </div>
            </div>
        </div>`;
        openModal(js("product-modal"));
    }

    js("product-modal").addEventListener("click", (e) => {
        const mq = e.target.closest("[data-mq]");
        if (mq) {
            modalQty = Math.max(1, Math.min(20, modalQty + Number(mq.dataset.mq)));
            js("modal-qty").textContent = modalQty;
        }
        const add = e.target.closest("[data-modal-add]");
        if (add) {
            addToCart(Number(add.dataset.modalAdd), modalQty);
            closeModals();
        }
    });

    /* =================================================================
       5. FAVORIS
       ================================================================= */
    function toggleFav(id, btn) {
        const i = state.favs.indexOf(id);
        if (i >= 0) state.favs.splice(i, 1); else state.favs.push(id);
        store.set("solea_favs", state.favs);
        const active = state.favs.includes(id);
        if (btn) { btn.classList.toggle("is-active", active); btn.setAttribute("aria-pressed", active); }
        toast(active ? "Ajouté à vos favoris" : "Retiré de vos favoris");
        updateCounters();
        if (state.filter === "favoris") renderShop();
    }

    js("fav-filter").addEventListener("click", () => setFilter("favoris", true));

    /* =================================================================
       6. PANIER
       ================================================================= */
    function cartLines() {
        return state.cart.map((l) => ({ ...l, product: byId(l.id) })).filter((l) => l.product);
    }

    function totals(promoCode) {
        const subtotal = cartLines().reduce((s, l) => s + l.product.price * l.qty, 0);
        const rate = PROMO_CODES[(promoCode || "").trim().toUpperCase()] || 0;
        const discount = Math.round(subtotal * rate * 100) / 100;
        const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING ? 0 : SHIPPING_COST;
        return { subtotal, discount, shipping, total: subtotal - discount + shipping };
    }

    function saveCart() {
        store.set("solea_cart", state.cart);
        renderCart();
        updateCounters();
    }

    function addToCart(id, qty) {
        const p = byId(id);
        if (!p) return;
        const line = state.cart.find((l) => l.id === id);
        if (line) line.qty = Math.min(20, line.qty + qty); else state.cart.push({ id, qty });
        saveCart();
        toast(`${p.name} ajouté au panier`);
        const badge = js("cart-count");
        badge.classList.remove("bump"); void badge.offsetWidth; badge.classList.add("bump");
    }

    function setQty(id, qty) {
        if (qty <= 0) state.cart = state.cart.filter((l) => l.id !== id);
        else state.cart.find((l) => l.id === id).qty = Math.min(20, qty);
        saveCart();
    }

    function renderCart() {
        const lines = cartLines();
        const t = totals();
        js("cart-items").innerHTML = lines.length ? lines.map((l) => `
            <div class="cart-item" data-id="${l.id}">
                <div class="cart-item__img">${window.soleaVisual(l.product)}</div>
                <div>
                    <p class="cart-item__name">${esc(l.product.name)}</p>
                    <p class="cart-item__sub">${esc(l.product.volume)} · ${money(l.product.price)}</p>
                    <div class="qty">
                        <button data-cq="-1" aria-label="Diminuer">−</button>
                        <span>${l.qty}</span>
                        <button data-cq="1" aria-label="Augmenter">+</button>
                    </div>
                </div>
                <div class="cart-item__right">
                    <strong>${money(l.product.price * l.qty)}</strong>
                    <button class="cart-item__remove" data-remove>Retirer</button>
                </div>
            </div>`).join("")
            : `<div class="cart-empty"><span class="sun-emoji">☀</span>Votre panier est vide.<br>Votre peau mérite mieux !<br><br><a href="#boutique" class="btn btn--ghost btn--sm" data-js="cart-shop">Découvrir la boutique</a></div>`;

        js("cart-subtotal").textContent = money(t.subtotal);
        js("cart-shipping").textContent = t.subtotal === 0 ? "—" : (t.shipping ? money(t.shipping) : "Offerte");
        js("cart-total").textContent = money(t.total);

        const left = FREE_SHIPPING - t.subtotal;
        js("shipping-text").innerHTML = t.subtotal === 0
            ? `Livraison offerte dès ${money(FREE_SHIPPING)}`
            : left > 0 ? `Plus que <strong>${money(left)}</strong> pour la livraison offerte`
                : `☀ Bravo, la livraison est <strong>offerte</strong> !`;
        js("shipping-bar").style.width = Math.min(100, (t.subtotal / FREE_SHIPPING) * 100) + "%";
        js("checkout-open").disabled = lines.length === 0;
    }

    js("cart-items").addEventListener("click", (e) => {
        const item = e.target.closest(".cart-item");
        if (e.target.closest("[data-js='cart-shop']")) { closeDrawer(); return; }
        if (!item) return;
        const id = Number(item.dataset.id);
        const line = state.cart.find((l) => l.id === id);
        const cq = e.target.closest("[data-cq]");
        if (cq) setQty(id, line.qty + Number(cq.dataset.cq));
        if (e.target.closest("[data-remove]")) setQty(id, 0);
    });

    function updateCounters() {
        const count = state.cart.reduce((s, l) => s + l.qty, 0);
        const c = js("cart-count"), f = js("fav-count");
        c.textContent = count; c.classList.toggle("is-visible", count > 0);
        f.textContent = state.favs.length; f.classList.toggle("is-visible", state.favs.length > 0);
    }

    function openDrawer() {
        js("drawer").classList.add("is-open");
        js("drawer").setAttribute("aria-hidden", "false");
        js("overlay").classList.add("is-open");
        document.body.classList.add("no-scroll");
    }
    function closeDrawer() {
        js("drawer").classList.remove("is-open");
        js("drawer").setAttribute("aria-hidden", "true");
        js("overlay").classList.remove("is-open");
        document.body.classList.remove("no-scroll");
    }
    js("cart-open").addEventListener("click", openDrawer);
    js("cart-close").addEventListener("click", closeDrawer);
    js("overlay").addEventListener("click", closeDrawer);

    /* =================================================================
       7. COMMANDE → Supabase, table "orders"
       ================================================================= */
    const checkoutForm = js("checkout-form");

    function renderCheckoutSummary() {
        const t = totals(checkoutForm.promo.value);
        js("checkout-summary").innerHTML = `
            ${cartLines().map((l) => `<div class="drawer__line"><span>${l.qty} × ${esc(l.product.name)}</span><span>${money(l.product.price * l.qty)}</span></div>`).join("")}
            ${t.discount ? `<div class="drawer__line"><span>Code promo</span><span>−${money(t.discount)}</span></div>` : ""}
            <div class="drawer__line"><span>Livraison</span><span>${t.shipping ? money(t.shipping) : "Offerte"}</span></div>
            <div class="drawer__line drawer__line--total"><span>Total</span><span>${money(t.total)}</span></div>`;
    }

    js("checkout-open").addEventListener("click", () => {
        if (!state.cart.length) return;
        closeDrawer();
        checkoutForm.hidden = false;
        js("checkout-success").hidden = true;
        renderCheckoutSummary();
        openModal(js("checkout-modal"));
    });

    checkoutForm.promo.addEventListener("input", renderCheckoutSummary);

    checkoutForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!checkoutForm.checkValidity()) { checkoutForm.reportValidity(); return; }

        const submitBtn = checkoutForm.querySelector("[type=submit]");
        submitBtn.disabled = true;
        submitBtn.textContent = "Envoi en cours…";

        const f = new FormData(checkoutForm);
        const t = totals(f.get("promo"));
        const ref = "SOL-" + Date.now().toString(36).toUpperCase().slice(-6);
        const order = {
            order_ref: ref,
            customer_name: f.get("customer_name").trim(),
            email: f.get("email").trim(),
            address: f.get("address").trim(),
            zip: f.get("zip").trim(),
            city: f.get("city").trim(),
            promo_code: (f.get("promo") || "").trim().toUpperCase() || null,
            items: cartLines().map((l) => ({ product_id: l.id, name: l.product.name, qty: l.qty, unit_price: l.product.price })),
            subtotal: t.subtotal,
            discount: t.discount,
            shipping: t.shipping,
            total: Math.round(t.total * 100) / 100
        };

        let saved = "local";
        if (db) {
            const { error } = await db.from("orders").insert(order);
            if (error) {
                console.error("[SOLÉA] Erreur commande :", error);
                toast("Erreur lors de l'enregistrement. Réessayez.");
                submitBtn.disabled = false;
                submitBtn.textContent = "Valider la commande";
                return;
            }
            saved = "supabase";
        } else {
            const orders = store.get("solea_orders", []);
            orders.push({ ...order, created_at: new Date().toISOString() });
            store.set("solea_orders", orders);
        }

        state.cart = [];
        saveCart();
        checkoutForm.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = "Valider la commande";
        checkoutForm.hidden = true;
        const success = js("checkout-success");
        success.hidden = false;
        success.innerHTML = `
            <div class="big-sun">☀</div>
            <p class="eyebrow">Commande ${esc(ref)}</p>
            <h3>Merci ${esc(order.customer_name.split(" ")[0])} !</h3>
            <p>Votre commande de <strong>${money(order.total)}</strong> est confirmée.<br>Un e-mail de confirmation sera envoyé à ${esc(order.email)}.</p>
            <p class="checkout__note">${saved === "supabase" ? "✓ Commande enregistrée dans la base Supabase (table orders)." : "Mode démo : commande enregistrée dans le navigateur (configurez Supabase pour la base en ligne)."}</p>
            <br><button class="btn btn--sun" data-js="modal-close-btn">Continuer mes achats</button>`;
        $("[data-js='modal-close-btn']", success).addEventListener("click", closeModals);
    });

    /* =================================================================
       8. NEWSLETTER → Supabase, table "newsletter"
       ================================================================= */
    js("newsletter-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const input = e.target.email;
        const msg = js("newsletter-msg");
        const email = input.value.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            msg.textContent = "Merci d'indiquer une adresse e-mail valide.";
            return;
        }
        if (db) {
            const { error } = await db.from("newsletter").insert({ email });
            if (error && error.code === "23505") { msg.textContent = "Vous êtes déjà inscrit·e au Club Soleil ☀"; return; }
            if (error) { console.error(error); msg.textContent = "Oups, une erreur est survenue. Réessayez."; return; }
        } else {
            const list = store.get("solea_newsletter", []);
            if (list.includes(email)) { msg.textContent = "Vous êtes déjà inscrit·e au Club Soleil ☀"; return; }
            list.push(email); store.set("solea_newsletter", list);
        }
        msg.textContent = "Bienvenue au Club Soleil ! Votre code : SOLEIL10";
        input.value = "";
    });

    /* =================================================================
       9. DIAGNOSTIC (QUIZ)
       ================================================================= */
    const quiz = js("quiz");
    const SKIN = { claire: "Peau claire", mate: "Peau mate", foncee: "Peau foncée" };
    const LIFE = { ville: "Été en ville", plage: "Été à la plage", sport: "Été sportif" };

    function showStep(step) {
        $$(".quiz__step", quiz).forEach((s) => s.classList.toggle("is-active", s.dataset.step === String(step)));
        const n = step === "result" ? 3 : step - 1;
        js("quiz-progress").style.width = (n / 3) * 100 + "%";
    }

    function recommend({ skin, zone, life }) {
        const picks = [];
        if (zone === "visage") {
            picks.push(life === "ville" && skin !== "claire" ? "creme-eclat-teintee" : "voile-lumiere");
            if (life === "sport" || life === "plage") picks.push("stick-protecteur");
        } else if (zone === "corps") {
            picks.push(skin === "claire" || life !== "ville" ? "brume-invisible" : "lait-dore");
            if (life === "plage" && skin !== "claire") picks.push("huile-sublime");
        } else {
            picks.push("coffret-rituel-ete");
            if (life === "sport") picks.push("brume-invisible");
        }
        if (!picks.includes("coffret-rituel-ete")) picks.push("gelee-fraiche");
        return picks.map(bySlug).filter(Boolean).slice(0, 3);
    }

    function renderResult() {
        const a = state.quiz;
        const picks = recommend(a);
        const advice = a.skin === "claire"
            ? "Votre peau est sensible au soleil : choisissez toujours un SPF 50+ et renouvelez toutes les 2 heures."
            : a.skin === "mate"
                ? "Votre peau bronze bien, mais les UVA vieillissent la peau : un SPF 30 à 50 reste indispensable."
                : "Même une peau foncée subit les UV : une protection quotidienne prévient les taches et le vieillissement.";
        $("[data-step='result']", quiz).innerHTML = `
            <span class="result-label">${SKIN[a.skin]} · ${LIFE[a.life]}</span>
            <h3>Votre routine SOLÉA sur mesure</h3>
            <div class="result-products">
                ${picks.map((p) => `
                <div class="result-product">
                    <div class="mini-visual">${window.soleaVisual(p)}</div>
                    <div><strong>${esc(p.name)}</strong><span>${esc(p.short_description)} · ${money(p.price)}</span></div>
                    <button class="btn btn--sun btn--sm" data-quiz-add="${p.id}">Ajouter</button>
                </div>`).join("")}
            </div>
            <p style="font-size:.92rem;color:var(--sand-300)">${advice}</p>
            <button class="quiz__restart" data-quiz-restart>Recommencer le diagnostic</button>`;
        showStep("result");
    }

    quiz.addEventListener("click", (e) => {
        const answer = e.target.closest("[data-answer]");
        if (answer) {
            const step = Number(answer.closest(".quiz__step").dataset.step);
            const key = ["skin", "zone", "life"][step - 1];
            state.quiz[key] = answer.dataset.answer;
            step < 3 ? showStep(step + 1) : renderResult();
        }
        const add = e.target.closest("[data-quiz-add]");
        if (add) addToCart(Number(add.dataset.quizAdd), 1);
        if (e.target.closest("[data-quiz-restart]")) { state.quiz = {}; showStep(1); }
    });

    /* =================================================================
       10. INTERFACE
       ================================================================= */
    // Modales
    function openModal(modal) {
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("no-scroll");
    }
    function closeModals() {
        $$(".modal.is-open").forEach((m) => { m.classList.remove("is-open"); m.setAttribute("aria-hidden", "true"); });
        if (!js("drawer").classList.contains("is-open")) document.body.classList.remove("no-scroll");
    }
    $$(".modal").forEach((m) => m.addEventListener("click", (e) => {
        if (e.target === m || e.target.closest("[data-js='modal-close']")) closeModals();
    }));
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") { closeModals(); closeDrawer(); closeNav(); }
    });

    // Notification
    let toastTimer;
    function toast(text) {
        const t = js("toast");
        t.textContent = text;
        t.classList.add("is-visible");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => t.classList.remove("is-visible"), 2600);
    }

    // Menu mobile
    function closeNav() { js("nav").classList.remove("is-open"); }
    js("burger").addEventListener("click", () => js("nav").classList.toggle("is-open"));
    $$(".nav__link").forEach((l) => l.addEventListener("click", closeNav));

    // Header qui change au défilement
    const header = js("header");
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Apparition des éléments au défilement
    const io = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }) : null;
    $$(".reveal").forEach((el, i) => {
        el.style.transitionDelay = (i % 4) * 80 + "ms";
        io ? io.observe(el) : el.classList.add("is-visible");
    });

    // Carte "produit vedette" du hero
    function renderHeroProduct() {
        const p = bySlug("voile-lumiere") || state.products[0];
        if (!p) return;
        const el = js("hero-product");
        el.innerHTML = `<div class="mini-visual">${window.soleaVisual(p)}</div>
            <div><strong>${esc(p.name)}</strong><span><b style="color:var(--sun-500)">★</b> ${p.rating.toFixed(1).replace(".", ",")} · ${money(p.price)}</span></div>`;
        el.onclick = () => openProduct(p.id);
    }

    function renderDbStatus() {
        const el = js("db-status");
        if (state.source === "supabase") {
            el.textContent = `Base Supabase connectée · ${state.products.length} produits`;
            el.classList.add("is-online");
        } else {
            el.textContent = configured
                ? "Supabase injoignable · catalogue local"
                : "Mode démo · configurez js/supabase-config.js";
        }
    }

    js("year").textContent = new Date().getFullYear();

    /* ---------- Démarrage ---------- */
    (async function init() {
        await loadProducts();
        // On retire du panier/favoris les produits qui n'existent plus
        state.cart = state.cart.filter((l) => byId(l.id));
        state.favs = state.favs.filter((id) => byId(id));
        renderShop();
        renderCart();
        updateCounters();
        renderHeroProduct();
        renderDbStatus();
        js("quiz-progress").style.width = "0%";
    })();
})();
