import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import clientesReducer from '../features/clientes/clientesSlice';
import vehiculosReducer from '../features/vehiculos/vehiculosSlice';
import serviciosReducer from '../features/servicios/serviciosSlice';
import ordenesReducer from '../features/ordenes/ordenesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    clientes: clientesReducer,
    vehiculos: vehiculosReducer,
    servicios: serviciosReducer,
    ordenes: ordenesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
