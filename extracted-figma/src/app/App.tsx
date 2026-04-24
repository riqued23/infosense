import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ColorBlindnessSimulator } from './components/ColorBlindnessSimulator';

function App() {
  return (
    <ColorBlindnessSimulator>
      <RouterProvider router={router} />
    </ColorBlindnessSimulator>
  );
}

export default App;
