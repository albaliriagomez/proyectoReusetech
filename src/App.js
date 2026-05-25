// src/App.jsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from './components/Navbar';
import './styles/tailwind.css';

// Lazy loaded components
import PerfilUsuario from './components/PerfilUsuario';
import MisPublicaciones from './components/MisPublicaciones';
import BandejaEntrada from './components/BandejaEntrada';
import ChatIA from './components/ChatIA';
import Busqueda from './components/Busqueda'; 
import AdminPanel from './components/AdminPanel';
const Landing = lazy(() => import('./components/Landing'));
const Login = lazy(() => import('./components/Login'));
const Register = lazy(() => import('./components/Register'));
const MainPage = lazy(() => import('./components/MainPage'));
const FormPage = lazy(() => import('./components/FormPage'));
const DetallePublicacion = lazy(() => import('./components/DetallePublicacion'));
const ChatPrivado = lazy(() => import('./components/ChatPrivado'));
const DiagnosticoInteligente = lazy(() => import('./components/DiagnosticoInteligente'));
const DiagnosticoSistemas = lazy(() => import('./components/DiagnosticoSistemas'));
const ReconocimientoComponentes = lazy(() => import('./components/ReconocimientoComponentes'));


function App() {
  return (
    <Router>
      <Navbar />
      <Suspense fallback={<div className="text-center mt-20 text-xl text-gray-500">Cargando...</div>}>
      <Routes>
        <Route path="/perfil" element={<PerfilUsuario />} />
        <Route path="/mis-publicaciones/:id" element={<MisPublicaciones />} />
        <Route path="/" element={<Landing />} /> {/* ✅ solo una vez */}
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<MainPage />} /> {/* cambia MainPage de / a /home */}
        <Route path="/form" element={<FormPage />} />
        <Route path="/detalle/:id" element={<DetallePublicacion />} />
        <Route path="/chat/:user1/:user2/:publicacionId" element={<ChatPrivado />} />
        <Route path="/bandeja" element={<BandejaEntrada />} />
        <Route path="/soporte" element={<ChatIA />} />
        <Route path="/buscar" element={<Busqueda />} />
        <Route path="/diagnostico" element={<DiagnosticoInteligente />} />
        <Route path="/diagnostico-sistemas" element={<DiagnosticoSistemas />} />
        <Route path="/escaner" element={<ReconocimientoComponentes />} />
        <Route path="/admin" element={<AdminPanel />} />

      </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
