import { RouterProvider } from 'react-router-dom';
import { DatasetProvider } from './context/DatasetContext';  // ← NUEVO
import router from './router';
import './styles/index.css';

function App() {
  return (
    <DatasetProvider>  {/* ← NUEVO */}
      <div className="App">
        <RouterProvider router={router} />
      </div>
    </DatasetProvider>
  );
}

export default App;
