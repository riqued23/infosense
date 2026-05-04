import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ColorBlindnessSimulator } from './components/ColorBlindnessSimulator';
import { TranslationProvider } from './translation/TranslationContext';

function App() {
  return (
    <TranslationProvider>
      <ColorBlindnessSimulator>
        <RouterProvider router={router} />
      </ColorBlindnessSimulator>
    </TranslationProvider>
  );
}

export default App;
