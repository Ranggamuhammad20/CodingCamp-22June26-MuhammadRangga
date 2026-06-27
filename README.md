# 💰 Expense & Budget Visualizer

A mobile-friendly expense tracking web app built with plain HTML, CSS, and Vanilla JavaScript.  
All data is stored client-side using the browser's **LocalStorage API** — no backend required.

---

## ✨ Features

| Feature | Details |
|---|---|
| **Total Spending** | Live total updates on every add / delete |
| **Add Transaction** | Name, amount, and category with real-time validation |
| **Transaction History** | Scrollable list with delete button per item |
| **Pie Chart** | Auto-updating chart via [Chart.js](https://www.chartjs.org/) |
| **Custom Categories** | Create unlimited personal categories |
| **Sort Transactions** | Sort by date, amount, or category |
| **Dark / Light Mode** | Toggle with preference saved to localStorage |
| **Responsive Design** | Works on mobile, tablet, and desktop |

---

## 🗂 Folder Structure

```
project/
├── index.html          ← App entry point
├── css/
│   └── style.css       ← All styles (single file)
├── js/
│   └── script.js       ← All JavaScript (single file, no frameworks)
├── assets/             ← Static assets (images, icons, etc.)
└── README.md           ← This file
```

---

## 🚀 Getting Started (Local)

1. Clone or download this repository.
2. Open `index.html` directly in any modern browser — **no build step needed**.

```bash
# Example with VS Code Live Server
code .
# Then right-click index.html → Open with Live Server
```

---

## 🌐 GitHub Pages Deployment

### Step 1 — Create a GitHub Repository

1. Go to [github.com/new](https://github.com/new).
2. Name the repo (e.g. `expense-budget-visualizer`).
3. Keep it **Public**.
4. Click **Create repository**.

### Step 2 — Push the Code

```bash
git init
git add .
git commit -m "Initial commit: Expense & Budget Visualizer"
git branch -M main
git remote add origin https://github.com/<your-username>/expense-budget-visualizer.git
git push -u origin main
```

### Step 3 — Enable GitHub Pages

1. In your repo, go to **Settings → Pages**.
2. Under **Source**, choose **Deploy from a branch**.
3. Select the `main` branch and `/ (root)` folder.
4. Click **Save**.

### Step 4 — Access Your App

GitHub will publish the site at:

```
https://<your-username>.github.io/expense-budget-visualizer/
```

It may take 1–2 minutes for the first deployment to go live.

---

## 🛠 Technical Notes

- **No frameworks** — pure HTML / CSS / Vanilla JS.
- **Chart.js** is loaded from a CDN (`cdn.jsdelivr.net`), so an internet connection is needed for the chart.
- LocalStorage keys used:
  - `ebv_transactions` — array of transaction objects
  - `ebv_categories` — array of category strings
  - `ebv_theme` — `"dark"` or `"light"`

---

## 📄 License

MIT — free to use and modify.
