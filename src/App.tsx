import React from 'react';
import AppInitializer from './components/AppInitializer';
import AppRoutes from './routes';

const App: React.FC = () => (
  <AppInitializer>
    <AppRoutes />
  </AppInitializer>
);

export default App;
