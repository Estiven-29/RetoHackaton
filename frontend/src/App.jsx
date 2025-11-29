import { RouterProvider } from 'react-router-dom';
import router from './router';
import './styles/index.css';

function App() {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;