import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Users, Cpu, Zap, Leaf, Info, TrendingUp } from 'lucide-react';

// Registrar los componentes necesarios de Chart.js
ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

// ─── LÓGICA DE REGRESIÓN LINEAL (MÍNIMOS CUADRADOS) ──────────────────────────
const calculateRegression = (x, y) => {
  const n = x.length;
  if (n === 0) return { m: 0, b: 0, r2: 0, predict: () => 0 };

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumXX = x.reduce((sum, val) => sum + val * val, 0);

  const denominator = n * sumXX - sumX * sumX;
  const m = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;
  const b = (sumY - m * sumX) / n;

  // Calcular R² (Coeficiente de Determinación)
  const meanY = sumY / n;
  const ssRes = y.reduce((sum, val, i) => sum + Math.pow(val - (m * x[i] + b), 2), 0);
  const ssTot = y.reduce((sum, val) => sum + Math.pow(val - meanY, 2), 0);
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  return {
    m,
    b,
    r2,
    predict: (val) => m * val + b
  };
};

const modelsData = [
  {
    id: 'comunidad',
    title: 'Proyección del Crecimiento de la Comunidad',
    subtitle: 'Usuarios registrados acumulados en la plataforma',
    icon: <Users className="text-cyan-500" size={18} />,
    xLabel: 'Meses de operación',
    yLabel: 'Usuarios acumulados',
    historicalX: [1, 2, 3, 4, 5],
    historicalY: [120, 240, 450, 680, 950],
    predictionX: [6, 7, 8],
    xFormat: (x) => `Mes ${x}`,
    yFormat: (y) => `${Math.round(y).toLocaleString('es-BO')} usuarios`
  },
  {
    id: 'raee',
    title: 'Estimación de Captación de RAEE',
    subtitle: 'Total de dispositivos electrónicos procesados',
    icon: <Cpu className="text-cyan-500" size={18} />,
    xLabel: 'Meses de operación',
    yLabel: 'Dispositivos procesados',
    historicalX: [1, 2, 3, 4, 5],
    historicalY: [80, 170, 310, 520, 780],
    predictionX: [6, 7, 8],
    xFormat: (x) => `Mes ${x}`,
    yFormat: (y) => `${Math.round(y).toLocaleString('es-BO')} equipos`
  },
  {
    id: 'ia_eficiencia',
    title: 'Eficiencia del Diagnóstico por IA',
    subtitle: 'Relación entre equipos evaluados por la IA y reutilizados con éxito',
    icon: <Zap className="text-cyan-500" size={18} />,
    xLabel: 'Dispositivos evaluados por la IA',
    yLabel: 'Equipos reutilizados con éxito',
    historicalX: [50, 100, 150, 200, 250],
    historicalY: [38, 79, 122, 168, 218],
    predictionX: [300, 350, 400],
    xFormat: (x) => `${x} evaluados`,
    yFormat: (y) => `${Math.round(y).toLocaleString('es-BO')} equipos`
  },
  {
    id: 'impacto_ambiental',
    title: 'Impacto Ambiental Predictivo',
    subtitle: 'Kilogramos de CO2 evitados acumulados según dispositivos recuperados',
    icon: <Leaf className="text-cyan-500" size={18} />,
    xLabel: 'Dispositivos recuperados',
    yLabel: 'Kilogramos de CO2 evitado',
    historicalX: [100, 220, 350, 500, 680],
    historicalY: [250, 550, 880, 1260, 1710],
    predictionX: [800, 950, 1100],
    xFormat: (x) => `${x} disp.`,
    yFormat: (y) => `${Math.round(y).toLocaleString('es-BO')} kg CO2`
  }
];

const AnaliticaPredictiva = () => {
  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans']">
      {/* Cabecera del Módulo */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-cyan-500">
              <TrendingUp size={24} />
            </span>
            <h2 className="text-lg font-black text-slate-900">Módulo de Analítica Predictiva</h2>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            Modelos matemáticos de regresión lineal por mínimos cuadrados calculados directamente en el frontend. Proyecta tendencias de crecimiento, captación, eficiencia de IA e impacto ecológico a partir de los datos históricos de ReUseTech.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-600 text-xs font-bold self-stretch md:self-auto justify-center">
          <Info size={14} /> Regresión Lineal Activa
        </div>
      </div>

      {/* Grilla de Modelos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {modelsData.map((model) => {
          // Ejecutar cálculo matemático
          const { m, b, r2, predict } = calculateRegression(model.historicalX, model.historicalY);
          
          // Ecuación formateada
          const equation = `Y = ${m.toFixed(2)}X ${b >= 0 ? '+' : '-'} ${Math.abs(b).toFixed(2)}`;
          
          // Determinación de confiabilidad según R²
          let reliabilityLabel = 'Baja Confiabilidad';
          let reliabilityColor = 'text-red-500 bg-red-50 border-red-100';
          if (r2 >= 0.95) {
            reliabilityLabel = 'Alta Confiabilidad';
            reliabilityColor = 'text-emerald-600 bg-emerald-50 border-emerald-100';
          } else if (r2 >= 0.80) {
            reliabilityLabel = 'Confiabilidad Media';
            reliabilityColor = 'text-amber-600 bg-amber-50 border-amber-100';
          }

          // Predicción para el siguiente valor inmediato
          const nextValX = model.predictionX[0];
          const nextValY = predict(nextValX);

          // Construcción de puntos para Chart.js
          const historicalDataPoints = model.historicalX.map((x, i) => ({
            x: x,
            y: model.historicalY[i]
          }));

          const projectedDataPoints = model.predictionX.map(x => ({
            x: x,
            y: predict(x)
          }));

          // Puntos mínimos y máximos para trazar la línea de regresión completa
          const minX = Math.min(...model.historicalX);
          const maxX = Math.max(...model.predictionX);
          const trendLinePoints = [
            { x: minX, y: predict(minX) },
            { x: maxX, y: predict(maxX) }
          ];

          // Datos estructurados para Chart.js
          const chartData = {
            datasets: [
              {
                label: 'Datos Históricos',
                data: historicalDataPoints,
                backgroundColor: '#00b0ca',
                borderColor: '#00b0ca',
                pointRadius: 6,
                pointHoverRadius: 8,
                showLine: false, // Scatter
              },
              {
                label: 'Proyecciones (Futuro)',
                data: projectedDataPoints,
                backgroundColor: '#ffffff',
                borderColor: '#f43f5e',
                borderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
                showLine: false, // Scatter
              },
              {
                label: 'Línea de Tendencia',
                data: trendLinePoints,
                borderColor: '#f43f5e',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false,
                showLine: true, // Línea pura
              }
            ]
          };

          // Opciones de configuración de Chart.js
          const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                type: 'linear',
                position: 'bottom',
                title: {
                  display: true,
                  text: model.xLabel,
                  color: '#64748b',
                  font: {
                    family: 'Plus Jakarta Sans',
                    size: 11,
                    weight: 'bold'
                  }
                },
                grid: {
                  color: '#f1f5f9'
                },
                ticks: {
                  color: '#94a3b8',
                  font: {
                    family: 'Plus Jakarta Sans',
                    size: 11
                  },
                  stepSize: model.id === 'ia_eficiencia' || model.id === 'impacto_ambiental' ? undefined : 1
                }
              },
              y: {
                title: {
                  display: true,
                  text: model.yLabel,
                  color: '#64748b',
                  font: {
                    family: 'Plus Jakarta Sans',
                    size: 11,
                    weight: 'bold'
                  }
                },
                grid: {
                  color: '#f1f5f9'
                },
                ticks: {
                  color: '#94a3b8',
                  font: {
                    family: 'Plus Jakarta Sans',
                    size: 11
                  }
                }
              }
            },
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  boxWidth: 12,
                  boxHeight: 12,
                  color: '#475569',
                  font: {
                    family: 'Plus Jakarta Sans',
                    size: 11,
                    weight: '600'
                  }
                }
              },
              tooltip: {
                backgroundColor: '#0f172a',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                titleFont: { family: 'Plus Jakarta Sans', size: 11, weight: 'bold' },
                bodyFont: { family: 'Plus Jakarta Sans', size: 11 },
                padding: 10,
                cornerRadius: 8,
                callbacks: {
                  label: (context) => {
                    const datasetLabel = context.dataset.label || '';
                    const xVal = context.parsed.x;
                    const yVal = context.parsed.y;
                    return `${datasetLabel}: (${model.xFormat(xVal)}, ${model.yFormat(yVal)})`;
                  }
                }
              }
            }
          };

          return (
            <div 
              key={model.id}
              className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col justify-between transition-all hover:shadow-md"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
            >
              <div>
                {/* Encabezado del Gráfico */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-cyan-50 text-cyan-500">
                    {model.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 leading-tight">{model.title}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider font-semibold leading-tight">{model.subtitle}</p>
                  </div>
                </div>

                {/* Tarjetas de Métricas Estadísticas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                  {/* Ecuación del Modelo */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col justify-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Ecuación del Modelo</p>
                    <code className="text-xs font-bold text-slate-700 bg-white border border-slate-100 px-2 py-0.5 rounded-md inline-block text-center font-mono">
                      {equation}
                    </code>
                  </div>

                  {/* Coeficiente R2 */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col justify-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Coeficiente R²</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-800">
                        {r2.toFixed(4)}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${reliabilityColor}`}>
                        {reliabilityLabel}
                      </span>
                    </div>
                  </div>

                  {/* Predicción Inmediata */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col justify-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Prox. Valor ({model.xFormat(nextValX)})
                    </p>
                    <p className="text-xs font-black text-cyan-600">
                      {model.yFormat(nextValY)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Área del Gráfico */}
              <div className="h-72 relative w-full">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnaliticaPredictiva;
