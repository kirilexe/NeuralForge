import Navbar from './components/header/Navbar';
import Dashboard from './pages/Dashboard';
//@ts-ignore
import Home from './pages/Home';
import LoginPage from './components/auth/login/index';
import RegisterPage from './components/auth/register/index';
import SignOutPage from './components/auth/signout/index';
import { ModelProvider } from './contexts/ModelContext';
//@ts-ignore
import UserHomePage from './pages/UserHomePage';
import { useState, useEffect } from 'react';
import ProfilePage from './components/auth/profile/index';
//@ts-ignore
import { AuthProvider, useAuth } from './contexts/authContext/index';

// Create a separate component that uses the useAuth hook
function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const { currentUser } = useAuth(); // This is now inside AuthProvider

  // Sync with URL on initial load
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/dashboard') setCurrentPage('dashboard');
    else if (path === '/login') setCurrentPage('login');
    else if (path === '/register') setCurrentPage('register');
    else if (path === '/signout') setCurrentPage('signout');
    else if (path === '/profile') setCurrentPage('profile');
    else if (!currentUser) setCurrentPage('home');
    else setCurrentPage('loggeduser');
  }, [currentUser]); // Add currentUser as dependency

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
      case 'profile':
        return <ProfilePage />;
      case 'loggeduser':
        return <UserHomePage />;
      case 'home':
      default:
        return <Home />;
    }
  };

  return (
    <ModelProvider>
      <Navbar onNavigate={navigate} currentPage={currentPage} />
      <main style={{ marginTop: '30px' }}>
        {renderPage()}
      </main>
    </ModelProvider>
  );
}

// Main App component just provides the context
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;