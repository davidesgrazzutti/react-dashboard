import React, { useEffect, useState } from "react";
import axios from "axios";

interface Email {
  id: string;
  from: string;
  subject: string;
  date: string;
  snippet?: string;
}

interface EmailDetail {
  id: string;
  from: string;
  subject: string;
  date: string;
  body: string;
}

// Endpoint del backend .NET
const GMAIL_CHECK_AUTH_URL = "http://localhost:5083/api/gmail/auth/check-auth";
const GMAIL_START_AUTH_URL = "http://localhost:5083/api/gmail/auth/start";
const GMAIL_MESSAGES_URL = "http://localhost:5083/api/gmail/messages";

// Converte l'HTML completo (doctype, head, body, ecc.) in solo contenuto del <body>
const normalizeEmailHtml = (raw: string): string => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(raw, "text/html");
    return doc.body.innerHTML || raw;
  } catch {
    return raw;
  }
};

const GmailWidget: React.FC = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [loadingBody, setLoadingBody] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // stato per la vista dettaglio
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [selectedBody, setSelectedBody] = useState<string | null>(null);

  const loadEmails = async () => {
    try {
      setLoadingEmails(true);
      setError(null);

      const res = await axios.get(GMAIL_MESSAGES_URL, {
        withCredentials: true,
      });

      if (!Array.isArray(res.data)) {
        console.error("Risposta backend NON è un array:", res.data);
        setError("Dati non validi dal server");
        return;
      }

      const mapped: Email[] = res.data.map((m: any) => ({
        id: m.id,
        from: m.from,
        subject: m.subject,
        date: m.date,
        snippet: m.snippet,
      }));

      setEmails(mapped);
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

  const handleEmailClick = async (email: Email) => {
    if (!email.id) {
      console.error("Email senza id:", email);
      setError("Errore interno: id email mancante.");
      return;
    }

    try {
      setSelectedEmail(email);
      setSelectedBody(null);
      setLoadingBody(true);
      setError(null);

      const res = await axios.get<EmailDetail>(
        `${GMAIL_MESSAGES_URL}/${email.id}`,
        { withCredentials: true }
      );

      const rawBody = res.data.body || "";
      const normalized = normalizeEmailHtml(rawBody);

      setSelectedBody(normalized || "Nessun contenuto disponibile.");
    } catch (err: any) {
      console.error("Errore nel caricamento del contenuto email:", err);
      setError("Errore nel caricamento del contenuto della email.");
    } finally {
      setLoadingBody(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedEmail(null);
    setSelectedBody(null);
    setError(null);
  };

  const handleArchiveClick = async () => {
    if (!selectedEmail?.id) return;

    try {
      setError(null);

      await axios.post(
        `${GMAIL_MESSAGES_URL}/${selectedEmail.id}/archive`,
        null,
        { withCredentials: true }
      );

      await loadEmails();
      handleCloseDetail();
    } catch (err: any) {
      console.error("Errore durante l'archiviazione:", err);
      setError("Errore durante l'archiviazione dell'email.");
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // ========= RENDER LOGICA BASE (auth / errori globali) =========

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

  if (loadingEmails && !selectedEmail) {
    return <p>Caricamento email...</p>;
  }

  if (!loadingEmails && emails.length === 0 && !selectedEmail) {
    return (
      <>
        <h3 style={{ marginTop: 0, marginBottom: 10 }}>Posta in Arrivo</h3>
        <p>Nessuna email trovata.</p>
      </>
    );
  }

  // ========= VISTA DETTAGLIO =========

  if (selectedEmail) {
    return (
      <>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: 0, fontSize: 15 }}>
            {selectedEmail.subject}
          </h3>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleArchiveClick}
              style={{
                background: "#16a34a",
                border: "none",
                borderRadius: 6,
                padding: "4px 10px",
                color: "#e5e7eb",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Archivia
            </button>

            <button
              onClick={handleCloseDetail}
              style={{
                background: "#1e293b",
                border: "none",
                borderRadius: 6,
                padding: "4px 10px",
                color: "#e5e7eb",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Chiudi
            </button>
          </div>
        </div>

        <div
          style={{
            fontSize: 12,
            opacity: 0.8,
            marginBottom: 8,
          }}
        >
          {selectedEmail.from} — {selectedEmail.date}
        </div>

        {error && (
          <p style={{ color: "red", marginBottom: 8 }}>{error}</p>
        )}

        {loadingBody ? (
          <p>Caricamento contenuto...</p>
        ) : (
          <div
            className="email-detail-scroll"
            style={{ fontSize: 13, lineHeight: 1.4 }}
            dangerouslySetInnerHTML={{
              __html: selectedBody || "Nessun contenuto disponibile.",
            }}
          />
        )}
      </>
    );
  }

  // ========= VISTA LISTA =========

  return (
    <>
      <h3 style={{ marginTop: 0, marginBottom: 10 }}>Posta in Arrivo</h3>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul style={{ paddingLeft: 0, listStyle: "none", margin: 0 }}>
        {emails.map((mail) => (
          <li
            key={mail.id}
            style={{
              marginBottom: 10,
              paddingBottom: 6,
              borderBottom: "1px solid #1e293b",
            }}
          >
            <button
              onClick={() => handleEmailClick(mail)}
              style={{
                background: "transparent",
                border: "none",
                padding: 0,
                margin: 0,
                color: "#e5e7eb",
                fontWeight: 600,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              {mail.subject}
            </button>
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
