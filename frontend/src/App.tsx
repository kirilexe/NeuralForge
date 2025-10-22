import Navbar from './components/header/Navbar';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import LoginPage from './components/auth/login/index';
import RegisterPage from './components/auth/register/index';
import SignOutPage from './components/auth/signout/index';
import { ModelProvider } from './contexts/ModelContext';
import { useState, useEffect } from 'react';
//@ts-ignore
import { AuthProvider } from './contexts/authContext/index';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  // Sync with URL on initial load
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/dashboard') setCurrentPage('dashboard');
    else if (path === '/login') setCurrentPage('login');
    else if (path === '/register') setCurrentPage('register');
    else if (path === '/signout') setCurrentPage('signout');
    else setCurrentPage('home');
  }, []);

  // Update URL when page changes
  const navigate = (page: string) => {
    setCurrentPage(page);
    const path = page === 'home' ? '/' : `/${page}`;
    window.history.pushState(null, '', path);
  };

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'login':
        return <LoginPage />;
      case 'register':
        return <RegisterPage />;
      case 'signout':
        return <SignOutPage setCurrentPage={setCurrentPage} />;
      case 'home':
      default:
        return <Home />;
    }
  };

  return (
    <AuthProvider>
      <ModelProvider>
        <Navbar onNavigate={navigate} currentPage={currentPage} />
        <main style={{ marginTop: '90px' }}> {/* Adjust based on navbar height */}
        {renderPage()}
        </main>
      </ModelProvider>
    </AuthProvider>
  );
}

export default App;