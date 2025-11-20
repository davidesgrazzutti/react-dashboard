# 🔥 To-Do (Gmail Widget)

## ✅ 1. Mark Read / Unread
- Endpoint backend `mark-read`
- Endpoint backend `mark-unread`
- UI: testo **bold** per non lette, normale per lette
- Badge “Non letta”
- Aggiornamento immediato della lista senza reload

---

## 🗑️ 2. Delete (sposta nel Cestino)
- Backend: `ModifyMessageRequest` con `AddLabelIds = ["TRASH"]`
- UI: rimuove subito l’email dalla lista
- Opzionale: popup “Vuoi eliminare?”
- Opzionale: Undo stile Gmail

---

## 🔍 3. Ricerca avanzata
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

---
##  4. Caricare Backend
