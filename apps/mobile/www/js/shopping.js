/* =====================================================================
   Qetos — Shopping list (full-screen overlay + durable real-time share)
   Loaded AFTER app.js, so it relies on these globals:
     state, DB, toast, Store, escapeHtml, (optional) haptic, renderShopping
   ---------------------------------------------------------------------
   DURABLE & COLLABORATIVE: the list lives server-side in the
   shared_lists / shared_list_items tables, reached only through the
   token-gated SECURITY DEFINER RPCs in supabase-client.js (DB.*Shared*).
   An unguessable share_token (uuid) is the capability — anyone with the
   link can view/add/check/rename, no account needed.

   REALTIME: the shared tables are RLS-locked (no anon SELECT), so
   postgres_changes can't deliver to anon. Instead we use a Realtime
   *broadcast* channel keyed by the token: every mutation sends a light
   "sync" ping and peers re-fetch the authoritative state via
   get_shared_list. Presence powers the live collaborator avatars.

   state.shopping stays mirrored from the shared list so the Food-tab's
   inline list (app.js renderShopping) keeps working unchanged.
   ===================================================================== */
(function () {
  "use strict";

  const TOKEN_KEY = "qetos-shop-token";
  const NAME_KEY  = "qetos-collab-name";
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const shop = {
    token: null,
    list: { id: null, name: "", items: [] },
    channel: null,
    me: "You",
    isVisitor: false,
    booted: false,
  };

  const $id = (id) => document.getElementById(id);
  function sbClient() { try { return DB && DB.init ? DB.init() : null; } catch (e) { return null; } }
  function signedIn() { try { return !!(DB && DB.ready && DB.ready() && DB.currentUser && DB.currentUser()); } catch (e) { return false; } }
  function esc(s) { try { return escapeHtml(String(s == null ? "" : s)); } catch (e) { return String(s == null ? "" : s); } }
  function buzz() { try { if (typeof haptic === "function") haptic(); } catch (e) {} }
  function note(m) { try { if (typeof toast === "function") toast(m); } catch (e) {} }
  function normItem(it) { return { id: it.id, item: it.item || "", qty: it.qty || "", checked: !!it.checked, added_by: it.added_by || null }; }

  /* ---------- identity ---------- */
  async function resolveName() {
    try { const n = await Store.get(NAME_KEY); if (n && n.trim()) return n.trim(); } catch (e) {}
    try { if (signedIn() && DB.getProfile) { const p = await DB.getProfile(); if (p && p.full_name) return String(p.full_name).split(" ")[0]; } } catch (e) {}
    return shop.isVisitor ? "Guest" : "You";
  }
  function changeName() {
    const n = prompt("Your name on this list", shop.me || "Guest");
    if (n && n.trim()) {
      shop.me = n.trim();
      try { Store.set(NAME_KEY, shop.me); } catch (e) {}
      if (shop.channel) { try { shop.channel.track({ name: shop.me }); } catch (e) {} }
      broadcast();
    }
  }

  /* ---------- mirror to the Food-tab inline list (app.js owns renderShopping) ---------- */
  function mirror() {
    try {
      state.shopping = shop.list.items.map((it) => ({ id: it.id, item: it.item, qty: it.qty || "", checked: !!it.checked, store: null }));
      if (typeof renderShopping === "function") renderShopping();
    } catch (e) {}
  }

  /* ---------- rendering (overlay) ---------- */
  function render() {
    const titleEl = $id("shopTitle");
    if (titleEl && document.activeElement !== titleEl) titleEl.value = shop.list.name || "";

    const body = $id("shopBody");
    if (!body) return;
    const items = shop.list.items;
    const total = items.length;
    const done = items.filter((s) => s.checked).length;

    const sum = $id("shopSummary");
    if (sum) {
      sum.innerHTML = total
        ? `<p class="font-caption text-text-muted uppercase tracking-widest">${done}/${total} gathered</p>`
          + (done
              ? `<button onclick="shopClearChecked()" class="font-caption text-primary inline-flex items-center gap-1 active:scale-95 transition"><span class="material-symbols-outlined text-[18px]">delete_sweep</span> Clear checked</button>`
              : ``)
        : ``;
    }

    if (!total) {
      body.innerHTML = `<div class="text-center p-space-6">
        <span class="material-symbols-outlined text-text-muted text-[40px]">shopping_cart</span>
        <p class="font-body-sm text-text-muted mt-space-2">Your list is empty.</p>
        <p class="font-caption text-text-muted">Add items below, or from a recipe.</p>
      </div>`;
      return;
    }

    body.innerHTML = items.map((s, i) => `
      <div class="flex items-center gap-space-3 bg-surface-container-lowest rounded-[16px] p-space-3">
        <button onclick="shopToggle(${i})" aria-label="Toggle item" class="w-6 h-6 rounded-full border ${s.checked ? "bg-accent-teal border-transparent text-primary" : "border-outline text-transparent"} grid place-items-center shrink-0 active:scale-90 transition"><span class="material-symbols-outlined text-[16px]">check</span></button>
        <span class="flex-1 font-body-sm ${s.checked ? "text-text-muted line-through" : "text-primary"}">${esc(s.qty ? s.qty + " " : "")}${esc(s.item)}${s.added_by ? ` <span class="font-caption text-text-muted">· ${esc(s.added_by)}</span>` : ""}</span>
        <button onclick="shopRemove(${i})" aria-label="Remove item" class="w-6 h-6 rounded-full grid place-items-center text-text-muted active:scale-90 transition shrink-0"><span class="material-symbols-outlined text-[18px]">close</span></button>
      </div>`).join("");
  }

  function renderPresence(pstate) {
    const el = $id("shopPresence");
    if (!el) return;
    const names = [];
    Object.values(pstate || {}).forEach((arr) => (arr || []).forEach((p) => { if (p && p.name) names.push(p.name); }));
    const uniq = [...new Set(names)];
    if (uniq.length <= 1) { el.innerHTML = ""; return; }
    el.innerHTML = uniq.slice(0, 3).map((n, i) =>
      `<span class="w-6 h-6 -ml-1.5 first:ml-0 rounded-full grid place-items-center font-caption border-2 border-background-base ${i % 2 ? "bg-accent-lavender" : "bg-accent-teal"} text-primary" title="${esc(n)}">${esc((n[0] || "?").toUpperCase())}</span>`
    ).join("")
      + (uniq.length > 3 ? `<span class="w-6 h-6 -ml-1.5 rounded-full grid place-items-center font-caption bg-soft-mint text-text-muted border-2 border-background-base">+${uniq.length - 3}</span>` : "");
  }

  /* ---------- list lifecycle ---------- */
  async function loadList(token, opts) {
    opts = opts || {};
    if (!sbClient()) return false;
    try {
      const data = await DB.getSharedList(token);
      if (!data || !data.id) { if (!opts.silent) console.warn("[shop] list not found"); return false; }
      shop.token = token;
      shop.list = { id: data.id, name: data.name || "", items: (data.items || []).map(normItem) };
      render(); mirror();
      return true;
    } catch (e) { if (!opts.silent) console.warn("[shop] load:", e); return false; }
  }

  async function createList(name) {
    if (!sbClient()) { note("Offline — can't create the list yet"); return null; }
    if (!shop.me) shop.me = await resolveName();
    try {
      const row = await DB.createSharedList(name || "My Shopping List", shop.me);
      if (!row || !row.share_token) { note("Could not create the list"); return null; }
      shop.token = row.share_token;
      shop.list = { id: row.id, name: row.name || "My Shopping List", items: [] };
      try { await Store.set(TOKEN_KEY, shop.token); } catch (e) {}
      render(); mirror();
      return shop.token;
    } catch (e) { console.warn("[shop] create:", e); note("Could not create the list"); return null; }
  }

  // Resolve (or lazily create) the active shared list; returns its share_token.
  async function ensureList() {
    if (shop.token && shop.list.id) return shop.token;
    let token = null;
    try { token = await Store.get(TOKEN_KEY); } catch (e) {}
    if (token && UUID_RE.test(token) && await loadList(token)) return shop.token;
    if (shop.isVisitor) return null;                 // visitor + bad token → nothing to show
    return await createList();                        // owner → start a fresh list
  }

  /* ---------- mutations (optimistic + RPC + broadcast ping) ---------- */
  async function shopAdd() {
    const inp = $id("shopInput");
    if (!inp) return;
    const v = (inp.value || "").trim();
    if (!v) return;
    inp.value = "";
    const token = await ensureList();
    if (!token) { note("Couldn't open the list"); return; }
    if (!shop.me) shop.me = await resolveName();

    const tmp = { id: "tmp-" + Date.now(), item: v, qty: "", checked: false, added_by: shop.me };
    shop.list.items.push(tmp); render(); mirror(); buzz();
    try {
      const row = await DB.addSharedItem(token, v, null, shop.me);
      const idx = shop.list.items.findIndex((x) => x.id === tmp.id);
      if (row && row.id) { if (idx >= 0) shop.list.items[idx] = normItem(row); }
      else if (idx >= 0) shop.list.items.splice(idx, 1);
      render(); mirror(); broadcast();
    } catch (e) {
      const idx = shop.list.items.findIndex((x) => x.id === tmp.id);
      if (idx >= 0) shop.list.items.splice(idx, 1);
      render(); mirror(); note("Could not add item");
    }
  }

  async function shopToggle(i) {
    const s = shop.list.items[i];
    if (!s) return;
    const next = !s.checked;
    s.checked = next; render(); mirror(); buzz();
    if (String(s.id).startsWith("tmp-")) return;
    try { await DB.setSharedChecked(shop.token, s.id, next); broadcast(); }
    catch (e) { s.checked = !next; render(); mirror(); note("Sync failed"); }
  }

  async function shopRemove(i) {
    const s = shop.list.items[i];
    if (!s) return;
    const backup = shop.list.items.slice();
    shop.list.items.splice(i, 1); render(); mirror(); buzz();
    if (String(s.id).startsWith("tmp-")) return;
    try { await DB.removeSharedItem(shop.token, s.id); broadcast(); }
    catch (e) { shop.list.items = backup; render(); mirror(); note("Could not remove"); }
  }

  async function shopClearChecked() {
    if (!shop.token) return;
    const backup = shop.list.items.slice();
    shop.list.items = shop.list.items.filter((s) => !s.checked); render(); mirror(); buzz();
    try { await DB.clearCheckedShared(shop.token); broadcast(); note("Cleared checked items"); }
    catch (e) { shop.list.items = backup; render(); mirror(); note("Could not clear"); }
  }

  async function renameList(val) {
    const name = (val || "").trim() || "My Shopping List";
    shop.list.name = name;
    const token = shop.token || await ensureList();
    if (!token) return;
    try { await DB.renameSharedList(token, name); render(); note("List renamed"); broadcast(); }
    catch (e) { note("Could not rename"); }
  }

  /* ---------- realtime: broadcast ping + RPC refetch + presence ---------- */
  function setSyncDot(on) { const d = $id("shopSyncDot"); if (d) d.classList.toggle("hidden", !on); }
  function broadcast() {
    if (!shop.channel) return;
    try { shop.channel.send({ type: "broadcast", event: "sync", payload: { by: shop.me } }); } catch (e) {}
  }
  function joinRoom(token) {
    const sb = sbClient();
    if (!sb || !token) { setSyncDot(false); return; }
    leaveRoom();
    try {
      const ch = sb.channel("shoplist:" + token, {
        config: { broadcast: { self: false }, presence: { key: (shop.me || "me") + "-" + Math.random().toString(36).slice(2, 7) } },
      });
      ch.on("broadcast", { event: "sync" }, (m) => {
        loadList(token, { silent: true });
        const by = m && m.payload && m.payload.by;
        if (by && by !== shop.me) note(by + " updated the list");
      });
      ch.on("presence", { event: "sync" }, () => renderPresence(ch.presenceState()));
      ch.subscribe((status) => {
        if (status === "SUBSCRIBED") { setSyncDot(true); try { ch.track({ name: shop.me }); } catch (e) {} }
        else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") { setSyncDot(false); }
      });
      shop.channel = ch;
    } catch (e) { console.warn("[shop] joinRoom:", e); setSyncDot(false); }
  }
  function leaveRoom() {
    if (shop.channel) {
      try {
        const sb = sbClient();
        if (sb && sb.removeChannel) sb.removeChannel(shop.channel);
        else if (shop.channel.unsubscribe) shop.channel.unsubscribe();
      } catch (e) {}
      shop.channel = null;
    }
    setSyncDot(false);
  }

  /* ---------- overlay open / close ---------- */
  async function openShopping() {
    const el = $id("shoppingScreen");
    if (!el) return;
    el.classList.add("open");
    shop.me = await resolveName();
    const token = await ensureList();
    if (token) joinRoom(token);
    render();
  }
  function closeShopping() { const el = $id("shoppingScreen"); if (el) el.classList.remove("open"); closeShareSheet(); }

  /* ---------- share sheet ---------- */
  function shareLinkFor(token) {
    try { const u = new URL(location.href); u.hash = ""; u.searchParams.set("shop", token); return u.toString(); }
    catch (e) { return location.origin + location.pathname + "?shop=" + token; }
  }
  async function openShareSheet() {
    const sheet = $id("shareSheet");
    if (!sheet) return;
    const token = await ensureList();
    if (!token) { note("List is still loading…"); return; }
    if (!shop.channel) joinRoom(token);
    const linkEl = $id("shareLink"); if (linkEl) linkEl.textContent = shareLinkFor(token);
    const stop = $id("shopStopShareBtn"); if (stop) stop.classList.remove("hidden");
    sheet.classList.remove("hidden");
  }
  function closeShareSheet() { const s = $id("shareSheet"); if (s) s.classList.add("hidden"); }
  async function shopCopyLink() {
    if (!shop.token) return;
    const link = shareLinkFor(shop.token);
    try { await navigator.clipboard.writeText(link); note("Link copied — send it to your family"); }
    catch (e) {
      if (navigator.share) { try { await navigator.share({ title: shop.list.name || "Shopping list", url: link }); } catch (_) {} }
      else note("Copy this link to share");
    }
    buzz();
  }
  async function shopStopShare() {
    leaveRoom();
    try { await Store.remove(TOKEN_KEY); } catch (e) {}
    shop.token = null;
    shop.list = { id: null, name: "", items: [] };
    render(); mirror();
    const stop = $id("shopStopShareBtn"); if (stop) stop.classList.add("hidden");
    closeShareSheet();
    note("Stopped sharing on this device");
  }

  /* ---------- boot: adopt incoming ?shop= link, or warm the saved list ---------- */
  async function boot() {
    let incoming = null;
    try {
      const u = new URL(location.href);
      incoming = u.searchParams.get("shop");
      if (!incoming && location.hash.indexOf("shop=") !== -1) {
        incoming = new URLSearchParams(location.hash.replace(/^#/, "")).get("shop");
      }
    } catch (e) {}

    if (incoming && UUID_RE.test(incoming)) {
      shop.isVisitor = true;
      try { await Store.set(TOKEN_KEY, incoming); } catch (e) {}
      shop.me = await resolveName();
      if (await loadList(incoming)) {
        joinRoom(incoming);
        setTimeout(() => { try { openShopping(); } catch (e) {} }, 400);
      }
    } else {
      shop.me = await resolveName();
      let token = null;
      try { token = await Store.get(TOKEN_KEY); } catch (e) {}
      if (token && UUID_RE.test(token) && await loadList(token, { silent: true })) joinRoom(token);
    }
  }
  function bootOnce() { if (shop.booted) return; shop.booted = true; setTimeout(boot, 300); }
  document.addEventListener("DOMContentLoaded", bootOnce);

  // Any element marked data-open-shopping opens the overlay (decoupled entry point).
  document.addEventListener("click", (e) => {
    const t = e.target && e.target.closest && e.target.closest("[data-open-shopping]");
    if (t) { e.preventDefault(); openShopping(); }
  });

  /* ---------- integrate the Food-tab actions with the shared list ---------- */
  // Re-point app.js's inline handlers so the recipe list + tab toggles use the
  // durable shared list instead of the legacy per-user table.
  window.toggleShop = function (i) { shopToggle(i); };
  window.addRecipeToShopping = async function () {
    const r = state.lastRecipe;
    if (!r || !r.ingredients) return;
    const token = await ensureList();
    if (!token) { note("Couldn't open the list"); return; }
    if (!shop.me) shop.me = await resolveName();
    for (const x of r.ingredients) {
      try { const row = await DB.addSharedItem(token, x.item, x.qty || null, shop.me); if (row && row.id) shop.list.items.push(normItem(row)); } catch (e) {}
    }
    render(); mirror(); broadcast();
    note(r.ingredients.length + " items added to shopping list");
  };

  // Public handlers used by inline onclick in index.html, plus an integration API.
  Object.assign(window, {
    openShopping, closeShopping, openShareSheet, closeShareSheet,
    shopAdd, shopToggle, shopRemove, shopClearChecked, shopCopyLink, shopStopShare,
    renameList, changeName,
  });
  window.Shopping = { open: openShopping, close: closeShopping, share: openShareSheet, refresh: () => loadList(shop.token, { silent: true }) };
})();
