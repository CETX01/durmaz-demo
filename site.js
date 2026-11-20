/* Durmaz Avukatlık Bürosu – sitenin küçük etkileşimleri (menü, kaydırıcı, sekmeler, yayın filtresi, form). Kütüphane yok. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var on = function (name, ev, fn) { $$('[data-on="' + name + '"]').forEach(function (el) { el.addEventListener(ev, fn); }); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var INK = "#0A0A0B";

  /* Mobil menü */
  var drawer = $("#dz-drawer"), menuBtn = $('[data-on="openMenu"]');
  function openMenu() {
    if (!drawer) return;
    drawer.hidden = false; document.body.style.overflow = "hidden";
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "true");
    var c = $('[data-on="closeMenu"]'); if (c) c.focus();
  }
  function closeMenu() {
    if (!drawer) return;
    drawer.hidden = true; document.body.style.overflow = "";
    if (menuBtn) { menuBtn.setAttribute("aria-expanded", "false"); menuBtn.focus(); }
  }
  on("openMenu", "click", openMenu);
  on("closeMenu", "click", closeMenu);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && drawer && !drawer.hidden) closeMenu(); });

  /* Anasayfa cümle kaydırıcısı */
  var STATEMENTS = ["Ticaret hukuku başta olmak üzere özel hukukun bütün dallarında yerli ve yabancı müvekkillere danışmanlık veriyoruz.", "Şirket kuruluşundan birleşme ve devralmalara, uyuşmazlık çözümünden uyuma kadar işinizin her aşamasındayız.", "Akademik birikimimizi Akaretler’deki ofisimizden günlük hukuki çözümlere taşıyoruz."];
  var st = $('[data-dz="statement"]');
  if (st) {
    var i = 0, num = $('[data-dz="num"]'), bar = $('[data-dz="progress"]'), timer = null;
    var show = function (n) { i = (n + STATEMENTS.length) % STATEMENTS.length; st.textContent = STATEMENTS[i]; num.textContent = i + 1; bar.style.width = Math.round((i + 1) / STATEMENTS.length * 100) + "%"; };
    var stop = function () { if (timer) { clearInterval(timer); timer = null; } };
    if (!reduce) timer = setInterval(function () { show(i + 1); }, 7000);
    on("prev", "click", function () { stop(); show(i - 1); });
    on("next", "click", function () { stop(); show(i + 1); });
  }

  /* Makaleler / Duyurular sekmeleri */
  function tab(k) {
    $$("[data-tab]").forEach(function (p) { p.hidden = p.getAttribute("data-tab") !== k; });
    [["showMakale", "makale"], ["showDuyuru", "duyuru"]].forEach(function (x) {
      $$('[data-on="' + x[0] + '"]').forEach(function (b) {
        var a = x[1] === k; b.setAttribute("aria-selected", a ? "true" : "false");
        b.style.background = a ? INK : "transparent"; b.style.color = a ? "#FFFFFF" : INK;
      });
    });
  }
  on("showMakale", "click", function () { tab("makale"); });
  on("showDuyuru", "click", function () { tab("duyuru"); });

  /* Yayınlar: kategori ve arama */
  var PUBS = [{"t": "İşletmenin Muhasebesiyle İlgili Olmayan Ticari Defterlerin Elektronik Ortamda Tutulmasına İlişkin Yeni Düzenleme", "a": "sirketler", "k": "Makale"}, {"t": "Büromuz adına yapılan dolandırıcılık girişimlerine karşı uyarı", "a": "", "k": "Duyuru"}, {"t": "[Makale başlığı]", "a": "sermaye", "k": "Makale"}, {"t": "[Makale başlığı]", "a": "fikri", "k": "Makale"}];
  var rows = $$("[data-pub]");
  if (rows.length) {
    var cat = "hepsi", q = "";
    var apply = function () {
      var n = 0;
      rows.forEach(function (r) {
        var p = PUBS[+r.getAttribute("data-pub")];
        var okC = cat === "hepsi" || (cat === "duyuru" ? p.k === "Duyuru" : p.a === cat);
        var okQ = !q || p.t.toLocaleLowerCase("tr").indexOf(q) >= 0;
        var ok = okC && okQ; if (ok) n++;
        r.style.display = ok ? "flex" : "none";
      });
      var c = $('[data-dz="count"]'); if (c) c.textContent = n + " yayın";
      var e = $("#dz-empty"); if (e) e.hidden = n !== 0;
      $$('[data-on^="pick_"]').forEach(function (b) {
        var a = b.getAttribute("data-on") === "pick_" + cat;
        b.setAttribute("aria-pressed", a ? "true" : "false");
        b.style.background = a ? INK : "transparent"; b.style.color = a ? "#FFFFFF" : INK;
      });
    };
    $$('[data-on^="pick_"]').forEach(function (b) { b.addEventListener("click", function () { cat = b.getAttribute("data-on").slice(5); apply(); }); });
    on("search", "input", function (e) { q = e.target.value.trim().toLocaleLowerCase("tr"); apply(); });
  }

  /* İletişim formu */
  var form = $('form[data-on="submit"]');
  if (form) {
    var btn = $('button[type="submit"]', form), sent = $("#dz-sent"), sending = false;
    var g = function (n) { var el = form.elements[n]; return (el && el.value || "").trim(); };
    var setErr = function (n, msg) {
      var span = $('[data-err="' + n + '"]', form), el = form.elements[n];
      if (span) { span.hidden = !msg; if (msg && n !== "kvkk") span.textContent = msg; }
      if (el && n !== "kvkk") { el.setAttribute("aria-invalid", msg ? "true" : "false"); el.style.borderColor = msg ? "#B42318" : "#D4D4D8"; }
    };
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (sending || g("website")) return;
      var er = {};
      if (!g("ad")) er.ad = "Adınızı ve soyadınızı yazın.";
      var m = g("eposta");
      if (!m) er.eposta = "E-posta adresinizi yazın."; else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m)) er.eposta = "Geçerli bir e-posta adresi yazın (ör. ad@ornek.com).";
      var t = g("telefon").replace(/[\s()+-]/g, "");
      if (!t) er.telefon = "Telefon numaranızı yazın."; else if (!/^\d{10,13}$/.test(t)) er.telefon = "Telefon numarası 10–13 rakamdan oluşmalı.";
      var ms = g("mesaj");
      if (!ms) er.mesaj = "Mesajınızı yazın."; else if (ms.length > 3000) er.mesaj = "Mesajınız en fazla 3000 karakter olabilir.";
      if (!form.elements.kvkk.checked) er.kvkk = true;
      ["ad", "eposta", "telefon", "mesaj", "kvkk"].forEach(function (n) { setErr(n, er[n] || ""); });
      if (Object.keys(er).length) {
        if (sent) sent.hidden = true;
        var first = $('[aria-invalid="true"]', form) || form.elements.kvkk; if (first) first.focus();
        return;
      }
      /* Gönderim adresi yayına alınırken bağlanacak; şimdilik onay mesajı gösterilir. */
      sending = true; btn.disabled = true; btn.textContent = "Gönderiliyor…";
      setTimeout(function () { sending = false; btn.disabled = false; btn.textContent = "Gönder"; form.reset(); if (sent) { sent.hidden = false; sent.focus && sent.setAttribute("tabindex", "-1"); sent.focus(); } }, 900);
    });
  }

  /* Giriş videosu: bazı tarayıcılarda otomatik oynatmayı başlat */
  $$("video.dz-video").forEach(function (v) { v.muted = true; var p = v.play(); if (p && p.catch) p.catch(function () {}); });
})();
