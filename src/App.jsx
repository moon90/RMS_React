import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import MainLayout from './layouts/MainLayout';
import UserAdd from './pages/UserAdd';
import UserList from './pages/UserList';

function App() {

  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('accessToken'));

    useEffect(() => {
    const checkAuth = () => {
      setLoggedIn(!!localStorage.getItem('accessToken'));
    };
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  return (

    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage onLogin={() => setLoggedIn(true)} />} />
      <Route
        path="/dashboard"
        element={loggedIn ? (
          <MainLayout>
            <Dashboard />
          </MainLayout>
        ) : (
          <Navigate to="/login" />
        )}
      />
      <Route path="/users/add" element={loggedIn ? (
          <MainLayout>
            <UserAdd />
          </MainLayout>
        ) : (
          <Navigate to="/login" />
        )} />
      <Route path="/users/list" element={loggedIn ? (
          <MainLayout>
            <UserList />
          </MainLayout>
        ) : (
          <Navigate to="/login" />
        )} />
    </Routes>
  );
}

export default App;
