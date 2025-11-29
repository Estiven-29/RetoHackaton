from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.endpoints import analysis

app = FastAPI(title="IDS SCADA Dashboard")

# Configurar CORS para permitir peticiones desde React (puerto 5173 por defecto en Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis.router, prefix="/api/v1", tags=["analysis"])

@app.get("/")
def read_root():
    return {"message": "IDS SCADA API Online"}
