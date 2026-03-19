import { useEffect, useState } from "react"
import api from "../services/api"
import PaymentForm from "../components/payments/PaymentForm"
import TopBar from "../components/layout/TopBar"
import { Alert, Button } from "react-bootstrap"
import { BsCashCoin } from "react-icons/bs"
import PaymentTable from "../components/payments/PaymentTable"

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

  useEffect(
    function () {
      fetchPayments()
    },
    [page],
  )

  const fetchPayments = function () {
    setLoading(true)
    setError("")
    api
      .get("/api/payments?page=" + page + "&size=10")
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
  return (
    <>
      <TopBar title="Pagamenti & Report" />

      <div className="d-flex justify-content-between align-items-center mb-3">
        {error && (
          <Alert variant="danger" className="mb-0 py-2">
            {error}
          </Alert>
        )}
        <div className="ms-auto">
          <Button
            onClick={handleNew}
            className="border-0 fw-semibold"
            style={{ backgroundColor: "#2a9d8f" }}
          >
            <BsCashCoin className="me-2" />
            Nuovo Pagamento
          </Button>
        </div>
      </div>

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
