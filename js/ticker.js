(() => {
  "use strict";

  const ticker = document.querySelector("#breaking-ticker");
  if (!ticker) return;

  const headlines = [
    "Tokyo officials deny vending machines have formed a shadow cabinet.",
    "Finance ministry announces new emergency committee to study committees.",
    "Local man achieves inner peace after finally reading apartment recycling rules.",
    "Shibuya crossing briefly achieves consciousness, apologizes for inconvenience.",
    "Temple cat appointed unofficial Minister of Tourism.",
    "Government promises bold reform immediately after lunch.",
    "AI tool generates apology before company makes mistake.",
    "Salaryman discovers third emotion during commute.",
    "Experts warn cherry blossoms are becoming too influential.",
    "Mascot denies rumors of mayoral ambition.",
    "Convenience store adds premium tier for people who missed their train.",
    "Tokyo train apology now longer than the delay itself.",
    "Nation briefly united by confusing recycling calendar.",
    "Robot refuses promotion after learning what managers do.",
    "Vending machine seen blinking Morse code during cabinet reshuffle.",
    "Weather agency predicts 80% chance of abandoned umbrellas.",
    "Local cafe introduces standing-room nap service.",
    "Officials clarify previous clarification was not official.",
    "Startup raises ¥4 billion to reinvent waiting in line.",
    "Tokyo residents asked to stand slightly more politely.",
  ];

  function shuffle(array) {
    return array
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  }

  const items = shuffle(headlines);
  ticker.innerHTML = "";

  [...items, ...items].forEach((headline) => {
    const li = document.createElement("li");
    li.textContent = headline;
    ticker.appendChild(li);
  });

  ticker.classList.add("eastokyo-ticker-live");

  const style = document.createElement("style");
  style.textContent = `
      #breaking-ticker.eastokyo-ticker-live {
        display: flex;
        width: max-content;
        animation: eastokyoTickerMove 120s linear infinite;
      }
  
      .ticker-window:hover #breaking-ticker.eastokyo-ticker-live {
        animation-play-state: paused;
      }
  
      #breaking-ticker.eastokyo-ticker-live li::before {
        content: "速報";
        margin-right: 10px;
        padding: 2px 7px;
        background: #d71920;
        color: #fffaf2;
        border: 2px solid #15151a;
        font-size: .72rem;
        font-weight: 900;
      }
  
      @keyframes eastokyoTickerMove {
        from { transform: translateX(0); }
        to { transform: translateX(-50%); }
      }
  
      @media (prefers-reduced-motion: reduce) {
        #breaking-ticker.eastokyo-ticker-live {
          animation: none;
        }
      }
    `;
  document.head.appendChild(style);
})();
