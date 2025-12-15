(() => {
  "use strict";

  // ===== Helpers =====
  const $ = (sel) => document.querySelector(sel);

  const isLettersOnly = (val) => /^[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž\s-]+$/.test(val.trim());
  const isEmailValid = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val.trim());

  // LT formatas: +370 6XX XXXXX (viso 11 skaitmenų: 370 + 8 sk.)
  function normalizeDigits(raw) {
    return (raw || "").replace(/\D/g, "");
  }

  function formatLTPhone(rawDigits) {
    let d = normalizeDigits(rawDigits);

    // leidžiam įvesti: 6xxxxxxx arba 3706xxxxxxx
    if (d.startsWith("00")) d = d.slice(2);
    if (d.startsWith("370")) {
      // ok
    } else if (d.startsWith("6")) {
      d = "370" + d;
    }

    // max 11 skaitmenų (370 + 8)
    d = d.slice(0, 11);

    // sudėliojam su tarpais: +370 6XX XXXXX
    if (!d.startsWith("370")) return d; // neformatuojam, kol neaišku

    const country = d.slice(0, 3);
    const rest = d.slice(3); // iki 8 skaitmenų
    const a = rest.slice(0, 1); // 6
    const b = rest.slice(1, 3); // XX
    const c = rest.slice(3, 8); // XXXXX

    let out = `+${country}`;
    if (rest.length > 0) out += ` ${a}`;
    if (rest.length > 1) out += `${b}`;
    if (rest.length > 3) out += ` ${c}`;
    return out.trim();
  }

  function isLTPhoneValid(formattedOrRaw) {
    const d = normalizeDigits(formattedOrRaw);
    return d.length === 11 && d.startsWith("3706");
  }

  function setFieldState(inputEl, errorEl, ok, msg) {
    if (!inputEl || !errorEl) return;
    inputEl.classList.toggle("is-invalid", !ok);
    inputEl.classList.toggle("is-valid", ok);
    errorEl.textContent = ok ? "" : (msg || "Neteisinga reikšmė");
  }

  function showPopup() {
    const popup = $("#popupMessage");
    if (!popup) return;
    popup.classList.add("show");
    window.setTimeout(() => popup.classList.remove("show"), 2500);
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
  function escapeAttr(str) {
    return escapeHtml(str).replaceAll("`", "&#096;");
  }

  // ===== Existing page behaviors (moved from inline script) =====

  // 1. Pre-loader animacija
  window.addEventListener("load", function () {
    const preloader = document.getElementById("preloader");
    if (!preloader) return;
    setTimeout(() => {
      preloader.style.opacity = "0";
      preloader.style.visibility = "hidden";
    }, 1000);
  });

  // 2. Fade-in sekcijų animacija
  const fadeInSections = document.querySelectorAll(".fade-in-section");
  const appearOptions = { threshold: 0.1, rootMargin: "0px 0px -100px 0px" };
  const appearOnScroll = new IntersectionObserver(function (entries, obs) {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      obs.unobserve(entry.target);
    });
  }, appearOptions);
  fadeInSections.forEach((section) => appearOnScroll.observe(section));

  // 3. Portfolio item animacija
  const portfolioItems = document.querySelectorAll(".portfolio-item");
  const portfolioObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("animate");
        portfolioObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.1 }
  );
  portfolioItems.forEach((item) => portfolioObserver.observe(item));

  // 4. Scroll navigacijai + back-to-top
  window.addEventListener("scroll", function () {
    const navbar = document.querySelector(".navbar");
    const backToTop = document.getElementById("backToTop");
    if (window.scrollY > 100) {
      navbar?.classList.add("scrolled");
      backToTop?.classList.add("show");
    } else {
      navbar?.classList.remove("scrolled");
      backToTop?.classList.remove("show");
    }
  });

  // 5. "Į viršų" mygtuko funkcionalumas
  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("backToTop");
    btn?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  });

  // 6. Įgūdžių animacija
  function animateSkills() {
    const skillBars = document.querySelectorAll(".skill-progress");
    skillBars.forEach((bar) => {
      const width = bar.style.width;
      bar.style.width = "0";
      setTimeout(() => {
        bar.style.width = width;
      }, 500);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const skillsSection = document.getElementById("skills");
    if (!skillsSection) return;
    const skillsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateSkills();
        skillsObserver.unobserve(entry.target);
      });
    });
    skillsObserver.observe(skillsSection);
  });

  // 7. Active navigacijos nuoroda
  document.addEventListener("DOMContentLoaded", function () {
    const navLinks = document.querySelectorAll(".nav-link");

    function setActiveLink() {
      let current = "";
      const sections = document.querySelectorAll("section");

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - 200) current = section.getAttribute("id");
      });

      navLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === "#" + current) link.classList.add("active");
      });
    }

    window.addEventListener("scroll", setActiveLink);
    setActiveLink();
  });

  // 8. Media elementų valdymas
  document.addEventListener("DOMContentLoaded", function () {
    const videos = document.querySelectorAll("video");
    videos.forEach((video) => {
      video.removeAttribute("autoplay");
      video.controls = true;
    });
  });

  // ===== 11 lab: Contact form logic =====
  document.addEventListener("DOMContentLoaded", () => {
    const form = $("#contactForm");
    if (!form) return;

    const firstName = $("#firstName");
    const lastName = $("#lastName");
    const email = $("#email");
    const phone = $("#phone");
    const address = $("#address");

    const q1 = $("#q1");
    const q2 = $("#q2");
    const q3 = $("#q3");

    const q1Value = $("#q1Value");
    const q2Value = $("#q2Value");
    const q3Value = $("#q3Value");

    const submitBtn = $("#submitBtn");
    const resultBox = $("#formResult");

    const updateRatingUI = () => {
      if (q1Value) q1Value.textContent = q1.value;
      if (q2Value) q2Value.textContent = q2.value;
      if (q3Value) q3Value.textContent = q3.value;
    };
    updateRatingUI();
    [q1, q2, q3].forEach((q) => q.addEventListener("input", updateRatingUI));

    phone?.addEventListener("input", () => {
      const raw = phone.value;
      phone.value = formatLTPhone(raw);
      phone.setSelectionRange(phone.value.length, phone.value.length);
      validateAll();
    });

    [firstName, lastName, email, address, q1, q2, q3].forEach((el) => {
      el?.addEventListener("input", validateAll);
      el?.addEventListener("blur", validateAll);
    });

    function validateAll() {
      const fnOk = firstName.value.trim().length > 0 && isLettersOnly(firstName.value);
      setFieldState(firstName, $("#firstNameError"), fnOk, "Vardas turi būti tik iš raidžių.");

      const lnOk = lastName.value.trim().length > 0 && isLettersOnly(lastName.value);
      setFieldState(lastName, $("#lastNameError"), lnOk, "Pavardė turi būti tik iš raidžių.");

      const emOk = email.value.trim().length > 0 && isEmailValid(email.value);
      setFieldState(email, $("#emailError"), emOk, "Neteisingas el. pašto formatas.");

      const phOk = phone.value.trim().length > 0 && isLTPhoneValid(phone.value);
      setFieldState(phone, $("#phoneError"), phOk, "Telefonas turi būti formato +370 6XX XXXXX.");

      const adOk = address.value.trim().length > 0;
      setFieldState(address, $("#addressError"), adOk, "Adresas negali būti tuščias.");

      const q1Ok = Number(q1.value) >= 1 && Number(q1.value) <= 10;
      const q2Ok = Number(q2.value) >= 1 && Number(q2.value) <= 10;
      const q3Ok = Number(q3.value) >= 1 && Number(q3.value) <= 10;

      setFieldState(q1, $("#q1Error"), q1Ok, "Reikšmė 1–10");
      setFieldState(q2, $("#q2Error"), q2Ok, "Reikšmė 1–10");
      setFieldState(q3, $("#q3Error"), q3Ok, "Reikšmė 1–10");

      const allOk = fnOk && lnOk && emOk && phOk && adOk && q1Ok && q2Ok && q3Ok;
      if (submitBtn) submitBtn.disabled = !allOk;
      return allOk;
    }

    validateAll();

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validateAll()) return;

      const formData = {
        vardas: firstName.value.trim(),
        pavarde: lastName.value.trim(),
        el_pastas: email.value.trim(),
        tel_numeris: phone.value.trim(),
        adresas: address.value.trim(),
        vertinimai: {
          klausimas1: Number(q1.value),
          klausimas2: Number(q2.value),
          klausimas3: Number(q3.value),
        },
      };

      console.log("Kontaktų formos duomenys:", formData);

      const avg =
        (formData.vertinimai.klausimas1 +
          formData.vertinimai.klausimas2 +
          formData.vertinimai.klausimas3) / 3;

      if (resultBox) {
        resultBox.style.display = "block";
        resultBox.innerHTML = `
          <div class="result-card">
            <div><strong>Vardas:</strong> ${escapeHtml(formData.vardas)}</div>
            <div><strong>Pavardė:</strong> ${escapeHtml(formData.pavarde)}</div>
            <div><strong>El. paštas:</strong> <a class="custom-link" href="mailto:${escapeAttr(formData.el_pastas)}">${escapeHtml(formData.el_pastas)}</a></div>
            <div><strong>Tel. numeris:</strong> ${escapeHtml(formData.tel_numeris)}</div>
            <div><strong>Adresas:</strong> ${escapeHtml(formData.adresas)}</div>
            <hr class="my-3">
            <div><strong>Vertinimai:</strong> ${formData.vertinimai.klausimas1}, ${formData.vertinimai.klausimas2}, ${formData.vertinimai.klausimas3}</div>
            <div class="mt-2"><strong>${escapeHtml(formData.vardas)} ${escapeHtml(formData.pavarde)}: vidurkis</strong> ${avg.toFixed(1)}</div>
          </div>
        `;
      }

      showPopup();

      form.reset();
      q1.value = 5; q2.value = 5; q3.value = 5;
      updateRatingUI();

      ["is-valid", "is-invalid"].forEach((cls) => {
        [firstName, lastName, email, phone, address, q1, q2, q3].forEach((el) => el.classList.remove(cls));
      });
      validateAll();
    });
  });


  // ===== 12 LAB: Memory (Flip Card) Game =====
  const gameEls = {
    difficulty: document.getElementById("difficulty"),
    startBtn: document.getElementById("startGame"),
    resetBtn: document.getElementById("resetGame"),
    board: document.getElementById("board"),
    winMessage: document.getElementById("winMessage"),
    moves: document.getElementById("moves"),
    matches: document.getElementById("matches"),
    timer: document.getElementById("timer"),
    bestScore: document.getElementById("bestScore"),
  };

  const iconPool = [
    "fa-bolt","fa-heart","fa-star","fa-moon","fa-sun","fa-leaf","fa-gem","fa-car",
    "fa-robot","fa-code","fa-music","fa-camera","fa-plane","fa-gamepad","fa-microchip",
    "fa-book","fa-basketball","fa-football","fa-futbol","fa-fire","fa-snowflake","fa-cloud"
  ];

  let state = {
    started: false,
    lock: false,
    first: null,
    second: null,
    moves: 0,
    matches: 0,
    totalPairs: 0,
    timerId: null,
    seconds: 0,
    difficulty: "easy",
  };

  function formatTime(sec){
    const m = String(Math.floor(sec/60)).padStart(2,"0");
    const s = String(sec%60).padStart(2,"0");
    return `${m}:${s}`;
  }

  function stopTimer(){
    if(state.timerId){
      clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  function startTimer(){
    if(state.timerId) return;
    state.timerId = setInterval(() => {
      state.seconds += 1;
      if(gameEls.timer) gameEls.timer.textContent = formatTime(state.seconds);
    }, 1000);
  }

  function resetStats(){
    state.moves = 0;
    state.matches = 0;
    state.seconds = 0;
    stopTimer();
    if(gameEls.moves) gameEls.moves.textContent = "0";
    if(gameEls.matches) gameEls.matches.textContent = "0";
    if(gameEls.timer) gameEls.timer.textContent = "00:00";
    if(gameEls.winMessage){
      gameEls.winMessage.classList.remove("show");
      gameEls.winMessage.textContent = "";
    }
  }

  function getBestKey(diff){
    return `memory_best_${diff}`;
  }

  function readBest(diff){
    try{
      const raw = localStorage.getItem(getBestKey(diff));
      return raw ? JSON.parse(raw) : null;
    }catch(e){
      return null;
    }
  }

  function writeBest(diff, data){
    try{
      localStorage.setItem(getBestKey(diff), JSON.stringify(data));
    }catch(e){ /* ignore */ }
  }

  function renderBest(){
    if(!gameEls.bestScore) return;
    const best = readBest(state.difficulty);
    if(!best){
      gameEls.bestScore.textContent = "—";
      return;
    }
    gameEls.bestScore.textContent = `${best.moves} ėj., ${best.time}`;
  }

  function shuffle(arr){
    for(let i=arr.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [arr[i],arr[j]] = [arr[j],arr[i]];
    }
    return arr;
  }

  function pickIcons(pairCount){
    const uniq = shuffle(iconPool.slice()).slice(0, pairCount);
    return shuffle([...uniq, ...uniq]);
  }

  function buildBoard(diff){
    if(!gameEls.board) return;

    state.difficulty = diff;
    const isEasy = diff === "easy";
    const cols = isEasy ? 4 : 6;
    const rows = isEasy ? 3 : 4;
    const cardCount = cols * rows;
    state.totalPairs = cardCount / 2;

    // styles
    gameEls.board.classList.remove("easy","hard");
    gameEls.board.classList.add(isEasy ? "easy" : "hard");

    const icons = pickIcons(state.totalPairs);
    gameEls.board.innerHTML = "";

    icons.forEach((icon, idx) => {
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = "card-tile";
      tile.setAttribute("aria-label", "Kortelė");
      tile.dataset.icon = icon;
      tile.dataset.index = String(idx);

      const front = document.createElement("div");
      front.className = "card-face card-front";
      front.textContent = "?";

      const back = document.createElement("div");
      back.className = "card-face card-back";
      back.innerHTML = `<i class="fa-solid ${icon}"></i>`;

      tile.appendChild(front);
      tile.appendChild(back);

      tile.addEventListener("click", () => onFlip(tile));
      gameEls.board.appendChild(tile);
    });

    state.started = true;
    state.lock = false;
    state.first = null;
    state.second = null;

    resetStats();
    renderBest();
  }

  function onFlip(tile){
    if(!state.started || state.lock) return;
    if(tile.classList.contains("is-flipped") || tile.classList.contains("is-matched")) return;

    // timer starts on first valid flip
    if(state.moves === 0 && state.matches === 0 && state.seconds === 0 && !state.timerId){
      startTimer();
    }

    tile.classList.add("is-flipped");

    if(!state.first){
      state.first = tile;
      return;
    }

    state.second = tile;
    state.lock = true;

    // count move when second card opened
    state.moves += 1;
    if(gameEls.moves) gameEls.moves.textContent = String(state.moves);

    const match = state.first.dataset.icon === state.second.dataset.icon;

    if(match){
      state.first.classList.add("is-matched");
      state.second.classList.add("is-matched");
      state.matches += 1;
      if(gameEls.matches) gameEls.matches.textContent = String(state.matches);

      state.first = null;
      state.second = null;
      state.lock = false;

      if(state.matches === state.totalPairs){
        stopTimer();
        showWinAndSaveBest();
      }
      return;
    }

    // not match -> flip back after 1s
    setTimeout(() => {
      if(state.first) state.first.classList.remove("is-flipped");
      if(state.second) state.second.classList.remove("is-flipped");
      state.first = null;
      state.second = null;
      state.lock = false;
    }, 1000);
  }

  function showWinAndSaveBest(){
    if(gameEls.winMessage){
      gameEls.winMessage.textContent = "Laimėjote! 🎉";
      gameEls.winMessage.classList.add("show");
    }

    const time = formatTime(state.seconds);
    const current = { moves: state.moves, time, seconds: state.seconds };

    const best = readBest(state.difficulty);
    let isBetter = false;
    if(!best){
      isBetter = true;
    }else if(current.moves < best.moves){
      isBetter = true;
    }else if(current.moves === best.moves && current.seconds < best.seconds){
      isBetter = true;
    }

    if(isBetter){
      writeBest(state.difficulty, current);
      renderBest();
    }
  }

  // Buttons / difficulty
  if(gameEls.startBtn && gameEls.board){
    gameEls.startBtn.addEventListener("click", () => {
      const diff = gameEls.difficulty ? gameEls.difficulty.value : "easy";
      buildBoard(diff);
    });
  }

  if(gameEls.resetBtn && gameEls.board){
    gameEls.resetBtn.addEventListener("click", () => {
      const diff = gameEls.difficulty ? gameEls.difficulty.value : state.difficulty;
      buildBoard(diff);
    });
  }

  if(gameEls.difficulty){
    gameEls.difficulty.addEventListener("change", () => {
      // perjungus sudėtingumą – užkraunam naują lentą
      if(state.started){
        buildBoard(gameEls.difficulty.value);
      }else{
        state.difficulty = gameEls.difficulty.value;
        renderBest();
      }
    });
  }

  // initial best display
  if(gameEls.bestScore){
    renderBest();
  }

})();
