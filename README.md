# Peer Review Platform

O aplicație web full-stack pentru peer review a revistelor științifice, care conectează editori cu recenzori calificați pe baza domeniului de expertiză.

---

## Despre proiect

Platforma a fost dezvoltată ca răspuns la următoarea problemă: editorii la început de carieră care doresc să publice o revistă științifică nu găsesc recenzori disponibili. Aplicația rezolvă această problemă printr-un sistem de matching automat între editori și recenzori, bazat pe domeniul revistei și expertiza recenzorului.

---

## Funcționalități principale

- **Matching automat** - platforma asignează un recenzor potrivit pentru fiecare revistă în funcție de domeniu
- **Flux complet de peer review** - de la trimiterea revistei până la finalizarea recenziei
- **Forum de comunicare** - canal dedicat de comunicare între editor și recenzor pe durata procesului
- **Sistem de rating** - editorul poate acorda un rating recenzorului după finalizarea recenziei
- **Roluri distincte** - Admin, Editor și Recenzor, fiecare cu dashboard propriu
- **Sistem de notificări** - utilizatorii sunt notificați la fiecare etapă a procesului
- **Aprobare admin** - conturile de recenzor necesită aprobare înainte de a putea accepta reviste

---

## Tehnologii utilizate

| Strat | Tehnologie |
|-------|-----------|
| Frontend | React 18, React Router, Tailwind CSS |
| Backend | Node.js, Express |
| Bază de date | MySQL |
| Autentificare | JWT (JSON Web Tokens) |
| Upload fișiere | Multer |
| HTTP Client | Axios |

---

## Arhitectura proiectului

```
peer-review/
├── client/                  # Aplicația React (frontend)
│   └── src/
│       ├── api/             # Configurare Axios
│       ├── components/      # Componente reutilizabile (Button, Modal, Navbar etc.)
│       ├── context/         # Context de autentificare
│       ├── hooks/           # Custom hooks
│       └── pages/           # Paginile aplicației (admin, editor, reviewer)
├── server/                  # Serverul Express (backend)
│   ├── config/              # Configurare bază de date
│   ├── controllers/         # Logica de business
│   ├── middleware/          # Autentificare JWT, upload fișiere
│   ├── routes/              # Definirea rutelor API
│   └── scripts/             # Script de seed pentru baza de date
└── package.json             # Scripts pentru rularea monorepo-ului
```

## Fluxul aplicației

### Înregistrare și aprobare
1. Utilizatorul își creează un cont ca **Editor** sau **Recenzor**
2. Conturile de Editor sunt activate imediat
3. Conturile de Recenzor necesită aprobarea unui **Admin**

### Procesul de peer review
1. Editorul creează o revistă și selectează domeniul
2. Platforma asignează automat un recenzor cu expertiză în acel domeniu
3. Recenzorul acceptă sau refuză revista
4. La acceptare, se deschide un **forum de comunicare** între editor și recenzor
5. Editorul încarcă fișierul revistei; recenzorul trimite recenzia
6. Recenzorul marchează recenzia ca finalizată - forumul este arhivat
7. Editorul acordă un **rating** recenzorului

---

## Autori
- Dat Paul George
- Proiect realizat în cadrul practicii universitare - anul 2, Informatică.
