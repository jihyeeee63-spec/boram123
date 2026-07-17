(() => {
  const STORAGE_KEY = "topik-ii-results-v1";
  const TOTAL_TIME = 40 * 60; // 40 minutes
  const PER_SECTION = 5;
  const SECTIONS = ["vocab", "grammar", "reading", "listening"];
  const SECTION_LABEL = {
    vocab: "어휘",
    grammar: "문법",
    reading: "읽기",
    listening: "듣기",
  };
  const CHOICE_KEYS = ["A", "B", "C", "D"];

  const els = {
    start: document.getElementById("screenStart"),
    quiz: document.getElementById("screenQuiz"),
    result: document.getElementById("screenResult"),
    history: document.getElementById("screenHistory"),
    btnStart: document.getElementById("btnStart"),
    btnShowHistory: document.getElementById("btnShowHistory"),
    btnSubmitEarly: document.getElementById("btnSubmitEarly"),
    btnPrev: document.getElementById("btnPrev"),
    btnNext: document.getElementById("btnNext"),
    btnPlayAudio: document.getElementById("btnPlayAudio"),
    btnRetry: document.getElementById("btnRetry"),
    btnToHistory: document.getElementById("btnToHistory"),
    btnHome: document.getElementById("btnHome"),
    btnClearHistory: document.getElementById("btnClearHistory"),
    btnHistoryStart: document.getElementById("btnHistoryStart"),
    btnHistoryHome: document.getElementById("btnHistoryHome"),
    timer: document.getElementById("timer"),
    sectionLabel: document.getElementById("sectionLabel"),
    progressText: document.getElementById("progressText"),
    answeredText: document.getElementById("answeredText"),
    progressFill: document.getElementById("progressFill"),
    qNav: document.getElementById("qNav"),
    qNum: document.getElementById("qNum"),
    qStem: document.getElementById("qStem"),
    qPassage: document.getElementById("qPassage"),
    listenBox: document.getElementById("listenBox"),
    choices: document.getElementById("choices"),
    sectionPill: document.getElementById("sectionPill"),
    resultLang: document.getElementById("resultLang"),
    scoreRing: document.getElementById("scoreRing"),
    statScore: document.getElementById("statScore"),
    statCorrect: document.getElementById("statCorrect"),
    statWrong: document.getElementById("statWrong"),
    statBlank: document.getElementById("statBlank"),
    sectionStats: document.getElementById("sectionStats"),
    reviewList: document.getElementById("reviewList"),
    historyList: document.getElementById("historyList"),
  };

  const SECTION_PILL_CLASS = {
    vocab: "vocab",
    grammar: "grammar",
    reading: "reading",
    listening: "listening",
  };

  let exam = [];
  let answers = [];
  let current = 0;
  let left = TOTAL_TIME;
  let timerId = null;
  let lastResult = null;
  let explainLang = localStorage.getItem("topik-explain-lang") || "ko";

  function show(screen) {
    [els.start, els.quiz, els.result, els.history].forEach((s) => s.classList.remove("active"));
    screen.classList.add("active");
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pickExam() {
    const bank = window.TOPIK_BANK || [];
    const picked = [];
    SECTIONS.forEach((sec) => {
      const pool = shuffle(bank.filter((q) => q.section === sec));
      picked.push(...pool.slice(0, PER_SECTION));
    });
    return picked;
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function answeredCount() {
    return answers.filter((a) => a != null).length;
  }

  function stopTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function startTimer() {
    stopTimer();
    left = TOTAL_TIME;
    updateTimerUI();
    timerId = setInterval(() => {
      left -= 1;
      updateTimerUI();
      if (left <= 0) {
        stopTimer();
        finishExam(true);
      }
    }, 1000);
  }

  function updateTimerUI() {
    els.timer.textContent = formatTime(Math.max(0, left));
    els.timer.classList.toggle("warn", left <= 5 * 60 && left > 60);
    els.timer.classList.toggle("danger", left <= 60);
  }

  function renderNav() {
    els.qNav.innerHTML = exam
      .map((q, i) => {
        const classes = ["q-dot"];
        if (i === current) classes.push("current");
        if (answers[i] != null) classes.push("answered");
        if ((i + 1) % PER_SECTION === 0 && i !== exam.length - 1) classes.push("section-end");
        return `<button type="button" class="${classes.join(" ")}" data-idx="${i}" title="${SECTION_LABEL[q.section]}">${i + 1}</button>`;
      })
      .join("");
  }

  function renderQuestion() {
    const q = exam[current];
    if (!q) return;

    els.sectionLabel.textContent = SECTION_LABEL[q.section];
    if (els.sectionPill) {
      els.sectionPill.textContent = SECTION_LABEL[q.section];
      els.sectionPill.className = `section-pill ${SECTION_PILL_CLASS[q.section] || ""}`;
    }
    els.qNum.textContent = `문제 ${current + 1} · ${q.level}급`;
    els.qStem.textContent = q.stem;
    els.qPassage.innerHTML = q.passage || "";
    els.listenBox.classList.toggle("hidden", q.section !== "listening");

    els.choices.innerHTML = q.choices
      .map((text, i) => {
        const selected = answers[current] === i ? "selected" : "";
        return `
          <button type="button" class="choice ${selected}" data-choice="${i}">
            <span class="key">${CHOICE_KEYS[i]}</span>
            <span>${text}</span>
          </button>`;
      })
      .join("");

    els.btnPrev.disabled = current === 0;
    els.btnNext.textContent = current === exam.length - 1 ? "제출하기" : "다음";

    const pct = ((current + 1) / exam.length) * 100;
    els.progressFill.style.width = `${pct}%`;
    els.progressText.textContent = `${current + 1} / ${exam.length}`;
    els.answeredText.textContent = `응답 ${answeredCount()}`;
    renderNav();
  }

  function playListening() {
    const q = exam[current];
    if (!q || !q.audioText) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(q.audioText);
    utter.lang = "ko-KR";
    utter.rate = 0.92;
    const voices = window.speechSynthesis.getVoices();
    const ko = voices.find((v) => v.lang.startsWith("ko"));
    if (ko) utter.voice = ko;
    window.speechSynthesis.speak(utter);
  }

  function startExam() {
    exam = pickExam();
    if (exam.length < SECTIONS.length * PER_SECTION) {
      alert("문제 은행이 부족합니다. questions.js를 확인해 주세요.");
      return;
    }
    answers = Array(exam.length).fill(null);
    current = 0;
    show(els.quiz);
    startTimer();
    renderQuestion();
  }

  function grade() {
    let correct = 0;
    let wrong = 0;
    let blank = 0;
    const bySection = {};
    SECTIONS.forEach((s) => {
      bySection[s] = { correct: 0, total: 0 };
    });

    const details = exam.map((q, i) => {
      const user = answers[i];
      bySection[q.section].total += 1;
      let status = "blank";
      if (user == null) {
        blank += 1;
      } else if (user === q.answer) {
        correct += 1;
        bySection[q.section].correct += 1;
        status = "correct";
      } else {
        wrong += 1;
        status = "wrong";
      }
      return { q, user, status };
    });

    const percent = Math.round((correct / exam.length) * 100);
    return {
      correct,
      wrong,
      blank,
      percent,
      bySection,
      details,
      total: exam.length,
      date: new Date().toISOString(),
      usedSeconds: TOTAL_TIME - Math.max(0, left),
    };
  }

  function saveResult(result) {
    const list = loadHistory();
    list.unshift({
      date: result.date,
      percent: result.percent,
      correct: result.correct,
      wrong: result.wrong,
      blank: result.blank,
      total: result.total,
      bySection: result.bySection,
      usedSeconds: result.usedSeconds,
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 30)));
  }

  function loadHistory() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function finishExam(auto = false) {
    window.speechSynthesis.cancel();
    if (!auto) {
      const unanswered = exam.length - answeredCount();
      const msg =
        unanswered > 0
          ? `아직 ${unanswered}문제에 응답하지 않았습니다. 제출하시겠습니까?`
          : "시험을 제출하시겠습니까?";
      if (!confirm(msg)) return;
    }
    stopTimer();
    lastResult = grade();
    saveResult(lastResult);
    renderResult();
    show(els.result);
  }

  function renderResult() {
    if (!lastResult) return;
    els.resultLang.value = explainLang;
    els.statScore.textContent = `${lastResult.percent}%`;
    if (els.scoreRing) els.scoreRing.style.setProperty("--p", String(lastResult.percent));
    els.statCorrect.textContent = lastResult.correct;
    els.statWrong.textContent = lastResult.wrong;
    els.statBlank.textContent = lastResult.blank;

    els.sectionStats.innerHTML = SECTIONS.map((s) => {
      const st = lastResult.bySection[s];
      const pct = st.total ? Math.round((st.correct / st.total) * 100) : 0;
      return `<div class="sec-pill">${SECTION_LABEL[s]}<strong>${st.correct}/${st.total} · ${pct}%</strong></div>`;
    }).join("");

    const labels = {
      correct: { ko: "정답", vi: "Đúng", en: "Correct", zh: "正确", ja: "正解" },
      wrong: { ko: "오답", vi: "Sai", en: "Wrong", zh: "错误", ja: "不正解" },
      blank: { ko: "미응답", vi: "Chưa chọn", en: "Blank", zh: "未作答", ja: "未回答" },
      your: { ko: "내 답", vi: "Bạn chọn", en: "Your answer", zh: "你的答案", ja: "あなたの答え" },
      right: { ko: "정답", vi: "Đáp án đúng", en: "Correct answer", zh: "正确答案", ja: "正解" },
      why: { ko: "해설", vi: "Giải thích", en: "Explanation", zh: "解析", ja: "解説" },
    };

    els.reviewList.innerHTML = lastResult.details
      .map(({ q, user, status }, i) => {
        const tagClass = status === "correct" ? "ok" : status === "wrong" ? "bad" : "";
        const userText = user == null ? "-" : `${CHOICE_KEYS[user]}. ${q.choices[user]}`;
        const rightText = `${CHOICE_KEYS[q.answer]}. ${q.choices[q.answer]}`;
        const exp = (q.explain && q.explain[explainLang]) || q.explain.ko;
        return `
          <article class="review-item ${status}">
            <div class="review-top">
              <span class="tag">${i + 1}. ${SECTION_LABEL[q.section]}</span>
              <span class="tag ${tagClass}">${labels[status][explainLang] || labels[status].ko}</span>
            </div>
            <p class="stem">${q.stem}</p>
            <p class="meta"><strong>${labels.your[explainLang]}:</strong> ${userText}</p>
            <p class="meta"><strong>${labels.right[explainLang]}:</strong> ${rightText}</p>
            <p class="explain"><strong>${labels.why[explainLang]}:</strong> ${exp}</p>
          </article>`;
      })
      .join("");
  }

  function renderHistory() {
    const list = loadHistory();
    if (!list.length) {
      els.historyList.innerHTML = `<li class="empty-note">저장된 결과가 없습니다.</li>`;
      return;
    }
    els.historyList.innerHTML = list
      .map((r) => {
        const d = new Date(r.date);
        const when = d.toLocaleString("ko-KR");
        const mins = Math.floor((r.usedSeconds || 0) / 60);
        const secs = (r.usedSeconds || 0) % 60;
        return `
          <li class="history-item">
            <div>
              <strong>${r.percent}% · ${r.correct}/${r.total}</strong>
              <span>${when} · 소요 ${mins}분 ${secs}초 · 오답 ${r.wrong} · 미응답 ${r.blank}</span>
            </div>
            <em>${r.percent}%</em>
          </li>`;
      })
      .join("");
  }

  // events
  els.btnStart.addEventListener("click", startExam);
  els.btnHistoryStart.addEventListener("click", startExam);
  els.btnRetry.addEventListener("click", startExam);

  els.btnShowHistory.addEventListener("click", () => {
    renderHistory();
    show(els.history);
  });
  els.btnToHistory.addEventListener("click", () => {
    renderHistory();
    show(els.history);
  });
  els.btnHome.addEventListener("click", () => show(els.start));
  els.btnHistoryHome.addEventListener("click", () => show(els.start));

  els.btnClearHistory.addEventListener("click", () => {
    if (!confirm("모든 결과 기록을 삭제하시겠습니까?")) return;
    localStorage.removeItem(STORAGE_KEY);
    renderHistory();
  });

  els.btnPrev.addEventListener("click", () => {
    if (current > 0) {
      current -= 1;
      renderQuestion();
    }
  });

  els.btnNext.addEventListener("click", () => {
    if (current === exam.length - 1) {
      finishExam(false);
      return;
    }
    current += 1;
    renderQuestion();
  });

  els.btnSubmitEarly.addEventListener("click", () => finishExam(false));

  els.choices.addEventListener("click", (e) => {
    const btn = e.target.closest(".choice");
    if (!btn) return;
    answers[current] = Number(btn.dataset.choice);
    renderQuestion();
  });

  els.qNav.addEventListener("click", (e) => {
    const btn = e.target.closest(".q-dot");
    if (!btn) return;
    current = Number(btn.dataset.idx);
    renderQuestion();
  });

  els.btnPlayAudio.addEventListener("click", playListening);

  els.resultLang.addEventListener("change", () => {
    explainLang = els.resultLang.value;
    localStorage.setItem("topik-explain-lang", explainLang);
    renderResult();
  });

  // preload voices for listening TTS
  if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }
})();
