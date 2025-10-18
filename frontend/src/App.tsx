
import Navbar from './components/header/Navbar';
import Dashboard from './pages/Dashboard';
import { ModelProvider } from './contexts/ModelContext';

function App() {
  return (
    <>
      <Navbar />
      <br></br> // todo fix this disgusting thing later
      <br></br>
      <br></br>
      <br></br>
      <ModelProvider>
        <Dashboard />
      </ModelProvider>
    </>
  );
}

export default App;
