import { useReducer } from "react";
import "./style.css";

// --- logic start -------------------------------------------------------------
const DENOMS = [25, 10, 5]; // coin values in cents, largest first
const MAX_CREDIT = 500;

const money = (c) => `$${(c / 100).toFixed(2)}`;
const zero = () => ({ 25: 0, 10: 0, 5: 0 });
const total = (c) => DENOMS.reduce((sum, d) => sum + d * c[d], 0);
const add = (a, b) => ({ 25: a[25] + b[25], 10: a[10] + b[10], 5: a[5] + b[5] });
const sub = (a, b) => ({ 25: a[25] - b[25], 10: a[10] - b[10], 5: a[5] - b[5] });
const coinText = (c) => DENOMS.filter((d) => c[d]).map((d) => `${c[d]} \u00D7 ${d}\u00A2`).join(", ");
const say = (tone, text) => ({ tone, text });

// Make change using only the coins we actually have. Greedy can fail with a limited
// supply (e.g. 30 cents with one quarter, no nickels, three dimes), so we backtrack.
function makeChange(amount, available) {
  function go(i, left, used) {
    if (left === 0) return { ...zero(), ...used };
    if (i === DENOMS.length) return null;
    const d = DENOMS[i];
    const most = Math.min(available[d], Math.floor(left / d));
    for (let n = most; n >= 0; n--) {
      const result = go(i + 1, left - n * d, { ...used, [d]: n });
      if (result) return result;
    }
    return null;
  }
  return go(0, amount, {});
}

const initialState = {
  float: { 25: 4, 10: 4, 5: 4 }, // coins the machine holds for change
  inserted: zero(), // coins the customer has put in for the current sale
  tray: [], // purchased items waiting to be collected
  change: null, // coins waiting in the return slot
  serial: 0,
  message: say("info", "Insert coins to get started."),
  products: [
    { id: "A1", name: "Chips", emoji: "\u{1F35F}", price: 65, stock: 3 },
    { id: "A2", name: "Candy", emoji: "\u{1F36C}", price: 45, stock: 2 },
    { id: "A3", name: "Soda", emoji: "\u{1F964}", price: 90, stock: 0 },
    { id: "B1", name: "Cookie", emoji: "\u{1F36A}", price: 55, stock: 4 },
    { id: "B2", name: "Juice", emoji: "\u{1F9C3}", price: 120, stock: 2 },
    { id: "B3", name: "Chocolate", emoji: "\u{1F36B}", price: 85, stock: 1 },
  ],
};

function reducer(state, action) {
  const credit = total(state.inserted);
  switch (action.type) {
    case "INSERT": {
      const coins = action.coins; // e.g. { 25: 1 } or { 25: 4 } for one dollar
      const amount = total({ ...zero(), ...coins });
      if (credit + amount > MAX_CREDIT) {
        return { ...state, message: say("error",
          `The machine takes up to ${money(MAX_CREDIT)}. Pick a snack or refund.`) };
      }
      const inserted = add(state.inserted, { ...zero(), ...coins });
      return { ...state, inserted,
        message: say("info", `Credit ${money(total(inserted))}. Choose a snack.`) };
    }
    case "SELECT": {
      const p = state.products.find((x) => x.id === action.id);
      if (!p) return state;
      if (p.stock === 0) return { ...state, message: say("error", `${p.name} is sold out.`) };
      if (credit === 0) {
        return { ...state, message: say("warn", `Insert ${money(p.price)} to buy ${p.name}.`) };
      }
      if (credit < p.price) {
        return { ...state, message: say("warn",
          `Add ${money(p.price - credit)} more for ${p.name}.`) };
      }
      const due = credit - p.price;
      const pool = add(state.float, state.inserted); // inserted coins can be used as change
      const given = makeChange(due, pool);
      if (!given) {
        return { ...state, message: say("error",
          `Exact change only: no way to return ${money(due)}. Pick another snack or refund.`) };
      }
      return {
        ...state,
        float: sub(pool, given),
        inserted: zero(),
        serial: state.serial + 1,
        products: state.products.map((x) => (x.id === p.id ? { ...x, stock: x.stock - 1 } : x)),
        tray: [...state.tray, { key: state.serial, emoji: p.emoji, name: p.name }],
        change: due ? add(state.change || zero(), given) : state.change,
        message: say("success", due
          ? `Enjoy your ${p.name}! Change: ${money(due)}.`
          : `Enjoy your ${p.name}!`),
      };
    }
    case "REFUND":
      if (credit === 0) return { ...state, message: say("info", "No credit to refund.") };
      return {
        ...state,
        inserted: zero(),
        change: add(state.change || zero(), state.inserted), // return the same coins
        message: say("info", `Refunded ${money(credit)}.`),
      };
    case "COLLECT":
      return { ...state, tray: [], change: null, message: say("info", "Collected. Enjoy!") };
    case "RESTOCK":
      return { ...initialState, message: say("info", "Machine restocked.") };
    default:
      return state;
  }
}
// --- logic end ---------------------------------------------------------------

const COIN_BUTTONS = [
  { text: "5\u00A2", coins: { 5: 1 } },
  { text: "10\u00A2", coins: { 10: 1 } },
  { text: "25\u00A2", coins: { 25: 1 } },
  { text: "$1 (4 quarters)", coins: { 25: 4 } },
];

export default function VendingMachine() {
  const [s, dispatch] = useReducer(reducer, initialState);
  const credit = total(s.inserted);

  return (
    <main className="vm-page">
      <section className="vm" aria-label="Vending machine">
        <h1>Snack Stop</h1>

         <div className="panel">
          <div className="display">
            <small>Credit</small>
            <output>{money(credit)}</output>
          </div>
          <p className={`message ${s.message.tone}`} role="status" aria-live="polite">
            {s.message.text}
          </p>
          <div className="coins" role="group" aria-label="Insert coins">
            {COIN_BUTTONS.map((c) => (
              <button key={c.text} className="coin"
                      onClick={() => dispatch({ type: "INSERT", coins: c.coins })}>
                +{c.text}
              </button>
            ))}
          </div>
          <button className="ghost" disabled={credit === 0}
                  onClick={() => dispatch({ type: "REFUND" })}>
            {credit ? `Refund ${money(credit)}` : "Refund"}
          </button>
        </div>

        
        <div className="grid">
          {s.products.map((p) => {
            const out = p.stock === 0;
            return (
              <button key={p.id} className={`slot${!out && credit >= p.price ? " ready" : ""}`}
                      disabled={out} onClick={() => dispatch({ type: "SELECT", id: p.id })}
                      aria-label={`${p.id} ${p.name}, ${money(p.price)}${out ? ", sold out" : ""}`}>
                <small>{p.id}</small>
                <span className="emoji" aria-hidden="true">{p.emoji}</span>
                <strong>{p.name}</strong>
                <span className="price">{money(p.price)}</span>
                <small>{out ? "Sold out" : `${p.stock} left`}</small>
              </button>
            );
          })}
        </div>

       

        <div className="tray">
          <h2>Pickup tray</h2>
          <p>Items: {s.tray.length ? s.tray.map((t) => `${t.emoji} ${t.name}`).join(", ") : "none"}</p>
          <p>Change: {s.change ? `${money(total(s.change))} (${coinText(s.change)})` : "none"}</p>
          <button className="ghost" disabled={!s.tray.length && !s.change}
                  onClick={() => dispatch({ type: "COLLECT" })}>
            Collect
          </button>
        </div>

        <div className="admin">
          <p>
            Coins in machine: {s.float[25]} quarters, {s.float[10]} dimes, {s.float[5]} nickels
            ({money(total(s.float))})
          </p>
          <button className="ghost" onClick={() => dispatch({ type: "RESTOCK" })}>
            Restock machine
          </button>
        </div>
      </section>
    </main>
  );
}
