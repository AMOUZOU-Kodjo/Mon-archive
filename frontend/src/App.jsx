import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Accueil from './pages/Accueil';
import About from './pages/About';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Photos from './pages/Photos';
import PhotoDetail from './pages/PhotoDetail';
import Videos from './pages/Videos';
import VideoDetail from './pages/VideoDetail';
import Audios from './pages/Audios';
import AudioDetail from './pages/AudioDetail';
import Documents from './pages/Documents';
import DocumentDetail from './pages/DocumentDetail';

export default function App() {
  return (
    <Routes>
      {/* Pages publiques */}
      <Route path="/" element={<Accueil />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Layout><Login /></Layout>} />
      <Route path="/photos" element={<Layout><Photos /></Layout>} />
      <Route path="/photos/:id" element={<Layout><PhotoDetail /></Layout>} />
      <Route path="/videos" element={<Layout><Videos /></Layout>} />
      <Route path="/videos/:id" element={<Layout><VideoDetail /></Layout>} />
      <Route path="/audios" element={<Layout><Audios /></Layout>} />
      <Route path="/audios/:id" element={<Layout><AudioDetail /></Layout>} />
      <Route path="/documents" element={<Layout><Documents /></Layout>} />
      <Route path="/documents/:id" element={<Layout><DocumentDetail /></Layout>} />

      {/* Admin protege (Dashboard) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/:section"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
