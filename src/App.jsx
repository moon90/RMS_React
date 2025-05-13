import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import MainLayout from './layouts/MainLayout';

const isLoggedIn = () => !!localStorage.getItem('accessToken');

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={isLoggedIn() ? (
          <MainLayout>
            <Dashboard />
          </MainLayout>
        ) : (
          <Navigate to="/login" />
        )}
      />
    </Routes>
  );
}

export default App;
