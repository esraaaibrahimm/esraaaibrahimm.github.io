/* Esraa Ibrahim — portfolio. No dependencies. */
(function () {
  "use strict";

  /* ---------- Light deterrents for copying images (cannot stop screenshots) ---------- */
  document.addEventListener("contextmenu", function (e) {
    if (e.target.tagName === "IMG" || (e.target.closest && e.target.closest("button.shot, dialog.lightbox"))) e.preventDefault();
  });
  document.addEventListener("dragstart", function (e) { if (e.target.tagName === "IMG") e.preventDefault(); });

  /* ---------- Lightbox for screenshots ---------- */
  var dialog = document.getElementById("lightbox");
  if (dialog && typeof dialog.showModal === "function") {
    var img = dialog.querySelector("img");
    var cap = dialog.querySelector("[data-cap]");
    document.addEventListener("click", function (e) {
      var btn = e.target.closest && e.target.closest("button.shot[data-full]");
      if (!btn) return;
      img.src = btn.getAttribute("data-full");
      img.alt = btn.getAttribute("data-alt") || "";
      cap.textContent = btn.getAttribute("data-caption") || "";
      dialog.showModal();
    });
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog || e.target.hasAttribute("data-close")) dialog.close();
    });
    dialog.addEventListener("close", function () { img.removeAttribute("src"); });
  } else {
    // Without <dialog>, the buttons simply open the image in a new tab.
    document.addEventListener("click", function (e) {
      var btn = e.target.closest && e.target.closest("button.shot[data-full]");
      if (btn) window.open(btn.getAttribute("data-full"), "_blank", "noopener");
    });
  }

  /* ---------- Typed search demo (home page only) ---------- */
  var demo = document.querySelector("[data-demo]");
  if (!demo) return;

  var answers;
  try { answers = JSON.parse(demo.getAttribute("data-answers")); } catch (err) { return; }
  if (!answers || !answers.length) return;

  var qEl = demo.querySelector("[data-q]");
  var engineEl = demo.querySelector("[data-engine]");
  var answerEl = demo.querySelector("[data-answer]");
  var nameEl = demo.querySelector("[data-name]");
  var urlEl = demo.querySelector("[data-url]");
  var lineEl = demo.querySelector("[data-line]");
  var linkEl = demo.querySelector("[data-link]");
  var pauseBtn = demo.querySelector("[data-pause]");

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {            // keep the static first example, no animation
    if (pauseBtn) pauseBtn.hidden = true;
    return;
  }

  var index = 0, timer = null, paused = false;

  function later(fn, ms) { timer = window.setTimeout(fn, ms); }

  function show(a) {
    nameEl.textContent = a.client;
    urlEl.textContent = a.domain;
    lineEl.textContent = a.line;
    linkEl.setAttribute("href", a.href);
    answerEl.classList.remove("is-hidden", "is-in");
    void answerEl.offsetWidth;           // restart the entrance animation
    answerEl.classList.add("is-in");
  }

  function run() {
    if (paused) return;
    var a = answers[index];
    var i = 0;
    answerEl.classList.add("is-hidden");
    answerEl.classList.remove("is-in");
    qEl.setAttribute("dir", a.rtl ? "rtl" : "ltr");
    qEl.textContent = "";
    engineEl.textContent = a.engine;
    (function type() {
      if (paused) return;
      i += 1;
      qEl.textContent = a.query.slice(0, i);
      if (i < a.query.length) { later(type, 38); return; }
      later(function () {
        show(a);
        later(function () {
          index = (index + 1) % answers.length;
          run();
        }, 5200);
      }, 450);
    })();
  }

  function setPaused(p) {
    paused = p;
    if (pauseBtn) pauseBtn.textContent = p ? "Play examples" : "Pause examples";
    window.clearTimeout(timer);
    if (!p) {
      // finish showing the current answer, then move on
      later(function () { index = (index + 1) % answers.length; run(); }, 600);
    } else {
      show(answers[index]);
      qEl.textContent = answers[index].query;
    }
  }

  if (pauseBtn) pauseBtn.addEventListener("click", function () { setPaused(!paused); });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { window.clearTimeout(timer); }
    else if (!paused) { run(); }
  });

  // start after the first static example has been readable for a moment
  later(function () { index = 1; run(); }, 3200);
})();
