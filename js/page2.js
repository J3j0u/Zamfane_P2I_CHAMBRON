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
  const reveal2TextEl = document.getElementById("reveal2Text");

  const board1 = document.getElementById("board1");
  const board2 = document.getElementById("board2");
  const board3 = document.getElementById("board3");

  const board1Cards = document.querySelectorAll("#board1 .board-card");
  const board2Cards = document.querySelectorAll("#board2 .board-card");
  const board3Cards = document.querySelectorAll("#board3 .board-card");

  const board1Good = document.querySelector(".board1-good");
  const board2Good = document.querySelector(".board2-good");
  const board3Good = document.querySelector(".board3-good");

  const board2Wrap = document.getElementById("board2Wrap");
  const board3Wrap = document.getElementById("board3Wrap");

  const boardError1 = document.getElementById("boardError1");
  const boardError2 = document.getElementById("boardError2");
  const boardError3 = document.getElementById("boardError3");

  const hintAudioBtn1 = document.getElementById("hintAudioBtn1");
  const hintAudioBtn2 = document.getElementById("hintAudioBtn2");
  const hintAudioBtn3 = document.getElementById("hintAudioBtn3");

  const hintAudio1 = document.getElementById("hintAudio1");
  const hintAudio2 = document.getElementById("hintAudio2");
  const hintAudio3 = document.getElementById("hintAudio3");

  const reveal2FullText =
    "Maintenant, n'oubliez-pas les paroles ! Choisissez parmi 4 réponses pour compléter les paroles de chansons connues de Zamdane. En cas de doute vous pourrez vous aider d'un indice audio.";

  let reveal2Started = false;
  let board2Shown = false;
  let board3Shown = false;

  let errorTimeout1;
  let errorTimeout2;
  let errorTimeout3;

  function clamp01(x) {
    return Math.max(0, Math.min(1, x));
  }

  function setReveal2Progress(progress) {
    if (!reveal2) return;
    reveal2.style.opacity = String(progress);
    reveal2.style.transform = `translateY(${(1 - progress) * 18}px)`;
    reveal2.style.pointerEvents = progress > 0.05 ? "auto" : "none";
  }

  function typeLettersOnce(text, el, msPerChar = 25) {
    if (!el) return;
    el.textContent = "";
    const chars = [...text];
    const spans = [];
    for (const ch of chars) {
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
        return;
      }
      spans[i].style.opacity = "1";
      i += 1;
    }, msPerChar);
  }

  function showError(errorEl, message, timeoutRefSetter, currentTimeout) {
    if (!errorEl) return;
    clearTimeout(currentTimeout);
    errorEl.classList.remove("show");
    timeoutRefSetter(
      setTimeout(() => {
        errorEl.textContent = message;
        errorEl.classList.add("show");
      }, 120)
    );
  }

  function smoothScrollToElement(element, duration = 900, offset = 40) {
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const startY = window.scrollY;
    const targetY = startY + rect.top - offset;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const finalY = Math.max(0, Math.min(targetY, maxScroll));
    const distance = finalY - startY;
    const startTime = performance.now();

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      window.scrollTo(0, startY + distance * eased);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }

  function playHintAudio(button, audio) {
    if (!button || !audio) return;
    button.addEventListener("click", () => {
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  }

  function shakeCard(card) {
    card.classList.add("shake");
    setTimeout(() => {
      card.classList.remove("shake");
    }, 350);
  }

  function clearBoardError(errorEl, timeoutRef) {
    if (!errorEl) return;
    clearTimeout(timeoutRef);
    errorEl.classList.remove("show");
    errorEl.textContent = "";
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
  board1Cards.forEach((card) => {
    card.addEventListener("click", () => {
      if (card === board1Good) {
        clearBoardError(boardError1, errorTimeout1);
        card.classList.add("correct");
        if (board2Wrap) {
          if (board1) {
            board1.classList.add("board-fade-out");
          }
          if (!board2Shown) {
            board2Shown = true;
            board2Wrap.classList.add("show");
          }
          setTimeout(() => {
            smoothScrollToElement(board2Wrap, 900, 20);
          }, 120);
        }
        return;
      }
      shakeCard(card);
      showError(
        boardError1,
        "Mauvaise réponse. Réessaie.",
        (t) => {
          errorTimeout1 = t;
        },
        errorTimeout1
      );
    });
  });
  board2Cards.forEach((card) => {
    card.addEventListener("click", () => {
      if (card === board2Good) {
        clearBoardError(boardError2, errorTimeout2);
        card.classList.add("correct");
        if (board3Wrap) {
          if (board2) {
            board2.classList.add("board-fade-out");
          }
          if (!board3Shown) {
            board3Shown = true;
            board3Wrap.classList.add("show");
          }
          setTimeout(() => {
            smoothScrollToElement(board3Wrap, 900, 20);
          }, 120);
        }
        return;
      }
      shakeCard(card);
      showError(
        boardError2,
        "Mauvaise réponse. Réessaie.",
        (t) => {
          errorTimeout2 = t;
        },
        errorTimeout2
      );
    });
  });
  board3Cards.forEach((card) => {
    card.addEventListener("click", () => {
      if (card === board3Good) {
        clearBoardError(boardError3, errorTimeout3);
        card.classList.add("correct");
        setTimeout(() => {
          window.location.href = "page3.html";
        }, 500);
        return;
      }
      shakeCard(card);
      showError(
        boardError3,
        "Mauvaise réponse. Réessaie.",
        (t) => {
          errorTimeout3 = t;
        },
        errorTimeout3
      );
    });
  });
  playHintAudio(hintAudioBtn1, hintAudio1);
  playHintAudio(hintAudioBtn2, hintAudio2);
  playHintAudio(hintAudioBtn3, hintAudio3);
});