import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import { GlobalStyle } from './styles/GlobalStyle';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Clientes from './pages/Clientes';
import Vehiculos from './pages/Vehiculos';
import Servicios from './pages/Servicios';
import Ordenes from './pages/Ordenes';
import Reportes from './pages/Reportes';
import PrivateRoute from './components/common/PrivateRoute';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="vehiculos" element={<Vehiculos />} />
          <Route path="servicios" element={<Servicios />} />
          <Route path="ordenes" element={<Ordenes />} />
          <Route path="reportes" element={<Reportes />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;
