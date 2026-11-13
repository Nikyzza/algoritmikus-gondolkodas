// Óriáskerék – életszerű utastömegekkel
const people = [45, 55, 70, 80];
const greedyStates = [
  { used: [], text: "Rendezett tömegek: 45, 55, 70, 80 kg.", boats: [] },
  { used: [3], text: "80 + 45 = 125 kg, ezért nem férnek be együtt. A 80 kg-os utas egyedül indul.", boats: ["80 kg"] },
  { used: [0, 2, 3], text: "70 + 45 = 115 kg, ezért ők együtt utazhatnak.", boats: ["80 kg", "70 + 45 kg"] },
  { used: [0, 1, 2, 3], text: "Az 55 kg-os utas maradt, ő egyedül indul. Összesen 3 gondola szükséges.", boats: ["80 kg", "70 + 45 kg", "55 kg"] }
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

// Python futtatása közvetlenül a böngészőben Pyodide segítségével
let pyodidePromise = null;

function getPyodideRuntime() {
  if (!pyodidePromise) {
    pyodidePromise = loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/"
    });
  }

  return pyodidePromise;
}

async function runPython(editorId, outputId, button) {
  const editor = document.querySelector(`#${editorId}`);
  const output = document.querySelector(`#${outputId}`);
  const originalButtonText = button.textContent;

  button.disabled = true;
  button.textContent = "Python betöltése…";
  output.classList.remove("error");
  output.textContent = "A futtatókörnyezet betöltése folyamatban…";

  try {
    const pyodide = await getPyodideRuntime();
    button.textContent = "Futtatás…";

    pyodide.globals.set("user_code", editor.value);

    const result = await pyodide.runPythonAsync(`
import contextlib
import io
import traceback

_output = io.StringIO()

try:
    with contextlib.redirect_stdout(_output), contextlib.redirect_stderr(_output):
        exec(user_code, {})
except Exception:
    traceback.print_exc(file=_output)

_output.getvalue()
    `);

    output.textContent = result || "A program lefutott, de nem írt ki semmit.";

    if (result && result.includes("Traceback")) {
      output.classList.add("error");
    }
  } catch (error) {
    output.classList.add("error");
    output.textContent = `A futtatás nem sikerült:\n${error.message}`;
  } finally {
    button.disabled = false;
    button.textContent = originalButtonText;
  }
}

document.querySelectorAll(".run-python").forEach((button) => {
  button.addEventListener("click", () => {
    runPython(button.dataset.editor, button.dataset.output, button);
  });
});
