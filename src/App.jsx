
import { Routes, Route } from 'react-router-dom'
import Subida from './pages/Subida'
import Edicion from './pages/Edicion'
function App(){
  return (
    <Routes>
      <Route path = "/" element = {<Subida />} />
      <Route path = "/editar" element={<Edicion />} /> 
    </Routes>
  )
}

export default App