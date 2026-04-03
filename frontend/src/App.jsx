import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginChoice from './pages/auth/LoginChoice';
import CompanyRegistration from './pages/company/CompanyRegistration';
import CompanyDashboard from './pages/company/CompanyDashboard';
import AuditorLogin from './pages/auditor/AuditorLogin';
import CompanySelector from './pages/auditor/CompanySelector';
import Home from './pages/Home';
import Scenario from './pages/Scenario';
import Controls from './pages/Controls';
import ControlDetail from './pages/ControlDetail';
import Dashboard from './pages/Dashboard';
import Report from './pages/Report';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginChoice />} />
        <Route path="/company/register" element={<CompanyRegistration />} />
        <Route path="/company/dashboard" element={<CompanyDashboard />} />
        <Route path="/auditor/login" element={<AuditorLogin />} />
        <Route path="/auditor/companies" element={<CompanySelector />} />
        <Route path="/home" element={<Home />} />
        <Route path="/scenario" element={<Scenario />} />
        <Route path="/controls" element={<Controls />} />
        <Route path="/controls/:id" element={<ControlDetail />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/report" element={<Report />} />
      </Routes>
    </Router>
  );
}

export default App;