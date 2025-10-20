import './Navbar.css'

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const handleNavClick = (page: string, event: React.MouseEvent) => {
    event.preventDefault();
    onNavigate(page);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <a 
        className="navbar-brand" 
        href="#"
        onClick={(e) => handleNavClick('home', e)}
      >
        NeuralForge
      </a>

      <button
        className="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarSupportedContent">
        <ul className="navbar-nav mr-auto">
          <li className={`nav-item ${currentPage === 'home' ? 'active' : ''}`}>
            <a 
              className="nav-link" 
              href="#"
              onClick={(e) => handleNavClick('home', e)}
            >
              Home {currentPage === 'home' && <span className="sr-only">(current)</span>}
            </a>
          </li>

          <li className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}>
            <a 
              className="nav-link" 
              href="#"
              onClick={(e) => handleNavClick('dashboard', e)}
            >
              Dashboard
            </a>
          </li>

          <li className="nav-item dropdown">
            <a
              className="nav-link dropdown-toggle"
              href="#"
              id="navbarDropdown"
              role="button"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              Auth
            </a>
            <div className="dropdown-menu" aria-labelledby="navbarDropdown">
              <a 
                className="dropdown-item" 
                href="#"
                onClick={(e) => handleNavClick('login', e)}
              >
                Login
              </a>
              <a 
                className="dropdown-item" 
                href="#"
                onClick={(e) => handleNavClick('register', e)}
              >
                Register
              </a>
              <div className="dropdown-divider"></div>
              <a className="dropdown-item" href="#">Something else here</a>
            </div>
          </li>

          <li className="nav-item">
            <a className="nav-link disabled" href="#">Disabled</a>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;