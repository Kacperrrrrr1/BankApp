# 🏦 Bank Backend (Python / FastAPI)

REST API dla aplikacji bankowej. Dane przechowywane w `data/bank.json`.

## Wymagania

- Python **3.11+**
- pip

## Uruchomienie

```bash
cd bank-backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API dostępne pod: **http://localhost:8000**  
Dokumentacja Swagger: **http://localhost:8000/docs**

---

## Uruchomienie pełnej aplikacji

**Terminal 1 — backend:**
```bash
cd bank-backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Terminal 2 — frontend:**
```bash
cd bank-app
npm install
npm run dev
```

Otwórz **http://localhost:5173**

---

## Endpointy API

| Metoda | Ścieżka | Opis |
|--------|---------|------|
| `GET`  | `/api/account` | Stan konta |
| `POST` | `/api/deposit` | Wpłata |
| `POST` | `/api/withdraw` | Wypłata |
| `POST` | `/api/transfer` | Przelew |
| `POST` | `/api/lokaty` | Otwórz lokatę |
| `POST` | `/api/loans` | Weź pożyczkę |
| `POST` | `/api/loans/{id}/repay` | Spłata pożyczki |
| `GET`  | `/api/products/lokaty` | Katalog lokat |
| `GET`  | `/api/products/loan-plans` | Plany pożyczkowe |

## Dane

Zapisywane w `data/bank.json`. Można zresetować do domyślnego stanu:
```bash
echo '{"owner":"Jan Kowalski","balance":1500.0,"loans":[],"transactions":[]}' > data/bank.json
```
