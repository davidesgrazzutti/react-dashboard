# Dashboard .NET + React (Gmail Dashboard)

Questa è una dashboard ibrida sviluppata con **.NET** per il backend e **React** per il frontend.  
L'app mostra widget dinamici e permette la connessione a **Gmail** tramite OAuth per visualizzare email e informazioni dell’account.  
Il progetto è pensato come base espandibile per creare una dashboard personale con componenti modulari.

---
![dashboard](https://github.com/user-attachments/assets/ec0f2c47-b039-46b7-be54-531209ba01e8)
---

## 🛠️ Tecnologie Utilizzate

### **Backend (.NET)**
- .NET / ASP.NET Core Web API  
- C#  
- REST API  

### **Frontend (React)**
- React  
- JavaScript / TypeScript  
- Axios per comunicazione con l’API  
- HTML / CSS  

---




# 🔥 To-Do (Gmail Widget)

##  1. Refresh widget
- Refresh widget per vedere se ci sono nuove email

---

## ✅ 2. Mark Read / Unread
- Endpoint backend `mark-read`
- Endpoint backend `mark-unread`
- UI: testo **bold** per non lette, normale per lette
- Badge “Non letta”
- Aggiornamento immediato della lista senza reload

---

## 🗑️ 3. Delete (sposta nel Cestino)
- Backend: `ModifyMessageRequest` con `AddLabelIds = ["TRASH"]`
- UI: rimuove subito l’email dalla lista
- Opzionale: popup “Vuoi eliminare?”
- Opzionale: Undo stile Gmail

---

## 🔍 4. Ricerca avanzata
### Funzionalità previste:
- Campo ricerca con **debounce**
- Ricerca per:
  - testo libero  
  - mittente (`from:`)  
  - oggetto (`subject:`)  
  - solo non lette (`is:unread`)  
  - solo archiviate (`label:archive`)  
  - solo importanti (`is:important`)  
  - con stella (`is:starred`)  
  - intervallo date (`after: yyyy/mm/dd before: yyyy/mm/dd`)
- Pannellino dropdown elegante stile Gmail mini
- Risultati che aggiornano la lista in tempo reale
