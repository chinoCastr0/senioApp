import { StrictMode } from 'react' //  Para advertencias en desarrollo
import { createRoot } from 'react-dom/client' //  React 18 API moderna
import { BrowserRouter } from 'react-router-dom' //  Para habilitar navegación por rutas
import './index.css' //  Estilos globales (Tailwind)
import App from './App.jsx' //  Componente raíz de tu app
import { registerSW } from 'virtual:pwa-register'
registerSW()
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <App />
    </BrowserRouter>
  </StrictMode>,
)
