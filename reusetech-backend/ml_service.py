from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)

# Cargar modelo y encoders al iniciar
model = joblib.load('modelo_diagnostico_reusetech.pkl')
encoders = joblib.load('encoders_diagnostico.pkl')

# Categorías de diagnóstico
CATEGORIAS = {
    0: {
        "estado": "PARA RECICLAR",
        "puntuacion": 12,
        "color": "#DC2626",
        "analisis": "Daños estructurales críticos detectados. El dispositivo presenta fallas múltiples que imposibilitan su reutilización funcional. Recomendamos desmantelamiento controlado para recuperación de polímeros técnicos y metales base.",
        "recomendacion_pro": "Gestión de E-Waste certificada R2/e-Stewards para recuperación de materiales estratégicos.",
    },
    1: {
        "estado": "PARA REPUESTOS",
        "puntuacion": 35,
        "color": "#EA580C",
        "analisis": "Fallas críticas en subsistemas principales, pero módulos funcionales de alto valor aptos para trasplante técnico (LCD, teclados, memoria, almacenamiento).",
        "recomendacion_pro": "Harvesting de componentes para donación técnica o reventa en mercado de repuestos OEM.",
    },
    2: {
        "estado": "PARA DONAR",
        "puntuacion": 58,
        "color": "#2563EB",
        "analisis": "Funcionalidad operativa estable para cargas básicas. Hardware suficiente para tareas productivas estándar pese a desgaste cosmético o batería degradada.",
        "recomendacion_pro": "Reacondicionamiento social: limpieza, reinstalación OS, canalización a instituciones educativas o proyectos comunitarios.",
    },
    3: {
        "estado": "PARA REPARAR",
        "puntuacion": 88,
        "color": "#16A34A",
        "analisis": "Potencial de reuso óptimo. Arquitectura vigente con componentes funcionales. Intervención técnica estándar lo reintegrará al mercado secundario premium.",
        "recomendacion_pro": "Refurbishing Premium: restauración completa con certificación de calidad para reventa corporativa o mercado abierto.",
    }
}

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        # Extraer datos
        enciende = data.get('enciende')
        estado_fisico = data.get('estadoFisico')
        bateria = data.get('bateria')
        antiguedad = data.get('antiguedad')
        dispositivo = data.get('dispositivo', '')
        
        # Codificar
        enc = encoders['enciende'].transform([enciende])[0]
        est = encoders['estadoFisico'].transform([estado_fisico])[0]
        bat = encoders['bateria'].transform([bateria])[0]
        ant = encoders['antiguedad'].transform([antiguedad])[0]
        
        # Predecir
        prediccion = model.predict([[enc, est, bat, ant]])[0]
        probabilidades = model.predict_proba([[enc, est, bat, ant]])[0]
        confianza = float(max(probabilidades) * 100)
        
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
    app.run(host='0.0.0.0', port=5001, debug=True)