import { useMemo, useState, useCallback, useEffect } from "react"
import { Odontogram as TeethChart } from "react-odontogram"
import "react-odontogram/style.css"
import { Button, Badge, Spinner, ListGroup, Offcanvas } from "react-bootstrap"
import api from "../../services/api"
import TreatmentForm from "../treatments/TreatmentForm"

const PROCEDURE_COLORS = [
  { label: "Estrazione", color: "#ef4444", keys: ["estrazione", "extraction"] },
  { label: "Impianto", color: "#3b82f6", keys: ["impianto", "implant"] },
  {
    label: "Endodonzia",
    color: "#f59e0b",
    keys: ["endodonzia", "devitalizzazione", "root canal"],
  },
  {
    label: "Corona/Protesi",
    color: "#8b5cf6",
    keys: ["corona", "protesi", "crown"],
  },
  {
    label: "Otturazione",
    color: "#2a9d8f",
    keys: ["otturazione", "filling", "composita"],
  },
  { label: "Igiene", color: "#22c55e", keys: ["igiene", "scaling", "pulizia"] },
]

const getProcedureColor = function (name) {
  if (!name) return null
  const n = name.toLowerCase()
  const match = PROCEDURE_COLORS.find(function (p) {
    return p.keys.some(function (k) {
      return n.includes(k)
    })
  })
  return match ? match.color : "#2a9d8f"
}

const EmptyPanel = function () {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center h-100 text-muted"
      style={{ minHeight: 200 }}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mb-2 opacity-50"
      >
        <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
      <p className="small mb-0">Seleziona un dente</p>
    </div>
  )
}

const ToothPanel = function ({
  selectedTooth,
  toothTreatments,
  showProcPicker,
  procedures,
  loadingProc,
  onAddTreatment,
  onSelectProcedure,
}) {
  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-3">
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: "50%",
            backgroundColor: "#f1f5f9",
            fontWeight: 700,
            fontSize: 14,
            color: "#2a9d8f",
            flexShrink: 0,
          }}
        >
          {selectedTooth}
        </span>
        <span className="fw-semibold" style={{ fontSize: 15 }}>
          Dente {selectedTooth}
        </span>
      </div>

      {toothTreatments.length === 0 ? (
        <p className="text-muted small mb-3">Nessun trattamento registrato.</p>
      ) : (
        <ListGroup variant="flush" className="mb-3">
          {toothTreatments.map(function (t, i) {
            return (
              <ListGroup.Item key={i} className="px-0 py-2">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      flexShrink: 0,
                      backgroundColor:
                        getProcedureColor(t.procedureName) ?? "#94a3b8",
                    }}
                  />
                  <strong style={{ fontSize: 13 }}>{t.procedureName}</strong>
                  {t.procedureCode && (
                    <Badge bg="secondary" style={{ fontSize: 10 }}>
                      {t.procedureCode}
                    </Badge>
                  )}
                </div>
                <div className="text-muted ms-3" style={{ fontSize: 12 }}>
                  {t.date} · €{t.cost}
                  {t.surface && " · " + t.surface}
                  {t.notes && <div className="fst-italic mt-1">{t.notes}</div>}
                </div>
              </ListGroup.Item>
            )
          })}
        </ListGroup>
      )}

      {showProcPicker ? (
        <>
          <hr className="my-2" />
          <p className="fw-semibold small text-secondary mb-2">
            Seleziona prestazione:
          </p>
          {loadingProc ? (
            <div className="d-flex justify-content-center py-2">
              <Spinner
                animation="border"
                size="sm"
                style={{ color: "#2a9d8f" }}
              />
            </div>
          ) : (
            <ListGroup style={{ maxHeight: 240, overflowY: "auto" }}>
              {procedures.map(function (p) {
                return (
                  <ListGroup.Item
                    key={p.id}
                    action
                    onClick={function () {
                      onSelectProcedure(p)
                    }}
                    style={{ cursor: "pointer", fontSize: 13 }}
                  >
                    <Badge bg="secondary" className="me-2">
                      {p.code}
                    </Badge>
                    {p.name}
                    {p.price != null && (
                      <span className="text-muted ms-2 small">€{p.price}</span>
                    )}
                  </ListGroup.Item>
                )
              })}
            </ListGroup>
          )}
        </>
      ) : (
        <Button
          size="sm"
          className="border-0 fw-semibold w-100"
          style={{ backgroundColor: "#2a9d8f" }}
          onClick={onAddTreatment}
        >
          + Aggiungi trattamento
        </Button>
      )}
    </div>
  )
}

const Odontogram = function ({ patientId }) {
  const [treatments, setTreatments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTooth, setSelectedTooth] = useState(null)
  const [showDrawer, setShowDrawer] = useState(false)
  const [procedures, setProcedures] = useState([])
  const [showProcPicker, setShowProcPicker] = useState(false)
  const [loadingProc, setLoadingProc] = useState(false)
  const [selectedProcedure, setSelectedProcedure] = useState(null)
  const [showTreatmentForm, setShowTreatmentForm] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(function () {
    const handleResize = function () {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener("resize", handleResize)
    return function () {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const loadTreatments = useCallback(
    function () {
      if (!patientId) return
      setLoading(true)
      api
        .get("/api/treatments/patient/" + patientId + "?page=0&size=100")
        .then(function (data) {
          setTreatments(data.content ?? [])
          setLoading(false)
        })
        .catch(function () {
          setTreatments([])
          setLoading(false)
        })
    },
    [patientId],
  )

  useEffect(
    function () {
      loadTreatments()
    },
    [loadTreatments],
  )

  const toothMap = useMemo(
    function () {
      const map = {}
      treatments.forEach(function (t) {
        t.treatedToothList?.forEach(function (tt) {
          const key = String(tt.toothCode)
          if (!map[key]) map[key] = []
          map[key].push({
            procedureName: t.procedure?.name ?? "",
            procedureCode: t.procedure?.code ?? "",
            date: t.date,
            cost: t.cost,
            notes: t.notes,
            surface: tt.surface,
          })
        })
      })
      return map
    },
    [treatments],
  )

  const defaultSelected = useMemo(
    function () {
      return Object.keys(toothMap).map(function (code) {
        return "teeth-" + code
      })
    },
    [toothMap],
  )

  const teethConditions = useMemo(
    function () {
      const groups = {}
      Object.entries(toothMap).forEach(function (entry) {
        const code = entry[0]
        const treats = entry[1]
        const color = getProcedureColor(treats[0]?.procedureName) ?? "#2a9d8f"
        if (!groups[color]) {
          groups[color] = {
            label: treats[0]?.procedureName ?? "Trattamento",
            teeth: [],
            fillColor: color,
            outlineColor: color,
          }
        }
        groups[color].teeth.push("teeth-" + code)
      })
      return Object.values(groups)
    },
    [toothMap],
  )

  const handleChange = useCallback(function (selectedTeeth) {
    if (!selectedTeeth || selectedTeeth.length === 0) return
    const tooth = selectedTeeth[0]
    const fdiCode = tooth.notations?.fdi ?? tooth.id.replace("teeth-", "")
    setSelectedTooth(fdiCode)
    setShowProcPicker(false)
    setSelectedProcedure(null)
    if (window.innerWidth < 768) {
      setShowDrawer(true)
    }
  }, [])

  const handleOpenProcPicker = function () {
    if (procedures.length === 0) {
      setLoadingProc(true)
      api
        .get("/api/procedures?page=0&size=100")
        .then(function (data) {
          setProcedures(data.content ?? [])
          setLoadingProc(false)
        })
        .catch(function () {
          setProcedures([])
          setLoadingProc(false)
        })
    }
    setShowProcPicker(true)
  }

  const handleSelectProcedure = function (proc) {
    setSelectedProcedure(proc)
    setShowDrawer(false)
    setShowTreatmentForm(true)
  }

  const handleTreatmentSaved = function () {
    setShowTreatmentForm(false)
    setSelectedProcedure(null)
    loadTreatments()
  }

  const tooltipContent = useCallback(function (payload) {
    if (!payload) return null
    return (
      <div style={{ minWidth: 120, fontSize: 13 }}>
        <strong>Dente {payload.notations?.fdi}</strong>
        <div className="text-muted" style={{ fontSize: 11 }}>
          {payload.type}
        </div>
      </div>
    )
  }, [])

  const toothTreatments = toothMap[String(selectedTooth)] ?? []

  const panelContent = selectedTooth ? (
    <ToothPanel
      selectedTooth={selectedTooth}
      toothTreatments={toothTreatments}
      showProcPicker={showProcPicker}
      procedures={procedures}
      loadingProc={loadingProc}
      onAddTreatment={handleOpenProcPicker}
      onSelectProcedure={handleSelectProcedure}
    />
  ) : (
    <EmptyPanel />
  )

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-4">
        <Spinner animation="border" style={{ color: "#2a9d8f" }} />
      </div>
    )
  }

  return (
    <>
      <style>{`
        .odontogram-shell {
          margin: 0 auto;
          width: 100%;
        }

        .odontogram-shell .Odontogram g:focus,
        .odontogram-shell .Odontogram g:focus-visible {
          outline: none;
        }

        .tooth-panel {
          border-left: 1px solid #e2e8f0;
          padding-left: 1.25rem;
          min-height: 200px;
        }

        @media (max-width: 767px) {
          .tooth-panel { display: none; }
        }
      `}</style>

      <div className="row align-items-start g-3">
        {/* Odontogramma */}
        <div className="col-12 col-md-8">
          <div className="odontogram-shell">
            <TeethChart
              singleSelect
              layout="square"
              notation="FDI"
              defaultSelected={defaultSelected}
              teethConditions={teethConditions}
              onChange={handleChange}
              showLabels={false}
              tooltip={{
                placement: "top",
                margin: 10,
                content: tooltipContent,
              }}
              styles={{ width: "100%" }}
            />
          </div>

          {/* Legenda */}
          <div className="d-flex flex-wrap gap-3 justify-content-center mt-2">
            {PROCEDURE_COLORS.map(function (p) {
              return (
                <div
                  key={p.label}
                  className="d-flex align-items-center gap-1"
                  style={{ fontSize: 11 }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      backgroundColor: p.color,
                      flexShrink: 0,
                    }}
                  />
                  <span className="text-secondary">{p.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Pannello laterale — solo desktop */}
        <div className="col-md-4 d-none d-md-block">
          <div className="tooth-panel">{panelContent}</div>
        </div>
      </div>

      {/* Drawer mobile */}
      <Offcanvas
        show={showDrawer}
        onHide={function () {
          setShowDrawer(false)
          setShowProcPicker(false)
        }}
        placement="bottom"
        style={{
          height: "auto",
          maxHeight: "70vh",
          borderRadius: "16px 16px 0 0",
        }}
      >
        <Offcanvas.Header
          closeButton
          style={{ borderBottom: "1px solid #e2e8f0" }}
        >
          <Offcanvas.Title style={{ fontSize: 16, fontWeight: 700 }}>
            Dente {selectedTooth}
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body style={{ overflowY: "auto" }}>
          {panelContent}
        </Offcanvas.Body>
      </Offcanvas>

      <TreatmentForm
        show={showTreatmentForm}
        patientId={patientId}
        procedureId={selectedProcedure?.id}
        procedureName={selectedProcedure?.name}
        toothNumber={selectedTooth ? Number(selectedTooth) : null}
        quotedPrice={selectedProcedure?.price}
        onClose={function () {
          setShowTreatmentForm(false)
          if (isMobile) {
            setShowDrawer(true)
          }
        }}
        onSaved={handleTreatmentSaved}
      />
    </>
  )
}

export default Odontogram
