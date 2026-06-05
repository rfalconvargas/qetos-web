/* =====================================================================
   Qetos — Supabase client (auth + data layer)
   Project: Qetos · us-east-1 · ref efkantatoxcpcteqthfh
   The publishable key is safe in the client; Row-Level Security ensures
   each user can only read/write their own rows.
   ===================================================================== */
window.DB = (function () {
  const URL = "https://efkantatoxcpcteqthfh.supabase.co";
  const KEY = "sb_publishable_Fz1rBBX18kB92YNvfGLvBg_HHPEhkeG";

  let sb = null;
  let user = null;

  function ready() { return !!sb; }

  function init() {
    if (sb) return sb;
    if (!window.supabase || !window.supabase.createClient) {
      console.warn("[DB] Supabase SDK not loaded — running in offline/demo mode.");
      return null;
    }
    sb = window.supabase.createClient(URL, KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
    return sb;
  }

  // ---------- AUTH ----------
  async function getSession() {
    if (!ready()) return null;
    const { data } = await sb.auth.getSession();
    user = data.session ? data.session.user : null;
    return data.session;
  }
  function onAuth(cb) { if (ready()) sb.auth.onAuthStateChange((_e, s) => { user = s ? s.user : null; cb(s); }); }

  // Email magic link works out-of-the-box (Supabase default mailer).
  async function signInWithEmail(email) {
    if (!ready()) throw new Error("offline");
    // On device, send the magic link back via a custom-scheme deep link so it
    // reopens the app (https://localhost can't return to the WebView).
    const native = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
    const emailRedirectTo = native ? "com.ketofy.app://login-callback" : window.location.origin;
    return sb.auth.signInWithOtp({ email, options: { emailRedirectTo } });
  }
  // Phone OTP requires an SMS provider (Twilio etc.) enabled in the dashboard.
  async function signInWithPhone(phone) {
    if (!ready()) throw new Error("offline");
    return sb.auth.signInWithOtp({ phone });
  }
  async function verifyPhone(phone, token) {
    return sb.auth.verifyOtp({ phone, token, type: "sms" });
  }
  // Google / Apple require the provider to be enabled in Supabase Auth settings.
  async function signInWithProvider(provider) {
    if (!ready()) throw new Error("offline");
    return sb.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin } });
  }
  // Native sign-in: exchange a Google ID token (from the native account picker)
  // for a Supabase session. No client secret needed for this flow.
  async function signInWithIdToken(provider, token, nonce) {
    if (!ready()) throw new Error("offline");
    return sb.auth.signInWithIdToken({ provider, token, nonce });
  }
  async function signOut() { if (ready()) await sb.auth.signOut(); user = null; }
  function currentUser() { return user; }

  // ---------- PROFILE / TARGETS ----------
  async function getProfile() { if (!user) return null; const { data } = await sb.from("profiles").select("*").eq("id", user.id).single(); return data; }
  async function upsertProfile(p) { return sb.from("profiles").upsert({ id: user.id, ...p }); }
  async function getTargets() { if (!user) return null; const { data } = await sb.from("targets").select("*").eq("user_id", user.id).single(); return data; }
  async function saveTargets(t) { return sb.from("targets").upsert({ user_id: user.id, ...t, updated_at: new Date().toISOString() }); }

  // ---------- SUPPLEMENTS ----------
  async function listSupplements() { if (!user) return []; const { data } = await sb.from("supplements").select("*").eq("user_id", user.id); return data || []; }
  async function setSupplements(list) {
    await sb.from("supplements").delete().eq("user_id", user.id);
    return sb.from("supplements").insert(list.map(s => ({ ...s, user_id: user.id })));
  }

  // ---------- LOGGING ----------
  async function addMeal(m) { return sb.from("meals").insert({ ...m, user_id: user.id }); }
  async function addKetone(k) { return sb.from("ketone_readings").insert({ ...k, user_id: user.id }); }
  async function addWin(type, note) { return sb.from("wins").insert({ type, note, user_id: user.id }); }
  async function listWins() { if (!user) return []; const { data } = await sb.from("wins").select("*").eq("user_id", user.id); return data || []; }
  async function addLabReport(r) { return sb.from("lab_reports").insert({ ...r, user_id: user.id }).select().single(); }
  async function addLabMetrics(reportId, metrics) { if (!metrics || !metrics.length) return; return sb.from("lab_metrics").insert(metrics.map(x => ({ metric: x.metric, value: x.value, unit: x.unit, flag: x.flag, report_id: reportId, user_id: user.id }))); }
  async function saveDaily(d) { return sb.from("daily_logs").upsert({ ...d, user_id: user.id }); }
  // Ketone readings on a given local day (dayISO = "YYYY-MM-DD"), oldest first.
  async function listKetonesByDay(dayISO) {
    if (!user) return [];
    const start = new Date(dayISO + "T00:00:00");
    const end = new Date(start); end.setDate(end.getDate() + 1);
    const { data } = await sb.from("ketone_readings").select("*").eq("user_id", user.id)
      .gte("created_at", start.toISOString()).lt("created_at", end.toISOString())
      .order("created_at", { ascending: true });
    return data || [];
  }
  // Meals logged on a given local day (dayISO = "YYYY-MM-DD"), oldest first.
  async function listMealsByDay(dayISO) {
    if (!user) return [];
    const start = new Date(dayISO + "T00:00:00");
    const end = new Date(start); end.setDate(end.getDate() + 1);
    const { data } = await sb.from("meals").select("*").eq("user_id", user.id)
      .gte("created_at", start.toISOString()).lt("created_at", end.toISOString())
      .order("created_at", { ascending: true });
    return data || [];
  }

  // ---------- shopping list (Food tab) ----------
  async function addShoppingItem(item, qty, store) { return sb.from("shopping_list").insert({ item, qty, store, user_id: user.id }); }
  async function listShopping() { if (!user) return []; const { data } = await sb.from("shopping_list").select("*").eq("user_id", user.id).order("created_at"); return data || []; }
  async function setShoppingChecked(id, checked) { return sb.from("shopping_list").update({ checked }).eq("id", id); }

  // ---------- SHARED LISTS (collaborative shopping) ----------
  // Token-based: anyone holding a list's share_token (uuid) can collaborate,
  // no auth required. These wrap server-side SECURITY DEFINER RPCs — keep the
  // p_* argument names in sync with the SQL function signatures.
  async function createSharedList(name, createdBy) {
    if (!ready()) throw new Error("offline");
    const { data } = await sb.rpc("create_shared_list", { p_name: name, p_created_by: createdBy });
    return data; // -> shared_lists row (has .id and .share_token)
  }
  async function getSharedList(token) {
    if (!ready()) throw new Error("offline");
    const { data } = await sb.rpc("get_shared_list", { p_token: token });
    return data; // -> jsonb { list, items }
  }
  async function addSharedItem(token, item, qty, addedBy) {
    if (!ready()) throw new Error("offline");
    const { data } = await sb.rpc("add_shared_item", { p_token: token, p_item: item, p_qty: qty, p_added_by: addedBy });
    return data; // -> shared_list_items row
  }
  async function setSharedChecked(token, itemId, checked) {
    if (!ready()) throw new Error("offline");
    return sb.rpc("set_shared_item_checked", { p_token: token, p_item_id: itemId, p_checked: checked });
  }
  async function removeSharedItem(token, itemId) {
    if (!ready()) throw new Error("offline");
    return sb.rpc("remove_shared_item", { p_token: token, p_item_id: itemId });
  }
  async function renameSharedList(token, name) {
    if (!ready()) throw new Error("offline");
    return sb.rpc("rename_shared_list", { p_token: token, p_name: name });
  }
  async function clearCheckedShared(token) {
    if (!ready()) throw new Error("offline");
    return sb.rpc("clear_checked_items", { p_token: token });
  }

  // Realtime: subscribe to every change on a shared list's items and the list
  // row itself (e.g. renames). `listId` is shared_lists.id (returned by
  // getSharedList). onChange(payload) fires per change; payload has
  // .eventType ("INSERT"|"UPDATE"|"DELETE"), .new, .old and .table.
  // Returns the channel; pass it back to unsubscribeShared() to tear down.
  // NOTE: requires the shared_lists / shared_list_items tables to be added to
  // the `supabase_realtime` publication — not yet enabled as of this writing.
  function subscribeSharedList(listId, onChange) {
    if (!ready() || !listId) return null;
    return sb.channel("shared_list:" + listId)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "shared_list_items", filter: "list_id=eq." + listId },
        (payload) => onChange(payload))
      .on("postgres_changes",
        { event: "*", schema: "public", table: "shared_lists", filter: "id=eq." + listId },
        (payload) => onChange(payload))
      .subscribe();
  }
  function unsubscribeShared(channel) { if (ready() && channel) sb.removeChannel(channel); }

  // ---------- CHAT + MEMORY ----------
  async function saveMessage(role, content) { return sb.from("chat_messages").insert({ role, content, user_id: user.id }); }
  async function recentMessages(n = 20) { if (!user) return []; const { data } = await sb.from("chat_messages").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(n); return (data || []).reverse(); }
  async function addMemory(kind, content, embedding) { return sb.from("memories").insert({ kind, content, embedding, user_id: user.id }); }

  // ---------- onboarding (write user #1 — you) ----------
  async function completeOnboarding(seed) {
    if (!user) return;
    await upsertProfile({ email: user.email, full_name: seed.full_name, age: seed.age, sex: seed.sex,
      height_cm: seed.height_cm, weight_kg: seed.weight_kg, goals: seed.goals, onboarded: true });
    await saveTargets(seed.targets);
    if (seed.supplements?.length) await setSupplements(seed.supplements);
  }

  return { init, ready, getSession, onAuth, signInWithEmail, signInWithPhone, verifyPhone,
    signInWithProvider, signInWithIdToken, signOut, currentUser, getProfile, upsertProfile, getTargets, saveTargets,
    listSupplements, setSupplements, addMeal, listMealsByDay, addKetone, listKetonesByDay, addWin, listWins, addLabReport, addLabMetrics, saveDaily,
    addShoppingItem, listShopping, setShoppingChecked,
    createSharedList, getSharedList, addSharedItem, setSharedChecked, removeSharedItem,
    renameSharedList, clearCheckedShared, subscribeSharedList, unsubscribeShared,
    saveMessage, recentMessages, addMemory, completeOnboarding };
})();
