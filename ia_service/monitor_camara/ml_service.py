from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os
import json

app = Flask(__name__)
CORS(app)

# Paths absolutos relativos a la ubicación de este script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Cargar modelo y encoders al iniciar
model    = joblib.load(os.path.join(BASE_DIR, 'modelo_diagnostico_reusetech.pkl'))
encoders = joblib.load(os.path.join(BASE_DIR, 'encoders_diagnostico.pkl'))

# Categorías de diagnóstico

# Cargar la definición de categorías desde el JSON suministrado por el proyecto
categorias_path = os.path.join(BASE_DIR, 'categorias_diagnostico.json')
if not os.path.exists(categorias_path):
    raise FileNotFoundError(f"categorias_diagnostico.json no encontrado en {categorias_path}")
with open(categorias_path, 'r', encoding='utf-8') as f:
    categorias_json = json.load(f)

# Convertir claves a enteros si vienen como strings
CATEGORIAS = {int(k): v for k, v in categorias_json.items()}

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json

        # Extraer datos
        enciende     = data.get('enciende')
        estado_fisico = data.get('estadoFisico')
        bateria      = data.get('bateria')
        antiguedad   = data.get('antiguedad')
        dispositivo  = data.get('dispositivo', '')

        # Codificar
        enc = encoders['enciende'].transform([enciende])[0]
        est = encoders['estadoFisico'].transform([estado_fisico])[0]
        bat = encoders['bateria'].transform([bateria])[0]
        ant = encoders['antiguedad'].transform([antiguedad])[0]

        # Predecir
        prediccion    = model.predict([[enc, est, bat, ant]])[0]
        probabilidades = model.predict_proba([[enc, est, bat, ant]])[0]
        confianza     = float(max(probabilidades) * 100)

        # Obtener resultado
        resultado = CATEGORIAS[int(prediccion)].copy()

        # Calcular impacto ambiental
        es_laptop = any(word in dispositivo.lower() for word in ['lap', 'book', 'note', 'portátil', 'portátil'])

        if es_laptop:
            resultado["impacto_ambiental"] = "320 kg CO2e evitados (≈15 árboles salvados)"
        else:
            resultado["impacto_ambiental"] = "65 kg CO2e evitados (≈3 árboles salvados)"

        resultado["confianza"] = round(confianza, 2)

        return jsonify(resultado)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "model": "loaded"})

if __name__ == '__main__':
    host = os.environ.get('APP_SERVER', '0.0.0.0')
    port = int(os.environ.get('APP_PORT', os.environ.get('PORT', 5000)))
    app.run(host=host, port=port, debug=True)
