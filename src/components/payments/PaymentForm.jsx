import { useState, useEffect } from "react"
import { Modal, Form, Button, Spinner, Alert, Row, Col } from "react-bootstrap"
import api from "../../services/api"

const emptyForm = {
  patientId: "",
  appointmentId: "",
  amount: "",
  paymentDate: "",
  method: "CASH",
  status: "PAID",
  notes: "",
}

const PaymentForm = function ({ show, payment, onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm)
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [error, setError] = useState("")

  useEffect(
    function () {
      if (!show) return
      setError("")
      setLoadingData(true)

      // carico la lista pazienti per il select
      api
        .get("/api/patients?page=0&size=100")
        .then(function (data) {
          setPatients(data.content)
          setLoadingData(false)
        })
        .catch(function () {
          setError("Errore nel caricamento dei pazienti")
          setLoadingData(false)
        })

      if (payment) {
        // modifica — precompilo
        setForm({
          patientId: payment.patient ? payment.patient.id : "",
          appointmentId: payment.appointmentId || "",
          amount: payment.amount || "",
          paymentDate: payment.paymentDate
            ? payment.paymentDate.substring(0, 10)
            : "",
          method: payment.method || "CASH",
          status: payment.status || "PAID",
          notes: payment.notes || "",
        })
      } else {
        // creazione — data di oggi precompilata
        setForm({
          ...emptyForm,
          paymentDate: new Date().toISOString().substring(0, 10),
        })
      }
    },
    [payment, show],
  )

  const handleChange = function (e) {
    const { name, value } = e.target
    setForm(function (prev) {
      return { ...prev, [name]: value }
    })
  }

  const handleSubmit = function (e) {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (payment) {
      // modifica — PaymentUpdateDTO
      const payload = {
        amount: parseFloat(form.amount),
        paymentDate: form.paymentDate,
        method: form.method,
        status: form.status,
        notes: form.notes || null,
      }

      api
        .put("/api/payments/" + payment.id, payload)
        .then(function () {
          setLoading(false)
          onSaved()
        })
        .catch(function (err) {
          setError(err.message || "Errore durante il salvataggio")
          setLoading(false)
        })
    } else {
      // creazione — PaymentCreateDTO
      const payload = {
        patientId: form.patientId,
        amount: parseFloat(form.amount),
        paymentDate: form.paymentDate,
        method: form.method,
        status: form.status,
        notes: form.notes || null,
      }

      // appointmentId opzionale
      if (form.appointmentId) {
        payload.appointmentId = form.appointmentId
      }

      api
        .post("/api/payments", payload)
        .then(function () {
          setLoading(false)
          onSaved()
        })
        .catch(function (err) {
          setError(err.message || "Errore durante il salvataggio")
          setLoading(false)
        })
    }
  }

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: 18, fontWeight: 700 }}>
          {payment ? "Modifica Pagamento" : "Nuovo Pagamento"}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          {loadingData ? (
            <div className="d-flex justify-content-center py-3">
              <Spinner
                animation="border"
                style={{ color: "var(--bs-primary)" }}
              />
            </div>
          ) : (
            <>
              {/* Paziente — select in creazione, testo fisso in modifica */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  Paziente *
                </Form.Label>
                {payment ? (
                  <Form.Control
                    type="text"
                    value={
                      payment.patient
                        ? payment.patient.firstName +
                          " " +
                          payment.patient.lastName
                        : ""
                    }
                    disabled
                  />
                ) : (
                  <Form.Select
                    name="patientId"
                    value={form.patientId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleziona un paziente...</option>
                    {patients.map(function (p) {
                      return (
                        <option key={p.id} value={p.id}>
                          {p.lastName} {p.firstName} — {p.fiscalCode}
                        </option>
                      )
                    })}
                  </Form.Select>
                )}
              </Form.Group>

              {/* Importo + Data */}
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small text-secondary">
                      Importo (€) *
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                      required
                      min={0.01}
                      step={0.01}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small text-secondary">
                      Data *
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="paymentDate"
                      value={form.paymentDate}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Metodo + Stato */}
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small text-secondary">
                      Metodo *
                    </Form.Label>
                    <Form.Select
                      name="method"
                      value={form.method}
                      onChange={handleChange}
                      required
                    >
                      <option value="CASH">Contanti</option>
                      <option value="CARD">Carta</option>
                      <option value="BANK_TRANSFER">Bonifico</option>
                      <option value="CHECK">Assegno</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small text-secondary">
                      Stato *
                    </Form.Label>
                    <Form.Select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      required
                    >
                      <option value="PAID">Pagato</option>
                      <option value="PENDING">In attesa</option>
                      <option value="PARTIAL">Parziale</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {/* Note */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  Note
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Annulla
          </Button>
          <Button
            type="submit"
            className="border-0 fw-semibold btn-clinic"
            disabled={loading || loadingData}
          >
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : payment ? (
              "Salva Modifiche"
            ) : (
              "Registra Pagamento"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default PaymentForm
