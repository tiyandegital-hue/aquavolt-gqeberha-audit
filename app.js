/* AquaVolt Group audit dossier — behaviour.
   ONE swappable constant: change BUSINESS_NAME here and every mention
   on all three pages updates (default matches the literal copy). */
(function () {
  "use strict";

  var BUSINESS_NAME = "AquaVolt Group";
  var DEFAULT_NAME = "AquaVolt Group";

  document.documentElement.classList.add("js");

  /* Apply the business-name constant across text nodes, titles and meta. */
  function applyBusinessName() {
    if (BUSINESS_NAME === DEFAULT_NAME) return; // literal copy already matches
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (n) {
      if (n.nodeValue.indexOf(DEFAULT_NAME) !== -1) {
        n.nodeValue = n.nodeValue.split(DEFAULT_NAME).join(BUSINESS_NAME);
      }
    });
    if (document.title.indexOf(DEFAULT_NAME) !== -1) {
      document.title = document.title.split(DEFAULT_NAME).join(BUSINESS_NAME);
    }
    document.querySelectorAll('meta[name="description"]').forEach(function (m) {
      var c = m.getAttribute("content") || "";
      if (c.indexOf(DEFAULT_NAME) !== -1) m.setAttribute("content", c.split(DEFAULT_NAME).join(BUSINESS_NAME));
    });
  }
  applyBusinessName();

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Entrance reveals — rest state stays visible if JS fails (CSS gates on .js). */
  var revealEls = document.querySelectorAll(".reveal");
  var heroH1 = document.querySelector(".hero h1");
  var scorecard = document.querySelector(".scorecard");
  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
    if (scorecard) io.observe(scorecard);
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
    if (scorecard) scorecard.classList.add("in");
  }
  if (heroH1) {
    // Masked line rise: fire once the hero paints.
    requestAnimationFrame(function () { heroH1.classList.add("in"); });
  }

  /* Count-up numbers: data-count="90" data-decimals="1" data-prefix / data-suffix. */
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduced || !isFinite(target)) {
      el.textContent = prefix + target.toFixed(decimals) + suffix;
      return;
    }
    var start = null, dur = 1100;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && !reduced) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(countUp);
  }

  /* Smooth-scroll for in-page anchors (jump to findings). */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (ev) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var t = document.querySelector(id);
      if (!t) return;
      ev.preventDefault();
      t.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      t.setAttribute("tabindex", "-1");
      t.focus({ preventScroll: true });
    });
  });
})();
