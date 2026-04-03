import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Scenario from './pages/Scenario';
import Controls from './pages/Controls';
import ControlDetail from './pages/ControlDetail';
import Dashboard from './pages/Dashboard';
import Report from './pages/Report';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scenario"
            element={
              <ProtectedRoute>
                <Scenario />
              </ProtectedRoute>
            }
          />
          <Route
            path="/controls"
            element={
              <ProtectedRoute>
                <Controls />
              </ProtectedRoute>
            }
          />
          <Route
            path="/controls/:id"
            element={
              <ProtectedRoute>
                <ControlDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <Report />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;