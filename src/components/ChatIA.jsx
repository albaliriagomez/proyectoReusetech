// src/components/ChatIA.jsx
import React, { useState } from "react";
import { generateContent } from "./Model";
import { IoIosSend } from "react-icons/io";
import ReactMarkdown from "react-markdown";

export default function ChatIA() {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!userInput.trim()) return;

    const prompt = userInput;
    setChatHistory((prev) => [...prev, { sender: "user", text: prompt }]);
    setUserInput("");
    setIsLoading(true);

    try {
      const response = await generateContent(prompt);
      setChatHistory((prev) => [...prev, { sender: "bot", text: response }]);
    } catch (error) {
      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", text: "❌ Ocurrió un error al generar respuesta." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-[#5bc0de]"> Soporte IA</h2>

      <div className="bg-white rounded shadow p-4 mb-4 h-80 overflow-y-scroll">
        {chatHistory.map((msg, i) => (
          <p key={i} className={`mb-2 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
            <span className="block font-semibold">
              {msg.sender === "user" ? "Tú:" : "IA:"}
            </span>
            <ReactMarkdown>{msg.text}</ReactMarkdown>
          </p>
        ))}
        {isLoading && <p className="text-gray-500">⏳ Cargando...</p>}
      </div>

      <div className="flex gap-2">
        <input
          className="border border-gray-300 rounded px-3 py-2 w-full"
          placeholder="Escribe tu pregunta..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button
          className="bg-[#5bc0de] hover:bg-[#31a6c4] text-white px-4 py-2 rounded"
          onClick={handleSubmit}
        >
          <IoIosSend size={20} />
        </button>
      </div>
    </div>
  );
}
