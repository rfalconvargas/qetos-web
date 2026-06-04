/* =====================================================================
   Qetos — interaction layer (vanilla JS)
   Wires the Stitch design into a working app: auth, nav, chat (via
   Concierge), camera, DRESS journey, breathing, settings, theming.
   Persists light state via Capacitor Preferences (or localStorage on web).
   ===================================================================== */

const state = {
  view: "chat",
  energy: 88,
  cravingWins: 1,
  habitWins: 3,
  logMode: "food",
  listening: false,
  connections: { whoop: false, oura: false, cronometer: false },
};

const $ = (id) => document.getElementById(id);
const onCapacitor = () => !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
// Escape a value for safe interpolation into an HTML attribute (value="...").
const escAttr = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* ---------- lightweight persistence ---------- */
const Store = {
  async get(k){ try{ if(onCapacitor() && window.Capacitor.Plugins.Preferences){ const {value}=await window.Capacitor.Plugins.Preferences.get({key:k}); return value;} return localStorage.getItem(k);}catch(e){return null;} },
  async set(k,v){ try{ if(onCapacitor() && window.Capacitor.Plugins.Preferences){ await window.Capacitor.Plugins.Preferences.set({key:k,value:v}); return;} localStorage.setItem(k,v);}catch(e){} },
  async remove(k){ try{ if(onCapacitor() && window.Capacitor.Plugins.Preferences){ await window.Capacitor.Plugins.Preferences.remove({key:k}); return;} localStorage.removeItem(k);}catch(e){} },
};

/* ---------- profile persistence (Preferred name / Age / Primary focus) ----------
   Source of truth for the Profile settings screen. Persisted via Store, which
   uses Capacitor Preferences on device (and localStorage on web) — both survive
   an app restart. When signed in we also best-effort mirror to Supabase. */
const PROFILE_KEY = "qetos-profile";
const PROFILE_DEFAULTS = { preferred_name: "Raul", age: 41, primary_focus: "Metabolic + cognitive longevity" };

async function loadProfile(){
  try {
    const raw = await Store.get(PROFILE_KEY);
    state.profile = raw ? { ...PROFILE_DEFAULTS, ...JSON.parse(raw) } : { ...PROFILE_DEFAULTS };
  } catch(e){ console.warn("loadProfile:", e); state.profile = { ...PROFILE_DEFAULTS }; }
  const n = String(state.profile.preferred_name || "").trim();
  if (n) state.firstName = n.split(/\s+/)[0];
  return state.profile;
}

async function saveProfile(form){
  const nameEl = form.querySelector("#pf-name");
  const ageEl  = form.querySelector("#pf-age");
  const focusEl = form.querySelector("#pf-focus");

  const preferred_name = (nameEl?.value || "").trim();
  const primary_focus  = (focusEl?.value || "").trim();
  const age = parseInt((ageEl?.value || "").trim(), 10);

  // Validate before committing so we never persist garbage.
  if (!preferred_name) { toast("Please enter a preferred name"); nameEl?.focus(); return; }
  if (!Number.isFinite(age) || age < 13 || age > 120) { toast("Please enter a valid age (13–120)"); ageEl?.focus(); return; }

  const btn = form.querySelector('button[type="submit"]') || form.querySelector("button");
  if (btn) { btn.disabled = true; btn.textContent = "Saving…"; }

  state.profile = { ...(state.profile || PROFILE_DEFAULTS), preferred_name, age, primary_focus };

  // 1) Commit locally — guaranteed to persist across restarts.
  await Store.set(PROFILE_KEY, JSON.stringify(state.profile));

  // 2) Best-effort remote sync when signed in (failure never breaks the local save).
  if (DB.ready() && DB.currentUser()) {
    try { await DB.upsertProfile({ full_name: preferred_name, age }); }
    catch (e) { console.warn("profile remote sync:", e); }
  }

  // Reflect the new name in the Concierge greeting immediately.
  state.firstName = preferred_name.split(/\s+/)[0];

  if (btn) { btn.disabled = false; btn.textContent = "Save profile"; }
  try { haptic(); } catch(e){}
  toast("Profile saved");
}

/* ===================== AUTH ===================== */
// User #1 onboarding seed (you). Targets computed from your stats:
// 193cm / 86.7kg / 23 / male → BMR ~1963, maintenance ~2750 kcal, protein ~1.8 g/kg.
const ONBOARDING_SEED = {
  full_name: "Raul Falcon", age: 23, sex: "male", height_cm: 193, weight_kg: 86.7,
  goals: ["lower_ldl","raise_hdl","low_triglycerides","perfect_bloodwork"],
  targets: { net_carbs_g: 20, protein_g: 155, calories: 2750, ketone_goal: 1.5, daylight_min: 20 },
  supplements: [
    { name: "Invega Sustenna (paliperidone palmitate)", dose: "156 mg", timing: "1× monthly (injection)" },
    { name: "Lithium", dose: "600 mg", timing: "2× daily" },
    { name: "Vitamin D3 + K2", dose: "1 capsule", timing: "1× daily" },
    { name: "ProOmega 2000 (omega-3)", dose: "softgels", timing: "2× daily" },
    { name: "PhytoMulti Multivitamin", dose: "tablets", timing: "2× daily" },
    { name: "Cortisol Manager", dose: "1 tablet", timing: "1× daily" },
  ],
};
// First name for the Concierge greeting — overridden by the real profile once logged in.
state.firstName = (ONBOARDING_SEED.full_name || "there").trim().split(/\s+/)[0];

async function signIn(provider){
  const map = { Google: "google", Apple: "apple" };
  if (DB.ready() && map[provider]) {
    try { await DB.signInWithProvider(map[provider]); return; }  // redirects out
    catch (e) { console.warn(e); toast("Enable " + provider + " in Supabase Auth — using demo for now"); }
  }
  toast(provider + " (demo mode)"); enterApp();
}
async function sendMagic(){
  const email = ($("authEmail").value || "").trim();
  const btn = $("magicBtn"); btn.textContent = "Sending…"; btn.classList.add("opacity-80");
  if (DB.ready() && email) {
    try {
      await DB.signInWithEmail(email);
      btn.innerHTML = '<span class="material-symbols-outlined align-middle">mark_email_read</span> Check your email';
      btn.style.backgroundColor = "#E8F0EC"; btn.style.color = "#071834";
      toast("Magic link sent to " + email);
      return;
    } catch (e) { console.warn("magic link failed, demo fallback:", e); }
  }
  setTimeout(() => { btn.innerHTML = '<span class="material-symbols-outlined align-middle">check_circle</span> Sent'; btn.style.backgroundColor = "#E8F0EC"; btn.style.color = "#071834"; setTimeout(enterApp, 900); }, 1000);
}
function revealApp(){
  const card = $("authCard"); card.style.opacity = "0"; card.style.transform = "translateY(-20px)";
  setTimeout(() => { $("auth").style.display = "none"; $("appHeader").classList.remove("hidden"); $("viewport").classList.remove("hidden"); $("bottomNav").classList.remove("hidden"); switchView("chat"); }, 500);
}
function enterApp(){ Store.set("qetos-auth", "1"); revealApp(); }   // demo path
async function syncUser(){
  if (!DB.ready() || !DB.currentUser()) return;
  try {
    const p = await DB.getProfile();
    if (p && p.full_name) state.firstName = p.full_name.trim().split(/\s+/)[0];
    if (p && !p.onboarded) { await DB.completeOnboarding(ONBOARDING_SEED); toast("Profile synced"); }
    // Persist a consent acceptance that happened before sign-in.
    const consentTs = await Store.get("qetos-consent");
    if (consentTs && p && !p.consent_accepted_at) { try { await DB.upsertProfile({ consent_accepted_at: consentTs }); } catch (e) { console.warn("consent sync:", e); } }
    const t = await DB.getTargets();
    if (t && t.calories) { /* future: reflect real targets in UI */ }
  } catch (e) { console.warn("syncUser:", e); }
}

/* ===================== CONSENT / MEDICAL DISCLAIMER GATE ===================== */
// One-time gate. Persisted locally (qetos-consent) and, once signed in, mirrored
// to profiles.consent_accepted_at. Never re-shown after acceptance.
async function checkConsent(){
  const accepted = await Store.get("qetos-consent");
  if(!accepted){ const c = $("consent"); if(c){ c.style.display = "flex"; c.style.opacity = "1"; } }
}
async function acceptConsent(){
  const ts = new Date().toISOString();
  await Store.set("qetos-consent", ts);
  const c = $("consent"); if(c){ c.style.opacity = "0"; setTimeout(() => { c.style.display = "none"; }, 350); }
  if(DB.ready() && DB.currentUser()){ try{ await DB.upsertProfile({ consent_accepted_at: ts }); }catch(e){ console.warn("consent upsert:", e); } }
  haptic();
}

/* ===================== NAV / VIEW SWAP ===================== */
function switchView(view){
  state.view = view;
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  $("view-" + view).classList.add("active");
  document.querySelectorAll(".nav-btn").forEach(b => {
    b.classList.remove("bg-accent-teal","text-primary");
    b.classList.add("text-text-muted");
    const ic = b.querySelector(".material-symbols-outlined"); if(ic) ic.style.fontVariationSettings = "'FILL' 0";
  });
  const active = $("nav-" + view);
  active.classList.add("bg-accent-teal","text-primary"); active.classList.remove("text-text-muted");
  const ai = active.querySelector(".material-symbols-outlined"); if(ai) ai.style.fontVariationSettings = "'FILL' 1";
  $("chatDock").style.display = (view === "chat") ? "block" : "none";
  if (view === "chat") scrollChat();
  if (view === "plan") { renderPlanHeader(); loadPlanDay(); }
}

/* ===================== TOAST ===================== */
let toastT;
function toast(msg){
  $("toastMsg").textContent = msg;
  const t = $("toast"); t.style.opacity = "1"; t.style.transform = "translate(-50%,0)";
  clearTimeout(toastT);
  toastT = setTimeout(() => { t.style.opacity = "0"; t.style.transform = "translate(-50%,8px)"; }, 2500);
  haptic();
}
function haptic(){ try{ if(onCapacitor() && window.Capacitor.Plugins.Haptics) window.Capacitor.Plugins.Haptics.impact({style:"LIGHT"}); }catch(e){} }

/* ===================== CHAT ===================== */
function scrollChat(){ const v = $("view-chat"); requestAnimationFrame(() => { v.scrollTop = v.scrollHeight; }); }

function aiBubble(inner){
  return `<div class="msg-in flex flex-col items-start w-full gap-space-3">
    <div class="flex items-center gap-2"><span class="material-symbols-outlined text-primary text-[20px]">auto_awesome</span><span class="font-caption tracking-widest text-primary uppercase">Qetos AI</span></div>
    <div class="max-w-[90%] bg-soft-mint p-space-4 rounded-[20px] chat-bubble-ai"><p class="font-body-base text-primary leading-relaxed">${inner}</p></div></div>`;
}
function userBubble(text){
  return `<div class="msg-in flex flex-col items-end w-full"><div class="max-w-[85%] bg-white p-space-4 rounded-[20px] chat-bubble-user editorial-shadow"><p class="font-body-base text-primary">${escapeHtml(text)}</p></div></div>`;
}
function escapeHtml(s){ return String(s).replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c])); }

function appendChat(html){ $("chatLog").insertAdjacentHTML("beforeend", html); scrollChat(); }
function showTyping(){
  appendChat(`<div id="typing" class="msg-in flex items-center gap-2"><span class="material-symbols-outlined text-primary text-[20px]">auto_awesome</span><div class="typing bg-soft-mint px-space-4 py-3 rounded-[20px] flex gap-1.5 items-center"><span></span><span></span><span></span></div></div>`);
}
function hideTyping(){ const t = $("typing"); if(t) t.remove(); }

async function sayFrom(promise, delay = 850){
  showTyping();
  const [html] = await Promise.all([promise, new Promise(r => setTimeout(r, delay))]);
  hideTyping(); appendChat(aiBubble(html));
}

function handleSend(){
  const inp = $("chatInput"); const text = inp.value.trim(); if(!text) return;
  appendChat(userBubble(text)); inp.value = "";
  sayFrom(Concierge.ask(text, ctx()));
}
function followUp(answer){ appendChat(userBubble(answer)); sayFrom(Concierge.followUp(answer, ctx()), 700); }
function ctx(){ return { name: state.firstName, energy: state.energy, cravingWins: state.cravingWins, habitWins: state.habitWins, connections: state.connections }; }

function quickAction(type){
  if(type === "next"){
    appendChat(userBubble("What's next?"));
    sayFrom(Promise.resolve(`Your next gentle step is a <b>5-minute breathing reset</b> — your afternoon is the perfect window. After that, a short brain-focused training set if you have the energy.` +
      `<div class="mt-space-3 flex gap-space-2 flex-wrap"><button onclick="startBreathing()" class="bg-primary text-white py-3 px-6 rounded-full font-body-sm active:scale-95 transition inline-flex items-center gap-2"><span class="material-symbols-outlined text-[18px]">air</span> Begin reset</button><button onclick="switchView('plan')" class="bg-white border border-soft-mint py-3 px-6 rounded-full font-body-sm text-primary active:scale-95 transition">See full path</button></div>`));
  } else if(type === "win"){
    appendChat(userBubble("Log another win")); addWin("habit");
    sayFrom(Promise.resolve(`Logged — that's <b>${state.habitWins}</b> habit wins woven into today. Each is a small vote for the person you're becoming. What was the win, so I can learn your patterns?`), 600);
  } else if(type === "score"){
    appendChat(userBubble("Check my score"));
    sayFrom(Promise.resolve(`Your <b>Energy Stability</b> sits at <b>${state.energy}%</b> — calm and trending gently upward. The lift is from steady sleep and supplements; the small drag is the afternoon fog. Want to log an energy win to reinforce it?` +
      `<div class="mt-space-3"><button onclick="logEnergyWin()" class="bg-primary text-white py-3 px-6 rounded-full font-body-sm active:scale-95 transition inline-flex items-center gap-2"><span class="material-symbols-outlined text-[18px]">auto_awesome</span> Log energy win</button></div>`), 600);
  }
}

function logEnergyWin(){
  state.energy = Math.min(99, state.energy + 2);
  $("energyBar").style.width = state.energy + "%"; $("energyVal").textContent = state.energy;
  addOrb(); saveState(); toast("Energy win logged · +2 stability");
  if(state.view === "chat"){ sayFrom(Promise.resolve(`Noted, and I can see it in your trend — <b>${state.energy}%</b>. Naming a win tells your brain the strategy worked, which makes it easier to repeat. Quietly proud of you.`), 600); }
  else { switchView("chat"); setTimeout(() => sayFrom(Promise.resolve(`Energy win logged — you're at <b>${state.energy}%</b>. 🌿`), 400), 300); }
}

/* mic */
function toggleMic(){
  const btn = $("micBtn");
  if(state.listening){ state.listening = false; btn.classList.remove("listening"); return; }
  state.listening = true; btn.classList.add("listening"); toast("Listening…");
  setTimeout(() => { state.listening = false; btn.classList.remove("listening"); $("chatInput").value = "I've felt low energy and a bit foggy since lunch"; $("chatInput").focus(); }, 1500);
}

/* ===================== LOG / OMNI-CAMERA ===================== */
function setLogMode(mode){
  state.logMode = mode;
  const set = (el, on) => { if(el) el.className = "px-space-4 py-2 rounded-full transition " + (on ? "bg-primary text-white" : "text-primary"); };
  set($("modeFood"), mode==="food"); set($("modeKetone"), mode==="ketone"); set($("modeDoc"), mode==="document");
  const cfg = {
    food:     ["photo_camera",  "Scan a Meal",          "Center your plate — I'll estimate macros & cholesterol impact."],
    ketone:   ["monitor_heart", "Scan your Keto-Mojo",  "Photograph the meter screen — I'll read BHB / glucose & GKI."],
    document: ["description",    "Scan a Lab or Plan",   "Photo or PDF of bloodwork or your health plan."],
  }[mode] || ["photo_camera","Scan or Log Anything","Rapid scan for food, labels, or wellness markers"];
  $("camIcon").textContent = cfg[0]; $("camTitle").textContent = cfg[1]; $("camSub").textContent = cfg[2];
  const mb = $("manualKetoneBtn"); if(mb) mb.classList.toggle("hidden", mode!=="ketone");
}

// Capture a photo (native camera on device, file picker on web). Returns {data,mimeType} base64.
async function capturePhoto(mode){
  if(onCapacitor() && window.Capacitor.Plugins.Camera){
    try {
      const p = await window.Capacitor.Plugins.Camera.getPhoto({ quality:70, resultType:"base64", source: mode==="food" ? "CAMERA" : "PROMPT" });
      return { data: p.base64String, mimeType: "image/" + (p.format || "jpeg") };
    } catch(e){ return null; }   // cancelled
  }
  return new Promise((resolve) => {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = (mode==="document") ? "image/*,application/pdf" : "image/*";
    inp.setAttribute("capture", "environment");
    inp.onchange = () => {
      const f = inp.files && inp.files[0]; if(!f){ resolve(null); return; }
      const reader = new FileReader();
      reader.onload = () => { const res = String(reader.result); resolve({ data: res.slice(res.indexOf(",")+1), mimeType: f.type || "image/jpeg" }); };
      reader.readAsDataURL(f);
    };
    inp.click();
  });
}

// Save a captured log image to a dedicated local folder (Capacitor Filesystem
// on device, under Data/qetos-logs/<mode>/) and always return a data URL for
// rendering a thumbnail. On web there's no folder, so only the data URL is set.
async function saveLogImage(mode, cap){
  const dataUrl = `data:${cap.mimeType};base64,${cap.data}`;
  let path = null;
  try {
    if(onCapacitor() && window.Capacitor.Plugins.Filesystem){
      const fs = window.Capacitor.Plugins.Filesystem;
      const ext = ((cap.mimeType||"image/jpeg").split("/")[1] || "jpg").replace("jpeg","jpg").replace("+xml","");
      const dir = `qetos-logs/${mode}`;
      try { await fs.mkdir({ path: dir, directory: "Data", recursive: true }); } catch(_){ /* already exists */ }
      path = `${dir}/${Date.now()}.${ext}`;
      await fs.writeFile({ path, data: cap.data, directory: "Data" });   // base64 -> binary
    }
  } catch(e){ console.warn("saveLogImage:", e); }
  return { dataUrl, path };
}

async function runShutter(){
  haptic();
  const mode = state.logMode;
  const cap = await capturePhoto(mode);
  if(!cap){ return; }   // user cancelled the picker
  const out = $("logResult"); out.classList.remove("hidden");
  out.innerHTML = `<div class="bg-surface-container-lowest rounded-[24px] p-space-8 text-center reveal"><div class="w-10 h-10 mx-auto rounded-full border-2 border-soft-mint border-t-accent-orange animate-spin"></div><p class="font-body-sm text-text-muted mt-space-3">${mode==="food"?"Reading your meal…":mode==="ketone"?"Reading your meter…":"Parsing your document…"}</p></div>`;
  const saved = await saveLogImage(mode, cap);   // persist the photo to the log folder
  try {
    const { result } = await Vision.analyze(mode, cap.data, cap.mimeType);
    result.image = saved.dataUrl; result.image_path = saved.path;
    state.lastVision = { mode, result };
    if(mode==="ketone"){
      out.innerHTML = renderKetone(result, false);   // review/correct, then Save reading
    } else {
      out.innerHTML = renderVision(mode, result);
      persistVision(mode, result).catch(e => console.warn("persist:", e));
    }
    out.scrollIntoView({ behavior:"smooth", block:"center" });
  } catch(e){
    console.warn("vision failed:", e);
    if(mode==="ketone"){
      // OCR failed — open the manual numeric entry with the photo thumbnail.
      const r = { bhb_mmol:null, glucose_mgdl:null, note:"Couldn't read the meter — type your ketone level below.", image: saved.dataUrl, image_path: saved.path };
      state.lastVision = { mode:"ketone", result:r };
      out.innerHTML = renderKetone(r, true);
      out.scrollIntoView({ behavior:"smooth", block:"center" });
      const el = $("ketoneInput"); if(el) el.focus();
    } else {
      out.innerHTML = (mode==="food") ? foodCard() : medicalCard();
    }
  }
}

// ----- real result cards from parsed data -----
function impactBadge(v){
  const map = { lowers_ldl:["LDL-lowering","bg-accent-teal"], raises_ldl:["raises LDL","bg-accent-orange/60"], neutral:["LDL-neutral","bg-soft-mint"] };
  const e = map[v]; if(!e) return "";
  return `<span class="inline-flex items-center gap-1 shrink-0">
    <span class="font-caption px-space-3 py-1 rounded-full ${e[1]} text-primary">${e[0]}</span>
    <button onclick="openLdlInfo()" aria-label="What does the LDL status mean?" title="What does this mean?" class="w-6 h-6 rounded-full bg-soft-mint text-primary grid place-items-center active:scale-90 transition"><span class="material-symbols-outlined text-[16px]">info</span></button>
  </span>`;
}
function openLdlInfo(){ const s=$("ldlSheet"); if(s){ s.classList.remove("hidden"); try{ haptic(); }catch(e){} } }
function closeLdlInfo(){ const s=$("ldlSheet"); if(s) s.classList.add("hidden"); }

/* ===================== PLAN · persistent daily history ===================== */
function startOfDay(d){ const x=new Date(d); x.setHours(0,0,0,0); return x; }
function ymd(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function isSameDay(a,b){ return ymd(a)===ymd(b); }
function fmtPlanDate(d){ return d.toLocaleDateString(undefined,{ weekday:"long", month:"long", day:"numeric", year:"numeric" }); }

function renderPlanHeader(){
  const el=$("planHeader"); if(!el) return;
  if(!state.planDate) state.planDate=startOfDay(new Date());
  const d=state.planDate, today=startOfDay(new Date());
  const isToday=isSameDay(d,today), atToday=d>=today;
  el.innerHTML = `
    <p class="font-caption text-text-muted uppercase tracking-widest mb-space-2">Daily history</p>
    <div class="flex items-center justify-between gap-space-2">
      <button onclick="planShiftDay(-1)" aria-label="Previous day" class="w-10 h-10 rounded-full bg-surface-container-lowest text-primary grid place-items-center active:scale-90 transition shrink-0"><span class="material-symbols-outlined">chevron_left</span></button>
      <button onclick="openPlanCalendar()" class="flex-1 min-w-0 px-space-2 active:scale-[0.98] transition" aria-label="Open calendar to jump to a date">
        <span class="block text-center font-display-lg text-display-lg text-primary leading-tight">${esc(fmtPlanDate(d))}</span>
        <span class="block text-center font-caption text-text-muted">${isToday?"Today":"Tap to jump"} ▾</span>
      </button>
      <button onclick="planShiftDay(1)" aria-label="Next day" ${atToday?"disabled":""} class="w-10 h-10 rounded-full bg-surface-container-lowest text-primary grid place-items-center active:scale-90 transition shrink-0 ${atToday?"opacity-40 pointer-events-none":""}"><span class="material-symbols-outlined">chevron_right</span></button>
    </div>`;
}
function planShiftDay(delta){
  const today=startOfDay(new Date());
  const d=startOfDay(state.planDate||today); d.setDate(d.getDate()+delta);
  if(d>today) return;   // no future history
  state.planDate=d; renderPlanHeader(); loadPlanDay();
}
// Secondary lifestyle goals the user can toggle into the day (custom task module).
const LIFESTYLE_TASKS = [
  { id:"meditate", label:"Meditate",        emoji:"🧘", part:"morning" },
  { id:"daylight", label:"Morning daylight", emoji:"☀️", part:"morning" },
  { id:"workout",  label:"Workout",          emoji:"🏋️", part:"afternoon" },
  { id:"read",     label:"Read",             emoji:"📖", part:"evening" },
  { id:"bed10",    label:"Bed by 10 PM",     emoji:"🌙", part:"evening" },
];

async function loadPlanPrefs(){
  try { const p = await Store.get("qetos-pantry"); state.pantry = p ? JSON.parse(p) : ["Wild salmon","Eggs","Avocado","Spinach","Olive oil"]; }
  catch(e){ state.pantry = ["Wild salmon","Eggs","Avocado","Spinach","Olive oil"]; }
  try { const t = await Store.get("qetos-tasks"); state.tasks = t ? JSON.parse(t) : { meditate:true, bed10:true }; }
  catch(e){ state.tasks = { meditate:true, bed10:true }; }
}
function savePantry(){ Store.set("qetos-pantry", JSON.stringify(state.pantry||[])); }
function saveTasks(){ Store.set("qetos-tasks", JSON.stringify(state.tasks||{})); }

// Intended meal-prep / cooking goals derived from what's in the pantry.
function pantryPrepGoals(){
  const p = (state.pantry||[]).filter(Boolean);
  if(!p.length) return [];
  const lc = p.map(x=>x.toLowerCase());
  const match = RECIPE_IDEAS.find(r => lc.some(it => r.toLowerCase().includes(it.split(" ")[0])));
  return [
    { part:"morning", emoji:"🧑‍🍳", title:"Plan & prep a meal", sub:"From your pantry: " + p.slice(0,3).join(", ") },
    { part:"evening", emoji:"🍳", title: match ? ("Cook: " + match) : "Cook a keto dinner", sub: match ? "Pantry-friendly tonight" : ("Use: " + p.slice(0,3).join(", ")) },
  ];
}

function partOf(d){ if(!d) return "morning"; const h=d.getHours(); return h<12 ? "morning" : h<17 ? "afternoon" : "evening"; }

function timelineRow(it){
  const time = it.time ? it.time.toLocaleTimeString([], { hour:"numeric", minute:"2-digit" }) : "";
  const bg = it.kind==="task" ? "bg-accent-lavender/40" : it.kind==="prep" ? "bg-soft-mint" : "bg-surface-container-lowest";
  return `<div class="flex items-center gap-space-3 ${bg} rounded-[16px] p-space-3">
    <span class="text-[20px] shrink-0" aria-hidden="true">${it.emoji}</span>
    <div class="flex-1 min-w-0"><p class="font-body-base text-primary truncate">${esc(it.title)}</p>${it.sub?`<p class="font-caption text-text-muted truncate">${esc(it.sub)}</p>`:""}</div>
    ${time?`<span class="font-caption text-text-muted shrink-0">${time}</span>`:""}</div>`;
}

function renderPlanTimeline(meals, ketones){
  const el=$("planTimeline"); if(!el) return;
  const parts = {
    morning:{ label:"Morning", emoji:"🌅", items:[] },
    afternoon:{ label:"Afternoon", emoji:"🌤️", items:[] },
    evening:{ label:"Evening", emoji:"🌙", items:[] },
  };
  // enabled lifestyle tasks → their part of day
  LIFESTYLE_TASKS.forEach(t => { if(state.tasks && state.tasks[t.id]) parts[t.part].items.push({ kind:"task", time:null, emoji:t.emoji, title:t.label, sub:"Lifestyle goal" }); });
  // pantry-based meal-prep / cooking goals
  pantryPrepGoals().forEach(g => parts[g.part].items.push({ kind:"prep", time:null, emoji:g.emoji, title:g.title, sub:g.sub }));
  // logged meals
  (meals||[]).forEach(m => { const d = m.created_at ? new Date(m.created_at) : null;
    parts[partOf(d)].items.push({ kind:"meal", time:d, emoji:foodEmoji(m.name||""), title:m.name||"Meal",
      sub:[m.kcal?`${Math.round(m.kcal)} kcal`:"", (m.net_carbs_g!=null)?`${m.net_carbs_g}g net carbs`:""].filter(Boolean).join(" · ") }); });
  // logged ketone readings
  (ketones||[]).forEach(k => { const d = k.created_at ? new Date(k.created_at) : null;
    const val = (k.bhb_mmol!=null) ? `${k.bhb_mmol} mmol BHB` : (k.glucose_mgdl!=null) ? `${k.glucose_mgdl} mg/dL` : "Ketone reading";
    parts[partOf(d)].items.push({ kind:"ketone", time:d, emoji:"🩸", title:val, sub:(k.gki!=null)?`GKI ${k.gki}`:"Ketone reading" }); });

  let html = "";
  for(const key of ["morning","afternoon","evening"]){
    const p = parts[key];
    p.items.sort((a,b)=> (a.time&&b.time) ? a.time-b.time : a.time ? 1 : b.time ? -1 : 0);
    html += `<section class="mb-space-6">
      <div class="flex items-center gap-2 mb-space-3"><span class="text-[16px]" aria-hidden="true">${p.emoji}</span><h3 class="font-headline-md text-headline-md text-primary">${p.label}</h3></div>
      ${p.items.length ? `<div class="space-y-space-2">${p.items.map(timelineRow).join("")}</div>` : `<p class="font-body-sm text-text-muted ml-1">Nothing here yet.</p>`}
    </section>`;
  }
  el.innerHTML = html;
}

function renderPlanGoals(){
  const el=$("planGoals"); if(!el) return;
  const chips = LIFESTYLE_TASKS.map(t => {
    const on = !!(state.tasks && state.tasks[t.id]);
    return `<button onclick="toggleTask('${t.id}')" aria-pressed="${on}" class="font-caption px-space-3 py-2 rounded-full active:scale-95 transition inline-flex items-center gap-1 ${on?'bg-primary text-white':'bg-soft-mint text-primary'}"><span aria-hidden="true">${t.emoji}</span> ${t.label}${on?' ✓':''}</button>`;
  }).join("");
  el.innerHTML = `
    <div class="flex items-center justify-between mb-space-2">
      <p class="font-caption text-text-muted uppercase tracking-widest">Daily goals</p>
      <button onclick="openPantry()" class="font-caption text-primary inline-flex items-center gap-1 active:scale-95 transition">Pantry <span class="material-symbols-outlined text-[16px]">chevron_right</span></button>
    </div>
    <div class="flex flex-wrap gap-2">${chips}</div>`;
}
function toggleTask(id){
  if(!state.tasks) state.tasks = {};
  state.tasks[id] = !state.tasks[id];
  saveTasks();
  renderPlanGoals();
  renderPlanTimeline(state._planMeals||[], state._planKetones||[]);
}

async function loadPlanDay(){
  const el=$("planTimeline"); if(!el) return;
  if(!state.planDate) state.planDate = startOfDay(new Date());
  if(!state.tasks || !state.pantry) await loadPlanPrefs();
  el.innerHTML = `<p class="font-body-sm text-text-muted">Loading…</p>`;
  let meals=[], ketones=[];
  if(DB.ready() && DB.currentUser()){
    try{ meals = await DB.listMealsByDay(ymd(state.planDate)); }catch(e){ console.warn("meals:", e); }
    try{ ketones = await DB.listKetonesByDay(ymd(state.planDate)); }catch(e){ console.warn("ketones:", e); }
  }
  state._planMeals = meals; state._planKetones = ketones;
  renderPlanGoals();
  renderPlanTimeline(meals, ketones);
}

/* ---------- pantry editor ---------- */
function openPantry(){ const o=$("pantrySheet"); if(!o) return; renderPantry(); o.classList.remove("hidden"); }
function closePantry(){ const o=$("pantrySheet"); if(o) o.classList.add("hidden"); }
function renderPantry(){
  const grid=$("pantryList"); if(!grid) return;
  const items = state.pantry||[];
  grid.innerHTML = items.length
    ? items.map((it,i)=>`<span class="inline-flex items-center gap-1 bg-soft-mint text-primary rounded-full px-space-3 py-2 font-caption">${esc(it)} <button onclick="removePantryItem(${i})" aria-label="Remove ${esc(it)}" class="text-text-muted active:scale-90">✕</button></span>`).join("")
    : `<p class="font-body-sm text-text-muted">Your pantry is empty — add what you have on hand.</p>`;
}
function addPantryItem(){
  const inp=$("pantryInput"); const v=(inp&&inp.value||"").trim(); if(!v) return;
  if(!state.pantry) state.pantry=[];
  if(!state.pantry.some(x=>x.toLowerCase()===v.toLowerCase())) state.pantry.push(v);
  inp.value=""; savePantry(); renderPantry();
  renderPlanTimeline(state._planMeals||[], state._planKetones||[]);
}
function removePantryItem(i){
  if(!state.pantry) return; state.pantry.splice(i,1); savePantry(); renderPantry();
  renderPlanTimeline(state._planMeals||[], state._planKetones||[]);
}
function openPlanCalendar(){ const o=$("planCalendar"); if(!o) return; renderPlanCalendar(); o.classList.remove("hidden"); }
function closePlanCalendar(){ const o=$("planCalendar"); if(o) o.classList.add("hidden"); }
function renderPlanCalendar(){
  const grid=$("planCalGrid"); if(!grid) return;
  if(!state.planDate) state.planDate=startOfDay(new Date());
  const today=startOfDay(new Date());
  const days=[]; for(let i=27;i>=0;i--){ const d=new Date(today); d.setDate(d.getDate()-i); days.push(d); }   // rolling 28-day window
  const dow=["S","M","T","W","T","F","S"];
  const pads=Array.from({length:days[0].getDay()},()=>`<div></div>`).join("");
  const cells=days.map(d=>{
    const sel=isSameDay(d,state.planDate), isToday=isSameDay(d,today);
    const cls = sel?"bg-primary text-white":isToday?"bg-accent-teal text-primary":"text-primary";
    return `<button onclick="selectPlanDay('${ymd(d)}')" class="aspect-square rounded-full grid place-items-center font-body-sm active:scale-90 transition ${cls}">${d.getDate()}</button>`;
  }).join("");
  grid.innerHTML = `<div class="grid grid-cols-7 gap-1 mb-space-2 text-center font-caption text-text-muted">${dow.map(x=>`<div>${x}</div>`).join("")}</div>
    <div class="grid grid-cols-7 gap-1">${pads}${cells}</div>`;
}
function selectPlanDay(iso){
  state.planDate = startOfDay(new Date(iso+"T00:00:00"));
  closePlanCalendar(); renderPlanHeader(); loadPlanDay();
}
function renderVision(mode, r){
  if(mode==="food"){
    return `<div class="bg-surface-container-lowest rounded-[24px] p-space-6 reveal">
      <div class="flex items-center gap-2 font-caption text-text-muted uppercase tracking-widest mb-space-4"><span class="material-symbols-outlined text-[16px]">eco</span> Meal · recognized</div>
      <div class="flex items-center justify-between gap-2 mb-space-4"><h4 class="font-display-lg text-display-lg text-primary">${esc(r.name||"Meal")}</h4>${impactBadge(r.cholesterol_impact)}</div>
      <div class="grid grid-cols-3 gap-space-2 text-center mb-space-4">${stat(Math.round(r.kcal||0),"kcal")}${stat((r.net_carbs_g??0)+"g","net carbs")}${stat((r.protein_g??0)+"g","protein")}</div>
      ${(()=>{ const items = mealItemsList(r.ingredients);
        return items
          ? `<p class="font-caption text-text-muted uppercase tracking-widest mb-space-2">Ingredients</p>${items}${r.note?`<p class="font-caption text-text-muted italic mb-space-4">${esc(r.note)}</p>`:""}`
          : `<p class="font-body-sm text-text-muted mb-space-4">${esc(r.note||"")}</p>`; })()}
      ${discussRow()}</div>`;
  }
  if(mode==="ketone"){ return renderKetone(r, false); }
  const list = (arr)=> (arr&&arr.length)?`<ul class="mt-space-2 space-y-2 font-body-sm text-text-muted">${arr.map(x=>`<li>• ${esc(x)}</li>`).join("")}</ul>`:`<p class="font-body-sm text-text-muted mt-space-2">None noted.</p>`;
  const chips = (r.pending_labs||[]).map(p=>`<span class="px-space-4 py-2 rounded-full bg-soft-mint text-primary">${esc(p)}</span>`).join("");
  return `<div class="bg-surface-container-lowest rounded-[24px] p-space-6 reveal space-y-space-6">
    <div class="flex items-center gap-2 font-caption text-text-muted uppercase tracking-widest"><span class="material-symbols-outlined text-[16px]">description</span> ${esc(r.title||"Lab Report")} · parsed</div>
    <div><h4 class="font-headline-md text-headline-md text-primary flex items-center gap-2"><span class="material-symbols-outlined text-accent-teal">visibility</span> Points of Observation</h4>${list(r.observations)}</div>
    <div class="border-t border-outline-variant pt-space-4"><h4 class="font-headline-md text-headline-md text-primary flex items-center gap-2"><span class="material-symbols-outlined text-accent-orange">explore</span> Points of Action</h4>${list(r.actions)}</div>
    <div class="border-t border-outline-variant pt-space-4"><h4 class="font-headline-md text-headline-md text-primary flex items-center gap-2"><span class="material-symbols-outlined text-accent-lavender">science</span> Pending Laboratories &amp; Future Tests</h4><div class="mt-space-2 flex flex-wrap gap-2 font-caption">${chips||'<span class="font-body-sm text-text-muted">None noted.</span>'}</div></div>
    ${discussRow()}</div>`;
}
function discussRow(){
  return `<div class="border-t border-outline-variant pt-space-4 flex items-center justify-between"><p class="font-caption text-accent-teal flex items-center gap-1"><span class="material-symbols-outlined text-[16px] fill1">check_circle</span> Saved &amp; sent to Concierge</p>
    <button onclick="discussVision()" class="bg-primary text-white py-2 px-space-4 rounded-full font-caption active:scale-95 transition inline-flex items-center gap-1">Discuss <span class="material-symbols-outlined text-[16px]">arrow_forward</span></button></div>`;
}
function ketoneFallbackCard(){
  return `<div class="bg-surface-container-lowest rounded-[24px] p-space-6 reveal text-center"><div class="font-caption text-text-muted uppercase tracking-widest mb-space-4">Keto-Mojo</div><p class="font-display-xl text-display-xl text-primary mb-space-2">1.6 <span class="font-body-sm text-text-muted">mmol BHB</span></p><p class="font-body-sm text-text-muted mb-space-4">Comfortably in nutritional ketosis.</p>${discussRow()}</div>`;
}

/* ---------- Keto-Mojo card: photo thumbnail + manual pen-edit ---------- */
// Calm, non-clinical interpretation of a BHB value.
function ketoneNote(v){
  if(v==null) return "";
  if(v<0.5) return "Below nutritional ketosis right now.";
  if(v<1.5) return "Light nutritional ketosis.";
  if(v<=3.0) return "Comfortably in nutritional ketosis.";
  return "High ketones — remember to hydrate and mind your electrolytes.";
}
function renderKetone(r, editing){
  const thumb = r.image
    ? `<img src="${r.image}" alt="Keto-Mojo log" class="w-9 h-9 rounded-[10px] object-cover border border-outline-variant shrink-0"/>`
    : `<span class="material-symbols-outlined text-[16px]">monitor_heart</span>`;
  const tag = r.edited ? " · edited" : (r.image ? " · read" : " · manual");
  const head = `<div class="flex items-center justify-center gap-2 font-caption text-text-muted uppercase tracking-widest mb-space-4">${thumb} <span>Keto-Mojo${tag}</span></div>`;
  if(editing){
    const cur = (r.bhb_mmol!=null) ? r.bhb_mmol : "";
    return `<div class="bg-surface-container-lowest rounded-[24px] p-space-6 reveal text-center">${head}
      <label class="block max-w-[240px] mx-auto mb-space-4"><span class="block font-caption text-text-muted uppercase tracking-widest mb-2">Ketones · mmol BHB</span>
        <input id="ketoneInput" type="number" inputmode="decimal" step="0.1" min="0" max="15" value="${cur}" placeholder="e.g. 1.1" class="w-full text-center rounded-[16px] bg-soft-mint border border-outline-variant py-space-4 font-display-xl text-display-xl text-primary focus:ring-2 focus:ring-accent-teal outline-none"/></label>
      <div class="flex gap-space-2 justify-center">
        <button onclick="applyKetone()" class="flex-1 py-space-3 rounded-full bg-primary text-white font-body-sm active:scale-95 transition">Save reading</button>
        ${(r.bhb_mmol!=null||r.glucose_mgdl!=null) ? `<button onclick="renderKetoneView()" class="py-space-3 px-space-5 rounded-full bg-soft-mint text-primary font-body-sm active:scale-95 transition">Cancel</button>` : ""}
      </div></div>`;
  }
  const val = (r.bhb_mmol!=null) ? r.bhb_mmol+" <span class='font-body-sm text-text-muted'>mmol BHB</span>"
            : (r.glucose_mgdl!=null) ? r.glucose_mgdl+" <span class='font-body-sm text-text-muted'>mg/dL</span>" : "—";
  const editBtn = r._saved ? "" : `<button onclick="editKetone()" aria-label="Edit reading manually" title="Edit reading" class="w-9 h-9 rounded-full bg-soft-mint text-primary grid place-items-center active:scale-90 transition shrink-0"><span class="text-[18px]" aria-hidden="true">✏️</span></button>`;
  return `<div class="bg-surface-container-lowest rounded-[24px] p-space-6 reveal text-center">${head}
    <div class="flex items-center justify-center gap-space-3 mb-space-2">
      <p class="font-display-xl text-display-xl text-primary">${val}</p>${editBtn}
    </div>
    <p class="font-body-sm text-text-muted mb-space-4">${esc(r.note||"")}</p>
    ${r._saved ? discussRow() : `<button onclick="commitKetone()" class="w-full py-space-4 rounded-full bg-primary text-white font-body-base active:scale-95 transition">Save reading</button>`}
  </div>`;
}
function renderKetoneView(){ const v=state.lastVision; if(v&&v.mode==="ketone") $("logResult").innerHTML = renderKetone(v.result,false); }
function editKetone(){ const v=state.lastVision; if(v&&v.mode==="ketone"){ $("logResult").innerHTML = renderKetone(v.result,true); const el=$("ketoneInput"); if(el) el.focus(); } }
function applyKetone(){
  const v=state.lastVision; if(!v||v.mode!=="ketone") return;
  const val = parseFloat($("ketoneInput").value);
  if(!Number.isFinite(val)||val<0||val>15){ toast("Enter a ketone value, e.g. 1.1"); $("ketoneInput").focus(); return; }
  const r=v.result; r.bhb_mmol = +val.toFixed(1); if(r.glucose_mgdl===undefined) r.glucose_mgdl=null; r.edited=true; r.note=ketoneNote(r.bhb_mmol);
  commitKetone();
}
async function commitKetone(){
  const v=state.lastVision; if(!v||v.mode!=="ketone") return;
  const r=v.result;
  if(r.bhb_mmol==null && r.glucose_mgdl==null){ editKetone(); return; }   // nothing to save yet
  if(!r._saved && DB.ready() && DB.currentUser()){
    try {
      const gki = (r.bhb_mmol && r.glucose_mgdl) ? +((r.glucose_mgdl/18)/r.bhb_mmol).toFixed(1) : null;
      await DB.addKetone({ bhb_mmol:r.bhb_mmol, glucose_mgdl:r.glucose_mgdl??null, gki, fasted:null });
    } catch(e){ console.warn("ketone save:", e); }
  }
  r._saved = true;
  renderKetoneView();
  haptic(); toast("Ketone reading saved");
}
// Start a manual reading from scratch — no camera photo required.
function manualKetone(){
  const r = { bhb_mmol:null, glucose_mgdl:null, note:"", image:null };
  state.lastVision = { mode:"ketone", result:r };
  const out=$("logResult"); out.classList.remove("hidden");
  out.innerHTML = renderKetone(r, true);
  out.scrollIntoView({ behavior:"smooth", block:"center" });
  const el=$("ketoneInput"); if(el) el.focus();
}
function esc(s){ return String(s==null?"":s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c])); }

// Pick a contextual food emoji from an ingredient name (first keyword match wins).
function foodEmoji(name){
  const s = String(name||"").toLowerCase();
  const map = [
    [/coffee|espresso|latte|americano/, "☕"],
    [/cream|milk|yogurt|yoghurt|kefir/, "🥛"],
    [/ribeye|steak|beef|burger|brisket|meatball/, "🥩"],
    [/bacon|pork|ham|sausage|chorizo/, "🥓"],
    [/chicken|poultry|turkey|thigh|wing/, "🍗"],
    [/salmon|tuna|fish|sardine|mackerel|cod|anchov/, "🐟"],
    [/shrimp|prawn|crab|lobster|shellfish|scallop/, "🦐"],
    [/egg/, "🥚"],
    [/avocado|guac/, "🥑"],
    [/cheese|parmesan|cheddar|feta|mozzarella|brie/, "🧀"],
    [/butter|ghee/, "🧈"],
    [/olive|oil|dressing|vinaigrette/, "🫒"],
    [/almond|walnut|pecan|macadamia|cashew|pistachio|\bnut|seed/, "🥜"],
    [/spinach|kale|lettuce|salad|greens|arugula|chard/, "🥬"],
    [/broccoli|cauliflower|sprout/, "🥦"],
    [/tomato/, "🍅"],
    [/cucumber|zucchini|courgette|pickle/, "🥒"],
    [/pepper|capsicum|chili|chilli|jalapeno/, "🌶️"],
    [/mushroom/, "🍄"],
    [/onion|garlic|shallot|leek/, "🧅"],
    [/berr|strawberr|blueberr|raspberr/, "🫐"],
    [/coconut/, "🥥"],
    [/lemon|lime/, "🍋"],
    [/rice|bread|pasta|potato|toast|bun|tortilla|oat|noodle/, "🍚"],
  ];
  for (const [re, emo] of map) { if (re.test(s)) return emo; }
  return "🍽️";
}

// Render AI-estimated ingredients as a scannable, emoji-led bulleted list.
// Returns "" when there are no structured ingredients (caller falls back to note).
function mealItemsList(items){
  if (!Array.isArray(items) || !items.length) return "";
  return `<ul class="space-y-space-2 mb-space-4">${items.map(x => {
    const item = esc(x && (x.item ?? x.name) || "");
    const qty = esc(x && (x.qty ?? x.quantity) || "");
    if (!item) return "";
    return `<li class="flex items-center gap-space-3">
      <span class="text-[20px] leading-none shrink-0" aria-hidden="true">${foodEmoji(item)}</span>
      <span class="flex-1 min-w-0 font-body-base text-primary">${item}</span>
      ${qty ? `<span class="font-body-sm text-text-muted shrink-0">${qty}</span>` : ""}</li>`;
  }).join("")}</ul>`;
}

async function persistVision(mode, r){
  if(!DB.ready() || !DB.currentUser()) return;
  if(mode==="food") await DB.addMeal({ name:r.name, kcal:r.kcal, net_carbs_g:r.net_carbs_g, protein_g:r.protein_g, fat_g:r.fat_g, fiber_g:r.fiber_g, cholesterol_impact:r.cholesterol_impact, source:"photo", raw_json:r });
  else if(mode==="ketone"){ const gki = (r.bhb_mmol && r.glucose_mgdl) ? +((r.glucose_mgdl/18)/r.bhb_mmol).toFixed(1) : null; await DB.addKetone({ bhb_mmol:r.bhb_mmol, glucose_mgdl:r.glucose_mgdl, gki, fasted:null }); }
  else { const { data: rep } = await DB.addLabReport({ title:r.title, parsed:r }); if(rep) await DB.addLabMetrics(rep.id, r.metrics); }
}

function discussVision(){
  const v = state.lastVision; if(!v) return;
  switchView("chat");
  let summary;
  if(v.mode==="food") summary = `I just logged a meal: ${v.result.name}, about ${Math.round(v.result.kcal||0)} kcal, ${v.result.net_carbs_g??"?"}g net carbs, ${v.result.protein_g??"?"}g protein. How does this fit my cholesterol goals today?`;
  else if(v.mode==="ketone") summary = `My Keto-Mojo reads ${v.result.bhb_mmol!=null ? v.result.bhb_mmol+" mmol BHB" : (v.result.glucose_mgdl+" mg/dL glucose")}. What does this mean for me right now?`;
  else summary = `I just scanned my lab report "${v.result.title||"report"}". Walk me through what matters most for my cholesterol and metabolic goals.`;
  setTimeout(() => { appendChat(userBubble(summary)); sayFrom(Concierge.ask(summary, ctx())); }, 300);
}

function foodCard(){
  const demo = [
    { item: "Grass-fed ribeye", qty: "170 g" },
    { item: "Avocado", qty: "1/2" },
    { item: "Olive oil", qty: "1 tbsp" },
    { item: "Mixed greens", qty: "1 cup" },
  ];
  return `<div class="bg-surface-container-lowest rounded-[24px] p-space-6 reveal">
    <div class="flex items-center gap-2 font-caption text-text-muted uppercase tracking-widest mb-space-4"><span class="material-symbols-outlined text-[16px]">eco</span> Meal · recognized</div>
    <h4 class="font-display-lg text-display-lg text-primary mb-space-4">Grass-fed ribeye &amp; avocado</h4>
    <div class="grid grid-cols-3 gap-space-2 text-center mb-space-4">
      ${stat("620","kcal")}${stat("4g","net carbs")}${stat("52g","protein")}</div>
    <p class="font-caption text-text-muted uppercase tracking-widest mb-space-2">Ingredients</p>${mealItemsList(demo)}
    <p class="font-caption text-text-muted italic mb-space-4">Deeply ketogenic and protein-forward — a strong choice for stable afternoon energy.</p>
    ${sentRow("meal")}</div>`;
}
function medicalCard(){
  return `<div class="bg-surface-container-lowest rounded-[24px] p-space-6 reveal space-y-space-6">
    <div class="flex items-center gap-2 font-caption text-text-muted uppercase tracking-widest"><span class="material-symbols-outlined text-[16px]">description</span> Lab Report · parsed</div>
    <div><h4 class="font-headline-md text-headline-md text-primary flex items-center gap-2"><span class="material-symbols-outlined text-accent-teal">visibility</span> Points of Observation</h4>
      <ul class="mt-space-2 space-y-2 font-body-sm text-text-muted">
        <li>• Fasting glucose <b class="text-primary">88 mg/dL</b> — excellent control.</li>
        <li>• HDL <b class="text-primary">62</b>, Triglycerides <b class="text-primary">74</b> — favorable ratio.</li>
        <li>• hs-CRP slightly elevated at <b class="text-primary">1.9 mg/L</b> — mild inflammation.</li></ul></div>
    <div class="border-t border-outline-variant pt-space-4"><h4 class="font-headline-md text-headline-md text-primary flex items-center gap-2"><span class="material-symbols-outlined text-accent-orange">explore</span> Points of Action</h4>
      <ul class="mt-space-2 space-y-2 font-body-sm text-text-muted">
        <li>• Add <b class="text-primary">omega-3</b> and prioritize sleep to ease inflammation.</li>
        <li>• Continue current keto window — markers support it.</li>
        <li>• Recheck hs-CRP in <b class="text-primary">8 weeks</b>.</li></ul></div>
    <div class="border-t border-outline-variant pt-space-4"><h4 class="font-headline-md text-headline-md text-primary flex items-center gap-2"><span class="material-symbols-outlined text-accent-lavender">science</span> Pending Laboratories &amp; Future Tests</h4>
      <div class="mt-space-2 flex flex-wrap gap-2 font-caption">
        ${pill("Serum Creatinine")}${pill("LDL-P")}${pill("CAC scan")}${pill("Fasting insulin")}</div></div>
    ${sentRow("report")}</div>`;
}
function stat(v,l){ return `<div class="bg-soft-mint rounded-[16px] p-space-3"><p class="font-display-lg text-display-lg text-primary">${v}</p><p class="font-caption text-text-muted uppercase">${l}</p></div>`; }
function pill(t){ return `<span class="px-space-4 py-2 rounded-full bg-soft-mint text-primary">${t}</span>`; }
function sentRow(kind){
  return `<div class="border-t border-outline-variant pt-space-4 flex items-center justify-between"><p class="font-caption text-accent-teal flex items-center gap-1"><span class="material-symbols-outlined text-[16px] fill1">check_circle</span> Sent to your Concierge</p>
    <button onclick="sendToChat('${kind}')" class="bg-primary text-white py-2 px-space-4 rounded-full font-caption active:scale-95 transition inline-flex items-center gap-1">View in chat <span class="material-symbols-outlined text-[16px]">arrow_forward</span></button></div>`;
}
function sendToChat(kind){
  switchView("chat");
  setTimeout(() => {
    if(kind === "meal") appendChat(aiBubble(`I've folded your <b>ribeye &amp; avocado</b> into today — 4g net carbs keeps you comfortably ketogenic. Was this lunch or dinner, and how's your fullness an hour out?`));
    else appendChat(aiBubble(`I've read your lab report and structured it into <b>observations, actions, and pending labs</b>. The one thing I'd gently flag is the mild inflammation marker. Before we plan around it — have you been sleeping well, and any unusual stress this month?`));
  }, 320);
}

/* ===================== HABITS / DRESS ===================== */
const dress = [
  { id:"diet", phase:"Breakfast", sub:"Awakening the metabolism", marker:"eco", markerBg:"bg-accent-teal",
    title:"Hydration Foundation", body:"500ml room-temperature water with a pinch of sea salt.", done:true },
  { id:"keto", phase:null, title:"The Keto Starter", body:"High-fat, moderate protein fuel to sustain mental clarity.", done:false },
  { id:"rest", phase:"Afternoon", sub:"Maintaining steady energy", marker:"light_mode", markerBg:"bg-accent-lavender",
    title:"Solar Exposure", body:"10 minutes of direct daylight to anchor your circadian rhythm.", done:false },
  { id:"exercise", phase:null, title:"Brain-focused training", body:"2× / week. A short, mindful strength set — movement as cognition.", done:false },
  { id:"supp", phase:null, title:"Dynamic dosing", body:"3 capsules therapeutic + 1 capsule Vitamin D. Adjusts with labs & season.", done:false },
  { id:"stress", phase:"Evening Wind-Down", sub:"Restoration and repair", marker:"dark_mode", markerBg:"bg-primary",
    title:"5-min breathing reset", body:"A nervous-system pause — and a call to someone across generations.", done:false, breathe:true },
];

function renderJourney(){
  if(!$("journey")) return;   // DRESS journey retired from the Plan tab
  let html = `<div class="journey-path"></div>`;
  dress.forEach(d => {
    if(d.phase){
      const iconColor = d.markerBg === "bg-primary" ? "text-background-base" : "text-primary";
      html += `<div class="flex items-center gap-space-4 mb-space-4 mt-space-6 relative z-10">
        <div class="marker w-12 h-12 rounded-full ${d.markerBg} grid place-items-center"><span class="material-symbols-outlined ${iconColor}">${d.marker}</span></div>
        <div><h3 class="font-headline-md text-headline-md text-primary">${d.phase}</h3><p class="font-caption text-text-muted">${d.sub}</p></div></div>`;
    }
    html += `<div id="habit-${d.id}" class="habit ${d.done?'done':''} ml-space-8 mb-space-4 relative z-10">
      <div class="bg-soft-mint p-space-6 rounded-[24px] active:scale-[.99] transition cursor-pointer" onclick="toggleHabit('${d.id}', event)">
        <div class="flex justify-between items-start mb-space-3">
          <span class="status-icon material-symbols-outlined ${d.done?'text-star-glow fill1':'text-outline'}">${d.done?'star':'circle'}</span>
          <span class="font-caption text-text-muted status-label">${d.done?'COMPLETE':'PENDING'}</span></div>
        <h4 class="font-headline-md text-headline-md text-primary mb-micro">${d.title}</h4>
        <p class="font-body-sm text-text-muted">${d.body}</p>
        ${d.breathe?`<button onclick="event.stopPropagation(); startBreathing()" class="mt-space-4 bg-primary text-white py-3 px-space-6 rounded-full font-caption active:scale-95 transition inline-flex items-center gap-2"><span class="material-symbols-outlined text-[16px]">air</span> Begin reset</button>`:''}
      </div></div>`;
  });
  $("journey").innerHTML = html;
}

function toggleHabit(id, e){
  const el = $("habit-"+id); const d = dress.find(x=>x.id===id);
  const wasDone = el.classList.contains("done");
  el.classList.toggle("done");
  const icon = el.querySelector(".status-icon"); const label = el.querySelector(".status-label");
  if(!wasDone){
    icon.textContent = "star"; icon.classList.add("text-star-glow","fill1"); icon.classList.remove("text-outline");
    label.textContent = "COMPLETE"; d.done = true; addWin("habit", true); toast(d.title + " · win logged");
  } else {
    icon.textContent = "circle"; icon.classList.remove("text-star-glow","fill1"); icon.classList.add("text-outline");
    label.textContent = "PENDING"; d.done = false; state.habitWins = Math.max(0, state.habitWins-1); $("habitCount").textContent = state.habitWins;
    const g = $("orbGarden"); if(g.lastElementChild) g.lastElementChild.remove();
  }
  saveState();
}

function addWin(type, silent){
  if(type === "craving"){ state.cravingWins++; const el=$("cravingCount"); if(el) el.textContent = state.cravingWins; }
  else { state.habitWins++; const el=$("habitCount"); if(el) el.textContent = state.habitWins; }
  addOrb(); saveState();
  if(!silent) toast((type==="craving"?"Craving":"Habit") + " win logged · with compassion");
}
function addOrb(){ const g = $("orbGarden"); if(!g) return; const o = document.createElement("span"); o.className = "orb"; o.style.animationDelay = "0s, " + (Math.random()*2).toFixed(2) + "s"; g.appendChild(o); }

/* ===================== BREATHING ===================== */
let breathInt, breathEnd;
function startBreathing(){
  const b = $("breathing"); b.classList.add("show");
  const ring = $("breathRing"); ring.style.transition = "none"; ring.style.strokeDashoffset = "691";
  requestAnimationFrame(() => requestAnimationFrame(() => { ring.style.transition = "stroke-dashoffset 300s linear"; ring.style.strokeDashoffset = "0"; }));
  let inhale = true; $("breathPhase").textContent = "Breathe in";
  breathInt = setInterval(() => { inhale = !inhale; $("breathPhase").textContent = inhale ? "Breathe in" : "Breathe out"; }, 4500);
  breathEnd = setTimeout(() => endBreathing(true), 300000);
}
function endBreathing(auto){
  $("breathing").classList.remove("show"); clearInterval(breathInt); clearTimeout(breathEnd);
  if(auto) setTimeout(() => toast("Five quiet minutes complete · welcome back"), 600);
}

/* ===================== MORE / SETTINGS ===================== */
const settings = [
  { id:"account", icon:"account_circle", label:"User Account", sub:"raul@rfalcon.com" },
  { id:"profile", icon:"badge", label:"Profile", sub:"Name, age, focus" },
  { id:"targets", icon:"target", label:"Targets", sub:"Macros, ketones, daylight" },
  { id:"rhythm", icon:"notifications_active", label:"Daily rhythm", sub:"Morning & evening check-ins" },
  { id:"connect", icon:"cable", label:"Connect Apps & Devices", sub:"WHOOP · Oura · Cronometer" },
  { id:"sharing", icon:"share", label:"Sharing", sub:"Share with your care team" },
  { id:"referrals", icon:"redeem", label:"Referrals", sub:"Invite a friend" },
  { id:"support", icon:"support_agent", label:"Support", sub:"We reply within a day" },
  { id:"about", icon:"info", label:"About", sub:"Our philosophy" },
];
function renderSettings(){
  $("settingsList").innerHTML = settings.map((s,i) => `
    <button onclick="openSetting('${s.id}')" class="w-full flex items-center gap-space-4 px-space-4 py-space-4 text-left ${i?'border-t border-outline-variant':''} active:bg-soft-mint transition">
      <span class="w-9 h-9 rounded-full bg-soft-mint grid place-items-center text-primary"><span class="material-symbols-outlined text-[20px]">${s.icon}</span></span>
      <span class="flex-1 min-w-0"><span class="block font-body-base text-primary">${s.label}</span><span class="block font-caption text-text-muted truncate">${s.sub}</span></span>
      <span class="material-symbols-outlined text-text-muted">chevron_right</span></button>`).join("");
}
async function openSetting(id){ const s = settings.find(x=>x.id===id); $("settingTitle").textContent = s.label; if(id==="profile" && !state.profile) await loadProfile(); $("settingBody").innerHTML = settingBody(id); $("settingPanel").classList.add("open"); }
function closeSetting(){ $("settingPanel").classList.remove("open"); }

function field(label, value, type="text", id=""){
  return `<label class="block mb-space-4"><span class="block font-caption text-text-muted uppercase tracking-widest mb-space-2">${label}</span>
    <input ${id?`id="${id}"`:""} type="${type}" value="${value}" class="w-full rounded-full bg-surface-container-lowest border border-outline-variant py-space-3 px-space-6 font-body-base text-primary focus:ring-2 focus:ring-accent-teal outline-none"/></label>`;
}
function slider(label,id,val,unit,min,max,step=1){
  return `<label class="block mb-space-6"><span class="flex items-center justify-between font-caption text-text-muted uppercase tracking-widest mb-space-2">${label}<span id="${id}v" class="text-primary normal-case tracking-normal font-body-sm">${val}${unit}</span></span>
    <input type="range" min="${min}" max="${max}" step="${step}" value="${val}" oninput="document.getElementById('${id}v').textContent=this.value+'${unit}'" class="w-full" style="accent-color:#F5A97E"/></label>`;
}
function deviceRow(id,name,sub,icon){
  const on = state.connections[id];
  return `<div class="flex items-center gap-space-4 bg-surface-container-lowest rounded-[24px] p-space-4 mb-space-3">
    <span class="w-10 h-10 rounded-full bg-soft-mint grid place-items-center text-primary"><span class="material-symbols-outlined">${icon}</span></span>
    <div class="flex-1 min-w-0"><p class="font-body-base text-primary">${name}</p><p id="dev-sub-${id}" class="font-caption ${on?'text-accent-teal':'text-text-muted'}">${on?'Connected · syncing':sub}</p></div>
    <button id="dev-btn-${id}" onclick="connectDevice('${id}')" class="font-caption px-space-4 py-2 rounded-full active:scale-95 transition ${on?'bg-soft-mint text-primary':'bg-primary text-white'}">${on?'Disconnect':'Connect'}</button></div>`;
}
function connectDevice(id){
  const on = !state.connections[id]; state.connections[id] = on;
  const names = {whoop:"WHOOP",oura:"Oura Ring",cronometer:"Cronometer"};
  const sums = {whoop:"Recovery 72% · Sleep 7h 42m",oura:"Readiness 81 · Sleep 88",cronometer:"1,840 kcal · 18g net carbs"};
  const btn = $("dev-btn-"+id), sub = $("dev-sub-"+id);
  if(on){ sub.textContent = "Connecting…"; sub.className = "font-caption text-text-muted";
    setTimeout(() => { sub.textContent = sums[id]; sub.className = "font-caption text-accent-teal"; btn.textContent = "Disconnect"; btn.className = "font-caption px-space-4 py-2 rounded-full active:scale-95 transition bg-soft-mint text-primary"; toast(names[id]+" connected · syncing"); }, 850);
  } else { sub.textContent = "Disconnected"; sub.className = "font-caption text-text-muted"; btn.textContent = "Connect"; btn.className = "font-caption px-space-4 py-2 rounded-full active:scale-95 transition bg-primary text-white"; toast(names[id]+" disconnected"); }
  saveState();
}
function copyText(str,msg){ if(navigator.clipboard?.writeText){ navigator.clipboard.writeText(str).then(()=>toast(msg)).catch(()=>toast(msg)); } else toast(msg); }

function settingBody(id){
  switch(id){
    case "account": return `<div class="space-y-space-4 reveal">
      <div class="bg-surface-container-lowest rounded-[24px] p-space-6"><div class="flex items-center gap-space-3"><div class="w-12 h-12 rounded-full bg-primary text-white grid place-items-center font-display-lg">R</div><div><p class="font-headline-md text-primary">Raul Falcon</p><p class="font-caption text-text-muted">raul@rfalcon.com</p></div></div>
      <div class="mt-space-4 flex justify-between font-body-sm"><span class="text-text-muted">Plan</span><span class="text-primary">Founders · active</span></div></div>
      <button onclick="toast('Verification link sent to raul@rfalcon.com')" class="w-full py-space-4 rounded-full bg-soft-mint text-primary font-body-base">Manage email</button>
      <button onclick="signOut()" class="w-full py-space-4 rounded-full bg-primary text-white font-body-base">Sign out</button></div>`;
    case "profile": { const pf = state.profile || PROFILE_DEFAULTS; return `<form onsubmit="event.preventDefault(); saveProfile(this)" class="reveal">
      ${field("Preferred name", escAttr(pf.preferred_name), "text", "pf-name")}${field("Age", escAttr(pf.age), "number", "pf-age")}${field("Primary focus", escAttr(pf.primary_focus), "text", "pf-focus")}
      <button type="submit" class="w-full py-space-4 rounded-full bg-primary text-white font-body-base mt-space-2">Save profile</button></form>`; }
    case "targets": return `<form onsubmit="event.preventDefault(); toast('Targets updated · Concierge will adapt')" class="reveal">
      ${slider("Net carbs ceiling","carbT",20,"g",5,50)}${slider("Protein target","protT",140,"g",60,220)}${slider("Ketone goal","ketT",1.5,"mmol",0.5,4,0.1)}${slider("Daily daylight","sunT",20,"min",5,60)}
      <button class="w-full py-space-4 rounded-full bg-primary text-white font-body-base">Save targets</button></form>`;
    case "connect": return `<div class="reveal"><p class="font-body-sm text-text-muted mb-space-4">Connect a device and its data flows into your Rest, recovery, and Energy Stability.</p>
      ${deviceRow("whoop","WHOOP","Recovery, strain & sleep","ecg_heart")}${deviceRow("oura","Oura Ring","Sleep stages & readiness","circle")}${deviceRow("cronometer","Cronometer","Micronutrients & macros","nutrition")}</div>`;
    case "sharing": return `<div class="space-y-space-4 reveal"><p class="font-body-sm text-text-muted">Share a private, read-only window into your progress with a doctor, coach, or loved one.</p>
      <div class="bg-surface-container-lowest rounded-[24px] p-space-4"><p class="font-caption text-text-muted uppercase tracking-widest mb-space-2">Private link</p>
        <div class="flex items-center gap-space-2"><input readonly value="ketofy.me/r/raul-7fc2" class="flex-1 bg-soft-mint rounded-full px-space-4 py-3 font-body-sm text-primary outline-none"/><button onclick="copyText('https://ketofy.me/r/raul-7fc2','Share link copied')" class="px-space-4 py-3 rounded-full bg-primary text-white font-caption">Copy</button></div></div>
      <button onclick="toast('Invited your care team')" class="w-full py-space-4 rounded-full bg-soft-mint text-primary font-body-base">Invite care team</button></div>`;
    case "referrals": return `<div class="space-y-space-4 reveal text-center"><div class="w-16 h-16 mx-auto rounded-full bg-accent-lavender grid place-items-center text-primary"><span class="material-symbols-outlined text-[28px]">redeem</span></div>
      <p class="font-body-sm text-text-muted px-space-4">Give a friend a month of calm, get one yourself. <b class="text-primary">2</b> friends have joined.</p>
      <div class="bg-surface-container-lowest rounded-[24px] p-space-4"><p class="font-caption text-text-muted uppercase tracking-widest mb-space-2">Your code</p><p class="font-display-lg text-display-lg text-primary tracking-widest">RAUL26</p></div>
      <button onclick="copyText('RAUL26','Referral code copied')" class="w-full py-space-4 rounded-full bg-primary text-white font-body-base">Copy code</button></div>`;
    case "support": return `<form onsubmit="event.preventDefault(); this.reset(); toast('Message sent · we will reply to raul@rfalcon.com')" class="space-y-space-4 reveal">
      <p class="font-body-sm text-text-muted">A real human reads every note. How can we support you?</p>
      <textarea required rows="4" placeholder="Write to us…" class="w-full rounded-[24px] bg-surface-container-lowest border border-outline-variant p-space-4 font-body-base text-primary outline-none focus:ring-2 focus:ring-accent-teal"></textarea>
      <button class="w-full py-space-4 rounded-full bg-primary text-white font-body-base">Send message</button></form>`;
    case "rhythm": return `<div class="space-y-space-4 reveal">
      <p class="font-body-sm text-text-muted">Two gentle nudges a day — a <b>morning plan</b> and an <b>evening reflection</b>. Never more. Each opens a fresh check-in with your Concierge.</p>
      <div class="bg-soft-mint rounded-[24px] p-space-4 space-y-space-2 font-body-sm text-primary"><div class="flex items-center gap-2"><span class="material-symbols-outlined text-accent-orange">wb_sunny</span> Morning · 8:00 — your plan for a steady day</div><div class="flex items-center gap-2"><span class="material-symbols-outlined text-accent-lavender">bedtime</span> Evening · 20:00 — how did your energy land?</div></div>
      <button onclick="enableDailyRhythm(true)" class="w-full py-space-4 rounded-full bg-primary text-white font-body-base">Turn on daily rhythm</button>
      <button onclick="enableDailyRhythm(false)" class="w-full py-space-4 rounded-full bg-soft-mint text-primary font-body-base">Turn off</button>
      <p class="font-caption text-text-muted text-center">Pull down on the chat anytime for an instant check-in.</p></div>`;
    case "about": return `<div class="space-y-space-4 reveal"><h3 class="font-display-lg text-display-lg text-primary">A calmer way to know your body.</h3>
      <p class="font-body-base text-text-muted leading-relaxed">Qetos is an AI-first metabolic and mental-health companion. Behavior change comes from curiosity and compassion — not pressure, streaks, or shame. Our Concierge asks before it advises, and treats every win, even a paused craving, as real progress.</p>
      <div class="bg-soft-mint rounded-[24px] p-space-4 font-body-sm text-primary"><b>DRESS</b> — Diet, Rest, Exercise, Stress, Supplements. The five quiet levers of a resilient metabolism.</div>
      <p class="font-caption text-text-muted">Concierge mode: <b id="aiModeLabel" class="text-primary">${Concierge.mode()}</b></p></div>`;
  }
}
async function signOut(){ closeSetting(); try{ await DB.signOut(); }catch(e){} Store.set("qetos-auth",""); toast("Signed out"); setTimeout(()=>location.reload(), 600); }

/* ===================== FOOD ===================== */
const GOAL_FOODS = ["Wild salmon","Avocado","Olive oil","Sardines","Almonds","Walnuts","Spinach","Chia seeds"];
const RECIPE_IDEAS = ["Baked salmon and avocado salad","Mediterranean keto bowl","Olive-oil braised greens","Sardine and egg plate"];
state.meal = []; state.shopping = [];

/* ---------- manual text meal -> estimated macros (editable) ---------- */
async function estimateMeal(){
  const ta = $("mealText"); const text = (ta && ta.value || "").trim();
  if(!text){ toast("Describe what you ate first"); ta && ta.focus(); return; }
  const out = $("mealEstimateOut"); out.classList.remove("hidden");
  out.innerHTML = `<div class="bg-surface-container-lowest rounded-[24px] p-space-8 text-center reveal"><div class="w-10 h-10 mx-auto rounded-full border-2 border-soft-mint border-t-accent-orange animate-spin"></div><p class="font-body-sm text-text-muted mt-space-3">Estimating macros…</p></div>`;
  try {
    const { result } = await Estimate.estimate(text, ctx());
    if(!result) throw new Error("no result");
    result.name = result.name || text;
    state.lastEstimate = result;
    renderMealEstimateView();
    out.scrollIntoView({ behavior:"smooth", block:"center" });
  } catch(e){
    console.warn("estimate failed, manual entry:", e);
    // Graceful fallback: open the editable form with blank macros so the user
    // can still log manually (the whole point for manual-tracking users).
    state.lastEstimate = { name:text, kcal:0, net_carbs_g:0, protein_g:0, ingredients:[], note:"Couldn't auto-estimate — enter your macros below." };
    $("mealEstimateOut").innerHTML = renderMealEstimate(state.lastEstimate, true);
  }
}

function macroInput(label,id,val){
  return `<label class="block"><span class="block font-caption text-text-muted uppercase tracking-widest mb-1 text-center">${label}</span>
    <input id="${id}" type="number" inputmode="decimal" step="any" min="0" value="${val}" class="w-full text-center rounded-[16px] bg-soft-mint border border-outline-variant py-space-3 font-display-lg text-primary focus:ring-2 focus:ring-accent-teal outline-none"/></label>`;
}

function renderMealEstimate(r, editing){
  const items = mealItemsList(r.ingredients);
  const macros = editing
    ? `<div class="grid grid-cols-3 gap-space-2 mb-space-4">
        ${macroInput("kcal","mealKcal",Math.round(r.kcal||0))}${macroInput("net carbs g","mealCarb",r.net_carbs_g??0)}${macroInput("protein g","mealProt",r.protein_g??0)}
       </div>
       <div class="flex gap-space-2 mb-space-4">
        <button onclick="applyMealMacros()" class="flex-1 py-space-3 rounded-full bg-primary text-white font-body-sm active:scale-95 transition">Done</button>
        <button onclick="renderMealEstimateView()" class="py-space-3 px-space-5 rounded-full bg-soft-mint text-primary font-body-sm active:scale-95 transition">Cancel</button>
       </div>`
    : `<div class="grid grid-cols-3 gap-space-2 text-center mb-space-3">${stat(Math.round(r.kcal||0),"kcal")}${stat((r.net_carbs_g??0)+"g","net carbs")}${stat((r.protein_g??0)+"g","protein")}</div>
       <button onclick="editMealMacros()" class="w-full py-space-3 rounded-full bg-soft-mint text-primary font-body-sm active:scale-95 transition inline-flex items-center justify-center gap-2 mb-space-4"><span class="text-[16px]" aria-hidden="true">✏️</span> Edit macros</button>`;
  return `<div class="bg-surface-container-lowest rounded-[24px] p-space-6 reveal">
    <div class="flex items-center gap-2 font-caption text-text-muted uppercase tracking-widest mb-space-4"><span class="material-symbols-outlined text-[16px]">eco</span> Meal · estimated${r.edited?' · edited':''}</div>
    <h4 class="font-display-lg text-display-lg text-primary mb-space-4">${esc(r.name||"Your meal")}</h4>
    ${macros}
    ${items?`<p class="font-caption text-text-muted uppercase tracking-widest mb-space-2">Ingredients</p>${items}`:""}
    ${r.note?`<p class="font-caption text-text-muted italic mb-space-4">${esc(r.note)}</p>`:""}
    <button onclick="logEstimatedMeal()" class="w-full py-space-4 rounded-full bg-primary text-white font-body-base active:scale-95 transition">Log this meal</button>
  </div>`;
}
function renderMealEstimateView(){ if(state.lastEstimate) $("mealEstimateOut").innerHTML = renderMealEstimate(state.lastEstimate, false); }
function editMealMacros(){ if(state.lastEstimate) $("mealEstimateOut").innerHTML = renderMealEstimate(state.lastEstimate, true); }
function applyMealMacros(){
  const r = state.lastEstimate; if(!r) return;
  const k = parseFloat($("mealKcal").value), c = parseFloat($("mealCarb").value), p = parseFloat($("mealProt").value);
  if(Number.isFinite(k) && k>=0) r.kcal = k;
  if(Number.isFinite(c) && c>=0) r.net_carbs_g = c;
  if(Number.isFinite(p) && p>=0) r.protein_g = p;
  r.edited = true;
  renderMealEstimateView(); toast("Macros updated");
}
async function logEstimatedMeal(){
  const r = state.lastEstimate; if(!r) return;
  if(DB.ready() && DB.currentUser()){
    try { await DB.addMeal({ name:r.name, kcal:r.kcal, net_carbs_g:r.net_carbs_g, protein_g:r.protein_g, fat_g:r.fat_g, fiber_g:r.fiber_g, cholesterol_impact:r.cholesterol_impact, source:"text", raw_json:r }); }
    catch(e){ console.warn("log meal:", e); }
  }
  haptic(); toast("Meal logged");
  const ta=$("mealText"); if(ta) ta.value="";
  const out=$("mealEstimateOut"); if(out){ out.classList.add("hidden"); out.innerHTML=""; }
  state.lastEstimate=null;
}

function renderFood(){
  $("foodBody").innerHTML = `
    <section class="mb-space-6">
      <p class="font-caption text-text-muted uppercase tracking-widest mb-space-2">Nutrition</p>
      <h2 class="font-display-lg text-display-lg text-primary mb-space-2">Recipes</h2>
      <p class="font-body-sm text-text-muted">Tuned to your goals — gentler on LDL, steady ketosis.</p>
    </section>
    <section class="mb-space-6">
      <p class="font-caption text-text-muted uppercase tracking-widest mb-space-2">Log what you ate</p>
      <p class="font-body-sm text-text-muted mb-space-3">No photo? Type the foods and rough amounts — we'll estimate the macros, and you can fine-tune them.</p>
      <textarea id="mealText" rows="3" onkeydown="if(event.key==='Enter'&&(event.metaKey||event.ctrlKey)){event.preventDefault();estimateMeal();}" placeholder="e.g. 2 chicken thighs, 1 zucchini, 1/2 avocado" class="w-full rounded-[20px] bg-white border border-outline-variant p-space-4 font-body-sm text-primary outline-none focus:ring-2 focus:ring-accent-teal editorial-shadow placeholder:text-text-muted"></textarea>
      <button onclick="estimateMeal()" class="w-full mt-space-3 py-space-4 rounded-full bg-primary text-white font-body-base active:scale-95 transition inline-flex items-center justify-center gap-2"><span class="material-symbols-outlined text-[20px]">auto_awesome</span> Estimate macros</button>
      <div id="mealEstimateOut" class="hidden mt-space-4"></div>
    </section>
    <section class="mb-space-6">
      <p class="font-caption text-text-muted uppercase tracking-widest mb-space-3">For your goals</p>
      <div class="flex flex-wrap gap-2">${GOAL_FOODS.map(f=>`<button onclick="quickFood('${f}')" class="font-caption px-space-4 py-2 rounded-full bg-soft-mint text-primary active:scale-95 transition">${f}</button>`).join("")}</div>
    </section>
    <section class="mb-space-6">
      <div class="relative"><input id="foodSearch" onkeydown="if(event.key==='Enter')doFoodSearch()" placeholder="Search any food…" class="w-full h-14 bg-white rounded-full pl-space-6 pr-14 editorial-shadow border-none focus:ring-2 focus:ring-accent-teal font-body-sm placeholder:text-text-muted"/>
        <button onclick="doFoodSearch()" class="absolute right-2 top-2 w-10 h-10 bg-accent-teal rounded-full grid place-items-center text-primary active:scale-90 transition"><span class="material-symbols-outlined">search</span></button></div>
      <div id="foodResults" class="mt-space-4 space-y-space-3"></div>
    </section>
    <section id="mealBuilder" class="mb-space-6"></section>
    <section class="mb-space-6">
      <p class="font-caption text-text-muted uppercase tracking-widest mb-space-3">Recipes for you</p>
      <div class="flex flex-wrap gap-2 mb-space-3">${RECIPE_IDEAS.map(d=>`<button onclick="makeRecipe('${d}')" class="font-caption px-space-4 py-2 rounded-full bg-accent-lavender/50 text-primary active:scale-95 transition">${d}</button>`).join("")}</div>
      <div class="relative"><input id="recipeInput" onkeydown="if(event.key==='Enter')makeRecipe()" placeholder="Or type a dish…" class="w-full h-12 bg-white rounded-full pl-space-6 pr-14 editorial-shadow border-none focus:ring-2 focus:ring-accent-lavender font-body-sm placeholder:text-text-muted"/>
        <button onclick="makeRecipe()" class="absolute right-2 top-1 w-10 h-10 bg-accent-lavender rounded-full grid place-items-center text-primary active:scale-90 transition"><span class="material-symbols-outlined text-[20px]">auto_awesome</span></button></div>
      <div id="recipeOut" class="mt-space-4"></div>
    </section>
    <section class="mb-space-6">
      <div class="flex items-center justify-between mb-space-3"><p class="font-caption text-text-muted uppercase tracking-widest">Shopping list</p>
        <button onclick="findStores()" class="font-caption text-primary inline-flex items-center gap-1 active:scale-95 transition"><span class="material-symbols-outlined text-[18px]">location_on</span> Find stores</button></div>
      <div id="shoppingList" class="space-y-space-2"></div>
    </section>`;
  renderMealBuilder(); renderShopping();
}

function quickFood(f){ $("foodSearch").value = f; doFoodSearch(); }

async function doFoodSearch(){
  const q = ($("foodSearch").value || "").trim(); if(!q) return;
  const out = $("foodResults");
  out.innerHTML = `<div class="text-center py-space-4"><div class="w-8 h-8 mx-auto rounded-full border-2 border-soft-mint border-t-accent-teal animate-spin"></div></div>`;
  try {
    const { items } = await Foods.search(q);
    window._foodItems = items || [];
    out.innerHTML = (items && items.length) ? items.map((it,i)=>foodRow(it,i)).join("")
      : `<p class="font-body-sm text-text-muted">No matches — try a simpler term (e.g. "salmon").</p>`;
  } catch(e){ out.innerHTML = `<p class="font-body-sm text-text-muted">Search is unavailable right now.</p>`; }
}
function foodRow(it,i){
  return `<div class="bg-surface-container-lowest rounded-[20px] p-space-4 flex items-center gap-space-3">
    <div class="flex-1 min-w-0"><p class="font-body-base text-primary truncate">${esc(it.name)}</p>
      <p class="font-caption text-text-muted truncate">${it.kcal} kcal · ${it.net_carbs}g net carb · ${it.protein}g protein</p>
      <div class="mt-1">${impactBadge(it.cholesterol_impact)}</div></div>
    <button onclick="addToMeal(${i})" class="w-9 h-9 rounded-full bg-primary text-white grid place-items-center active:scale-90 transition shrink-0"><span class="material-symbols-outlined text-[20px]">add</span></button>
  </div>`;
}
function addToMeal(i){ const it=(window._foodItems||[])[i]; if(!it) return; state.meal.push({ ...it, qty:1 }); renderMealBuilder(); toast(it.name+" added"); }
function setQty(idx, d){ const m=state.meal[idx]; if(!m) return; m.qty=Math.max(0.5,+(m.qty+d).toFixed(1)); renderMealBuilder(); }
function removeMeal(idx){ state.meal.splice(idx,1); renderMealBuilder(); }

function mealTotals(){ return state.meal.reduce((a,m)=>({ kcal:a.kcal+m.kcal*m.qty, nc:a.nc+m.net_carbs*m.qty, p:a.p+m.protein*m.qty, f:a.f+m.fat*m.qty }),{kcal:0,nc:0,p:0,f:0}); }
function renderMealBuilder(){
  const el=$("mealBuilder"); if(!el) return;
  if(!state.meal.length){ el.innerHTML=""; return; }
  const t=mealTotals();
  const lowers=state.meal.filter(m=>m.cholesterol_impact==="lowers_ldl").length;
  const raises=state.meal.filter(m=>m.cholesterol_impact==="raises_ldl").length;
  const note = raises>lowers ? "Higher in saturated fat — balance with fiber & omega-3." : lowers>0 ? "Leaning LDL-friendly. Nice." : "Balanced.";
  el.innerHTML = `<div class="bg-soft-mint rounded-[24px] p-space-6">
    <p class="font-caption text-text-muted uppercase tracking-widest mb-space-3">Meal builder</p>
    <div class="space-y-space-2 mb-space-4">${state.meal.map((m,idx)=>`
      <div class="flex items-center gap-2">
        <div class="flex-1 min-w-0"><p class="font-body-sm text-primary truncate">${esc(m.name)}</p><p class="font-caption text-text-muted">${Math.round(m.kcal*m.qty)} kcal · ${(m.net_carbs*m.qty).toFixed(1)}g nc</p></div>
        <button onclick="setQty(${idx},-0.5)" class="w-7 h-7 rounded-full bg-white grid place-items-center text-primary"><span class="material-symbols-outlined text-[16px]">remove</span></button>
        <span class="font-caption text-primary w-12 text-center">${m.qty}×100g</span>
        <button onclick="setQty(${idx},0.5)" class="w-7 h-7 rounded-full bg-white grid place-items-center text-primary"><span class="material-symbols-outlined text-[16px]">add</span></button>
        <button onclick="removeMeal(${idx})" class="w-7 h-7 grid place-items-center text-text-muted"><span class="material-symbols-outlined text-[18px]">close</span></button>
      </div>`).join("")}</div>
    <div class="grid grid-cols-3 gap-space-2 text-center mb-space-3">${stat(Math.round(t.kcal),"kcal")}${stat(t.nc.toFixed(1)+"g","net carbs")}${stat(Math.round(t.p)+"g","protein")}</div>
    <p class="font-caption text-text-muted mb-space-4">${note}</p>
    <button onclick="addMealToPlan()" class="w-full py-space-3 rounded-full bg-primary text-white font-body-base active:scale-95 transition">Add to today's plan</button>
  </div>`;
}
async function addMealToPlan(){
  if(!state.meal.length) return;
  const t=mealTotals();
  const name = state.meal.map(m=>m.name).slice(0,3).join(", ") + (state.meal.length>3?"…":"");
  if(DB.ready() && DB.currentUser()){ try{ await DB.addMeal({ name, kcal:Math.round(t.kcal), net_carbs_g:+t.nc.toFixed(1), protein_g:Math.round(t.p), fat_g:Math.round(t.f), source:"calculator", in_day_plan:true }); }catch(e){ console.warn(e); } }
  toast("Added to today's plan · "+Math.round(t.kcal)+" kcal");
  // reflect into Habits → Keto Starter node
  const node=$("habit-keto"); if(node){ const body=node.querySelector("p.font-body-sm"); if(body) body.textContent="Planned today: "+name; }
  state.meal=[]; renderMealBuilder();
}

async function makeRecipe(dish){
  const d = dish || ($("recipeInput") && $("recipeInput").value.trim()) || "a low-carb dinner";
  const out=$("recipeOut");
  out.innerHTML = `<div class="bg-surface-container-lowest rounded-[24px] p-space-8 text-center"><div class="w-8 h-8 mx-auto rounded-full border-2 border-soft-mint border-t-accent-lavender animate-spin"></div><p class="font-body-sm text-text-muted mt-space-3">Cooking up your recipe…</p></div>`;
  try{
    const { recipe } = await Recipes.create(d, ctx());
    if(!recipe){ out.innerHTML=`<p class="font-body-sm text-text-muted">Couldn't generate that one — try another dish.</p>`; return; }
    state.lastRecipe=recipe; out.innerHTML=renderRecipe(recipe);
  }catch(e){ out.innerHTML=`<p class="font-body-sm text-text-muted">Recipe service is unavailable right now.</p>`; }
}
function renderRecipe(r){
  const ing=(r.ingredients||[]).map(x=>`<li>• ${esc(x.qty?x.qty+" ":"")}${esc(x.item)}</li>`).join("");
  const steps=(r.steps||[]).map((s,i)=>`<li class="flex gap-space-3"><span class="shrink-0 w-6 h-6 rounded-full bg-accent-lavender text-primary grid place-items-center font-caption">${i+1}</span><span class="font-body-sm text-primary">${esc(s)}</span></li>`).join("");
  const yt=`https://www.youtube.com/results?search_query=${encodeURIComponent(r.youtube_query||r.title||"keto recipe")}`;
  return `<div class="bg-surface-container-lowest rounded-[24px] p-space-6 reveal">
    <h3 class="font-display-lg text-display-lg text-primary mb-space-2">${esc(r.title)}</h3>
    ${r.summary?`<p class="font-body-sm text-text-muted mb-space-3">${esc(r.summary)}</p>`:""}
    <div class="flex flex-wrap gap-2 mb-space-4 font-caption">
      ${r.time_min?`<span class="px-space-3 py-1 rounded-full bg-soft-mint text-primary">${r.time_min} min</span>`:""}
      ${r.servings?`<span class="px-space-3 py-1 rounded-full bg-soft-mint text-primary">${r.servings} servings</span>`:""}
      ${r.net_carbs_g!=null?`<span class="px-space-3 py-1 rounded-full bg-accent-teal text-primary">${r.net_carbs_g}g net carbs</span>`:""}</div>
    <p class="font-caption text-text-muted uppercase tracking-widest mb-space-2">Ingredients</p>
    <ul class="font-body-sm text-text-muted space-y-1 mb-space-4">${ing}</ul>
    <p class="font-caption text-text-muted uppercase tracking-widest mb-space-2">Steps</p>
    <ul class="space-y-space-3 mb-space-4">${steps}</ul>
    ${r.cholesterol_note?`<div class="bg-soft-mint rounded-[16px] p-space-4 font-body-sm text-primary mb-space-4">${esc(r.cholesterol_note)}</div>`:""}
    <div class="flex gap-space-2">
      <button onclick="addRecipeToShopping()" class="flex-1 py-space-3 rounded-full bg-primary text-white font-caption active:scale-95 transition">Add to shopping list</button>
      <button onclick="window.open('${yt}','_blank')" class="py-space-3 px-space-4 rounded-full bg-soft-mint text-primary font-caption active:scale-95 transition inline-flex items-center gap-1"><span class="material-symbols-outlined text-[18px]">smart_display</span> Watch</button></div>
  </div>`;
}
async function addRecipeToShopping(){
  const r=state.lastRecipe; if(!r||!r.ingredients) return;
  for(const x of r.ingredients){ state.shopping.push({ item:x.item, qty:x.qty||"", checked:false }); if(DB.ready()&&DB.currentUser()){ try{ await DB.addShoppingItem(x.item, x.qty||"", null); }catch(e){} } }
  renderShopping(); toast(r.ingredients.length+" items added to shopping list");
}
function renderShopping(){
  const el=$("shoppingList"); if(!el) return;
  if(!state.shopping.length){ el.innerHTML=`<p class="font-body-sm text-text-muted">Your list is empty — add a recipe's ingredients.</p>`; return; }
  el.innerHTML = state.shopping.map((s,i)=>`
    <button onclick="toggleShop(${i})" class="w-full flex items-center gap-space-3 bg-surface-container-lowest rounded-[16px] p-space-3 text-left">
      <span class="w-6 h-6 rounded-full border ${s.checked?'bg-accent-teal border-transparent text-primary':'border-outline text-transparent'} grid place-items-center"><span class="material-symbols-outlined text-[16px]">check</span></span>
      <span class="flex-1 font-body-sm ${s.checked?'text-text-muted line-through':'text-primary'}">${esc(s.qty?s.qty+" ":"")}${esc(s.item)}</span></button>`).join("");
}
function toggleShop(i){ const s=state.shopping[i]; if(!s) return; s.checked=!s.checked; renderShopping(); }
function findStores(){
  toast("Finding grocery stores near you…");
  const open=(q)=>window.open(q,"_blank");
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(
      pos=>open(`https://www.google.com/maps/search/grocery+store/@${pos.coords.latitude},${pos.coords.longitude},14z`),
      ()=>open(`https://www.google.com/maps/search/grocery+stores+near+me`));
  } else open(`https://www.google.com/maps/search/grocery+stores+near+me`);
}

/* ===================== STATE PERSISTENCE ===================== */
function saveState(){
  Store.set("qetos-state", JSON.stringify({ energy:state.energy, cravingWins:state.cravingWins, habitWins:state.habitWins, connections:state.connections, done: dress.filter(d=>d.done).map(d=>d.id) }));
}
async function loadState(){
  try {
    const raw = await Store.get("qetos-state"); if(!raw) return;
    const s = JSON.parse(raw);
    if(s.energy){ state.energy = s.energy; $("energyBar").style.width = s.energy+"%"; $("energyVal").textContent = s.energy; }
    if(typeof s.cravingWins==="number"){ state.cravingWins = s.cravingWins; const el=$("cravingCount"); if(el) el.textContent = s.cravingWins; }
    if(typeof s.habitWins==="number"){ state.habitWins = s.habitWins; const el=$("habitCount"); if(el) el.textContent = s.habitWins; }
    if(s.connections) state.connections = s.connections;
    if(Array.isArray(s.done)) dress.forEach(d => d.done = s.done.includes(d.id));
  } catch(e){}
}

/* ===================== SEED + INIT ===================== */
/* ===================== DAILY LOOP (Phase 5) ===================== */
function partOfDay(){ const h = new Date().getHours(); return h < 12 ? "morning" : h >= 17 ? "evening" : "day"; }
let _lastCheckIn = 0;
async function proactiveCheckIn(force){
  // throttle so a refresh storm doesn't spam the model
  if(!force && Date.now() - _lastCheckIn < 4000) return;
  _lastCheckIn = Date.now();
  await sayFrom(Concierge.proactive(ctx(), partOfDay()));
}
function seedChat(){ proactiveCheckIn(true); }

// Pull-to-refresh on the chat → a fresh proactive check-in.
function setupPullToRefresh(){
  const v = $("view-chat"); if(!v || v._ptr) return; v._ptr = true;
  const ind = document.createElement("div");
  ind.style.cssText = "height:0;overflow:hidden;transition:height .2s ease;display:flex;align-items:center;justify-content:center";
  ind.innerHTML = '<span class="material-symbols-outlined" style="color:#5A6E85">refresh</span>';
  v.prepend(ind);
  let startY = 0, pulling = false, dist = 0;
  v.addEventListener("touchstart", e => { if(v.scrollTop <= 0){ startY = e.touches[0].clientY; pulling = true; } }, { passive:true });
  v.addEventListener("touchmove", e => { if(!pulling) return; dist = e.touches[0].clientY - startY; if(dist > 0) ind.style.height = Math.min(56, dist) + "px"; }, { passive:true });
  v.addEventListener("touchend", () => { if(pulling && dist > 56){ proactiveCheckIn(true); } ind.style.height = "0"; pulling = false; dist = 0; });
}

// Two gentle daily notifications (native only).
async function enableDailyRhythm(on){
  const LN = onCapacitor() && window.Capacitor.Plugins.LocalNotifications;
  if(!LN){ toast(on ? "Daily check-ins enable on your phone build" : "Off"); return; }
  if(on){
    const perm = await LN.requestPermissions();
    if(perm.display !== "granted"){ toast("Allow notifications to enable"); return; }
    await LN.schedule({ notifications: [
      { id:1, title:"Good morning, Raul", body:"Your plan for a steady day is ready.", schedule:{ on:{ hour:8, minute:0 }, repeats:true } },
      { id:2, title:"Evening reflection", body:"How did your energy land today?", schedule:{ on:{ hour:20, minute:0 }, repeats:true } },
    ] });
    toast("Daily rhythm on · morning & evening");
  } else { await LN.cancel({ notifications:[{id:1},{id:2}] }); toast("Daily rhythm off"); }
}

async function init(){
  DB.init();
  await checkConsent();
  await loadState();
  await loadProfile();
  await loadPlanPrefs();
  renderJourney(); renderSettings(); renderFood(); renderPlanHeader();
  const total = state.cravingWins + state.habitWins; for(let i=0;i<total;i++) addOrb();
  // real Supabase session (e.g. returning from a magic link) logs in + seeds
  let session = null; try { session = await DB.getSession(); } catch(e){}
  DB.onAuth(async (s) => { if (s) { revealApp(); await syncUser(); } });
  const authed = await Store.get("qetos-auth");
  if (session || authed === "1") {
    $("auth").style.display = "none"; $("appHeader").classList.remove("hidden"); $("viewport").classList.remove("hidden"); $("bottomNav").classList.remove("hidden"); switchView("chat");
    if (session) await syncUser();
  }
  seedChat();
  setupPullToRefresh();
  try { if(onCapacitor() && window.Capacitor.Plugins.StatusBar) window.Capacitor.Plugins.StatusBar.setStyle({style:"LIGHT"}); } catch(e){}
  // tapping a daily notification opens the chat with a fresh check-in
  try { if(onCapacitor() && window.Capacitor.Plugins.LocalNotifications) window.Capacitor.Plugins.LocalNotifications.addListener("localNotificationActionPerformed", () => { switchView("chat"); proactiveCheckIn(true); }); } catch(e){}
}
document.addEventListener("DOMContentLoaded", init);
