
const STORAGE_KEY = "calm-finance-workbench-v1";

const primaryModules = [
  { id: "core", icon: "sun", title: "今天", short: "日子心里有数", desc: "此刻的钱，和生活的余地。" },
  { id: "purchase", icon: "shopping-bag", title: "这笔钱", short: "买之前，想一想", desc: "喜欢很重要，买得从容也很重要。" },
  { id: "scenario", icon: "umbrella", title: "能撑多久", short: "给变化留些余地", desc: "把担心的变化算清楚，心里多一份底气。" },
  { id: "goals", icon: "flag", title: "想实现", short: "让期待慢慢靠近", desc: "给每一份期待，留一个慢慢实现的位置。" },
  { id: "assistant", icon: "sparkles", title: "问小助手", short: "一起想个好主意", desc: "关于钱的纠结，都可以说说。" }
];

const advancedModules = [
  { id: "subscriptions", code: "A1", title: "订阅压力", desc: "检查会员、软件和固定开销。" },
  { id: "quit", code: "A2", title: "离职安全垫", desc: "估算没有收入时存款能撑几个月。" },
  { id: "freelancer", code: "A3", title: "自由职业", desc: "处理收入波动、回款和税费预留。" },
  { id: "starter", code: "A4", title: "刚开始工作", desc: "规划生活费、租房成本和冷静期。" },
  { id: "shared", code: "A5", title: "情侣与合租", desc: "共同账本、AA 分摊和共同目标。" },
  { id: "debt", code: "A6", title: "负债还款", desc: "比较雪球法和雪崩法。" },
  { id: "fire", code: "A7", title: "FIRE 进度", desc: "看储蓄率和目标本金。" },
  { id: "history", code: "A8", title: "月度复盘", desc: "记录收入和总支出趋势。" }
];

const modules = [...primaryModules, ...advancedModules];

const defaultState = {
  active: "core",
  advancedOpen: false,
  theme: "system",
  profile: {
    income: 12000,
    balance: 56000,
    fixed: 5200,
    debtPay: 1200,
    targetSave: 2500,
    daysLeft: 18,
    currentMonthSpent: 3600
  },
  purchase: {
    name: "新电脑",
    price: 8999,
    usePerMonth: 24,
    lifespan: 36,
    urgency: "medium",
    resale: 1800,
    alternative: 3000
  },
  subscriptions: [
    { name: "房租", amount: 3200, category: "居住", essential: "yes" },
    { name: "手机与宽带", amount: 198, category: "通信", essential: "yes" },
    { name: "视频会员", amount: 45, category: "娱乐", essential: "no" },
    { name: "云存储", amount: 18, category: "工具", essential: "maybe" }
  ],
  freelancer: {
    averageIncome: 18000,
    lowIncome: 6500,
    receivable: 24000,
    receivableDays: 32,
    taxRate: 18,
    businessCost: 1800,
    dryMonths: 2
  },
  starter: {
    allowance: 6500,
    rent: 2600,
    commute: 360,
    food: 1800,
    fun: 900,
    impulsePrice: 1299,
    waitDays: 7
  },
  shared: {
    personA: "我",
    incomeA: 12000,
    personB: "对方",
    incomeB: 9000,
    target: 30000,
    saved: 8200,
    expenses: [
      { name: "房租", amount: 5200, payer: "A" },
      { name: "水电燃气", amount: 420, payer: "B" },
      { name: "日用品", amount: 680, payer: "A" }
    ]
  },
  debts: [
    { name: "信用卡", balance: 8200, rate: 18, minPay: 900, extraPay: 300 },
    { name: "分期", balance: 15000, rate: 8, minPay: 1200, extraPay: 0 },
    { name: "花呗", balance: 2300, rate: 0, minPay: 400, extraPay: 0 }
  ],
  fire: {
    invested: 180000,
    monthlyInvest: 3500,
    annualReturn: 5,
    annualSpend: 120000,
    withdrawalRate: 4
  },
  goals: [
    { name: "应急金", target: 30000, current: 12000, monthly: 2500, priority: "高" },
    { name: "旅行基金", target: 12000, current: 4200, monthly: 800, priority: "中" }
  ],
  scenario: {
    incomeChange: -20,
    extraMonthlyExpense: 0,
    oneTimeExpense: 0,
    duration: 6
  },
  history: [
    { month: "2026-04", income: 11800, expense: 8500, note: "搬家月" },
    { month: "2026-05", income: 12000, expense: 7600, note: "" },
    { month: "2026-06", income: 12500, expense: 7200, note: "" },
    { month: "2026-07", income: 12000, expense: 8100, note: "朋友婚礼" },
    { month: "2026-08", income: 12000, expense: 7600, note: "" }
  ],
  assistant: {
    messages: [
      { role: "assistant", text: "你好，我会结合你填入的数字，帮你把“要不要买”“能撑多久”“先做什么”说清楚。你可以直接问我一个具体问题。" }
    ]
  },
  habits: {
    noDailyLedger: true,
    weeklyCheck: true,
    exportBackup: false,
    coolDown: true
  }
};

let state = loadState();
let speechRecognition = null;
let speechBaseText = "";
let speechTranscript = "";
let voiceListening = false;
let assistantDraft = "";
let voiceError = "";

function icon(name, className = "") {
  return `<i data-lucide="${name}" class="${className}" aria-hidden="true"></i>`;
}

function sticker(name, className = "") {
  return `<img class="sticker ${className}" src="./assets/stickers/${name}.svg" width="64" height="64" alt="" aria-hidden="true">`;
}

function paintIcons() {
  if (window.lucide) window.lucide.createIcons({ attrs: { "stroke-width": 1.7, "aria-hidden": "true" } });
}

function openModule(id) {
  if (speechRecognition) {
    speechRecognition.abort();
    speechRecognition = null;
    voiceListening = false;
  }
  state.active = id;
  render();
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return clone(defaultState);
  try {
    return merge(clone(defaultState), JSON.parse(saved));
  } catch (error) {
    return clone(defaultState);
  }
}

function merge(base, patch) {
  Object.keys(patch || {}).forEach((key) => {
    if (Array.isArray(patch[key])) {
      base[key] = patch[key];
    } else if (patch[key] && typeof patch[key] === "object" && base[key] && typeof base[key] === "object") {
      merge(base[key], patch[key]);
    } else {
      base[key] = patch[key];
    }
  });
  return base;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function money(value) {
  const number = Number.isFinite(value) ? value : 0;
  return "¥" + Math.round(number).toLocaleString("zh-CN");
}

function percent(value) {
  const number = Number.isFinite(value) ? value : 0;
  return Math.round(number * 10) / 10 + "%";
}

function months(value) {
  const number = Number.isFinite(value) ? value : 0;
  return Math.round(number * 10) / 10 + " 个月";
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function num(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function fixedMonthly() {
  return num(state.profile.fixed) + num(state.profile.debtPay);
}

function totalSubscriptions() {
  return state.subscriptions.reduce((sum, item) => sum + num(item.amount), 0);
}

function monthlyFreeCash() {
  return num(state.profile.income) - fixedMonthly() - num(state.profile.targetSave);
}

function dailySafe() {
  return Math.max(0, monthlyFreeCash() / 30);
}

function runway(balance = num(state.profile.balance), monthlyCost = fixedMonthly()) {
  return monthlyCost > 0 ? balance / monthlyCost : 0;
}

function riskScore() {
  const fixedRatio = num(state.profile.income) ? fixedMonthly() / num(state.profile.income) : 1;
  const buffer = runway();
  let score = 100;
  score -= clamp((fixedRatio - 0.35) * 110, 0, 45);
  score -= buffer < 3 ? (3 - buffer) * 12 : 0;
  score -= monthlyFreeCash() < 0 ? 22 : 0;
  return clamp(score, 0, 100);
}

function coachText() {
  const score = riskScore();
  const buffer = runway();
  const free = monthlyFreeCash();
  if (score >= 76) return { title: "状态比较松弛", body: "你现在有一定选择余地。可以把注意力放在目标储蓄、订阅精简和未来三个月的大额安排。", value: score };
  if (score >= 52) return { title: "状态可控，需要看住固定项", body: "不是危险区，但固定支出已经值得关注。优先检查订阅、分期和房租比例，给自己留出一点呼吸空间。", value: score };
  if (buffer < 2) return { title: "先保护缓冲垫", body: "现在最重要的是保住现金流。推迟非必要大额消费，把目标改成先攒到 2-3 个月安全垫。", value: score };
  if (free < 0) return { title: "本月自由现金流偏紧", body: "固定支出和目标储蓄已经超过收入余量。可以临时降低储蓄目标，或者把可取消项目集中处理。", value: score };
  return { title: "需要温和收紧", body: "不用每天记账。每周看一次余额、固定项和可安心花费，就能避免月底突然紧张。", value: score };
}

function render() {
  applyTheme();
  renderNav();
  renderModule();
  renderSummary();
  paintIcons();
  saveState();
}

function applyTheme() {
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = state.theme === "system" ? (prefersDark ? "dark" : "light") : state.theme;
  document.documentElement.dataset.theme = theme;
  const button = document.getElementById("themeBtn");
  const label = theme === "dark" ? "切换浅色主题" : "切换深色主题";
  button.innerHTML = icon(theme === "dark" ? "sun" : "moon");
  button.setAttribute("aria-label", label);
  button.dataset.tooltip = label;
}

function renderNav() {
  const nav = document.getElementById("moduleNav");
  const stickers = { core: "sun", purchase: "shopping", scenario: "umbrella", goals: "goal", assistant: "cat" };
  const advancedIcons = { subscriptions: "repeat-2", quit: "briefcase-business", freelancer: "laptop", starter: "sprout", shared: "users", debt: "credit-card", fire: "trending-up", history: "chart-no-axes-combined" };
  const navButton = (item) => `
    <button type="button" class="tool-card ${item.id === "assistant" ? "ai-tile" : ""} ${state.active === item.id ? "active" : ""}" data-module="${item.id}" aria-pressed="${state.active === item.id}">
      <span class="tile-top"><span class="tile-icon">${stickers[item.id] ? sticker(stickers[item.id]) : icon(advancedIcons[item.id])}</span>${icon("arrow-up-right", "tile-arrow")}</span>
      <span>
        <strong>${item.title}</strong>
        <small>${item.short || item.desc}</small>
      </span>
    </button>
  `;
  nav.innerHTML = `
    ${primaryModules.map(navButton).join("")}
    <button type="button" class="more-toggle" id="moreToggle" aria-expanded="${state.advancedOpen}" aria-controls="advancedNav">
      <span class="tile-top"><span class="tile-icon">${sticker("tools")}</span>${icon(state.advancedOpen ? "chevron-up" : "chevron-down", "tile-arrow")}</span>
      <span>
        <strong>更多工具</strong>
        <small>${state.advancedOpen ? "收起工具" : "生活的其他可能"}</small>
      </span>
    </button>
    <div class="advanced-nav ${state.advancedOpen ? "open" : ""}" id="advancedNav">
      ${advancedModules.map(navButton).join("")}
    </div>
  `;
  nav.querySelectorAll("button").forEach((button) => {
    if (button.id === "moreToggle") return;
    button.addEventListener("click", () => {
      openModule(button.dataset.module);
    });
  });
  document.getElementById("moreToggle").addEventListener("click", () => {
    state.advancedOpen = !state.advancedOpen;
    renderNav();
    paintIcons();
    saveState();
  });
}

function renderSummary() {
  const income = num(state.profile.income);
  const fixedRatio = income > 0 ? fixedMonthly() / income * 100 : 0;
  const saveRatio = income > 0 ? num(state.profile.targetSave) / income * 100 : 0;
  const remaining = Math.max(0, monthlyFreeCash() - num(state.profile.currentMonthSpent));
  const metric = (name, title, value, note) => `<div class="metric"><span class="metric-label">${icon(name)}${title}</span><strong class="metric-value">${value}</strong><span class="metric-caption">${note}</span></div>`;
  document.getElementById("summary").innerHTML = `
    <div class="budget-focus">
      <span class="budget-label">${icon("wallet")}日均安心预算<span class="budget-stamp">安心花</span></span>
      <div class="budget-number"><span class="currency">¥</span>${Math.round(dailySafe()).toLocaleString("zh-CN")}<span class="unit">/ 天</span></div>
      ${sticker("money", "budget-illustration")}
      <p class="budget-footnote">固定开销和储蓄，已经留好了。</p>
      <p class="budget-footnote budget-remainder">本月剩余额度 <strong>${money(remaining)}</strong><span>按月度计划估算</span></p>
    </div>
    <div class="metric-column">
      ${metric("landmark", "当前可用存款", money(num(state.profile.balance)), "每一个选择，都多一份底气")}
      ${metric("shield-check", "现金缓冲", (Math.round(runway() * 10) / 10) + ' <small>个月</small>', "按当前固定成本估算")}
    </div>
    <div class="metric-column">
      ${metric("pie-chart", "固定支出占比", percent(fixedRatio), "包含固定支出与债务还款")}
      ${metric("sprout", "目标储蓄率", percent(saveRatio), "每月为未来留下 " + money(num(state.profile.targetSave)))}
    </div>`;
  const coach = coachText();
  document.getElementById("coach").innerHTML = `
    ${icon("leaf")}<div><h3>${coach.title}</h3><p>${coach.body}</p></div>
    <button class="text-button coach-link" type="button" data-open="scenario">看看未来 ${icon("arrow-right")}</button>`;
  document.querySelectorAll("#coach [data-open]").forEach(button => button.addEventListener("click", () => openModule(button.dataset.open)));
  renderHomeInsights();
  paintIcons();
}

function renderHomeInsights() {
  const allocation = document.getElementById("allocationBody");
  if (!allocation) return;
  const values = [
    ["固定生活", Math.max(0, num(state.profile.fixed)), "#e995af"],
    ["债务还款", Math.max(0, num(state.profile.debtPay)), "#9ebcea"],
    ["目标储蓄", Math.max(0, num(state.profile.targetSave)), "#efcc64"],
    ["自由支配", Math.max(0, monthlyFreeCash()), "#9acdb7"]
  ];
  allocation.innerHTML = `
    <div class="allocation-ring"><canvas id="allocationChart" width="308" height="308" role="img" aria-label="月度资金分配，金额见右侧明细"></canvas><div class="ring-label"><span>月收入</span><strong>${money(num(state.profile.income))}</strong></div></div>
    <div class="allocation-legend">${values.map(([label, amount, color]) => `<div class="legend-row"><span class="legend-label"><i class="legend-key" style="--key:${color}"></i>${label}</span><strong>${money(amount)}</strong></div>`).join("")}</div>`;
  const canvas = document.getElementById("allocationChart");
  const context = canvas.getContext("2d");
  const total = values.reduce((sum, item) => sum + item[1], 0);
  context.lineWidth = 26;
  let angle = -Math.PI / 2;
  if (total === 0) {
    context.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--line").trim();
    context.beginPath();
    context.arc(154, 154, 134, 0, Math.PI * 2);
    context.stroke();
  } else {
    values.forEach(([, amount, color]) => {
      if (!amount) return;
      const length = amount / total * Math.PI * 2;
      const gap = Math.min(.035, length * .2);
      context.beginPath();
      context.strokeStyle = color;
      context.arc(154, 154, 134, angle + gap, angle + length - gap);
      context.stroke();
      angle += length;
    });
  }
  document.getElementById("allocationCaption").textContent = monthlyFreeCash() < 0
    ? "当前计划比收入多 " + money(Math.abs(monthlyFreeCash())) + "，可以给储蓄目标松一点空间。"
    : "先安顿好现在，再为喜欢的生活留一份。";
  const preview = document.getElementById("goalPreviews");
  preview.innerHTML = state.goals.length ? state.goals.slice(0, 2).map((goal) => {
    const target = Math.max(0, num(goal.target));
    const current = Math.max(0, num(goal.current));
    const progress = target > 0 ? clamp(current / target * 100, 0, 100) : 0;
    const isTravel = /旅|度假|出游|海|山/.test(goal.name);
    const visual = isTravel ? '<img src="./assets/sea.jpg" alt="旅行愿望：海边的浪花" width="360" height="180">' : sticker(/应急|安全|储备/.test(goal.name) ? "home" : "goal");
    return `<button class="goal-preview ${isTravel ? "travel-goal" : "saving-goal"}" type="button" data-open="goals" aria-label="查看目标：${escapeHtml(goal.name)}">
      <span class="goal-visual">${visual}</span><span class="goal-preview-body">
      <span class="goal-title">${escapeHtml(goal.name)}${icon("arrow-up-right")}</span>
      <span class="goal-amount">${money(current)} <small>/ ${money(target)}</small></span>
      <span class="meter"><i style="--value:${progress}%"></i></span>
      <span class="goal-detail"><span>已完成 ${Math.round(progress)}%</span><span>每月 ${money(num(goal.monthly))}</span></span>
      </span></button>`;
  }).join("") : '<div class="empty-goals">还没有目标，给下一份期待起个名字吧。</div>';
  preview.querySelectorAll("[data-open]").forEach(button => button.addEventListener("click", () => openModule(button.dataset.open)));
}

function renderModule() {
  const module = modules.find((item) => item.id === state.active) || modules[0];
  state.active = module.id;
  document.body.dataset.view = module.id;
  document.getElementById("moduleHeader").innerHTML = `<span class="module-eyebrow">我的空间 ${icon("chevron-right")} ${module.title}</span><h2>${module.title}</h2><p>${module.desc}</p>`;
  const renderers = {
    core: renderCore,
    purchase: renderPurchase,
    survival: renderSurvival,
    subscriptions: renderSubscriptions,
    quit: renderQuit,
    freelancer: renderFreelancer,
    starter: renderStarter,
    shared: renderShared,
    debt: renderDebt,
    fire: renderFire,
    goals: renderGoals,
    scenario: renderScenario,
    history: renderHistory,
    assistant: renderAssistant
  };
  renderers[module.id]();
  paintIcons();
}

function input(path, label, type = "number", hint = "", options = null) {
  const value = get(path);
  if (options) {
    return `
      <div class="field">
        <label for="${path}">${label}</label>
        <select id="${path}" data-path="${path}">
          ${options.map((option) => `<option value="${option.value}" ${String(value) === String(option.value) ? "selected" : ""}>${option.label}</option>`).join("")}
        </select>
        ${hint ? `<p class="hint">${hint}</p>` : ""}
      </div>
    `;
  }
  return `
    <div class="field">
      <label for="${path}">${label}</label>
      <input id="${path}" data-path="${path}" type="${type}" value="${escapeHtml(value)}" ${type === "number" ? 'inputmode="decimal"' : ""}>
      ${hint ? `<p class="hint">${hint}</p>` : ""}
    </div>
  `;
}

function checkbox(path, label) {
  return `
    <label class="check">
      <input type="checkbox" data-path="${path}" ${get(path) ? "checked" : ""}>
      <span>${label}</span>
    </label>
  `;
}

function get(path) {
  return path.split(".").reduce((object, key) => object[key], state);
}

function set(path, value) {
  const keys = path.split(".");
  const last = keys.pop();
  const target = keys.reduce((object, key) => object[key], state);
  target[last] = value;
}

function bindInputs() {
  document.querySelectorAll("[data-path]").forEach((field) => {
    field.addEventListener("input", (event) => {
      const target = event.target;
      const raw = target.type === "checkbox" ? target.checked : target.value;
      const value = target.type === "number" ? num(raw) : raw;
      set(target.dataset.path, value);
      renderSummary();
      updateResultsOnly();
      saveState();
    });
  });
}

function updateResultsOnly() {
  const map = {
    core: coreResults,
    purchase: purchaseResults,
    survival: survivalResults,
    subscriptions: subscriptionResults,
    quit: quitResults,
    freelancer: freelancerResults,
    starter: starterResults,
    shared: sharedResults,
    debt: debtResults,
    fire: fireResults,
    goals: goalsResults,
    scenario: scenarioResults,
    history: historyResults,
    assistant: assistantResults
  };
  document.getElementById("results").innerHTML = map[state.active]();
}

function renderCore() {
  document.getElementById("moduleBody").innerHTML = `
    <div class="home-lower">
      <section class="allocation-section">
        <div class="section-heading"><h2><span class="heading-mark blue-mark">每一块钱的去处</span></h2><span class="section-meta">月度计划</span></div>
        <div class="allocation-body" id="allocationBody"></div>
        <p class="allocation-caption" id="allocationCaption"></p>
      </section>
      <section class="goals-preview">
        <div class="section-heading"><h2><span class="heading-mark pink-mark">愿望，正在发芽</span></h2><button class="text-button" type="button" data-open="goals">全部目标 ${icon("arrow-up-right")}</button></div>
        <div class="goal-previews" id="goalPreviews"></div>
      </section>
    </div>
    <details class="profile-details" id="profileDetails">
      <summary><span class="profile-summary-title">${icon("sliders-horizontal")}我的关键数字</span><span class="profile-summary-note"><span>收入、支出与生活计划</span>${icon("chevron-down")}</span></summary>
      <div class="profile-editor">
        <div class="grid">
          ${input("profile.income", "月收入")}
          ${input("profile.balance", "当前可用存款")}
          ${input("profile.fixed", "每月固定支出", "number", "房租、通勤、吃饭、保险等相对固定成本")}
          ${input("profile.debtPay", "每月债务还款")}
          ${input("profile.targetSave", "每月想存下的钱")}
          ${input("profile.daysLeft", "本月剩余天数")}
          ${input("profile.currentMonthSpent", "本月已花可变支出")}
        </div>
        <div class="checklist">
          ${checkbox("habits.noDailyLedger", "不要求每天记账，只看关键数字")}
          ${checkbox("habits.weeklyCheck", "每周固定一次 10 分钟复盘")}
          ${checkbox("habits.exportBackup", "本周已经导出过备份")}
          ${checkbox("habits.coolDown", "大额消费先冷静 24 小时")}
        </div>
      </div>
    </details>`;
  document.querySelectorAll("#moduleBody [data-open]").forEach(button => button.addEventListener("click", () => openModule(button.dataset.open)));
  bindInputs();
  updateResultsOnly();
}

function coreResults() {
  const free = monthlyFreeCash();
  const monthlyCost = fixedMonthly();
  const leftBudget = Math.max(0, num(state.profile.income) - monthlyCost - num(state.profile.targetSave) - num(state.profile.currentMonthSpent));
  return cards([
    ["本月剩余可安心花费", money(leftBudget), "把目标储蓄和固定项先留出来之后，这部分才是更自由的钱。", "soft"],
    ["每月自由现金流", money(free), free >= 0 ? "收入减去固定支出、还款和目标储蓄后仍为正。" : "目标可能偏紧，可以先降低目标或检查固定项。", free >= 0 ? "" : "warm"],
    ["最低建议安全垫", money(fixedMonthly() * 3), "先攒到 3 个月固定成本，会明显降低选择压力。", ""]
  ]);
}

function renderPurchase() {
  document.getElementById("moduleBody").innerHTML = `
    <div class="grid">
      ${input("purchase.name", "消费名称", "text")}
      ${input("purchase.price", "价格")}
      ${input("purchase.usePerMonth", "预计每月使用次数")}
      ${input("purchase.lifespan", "预计使用月数")}
      ${input("purchase.resale", "未来可回收金额")}
      ${input("purchase.alternative", "更便宜替代方案价格")}
      ${input("purchase.urgency", "紧急程度", "text", "", [
        { value: "low", label: "不急，可以等等" },
        { value: "medium", label: "有用，但不是今天必须" },
        { value: "high", label: "影响工作或生活" }
      ])}
    </div>
    <div class="note">判断重点不是“买了是不是罪恶”，而是这笔钱会占掉多少安全垫，以及每次使用成本是否合理。</div>
  `;
  bindInputs();
  updateResultsOnly();
}

function purchaseResults() {
  const p = state.purchase;
  const net = Math.max(0, num(p.price) - num(p.resale));
  const uses = Math.max(1, num(p.usePerMonth) * Math.max(1, num(p.lifespan)));
  const costPerUse = net / uses;
  const days = dailySafe() > 0 ? net / dailySafe() : 0;
  const bufferAfter = runway(num(state.profile.balance) - net);
  const altSave = Math.max(0, num(p.price) - num(p.alternative));
  let advice = "可以进入比价和购买时机阶段。";
  if (bufferAfter < 2) advice = "建议先缓一缓。买完后安全垫会低于 2 个月。";
  else if (days > 20 && p.urgency !== "high") advice = "建议先冷静 24 小时，或考虑替代方案。";
  else if (p.urgency === "high" && bufferAfter >= 3) advice = "如果它能提升收入或生活稳定性，这笔消费相对可承受。";
  return cards([
    ["净成本", money(net), `扣除预计回收后，${p.name || "这笔消费"}真正消耗的现金。`, "soft"],
    ["每次使用成本", money(costPerUse), `按 ${uses} 次使用估算，适合和租赁、二手、替代方案比较。`, ""],
    ["消耗安心天数", Math.round(days) + " 天", "相当于占用这些天的每日安心花费。", days > 20 ? "warm" : ""],
    ["买后安全垫", months(bufferAfter), advice, bufferAfter < 2 ? "warm" : ""],
    ["替代方案可省", money(altSave), "如果差异不影响核心体验，这笔省下的钱就是安全垫。", ""]
  ]);
}

function renderSurvival() {
  document.getElementById("moduleBody").innerHTML = `
    <div class="grid">
      ${input("profile.income", "本月收入")}
      ${input("profile.fixed", "本月剩余固定支出")}
      ${input("profile.debtPay", "本月剩余还款")}
      ${input("profile.targetSave", "本月仍想保留的储蓄")}
      ${input("profile.currentMonthSpent", "本月已花可变支出")}
      ${input("profile.daysLeft", "本月剩余天数")}
    </div>
    <div class="note">月底紧张时，不用回忆每一笔小账。先算今天开始每天能花多少，再把一周内的大项排出来。</div>
  `;
  bindInputs();
  updateResultsOnly();
}

function survivalResults() {
  const remain = Math.max(0, num(state.profile.income) - fixedMonthly() - num(state.profile.targetSave) - num(state.profile.currentMonthSpent));
  const perDay = num(state.profile.daysLeft) > 0 ? remain / num(state.profile.daysLeft) : 0;
  const weekly = perDay * 7;
  const note = perDay >= dailySafe() * 0.8 ? "月底节奏还可以，按这个额度花就行。" : "本月后段偏紧，可以先暂停非必要购物和外食。";
  return cards([
    ["剩余可用额度", money(remain), "从今天到月底还能自由安排的金额。", "soft"],
    ["每天可安心花", money(perDay), note, perDay < dailySafe() * 0.6 ? "warm" : ""],
    ["未来 7 天额度", money(weekly), "适合给本周食物、交通和小额娱乐设上限。", ""]
  ]);
}

function renderSubscriptions() {
  document.getElementById("moduleBody").innerHTML = `
    <div class="list" id="subscriptionList">
      ${state.subscriptions.map((item, index) => subscriptionRow(item, index)).join("")}
    </div>
    <div class="tabs">
      <button class="mini" type="button" id="addSubscription">新增固定项</button>
    </div>
    <div class="note">订阅不只包括会员，也包括任何每月自动发生的固定项。房租、软件、保险和分期都应该放进来。</div>
  `;
  document.getElementById("addSubscription").addEventListener("click", () => {
    state.subscriptions.push({ name: "新项目", amount: 0, category: "其他", essential: "maybe" });
    render();
  });
  bindList("subscriptions");
  updateResultsOnly();
}

function subscriptionRow(item, index) {
  return `
    <div class="row">
      <div class="field"><label>名称</label><input data-list="subscriptions" data-index="${index}" data-key="name" type="text" value="${item.name}"></div>
      <div class="field"><label>金额</label><input data-list="subscriptions" data-index="${index}" data-key="amount" type="number" value="${item.amount}"></div>
      <div class="field"><label>类别</label><input data-list="subscriptions" data-index="${index}" data-key="category" type="text" value="${item.category}"></div>
      <div class="field"><label>必要性</label><select data-list="subscriptions" data-index="${index}" data-key="essential">
        <option value="yes" ${item.essential === "yes" ? "selected" : ""}>必要</option>
        <option value="maybe" ${item.essential === "maybe" ? "selected" : ""}>待判断</option>
        <option value="no" ${item.essential === "no" ? "selected" : ""}>可取消</option>
      </select></div>
      <button class="remove" type="button" data-remove="subscriptions" data-index="${index}" aria-label="删除">×</button>
    </div>
  `;
}

function subscriptionResults() {
  const total = totalSubscriptions();
  const ratio = num(state.profile.income) ? total / num(state.profile.income) * 100 : 0;
  const cancellable = state.subscriptions.filter((item) => item.essential === "no").reduce((sum, item) => sum + num(item.amount), 0);
  const maybe = state.subscriptions.filter((item) => item.essential === "maybe").reduce((sum, item) => sum + num(item.amount), 0);
  return cards([
    ["固定项合计", money(total), "这是每月自动占用的现金流。", "soft"],
    ["占收入比例", percent(ratio), ratio > 45 ? "固定压力较高，可以优先看房租、分期和大额订阅。" : "固定项仍在较可控区间。", ratio > 45 ? "warm" : ""],
    ["可直接取消", money(cancellable), "先处理明确不必要的项目，不需要纠结太久。", ""],
    ["待判断项目", money(maybe), "给这些项目设一个复盘日期，避免一直自动续费。", ""]
  ]);
}

function renderQuit() {
  document.getElementById("moduleBody").innerHTML = `
    <div class="grid">
      ${input("profile.balance", "当前可用存款")}
      ${input("profile.fixed", "离职后每月生活成本")}
      ${input("profile.debtPay", "每月必须还款")}
      ${input("profile.targetSave", "离职期仍想保留的储蓄", "number", "如果暂时不存钱，可以填 0")}
      ${input("freelancer.receivable", "确认会到账的尾款")}
      ${input("freelancer.receivableDays", "预计到账天数")}
    </div>
    <div class="note">离职安全垫要保守估算。把“可能收入”先放在旁边，只把确定到账的钱纳入主判断。</div>
  `;
  bindInputs();
  updateResultsOnly();
}

function quitResults() {
  const monthly = fixedMonthly() + num(state.profile.targetSave);
  const base = monthly > 0 ? num(state.profile.balance) / monthly : 0;
  const withReceivable = monthly > 0 ? (num(state.profile.balance) + num(state.freelancer.receivable)) / monthly : 0;
  const target = monthly * 6;
  const gap = Math.max(0, target - num(state.profile.balance));
  let advice = "适合继续观察机会，不必急着把自己推到紧绷状态。";
  if (base >= 6) advice = "安全垫比较充足，可以更从容地选择下一份工作。";
  else if (base >= 3) advice = "可以离职，但最好先写清楚 90 天现金流计划。";
  else advice = "不建议裸辞。先把安全垫补到至少 3 个月。";
  return cards([
    ["裸辞可撑", months(base), advice, base < 3 ? "warm" : "soft"],
    ["尾款到账后", months(withReceivable), `预计 ${state.freelancer.receivableDays} 天后到账，到账前仍要按保守版本生活。`, ""],
    ["6 个月安全垫缺口", money(gap), gap > 0 ? "这是更从容离开的目标差额。" : "已经达到 6 个月目标。", ""]
  ]);
}

function renderFreelancer() {
  document.getElementById("moduleBody").innerHTML = `
    <div class="grid">
      ${input("freelancer.averageIncome", "平均月收入")}
      ${input("freelancer.lowIncome", "低谷月收入")}
      ${input("freelancer.receivable", "未到账项目款")}
      ${input("freelancer.receivableDays", "平均回款天数")}
      ${input("freelancer.taxRate", "税费预留比例")}
      ${input("freelancer.businessCost", "每月业务成本")}
      ${input("freelancer.dryMonths", "预计低谷月数")}
      ${input("profile.balance", "当前可用存款")}
    </div>
    <div class="note">自由职业最怕的不是某个月收入低，而是回款慢、税费没留、低谷期没有现金桥。</div>
  `;
  bindInputs();
  updateResultsOnly();
}

function freelancerResults() {
  const taxReserve = num(state.freelancer.averageIncome) * num(state.freelancer.taxRate) / 100;
  const lowFree = num(state.freelancer.lowIncome) - fixedMonthly() - taxReserve - num(state.freelancer.businessCost);
  const dryNeed = Math.max(0, (fixedMonthly() + num(state.freelancer.businessCost)) * num(state.freelancer.dryMonths) - num(state.profile.balance));
  const receivableMonth = num(state.freelancer.receivableDays) / 30;
  return cards([
    ["建议每月税费预留", money(taxReserve), "先把税费视为不可花的钱，年末会轻很多。", "soft"],
    ["低谷月现金流", money(lowFree), lowFree >= 0 ? "低谷月仍能覆盖关键成本。" : "低谷月会消耗存款，建议提前准备现金桥。", lowFree < 0 ? "warm" : ""],
    ["低谷现金缺口", money(dryNeed), "覆盖预计低谷月份所需的额外现金。", dryNeed > 0 ? "warm" : ""],
    ["回款周期", months(receivableMonth), "回款越慢，越需要把安全垫目标往上调。", ""]
  ]);
}

function renderStarter() {
  document.getElementById("moduleBody").innerHTML = `
    <div class="grid">
      ${input("starter.allowance", "每月可用收入或生活费")}
      ${input("starter.rent", "租房成本")}
      ${input("starter.commute", "通勤成本")}
      ${input("starter.food", "吃饭成本")}
      ${input("starter.fun", "娱乐预算")}
      ${input("starter.impulsePrice", "想买的冲动消费")}
      ${input("starter.waitDays", "冷静期天数")}
    </div>
    <div class="note">刚开始独立生活时，真正拉开差距的是租房比例和冲动消费频率，而不是偶尔一杯饮料。</div>
  `;
  bindInputs();
  updateResultsOnly();
}

function starterResults() {
  const base = num(state.starter.rent) + num(state.starter.commute) + num(state.starter.food);
  const left = num(state.starter.allowance) - base - num(state.starter.fun);
  const rentRatio = num(state.starter.allowance) ? num(state.starter.rent) / num(state.starter.allowance) * 100 : 0;
  const impulseDays = left > 0 ? num(state.starter.impulsePrice) / (left / 30) : 0;
  return cards([
    ["基本生活成本", money(base), "租房、通勤和吃饭是最先需要稳定住的三项。", "soft"],
    ["月底可结余", money(left), left >= 0 ? "这个结余可以分成储蓄和小目标。" : "预算已经超出收入，需要先调整租房或娱乐项。", left < 0 ? "warm" : ""],
    ["租房占比", percent(rentRatio), rentRatio > 35 ? "租房压力偏高，后续涨租或收入波动会更敏感。" : "租房比例较健康。", rentRatio > 35 ? "warm" : ""],
    ["冲动消费代价", Math.round(impulseDays) + " 天", `相当于占用 ${Math.round(impulseDays)} 天结余。建议至少等 ${state.starter.waitDays} 天再决定。`, impulseDays > 10 ? "warm" : ""]
  ]);
}

function renderShared() {
  document.getElementById("moduleBody").innerHTML = `
    <div class="grid">
      ${input("shared.personA", "成员 A", "text")}
      ${input("shared.incomeA", "成员 A 月收入")}
      ${input("shared.personB", "成员 B", "text")}
      ${input("shared.incomeB", "成员 B 月收入")}
      ${input("shared.target", "共同目标金额")}
      ${input("shared.saved", "已存共同金额")}
    </div>
    <div class="list" id="sharedList" style="margin-top:14px;">
      ${state.shared.expenses.map((item, index) => sharedRow(item, index)).join("")}
    </div>
    <div class="tabs">
      <button class="mini" type="button" id="addShared">新增共同支出</button>
    </div>
    <div class="note">共同账本的目标不是算得很冷，而是避免一个人长期多承担却说不出口。</div>
  `;
  document.getElementById("addShared").addEventListener("click", () => {
    state.shared.expenses.push({ name: "新支出", amount: 0, payer: "A" });
    render();
  });
  bindInputs();
  bindList("shared.expenses");
  updateResultsOnly();
}

function sharedRow(item, index) {
  return `
    <div class="row two">
      <div class="field"><label>名称</label><input data-list="shared.expenses" data-index="${index}" data-key="name" type="text" value="${item.name}"></div>
      <div class="field"><label>金额</label><input data-list="shared.expenses" data-index="${index}" data-key="amount" type="number" value="${item.amount}"></div>
      <div class="field"><label>付款人</label><select data-list="shared.expenses" data-index="${index}" data-key="payer">
        <option value="A" ${item.payer === "A" ? "selected" : ""}>${state.shared.personA || "A"}</option>
        <option value="B" ${item.payer === "B" ? "selected" : ""}>${state.shared.personB || "B"}</option>
      </select></div>
      <button class="remove" type="button" data-remove="shared.expenses" data-index="${index}" aria-label="删除">×</button>
    </div>
  `;
}

function sharedResults() {
  const total = state.shared.expenses.reduce((sum, item) => sum + num(item.amount), 0);
  const paidA = state.shared.expenses.filter((item) => item.payer === "A").reduce((sum, item) => sum + num(item.amount), 0);
  const paidB = total - paidA;
  const incomeTotal = num(state.shared.incomeA) + num(state.shared.incomeB);
  const fairA = incomeTotal ? total * num(state.shared.incomeA) / incomeTotal : total / 2;
  const settle = paidA - fairA;
  const progress = num(state.shared.target) ? num(state.shared.saved) / num(state.shared.target) * 100 : 0;
  const settleText = settle > 0 ? `${state.shared.personB} 补给 ${state.shared.personA}` : `${state.shared.personA} 补给 ${state.shared.personB}`;
  return cards([
    ["共同支出合计", money(total), `${state.shared.personA} 已付 ${money(paidA)}，${state.shared.personB} 已付 ${money(paidB)}。`, "soft"],
    ["按收入比例结算", money(Math.abs(settle)), Math.abs(settle) < 1 ? "当前基本平衡。" : settleText, Math.abs(settle) > total * 0.2 ? "warm" : ""],
    ["共同目标进度", percent(progress), `还差 ${money(Math.max(0, num(state.shared.target) - num(state.shared.saved)))}。`, ""]
  ]);
}

function renderDebt() {
  document.getElementById("moduleBody").innerHTML = `
    <div class="list" id="debtList">
      ${state.debts.map((item, index) => debtRow(item, index)).join("")}
    </div>
    <div class="tabs">
      <button class="mini" type="button" id="addDebt">新增债务</button>
    </div>
    <div class="note">雪球法优先还最小余额，获得心理动能。雪崩法优先还最高利率，通常更省利息。</div>
  `;
  document.getElementById("addDebt").addEventListener("click", () => {
    state.debts.push({ name: "新债务", balance: 0, rate: 0, minPay: 0, extraPay: 0 });
    render();
  });
  bindList("debts");
  updateResultsOnly();
}

function debtRow(item, index) {
  return `
    <div class="row debt">
      <div class="field"><label>名称</label><input data-list="debts" data-index="${index}" data-key="name" type="text" value="${item.name}"></div>
      <div class="field"><label>余额</label><input data-list="debts" data-index="${index}" data-key="balance" type="number" value="${item.balance}"></div>
      <div class="field"><label>年利率 %</label><input data-list="debts" data-index="${index}" data-key="rate" type="number" value="${item.rate}"></div>
      <div class="field"><label>最低还款</label><input data-list="debts" data-index="${index}" data-key="minPay" type="number" value="${item.minPay}"></div>
      <div class="field"><label>额外还款</label><input data-list="debts" data-index="${index}" data-key="extraPay" type="number" value="${item.extraPay}"></div>
      <button class="remove" type="button" data-remove="debts" data-index="${index}" aria-label="删除">×</button>
    </div>
  `;
}

function debtResults() {
  const total = state.debts.reduce((sum, item) => sum + num(item.balance), 0);
  const monthlyPay = state.debts.reduce((sum, item) => sum + num(item.minPay) + num(item.extraPay), 0);
  const snowball = [...state.debts].sort((a, b) => num(a.balance) - num(b.balance))[0];
  const avalanche = [...state.debts].sort((a, b) => num(b.rate) - num(a.rate))[0];
  const monthsLeft = monthlyPay > 0 ? total / monthlyPay : 0;
  return cards([
    ["债务总额", money(total), "先把总额放到台面上，焦虑会变得更具体。", "soft"],
    ["每月还款合计", money(monthlyPay), "包括最低还款和主动额外还款。", ""],
    ["雪球法优先", snowball ? snowball.name : "无", snowball ? `先清掉余额 ${money(num(snowball.balance))} 的债务。` : "暂无债务。", ""],
    ["雪崩法优先", avalanche ? avalanche.name : "无", avalanche ? `先处理年利率 ${percent(num(avalanche.rate))} 的债务。` : "暂无债务。", ""],
    ["粗略还清时间", months(monthsLeft), "这是不计复利和手续费的粗略估算，用来做方向判断。", monthsLeft > 24 ? "warm" : ""]
  ]);
}

function renderFire() {
  document.getElementById("moduleBody").innerHTML = `
    <div class="grid">
      ${input("fire.invested", "当前投资本金")}
      ${input("fire.monthlyInvest", "每月投入")}
      ${input("fire.annualReturn", "预期年化收益 %")}
      ${input("fire.annualSpend", "年生活支出")}
      ${input("fire.withdrawalRate", "安全提取率 %")}
      ${input("profile.income", "当前月收入")}
    </div>
    <div class="note">FIRE 计算不是承诺未来收益，而是帮你看清目标数量级、储蓄率和时间之间的关系。</div>
  `;
  bindInputs();
  updateResultsOnly();
}

function fireResults() {
  const target = num(state.fire.annualSpend) / (num(state.fire.withdrawalRate) / 100 || 0.04);
  const gap = Math.max(0, target - num(state.fire.invested));
  const saveRate = num(state.profile.income) ? num(state.fire.monthlyInvest) / num(state.profile.income) * 100 : 0;
  const monthlyRate = Math.pow(1 + num(state.fire.annualReturn) / 100, 1 / 12) - 1;
  let monthsToGoal = 0;
  let future = num(state.fire.invested);
  while (future < target && monthsToGoal < 1200) {
    future = future * (1 + monthlyRate) + num(state.fire.monthlyInvest);
    monthsToGoal += 1;
  }
  const progress = target ? num(state.fire.invested) / target * 100 : 0;
  return cards([
    ["FIRE 目标本金", money(target), `按年支出 ${money(num(state.fire.annualSpend))} 和 ${state.fire.withdrawalRate}% 提取率估算。`, "soft"],
    ["当前进度", percent(progress), `距离目标还差 ${money(gap)}。`, ""],
    ["当前储蓄率", percent(saveRate), saveRate >= 30 ? "储蓄率很有力量，时间会站在你这边。" : "储蓄率偏低时，先从固定支出和收入提升入手。", saveRate < 20 ? "warm" : ""],
    ["预计到达时间", months(monthsToGoal), monthsToGoal >= 1200 ? "按当前投入暂时很难到达，可以调整投入或目标支出。" : `约 ${Math.floor(monthsToGoal / 12)} 年 ${monthsToGoal % 12} 个月。`, monthsToGoal > 360 ? "warm" : ""]
  ]);
}

function renderGoals() {
  document.getElementById("moduleBody").innerHTML = `
    <div class="list" id="goalList">
      ${state.goals.map((item, index) => goalRow(item, index)).join("")}
    </div>
    <div class="tabs">
      <button class="mini" type="button" id="addGoal">新增目标</button>
    </div>
    <div class="note">目标不需要一次完成。先写清楚金额、当前进度和每月能稳定拿出来的钱，剩下的交给时间。</div>
  `;
  document.getElementById("addGoal").addEventListener("click", () => {
    state.goals.push({ name: "新目标", target: 10000, current: 0, monthly: 500, priority: "中" });
    render();
  });
  bindList("goals");
  updateResultsOnly();
}

function goalRow(item, index) {
  return `
    <div class="row goal">
      <div class="field"><label>目标名称</label><input data-list="goals" data-index="${index}" data-key="name" type="text" value="${escapeHtml(item.name)}"></div>
      <div class="field"><label>目标金额</label><input data-list="goals" data-index="${index}" data-key="target" type="number" value="${item.target}"></div>
      <div class="field"><label>当前已有</label><input data-list="goals" data-index="${index}" data-key="current" type="number" value="${item.current}"></div>
      <div class="field"><label>每月投入</label><input data-list="goals" data-index="${index}" data-key="monthly" type="number" value="${item.monthly}"></div>
      <div class="field"><label>优先级</label><select data-list="goals" data-index="${index}" data-key="priority">
        <option value="高" ${item.priority === "高" ? "selected" : ""}>高</option>
        <option value="中" ${item.priority === "中" ? "selected" : ""}>中</option>
        <option value="低" ${item.priority === "低" ? "selected" : ""}>低</option>
      </select></div>
      <button class="remove" type="button" data-remove="goals" data-index="${index}" aria-label="删除">×</button>
    </div>
  `;
}

function goalsResults() {
  const totalTarget = state.goals.reduce((sum, item) => sum + Math.max(0, num(item.target)), 0);
  const totalCurrent = state.goals.reduce((sum, item) => sum + Math.min(num(item.target), Math.max(0, num(item.current))), 0);
  const monthly = state.goals.reduce((sum, item) => sum + Math.max(0, num(item.monthly)), 0);
  const progress = totalTarget ? totalCurrent / totalTarget * 100 : 0;
  const active = state.goals
    .filter((item) => num(item.target) > num(item.current))
    .sort((a, b) => ({ 高: 0, 中: 1, 低: 2 }[a.priority] || 1) - ({ 高: 0, 中: 1, 低: 2 }[b.priority] || 1));
  const next = active[0];
  const nextMonths = next && num(next.monthly) > 0 ? Math.ceil(Math.max(0, num(next.target) - num(next.current)) / num(next.monthly)) : null;
  const monthlyRatio = num(state.profile.income) ? monthly / num(state.profile.income) * 100 : 0;
  return cards([
    ["目标总额", money(totalTarget), `当前已完成 ${money(totalCurrent)}。`, "soft"],
    ["整体进度", percent(progress), progress >= 70 ? "大部分目标已经进入收尾阶段。" : "先保持每月投入稳定，不必频繁调整。", ""],
    ["每月目标投入", money(monthly), `占当前收入 ${percent(monthlyRatio)}。`, monthlyRatio > 35 ? "warm" : ""],
    ["下一优先目标", next ? escapeHtml(next.name) : "暂无", next ? (nextMonths === null ? "还没有设置每月投入。" : `按当前投入还需约 ${nextMonths} 个月。`) : "可以新增一个想完成的目标。", ""]
  ]);
}

function renderScenario() {
  document.getElementById("moduleBody").innerHTML = `
    <div class="grid">
      ${input("scenario.incomeChange", "收入变化 %", "number", "降薪填负数，涨薪填正数")}
      ${input("scenario.extraMonthlyExpense", "每月新增支出")}
      ${input("scenario.oneTimeExpense", "一次性大额支出")}
      ${input("scenario.duration", "模拟月份")}
    </div>
    <div class="scenario-presets">
      <span class="hint">快速场景</span>
      <button class="mini scenario-preset" type="button" data-income="-20" data-expense="0">收入下降 20%</button>
      <button class="mini scenario-preset" type="button" data-income="0" data-expense="2000">每月多花 2000</button>
      <button class="mini scenario-preset" type="button" data-income="-10" data-expense="1500">双重压力</button>
    </div>
    <div class="note">把最担心的变化先放进来。看到结果之后，你会更清楚需要多少安全垫，而不是只凭感觉焦虑。</div>
  `;
  document.querySelectorAll(".scenario-preset").forEach((button) => {
    button.addEventListener("click", () => {
      state.scenario.incomeChange = num(button.dataset.income);
      state.scenario.extraMonthlyExpense = num(button.dataset.expense);
      render();
    });
  });
  bindInputs();
  updateResultsOnly();
}

function scenarioResults() {
  const scenarioIncome = num(state.profile.income) * (1 + num(state.scenario.incomeChange) / 100);
  const monthlyNet = scenarioIncome - fixedMonthly() - num(state.profile.targetSave) - num(state.scenario.extraMonthlyExpense);
  const startBalance = num(state.profile.balance) - num(state.scenario.oneTimeExpense);
  const endBalance = startBalance + monthlyNet * num(state.scenario.duration);
  const daily = Math.max(0, (scenarioIncome - fixedMonthly() - num(state.scenario.extraMonthlyExpense)) / 30);
  const stressRunway = monthlyNet < 0 ? startBalance / Math.abs(monthlyNet) : 0;
  let advice = "这个场景下现金流仍然为正，可以继续观察。";
  if (startBalance < 0) advice = "一次性支出已经超过当前存款，建议拆分购买或先补安全垫。";
  else if (monthlyNet < 0 && stressRunway < 3) advice = "这个场景会在 3 个月内消耗掉缓冲垫，建议提前准备替代方案。";
  else if (monthlyNet < 0) advice = "现金流会变紧，但当前存款还能争取时间，优先减少新增支出。";
  return cards([
    ["模拟后月收入", money(scenarioIncome), `相对当前变化 ${percent(num(state.scenario.incomeChange))}。`, scenarioIncome < num(state.profile.income) ? "warm" : "soft"],
    ["每月净现金流", money(monthlyNet), monthlyNet >= 0 ? "每月仍会增加现金。" : "每月会消耗存款。", monthlyNet < 0 ? "warm" : ""],
    [`${state.scenario.duration} 个月后余额`, money(endBalance), advice, endBalance < 0 ? "warm" : "soft"],
    ["压力下每日可用", money(daily), "这是不含目标储蓄的保守可用额度。", daily < dailySafe() * 0.7 ? "warm" : ""],
    ["可撑时间", monthlyNet < 0 ? months(stressRunway) : "无需动用存款", monthlyNet < 0 ? "按模拟后的每月缺口估算。" : "这个场景不用消耗现有安全垫。", ""]
  ]);
}

function renderHistory() {
  document.getElementById("moduleBody").innerHTML = `
    <div class="list" id="historyList">
      ${state.history.map((item, index) => historyRow(item, index)).join("")}
    </div>
    <div class="tabs">
      <button class="mini" type="button" id="addHistory">新增月份</button>
    </div>
    <div class="history-chart" id="historyChart">${historyChart()}</div>
    <div class="note">月度复盘只需要记录收入和总支出。连续看 3-6 个月，通常比每天盯着小数点更容易发现问题。</div>
  `;
  document.getElementById("addHistory").addEventListener("click", () => {
    state.history.push({ month: new Date().toISOString().slice(0, 7), income: num(state.profile.income), expense: fixedMonthly(), note: "" });
    render();
  });
  bindList("history");
  updateResultsOnly();
}

function historyRow(item, index) {
  return `
    <div class="row history">
      <div class="field"><label>月份</label><input data-list="history" data-index="${index}" data-key="month" type="month" value="${escapeHtml(item.month)}"></div>
      <div class="field"><label>收入</label><input data-list="history" data-index="${index}" data-key="income" type="number" value="${item.income}"></div>
      <div class="field"><label>总支出</label><input data-list="history" data-index="${index}" data-key="expense" type="number" value="${item.expense}"></div>
      <div class="field"><label>备注</label><input data-list="history" data-index="${index}" data-key="note" type="text" value="${escapeHtml(item.note)}"></div>
      <button class="remove" type="button" data-remove="history" data-index="${index}" aria-label="删除">×</button>
    </div>
  `;
}

function historyChart() {
  const max = Math.max(1, ...state.history.flatMap((item) => [num(item.income), num(item.expense)]));
  return state.history.map((item) => {
    const incomeWidth = num(item.income) / max * 100;
    const expenseWidth = num(item.expense) / max * 100;
    return `
      <div class="history-bar">
        <span>${escapeHtml(item.month)}</span>
        <div>
          <i class="income-bar" style="width:${incomeWidth}%"></i>
          <i class="expense-bar" style="width:${expenseWidth}%"></i>
        </div>
        <small>${money(num(item.income) - num(item.expense))}</small>
      </div>
    `;
  }).join("");
}

function historyResults() {
  const totalIncome = state.history.reduce((sum, item) => sum + num(item.income), 0);
  const totalExpense = state.history.reduce((sum, item) => sum + num(item.expense), 0);
  const averageExpense = state.history.length ? totalExpense / state.history.length : 0;
  const savingsRate = totalIncome ? (totalIncome - totalExpense) / totalIncome * 100 : 0;
  const best = [...state.history].sort((a, b) => (num(b.income) - num(b.expense)) - (num(a.income) - num(a.expense)))[0];
  return cards([
    ["累计收入", money(totalIncome), `共复盘 ${state.history.length} 个月。`, "soft"],
    ["平均月支出", money(averageExpense), "包含固定和可变支出，用来找生活成本基线。", ""],
    ["整体结余率", percent(savingsRate), savingsRate >= 20 ? "目前的结余能力比较稳定。" : "可以优先寻找固定支出或收入端的改善空间。", savingsRate < 10 ? "warm" : ""],
    ["结余最好月份", best ? best.month : "暂无", best ? `当月留下 ${money(num(best.income) - num(best.expense))}。` : "新增一条月度记录开始复盘。", ""]
  ]);
}

function renderAssistant() {
  const messages = state.assistant.messages || [];
  document.getElementById("moduleBody").innerHTML = `
    <div class="assistant-shell">
      <div class="assistant-intro">
        <span class="assistant-emblem">${sticker("cat")}</span>
        <div><strong>我是小安，听你说。</strong><p>本地决策助手 · 基于你的财务计划</p></div>
      </div>
      <div class="assistant-messages" id="assistantMessages" role="log" aria-label="与小助手的对话">
        ${messages.map((message) => `
          <div class="assistant-message ${message.role === "user" ? "user" : "assistant"}">
            <span>${message.role === "assistant" ? "小安" : "我"}</span>
            <p>${escapeHtml(message.text)}</p>
          </div>`).join("")}
      </div>
      <div class="assistant-suggestions">
        <button class="mini assistant-suggestion" type="button">这笔钱现在适合买么？</button>
        <button class="mini assistant-suggestion" type="button">如果降薪 20%，我能撑多久？</button>
        <button class="mini assistant-suggestion" type="button">我现在应该先做什么？</button>
      </div>
      <div class="assistant-composer">
        <textarea id="assistantInput" rows="2" aria-label="给小助手的问题" placeholder="说说你正在纠结的事…">${escapeHtml(assistantDraft)}</textarea>
        <div class="composer-toolbar">
          <span class="composer-context">${icon("lock-keyhole")}财务数据仅保存在本机</span>
          <div class="composer-actions">
            <button class="voice-button" id="assistantVoice" type="button" aria-label="语音输入" aria-pressed="false" data-tooltip="语音输入">${icon("mic")}</button>
            <button class="primary assistant-send" id="assistantSend" type="button">发送 ${icon("arrow-up")}</button>
          </div>
        </div>
      </div>
      <p class="hint voice-status" id="voiceStatus" role="status" aria-live="polite"></p>
      <p class="hint assistant-disclaimer">当前回答基于你在工具中填写的数据。涉及投资、税务和借贷时，请再找专业人士确认。</p>
    </div>`;
  const inputElement = document.getElementById("assistantInput");
  inputElement.addEventListener("input", () => { assistantDraft = inputElement.value; });
  document.querySelectorAll(".assistant-suggestion").forEach((button) => {
    button.addEventListener("click", () => {
      inputElement.value = button.textContent;
      assistantDraft = inputElement.value;
      inputElement.focus();
    });
  });
  document.getElementById("assistantVoice").addEventListener("click", toggleVoiceInput);
  document.getElementById("assistantSend").addEventListener("click", () => submitAssistantQuestion(inputElement.value));
  inputElement.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      submitAssistantQuestion(inputElement.value);
    }
  });
  const messageBox = document.getElementById("assistantMessages");
  messageBox.scrollTop = messageBox.scrollHeight;
  setVoiceUi(voiceListening, voiceListening ? "正在听，请说话…" : "");
  updateResultsOnly();
}

function speechRecognitionConstructor() {
  return window.SpeechRecognition || window.webkitSpeechRecognition;
}

function setVoiceUi(listening, message) {
  const button = document.getElementById("assistantVoice");
  const status = document.getElementById("voiceStatus");
  if (button) {
    button.classList.toggle("listening", listening);
    const label = listening ? "停止录音" : "语音输入";
    button.innerHTML = icon(listening ? "square" : "mic");
    button.setAttribute("aria-label", label);
    button.dataset.tooltip = label;
    button.setAttribute("aria-pressed", String(listening));
  }
  if (status) status.textContent = message;
  paintIcons();
}

function toggleVoiceInput() {
  if (voiceListening && speechRecognition) {
    speechRecognition.stop();
    return;
  }

  const Recognition = speechRecognitionConstructor();
  if (!Recognition) {
    setVoiceUi(false, "当前浏览器不支持语音识别，请直接输入文字。");
    toast("当前浏览器不支持语音识别");
    return;
  }

  const inputElement = document.getElementById("assistantInput");
  if (!inputElement) return;

  speechBaseText = inputElement.value.trim();
  speechTranscript = "";
  voiceError = "";
  speechRecognition = new Recognition();
  speechRecognition.lang = "zh-CN";
  speechRecognition.continuous = false;
  speechRecognition.interimResults = true;
  speechRecognition.maxAlternatives = 1;

  speechRecognition.onstart = () => {
    voiceListening = true;
    setVoiceUi(true, "正在听，请说话...");
  };

  speechRecognition.onresult = (event) => {
    let transcript = "";
    for (let index = 0; index < event.results.length; index += 1) {
      transcript += event.results[index][0].transcript;
    }
    speechTranscript = transcript.trim();
    inputElement.value = [speechBaseText, speechTranscript].filter(Boolean).join(" ");
    assistantDraft = inputElement.value;
  };

  speechRecognition.onerror = (event) => {
    const messages = {
      "not-allowed": "麦克风权限未开启，请允许浏览器使用麦克风。",
      "service-not-allowed": "语音识别服务不可用，请稍后再试。",
      "no-speech": "没有听到声音，可以再试一次。",
      "audio-capture": "没有检测到可用麦克风。",
      "network": "语音服务连接失败，请稍后再试或输入文字。",
      "aborted": "语音输入已停止。"
    };
    voiceError = messages[event.error] || "语音识别没有完成，请再试一次。";
    setVoiceUi(false, voiceError);
    toast(messages[event.error] || "语音识别没有完成");
  };

  speechRecognition.onend = () => {
    voiceListening = false;
    speechRecognition = null;
    const message = voiceError || (speechTranscript ? "已填入识别结果，可以检查后发送。" : "没有识别到内容，可以再试一次。");
    setVoiceUi(false, message);
  };

  try {
    speechRecognition.start();
  } catch (error) {
    voiceListening = false;
    speechRecognition = null;
    setVoiceUi(false, "语音输入启动失败，请再试一次。");
    toast("语音输入启动失败");
  }
}

function submitAssistantQuestion(question) {
  const text = String(question || "").trim();
  if (!text) {
    toast("先问一个具体问题");
    return;
  }
  if (voiceListening && speechRecognition) {
    speechRecognition.stop();
  }
  state.assistant.messages.push({ role: "user", text });
  assistantDraft = "";
  state.assistant.messages.push({ role: "assistant", text: assistantResponse(text) });
  state.assistant.messages = state.assistant.messages.slice(-12);
  saveState();
  renderModule();
}

function assistantResponse(question) {
  const text = question.toLowerCase();
  const amountMatch = text.replace(/,/g, "").match(/(\d+(?:\.\d+)?)\s*(万|千|元)?/);
  const parsedAmount = amountMatch ? num(amountMatch[1]) * (amountMatch[2] === "万" ? 10000 : amountMatch[2] === "千" ? 1000 : 1) : 0;
  if (/买|消费|电脑|手机|耳机|购物|值得/.test(text)) {
    const price = parsedAmount || num(state.purchase.price);
    const afterBuffer = runway(num(state.profile.balance) - price);
    const days = dailySafe() > 0 ? price / dailySafe() : 0;
    if (afterBuffer < 2) {
      return `这笔钱大约是 ${money(price)}。买完后安全垫会降到 ${months(afterBuffer)}，我建议先别急，至少先留住 2 个月固定支出。`;
    }
    if (days > 20) {
      return `这笔钱大约会占用 ${Math.round(days)} 天的安心花费。它不是绝对不能买，但值得先等 24 小时，再比较替代方案。`;
    }
    return `按你现在的数字，这笔 ${money(price)} 的消费不会明显伤到安全垫。只要它确实会被高频使用，可以进入比价和购买时机判断。`;
  }
  if (/撑|失业|辞职|裸辞|降薪|收入下降|安全垫/.test(text)) {
    const change = /20/.test(text) ? -20 : num(state.scenario.incomeChange);
    const income = num(state.profile.income) * (1 + change / 100);
    const monthlyNet = income - fixedMonthly() - num(state.profile.targetSave) - num(state.scenario.extraMonthlyExpense);
    const runwayAfter = monthlyNet < 0 ? num(state.profile.balance) / Math.abs(monthlyNet) : runway();
    if (monthlyNet >= 0) return `即使收入变化 ${change}% ，你的月现金流仍是正的。现在更值得做的是把安全垫补到 ${money(fixedMonthly() * 6)}。`;
    return `按这个压力场景，每月大约会少 ${money(Math.abs(monthlyNet))}。当前存款大约能撑 ${months(runwayAfter)}，先把非必要固定支出降下来会最有效。`;
  }
  if (/目标|应急金|旅行|存钱|攒钱/.test(text)) {
    const activeGoal = state.goals.find((item) => num(item.target) > num(item.current));
    if (!activeGoal) return "你还没有未完成的目标。可以先建一个 3 个月固定支出的应急金目标。";
    const gap = Math.max(0, num(activeGoal.target) - num(activeGoal.current));
    const goalMonths = num(activeGoal.monthly) > 0 ? Math.ceil(gap / num(activeGoal.monthly)) : null;
    return `我会先建议你推进“${activeGoal.name}”。还差 ${money(gap)}，${goalMonths === null ? "目前还没有设置每月投入。" : `按当前投入约需 ${goalMonths} 个月。`} 先把高优先级目标做稳，再安排低优先级愿望。`;
  }
  if (/会员|订阅|固定|房租/.test(text)) {
    const ratio = num(state.profile.income) ? totalSubscriptions() / num(state.profile.income) * 100 : 0;
    const cancellable = state.subscriptions.filter((item) => item.essential === "no").reduce((sum, item) => sum + num(item.amount), 0);
    return `你的固定项约占收入 ${percent(ratio)}，其中明确可取消的项目约 ${money(cancellable)}。不用一次砍很多，先处理一个最不常用的项目就有意义。`;
  }
  return `先看三个数字：每天安心花费约 ${money(dailySafe())}，现金缓冲约 ${months(runway())}，每月自由现金流约 ${money(monthlyFreeCash())}。你可以继续问我“这笔钱能不能买”或“如果收入下降会怎样”。`;
}

function assistantResults() {
  return cards([
    ["日均安心预算", money(dailySafe()), "按月度计划平均分配，已预留固定支出和储蓄。", "soft"],
    ["现金缓冲", months(runway()), "如果你要做重大决定，先确保它不会把缓冲垫压到 2 个月以下。", ""],
    ["建议先做的事", "问一个具体问题", "把金额、时间和担心的变化说出来，答案会比通用建议更有用。", ""]
  ]);
}

function bindList(path) {
  document.querySelectorAll(`[data-list="${path}"]`).forEach((field) => {
    field.addEventListener("input", (event) => {
      const target = event.target;
      const list = get(path);
      const item = list[num(target.dataset.index)];
      const key = target.dataset.key;
      item[key] = target.type === "number" ? num(target.value) : target.value;
      renderSummary();
      updateResultsOnly();
      if (state.active === "history") {
        const chart = document.getElementById("historyChart");
        if (chart) chart.innerHTML = historyChart();
      }
      saveState();
    });
  });
  document.querySelectorAll(`[data-remove="${path}"]`).forEach((button) => {
    button.addEventListener("click", () => {
      get(path).splice(num(button.dataset.index), 1);
      render();
    });
  });
}

function cards(items) {
  return items.map(([label, value, body, tone]) => `
    <div class="result-card ${tone || ""}">
      <span>${label}</span>
      <strong class="${/^[¥\d-]/.test(String(value)) ? "" : "result-text"}">${value}</strong>
      <p>${body}</p>
    </div>
  `).join("");
}

function toast(message) {
  const element = document.getElementById("toast");
  element.textContent = message;
  element.classList.add("show");
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => element.classList.remove("show"), 2300);
}

document.getElementById("themeBtn").addEventListener("click", () => {
  const current = document.documentElement.dataset.theme;
  state.theme = current === "dark" ? "light" : "dark";
  applyTheme();
  renderSummary();
  saveState();
});

document.getElementById("askAssistantBtn").addEventListener("click", () => {
  openModule("assistant");
  window.setTimeout(() => {
    const inputElement = document.getElementById("assistantInput");
    if (inputElement) inputElement.focus();
  }, 0);
});

document.getElementById("backupBtn").addEventListener("click", () => {
  document.getElementById("backupPanel").classList.toggle("open");
});

document.getElementById("makeBackupBtn").addEventListener("click", () => {
  document.getElementById("backupText").value = JSON.stringify(state, null, 2);
  state.habits.exportBackup = true;
  saveState();
  toast("备份文本已生成");
});

document.getElementById("restoreBackupBtn").addEventListener("click", () => {
  const text = document.getElementById("backupText").value.trim();
  if (!text) {
    toast("请先粘贴备份文本");
    return;
  }
  try {
    const data = JSON.parse(text);
    state = merge(clone(defaultState), data);
    render();
    document.getElementById("backupPanel").classList.add("open");
    document.getElementById("backupText").value = JSON.stringify(state, null, 2);
    toast("已从备份文本恢复");
  } catch (error) {
    toast("恢复失败，请检查备份文本");
  }
});

document.getElementById("closeBackupBtn").addEventListener("click", () => {
  document.getElementById("backupPanel").classList.remove("open");
});

document.getElementById("homeBtn").addEventListener("click", () => openModule("core"));
document.getElementById("helloAssistantBtn").addEventListener("click", () => {
  openModule("assistant");
  document.getElementById("assistantInput").focus();
});
document.getElementById("editProfileBtn").addEventListener("click", () => {
  const details = document.getElementById("profileDetails");
  if (!details) return;
  details.open = true;
  details.scrollIntoView({ block: "start" });
});
document.getElementById("todayDate").textContent = new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "long" }).format(new Date());

render();
