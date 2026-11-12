// Óriáskerék – egyszerű, négylépéses szemléltetés
const people = [2, 3, 7, 9];
const greedyStates = [
  { used: [], text: "A tömegeket növekvő sorrendbe rendezzük: 2, 3, 7, 9.", boats: [] },
  { used: [3], text: "9 + 2 = 11, ezért a 9 kg-os gyerek egyedül indul.", boats: ["9 kg"] },
  { used: [1, 2, 3], text: "7 + 3 = 10, ezért ők együtt utazhatnak.", boats: ["9 kg", "7 + 3 kg"] },
  { used: [0, 1, 2, 3], text: "A 2 kg-os gyerek maradt. Összesen 3 gondola szükséges.", boats: ["9 kg", "7 + 3 kg", "2 kg"] }
];
let greedyStep = 0;

function renderGreedy() {
  const state = greedyStates[greedyStep];
  document.querySelector("#greedyPeople").innerHTML = people.map((value, index) =>
    `<span class="person ${state.used.includes(index) ? "used" : ""}">${value} kg</span>`
  ).join("");
  document.querySelector("#greedyResult").textContent = state.text;
  document.querySelector("#greedyBoats").innerHTML = state.boats.map((boat, index) =>
    `<span>${index + 1}. gondola: ${boat}</span>`
  ).join("");
  document.querySelector("#greedyNext").disabled = greedyStep === greedyStates.length - 1;
}

document.querySelector("#greedyNext").addEventListener("click", () => {
  if (greedyStep < greedyStates.length - 1) greedyStep += 1;
  renderGreedy();
});
document.querySelector("#greedyReset").addEventListener("click", () => { greedyStep = 0; renderGreedy(); });

// Labirintus – a BFS rétegeinek megjelenítése
const mazeRows = ["#######", "#A#...#", "#.#.#B#", "#.....#", "#######"];
const start = [1, 1];
const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const positionKey = ([row, column]) => `${row},${column}`;
let layer = 0;
let frontier = [start];
let visited = new Set([positionKey(start)]);
let found = false;

function renderMaze() {
  const maze = document.querySelector("#maze");
  maze.innerHTML = "";
  mazeRows.forEach((row, rowIndex) => [...row].forEach((character, columnIndex) => {
    const cell = document.createElement("div");
    const pos = [rowIndex, columnIndex];
    cell.className = "cell";
    if (character === "#") cell.classList.add("wall");
    if (character === "A") cell.classList.add("start");
    if (character === "B") cell.classList.add("goal");
    if (visited.has(positionKey(pos)) && character === ".") cell.classList.add("visited");
    if (frontier.some(([r, c]) => r === rowIndex && c === columnIndex) && character === ".") cell.classList.add("frontier");
    cell.textContent = character === "A" || character === "B" ? character : "";
    maze.appendChild(cell);
  }));
  document.querySelector("#bfsNext").disabled = found || frontier.length === 0;
}

function nextLayer() {
  if (found) return;
  const next = [];
  for (const [row, column] of frontier) {
    for (const [dr, dc] of directions) {
      const nextPosition = [row + dr, column + dc];
      const character = mazeRows[nextPosition[0]][nextPosition[1]];
      const key = positionKey(nextPosition);
      if (character !== "#" && !visited.has(key)) {
        visited.add(key);
        next.push(nextPosition);
        if (character === "B") found = true;
      }
    }
  }
  frontier = next;
  layer += 1;
  document.querySelector("#bfsResult").textContent = found
    ? `A kijáratot a ${layer}. rétegben értük el. A legrövidebb út ${layer} lépés.`
    : `Most a ${layer}. réteget látjuk: ezek a mezők ${layer} lépésre vannak A-tól.`;
  renderMaze();
}

function resetBfs() {
  layer = 0;
  frontier = [start];
  visited = new Set([positionKey(start)]);
  found = false;
  document.querySelector("#bfsResult").textContent = "A kezdőpont a 0. réteg.";
  renderMaze();
}

document.querySelector("#bfsNext").addEventListener("click", nextLayer);
document.querySelector("#bfsReset").addEventListener("click", resetBfs);

renderGreedy();
resetBfs();
