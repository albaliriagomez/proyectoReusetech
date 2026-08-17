// src/App.js
import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Routes, Outlet } from "react-router-dom";
import Navbar from './components/Navbar';
import './styles/tailwind.css';

// Importaciones directas (no lazy) para rutas que necesitan estado inmediato
import PerfilUsuario      from './components/PerfilUsuario';
import MisPublicaciones   from './components/MisPublicaciones';
import BandejaEntrada     from './components/BandejaEntrada';
import ChatIA             from './components/ChatIA';
import Busqueda           from './components/Busqueda';
import AdminPanel         from './components/AdminPanel';
import ProtectedRoute     from './components/ProtectedRoute';

// Lazy-loaded para el resto de rutas públicas
const Landing                  = lazy(() => import('./components/Landing'));
const Login                    = lazy(() => import('./components/Login'));
const Register                 = lazy(() => import('./components/Register'));
const MainPage                 = lazy(() => import('./components/MainPage'));
const FormPage                 = lazy(() => import('./components/FormPage'));
const DetallePublicacion       = lazy(() => import('./components/DetallePublicacion'));
const ChatPrivado              = lazy(() => import('./components/ChatPrivado'));
const DiagnosticoInteligente   = lazy(() => import('./components/DiagnosticoInteligente'));
const DiagnosticoSistemas      = lazy(() => import('./components/DiagnosticoSistemas'));
const ReconocimientoComponentes = lazy(() => import('./components/ReconocimientoComponentes'));
const EditarPublicacion        = lazy(() => import('./components/EditarPublicación'));

// ── Layout para usuarios normales: incluye el Navbar ──────────────────────────
const UserLayout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

const Loader = () => (
  <div className="flex items-center justify-center min-h-screen bg-white">
    <div className="w-10 h-10 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin" />
  </div>
);

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <Suspense fallback={<Loader />}>
        <Routes>

          {/* ── ADMIN: pantalla completa, sin Navbar de usuario ─────────── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute
                element={<AdminPanel />}
                requiredRole="admin"
              />
            }
          />
          <Route
            path="/admin/analitica"
            element={
              <ProtectedRoute
                element={<AdminPanel initialSection="analitica" />}
                requiredRole="admin"
              />
            }
          />

          {/* ── RUTAS PÚBLICAS / DE USUARIO: llevan Navbar ──────────────── */}
          <Route element={<UserLayout />}>
            <Route path="/"                         element={<Landing />} />
            <Route path="/landing"                  element={<Landing />} />
            <Route path="/login"                    element={<Login />} />
            <Route path="/register"                 element={<Register />} />
            <Route path="/home"                     element={<MainPage />} />
            <Route path="/catalogo"                 element={<MainPage />} />
            <Route path="/perfil"                   element={<PerfilUsuario />} />
            <Route path="/mis-publicaciones/:id"    element={<MisPublicaciones />} />
            <Route path="/form"                     element={<FormPage />} />
            <Route path="/publicar"                 element={<FormPage />} />
            {/* Soportamos ambas mayúsculas por links legacy en componentes */}
            <Route path="/detalle/:id"              element={<DetallePublicacion />} />
            <Route path="/Detalle/:id"              element={<DetallePublicacion />} />
            <Route path="/editar/:id"               element={<EditarPublicacion />} />
            <Route path="/chat/:usuarioId/:emisorId/:publicacionId" element={<ChatPrivado />} />
            <Route path="/bandeja"                  element={<BandejaEntrada />} />
            <Route path="/soporte"                  element={<ChatIA />} />
            <Route path="/buscar"                   element={<Busqueda />} />
            <Route path="/diagnostico"              element={<DiagnosticoInteligente />} />
            <Route path="/diagnostico-sistemas"     element={<DiagnosticoSistemas />} />
            <Route path="/escaner"                  element={<ReconocimientoComponentes />} />
          </Route>

        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
