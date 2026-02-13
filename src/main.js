import './style.css';

(() => {
  'use strict';

  // ── Elements ──
  const form = document.getElementById('addForm');
  const input = document.getElementById('todoInput');
  const list = document.getElementById('todoList');
  const emptyState = document.getElementById('emptyState');
  const dateDisplay = document.getElementById('dateDisplay');
  const totalCount = document.getElementById('totalCount');
  const activeCount = document.getElementById('activeCount');
  const completedCount = document.getElementById('completedCount');
  const progressRing = document.getElementById('progressRing');
  const progressText = document.getElementById('progressText');
  const itemsLeft = document.getElementById('itemsLeft');
  const clearBtn = document.getElementById('clearCompleted');
  const footer = document.getElementById('appFooter');
  const filterBtns = document.querySelectorAll('.filter-btn');

  const CIRCUMFERENCE = 2 * Math.PI * 20; // r=20
  let currentFilter = 'all';

  // ── Date display ──
  const now = new Date();
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  dateDisplay.textContent = now.toLocaleDateString('de-DE', options);

  // ── LocalStorage ──
  function loadTodos() {
    try {
      return JSON.parse(localStorage.getItem('todos')) || [];
    } catch {
      return [];
    }
  }

  function saveTodos(todos) {
    localStorage.setItem('todos', JSON.stringify(todos));
  }

  let todos = loadTodos();

  // ── Render ──
  function render() {
    const filtered = getFilteredTodos();
    list.innerHTML = '';

    filtered.forEach(todo => {
      const li = document.createElement('li');
      li.className = `todo-item${todo.completed ? ' completed' : ''}`;
      li.dataset.id = todo.id;

      li.innerHTML = `
        <label class="todo-checkbox">
          <input type="checkbox" ${todo.completed ? 'checked' : ''} />
          <span class="checkmark">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </span>
        </label>
        <span class="todo-text">${escapeHtml(todo.text)}</span>
        <button class="todo-delete" aria-label="Löschen">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      `;

      // Toggle complete
      li.querySelector('input[type="checkbox"]').addEventListener('change', () => toggleTodo(todo.id));

      // Delete
      li.querySelector('.todo-delete').addEventListener('click', () => deleteTodo(todo.id, li));

      list.appendChild(li);
    });

    updateStats();
    updateEmptyState(filtered.length);
  }

  function getFilteredTodos() {
    if (currentFilter === 'active') return todos.filter(t => !t.completed);
    if (currentFilter === 'completed') return todos.filter(t => t.completed);
    return [...todos];
  }

  // ── Stats ──
  function updateStats() {
    const total = todos.length;
    const done = todos.filter(t => t.completed).length;
    const active = total - done;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);

    totalCount.textContent = total;
    activeCount.textContent = active;
    completedCount.textContent = done;
    progressText.textContent = `${pct}%`;

    const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;
    progressRing.style.strokeDashoffset = offset;

    itemsLeft.textContent = `${active} Aufgabe${active !== 1 ? 'n' : ''} offen`;
    footer.classList.toggle('hidden', total === 0);
  }

  function updateEmptyState(count) {
    emptyState.classList.toggle('visible', count === 0);
  }

  // ── Actions ──
  function addTodo(text) {
    const todo = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      text: text.trim(),
      completed: false,
      createdAt: Date.now()
    };
    todos.unshift(todo);
    saveTodos(todos);
    render();
  }

  function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      saveTodos(todos);
      render();
    }
  }

  function deleteTodo(id, li) {
    li.classList.add('removing');
    li.addEventListener('animationend', () => {
      todos = todos.filter(t => t.id !== id);
      saveTodos(todos);
      render();
    });
  }

  function clearCompleted() {
    const items = list.querySelectorAll('.todo-item.completed');
    if (items.length === 0) return;

    items.forEach(item => item.classList.add('removing'));

    setTimeout(() => {
      todos = todos.filter(t => !t.completed);
      saveTodos(todos);
      render();
    }, 300);
  }

  // ── Helpers ──
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Events ──
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addTodo(text);
    input.value = '';
    input.focus();
  });

  clearBtn.addEventListener('click', clearCompleted);

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  // ── Init ──
  render();
})();
