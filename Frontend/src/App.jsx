import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Landing from './pages/Landing';
import Login from './pages/LoginSimple';
import Dashboard from './pages/Dashboard';
import Chatbot from './pages/Chatbot';
import WorkoutCam from './pages/WorkoutCam';
import ActivityStats from './pages/ActivityStats';
import History from './pages/History';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

// Global Styles
import './index.css';
import './components/Sections.css';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/workout" element={<WorkoutCam />} />
          <Route path="/stats" element={<ActivityStats />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
