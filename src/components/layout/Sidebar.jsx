import { useContext } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import {
  BsGrid1X2Fill,
  BsPeopleFill,
  BsCalendar3,
  BsFileEarmarkTextFill,
  BsCashCoin,
  BsListUl,
  BsPersonFillGear,
  BsBoxArrowLeft,
  BsClipboard2PulseFill,
} from "react-icons/bs"
import { Button } from "react-bootstrap"

//prendo dal Context user, logout, isAdmin
const Sidebar = function () {
  const { user, logout, isAdmin } = useContext(AuthContext)
  const navigate = useNavigate()

  //al logout, cancello toker e user e rimando al login
  const handleLogout = function () {
    logout()
    navigate("/login")
  }

  //prendo le iniziali dell'user per avatar con iniziali
  const getInitials = function () {
    if (!user) return ""
    return (
      (user.firstName ? user.firstName[0] : "") +
      (user.lastName ? user.lastName[0] : "")
    ).toUpperCase()
  }

  //voci del menu sidebar con url, nome e icona
  const navItems = [
    { path: "/", label: "Dashboard", icon: <BsGrid1X2Fill /> },
    { path: "/patients", label: "Pazienti", icon: <BsPeopleFill /> },
    { path: "/appointments", label: "Agenda", icon: <BsCalendar3 /> },
    { path: "/quotes", label: "Preventivi", icon: <BsFileEarmarkTextFill /> },
    { path: "/payments", label: "Pagamenti & Report", icon: <BsCashCoin /> },
    { path: "/procedures", label: "Prestazioni", icon: <BsListUl /> },
  ]

  //tab Utenti visibile solo agli ADMIN
  if (isAdmin()) {
    navItems.push({
      path: "/users",
      label: "Utenti",
      icon: <BsPersonFillGear />,
    })
  }

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div
          className="d-flex align-items-center justify-content-center rounded-3"
          style={{
            width: 38,
            height: 38,
            backgroundColor: "var(--bs-primary)",
            color: "#fff",
          }}
        >
          <BsClipboard2PulseFill size={20} />
        </div>
        <div>
          <p className="mb-0 text-white fw-bold" style={{ fontSize: 17 }}>
            OpenClinic
          </p>
          <p
            className="mb-0"
            style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}
          >
            Gestionale Odontoiatrico
          </p>
        </div>
      </div>

      {/* Navigazione */}
      <nav className="sidebar-nav">
        {navItems.map(function (item) {
          return (
            //uso le voci del menu che ho creato
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={function ({ isActive }) {
                return "sidebar-link" + (isActive ? " active" : "")
              }}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      {/* User */}
      <div className="sidebar-user">
        {/* avatar con inizali utente */}
        <div className="sidebar-avatar">{getInitials()}</div>
        <div className="flex-grow-1">
          <div className="text-white" style={{ fontSize: 13, fontWeight: 600 }}>
            {user ? user.firstName + " " + user.lastName : ""}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
            {user ? user.role : ""}
          </div>
        </div>
        {/* pulsante logout */}
        <Button
          className="btn btn-link p-1 text-decoration-none"
          style={{ color: "rgba(255,255,255,0.35)" }}
          onClick={handleLogout}
          title="Esci"
        >
          <BsBoxArrowLeft size={18} />
        </Button>
      </div>
    </div>
  )
}

export default Sidebar
