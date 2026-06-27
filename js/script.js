/**
 * Expense & Budget Visualizer
 * script.js — Vanilla JavaScript only, no frameworks.
 *
 * Functions:
 *  - addTransaction()
 *  - deleteTransaction()
 *  - saveToLocalStorage()
 *  - loadFromLocalStorage()
 *  - updateBalance()
 *  - updateTransactionList()
 *  - updateChart()
 *  - toggleDarkMode()
 *  - sortTransactions()
 *  - renderCategories()
 */

'use strict';

/* =========================================================
   STATE
   ========================================================= */

/** @type {Array<{id:string, name:string, amount:number, category:string, date:number}>} */
let transactions = [];

/** @type {string[]} Default + custom categories */
let categories = ['Food', 'Transport', 'Fun'];

/** @type {string} Current sort key */
let currentSort = 'date-desc';

/** @type {boolean} Dark mode flag */
let isDarkMode = false;

/** @type {Chart|null} Chart.js instance */
let chartInstance = null;

/* =========================================================
   STORAGE KEYS
   ========================================================= */
const KEY_TRANSACTIONS = 'ebv_transactions';
const KEY_CATEGORIES   = 'ebv_categories';
const KEY_THEME        = 'ebv_theme';

/* =========================================================
   CATEGORY ICONS / COLOURS
   ========================================================= */
const CATEGORY_META = {
  food:      { icon: '🍔', colorHex: '#f59e0b', badgeClass: 'badge-food' },
  transport: { icon: '🚗', colorHex: '#3b82f6', badgeClass: 'badge-transport' },
  fun:       { icon: '🎉', colorHex: '#ec4899', badgeClass: 'badge-fun' },
};

/** Return metadata for any category (built-in or custom). */
function getCategoryMeta(category) {
  const key = category.toLowerCase();
  return CATEGORY_META[key] || { icon: '📌', colorHex: '#10b981', badgeClass: 'badge-custom' };
}

/* =========================================================
   LOCAL STORAGE
   ========================================================= */

/** Persist all state to localStorage. */
function saveToLocalStorage() {
  localStorage.setItem(KEY_TRANSACTIONS, JSON.stringify(transactions));
  localStorage.setItem(KEY_CATEGORIES,   JSON.stringify(categories));
  localStorage.setItem(KEY_THEME,        isDarkMode ? 'dark' : 'light');
}

/** Load all state from localStorage. */
function loadFromLocalStorage() {
  const txRaw   = localStorage.getItem(KEY_TRANSACTIONS);
  const catRaw  = localStorage.getItem(KEY_CATEGORIES);
  const theme   = localStorage.getItem(KEY_THEME);

  transactions = txRaw  ? JSON.parse(txRaw)  : [];
  categories   = catRaw ? JSON.parse(catRaw) : ['Food', 'Transport', 'Fun'];
  isDarkMode   = theme === 'dark';
}

/* =========================================================
   UNIQUE ID
   ========================================================= */

/** Generate a simple unique ID string. */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* =========================================================
   ADD TRANSACTION
   ========================================================= */

/**
 * Validate the form, create a new transaction object, and update UI.
 * @returns {void}
 */
function addTransaction() {
  const nameInput     = document.getElementById('item-name');
  const amountInput   = document.getElementById('amount');
  const categoryInput = document.getElementById('category');

  const name     = nameInput.value.trim();
  const amount   = parseFloat(amountInput.value);
  const category = categoryInput.value;

  // --- Validation ---
  let valid = true;

  clearFieldError('item-name', 'err-name');
  clearFieldError('amount', 'err-amount');
  clearFieldError('category', 'err-category');

  if (!name) {
    showFieldError('item-name', 'err-name', 'Item name is required.');
    valid = false;
  }

  if (isNaN(amount) || amount <= 0) {
    showFieldError('amount', 'err-amount', 'Enter a valid amount greater than zero.');
    valid = false;
  }

  if (!category) {
    showFieldError('category', 'err-category', 'Please select a category.');
    valid = false;
  }

  if (!valid) return;

  // --- Create transaction ---
  /** @type {{id:string, name:string, amount:number, category:string, date:number}} */
  const transaction = {
    id:       generateId(),
    name,
    amount,
    category,
    date:     Date.now(),
  };

  transactions.push(transaction);
  saveToLocalStorage();

  // Reset form fields
  nameInput.value   = '';
  amountInput.value = '';
  categoryInput.selectedIndex = 0;

  // Refresh UI
  updateBalance();
  updateTransactionList();
  updateChart();
}

/* =========================================================
   DELETE TRANSACTION
   ========================================================= */

/**
 * Remove a transaction by its ID.
 * @param {string} id
 */
function deleteTransaction(id) {
  transactions = transactions.filter(tx => tx.id !== id);
  saveToLocalStorage();

  updateBalance();
  updateTransactionList();
  updateChart();
}

/* =========================================================
   SORT TRANSACTIONS
   ========================================================= */

/**
 * Return a sorted copy of the transactions array based on currentSort.
 * @returns {Array}
 */
function sortTransactions() {
  const copy = [...transactions];

  switch (currentSort) {
    case 'date-desc':
      return copy.sort((a, b) => b.date - a.date);
    case 'date-asc':
      return copy.sort((a, b) => a.date - b.date);
    case 'amount-desc':
      return copy.sort((a, b) => b.amount - a.amount);
    case 'amount-asc':
      return copy.sort((a, b) => a.amount - b.amount);
    case 'category-asc':
      return copy.sort((a, b) => a.category.localeCompare(b.category));
    default:
      return copy;
  }
}

/* =========================================================
   UPDATE BALANCE
   ========================================================= */

/** Recalculate total spending and update the DOM. */
function updateBalance() {
  const total = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  document.getElementById('total-spending').textContent = formatRupiah(total);
}

/* =========================================================
   UPDATE TRANSACTION LIST
   ========================================================= */

/** Re-render the transaction list in the DOM. */
function updateTransactionList() {
  const listEl    = document.getElementById('transaction-list');
  const emptyMsg  = document.getElementById('empty-msg');
  const sorted    = sortTransactions();

  listEl.innerHTML = '';

  if (sorted.length === 0) {
    emptyMsg.hidden = false;
    return;
  }

  emptyMsg.hidden = true;

  sorted.forEach(tx => {
    const meta = getCategoryMeta(tx.category);
    const dateStr = new Date(tx.date).toLocaleDateString('id-ID', {
      day:   '2-digit',
      month: 'short',
      year:  'numeric',
    });

    const li = document.createElement('li');
    li.className = 'transaction-item';
    li.dataset.id = tx.id;

    li.innerHTML = `
      <span class="tx-icon" aria-hidden="true">${meta.icon}</span>
      <div class="tx-details">
        <p class="tx-name">${escapeHtml(tx.name)}</p>
        <p class="tx-meta">
          <span class="badge ${meta.badgeClass}">${escapeHtml(tx.category)}</span>
          ${dateStr}
        </p>
      </div>
      <span class="tx-amount">${formatRupiah(tx.amount)}</span>
      <button
        class="btn btn-danger"
        aria-label="Delete ${escapeHtml(tx.name)}"
        data-id="${tx.id}"
      >Delete</button>
    `;

    listEl.appendChild(li);
  });
}

/* =========================================================
   UPDATE CHART
   ========================================================= */

/** Rebuild the Chart.js pie chart with current transaction data. */
function updateChart() {
  const canvas   = document.getElementById('expense-chart');
  const emptyMsg = document.getElementById('chart-empty-msg');

  if (transactions.length === 0) {
    emptyMsg.hidden = false;
    canvas.hidden   = true;
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    return;
  }

  emptyMsg.hidden = false; // keep in DOM but use hidden attribute
  emptyMsg.hidden = true;
  canvas.hidden   = false;

  // Aggregate amounts by category
  /** @type {Record<string, number>} */
  const totals = {};
  transactions.forEach(tx => {
    totals[tx.category] = (totals[tx.category] || 0) + tx.amount;
  });

  const labels = Object.keys(totals);
  const data   = Object.values(totals);
  const colors = labels.map(cat => getCategoryMeta(cat).colorHex);

  if (chartInstance) {
    // Update existing chart instead of recreating (smoother)
    chartInstance.data.labels        = labels;
    chartInstance.data.datasets[0].data            = data;
    chartInstance.data.datasets[0].backgroundColor = colors;
    chartInstance.update();
    return;
  }

  // Create new chart
  chartInstance = new Chart(canvas, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor:      isDarkMode ? '#1a1a2e' : '#ffffff',
        borderWidth:      3,
        hoverOffset:      8,
      }],
    },
    options: {
      responsive:          true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding:   16,
            boxWidth:  14,
            color:     isDarkMode ? '#e2e8f0' : '#1a1a2e',
            font: { size: 13 },
          },
        },
        tooltip: {
          callbacks: {
            label: ctx => {
              const value   = ctx.parsed;
              const total   = ctx.dataset.data.reduce((s, v) => s + v, 0);
              const pct     = ((value / total) * 100).toFixed(1);
              return ` ${formatRupiah(value)} (${pct}%)`;
            },
          },
        },
      },
    },
  });
}

/* =========================================================
   DARK MODE
   ========================================================= */

/** Toggle dark/light mode and persist preference. */
function toggleDarkMode() {
  isDarkMode = !isDarkMode;
  applyTheme();
  saveToLocalStorage();

  // Recreate chart so legend colours update
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
    updateChart();
  }
}

/** Apply the current theme to the DOM. */
function applyTheme() {
  document.body.classList.toggle('dark-mode', isDarkMode);
  document.getElementById('dark-mode-icon').textContent = isDarkMode ? '☀️' : '🌙';
}

/* =========================================================
   CATEGORIES
   ========================================================= */

/** Render all categories as <option> elements in the category select. */
function renderCategories() {
  const select = document.getElementById('category');
  select.innerHTML = '';

  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value       = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
}

/** Open the add-category modal. */
function openCategoryModal() {
  const modal = document.getElementById('category-modal');
  const input = document.getElementById('new-category-input');
  input.value = '';
  clearFieldError('new-category-input', 'err-new-category');
  modal.hidden = false;
  input.focus();
}

/** Close the add-category modal. */
function closeCategoryModal() {
  document.getElementById('category-modal').hidden = true;
}

/**
 * Save a new custom category.
 * Validates that it's not empty and not a duplicate.
 */
function saveNewCategory() {
  const input   = document.getElementById('new-category-input');
  const newCat  = input.value.trim();

  clearFieldError('new-category-input', 'err-new-category');

  if (!newCat) {
    showFieldError('new-category-input', 'err-new-category', 'Category name cannot be empty.');
    return;
  }

  const duplicate = categories.some(
    cat => cat.toLowerCase() === newCat.toLowerCase()
  );

  if (duplicate) {
    showFieldError('new-category-input', 'err-new-category', 'This category already exists.');
    return;
  }

  categories.push(newCat);
  saveToLocalStorage();
  renderCategories();

  // Auto-select the new category
  const select = document.getElementById('category');
  select.value = newCat;

  closeCategoryModal();
}

/* =========================================================
   VALIDATION HELPERS
   ========================================================= */

/**
 * Mark a field as invalid and display an error message.
 * @param {string} inputId
 * @param {string} errorId
 * @param {string} message
 */
function showFieldError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (input)  input.classList.add('invalid');
  if (error)  error.textContent = message;
}

/**
 * Clear a field's invalid state.
 * @param {string} inputId
 * @param {string} errorId
 */
function clearFieldError(inputId, errorId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (input)  input.classList.remove('invalid');
  if (error)  error.textContent = '';
}

/* =========================================================
   FORMAT HELPERS
   ========================================================= */

/**
 * Format a number as Indonesian Rupiah string.
 * @param {number} amount
 * @returns {string}
 */
function formatRupiah(amount) {
  return 'Rp ' + amount.toLocaleString('id-ID');
}

/**
 * Escape HTML special characters to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const map = { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' };
  return String(str).replace(/[&<>"']/g, ch => map[ch]);
}

/* =========================================================
   EVENT LISTENERS
   ========================================================= */

/** Wire up all interactive elements. */
function bindEvents() {
  // Form submit
  document.getElementById('transaction-form').addEventListener('submit', e => {
    e.preventDefault();
    addTransaction();
  });

  // Delete button (event delegation on the list)
  document.getElementById('transaction-list').addEventListener('click', e => {
    const btn = e.target.closest('.btn-danger[data-id]');
    if (btn) deleteTransaction(btn.dataset.id);
  });

  // Dark mode toggle
  document.getElementById('btn-dark-mode').addEventListener('click', toggleDarkMode);

  // Sort select
  document.getElementById('sort-select').addEventListener('change', e => {
    currentSort = e.target.value;
    updateTransactionList();
  });

  // Add category modal
  document.getElementById('btn-add-category').addEventListener('click', openCategoryModal);
  document.getElementById('btn-save-category').addEventListener('click', saveNewCategory);
  document.getElementById('btn-cancel-category').addEventListener('click', closeCategoryModal);

  // Close modal on overlay click
  document.getElementById('category-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeCategoryModal();
  });

  // Close modal with Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeCategoryModal();
  });

  // Allow Enter in new-category input
  document.getElementById('new-category-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') saveNewCategory();
  });

  // Clear validation error on input
  ['item-name', 'amount', 'category'].forEach(id => {
    const errMap = { 'item-name': 'err-name', 'amount': 'err-amount', 'category': 'err-category' };
    document.getElementById(id).addEventListener('input', () => {
      clearFieldError(id, errMap[id]);
    });
  });
}

/* =========================================================
   INITIALISE
   ========================================================= */

/** Bootstrap the application on DOMContentLoaded. */
function init() {
  loadFromLocalStorage();
  applyTheme();
  renderCategories();
  updateBalance();
  updateTransactionList();
  updateChart();
  bindEvents();
}

document.addEventListener('DOMContentLoaded', init);
