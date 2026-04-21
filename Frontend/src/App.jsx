import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/LoginSimple';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Chatbot from './pages/Chatbot';
import EmotionDetection from './pages/EmotionDetection';
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
      <Routes>
        {/* Public Routes - No Navbar */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Routes - With Navbar */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Navbar />
              <main className="main-content">
                <Dashboard />
              </main>
              <Footer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chatbot"
          element={
            <ProtectedRoute>
              <Navbar />
              <main className="main-content">
                <Chatbot />
              </main>
              <Footer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/emotions"
          element={
            <ProtectedRoute>
              <Navbar />
              <main className="main-content">
                <EmotionDetection />
              </main>
              <Footer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workout"
          element={
            <ProtectedRoute>
              <Navbar />
              <main className="main-content">
                <WorkoutCam />
              </main>
              <Footer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stats"
          element={
            <ProtectedRoute>
              <Navbar />
              <main className="main-content">
                <ActivityStats />
              </main>
              <Footer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <Navbar />
              <main className="main-content">
                <History />
              </main>
              <Footer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Navbar />
              <main className="main-content">
                <Profile />
              </main>
              <Footer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Navbar />
              <main className="main-content">
                <Settings />
              </main>
              <Footer />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
