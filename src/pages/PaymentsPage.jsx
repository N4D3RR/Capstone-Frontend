import { useEffect, useState } from "react"
import api from "../services/api"
import PaymentForm from "../components/payments/PaymentForm"
import TopBar from "../components/layout/TopBar"
import { Alert, Button, Card, Col, Form, Row } from "react-bootstrap"
import { BsCashCoin } from "react-icons/bs"
import PaymentTable from "../components/payments/PaymentTable"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const PaymentsPage = function () {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // paginazione
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // modale
  const [showModal, setShowModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [statusFilter, setStatusFilter] = useState("")

  const fetchPayments = function () {
    setLoading(true)
    setError("")

    const endpoint = statusFilter
      ? "/api/payments/status?status=" +
        statusFilter +
        "&page=" +
        page +
        "&size=10"
      : "/api/payments?page=" + page + "&size=10"

    api
      .get(endpoint)
      .then(function (data) {
        setPayments(data.content)
        setTotalPages(data.totalPages)
        setLoading(false)
      })
      .catch(function () {
        setError("Errore nel caricamento dei pagamenti")
        setLoading(false)
      })
  }

  useEffect(
    function () {
      fetchPayments()
    },
    [page, statusFilter],
  )

  const handleNew = function () {
    setSelectedPayment(null)
    setShowModal(true)
  }

  // apre modale precompilata per modifica
  const handleEdit = function (payment) {
    setSelectedPayment(payment)
    setShowModal(true)
  }

  // elimina paziente con conferma
  const handleDelete = function (id) {
    if (!window.confirm("Sei sicuro di voler eliminare questo pagamento?"))
      return
    api
      .delete("/api/payments/" + id)
      .then(function () {
        fetchPayments()
      })
      .catch(function () {
        setError("Errore durante l'eliminazione")
      })
  }

  // chiamato dal PaymentForm dopo salvataggio
  const handleSaved = function () {
    setShowModal(false)
    setSelectedPayment(null)
    fetchPayments()
  }

  // calcolo KPI dai pagamenti caricati
  const totalPaid = payments
    .filter(function (p) {
      return p.status === "PAID"
    })
    .reduce(function (acc, p) {
      return acc + Number(p.amount)
    }, 0)

  const totalPending = payments
    .filter(function (p) {
      return p.status === "PENDING" || p.status === "PARTIAL"
    })
    .reduce(function (acc, p) {
      return acc + Number(p.amount)
    }, 0)

  const paidCount = payments.filter(function (p) {
    return p.status === "PAID"
  }).length
  const pendingCount = payments.filter(function (p) {
    return p.status === "PENDING" || p.status === "PARTIAL"
  }).length

  const monthlyData = payments
    .filter(function (p) {
      return p.status === "PAID"
    })
    .reduce(function (acc, p) {
      const date = new Date(p.paymentDate)
      const key = date.toLocaleDateString("it-IT", {
        month: "short",
        year: "numeric",
      })
      const existing = acc.find(function (item) {
        return item.month === key
      })
      if (existing) {
        existing.total = existing.total + Number(p.amount)
      } else {
        acc.push({ month: key, total: Number(p.amount) })
      }
      return acc
    }, [])

  return (
    <>
      <TopBar title="Pagamenti & Report" />

      {error && (
        <Alert variant="danger" className="mb-0 py-2">
          {error}
        </Alert>
      )}

      {/* KPI Cards */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-3">
              <div className="text-muted small fw-semibold">
                Totale incassato
              </div>
              <div className="fw-bold fs-4" style={{ color: "#22c55e" }}>
                € {totalPaid.toFixed(2)}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-3">
              <div className="text-muted small fw-semibold">Da incassare</div>
              <div className="fw-bold fs-4" style={{ color: "#f59e0b" }}>
                € {totalPending.toFixed(2)}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-3">
              <div className="text-muted small fw-semibold">
                Pagamenti completati
              </div>
              <div className="fw-bold fs-4" style={{ color: "#2a9d8f" }}>
                {paidCount}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-3">
              <div className="text-muted small fw-semibold">In sospeso</div>
              <div className="fw-bold fs-4" style={{ color: "#ef4444" }}>
                {pendingCount}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Grafico */}

      {monthlyData.length > 0 && (
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <h6 className="fw-bold mb-3">Incassi per periodo</h6>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={function (v) {
                    return "€" + v
                  }}
                />
                <Tooltip
                  formatter={function (v) {
                    return "€ " + Number(v).toFixed(2)
                  }}
                />
                <Bar dataKey="total" fill="#2a9d8f" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      )}

      {/* Filtro e bottone */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Form.Select
          style={{ width: 200 }}
          value={statusFilter}
          onChange={function (e) {
            setPage(0)
            setStatusFilter(e.target.value)
          }}
        >
          <option value="">Tutti gli stati</option>
          <option value="PAID">Pagati</option>
          <option value="PENDING">In attesa</option>
          <option value="PARTIAL">Parziali</option>
        </Form.Select>

        <Button
          onClick={handleNew}
          className="border-0 fw-semibold"
          style={{ backgroundColor: "#2a9d8f" }}
        >
          <BsCashCoin className="me-2" />
          Nuovo Pagamento
        </Button>
      </div>

      {/* Tabella pagamenti */}

      <PaymentTable
        payments={payments}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <PaymentForm
        show={showModal}
        payment={selectedPayment}
        onClose={function () {
          setShowModal(false)
        }}
        onSaved={handleSaved}
      />
    </>
  )
}

export default PaymentsPage
