import { useState } from 'react';
//@ts-ignore
import { useAuth } from '../../contexts/authContext/index';
import { db } from '../../firebase/firebase';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const { currentUser, userRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleNavClick = (page: string, event: React.MouseEvent) => {
    event.preventDefault();
    onNavigate(page);
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 
                   bg-black/50 backdrop-blur-xl
                   border-b border-white/5
                   transition-all duration-300 ease-out
                   hover:bg-black/60 hover:border-white/10">
      
      <div className="max-w-6xl lg:max-w-7xl xl:max-w-full mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <a
            className="text-white font-semibold text-sm tracking-tight
                       transition-all duration-300 ease-out
                       hover:text-purple-400 hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]"
            href="#"
            onClick={(e) => handleNavClick('home', e)}
          >
            NeuralForge
          </a>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-400 hover:text-white p-2 -mr-2
                       transition-all duration-300 ease-out
                       hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">

            {currentUser && (
              <a
                className={`px-3 py-1.5 rounded-lg text-sm font-medium
                           transition-all duration-300 ease-out
                           ${currentPage === 'loggeduser' 
                             ? 'text-white bg-white/10 shadow-[0_0_12px_rgba(168,85,247,0.25)]' 
                             : 'text-gray-400 hover:text-white hover:bg-white/5 hover:shadow-[0_0_8px_rgba(255,255,255,0.15)]'}`}
                href="#"
                onClick={(e) => handleNavClick('loggeduser', e)}
              >
                Home
              </a>
            )}

            <a
              className={`px-3 py-1.5 rounded-lg text-sm font-medium
                         transition-all duration-300 ease-out
                         ${currentPage === 'home' 
                           ? 'text-white bg-white/10 shadow-[0_0_12px_rgba(168,85,247,0.25)]' 
                           : 'text-gray-400 hover:text-white hover:bg-white/5 hover:shadow-[0_0_8px_rgba(255,255,255,0.15)]'}`}
              href="#"
              onClick={(e) => handleNavClick('home', e)}
            >
              Landing
            </a>

            <a
              className={`px-3 py-1.5 rounded-lg text-sm font-medium
                         transition-all duration-300 ease-out
                         ${currentPage === 'dashboard' 
                           ? 'text-white bg-white/10 shadow-[0_0_12px_rgba(168,85,247,0.25)]' 
                           : 'text-gray-400 hover:text-white hover:bg-white/5 hover:shadow-[0_0_8px_rgba(255,255,255,0.15)]'}`}
              href="#"
              onClick={(e) => handleNavClick('dashboard', e)}
            >
              Dashboard
            </a>

            {/* AUTH DROPDOWN */}

            <div className="relative">
              <button
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ease-out flex items-center gap-2 ${
                  isDropdownOpen
                    ? 'text-white bg-white/10 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 hover:shadow-[0_0_8px_rgba(255,255,255,0.15)]'
                }`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="flex items-center gap-1.5 max-w-[140px] truncate">
                  <span className="truncate">
                    {currentUser ? currentUser.email.split('@')[0] : 'Auth'}
                  </span>

                  {/* Role badge inside button */}
                  {currentUser && (
                    <div
                      className="px-1.5 py-[1px] rounded-md text-[10px] font-medium text-purple-300 
                                bg-purple-500/10 border border-purple-700/30 
                                shadow-[0_0_4px_rgba(168,85,247,0.25)] 
                                backdrop-blur-sm select-none"
                    >
                      {userRole === 'admin' ? 'Admin' : 'User'}
                    </div>
                  )}
                </div>

                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-300 ease-out ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-lg z-50">
                  <div className="py-2">
                    {currentUser ? (
                      <>
                        <a
                          className="block px-4 py-2 text-sm text-gray-300 transition-all duration-200 ease-out hover:bg-white/10 hover:text-white rounded-lg mx-1"
                          href="#"
                          onClick={(e) => handleNavClick('profile', e)}
                        >
                          My Account
                        </a>
                        <a
                          className="block px-4 py-2 text-sm text-gray-300 transition-all duration-200 ease-out hover:bg-white/10 hover:text-white rounded-lg mx-1"
                          href="#"
                          onClick={(e) => handleNavClick('signout', e)}
                        >
                          Sign out
                        </a>
                      </>
                    ) : (
                      <>
                        <a
                          className="block px-4 py-2 text-sm text-gray-300 transition-all duration-200 ease-out hover:bg-white/10 hover:text-white rounded-lg mx-1"
                          href="#"
                          onClick={(e) => handleNavClick('login', e)}
                        >
                          Login
                        </a>
                        <a
                          className="block px-4 py-2 text-sm text-gray-300 transition-all duration-200 ease-out hover:bg-white/10 hover:text-white rounded-lg mx-1"
                          href="#"
                          onClick={(e) => handleNavClick('register', e)}
                        >
                          Register
                        </a>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>



            <a
              className="px-3 py-1.5 rounded-lg text-sm font-medium
                         text-gray-600 cursor-not-allowed opacity-50"
              href="#"
            >
              Disabled
            </a>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-3 pt-2 space-y-1 border-t border-white/5
                         animate-in fade-in slide-in-from-top-2 duration-200">
            <a
              className={`block px-3 py-2 rounded-lg text-sm font-medium
                         transition-all duration-300 ease-out
                         ${currentPage === 'home' 
                           ? 'text-white bg-white/10 shadow-[0_0_12px_rgba(168,85,247,0.25)]' 
                           : 'text-gray-400 hover:text-white hover:bg-white/5 hover:shadow-[0_0_8px_rgba(255,255,255,0.15)]'}`}
              href="#"
              onClick={(e) => handleNavClick('home', e)}
            >
              Home
            </a>

            <a
              className={`block px-3 py-2 rounded-lg text-sm font-medium
                         transition-all duration-300 ease-out
                         ${currentPage === 'dashboard' 
                           ? 'text-white bg-white/10 shadow-[0_0_12px_rgba(168,85,247,0.25)]' 
                           : 'text-gray-400 hover:text-white hover:bg-white/5 hover:shadow-[0_0_8px_rgba(255,255,255,0.15)]'}`}
              href="#"
              onClick={(e) => handleNavClick('dashboard', e)}
            >
              Dashboard
            </a>

            {currentUser ? (
              <>
                <div className="px-3 py-2 text-xs text-gray-500">
                  {currentUser.email}
                </div>
                <a
                  className="block px-3 py-2 rounded-lg text-sm font-medium
                             text-gray-400 hover:text-white hover:bg-white/5
                             hover:shadow-[0_0_8px_rgba(255,255,255,0.15)]
                             transition-all duration-300 ease-out"
                  href="#"
                  onClick={(e) => handleNavClick('signout', e)}
                >
                  Sign out
                </a>
              </>
            ) : (
              <>
                <a
                  className="block px-3 py-2 rounded-lg text-sm font-medium
                             text-gray-400 hover:text-white hover:bg-white/5
                             hover:shadow-[0_0_8px_rgba(255,255,255,0.15)]
                             transition-all duration-300 ease-out"
                  href="#"
                  onClick={(e) => handleNavClick('login', e)}
                >
                  Login
                </a>
                <a
                  className="block px-3 py-2 rounded-lg text-sm font-medium
                             text-gray-400 hover:text-white hover:bg-white/5
                             hover:shadow-[0_0_8px_rgba(255,255,255,0.15)]
                             transition-all duration-300 ease-out"
                  href="#"
                  onClick={(e) => handleNavClick('register', e)}
                >
                  Register
                </a>
              </>
            )}

            <a
              className="block px-3 py-2 rounded-lg text-sm font-medium
                         text-gray-600 cursor-not-allowed opacity-50"
              href="#"
            >
              Disabled
            </a>
          </div>
        )}
      </div>

      {/* Close dropdown overlay */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </nav>
  );
}

export default Navbar;