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
// import Dashboard from './pages/Dashboard';

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
            {/* Les routes protégées iront ici */}
            {/* <Route path="/dashboard" element={<Dashboard />} /> */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
