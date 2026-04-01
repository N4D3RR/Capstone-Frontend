import { useState, useEffect } from "react"
import { Button, Spinner } from "react-bootstrap"
import StatusBadge from "../common/StatusBadge"
import api from "../../services/api"
import { BsFileEarmarkPdf, BsPlusLg } from "react-icons/bs"
import PaymentForm from "./PaymentForm"

const PaymentsTab = function ({ patientId }) {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)

  const loadPayments = function () {
    api
      .get("/api/payments/patient/" + patientId + "?page=0&size=20")
      .then(function (data) {
        setPayments(data.content || [])
      })
      .finally(function () {
        setLoading(false)
      })
  }

  useEffect(
    function () {
      loadPayments()
    },
    [patientId],
  )

  const handleSaved = function () {
    setShowModal(false)
    setSelectedPayment(null)
    loadPayments()
  }

  const handleDownloadInvoice = function (id) {
    api
      .getBlob("/api/payments/" + id + "/invoice")
      .then(function (blob) {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "fattura-" + id + ".pdf"
        a.click()
        window.URL.revokeObjectURL(url)
      })
      .catch(function () {})
  }

  if (loading)
    return (
      <div className="d-flex justify-content-center py-4">
        <Spinner
          animation="border"
          size="sm"
          style={{ color: "var(--bs-primary)" }}
        />
      </div>
    )

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mt-3 mb-2">
        <span className="text-secondary small">
          {payments.length} pagament{payments.length === 1 ? "o" : "i"}
        </span>
        <Button
          size="sm"
          className="border-0 fw-semibold btn-clinic"
          onClick={function () {
            setSelectedPayment(null)
            setShowModal(true)
          }}
        >
          <BsPlusLg className="me-1" size={11} />
          Nuovo Pagamento
        </Button>
      </div>

      {payments.length === 0 ? (
        <p className="text-muted mt-3">Nessun pagamento registrato</p>
      ) : (
        <table className="table table-hover align-middle mt-3">
          <thead className="table-light">
            <tr>
              <th>Data</th>
              <th>Importo</th>
              <th>Metodo</th>
              <th>Stato</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(function (p) {
              return (
                <tr key={p.id}>
                  <td>{new Date(p.paymentDate).toLocaleDateString("it-IT")}</td>
                  <td className="fw-semibold">
                    € {Number(p.amount).toFixed(2)}
                  </td>
                  <td>{p.method}</td>
                  <td>
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="text-muted" style={{ fontSize: 13 }}>
                    {p.notes || "—"}
                  </td>
                  <td>
                    {p.status === "PAID" && (
                      <Button
                        size="sm"
                        variant="outline-success"
                        title="Scarica Fattura"
                        onClick={function () {
                          handleDownloadInvoice(p.id)
                        }}
                      >
                        <BsFileEarmarkPdf size={13} />
                      </Button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
      <PaymentForm
        show={showModal}
        payment={selectedPayment}
        preselectedPatientId={patientId}
        onClose={function () {
          setShowModal(false)
          setSelectedPayment(null)
        }}
        onSaved={handleSaved}
      />
    </>
  )
}

export default PaymentsTab
