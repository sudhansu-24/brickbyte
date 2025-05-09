from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from valuation import PropertyValuationModel

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only configure properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the model
model = PropertyValuationModel()

class PropertyData(BaseModel):
    sqft: float
    property_type: str
    location_grade: str
    address: Optional[str] = None

@app.post("/api/valuation")
async def get_valuation(property_data: PropertyData):
    try:
        prediction = model.predict(property_data.dict())
        return prediction
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "model": "PropertyValuationModel v1.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 