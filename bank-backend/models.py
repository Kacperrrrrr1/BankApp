from pydantic import BaseModel, Field


# ── Stored entities ────────────────────────────────────────────────────────────

class Transaction(BaseModel):
    id: float
    date: str
    type: str
    amount: float
    description: str
    balance: float


class Loan(BaseModel):
    id: int
    plan: str
    months: int
    rate: float
    amount: float
    remaining: float
    monthly: float


class BankState(BaseModel):
    owner: str
    balance: float
    loans: list[Loan]
    transactions: list[Transaction]


# ── Request bodies ─────────────────────────────────────────────────────────────

class DepositRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Kwota musi być większa od zera")


class WithdrawRequest(BaseModel):
    amount: float = Field(..., gt=0)


class TransferRequest(BaseModel):
    amount: float = Field(..., gt=0)
    recipient: str = Field(..., min_length=1)
    account_no: str
    title: str = Field(..., min_length=1)


class OpenLokataRequest(BaseModel):
    amount: float = Field(..., gt=0)
    period: str
    rate: float


class TakeLoanRequest(BaseModel):
    plan: str
    months: int
    rate: float
    amount: float
    monthly: float


class RepayLoanRequest(BaseModel):
    amount: float = Field(..., gt=0)
