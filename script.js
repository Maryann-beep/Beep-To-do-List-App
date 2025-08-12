const form = document.getElementById("todo-form");
const input = document.getElementById("input_field");
const list = document.getElementById("list");
const itemsLeft = document.getElementById("items-left");
const filterButtons = document.querySelectorAll(".filter-btn");
const clearCompletedBtn = document.querySelector(".clear-completed-btn");

let tasks = [];
let dragSrcIndex = null;

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (text === "") return;

  const task = { id: Date.now(), text, completed: false };
  tasks.push(task);
  input.value = "";
  renderTasks();
});

list.addEventListener("click", (e) => {
  if (e.target.classList.contains("check_mark")) {
    const id = parseInt(e.target.closest("li").dataset.id);
    tasks = tasks.map((t) => t.id === id ? { ...t, completed: !t.completed } : t);
    renderTasks();
  }

  if (e.target.closest(".delete-btn")) {
    const id = parseInt(e.target.closest("li").dataset.id);
    tasks = tasks.filter(t => t.id !== id);
    renderTasks();
  }
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".filter-btn.active").classList.remove("active");
    btn.classList.add("active");
    renderTasks();
  });
});

clearCompletedBtn.addEventListener("click", () => {
  tasks = tasks.filter((t) => !t.completed);
  renderTasks();
});

function renderTasks() {
  const activeFilter = document.querySelector(".filter-btn.active").dataset.filter;
  list.innerHTML = "";

  let filteredTasks = tasks;
  if (activeFilter === "active") {
    filteredTasks = tasks.filter(t => !t.completed);
  } else if (activeFilter === "completed") {
    filteredTasks = tasks.filter(t => t.completed);
  }

  filteredTasks.forEach((task, idx) => {
    const li = document.createElement("li");
    li.dataset.id = task.id;
    if (task.completed) li.classList.add("completed");

    // Make li draggable
    li.setAttribute("draggable", "true");
    li.dataset.index = idx;

    // Drag event listeners
    li.addEventListener("dragstart", handleDragStart);
    li.addEventListener("dragover", handleDragOver);
    li.addEventListener("drop", handleDrop);
    li.addEventListener("dragend", handleDragEnd);
    li.addEventListener("dragenter", handleDragEnter);
    li.addEventListener("dragleave", handleDragLeave);

    const btn = document.createElement("button");
    btn.className = "check_mark";
    li.appendChild(btn);

    const span = document.createElement("span");
    span.textContent = task.text;
    li.appendChild(span);

    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.innerHTML = '<i class="fas fa-trash"></i>';
    li.appendChild(delBtn);

    list.appendChild(li);
  });

  const remaining = tasks.filter(t => !t.completed).length;
  itemsLeft.textContent = `${remaining} item${remaining !== 1 ? "s" : ""} left`;
}

// Drag-and-drop handlers
function handleDragStart(e) {
  dragSrcIndex = Number(this.dataset.index);
  this.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  this.classList.add("drag-over");
}

function handleDrop(e) {
  e.preventDefault();
  this.classList.remove("drag-over");
  const dropIdx = Number(this.dataset.index);

  // Only reorder if actually different
  if (dragSrcIndex !== null && dragSrcIndex !== dropIdx) {
    // Map filteredTasks to global tasks' indices
    const activeFilter = document.querySelector(".filter-btn.active").dataset.filter;
    let filteredIndices = tasks.map((t, i) => ({...t, i}));
    if (activeFilter === "active") {
      filteredIndices = filteredIndices.filter(t => !t.completed);
    } else if (activeFilter === "completed") {
      filteredIndices = filteredIndices.filter(t => t.completed);
    }

    // Find the actual global indices
    const fromGlobalIdx = filteredIndices[dragSrcIndex].i;
    const toGlobalIdx = filteredIndices[dropIdx].i;

    // Move the item in tasks
    const [moved] = tasks.splice(fromGlobalIdx, 1);
    tasks.splice(toGlobalIdx, 0, moved);
    renderTasks();
  }
  dragSrcIndex = null;
}

function handleDragEnd() {
  this.classList.remove("dragging");
  const lis = document.querySelectorAll("#list li");
  lis.forEach(li => li.classList.remove("drag-over"));
}

function handleDragEnter(e) {
  e.preventDefault();
  this.classList.add("drag-over");
}
function handleDragLeave() {
  this.classList.remove("drag-over");
}

const toggleThemeBtn = document.querySelector(".icon-sun");

toggleThemeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");

  // Optional: Switch icon between sun and moon
  const isLight = document.body.classList.contains("light-mode");
  toggleThemeBtn.src = isLight
    ? "assets/icon-moon.svg"
    : "assets/icon-sun.svg";
});
