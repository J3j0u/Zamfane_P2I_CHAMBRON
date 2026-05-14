/* ============================================================
   pages/page4.js
   Page 4 : quiz de selection des titres.
   Le joueur doit retrouver les vrais titres de l'artiste
   parmi une grille de 20 propositions melangees.

   Utilitaires communs fournis par common.js (objet "Zam").
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  /* Recuperation des elements de la page */
  const btn = document.getElementById("discoverBtn");
  const reveal1 = document.getElementById("reveal1");
  const quizGrid = document.getElementById("quizGrid");
  const nextPageWrap = document.getElementById("nextPageWrap");
  const nextPageBtn = document.getElementById("nextPageBtn");
  const quizCounter = document.getElementById("quizCounter");

  /* Vrais titres de l'artiste a retrouver */
  const goodTitles = [
    "Déviant",
    "Une balle qui touche le ciel",
    "Deadstar",
    "Million",
    "Infini",
    "C18",
    "Lettre à mon dieu"
  ];

  /* Titres d'autres artistes, ajoutes pour brouiller les pistes */
  const badTitles = [
    "La bohème",
    "Loyal",
    "Scarface",
    "Je ne t'aime plus",
    "Bottega",
    "Shadow boxing",
    "Déconnecté",
    "Comme les gens d'ici",
    "Médication",
    "Piscine privée",
    "Bloc de glace",
    "Ces gens-là",
    "Petit frère"
  ];

  /* Extrait audio associe a chaque bon titre */
  const titleAudios = {
    "Déviant": "../assets/audio/1.mp3",
    "Une balle qui touche le ciel": "../assets/audio/2.mp3",
    "Deadstar": "../assets/audio/3.mp3",
    "Million": "../assets/audio/4.mp3",
    "Infini": "../assets/audio/5.mp3",
    "C18": "../assets/audio/6.mp3",
    "Lettre à mon dieu": "../assets/audio/7.mp3"
  };

  /* Variables de suivi du quiz */
  let cardsShown = false;
  let correctCount = 0;
  let currentAudio = null;
  let currentTitle = null;
  const errorAudio = new Audio("../assets/audio/error.mp3");

  /* Met a jour le compteur de bons titres restants. */
  function updateCounter() {
    const remaining = goodTitles.length - correctCount;
    if (quizCounter) {
      quizCounter.textContent = `Réponses restantes : ${remaining}`;
    }
  }

  /* Joue l'extrait lie a un bon titre (coupe le precedent). */
  function playTitleAudio(title) {
    const src = titleAudios[title];
    if (!src) return;

    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    currentAudio = new Audio(src);
    currentTitle = title;
    currentAudio.play();
  }

  /* Lecture / pause de l'extrait actuellement selectionne. */
  function toggleAudio() {
    if (!currentAudio) return;
    if (currentAudio.paused) {
      currentAudio.play();
    } else {
      currentAudio.pause();
    }
  }

  /* Passage a la page de revelation de la 4e lettre. */
  function goToRevealPage() {
    Zam.saveProgress(4);
    window.location.href = "page5.html?step=4";
  }

  /* Construction du quiz : melange bons et faux titres,
     cree tous les boutons et gere les clics. */
  function buildQuiz() {
    if (!quizGrid) return;

    const totalSlots = goodTitles.length + badTitles.length;
    const slots = new Array(totalSlots).fill(null);
    const goodPositions = Zam.shuffle([...Array(totalSlots).keys()])
      .slice(0, goodTitles.length);

    goodTitles.forEach((title, index) => {
      slots[goodPositions[index]] = { title, isGood: true };
    });

    let badIndex = 0;
    for (let i = 0; i < slots.length; i += 1) {
      if (!slots[i]) {
        slots[i] = { title: badTitles[badIndex], isGood: false };
        badIndex += 1;
      }
    }

    quizGrid.innerHTML = "";

    slots.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "quiz-card";
      button.textContent = item.title;
      button.dataset.good = item.isGood ? "true" : "false";

      /* Clic sur un titre : extrait audio si vrai titre,
         validation visuelle si bon, erreur si faux. */
      button.addEventListener("click", () => {
        if (button.dataset.good === "true") {
          if (currentAudio && currentTitle === item.title) {
            toggleAudio();
          } else {
            playTitleAudio(item.title);
          }
        }

        if (button.classList.contains("correct") ||
            button.classList.contains("wrong")) {
          return;
        }

        if (button.dataset.good === "true") {
          button.classList.add("correct");
          correctCount += 1;
          updateCounter();

          /* Tous les bons titres trouves : on affiche le
             bouton de passage a la suite. */
          if (correctCount === goodTitles.length && nextPageWrap) {
            nextPageWrap.classList.add("show");
          }
          return;
        }

        /* Titre faux : effet visuel + son d'erreur */
        button.classList.add("wrong", "shake");
        errorAudio.currentTime = 0;
        errorAudio.play();
        setTimeout(() => {
          button.classList.remove("shake");
        }, 350);
      });

      quizGrid.appendChild(button);
    });
  }

  /* Affichage progressif des cartes du quiz, une par une. */
  function showCards() {
    const cards = document.querySelectorAll(".quiz-card");

    if (quizCounter) {
      quizCounter.classList.add("show");
    }

    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add("show");
      }, index * 85);
    });
  }

  /* Surveillance du scroll : declenche l'apparition du quiz
     quand l'utilisateur est assez descendu apres le texte.
     Ratios specifiques a cette page (0.75 / 0.35). */
  let recheckScroll = null;
  recheckScroll = Zam.watchScrollReveal(
    reveal1,
    null,
    () => {
      cardsShown = true;
      showCards();
    },
    { startRatio: 0.75, endRatio: 0.35, threshold: 0.75, animateReveal2: false }
  );

  /* Raccourci clavier : la barre d'espace met en pause /
     relance l'extrait audio en cours. */
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      toggleAudio();
    }
  });

  /* Bouton "Nouvelle étape" : ouvre le bloc d'intro, puis
     relance un controle du scroll (le bloc ayant change de
     hauteur, le quiz peut devenir visible). */
  Zam.setupDiscoverButton(btn, reveal1, () => {
    if (!cardsShown && typeof recheckScroll === "function") {
      setTimeout(() => {
        recheckScroll();
      }, 100);
    }
  });

  /* Bouton final : passage a la page suivante. */
  if (nextPageBtn) {
    nextPageBtn.addEventListener("click", () => {
      goToRevealPage();
    });
  }

  /* Initialisation : construction du quiz et compteur. */
  buildQuiz();
  updateCounter();
});
