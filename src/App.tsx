import { AppProvider } from './context/AppContext';
import { AppRoutes } from './routes/AppRoutes';

export function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}

export default App;
