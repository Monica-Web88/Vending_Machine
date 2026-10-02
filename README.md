# 🥤 Snack Stop – Vending Machine App

A interactive vending machine simulator built with **React** and a **`useReducer`-driven state machine**. Users insert coins, pick a snack, and get their item plus correct change — with smart handling of limited coin supply, sold-out items, and "exact change only" edge cases.

**🔗 Live Demo:** [Add your deployed link here]
**📦 Repo:** [Add your GitHub repo link here]

---

## 📖 Overview

This project models the real behavior of a physical vending machine: a customer inserts coins, selects a product, and the machine decides whether the sale can complete based on credit, stock, and the coins it has on hand to make change. All business logic lives in a single pure reducer, making the app easy to reason about, test, and extend.

It was built to practice **predictable state management**, **algorithmic problem solving** (change-making with a limited coin supply), and **accessible UI design**.

---

## ✨ Key Features

- 🪙 **Coin insertion** – nickels, dimes, quarters, or a one-dollar bundle (4 quarters), with a **$5.00 max credit** limit
- 🍫 **Product grid** with price, live stock count, and sold-out states
- 💱 **Smart change-making** – uses only the coins the machine actually has, via a backtracking algorithm (greedy fails in some real cases)
- 🚫 **"Exact change only" handling** – blocks a sale gracefully when change can't be returned
- ↩️ **Refund** – returns the exact coins the customer inserted
- 📦 **Pickup tray** – collects purchased items and returned change (with coin breakdown)
- 🔧 **Restock / admin panel** – shows coins held in the machine and resets the machine
- 💬 **Status messages** with success / warning / error / info tones
- ♿ **Accessible UI** – `aria-live` status updates, descriptive `aria-label`s, and semantic roles

---

## 🛠️ Tech Stack

### Frontend
- **React** (functional components + Hooks)
- **`useReducer`** for centralized, predictable state transitions
- **JavaScript (ES6+)**
- **CSS** for styling

### Tooling
- npm scripts for dev/build workflows
- [Add your bundler here, e.g. Vite / Create React App]

---

## 🧮 How the Change-Making Works

A simple greedy approach (always use the largest coin first) can fail when coin supply is limited. For example, returning **30¢** with one quarter, no nickels, and three dimes works with 3 dimes — but greedy grabs the quarter first and gets stuck.

This app uses a **recursive backtracking** search over the available coins, trying the largest count of each denomination first and stepping back when a path dead-ends. The customer's own inserted coins are also added to the pool, just like a real machine.

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone [your-repo-url]
cd [your-project-folder]

# Install dependencies
npm install

# Run the app locally
npm run dev
```

Open the local URL shown in your terminal (e.g. [http://localhost:5173](http://localhost:5173) or [http://localhost:3000](http://localhost:3000)) to view it in your browser.

### Available Scripts
| Command | Description |
|---|---|
| `npm run dev` | Runs the app in development mode |
| `npm test` | Runs the test suite |
| `npm run build` | Builds an optimized production bundle |

> Adjust the commands above to match your bundler (`npm start` for Create React App).

---

## 📂 Project Structure

```
src/
  VendingMachine.jsx   # Component + reducer + change-making logic
  style.css            # Machine, grid, and tray styling
public/
```

---

## 🧠 What I Learned / Challenges Solved

- Modeling a real-world system as a **pure reducer** with clear actions (`INSERT`, `SELECT`, `REFUND`, `COLLECT`, `RESTOCK`)
- Solving the **limited-coin change-making problem** with backtracking instead of a naive greedy approach
- Handling edge cases: sold-out items, insufficient credit, credit cap, and unreturnable change
- Keeping state immutable while tracking coin counts per denomination
- Building clear, accessible feedback with live-region status messages

---

## 🔮 Future Improvements

- Add unit tests for the reducer and `makeChange`
- Support bills and card payments
- Add an admin mode to edit prices, stock, and coin float
- Add purchase animations and sound effects

---

*Built with [React](https://react.dev/).*

