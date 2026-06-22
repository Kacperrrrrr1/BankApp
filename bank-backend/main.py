"""Bank REST API — FastAPI backend."""

from datetime import datetime
import time

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import database as db
from models import (
    BankState,
    DepositRequest,
    WithdrawRequest,
    TransferRequest,
    OpenLokataRequest,
    TakeLoanRequest,
    RepayLoanRequest,
)

# ── App setup ──────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Bank API",
    version="1.0.0",
    description="Backend dla aplikacji bankowej React + TypeScript",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Helpers ────────────────────────────────────────────────────────────────────

def r2(x: float) -> float:
    return round(x, 2)


def now() -> str:
    return datetime.now().strftime("%d.%m.%Y, %H:%M")


def make_tx(balance: float, type_: str, amount: float, desc: str) -> dict:
    return {
        "id": time.time() * 1000,
        "date": now(),
        "type": type_,
        "amount": r2(amount),
        "description": desc,
        "balance": r2(balance),
    }


def insufficient(balance: float) -> None:
    raise HTTPException(
        status_code=400,
        detail=f"Niewystarczające środki. Dostępne: {balance:.2f}\u00a0PLN",
    )


# ── Account ────────────────────────────────────────────────────────────────────

@app.get("/api/account", response_model=BankState, summary="Pobierz stan konta")
def get_account():
    """Zwraca pełny stan konta: saldo, pożyczki, historia transakcji."""
    return db.load()


# ── Deposit ────────────────────────────────────────────────────────────────────

@app.post("/api/deposit", response_model=BankState, summary="Wpłata")
def deposit(req: DepositRequest):
    state = db.load()
    state["balance"] = r2(state["balance"] + req.amount)
    state["transactions"].append(
        make_tx(state["balance"], "Wpłata", req.amount, "Wpłata gotówkowa")
    )
    db.save(state)
    return state


# ── Withdrawal ─────────────────────────────────────────────────────────────────

@app.post("/api/withdraw", response_model=BankState, summary="Wypłata")
def withdraw(req: WithdrawRequest):
    state = db.load()
    if req.amount > state["balance"]:
        insufficient(state["balance"])
    state["balance"] = r2(state["balance"] - req.amount)
    state["transactions"].append(
        make_tx(state["balance"], "Wypłata", -req.amount, "Wypłata gotówkowa")
    )
    db.save(state)
    return state


# ── Transfer ───────────────────────────────────────────────────────────────────

@app.post("/api/transfer", response_model=BankState, summary="Przelew")
def transfer(req: TransferRequest):
    state = db.load()
    if req.amount > state["balance"]:
        insufficient(state["balance"])
    state["balance"] = r2(state["balance"] - req.amount)
    state["transactions"].append(
        make_tx(
            state["balance"],
            "Przelew",
            -req.amount,
            f"→ {req.recipient} | {req.title}",
        )
    )
    db.save(state)
    return state


# ── Term deposits ──────────────────────────────────────────────────────────────

@app.post("/api/lokaty", response_model=BankState, summary="Otwórz lokatę")
def open_lokata(req: OpenLokataRequest):
    state = db.load()
    if req.amount > state["balance"]:
        insufficient(state["balance"])
    state["balance"] = r2(state["balance"] - req.amount)
    state["transactions"].append(
        make_tx(
            state["balance"],
            "Lokata",
            -req.amount,
            f"Lokata {req.period} ({req.rate}%)",
        )
    )
    db.save(state)
    return state


# ── Loans ──────────────────────────────────────────────────────────────────────

@app.post("/api/loans", response_model=BankState, summary="Weź pożyczkę")
def take_loan(req: TakeLoanRequest):
    state = db.load()
    total = r2(req.monthly * req.months)
    loan = {
        "id": int(time.time() * 1000),
        "plan": req.plan,
        "months": req.months,
        "rate": req.rate,
        "amount": r2(req.amount),
        "remaining": total,
        "monthly": r2(req.monthly),
    }
    state["loans"].append(loan)
    state["balance"] = r2(state["balance"] + req.amount)
    state["transactions"].append(
        make_tx(state["balance"], "Pożyczka", req.amount, f"Pożyczka – {req.plan}")
    )
    db.save(state)
    return state


@app.post(
    "/api/loans/{loan_id}/repay",
    response_model=BankState,
    summary="Spłać pożyczkę",
)
def repay_loan(loan_id: int, req: RepayLoanRequest):
    state = db.load()
    loan = next((l for l in state["loans"] if l["id"] == loan_id), None)
    if not loan:
        raise HTTPException(status_code=404, detail="Pożyczka nie znaleziona")

    payment = min(req.amount, loan["remaining"])
    if payment > state["balance"]:
        insufficient(state["balance"])

    state["balance"] = r2(state["balance"] - payment)
    loan["remaining"] = r2(max(0.0, loan["remaining"] - payment))

    if loan["remaining"] < 0.01:
        state["loans"] = [l for l in state["loans"] if l["id"] != loan_id]

    state["transactions"].append(
        make_tx(
            state["balance"],
            "Spłata",
            -payment,
            f"Spłata pożyczki – {loan['plan']}",
        )
    )
    db.save(state)
    return state


# ── Static product catalogue ───────────────────────────────────────────────────

@app.get("/api/products/lokaty", summary="Dostępne lokaty")
def get_lokaty():
    return [
        {"id": 0, "label": "3 miesiące",  "months": 3,  "rate": 4.5, "min": 500  },
        {"id": 1, "label": "6 miesięcy",  "months": 6,  "rate": 5.2, "min": 1000 },
        {"id": 2, "label": "12 miesięcy", "months": 12, "rate": 6.0, "min": 2000 },
        {"id": 3, "label": "24 miesiące", "months": 24, "rate": 6.8, "min": 5000 },
    ]


@app.get("/api/products/loan-plans", summary="Plany pożyczkowe")
def get_loan_plans():
    return [
        {"id": 0, "label": "12 miesięcy", "months": 12, "rate": 8.9  },
        {"id": 1, "label": "24 miesiące", "months": 24, "rate": 9.5  },
        {"id": 2, "label": "36 miesięcy", "months": 36, "rate": 10.2 },
        {"id": 3, "label": "60 miesięcy", "months": 60, "rate": 11.0 },
    ]
