import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { getCurrentEnvironmentData } from '../../services/environment';
import { Link } from 'react-router-dom';

/**
 * MapWidget - Version Premium Clinique
 * Style: Apple Maps / Dashboard Minimaliste
 */
const MapWidget = ({ latitude, longitude, height = 'h-64' }) => {
  const [environmentData, setEnvironmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPosition, setUserPosition] = useState({
    lat: latitude || 5.3600,
    lng: longitude || -4.0083
  });

  // Logique GPS (Fonctionnalité identique, code nettoyé)
  useEffect(() => {
    let watchId = null;
    if (navigator.geolocation && !latitude && !longitude) {
      const onSuccess = (p) => setUserPosition({ lat: p.coords.latitude, lng: p.coords.longitude });
      navigator.geolocation.getCurrentPosition(onSuccess, () => { }, { enableHighAccuracy: true });
      watchId = navigator.geolocation.watchPosition(onSuccess);
    } else if (latitude && longitude) {
      setUserPosition({ lat: latitude, lng: longitude });
    }
    return () => watchId && navigator.geolocation.clearWatch(watchId);
  }, [latitude, longitude]);

  useEffect(() => {
    const fetchEnv = async () => {
      try {
        setLoading(true);
        const data = await getCurrentEnvironmentData(userPosition.lat, userPosition.lng);
        setEnvironmentData(data);
      } finally { setLoading(false); }
    };
    fetchEnv();
  }, [userPosition.lat, userPosition.lng]);

  // SSE Logic
  useEffect(() => {
    const getSSEUrl = () => {
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1') return 'http://127.0.0.1:8000/api/alerts/stream/';
      return 'https://7znhv71w-8000.uks1.devtunnels.ms/api/alerts/stream/';
    };
    const eventSource = new EventSource(getSSEUrl());
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if ((data.type === 'aqi_update' || data.iqa) && data.aqi !== undefined) {
          setEnvironmentData(prev => ({
            ...prev,
            pollution_level: data.aqi,
            pollution_level_text: data.aqi >= 100 ? 'Risque' : (data.aqi > 50 ? 'Modéré' : 'Sain')
          }));
        }
      } catch (e) { console.error('SSE Error', e); }
    };
    return () => eventSource.close();
  }, []);

  const isHealthy = !(environmentData?.pollution_level > 100); // Updated threshold to 100 as per summary
  const status = isHealthy ? 'Sain' : 'Risque';

  return (
    <div className="group relative w-full overflow-hidden rounded-[28px] bg-white border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-slate-200/50">

      {/* 1. CONTAINER DE LA CARTE */}
      <div className={`${height} relative overflow-hidden transition-transform duration-700 group-hover:scale-[1.02]`} style={{ isolation: 'isolate' }}>
        <MapContainer
          center={[userPosition.lat, userPosition.lng]}
          zoom={14}
          style={{ height: '100%', width: '100%', filter: 'contrast(1.1) brightness(1.05)' }}
          scrollWheelZoom={false}
          zoomControl={false}
        >
          {/* Style de carte plus doux (via filtre CSS) */}
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

          {/* Halo d'environnement (Pulse si risque) */}
          <CircleMarker
            center={[userPosition.lat, userPosition.lng]}
            radius={25}
            pathOptions={{
              color: 'transparent',
              fillColor: isHealthy ? '#10b981' : '#ef4444',
              fillOpacity: 0.15,
            }}
          />

          {/* Point central style "iOS Location" */}
          <CircleMarker
            center={[userPosition.lat, userPosition.lng]}
            radius={8}
            pathOptions={{
              color: '#ffffff',
              fillColor: '#007aff',
              fillOpacity: 1,
              weight: 3
            }}
          >
            <Popup className="apple-popup">
              <div className="p-1 font-sans">
                <p className="font-bold text-slate-900">{status}</p>
                <p className="text-[10px] text-slate-400">Position actuelle</p>
              </div>
            </Popup>
          </CircleMarker>
        </MapContainer>

        {/* 2. OVERLAY FLOTTANT (Style iOS Control Center) */}
        <div className="absolute top-4 left-4 right-4 z-[400] flex justify-between items-start pointer-events-none">
          <div className="pointer-events-auto bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-white/40">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Qualité de l'air</p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${isHealthy ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className="text-[15px] font-bold text-slate-900 leading-none">
                {environmentData?.pollution_level_text || 'Analyse...'}
              </span>
            </div>
          </div>

          <Link
            to="/map"
            className="pointer-events-auto bg-slate-900/10 backdrop-blur-md hover:bg-slate-900/20 p-2.5 rounded-2xl transition-all"
          >
            <svg className="w-5 h-5 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </Link>
        </div>

        {/* 3. LÉGENDE DISCRÈTE EN BAS DE CARTE */}
        <div className="absolute bottom-4 left-4 z-[400] flex gap-2">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold shadow-sm border border-white text-slate-600">
            {userPosition.lat.toFixed(3)}°N, {userPosition.lng.toFixed(3)}°E
          </span>
        </div>
      </div>

      {/* 4. FOOTER D'ACTION (Style "Card Footer") */}
      <div className="px-6 py-4 flex items-center justify-between bg-slate-50/50">
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            Zone Saine
          </div>
          <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
            <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            Zone Risque
          </div>
        </div>
        <Link
          to="/map"
          className="text-[13px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1"
        >
          Détails
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default MapWidget;