import React, { useEffect, useState } from "react";
import axios from "axios";

interface Email {
  from: string;
  subject: string;
  date: string;
}

// Endpoint del backend .NET
const GMAIL_CHECK_AUTH_URL = "http://localhost:5083/api/gmail/auth/check-auth";
const GMAIL_START_AUTH_URL = "http://localhost:5083/api/gmail/auth/start";
const GMAIL_MESSAGES_URL = "http://localhost:5083/api/gmail/messages";

const GmailWidget: React.FC = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEmails = async () => {
    try {
      setLoadingEmails(true);
      setError(null);

      const res = await axios.get(GMAIL_MESSAGES_URL, {
        withCredentials: true, // importante per la sessione
      });

      if (!Array.isArray(res.data)) {
        console.error("Risposta backend NON è un array:", res.data);
        setError("Dati non validi dal server");
        return;
      }

      setEmails(res.data);
    } catch (err: any) {
      console.error("Errore caricamento email:", err);

      if (err?.response?.status === 401) {
        setIsAuthenticated(false);
        setError("Non sei autenticato. Effettua nuovamente l'accesso a Gmail.");
      } else {
        setError("Errore nel caricamento delle email");
      }
    } finally {
      setLoadingEmails(false);
    }
  };

  const checkAuth = async () => {
    try {
      setLoadingAuth(true);
      setError(null);

      const res = await axios.get(GMAIL_CHECK_AUTH_URL, {
        withCredentials: true,
      });

      const authenticated = !!res.data?.authenticated;
      setIsAuthenticated(authenticated);

      if (authenticated) {
        await loadEmails();
      }
    } catch (err: any) {
      console.error("Errore nel controllo autenticazione Gmail:", err);
      setError("Errore nel controllo dell'autenticazione Gmail");
      setIsAuthenticated(false);
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleLoginClick = () => {
    window.location.href = GMAIL_START_AUTH_URL;
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // ======= RENDER =======

  if (loadingAuth) {
    return <p>Verifica autenticazione con Gmail...</p>;
  }

  if (!isAuthenticated) {
    return (
      <>
        <h3 style={{ marginTop: 0, marginBottom: 10 }}>Posta in Arrivo</h3>
        <p>Per vedere le email devi collegare il tuo account Gmail.</p>
        <button onClick={handleLoginClick}>Accedi con Google</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </>
    );
  }

  if (loadingEmails) {
    return <p>Caricamento email...</p>;
  }

  if (error) {
    return (
      <>
        <h3 style={{ marginTop: 0, marginBottom: 10 }}>Posta in Arrivo</h3>
        <p style={{ color: "red" }}>{error}</p>
      </>
    );
  }

  if (emails.length === 0) {
    return (
      <>
        <h3 style={{ marginTop: 0, marginBottom: 10 }}>Posta in Arrivo</h3>
        <p>Nessuna email trovata.</p>
      </>
    );
  }

  return (
    <>
      <h3 style={{ marginTop: 0, marginBottom: 10 }}>Posta in Arrivo</h3>

      <ul style={{ paddingLeft: 0, listStyle: "none", margin: 0 }}>
        {emails.map((mail, index) => (
          <li key={index} style={{ marginBottom: 12 }}>
            <strong>{mail.subject}</strong>
            <br />
            <span style={{ fontSize: 12, opacity: 0.7 }}>
              {mail.from} — {mail.date}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
};

export default GmailWidget;
