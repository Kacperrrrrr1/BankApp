# BankApp
# Python backend
 cd bank-backend      
 pip install -r requirements.txt  
 uvicorn main:app --reload --port 8000  

 
# React frontend 
 cd bank-app  
 npm install  
 npm run dev  

# Architektura
bank-backend/  
├── main.py        ← FastAPI, 9 endpointów REST  
├── models.py      ← Pydantic: BankState, Loan, Transaction, requesty  
├── database.py    ← Thread-safe zapis/odczyt JSON  
├── data/bank.json ← Trwałe dane (zastępuje localStorage)  
└── requirements.txt  

bank-app/src/  
├── store/bankStore.tsx  ←  optimistic dispatch + API sync  
├── components/Layout.tsx ←  ekran ładowania, offline, toast błędów  
├── vite.config.ts       ←  proxy /api → localhost:8000  
└── views/*.tsx          

# http://localhost:5173
