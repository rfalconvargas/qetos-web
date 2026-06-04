/* =====================================================================
   Qetos — Concierge AI client
   ---------------------------------------------------------------------
   Two modes, chosen automatically:
   • LIVE  : if CONFIG.endpoint is set, POSTs to your backend proxy
             (Supabase Edge Function / Cloudflare Worker) which holds the
             Claude or Gemini key server-side and returns a reply.
   • DEMO  : otherwise falls back to the local "inquisitive" engine below
             so the app is fully explorable with zero setup or keys.

   The golden rule encoded here (and in the server system prompt):
   ALWAYS ask one grounded, baseline-protocol clarifying question
   BEFORE giving advice.
   ===================================================================== */
window.Concierge = (function () {
  const CONFIG = {
    // LIVE — Qetos Concierge edge function (Gemini 2.5 Flash). The key lives
    // server-side in Supabase; the client never sees it.
    endpoint: "https://efkantatoxcpcteqthfh.supabase.co/functions/v1/concierge",
    model: "gemini-2.5-flash",
  };
  let history = [];   // in-session memory, sent with each turn for continuity

  function isLive() { return !!CONFIG.endpoint; }

  // Model router (cost control): trivial chit-chat is answered locally for $0;
  // anything substantive goes to the cloud model.
  function isTrivial(t) {
    return /^(hi|hey|hello|yo|thanks|thank you|ok|okay|cool|got it|nice|👍|🙏)\b[!. ]*$/i.test(t.trim());
  }
  function trivialReply(t) {
    if (/thank/i.test(t)) return "Anytime — I'm right here whenever you want to log or talk something through. 🌿";
    return "Hello, Raul. How is your energy settling right now — and is there anything you'd like to log or explore together?";
  }

  // --- LIVE path -------------------------------------------------------
  async function askLive(text, context) {
    const res = await fetch(CONFIG.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, context, history: history.slice(-16) }),
    });
    if (!res.ok) throw new Error("Concierge proxy error " + res.status);
    const data = await res.json();
    history.push({ role: "user", content: text }, { role: "assistant", content: data.reply });
    if (history.length > 40) history = history.slice(-40);
    return renderReply(data.reply, data.buttons);
  }

  function renderReply(text, buttons) {
    let html = escapeHtml(text)
      .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
      .replace(/\n{2,}/g, "<br><br>")
      .replace(/\n/g, "<br>");
    if (buttons && buttons.length) {
      html += `<div class="flex flex-col gap-space-2 w-full mt-space-3">` +
        buttons.map(b => `<button onclick="followUp('${escapeAttr(b.send || b.label)}')" class="bg-white border border-soft-mint py-3 px-6 rounded-full text-left font-body-sm text-primary active:scale-[0.98] transition">${escapeHtml(b.label)}</button>`).join("") +
        `</div>`;
    }
    return html;
  }

  // --- DEMO path: local inquisitive engine -----------------------------
  function askDemo(text) {
    const t = text.toLowerCase();
    if (/tired|fatigue|foggy|brain fog|exhaust|sluggish|low energy|drained|no energy/.test(t)) {
      return optionReply(
        `I've logged your symptom to track what may be draining your energy. Before we adjust your baseline, did you take your scheduled <b>3 supplement capsules</b> this morning, and have you spent <b>10 minutes</b> out in natural daylight?`,
        ["Yes to both", "Missed supplements", "No daylight yet"]
      );
    }
    if (/anxious|anxiety|stress|overwhelm|panic|worried|tense|on edge/.test(t)) {
      return `Thank you for naming that — I've noted it gently. Before I suggest anything: has your sleep felt restorative the last two nights, and have you eaten within your usual ketogenic window today?` +
        breatheButton("Begin a 5-minute reset");
    }
    if (/craving|sugar|carb|sweet|snack|crave|hungry|chocolate/.test(t)) {
      return `Noticing a craving and pausing is already a win — I'll mark it. Before we ride it out: how many hours since your last meal, and did you hydrate with electrolytes today?` +
        `<div class="mt-space-3"><button onclick="addWin('craving'); followUp('I paused instead of giving in')" class="bg-accent-lavender text-primary py-3 px-6 rounded-full font-body-sm active:scale-95 transition inline-flex items-center gap-2"><span class="material-symbols-outlined text-[18px]">favorite</span> Log this craving win</button></div>`;
    }
    if (/headache|migraine/.test(t)) {
      return `I've logged the headache so we can find its pattern. Before adjusting anything — have you had enough sodium and water today, and how many hours of sleep did your wearable record last night?`;
    }
    if (/sleep|insomnia|woke|slept|restless/.test(t)) {
      return `Logged. Sleep is the quiet foundation of everything else. Before we look at it together — what time did the day's last meal land, and did you get morning daylight to anchor your rhythm?`;
    }
    if (/ate|eat|meal|food|lunch|dinner|breakfast|ribeye|salmon|eggs|avocado/.test(t)) {
      return `Beautifully logged into your day. To read its metabolic impact accurately — was this within your eating window, and roughly how many net carbs do you estimate?`;
    }
    if (/ketone|ketosis|strip|mmol/.test(t)) {
      return `Logged your ketone reading. Before I interpret the trend — was this fasted or post-meal, and how does your energy feel right now compared to this morning?`;
    }
    return `I hear you, and I've noted it. So I can respond in a way that truly fits — is this affecting your <b>energy</b>, your <b>mood</b>, or your <b>body</b> right now? A little context lets me ask the right next question.`;
  }

  function askDemoFollowUp(answer) {
    const a = answer.toLowerCase();
    if (a.includes("missed"))
      return `That's likely a meaningful piece. Let's gently take the <b>3 therapeutic capsules</b> now and pair them with food. I'll check on your energy this evening — no pressure, just noticing together.` +
        `<div class="mt-space-3"><button onclick="switchView('plan')" class="bg-primary text-white py-3 px-6 rounded-full font-body-sm active:scale-95 transition inline-flex items-center gap-2"><span class="material-symbols-outlined text-[18px]">medication</span> Open Supplements</button></div>`;
    if (a.includes("daylight"))
      return `Then a small, kind experiment: <b>10 minutes</b> of morning-style daylight, even by a window. It steadies your circadian rhythm, which steadies energy. Want me to hold a soft reminder for tomorrow?`;
    if (a.includes("paused"))
      return `That pause is real strength — your nervous system learned something it will remember. Win logged. 🌱 Shall we anchor it with two slow breaths?` + breatheButton("Two slow breaths");
    return `Lovely — your baseline looks intact, so the fog is probably transient. Let's give it 30 quiet minutes, keep water close, and reassess. I'll keep watching your Energy Stability with you.`;
  }

  // --- helpers ---------------------------------------------------------
  function optionReply(text, options) {
    return text + `<div class="flex flex-col gap-space-2 w-full mt-space-3">` +
      options.map(o => `<button onclick="followUp('${escapeAttr(o)}')" class="bg-white border border-soft-mint py-3 px-6 rounded-full text-left font-body-sm text-primary active:scale-[0.98] transition">${o}</button>`).join("") +
      `</div>`;
  }
  function breatheButton(label) {
    return `<div class="mt-space-3"><button onclick="startBreathing()" class="bg-primary text-white py-3 px-6 rounded-full font-body-sm active:scale-95 transition inline-flex items-center gap-2"><span class="material-symbols-outlined text-[18px]">air</span> ${label}</button></div>`;
  }
  function escapeHtml(s){return String(s).replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));}
  function escapeAttr(s){return String(s).replace(/'/g,"\\'").replace(/"/g,"&quot;");}

  // --- public API ------------------------------------------------------
  return {
    isLive,
    mode: () => (isLive() ? "live" : "demo"),
    async ask(text, context) {
      if (isTrivial(text)) return trivialReply(text);              // $0 local path
      if (isLive()) { try { return await askLive(text, context); } catch (e) { console.warn("[Concierge] live failed, demo fallback:", e); } }
      return askDemo(text);
    },
    async followUp(answer, context) {
      if (isLive()) { try { return await askLive(answer, context); } catch (e) { console.warn(e); } }
      return askDemoFollowUp(answer);
    },
    // Proactive, time-aware check-in (Phase 5 daily loop). The model speaks first.
    async proactive(context, part) {
      const directive = `Please open our conversation for the ${part}: greet me warmly by name, show genuine curiosity about how I'm doing, and ask me ONE grounded check-in question (about my sleep, energy, today's plan, ketones, or how I'm feeling). Keep it to two short, calm sentences.`;
      if (isLive()) { try { return await askLive(directive, context); } catch (e) { console.warn(e); } }
      if (part === "morning") return "Good morning, Raul. Before the day gathers speed — how did you sleep, and how's your energy as you wake?";
      if (part === "evening") return "Evening, Raul. As today winds down — how did your energy land, and were there any wins today, even small ones?";
      return "Hi Raul — I've been thinking about your day. How are you feeling right now, and is there anything you'd like to log together?";
    },
  };
})();

/* =====================================================================
   Vision client — sends an image/PDF (base64) to the vision function.
   ===================================================================== */
window.Vision = {
  endpoint: "https://efkantatoxcpcteqthfh.supabase.co/functions/v1/vision",
  async analyze(mode, data, mimeType) {
    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, data, mimeType }),
    });
    if (!res.ok) throw new Error("vision " + res.status);
    return res.json();   // { mode, result }
  },
};

/* Nutrition search (Open Food Facts via edge function) */
window.Foods = {
  endpoint: "https://efkantatoxcpcteqthfh.supabase.co/functions/v1/foods",
  async search(query) {
    const res = await fetch(this.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }) });
    if (!res.ok) throw new Error("foods " + res.status);
    return res.json();   // { items: [...] }
  },
};

/* Text meal -> estimated macros (no photo). Returns { result: {...food shape} } */
window.Estimate = {
  endpoint: "https://efkantatoxcpcteqthfh.supabase.co/functions/v1/estimate",
  async estimate(text, context) {
    const res = await fetch(this.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, context }) });
    if (!res.ok) throw new Error("estimate " + res.status);
    return res.json();   // { result }
  },
};

/* AI step-by-step recipes (Gemini via edge function) */
window.Recipes = {
  endpoint: "https://efkantatoxcpcteqthfh.supabase.co/functions/v1/recipe",
  async create(dish, context) {
    const res = await fetch(this.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dish, context }) });
    if (!res.ok) throw new Error("recipe " + res.status);
    return res.json();   // { recipe }
  },
};
