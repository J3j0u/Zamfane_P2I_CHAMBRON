/* ============================================================
   common.js
   Code partage par toutes les pages de jeu.

   Avant, chaque fichier page1..page5 recopiait :
   - le reset de la position de scroll au chargement
   - les helpers clamp01 / shuffle
   - la logique du bouton "discover"
   - la machinerie d'apparition du deuxieme bloc au scroll
     (setReveal2Progress + onScroll + texte lettre par lettre)

   Tout est centralise ici et expose via l'objet global "Zam".
   Chaque page n'a plus qu'a appeler ce dont elle a besoin.
   ============================================================ */

/* --- Reset de la position de scroll --------------------------- */
/* Empeche le navigateur de restaurer la position de scroll
   et remet la page tout en haut au chargement. */
window.history.scrollRestoration = "manual";

window.addEventListener("load", () => {
  window.scrollTo(0, 0);
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 0);
});

/* --- Objet global regroupant les utilitaires partages --------- */
window.Zam = (function () {
  "use strict";

  /* Limite une valeur entre 0 et 1 (utilise pour la progression
     d'apparition des blocs : 0 = cache, 1 = totalement visible). */
  function clamp01(x) {
    return Math.max(0, Math.min(1, x));
  }

  /* Normalise un texte : retire les espaces inutiles et passe en
     minuscules, pour comparer facilement les reponses. */
  function normalize(s) {
    return (s || "").trim().toLowerCase();
  }

  /* Melange aleatoire d'un tableau (copie, sans modifier l'original). */
  function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  /* Petite animation de secousse : ajoute la classe "shake"
     puis la retire apres l'animation. */
  function shakeElement(el, duration = 350) {
    if (!el) return;
    el.classList.add("shake");
    setTimeout(() => {
      el.classList.remove("shake");
    }, duration);
  }

  /* Cable le bouton "discover" : un clic ouvre/ferme le bloc
     d'introduction et met a jour l'attribut aria-expanded. */
  function setupDiscoverButton(btn, reveal, onToggle) {
    if (!btn || !reveal) return;
    btn.addEventListener("click", () => {
      const isOpen = btn.classList.toggle("open");
      reveal.classList.toggle("show", isOpen);
      btn.setAttribute("aria-expanded", String(isOpen));
      if (typeof onToggle === "function") {
        onToggle(isOpen);
      }
    });
  }

  /* Affiche un texte lettre par lettre dans un element.
     - respecte les retours a la ligne ("\n" -> <br>)
     - respecte la preference "reduced motion"
     - appelle onComplete() une fois le texte entierement affiche
     C'est la version commune de l'ancien "typeLettersOnce". */
  function typeLetters(text, el, options = {}) {
    if (!el) return;

    const msPerChar = options.msPerChar || 22;
    const onComplete = options.onComplete;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      el.textContent = text;
      if (typeof onComplete === "function") onComplete();
      return;
    }

    el.textContent = "";
    const spans = [];

    for (const ch of [...text]) {
      if (ch === "\n") {
        el.appendChild(document.createElement("br"));
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
        if (typeof onComplete === "function") onComplete();
        return;
      }
      spans[i].style.opacity = "1";
      i += 1;
    }, msPerChar);
  }

  /* Met a jour l'opacite et le decalage du deuxieme bloc selon
     une progression (0 -> 1). Version commune de "setReveal2Progress". */
  function setReveal2Progress(reveal2, progress) {
    if (!reveal2) return;
    reveal2.style.opacity = String(progress);
    reveal2.style.transform = `translateY(${(1 - progress) * 18}px)`;
    reveal2.style.pointerEvents = progress > 0.05 ? "auto" : "none";
  }

  /* Surveille le scroll et declenche un callback quand l'utilisateur
     a assez descendu apres le bloc d'introduction.
     Remplace les fonctions "onScroll" copiees dans chaque page.

     - reveal1   : bloc d'introduction servant de repere
     - reveal2   : bloc a faire apparaitre progressivement (optionnel)
     - onTrigger : appele une seule fois quand le seuil est atteint
     - opts      : { startRatio, endRatio, threshold, animateReveal2 }
  */
  function watchScrollReveal(reveal1, reveal2, onTrigger, opts = {}) {
    if (!reveal1) return;

    const startRatio = opts.startRatio != null ? opts.startRatio : 0.55;
    const endRatio = opts.endRatio != null ? opts.endRatio : 0.2;
    const threshold = opts.threshold != null ? opts.threshold : 0.75;
    const animateReveal2 = opts.animateReveal2 !== false;

    let triggered = false;

    function onScroll() {
      if (triggered) return;

      const r1 = reveal1.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * startRatio;
      const end = vh * endRatio;
      const progress = clamp01((start - r1.bottom) / (start - end));

      if (animateReveal2 && reveal2) {
        setReveal2Progress(reveal2, progress);
      }

      if (progress >= threshold) {
        triggered = true;
        if (animateReveal2 && reveal2) {
          setReveal2Progress(reveal2, 1);
        }
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        if (typeof onTrigger === "function") onTrigger();
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    /* Renvoie une fonction pour relancer un controle manuellement
       (utile apres l'ouverture du bloc d'intro sur la page 4). */
    return onScroll;
  }

  /* Sauvegarde la progression du joueur dans le localStorage,
     sans jamais regresser. */
  function saveProgress(step) {
    const current = Number(localStorage.getItem("rahmaProgress") || "0");
    localStorage.setItem("rahmaProgress", String(Math.max(current, step)));
  }

  return {
    clamp01,
    normalize,
    shuffle,
    shakeElement,
    setupDiscoverButton,
    typeLetters,
    setReveal2Progress,
    watchScrollReveal,
    saveProgress
  };
})();
