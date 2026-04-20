/* Gestion du retour en haut de page :
   empêche le navigateur de restaurer automatiquement la position de scroll */
window.history.scrollRestoration = "manual";

/* Au chargement complet de la page :
   remise en haut de page */
window.addEventListener("load", () => {
  window.scrollTo(0, 0);

  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 0);
});

document.addEventListener("DOMContentLoaded", () => {
  /* Récupération des éléments principaux de la page :
     bouton de présentation, blocs de texte, zone audio,
     indices, champ de réponse et message d’erreur */
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

  /* Constantes de la page :
     bonne réponse du blindtest,
     page suivante une fois le jeu réussi,
     et texte narratif affiché avant le jeu */
  const BONNE_REPONSE = "favaro";
  const SUCCESS_PAGE = "page2.html";

  const reveal2FullText =
    "Zamdane commence par des open mics, puis sort quelques morceaux sans grand succès au départ. " +
    "Cependant, en 2017, il dévoile un titre qui le fait découvrir à un public bien plus large.\n\n" +
    "Saurez-vous retrouver le titre de ce morceau à partir de cet extrait ?\n" +
    "Si vous avez du mal vous pouvez vous aider d'un indice !\n";

  let reveal2Started = false;

  /* Gestion de l'apparition du texte 
     (0 : bloc caché, 1 : bloc totalement visible) :
     sert à limiter une valeur entre 0 et 1 */
  function clamp01(x) {
    return Math.max(0, Math.min(1, x));
  }

  /* Normalisation d’un texte :
     supprime les espaces inutiles et met tout en minuscule
     pour comparer plus facilement les réponses */
  function normalize(s) {
    return (s || "").trim().toLowerCase();
  }

  /* Gestion de l’apparition progressive du deuxième bloc :
     fait varier l'opacité et le décalage vertical selon le scroll */
  function setReveal2Progress(progress) {
    if (!reveal2) return;

    reveal2.style.opacity = String(progress);
    reveal2.style.transform = `translateY(${(1 - progress) * 18}px)`;
    reveal2.style.pointerEvents = progress > 0.05 ? "auto" : "none";
  }

  /* Affichage lettre par lettre du texte narratif :
     une fois le texte fini, affichage de la zone audio
     puis du champ de réponse */
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

  /* Détection du scroll :
     lance l’apparition du deuxième bloc
     quand l’utilisateur a assez avancé dans la page */
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

  /* Gestion du bouton "Présentation" :
     ouvre ou referme le premier bloc de texte */
  if (btn && reveal1) {
    btn.addEventListener("click", () => {
      const isOpen = btn.classList.toggle("open");
      reveal1.classList.toggle("show", isOpen);
      btn.setAttribute("aria-expanded", String(isOpen));
    });
  }

  /* Lancement du suivi du scroll pour faire apparaître la suite */
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* Gestion de l’extrait audio du blindtest :
     lecture / pause avec mise à jour du texte du bouton */
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

  /* Gestion du bouton d’indice visuel :
     affiche ou cache l’image d’indice */
  if (hintImgBtn && hintImg) {
    hintImgBtn.addEventListener("click", () => {
      const isOpen = hintImg.classList.toggle("show");
      hintImgBtn.setAttribute("aria-expanded", String(isOpen));
    });
  }

  /* Gestion du bouton de solution :
     affiche ou cache le texte donnant la réponse */
  if (hintTextBtn && hintText) {
    hintTextBtn.addEventListener("click", () => {
      const isOpen = hintText.classList.toggle("show");
      hintTextBtn.setAttribute("aria-expanded", String(isOpen));
    });
  }

  /* Gestion de la validation de la réponse au blindtest :
     si la réponse est correcte, passage vers la page de révélation de la lettre
     (mise à jour du localstorage), sinon affichage d’un message d’erreur */
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

    /* Suppression du message d’erreur dès que l’utilisateur retape quelque chose */
    answerInput.addEventListener("input", () => {
      answerError.textContent = "";
    });
  }
});