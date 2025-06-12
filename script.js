
const ATTRIBUTES = [
  "Close Shot", "Mid Range Shot", "Three Point Shot", "Free Throw",
  "Shot IQ", "Offensive Consistency", "Layup", "Standing Dunk",
  "Driving Dunk", "Post Hook", "Post Fade", "Post Control", "Draw Foul",
  "Hands", "Interior Defense", "Perimeter Defense", "Steal", "Block",
  "Help Defense IQ", "Pass Perception", "Defensive Consistency", "Speed",
  "Agility", "Strength", "Vertical", "Stamina", "Hustle",
  "Overall Durability", "Pass Accuracy", "Ball Handle", "Speed with Ball",
  "Pass IQ", "Pass Vision", "Offensive Rebound", "Defensive Rebound"
];

window.addEventListener("DOMContentLoaded", () => {
  buildForm();
  document.getElementById("submitBtn").addEventListener("click", onSubmit);
});

function buildForm() {
  const container = document.getElementById("attributes");

  const groups = {
    "Scoring": [
      "Close Shot", "Mid Range Shot", "Three Point Shot", "Free Throw",
      "Layup", "Standing Dunk", "Driving Dunk", "Post Hook", "Post Fade",
      "Post Control", "Draw Foul", "Shot IQ", "Offensive Consistency"
    ],
    "Defense": [
      "Interior Defense", "Perimeter Defense", "Steal", "Block",
      "Help Defense IQ", "Pass Perception", "Defensive Consistency"
    ],
    "Playmaking": [
      "Pass Accuracy", "Ball Handle", "Speed with Ball", "Pass IQ", "Pass Vision", "Hands"
    ],
    "Athleticism": [
      "Speed", "Agility", "Strength", "Vertical", "Stamina", "Hustle", "Overall Durability"
    ],
    "Rebounding": [
      "Offensive Rebound", "Defensive Rebound"
    ]
  };

  for (const [groupName, attributes] of Object.entries(groups)) {
    const section = document.createElement("div");
    section.innerHTML = `<h3>${groupName}</h3><hr>`;
    attributes.forEach(attr => {
      const label = document.createElement("label");
      label.innerHTML = `
        ${attr}
        <input
          type="number"
          name="${attr}"
          min="25"
          max="99"
          required
          placeholder="25–99"
        />
      `;
      section.appendChild(label);
    });
    container.appendChild(section);
  }
}

function onSubmit() {
  const form = document.getElementById("playerForm");
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  const formData = new FormData(form);
  const userStats = {};
  for (let [key, val] of formData.entries()) {
    userStats[key] = Number(val);
  }

  const maxDiffPerAttr = (99 - 25) ** 2;
  const maxTotalDiff = maxDiffPerAttr * ATTRIBUTES.length;

  const filteredPlayers = typeof IS_TOP250_MODE !== "undefined" && IS_TOP250_MODE
    ? Object.fromEntries(Object.entries(players).filter(([name]) => TOP250.includes(name)))
    : players;

  const results = Object.entries(filteredPlayers).map(([name, stats]) => {
    let sum = 0;
    for (let attr of ATTRIBUTES) {
      if (stats[attr] != null && userStats[attr] != null) {
        const diff = userStats[attr] - stats[attr];
        sum += diff * diff;
      }
    }
    const normalizedDiff = sum / maxTotalDiff;
    const similarityScore = Math.max(0, Math.min(100, 100 - normalizedDiff * 100));
    return {
      name,
      score: similarityScore
    };
  }).sort((a, b) => b.score - a.score);

  const bestMatch = results[0];
  const html = `
    <h2>Your Best Match:</h2>
    <p><strong>${bestMatch.name}</strong> (Similarity Score: ${bestMatch.score.toFixed(2)})</p>
    <h3>Top 5 Closest Players:</h3>
    <ol>
      ${results.slice(0, 5).map(p => `<li>${p.name} (Score: ${p.score.toFixed(2)})</li>`).join("")}
    </ol>
  `;
  document.getElementById("result").innerHTML = html;
}
