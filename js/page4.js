window.history.scrollRestoration = "manual";
window.addEventListener("load", () => {
  window.scrollTo(0, 0);

  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 0);
});

document.addEventListener("DOMContentLoaded", () => {
  /* Récupération des éléments principaux de la page :
     bouton d’ouverture du texte, bloc d’intro,
     grille du quiz, compteur et bouton de passage à la suite */
  const btn = document.getElementById("discoverBtn");
  const reveal1 = document.getElementById("reveal1");
  const quizGrid = document.getElementById("quizGrid");
  const nextPageWrap = document.getElementById("nextPageWrap");
  const nextPageBtn = document.getElementById("nextPageBtn");
  const quizCounter = document.getElementById("quizCounter");

  /* Liste des vrais titres de Zamdane à retrouver dans le quiz */
  const goodTitles = [
    "Déviant",
    "Une balle qui touche le ciel",
    "Deadstar",
    "Million",
    "Infini",
    "C18",
    "Lettre à mon dieu"
  ];

  /* Liste de titres d'autres artistes ajoutés pour mélanger les réponses */
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

  /* Association entre chaque bon titre et son extrait audio :
     quand un bon titre est cliqué, un extrait est joué */
  const titleAudios = {
    "Déviant": "../audios/1.mp3",
    "Une balle qui touche le ciel": "../audios/2.mp3",
    "Deadstar": "../audios/3.mp3",
    "Million": "../audios/4.mp3",
    "Infini": "../audios/5.mp3",
    "C18": "../audios/6.mp3",
    "Lettre à mon dieu": "../audios/7.mp3"
  };

  /* Variables de suivi du quiz :
     savoir si les cartes ont déjà été affichées,
     compter les bonnes réponses,
     mémoriser l’audio en cours
     et préparer le son d’erreur */
  let cardsShown = false;
  let correctCount = 0;
  let currentAudio = null;
  let currentTitle = null;
  let errorAudio = new Audio("../audios/error.mp3");

  /* Mise à jour du compteur affiché en haut du quiz :
     indique combien de bons titres il reste encore à trouver */
  function updateCounter() {
    const remaining = goodTitles.length - correctCount;
    if (quizCounter) {
      quizCounter.textContent = `Réponses restantes : ${remaining}`;
    }
  }

  /* Mélange aléatoire d’un tableau :
     utilisé ici pour répartir les bons et faux titres
     dans un ordre différent à chaque actualisation de la page */
  function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  /* Lecture d’un extrait audio lié à un bon titre :
     si un autre extrait était déjà lancé, il est coupé
     avant de jouer le nouveau */
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

  /* Lecture / pause de l’extrait actuellement sélectionné :
     quand l’utilisateur reclique sur le même bon titre, l'audio se relance */
  function toggleAudio() {
    if (!currentAudio) return;

    if (currentAudio.paused) {
      currentAudio.play();
    } else {
      currentAudio.pause();
    }
  }

  /* Passage à la page suivante une fois le quiz réussi :
     enregistre la progression du joueur
     puis envoie vers la page de révélation de la 4e lettre */
  function goToRevealPage() {
    const currentProgress = Number(localStorage.getItem("rahmaProgress") || "0");
    localStorage.setItem("rahmaProgress", String(Math.max(currentProgress, 4)));
    window.location.href = "page5.html?step=4";
  }

  /* Construction complète du quiz :
     mélange les bons et faux titres,
     crée tous les boutons,
     puis gère ce qu’il se passe quand on clique dessus */
  function buildQuiz() {
    if (!quizGrid) return;

    const totalSlots = goodTitles.length + badTitles.length;
    const slots = new Array(totalSlots).fill(null);
    const goodPositions = shuffle([...Array(totalSlots).keys()]).slice(0, goodTitles.length);

    goodTitles.forEach((title, index) => {
      slots[goodPositions[index]] = {
        title,
        isGood: true
      };
    });

    let badIndex = 0;
    for (let i = 0; i < slots.length; i += 1) {
      if (!slots[i]) {
        slots[i] = {
          title: badTitles[badIndex],
          isGood: false
        };
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

      /* Gestion du clic sur un titre :
         lecture d’un extrait si c’est un vrai titre,
         validation visuelle si la réponse est bonne,
         ou affichage d’une erreur si c’est faux */
      button.addEventListener("click", () => {
        if (button.dataset.good === "true") {
          if (currentAudio && currentTitle === item.title) {
            toggleAudio();
          } else {
            playTitleAudio(item.title);
          }
        }

        if (button.classList.contains("correct") || button.classList.contains("wrong")) {
          return;
        }

        if (button.dataset.good === "true") {
          button.classList.add("correct");
          correctCount += 1;
          updateCounter();

          /* Quand tous les bons titres ont été trouvés,
             affichage du bouton pour passer à la suite */
          if (correctCount === goodTitles.length && nextPageWrap) {
            nextPageWrap.classList.add("show");
          }

          return;
        }

        /* Si le titre choisi est faux :
           effet visuel d’erreur + son d’erreur */
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

  function clamp01(x) {
    return Math.max(0, Math.min(1, x));
  }

  /* Affichage progressif des cartes du quiz :
     les titres apparaissent un par un
     avec le compteur en haut */
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

  /* Détection du scroll :
     permet de lancer l’apparition du quiz
     quand l’utilisateur est assez descendu
     après avoir ouvert le texte d’introduction */
  function onScroll() {
    if (cardsShown || !reveal1) return;

    const r1 = reveal1.getBoundingClientRect();
    const vh = window.innerHeight;
    const start = vh * 0.75;
    const end = vh * 0.35;
    const progress = clamp01((start - r1.bottom) / (start - end));

    if (progress >= 0.75) {
      cardsShown = true;
      showCards();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    }
  }

  /* Raccourci clavier :
     la touche espace permet de mettre en pause
     ou relancer l’extrait audio en cours */
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      toggleAudio();
    }
  });

  if (btn && reveal1) {
    btn.addEventListener("click", () => {
      const isOpen = btn.classList.toggle("open");
      reveal1.classList.toggle("show", isOpen);
      btn.setAttribute("aria-expanded", String(isOpen));

      setTimeout(() => {
        onScroll();
      }, 100);
    });
  }

  /* Gestion du bouton final :
     permet d’aller vers la page suivante
     une fois le quiz terminé */
  if (nextPageBtn) {
    nextPageBtn.addEventListener("click", () => {
      goToRevealPage();
    });
  }

  /* Initialisation de la page :
     création du quiz,
     mise à jour du compteur,
     puis surveillance du scroll pour afficher les cartes */
  buildQuiz();
  updateCounter();

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
});