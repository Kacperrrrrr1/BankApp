# 🏦 Bank App

Aplikacja bankowa zbudowana w **React + TypeScript + Tailwind CSS**.  
Dane zapisywane lokalnie w `localStorage` — trwałe między sesjami przeglądarki.

## Uruchomienie

```bash
npm install
npm run dev
```

Otwórz **http://localhost:5173**

## Funkcje

| Ekran | Opis |
|---|---|
|  Wpłata | Wpłata gotówkowa z szybkimi kwotami |
|  Wypłata | Wypłata ze sprawdzaniem salda |
|  Przelew | 3-krokowy przelew bankowy z potwierdzeniem |
|  Lokaty | Lokaty terminowe 3/6/12/24 mies. z podglądem odsetek |
|  Nowa pożyczka | Kalkulator rat, 4 plany spłaty |
|  Spłata pożyczki | Lista aktywnych pożyczek, spłata raty/całości/custom |
|  Historia | Historia transakcji z kolorowanymi typami i statystykami |

## Stack

- **React 18** + **TypeScript 5**
- **Vite 5** (dev server + bundler)
- **Tailwind CSS 3**


## Skrypty

```bash
npm run dev      # serwer deweloperski
npm run build    # build produkcyjny → dist/
npm run preview  # podgląd builda
```
