/**
 * Page Map (Cartographie et Zones à Risque)
 * Version Premium iOS Medical
 */
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, useMap } from 'react-leaflet';
import { getNearbyEnvironmentData } from '../services/environment';
import { getNearbyRiskZones, getRiskZonesMap } from '../services/community';

// Composant pour centrer la carte sur la position de l'utilisateur
function MapCenter({ center, zoom, animate = true }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1] && !isNaN(center[0]) && !isNaN(center[1])) {
      map.flyTo(center, zoom, {
        animate: animate,
        duration: 1.5
      });
    }
  }, [map, center, zoom, animate]);
  return null;
}

const Map = () => {
  const [userPosition, setUserPosition] = useState({ lat: 5.3600, lng: -4.0083 }); // Abidjan par défaut
  const [environmentData, setEnvironmentData] = useState([]);
  const [riskZones, setRiskZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [geoError, setGeoError] = useState('');
  const [manualPosition, setManualPosition] = useState({ lat: '', lng: '' });
  const [showManualInput, setShowManualInput] = useState(false);

  // Filtres
  const [showRiskZones, setShowRiskZones] = useState(true);
  const [showPollution, setShowPollution] = useState(true);
  const [riskLevelFilter, setRiskLevelFilter] = useState('all');

  const fetchEnvironmentData = async (lat, lng) => {
    try {
      setLoading(true);
      const data = await getNearbyEnvironmentData(lat, lng, 10000);
      setEnvironmentData(Array.isArray(data) ? data : (data.results || []));
    } catch (err) {
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const fetchRiskZones = async (lat, lng) => {
    try {
      const data = await getNearbyRiskZones(lat, lng, 10000);
      setRiskZones(Array.isArray(data) ? data : (data.results || []));
    } catch (err) {
      setRiskZones([]);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError('GPS indisponible');
      fetchEnvironmentData(userPosition.lat, userPosition.lng);
      return;
    }

    let currentWatchId = null;
    if (trackingEnabled) {
      const geoOptions = { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 };

      const onSuccess = (position) => {
        const newPos = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserPosition(newPos);
        setGeoError('');
        fetchEnvironmentData(newPos.lat, newPos.lng);
        fetchRiskZones(newPos.lat, newPos.lng);
      };

      const onError = (err) => {
        setGeoError('Erreur GPS');
        if (userPosition.lat === 5.3600) fetchEnvironmentData(5.3600, -4.0083);
      };

      navigator.geolocation.getCurrentPosition(onSuccess, onError, geoOptions);
      currentWatchId = navigator.geolocation.watchPosition(onSuccess, onError, geoOptions);
    }

    return () => { if (currentWatchId) navigator.geolocation.clearWatch(currentWatchId); };
  }, [trackingEnabled]);

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical': case 'high': return '#FF3B30'; // iOS Red
      case 'moderate': return '#FF9500'; // iOS Orange
      case 'low': return '#34C759'; // iOS Green
      default: return '#AFADB3';
    }
  };

  const filteredData = environmentData.filter((data) => {
    if (!showPollution) return false;
    const p = data.pollution_level || 0;
    const level = p > 70 ? 'high' : p > 40 ? 'moderate' : 'low';
    if (riskLevelFilter !== 'all' && level !== riskLevelFilter) return false;
    return true;
  });


  const [currentAQI, setCurrentAQI] = useState(40); // Default safe value
  const [aqiStatus, setAqiStatus] = useState({ text: 'Sain', color: '#34C759' });
  const [sseConnected, setSseConnected] = useState(false);

  useEffect(() => {
    // Determine Base URL for SSE
    const getSSEUrl = () => {
      const host = window.location.hostname;
      // Simple logic to detect dev environment or fallback
      if (host === 'localhost' || host === '127.0.0.1') {
        return 'http://127.0.0.1:8000/api/alerts/stream/';
      }
      return 'https://7znhv71w-8000.uks1.devtunnels.ms/api/alerts/stream/';
    };

    const eventSource = new EventSource(getSSEUrl());

    eventSource.onopen = () => {
      console.log("SSE Connected");
      setSseConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Handle explicit AQI update or fallback to generic alert if applicable
        if (data.type === 'aqi_update' || data.iqa) {
          const val = data.aqi || data.iqa;
          if (val !== undefined) {
            setCurrentAQI(val);
            // Update status
            const isRisk = val >= 100;
            setAqiStatus({
              text: isRisk ? 'Risque' : 'Sain',
              color: isRisk ? '#FF3B30' : '#34C759'
            });
          }
        }
      } catch (e) {
        console.error("SSE Parse Error", e);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE Error", err);
      setSseConnected(false);
      eventSource.close();
      // Optional: Retry logic could be added here
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* FLOATING TOP BAR - Glassmorphism */}
      <div className="absolute top-20 left-6 right-6 z-[1000] animate-in slide-in-from-top duration-700">
        <div className="bg-white/80 backdrop-blur-2xl p-5 rounded-[28px] border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-[10px] font-black tracking-[0.2em] text-emerald-600 uppercase mb-0.5">Géolocalisation</p>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Carte de Santé</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setTrackingEnabled(!trackingEnabled)}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${trackingEnabled ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-100 text-slate-400'}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
              <button
                onClick={() => setShowManualInput(!showManualInput)}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${showManualInput ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'bg-slate-100 text-slate-400'}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              </button>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {[
              { label: 'Air', active: showPollution, toggle: () => setShowPollution(!showPollution) },
              { label: 'Zones', active: showRiskZones, toggle: () => setShowRiskZones(!showRiskZones) },
              { label: 'Urgent', active: riskLevelFilter === 'high', toggle: () => setRiskLevelFilter(riskLevelFilter === 'high' ? 'all' : 'high') },
            ].map((f, i) => (
              <button
                key={i}
                onClick={f.toggle}
                className={`px-4 py-1.5 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all border ${f.active ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm' : 'bg-white text-slate-400 border-slate-100'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {showManualInput && (
          <div className="mt-3 bg-white/90 backdrop-blur-xl p-4 rounded-3xl border border-white/50 shadow-xl animate-in zoom-in duration-300">
            <div className="flex gap-2">
              <input type="number" placeholder="Lat" value={manualPosition.lat} onChange={e => setManualPosition({ ...manualPosition, lat: e.target.value })} className="flex-1 bg-slate-50 border-none rounded-2xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition-all" />
              <input type="number" placeholder="Lng" value={manualPosition.lng} onChange={e => setManualPosition({ ...manualPosition, lng: e.target.value })} className="flex-1 bg-slate-50 border-none rounded-2xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition-all" />
              <button onClick={() => { setUserPosition({ lat: parseFloat(manualPosition.lat), lng: parseFloat(manualPosition.lng) }); setShowManualInput(false); }} className="bg-emerald-500 text-white px-4 rounded-2xl font-black text-xs uppercase tracking-widest">OK</button>
            </div>
          </div>
        )}
      </div>

      {/* FLOATING REAL-TIME AQI CARD */}
      <div className="absolute top-64 left-6 z-[1000] animate-in slide-in-from-left duration-1000">
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-[24px] border border-white/60 shadow-xl flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg transition-colors duration-500`} style={{ backgroundColor: aqiStatus.color }}>
            {currentAQI}
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Qualité Air</p>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full animate-pulse`} style={{ backgroundColor: aqiStatus.color }}></div>
              <p className="text-sm font-black text-slate-900">{aqiStatus.text}</p>
            </div>
          </div>
        </div>
      </div>

      {/* FULL SCREEN MAP */}
      <div className="h-screen w-full relative z-0">
        <MapContainer center={[userPosition.lat, userPosition.lng]} zoom={13} style={{ height: '100%', width: '100%' }} className="leaflet-ios-safe">
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution="CARTO" />
          <MapCenter center={[userPosition.lat, userPosition.lng]} zoom={13} />

          {/* Dynamic AQI Circle around User */}
          <Circle
            center={[userPosition.lat, userPosition.lng]}
            radius={Math.min(Date.now() % 2 === 0 ? currentAQI * 20 : currentAQI * 20, 2000)} // Just static radius relative to AQI for now, or dynamic update? 
          // The requirement says "Taille évolue selon la valeur AQI". Let's map AQI 0..500 to Radius 200..2000
          // Actually, keep it simple: AQI * 10 meters.
          />
          <Circle
            center={[userPosition.lat, userPosition.lng]}
            radius={Math.max(200, currentAQI * 10)}
            pathOptions={{
              color: aqiStatus.color,
              fillColor: aqiStatus.color,
              fillOpacity: 0.15,
              weight: 1,
              className: 'animate-pulse-slow' // We can add custom css animation if needed
            }}
          />

          {/* User Marker */}
          <CircleMarker center={[userPosition.lat, userPosition.lng]} radius={12} pathOptions={{ color: '#007AFF', fillColor: '#007AFF', fillOpacity: 0.5, weight: 3 }}>
            <Popup><div className="font-black text-slate-900 p-1">📍 Ma Position</div></Popup>
          </CircleMarker>

          {/* Risk Zones */}
          {showRiskZones && riskZones.map((z, i) => (
            <Circle key={i} center={[z.latitude, z.longitude]} radius={z.radius_meters || 400} pathOptions={{ color: getRiskColor(z.risk_level), fillColor: getRiskColor(z.risk_level), fillOpacity: 0.2, weight: 2 }}>
              <Popup><div className="p-2"><h4 className="font-black text-slate-900 border-b pb-1 mb-1">{z.zone_name || 'Zone Sensible'}</h4><p className="text-[11px] font-bold text-slate-500">Risque: {z.risk_level_display || z.risk_level}</p></div></Popup>
            </Circle>
          ))}

          {/* Pollution Data */}
          {showPollution && filteredData.map((d, i) => (
            <CircleMarker key={`p-${i}`} center={[d.latitude || d.lat, d.longitude || d.lng]} radius={20} pathOptions={{ color: '#FF3B30', fillColor: '#FF3B30', fillOpacity: 0.1, weight: 1, dashArray: '5,5' }}>
              <Popup><div className="p-1"><p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Alerte Pollution</p><p className="text-sm font-black text-slate-800">IQA: {d.pollution_level?.toFixed(0)}</p></div></Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* FLOATING LEGEND - iOS Bottom Card */}
      <div className="absolute bottom-40 left-8 right-8 z-[1000] animate-in slide-in-from-bottom duration-1000">
        <div className="bg-white/80 backdrop-blur-2xl px-6 py-4 rounded-[32px] border border-white/50 shadow-xl flex justify-between items-center no-scrollbar overflow-x-auto">
          {[
            { c: 'bg-emerald-500', l: 'Faible' },
            { c: 'bg-amber-500', l: 'Modéré' },
            { c: 'bg-red-500', l: 'Critique' },
            { c: 'bg-blue-500', l: 'Moi' },
          ].map((itm, i) => (
            <div key={i} className="flex items-center gap-2 flex-shrink-0 mx-2">
              <div className={`w-2.5 h-2.5 rounded-full ${itm.c} shadow-sm`}></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{itm.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* LOADING OVERLAY */}
      {loading && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-[1040] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default Map;
