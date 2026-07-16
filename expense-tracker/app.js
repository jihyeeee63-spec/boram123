(() => {
  const STORAGE_KEY = "daily-expense-tracker-v1";

  const CATEGORIES = {
    salary: { type: "income", color: "#5b8fd6" },
    food: { type: "expense", color: "#f4a261" },
    health: { type: "expense", color: "#7ec8a3" },
    shopping: { type: "expense", color: "#e891b0" },
    medical: { type: "expense", color: "#8e7cc3" },
    transport: { type: "expense", color: "#64b5f6" },
    living: { type: "expense", color: "#81c784" },
    other: { type: "expense", color: "#90a4ae" },
  };

  const i18n = {
    vi: {
      appTitle: "Nhật ký chi tiêu",
      appSubtitle: "Theo dõi thu · chi trong ngày",
      dateLabel: "Ngày",
      totalIncome: "Tổng thu",
      totalExpense: "Tổng chi",
      balance: "Còn lại",
      chartTitle: "Biểu đồ chi tiêu",
      chartHint: "Tỷ lệ từng hạng mục trong ngày",
      expenseShare: "Chi tiêu",
      addTitle: "Thêm giao dịch",
      addHint: "Ghi lại thu nhập hoặc chi phí sinh hoạt",
      typeExpense: "Chi tiêu",
      typeIncome: "Thu nhập",
      categoryLabel: "Hạng mục",
      noteLabel: "Nội dung",
      notePlaceholder: "Ví dụ: cơm trưa, taxi...",
      amountLabel: "Số tiền",
      addBtn: "Thêm vào nhật ký",
      listTitle: "Chi tiết trong ngày",
      listHint: "Xem đã chi tiêu vào việc gì",
      clearDay: "Xóa ngày này",
      emptyState: "Chưa có giao dịch nào hôm nay. Hãy thêm một khoản nhé!",
      footerNote: "Dữ liệu lưu trên máy bạn · Soft & cute daily budget",
      noExpense: "Chưa có chi tiêu",
      confirmClear: "Xóa toàn bộ giao dịch của ngày này?",
      categories: {
        salary: "Lương",
        food: "Ăn uống",
        health: "Sức khỏe",
        shopping: "Mua sắm",
        medical: "Y tế",
        transport: "Di chuyển",
        living: "Sinh hoạt",
        other: "Khác",
      },
    },
    en: {
      appTitle: "Daily Budget Diary",
      appSubtitle: "Track income · expenses for the day",
      dateLabel: "Date",
      totalIncome: "Income",
      totalExpense: "Expenses",
      balance: "Remaining",
      chartTitle: "Expense chart",
      chartHint: "Share of each category today",
      expenseShare: "Spent",
      addTitle: "Add transaction",
      addHint: "Log income or living costs",
      typeExpense: "Expense",
      typeIncome: "Income",
      categoryLabel: "Category",
      noteLabel: "Note",
      notePlaceholder: "e.g. lunch, taxi...",
      amountLabel: "Amount",
      addBtn: "Add to diary",
      listTitle: "Today's details",
      listHint: "See what the money went to",
      clearDay: "Clear this day",
      emptyState: "No transactions yet today. Add one!",
      footerNote: "Saved on your device · Soft & cute daily budget",
      noExpense: "No expenses yet",
      confirmClear: "Clear all transactions for this day?",
      categories: {
        salary: "Salary",
        food: "Food & Drink",
        health: "Health",
        shopping: "Shopping",
        medical: "Medical",
        transport: "Transport",
        living: "Living costs",
        other: "Other",
      },
    },
  };

  const els = {
    dateInput: document.getElementById("dateInput"),
    totalIncome: document.getElementById("totalIncome"),
    totalExpense: document.getElementById("totalExpense"),
    balance: document.getElementById("balance"),
    donutChart: document.getElementById("donutChart"),
    donutTotal: document.getElementById("donutTotal"),
    legend: document.getElementById("legend"),
    txForm: document.getElementById("txForm"),
    category: document.getElementById("category"),
    note: document.getElementById("note"),
    amount: document.getElementById("amount"),
    txList: document.getElementById("txList"),
    emptyState: document.getElementById("emptyState"),
    clearDay: document.getElementById("clearDay"),
  };

  let lang = localStorage.getItem("expense-lang") || "vi";
  let txType = "expense";
  let store = loadStore();

  function todayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function loadStore() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  function saveStore() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }

  function currentDate() {
    return els.dateInput.value || todayISO();
  }

  function dayTx() {
    return store[currentDate()] || [];
  }

  function setDayTx(list) {
    store[currentDate()] = list;
    saveStore();
  }

  function t(key) {
    return i18n[lang][key];
  }

  function categoryName(id) {
    return i18n[lang].categories[id] || id;
  }

  function categoryIcon(id) {
    const name = categoryName(id);
    return (name.charAt(0) || "+").toUpperCase();
  }

  function formatMoney(n) {
    const abs = Math.abs(Math.round(n));
    if (lang === "vi") {
      return `${abs.toLocaleString("vi-VN")} ₫`;
    }
    return `${abs.toLocaleString("en-US")} ₫`;
  }

  function applyI18n() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (i18n[lang][key] != null) el.textContent = i18n[lang][key];
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (i18n[lang][key] != null) el.placeholder = i18n[lang][key];
    });
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });
    fillCategories();
    render();
  }

  function fillCategories() {
    const selected = els.category.value;
    const options = Object.entries(CATEGORIES)
      .filter(([, meta]) => meta.type === txType)
      .map(([id]) => `<option value="${id}">${categoryName(id)}</option>`)
      .join("");
    els.category.innerHTML = options;
    if (selected && CATEGORIES[selected]?.type === txType) {
      els.category.value = selected;
    }
  }

  function totals(list) {
    return list.reduce(
      (acc, tx) => {
        if (tx.type === "income") acc.income += tx.amount;
        else acc.expense += tx.amount;
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }

  function expenseByCategory(list) {
    const map = {};
    list
      .filter((tx) => tx.type === "expense")
      .forEach((tx) => {
        map[tx.category] = (map[tx.category] || 0) + tx.amount;
      });
    return Object.entries(map)
      .map(([id, amount]) => ({
        id,
        amount,
        color: CATEGORIES[id]?.color || "#90a4ae",
        name: categoryName(id),
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  function drawDonut(segments, total) {
    const canvas = els.donutChart;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const size = 260;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const radius = 98;
    const thickness = 34;

    if (!segments.length || total <= 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "#e5eef3";
      ctx.lineWidth = thickness;
      ctx.lineCap = "round";
      ctx.stroke();
      return;
    }

    let start = -Math.PI / 2;
    segments.forEach((seg, i) => {
      const angle = (seg.amount / total) * Math.PI * 2;
      const end = start + angle;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, start + 0.01, end - 0.01);
      ctx.strokeStyle = seg.color;
      ctx.lineWidth = thickness;
      ctx.lineCap = "round";
      ctx.stroke();

      // soft highlight
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 1, start + 0.04, end - 0.04);
      ctx.strokeStyle = `rgba(255,255,255,${0.12 + (i % 2) * 0.05})`;
      ctx.lineWidth = 6;
      ctx.stroke();

      start = end;
    });
  }

  function renderLegend(segments, total) {
    if (!segments.length) {
      els.legend.innerHTML = `<li class="legend-item"><span class="swatch" style="background:#d7e3ea"></span><span class="legend-name">${t("noExpense")}</span><span class="legend-amount">0 ₫</span><span class="legend-pct">0%</span></li>`;
      return;
    }

    els.legend.innerHTML = segments
      .map((seg) => {
        const pct = total ? Math.round((seg.amount / total) * 1000) / 10 : 0;
        return `
          <li class="legend-item">
            <span class="swatch" style="background:${seg.color}"></span>
            <span class="legend-name">${seg.name}</span>
            <span class="legend-amount">${formatMoney(seg.amount)}</span>
            <span class="legend-pct">${pct}%</span>
          </li>`;
      })
      .join("");
  }

  function renderList(list) {
    els.emptyState.classList.toggle("show", list.length === 0);
    els.txList.innerHTML = list
      .slice()
      .reverse()
      .map((tx) => {
        const meta = CATEGORIES[tx.category] || CATEGORIES.other;
        const sign = tx.type === "income" ? "+" : "−";
        return `
          <li class="tx-item">
            <div class="tx-icon" style="background:${meta.color}">${categoryIcon(tx.category)}</div>
            <div class="tx-meta">
              <strong>${tx.note}</strong>
              <span>${categoryName(tx.category)}</span>
            </div>
            <div class="tx-amount ${tx.type}">${sign}${formatMoney(tx.amount)}</div>
            <button type="button" class="tx-del" data-id="${tx.id}" aria-label="Delete">×</button>
          </li>`;
      })
      .join("");
  }

  function render() {
    const list = dayTx();
    const { income, expense } = totals(list);
    const segments = expenseByCategory(list);

    els.totalIncome.textContent = formatMoney(income);
    els.totalExpense.textContent = formatMoney(expense);
    els.balance.textContent = formatMoney(income - expense);
    els.donutTotal.textContent = formatMoney(expense);

    drawDonut(segments, expense);
    renderLegend(segments, expense);
    renderList(list);
  }

  function seedDemoIfEmpty() {
    const key = todayISO();
    if (store[key] && store[key].length) return;
    store[key] = [
      {
        id: crypto.randomUUID(),
        type: "income",
        category: "salary",
        note: lang === "vi" ? "Lương tháng" : "Monthly salary",
        amount: 12000000,
      },
      {
        id: crypto.randomUUID(),
        type: "expense",
        category: "food",
        note: lang === "vi" ? "Cơm trưa văn phòng" : "Office lunch",
        amount: 55000,
      },
      {
        id: crypto.randomUUID(),
        type: "expense",
        category: "transport",
        note: lang === "vi" ? "Grab đi làm" : "Ride to work",
        amount: 42000,
      },
      {
        id: crypto.randomUUID(),
        type: "expense",
        category: "shopping",
        note: lang === "vi" ? "Mua đồ dùng cá nhân" : "Personal items",
        amount: 180000,
      },
      {
        id: crypto.randomUUID(),
        type: "expense",
        category: "health",
        note: lang === "vi" ? "Vitamin & gym" : "Vitamins & gym",
        amount: 250000,
      },
      {
        id: crypto.randomUUID(),
        type: "expense",
        category: "living",
        note: lang === "vi" ? "Điện nước nhà" : "Utilities",
        amount: 320000,
      },
      {
        id: crypto.randomUUID(),
        type: "expense",
        category: "medical",
        note: lang === "vi" ? "Khám tổng quát" : "Check-up",
        amount: 450000,
      },
    ];
    saveStore();
  }

  // events
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      lang = btn.dataset.lang;
      localStorage.setItem("expense-lang", lang);
      applyI18n();
    });
  });

  document.querySelectorAll(".type-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      txType = btn.dataset.type;
      document.querySelectorAll(".type-btn").forEach((b) => {
        b.classList.toggle("active", b.dataset.type === txType);
      });
      fillCategories();
    });
  });

  els.dateInput.addEventListener("change", render);

  els.txForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const amount = Number(els.amount.value);
    const note = els.note.value.trim();
    const category = els.category.value;
    if (!note || !amount || amount <= 0 || !CATEGORIES[category]) return;

    const list = dayTx();
    list.push({
      id: crypto.randomUUID(),
      type: txType,
      category,
      note,
      amount: Math.round(amount),
    });
    setDayTx(list);
    els.txForm.reset();
    fillCategories();
    render();
  });

  els.txList.addEventListener("click", (e) => {
    const btn = e.target.closest(".tx-del");
    if (!btn) return;
    const id = btn.dataset.id;
    setDayTx(dayTx().filter((tx) => tx.id !== id));
    render();
  });

  els.clearDay.addEventListener("click", () => {
    if (!confirm(t("confirmClear"))) return;
    setDayTx([]);
    render();
  });

  // init
  els.dateInput.value = todayISO();
  seedDemoIfEmpty();
  applyI18n();
})();
