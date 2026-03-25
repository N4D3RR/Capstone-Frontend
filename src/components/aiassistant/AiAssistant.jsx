import { useState, useRef, useEffect } from "react"
import { BsChatDotsFill, BsXLg, BsSendFill } from "react-icons/bs"
import { Button, Spinner } from "react-bootstrap"
import api from "../../services/api"

const AiAssistant = function () {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Ciao! Sono l'assistente di OpenClinic. Posso aiutarti con i dati dello studio, gli appuntamenti o l'utilizzo dell'app. Come posso aiutarti?",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(
    function () {
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: "smooth" })
      }
    },
    [messages],
  )

  const handleSend = function () {
    const text = input.trim()
    if (!text || loading) return

    const newMessages = [...messages, { role: "user", content: text }]
    setMessages(newMessages)
    setInput("")
    setLoading(true)

    api
      .post("/api/ai/chat", { messages: newMessages })
      .then(function (data) {
        setMessages(function (prev) {
          return [...prev, { role: "assistant", content: data.reply }]
        })
        setLoading(false)
      })
      .catch(function () {
        setMessages(function (prev) {
          return [
            ...prev,
            {
              role: "assistant",
              content:
                "Si è verificato un errore. Riprova tra qualche istante.",
            },
          ]
        })
        setLoading(false)
      })
  }

  const handleKeyDown = function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Finestra chat */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            right: 24,
            width: 360,
            height: 500,
            backgroundColor: "#fff",
            borderRadius: 16,
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            display: "flex",
            flexDirection: "column",
            zIndex: 1050,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: "var(--color-sidebar)",
              color: "#fff",
              padding: "14px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div className="fw-bold" style={{ fontSize: 15 }}>
                Assistente OpenClinic
              </div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>Powered by AI</div>
            </div>
            <BsXLg
              size={16}
              style={{ cursor: "pointer" }}
              onClick={function () {
                setOpen(false)
              }}
            />
          </div>

          {/* Messaggi */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              backgroundColor: "var(--bs-body-bg)",
            }}
          >
            {messages.map(function (msg, i) {
              const isUser = msg.role === "user"
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: isUser ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "80%",
                      backgroundColor: isUser ? "var(--bs-primary)" : "#fff",
                      color: isUser ? "#fff" : "var(--color-sidebar)",
                      borderRadius: isUser
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                      padding: "10px 14px",
                      fontSize: 14,
                      lineHeight: 1.5,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              )
            })}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: "16px 16px 16px 4px",
                    padding: "10px 14px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  }}
                >
                  <Spinner
                    animation="border"
                    size="sm"
                    style={{ color: "var(--bs-primary)" }}
                  />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: "12px 16px",
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              gap: 8,
              backgroundColor: "#fff",
            }}
          >
            <textarea
              id="ai-chat-input"
              rows={1}
              value={input}
              onChange={function (e) {
                setInput(e.target.value)
              }}
              onKeyDown={handleKeyDown}
              placeholder="Scrivi un messaggio..."
              style={{
                flex: 1,
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 14,
                resize: "none",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
            <Button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{
                backgroundColor: "var(--bs-primary)",
                border: "none",
                borderRadius: 8,
                padding: "8px 12px",
                color: "#fff",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                opacity: loading || !input.trim() ? 0.5 : 1,
              }}
            >
              <BsSendFill size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Bottone flottante */}
      <Button
        onClick={function () {
          setOpen(function (prev) {
            return !prev
          })
        }}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: "50%",
          backgroundColor: "var(--bs-primary)",
          border: "none",
          color: "#fff",
          boxShadow: "0 4px 16px rgba(42,157,143,0.4)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1050,
        }}
      >
        <BsChatDotsFill size={24} />
      </Button>
    </>
  )
}

export default AiAssistant
