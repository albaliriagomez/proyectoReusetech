FROM python:3.10-slim

WORKDIR /app

ENV TZ=America/La_Paz

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY modelo_diagnostico_reusetech.pkl ./
COPY encoders_diagnostico.pkl ./
COPY categorias_diagnostico.json ./
COPY ml_service.py ./

EXPOSE 5000

CMD ["python", "-u", "ml_service.py"]
