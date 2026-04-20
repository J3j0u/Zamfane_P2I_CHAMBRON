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
  const quizGrid = document.getElementById("quizGrid");
  const nextPageWrap = document.getElementById("nextPageWrap");
  const nextPageBtn = document.getElementById("nextPageBtn");
  const quizCounter = document.getElementById("quizCounter");

  const goodTitles = [
    "Déviant",
    "Une balle qui touche le ciel",
    "Deadstar",
    "Million",
    "Infini",
    "C18",
    "Lettre à mon dieu"
  ];

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

  const titleAudios = {
    "Déviant": "../audios/1.mp3",
    "Une balle qui touche le ciel": "../audios/2.mp3",
    "Deadstar": "../audios/3.mp3",
    "Million": "../audios/4.mp3",
    "Infini": "../audios/5.mp3",
    "C18": "../audios/6.mp3",
    "Lettre à mon dieu": "../audios/7.mp3"
  };

  let cardsShown = false;
  let correctCount = 0;
  let currentAudio = null;
  let currentTitle = null;
  let errorAudio = new Audio("../audios/error.mp3");

  function updateCounter() {
    const remaining = goodTitles.length - correctCount;
    if (quizCounter) {
      quizCounter.textContent = `Réponses restantes : ${remaining}`;
    }
  }

  function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

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

  function toggleAudio() {
    if (!currentAudio) return;

    if (currentAudio.paused) {
      currentAudio.play();
    } else {
      currentAudio.pause();
    }
  }

  function goToRevealPage() {
    const currentProgress = Number(localStorage.getItem("rahmaProgress") || "0");
    localStorage.setItem("rahmaProgress", String(Math.max(currentProgress, 4)));
    window.location.href = "page5.html?step=4";
  }

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

          if (correctCount === goodTitles.length && nextPageWrap) {
            nextPageWrap.classList.add("show");
          }

          return;
        }

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

  if (nextPageBtn) {
    nextPageBtn.addEventListener("click", () => {
      goToRevealPage();
    });
  }

  buildQuiz();
  updateCounter();

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
});