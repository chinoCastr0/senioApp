import { Routes, Route } from 'react-router-dom'
import Subida from './pages/Subida'
import Edicion from './pages/Edicion'
import Grilla from './pages/Grilla'
import LayoutSelector from './pages/SelectorLayouts'
import GrillaComunicado from './pages/GrillaComunicado'
function App(){
  return (
    <Routes>
      <Route path = "/" element = {<Subida />} />
      <Route path = "/editar" element={<Edicion />} /> 
      <Route path = "/grilla" element={<Grilla />} />
      <Route path = "/layouts" element={<LayoutSelector />} />
      <Route path = "/grilla-comunicado" element={<GrillaComunicado />} />
    </Routes>
  )
}

export default App