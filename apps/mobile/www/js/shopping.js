/* =====================================================================
   Qetos — Shopping list (full-screen overlay + realtime share)
   Loaded AFTER app.js, so it relies on these globals:
     $, Store, state, DB, toast, haptic, escapeHtml
   Single source of truth is `state.shopping` (shared with the Food tab's
   inline list in app.js). We keep that list in sync but never redefine
   app.js's renderShopping()/toggleShop().

   Realtime: `DB.init()` returns the live Supabase client, so we open a
   broadcast channel on it directly — no duplicated keys, no change to the
   core-owned supabase-client.js. Sharing is room-based: a token persisted
   under localStorage('qetos-shop-token') identifies the shared list; anyone
   opening the share link joins the same channel and sees live updates.
   ===================================================================== */
(function () {
  "use strict";

  const TOKEN_KEY = "qetos-shop-token";

  let channel = null;          // active Supabase realtime channel (or null)
  let activeToken = null;      // token of the room we're joined to
  let applyingRemote = false;  // guard: don't re-broadcast remote-applied changes
  let booted = false;

  state.shopping = (state.shopping || []);

  /* ---------- model helpers ---------- */
  function uid() { return "l" + Math.random().toString(36).slice(2, 9); }

  // Normalise any item (local or DB row or broadcast payload) to one shape.
  function norm(it) {
    it = it || {};
    return {
      id: it.id || null,            // Supabase row id (present once loaded from DB)
      lid: it.lid || uid(),         // stable local id (survives broadcast round-trips)
      item: it.item || "",
      qty: it.qty || "",
      store: it.store || null,
      checked: !!it.checked,
    };
  }
  function payloadItems() {
    return state.shopping.map(s => ({ id: s.id || null, lid: s.lid, item: s.item, qty: s.qty, store: s.store || null, checked: !!s.checked }));
  }

  function client() { try { return DB && DB.init ? DB.init() : null; } catch (e) { return null; } }
  function signedIn() { try { return !!(DB && DB.ready && DB.ready() && DB.currentUser && DB.currentUser()); } catch (e) { return false; } }

  // Mirror changes into the Food-tab inline list without owning its render fn.
  function syncFoodTab() { try { if (typeof renderShopping === "function") renderShopping(); } catch (e) {} }

  /* ---------- rendering ---------- */
  function render() {
    const body = $("shopBody");
    if (!body) return;
    const items = state.shopping;
    const total = items.length;
    const done = items.filter(s => s.checked).length;

    const sum = $("shopSummary");
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
        <span class="flex-1 font-body-sm ${s.checked ? "text-text-muted line-through" : "text-primary"}">${escapeHtml(s.qty ? s.qty + " " : "")}${escapeHtml(s.item)}${s.store ? ` <span class="font-caption text-text-muted">· ${escapeHtml(s.store)}</span>` : ""}</span>
        <button onclick="shopRemove(${i})" aria-label="Remove item" class="w-6 h-6 rounded-full grid place-items-center text-text-muted active:scale-90 transition shrink-0"><span class="material-symbols-outlined text-[18px]">close</span></button>
      </div>`).join("");
  }

  /* ---------- load ---------- */
  async function load() {
    if (signedIn()) {
      try {
        const rows = await DB.listShopping();
        if (Array.isArray(rows)) state.shopping = rows.map(norm);
      } catch (e) { console.warn("[shop] load:", e); }
    } else {
      state.shopping = state.shopping.map(norm);
    }
    render();
  }

  /* ---------- optimistic mutations ---------- */
  function shopAdd() {
    const inp = $("shopInput");
    if (!inp) return;
    const v = (inp.value || "").trim();
    if (!v) return;
    const it = norm({ item: v });
    state.shopping.push(it);          // optimistic: render immediately
    inp.value = "";
    render(); syncFoodTab();
    if (signedIn()) { try { DB.addShoppingItem(it.item, it.qty || "", it.store || null); } catch (e) {} }
    broadcast();
    haptic();
  }

  function shopToggle(i) {
    const s = state.shopping[i];
    if (!s) return;
    s.checked = !s.checked;           // optimistic
    render(); syncFoodTab();
    if (s.id && signedIn()) { try { DB.setShoppingChecked(s.id, s.checked); } catch (e) {} }
    broadcast();
    haptic();
  }

  function shopRemove(i) {
    const s = state.shopping[i];
    if (!s) return;
    state.shopping.splice(i, 1);      // optimistic
    render(); syncFoodTab();
    // Remote delete only if the data layer exposes it (core branch may add this).
    if (s.id && signedIn() && DB && typeof DB.removeShoppingItem === "function") { try { DB.removeShoppingItem(s.id); } catch (e) {} }
    broadcast();
  }

  function shopClearChecked() {
    const removed = state.shopping.filter(s => s.checked);
    state.shopping = state.shopping.filter(s => !s.checked);
    render(); syncFoodTab();
    if (signedIn() && DB && typeof DB.removeShoppingItem === "function") {
      removed.forEach(s => { if (s.id) { try { DB.removeShoppingItem(s.id); } catch (e) {} } });
    }
    broadcast();
    haptic();
  }

  /* ---------- overlay open / close ---------- */
  function openShopping() { const el = $("shoppingScreen"); if (!el) return; el.classList.add("open"); load(); }
  function closeShopping() { const el = $("shoppingScreen"); if (el) el.classList.remove("open"); }

  /* ---------- realtime broadcast sync ---------- */
  function setSyncDot(on) { const d = $("shopSyncDot"); if (d) d.classList.toggle("hidden", !on); }

  function shareLinkFor(token) {
    try { const u = new URL(location.href); u.hash = ""; u.searchParams.set("shop", token); return u.toString(); }
    catch (e) { return location.origin + location.pathname + "?shop=" + token; }
  }

  function applyRemote(payload) {
    if (!payload || !Array.isArray(payload.items)) return;
    applyingRemote = true;            // last-write-wins; don't echo back
    state.shopping = payload.items.map(norm);
    render(); syncFoodTab();
    applyingRemote = false;
  }

  function broadcast() {
    if (applyingRemote || !channel) return;
    try { channel.send({ type: "broadcast", event: "sync", payload: { items: payloadItems(), at: Date.now() } }); }
    catch (e) { console.warn("[shop] broadcast:", e); }
  }

  function joinRoom(token) {
    const sb = client();
    activeToken = token || null;
    if (!sb || !token) { setSyncDot(false); return false; }
    leaveRoom();
    try {
      channel = sb.channel("shop:" + token, { config: { broadcast: { self: false } } });
      channel.on("broadcast", { event: "sync" }, ({ payload }) => applyRemote(payload));
      // A newcomer says "hello" → everyone re-broadcasts so they get the current list.
      channel.on("broadcast", { event: "hello" }, () => broadcast());
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setSyncDot(true);
          try { channel.send({ type: "broadcast", event: "hello", payload: {} }); } catch (e) {}
        }
      });
      return true;
    } catch (e) {
      console.warn("[shop] joinRoom:", e); channel = null; setSyncDot(false); return false;
    }
  }

  function leaveRoom() {
    if (channel) {
      try {
        const sb = client();
        if (sb && sb.removeChannel) sb.removeChannel(channel);
        else if (channel.unsubscribe) channel.unsubscribe();
      } catch (e) {}
      channel = null;
    }
    setSyncDot(false);
  }

  /* ---------- share sheet ---------- */
  async function ensureToken() {
    let token = await Store.get(TOKEN_KEY);
    if (!token) { token = uid() + uid(); await Store.set(TOKEN_KEY, token); }
    return token;
  }

  async function openShareSheet() {
    const sheet = $("shareSheet");
    if (!sheet) return;
    const token = await ensureToken();
    const joined = (activeToken === token && channel) ? true : joinRoom(token);
    const linkEl = $("shareLink"); if (linkEl) linkEl.textContent = shareLinkFor(token);
    const stop = $("shopStopShareBtn"); if (stop) stop.classList.remove("hidden");
    sheet.classList.remove("hidden");
    if (!joined && !client()) toast("Link's ready — live sync starts when you're back online");
  }
  function closeShareSheet() { const s = $("shareSheet"); if (s) s.classList.add("hidden"); }

  async function shopCopyLink() {
    const token = await Store.get(TOKEN_KEY);
    if (!token) return;
    const link = shareLinkFor(token);
    try { await navigator.clipboard.writeText(link); toast("Link copied"); }
    catch (e) { toast("Copy this link to share"); }
    haptic();
  }

  async function shopStopShare() {
    leaveRoom();
    await Store.remove(TOKEN_KEY);
    activeToken = null;
    const stop = $("shopStopShareBtn"); if (stop) stop.classList.add("hidden");
    closeShareSheet();
    toast("Stopped sharing");
  }

  /* ---------- boot ---------- */
  async function boot() {
    // 1) Adopt an incoming shared link (?shop=… or #shop=…).
    let incoming = null;
    try {
      const u = new URL(location.href);
      incoming = u.searchParams.get("shop");
      if (!incoming && location.hash.indexOf("shop=") !== -1) {
        incoming = new URLSearchParams(location.hash.replace(/^#/, "")).get("shop");
      }
    } catch (e) {}
    if (incoming) await Store.set(TOKEN_KEY, incoming);

    // 2) Rejoin any saved room so updates stay live across reloads.
    const token = await Store.get(TOKEN_KEY);
    if (token) joinRoom(token);

    // 3) If we arrived via a share link, surface the list right away.
    if (incoming) setTimeout(() => { try { openShopping(); } catch (e) {} }, 400);
  }
  function bootOnce() { if (booted) return; booted = true; boot(); }
  document.addEventListener("DOMContentLoaded", bootOnce);

  /* ---------- wiring ---------- */
  // Any element marked data-open-shopping opens the overlay (decoupled entry point).
  document.addEventListener("click", (e) => {
    const t = e.target && e.target.closest && e.target.closest("[data-open-shopping]");
    if (t) { e.preventDefault(); openShopping(); }
  });

  // Expose handlers used by inline onclick in index.html, plus an integration API.
  Object.assign(window, {
    openShopping, closeShopping, openShareSheet, closeShareSheet,
    shopAdd, shopToggle, shopRemove, shopClearChecked, shopCopyLink, shopStopShare,
  });
  window.Shopping = { open: openShopping, close: closeShopping, share: openShareSheet, refresh: load, join: joinRoom, leave: leaveRoom };
})();
