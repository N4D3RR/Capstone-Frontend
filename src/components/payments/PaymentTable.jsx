import { Table, Spinner, Pagination } from "react-bootstrap"
import { BsFileEarmarkPdf, BsPencilFill, BsTrashFill } from "react-icons/bs"
import StatusBadge from "../common/StatusBadge"
import api from "../../services/api"

const methodLabels = {
  CASH: "Contanti",
  CARD: "Carta",
  BANK_TRANSFER: "Bonifico",
  CHECK: "Assegno",
}

const PaymentTable = function ({
  payments,
  loading,
  page,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
}) {
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
      .catch(function () {
        alert("Errore nella generazione della fattura")
      })
  }

  const renderPagination = function () {
    if (totalPages <= 1) return null
    const items = []
    for (let i = 0; i < totalPages; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === page}
          onClick={function () {
            onPageChange(i)
          }}
        >
          {i + 1}
        </Pagination.Item>,
      )
    }
    return (
      <Pagination className="justify-content-center mt-3 mb-0">
        <Pagination.Prev
          onClick={function () {
            onPageChange(page - 1)
          }}
          disabled={page === 0}
        />
        {items}
        <Pagination.Next
          onClick={function () {
            onPageChange(page + 1)
          }}
          disabled={page === totalPages - 1}
        />
      </Pagination>
    )
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <Spinner animation="border" style={{ color: "#2a9d8f" }} />
      </div>
    )
  }

  if (payments.length === 0) {
    return (
      <div className="text-center text-muted py-5">
        Nessun pagamento registrato
      </div>
    )
  }

  return (
    <>
      <Table hover responsive className="align-middle">
        <thead className="table-light">
          <tr>
            <th>Data</th>
            <th>Paziente</th>
            <th>Importo</th>
            <th>Metodo</th>
            <th>Stato</th>
            <th>Note</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {payments.map(function (p) {
            return (
              <tr key={p.id}>
                <td>{new Date(p.paymentDate).toLocaleDateString("it-IT")}</td>
                <td className="fw-semibold">
                  {p.patient
                    ? p.patient.firstName + " " + p.patient.lastName
                    : "—"}
                </td>
                <td
                  className="fw-bold"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  € {Number(p.amount).toFixed(2)}
                </td>
                <td>{methodLabels[p.method] || p.method}</td>
                <td>
                  <StatusBadge status={p.status} />
                </td>
                <td className="text-muted" style={{ fontSize: 13 }}>
                  {p.notes || "—"}
                </td>
                <td
                  className="text-end"
                  onClick={function (e) {
                    e.stopPropagation()
                  }}
                >
                  {p.status === "PAID" && (
                    <button
                      className="btn btn-sm btn-outline-success me-2"
                      title="Scarica Fattura"
                      onClick={function () {
                        handleDownloadInvoice(p.id)
                      }}
                    >
                      <BsFileEarmarkPdf size={13} />
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-outline-secondary me-2"
                    title="Modifica"
                    onClick={function () {
                      onEdit(p)
                    }}
                  >
                    <BsPencilFill size={13} />
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    title="Elimina"
                    onClick={function () {
                      onDelete(p.id)
                    }}
                  >
                    <BsTrashFill size={13} />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </Table>
      {renderPagination()}
    </>
  )
}

export default PaymentTable
