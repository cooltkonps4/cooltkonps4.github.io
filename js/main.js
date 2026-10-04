/* =========================================================
   Bawasooq TV
   ========================================================= */

/*
 * ADD YOUR VIDEOS HERE
 * --------------------
 * Paste the YouTube video ID (the part after "watch?v=" in the link) and a title.
 * Example: https://www.youtube.com/watch?v=dQw4w9WgXcQ  ->  id: "dQw4w9WgXcQ"
 *
 * While this list is empty, the site shows "coming soon" TV screens instead.
 */
const VIDEOS = [
  // { id: "YOUTUBE_ID", title: "Video title", note: "Short description" },
];

const WHATSAPP_NUMBER = "923335042550";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- year ---------- */
document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- nav: background on scroll ---------- */
const nav = document.querySelector(".nav");
const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 20);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

/* ---------- nav: mobile menu ---------- */
const toggle = document.querySelector(".nav__toggle");
const menu = document.getElementById("nav-menu");

function setMenu(open) {
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  menu.classList.toggle("is-open", open);
  document.body.style.overflow = open ? "hidden" : "";
}
toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
window.addEventListener("resize", () => { if (window.innerWidth > 760) setMenu(false); });

/* ---------- nav: highlight current section ---------- */
const links = [...menu.querySelectorAll('a[href^="#"]')];
const sections = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
if ("IntersectionObserver" in window) {
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => spy.observe(s));
}

/* ---------- live Pakistan clock in the ticker ---------- */
const clock = document.getElementById("pkt-clock");
const fmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Karachi", hour: "2-digit", minute: "2-digit", hour12: false,
});
const tick = () => { clock.textContent = "PKT " + fmt.format(new Date()); };
tick();
setInterval(tick, 15000);

/* ---------- videos ---------- */
const grid = document.getElementById("video-grid");

function esc(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

const playIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';

if (VIDEOS.length) {
  document.getElementById("videos-lead").textContent = "Watch the latest programmes from Bawasooq TV.";
  grid.innerHTML = VIDEOS.map((v, i) => `
    <article class="video reveal">
      <div class="video__screen">
        <img src="https://i.ytimg.com/vi/${esc(v.id)}/hqdefault.jpg" alt="" loading="lazy">
        <div class="video__overlay">
          <button class="video__play" data-id="${esc(v.id)}" aria-label="Play: ${esc(v.title)}">${playIcon}</button>
        </div>
        <span class="video__ch">CH ${String(i + 1).padStart(2, "0")}</span>
      </div>
      <div class="video__meta">
        <h3>${esc(v.title)}</h3>
        ${v.note ? `<p>${esc(v.note)}</p>` : ""}
      </div>
    </article>`).join("");

  // Load the YouTube player only when someone presses play (keeps the page fast).
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".video__play");
    if (!btn) return;
    const screen = btn.closest(".video__screen");
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(btn.dataset.id)}?autoplay=1&rel=0`;
    iframe.title = btn.getAttribute("aria-label").replace(/^Play: /, "");
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    screen.replaceChildren(iframe);
  });
} else {
  const placeholders = [
    { title: "New programmes coming soon", note: "Stay tuned to Bawasooq TV" },
    { title: "Community stories", note: "Filming in progress" },
    { title: "From across Pakistan", note: "Coming to the channel" },
  ];
  grid.innerHTML = placeholders.map((p, i) => `
    <article class="video reveal">
      <div class="video__screen">
        <canvas width="160" height="90" aria-hidden="true"></canvas>
        <div class="video__overlay"><span class="video__badge">COMING SOON</span></div>
        <span class="video__ch">CH ${String(i + 1).padStart(2, "0")}</span>
      </div>
      <div class="video__meta">
        <h3>${p.title}</h3>
        <p>${p.note}</p>
      </div>
    </article>`).join("");
  startStatic([...grid.querySelectorAll("canvas")]);
}

/* Old-TV static noise on the "coming soon" screens. Only animates while on screen. */
function startStatic(canvases) {
  const screens = canvases.map((c) => {
    const ctx = c.getContext("2d");
    return { c, ctx, img: ctx.createImageData(c.width, c.height), visible: false };
  });

  const draw = (s) => {
    const d = s.img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = 255;
    }
    s.ctx.putImageData(s.img, 0, 0);
  };

  screens.forEach(draw);
  if (reduceMotion) return;

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const s = screens.find((x) => x.c === e.target);
        if (s) s.visible = e.isIntersecting;
      });
    });
    screens.forEach((s) => io.observe(s.c));
  } else {
    screens.forEach((s) => { s.visible = true; });
  }

  let last = 0;
  const loop = (t) => {
    if (t - last > 70) {            // ~14 fps looks like real static and is cheap
      screens.forEach((s) => { if (s.visible) draw(s); });
      last = t;
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

/* ---------- reveal on scroll ---------- */
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !reduceMotion) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("is-visible"));
}

/* ---------- contact form -> WhatsApp ---------- */
const form = document.getElementById("contact-form");
const errorBox = document.getElementById("form-error");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const { name: nameEl, subject: subjectEl, message: messageEl } = form.elements;
  const name = nameEl.value.trim();
  const subject = subjectEl.value.trim();
  const message = messageEl.value.trim();

  form.querySelectorAll(".field").forEach((f) => f.classList.remove("is-invalid"));
  const missing = [];
  if (!name) missing.push(nameEl);
  if (!message) missing.push(messageEl);

  if (missing.length) {
    missing.forEach((el) => el.closest(".field").classList.add("is-invalid"));
    errorBox.textContent = "Please add your name and a message.";
    errorBox.hidden = false;
    missing[0].focus();
    return;
  }
  errorBox.hidden = true;

  const text =
    `Assalam-o-Alaikum Bawasooq TV!\n\n` +
    `Name: ${name}\n` +
    (subject ? `Subject: ${subject}\n` : "") +
    `\n${message}`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
});
