// Di dalam src/App.jsx, tukar panggilan fetch kepada laluan relatif:

useEffect(() => {
  // Fetch Metrics
  fetch(`/api/v1/analytics/summary?region=${selectedRegion}`)
    .then(res => res.json())
    .then(data => setSummary(data))
    .catch(err => console.error(err));

  // Fetch Spatial GeoJSON
  fetch(`/api/v1/spatial/change-detection?region=${selectedRegion}&year=${year}`)
    .then(res => res.json())
    .then(data => setGeojson(data))
    .catch(err => console.error(err));

  // Fetch Alerts
  fetch(`/api/v1/alerts/priority?region=${selectedRegion}`)
    .then(res => res.json())
    .then(data => setAlerts(data.alerts || []))
    .catch(err => console.error(err));
}, [selectedRegion, year]);

