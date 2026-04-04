import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginChoice from './pages/auth/LoginChoice';
import CompanyRegistration from './pages/company/CompanyRegistration';
import CompanyDashboard from './pages/company/CompanyDashboard';
import AuditorLogin from './pages/auditor/AuditorLogin';
import Home from './pages/Home';
import Controls from './pages/Controls';
import ControlDetail from './pages/ControlDetail';
import Dashboard from './pages/Dashboard';
import Report from './pages/Report';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginChoice />} />
          <Route path="/company/register" element={<CompanyRegistration />} />
          <Route path="/company/dashboard" element={<CompanyDashboard />} />
          <Route path="/auditor/login" element={<AuditorLogin />} />
          <Route path="/auditor/companies" element={<Navigate to="/home" replace />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/controls"
            element={
              <ProtectedRoute allowedRoles={["auditor"]}>
                <Controls />
              </ProtectedRoute>
            }
          />
          <Route
            path="/controls/:id"
            element={
              <ProtectedRoute allowedRoles={["auditor"]}>
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
