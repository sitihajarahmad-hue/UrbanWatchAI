from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from api.services.geoai_service import GeoAIService
from api.services.gts_service import GTSService

app = FastAPI(title="UrbanWatch AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/analytics/summary")
def get_summary(region: str = Query("kl_central")):
    return GTSService.get_summary_metrics(region)

@app.get("/api/v1/spatial/change-detection")
def get_change_detection(region: str = Query("kl_central"), year: int = Query(2024)):
    return GeoAIService.detect_changes(region_id=region, year=year)

@app.get("/api/v1/alerts/priority")
def get_priority_alerts(region: str = Query("kl_central")):
    return {"alerts": GTSService.get_priority_alerts(region)}

