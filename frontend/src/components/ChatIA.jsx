// src/components/ChatIA.jsx
import React, { useState, useRef, useEffect } from "react";
import { IoIosSend } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Bot, User, Sparkles, ShieldCheck, Zap } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || 'https://proyectoreusetech-backend.onrender.com';

export default function ChatIA() {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const handleSubmit = async () => {
    if (!userInput.trim()) return;

    const prompt = userInput;
    setChatHistory((prev) => [...prev, { sender: "user", text: prompt }]);
    setUserInput("");
    setIsLoading(true);

    try {
      let response;
      try {
        response = await fetch(`${API_BASE_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mensaje: prompt, prompt })
        });
      } catch (e) {
        response = await fetch(`${API_BASE_URL}/api/chatbot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mensaje: prompt, prompt })
        });
      }

      if (!response.ok) {
        throw new Error(`Error en el servidor de IA (${response.status})`);
      }

      const data = await response.json();
      const respuestaIA = data.respuesta || data.reply || data.message;

      if (respuestaIA) {
        setChatHistory((prev) => [...prev, { sender: "bot", text: respuestaIA }]);
      } else {
        throw new Error("No hay respuesta válida de la IA");
      }
    } catch (error) {
      console.error("Error al conectar con la IA:", error);
      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", text: "❌ **Error de conexión**: No se pudo contactar con el servidor de IA en Render. Revisa tu conexión o reintenta más tarde." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="min-h-screen bg-[#f4f7f9] font-['Plus_Jakarta_Sans'] pb-10">
      
      <div className="max-w-3xl mx-auto px-4 pt-10">
        
        {/* HEADER DE LA IA */}
        <header className="mb-8 flex flex-col items-center text-center">
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-[#5bc0de] mb-4 shadow-xl shadow-slate-900/20"
          >
            <Bot size={32} strokeWidth={1.5} />
          </motion.div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={14} className="text-[#5bc0de]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5bc0de]">Asistente ReUseTech</span>
          </div>
          <h2 className="text-3xl font-[900] text-slate-900 tracking-tighter">Soporte IA</h2>
        </header>

        {/* CONTENEDOR DE MENSAJES */}
        <div className="bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/50 flex flex-col h-[600px] overflow-hidden">
          
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200"
          >
            {chatHistory.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center px-10">
                <div className="w-12 h-12 bg-cyan-50 rounded-full flex items-center justify-center text-[#5bc0de] mb-4">
                  <Zap size={24} />
                </div>
                <h4 className="font-black text-slate-800 mb-2">¿En qué puedo ayudarte hoy?</h4>
                <p className="text-slate-400 text-sm font-medium">Pregúntame sobre reciclaje técnico, estados de tus publicaciones o cómo funciona la plataforma.</p>
              </div>
            )}

            <AnimatePresence>
              {chatHistory.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[10px] font-black shadow-sm ${
                      msg.sender === "user" ? "bg-[#5bc0de] text-white" : "bg-slate-900 text-[#5bc0de]"
                    }`}>
                      {msg.sender === "user" ? <User size={14}/> : <Bot size={14}/>}
                    </div>
                    
                    <div className={`px-5 py-3 rounded-[1.8rem] shadow-sm ${
                      msg.sender === "user" 
                        ? "bg-[#5bc0de] text-white rounded-tr-none" 
                        : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                    }`}>
                      <div className="text-sm md:text-base font-bold leading-relaxed markdown-container">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <div className="flex justify-start items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-[#5bc0de] animate-pulse">
                  <Bot size={14}/>
                </div>
                <div className="bg-white border border-slate-100 px-5 py-3 rounded-[1.8rem] rounded-tl-none flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* ÁREA DE INPUT */}
          <div className="p-4 bg-white border-t border-slate-50">
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                className="w-full pl-6 pr-16 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none focus:border-[#5bc0de] transition-all font-bold text-slate-700 placeholder:text-slate-400"
                placeholder="Escribe tu consulta aquí..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
              />
              <button
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all ${
                  !userInput.trim() || isLoading 
                    ? "text-slate-300" 
                    : "bg-[#5bc0de] text-white shadow-lg shadow-[#5bc0de]/30 hover:scale-110 active:scale-95"
                }`}
                onClick={handleSubmit}
                disabled={!userInput.trim() || isLoading}
              >
                <IoIosSend size={20} />
              </button>
            </div>
            <div className="flex justify-center items-center gap-2 mt-3 text-slate-400 opacity-60">
              <ShieldCheck size={12} />
              <span className="text-[9px] font-black uppercase tracking-widest">IA Entrenada para soporte técnico</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}