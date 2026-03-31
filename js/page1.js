window.history.scrollRestoration = "manual";

window.addEventListener("load", () => {
  window.scrollTo(0, 0);

  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 0);
});

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("discoverBtn");
  const reveal1 = document.getElementById("reveal1");
  const reveal2 = document.getElementById("reveal2");
  const reveal2TextEl =
    document.getElementById("reveal2Text") ||
    (reveal2 ? reveal2.querySelector("p") : null);

  const audioWrap = document.getElementById("audioWrap");
  const answerWrap = document.getElementById("answerWrap");

  const audio = document.getElementById("audioExtrait");
  const audioBtn = document.getElementById("audioBtn");

  const hintImgBtn = document.getElementById("hintImgBtn");
  const hintTextBtn = document.getElementById("hintTextBtn");
  const hintImg = document.getElementById("hintImg");
  const hintText = document.getElementById("hintText");

  const answerForm = document.getElementById("answerForm");
  const answerInput = document.getElementById("answerInput");
  const answerError = document.getElementById("answerError");

  const BONNE_REPONSE = "favaro";
  const SUCCESS_PAGE = "page2.html";

  const reveal2FullText =
    "Zamdane commence par des open mics, puis sort quelques morceaux sans grand succès au départ. " +
    "Cependant, en 2017, il dévoile un titre qui le fait découvrir à un public bien plus large.\n\n" +
    "Saurez-vous retrouver le titre de ce morceau à partir de cet extrait ?\n" +
    "Si vous avez du mal vous pouvez vous aider d'un indice !\n";

  let reveal2Started = false;

  function clamp01(x) {
    return Math.max(0, Math.min(1, x));
  }

  function normalize(s) {
    return (s || "").trim().toLowerCase();
  }

  function setReveal2Progress(progress) {
    if (!reveal2) return;

    reveal2.style.opacity = String(progress);
    reveal2.style.transform = `translateY(${(1 - progress) * 18}px)`;
    reveal2.style.pointerEvents = progress > 0.05 ? "auto" : "none";
  }

  function typeLettersOnce(text, el, msPerChar = 22) {
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      el.textContent = text;
      if (audioWrap) {
        audioWrap.classList.remove("hidden");
        audioWrap.classList.add("fade-in");
      }
      if (answerWrap) {
        answerWrap.classList.remove("hidden");
        answerWrap.classList.add("fade-in");
      }
      return;
    }
    if (audioWrap) {
      audioWrap.classList.add("hidden");
      audioWrap.classList.remove("fade-in");
    }
    if (answerWrap) {
      answerWrap.classList.add("hidden");
      answerWrap.classList.remove("fade-in");
    }
    el.textContent = "";
    const chars = [...text];
    const spans = [];
    for (const ch of chars) {
      if (ch === "\n") {
        const br = document.createElement("br");
        el.appendChild(br);
        continue;
      }
      const span = document.createElement("span");
      span.style.opacity = "0";
      span.style.transition = "opacity 220ms ease";
      span.textContent = ch;
      el.appendChild(span);
      spans.push(span);
    }
    let i = 0;
    const timer = setInterval(() => {
      if (i >= spans.length) {
        clearInterval(timer);
        if (audioWrap) {
          audioWrap.classList.remove("hidden");
          audioWrap.classList.add("fade-in");
        }
        setTimeout(() => {
          if (answerWrap) {
            answerWrap.classList.remove("hidden");
            answerWrap.classList.add("fade-in");
          }
        }, 800);
        return;
      }
      spans[i].style.opacity = "1";
      i += 1;
    }, msPerChar);
  }

  function onScroll() {
    if (reveal2Started || !reveal1 || !reveal2) return;

    const r1 = reveal1.getBoundingClientRect();
    const vh = window.innerHeight;
    const start = vh * 0.55;
    const end = vh * 0.2;
    const progress = clamp01((start - r1.bottom) / (start - end));

    setReveal2Progress(progress);

    if (progress >= 0.75) {
      reveal2Started = true;
      setReveal2Progress(1);
      typeLettersOnce(reveal2FullText, reveal2TextEl, 15);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    }
  }

  if (btn && reveal1) {
    btn.addEventListener("click", () => {
      const isOpen = btn.classList.toggle("open");
      reveal1.classList.toggle("show", isOpen);
      btn.setAttribute("aria-expanded", String(isOpen));
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  if (audio && audioBtn) {
    audioBtn.addEventListener("click", () => {
      if (audio.paused) {
        audio.play();
        audioBtn.textContent = "Pause";
        audioBtn.setAttribute("aria-pressed", "true");
      } else {
        audio.pause();
        audioBtn.textContent = "Écouter l'extrait";
        audioBtn.setAttribute("aria-pressed", "false");
      }
    });
    audio.addEventListener("ended", () => {
      audioBtn.textContent = "Écouter l'extrait";
      audioBtn.setAttribute("aria-pressed", "false");
    });
  }

  if (hintImgBtn && hintImg) {
    hintImgBtn.addEventListener("click", () => {
      const isOpen = hintImg.classList.toggle("show");
      hintImgBtn.setAttribute("aria-expanded", String(isOpen));
    });
  }

  if (hintTextBtn && hintText) {
    hintTextBtn.addEventListener("click", () => {
      const isOpen = hintText.classList.toggle("show");
      hintTextBtn.setAttribute("aria-expanded", String(isOpen));
    });
  }

  if (answerForm && answerInput && answerError) {
    answerForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const user = normalize(answerInput.value);
      const good = normalize(BONNE_REPONSE);

      if (user === good) {
        const currentProgress = Number(localStorage.getItem("rahmaProgress") || "0");
        localStorage.setItem("rahmaProgress", String(Math.max(currentProgress, 1)));
        window.location.href = `page5.html?step=1&next=${encodeURIComponent(SUCCESS_PAGE)}`;
      } else {
        answerError.textContent = "Mauvaise réponse. Réessaie.";
      }
    });

    answerInput.addEventListener("input", () => {
      answerError.textContent = "";
    });
  }
});