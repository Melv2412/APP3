/**
 * Composant principal App
 * Configure le routing et le layout global
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterType from './pages/RegisterType';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import DashboardDoctor from './pages/DashboardDoctor';
import Predictions from './pages/Predictions';
import Sensors from './pages/Sensors';
import Alerts from './pages/Alerts';
import Map from './pages/Map';
import Profile from './pages/Profile';
import HealthProfile from './pages/HealthProfile';
import PreventionActions from './pages/PreventionActions';
import HealthJournal from './pages/HealthJournal';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Route par défaut : redirige vers login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Routes sans layout (Login, Register) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register/type" element={<RegisterType />} />
          <Route path="/register" element={<Register />} />
          
          {/* Routes avec layout (protégées) */}
          <Route element={<Layout />}>
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/predictions" 
              element={
                <ProtectedRoute>
                  <Predictions />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/dashboard/doctor"
              element={
                <ProtectedRoute requireRole="DOCTOR">
                  <DashboardDoctor />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/sensors" 
              element={
                <ProtectedRoute>
                  <Sensors />
                </ProtectedRoute>
              } 
            />
                     <Route 
                       path="/alerts" 
                       element={
                         <ProtectedRoute>
                           <Alerts />
                         </ProtectedRoute>
                       } 
                     />
                     <Route 
                       path="/map" 
                       element={
                         <ProtectedRoute>
                           <Map />
                         </ProtectedRoute>
                       } 
                     />
                     <Route 
                       path="/profile" 
                       element={
                         <ProtectedRoute>
                           <Profile />
                         </ProtectedRoute>
                       } 
                     />
                     <Route 
                       path="/health-profile" 
                       element={
                         <ProtectedRoute>
                           <HealthProfile />
                         </ProtectedRoute>
                       } 
                     />
                     <Route 
                       path="/actions" 
                       element={
                         <ProtectedRoute>
                           <PreventionActions />
                         </ProtectedRoute>
                       } 
                     />
            <Route 
              path="/journal" 
              element={
                <ProtectedRoute>
                  <HealthJournal />
                </ProtectedRoute>
              } 
            />
                   </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
