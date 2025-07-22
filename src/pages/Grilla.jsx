import React from 'react';
import { useNavigate } from 'react-router-dom';
import BotonPrimario from '../components/ui/BotonPrimario';
import VistaPreviaImagen from '../components/ui/VistaPreviaImagen';
import useImagenTemporal from '../hooks/useImagenTemporal';
export default function Grilla() {
    const navigate = useNavigate();
    function irASubida() {
        navigate('/');
    }
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-green-400">
            <h1 className="text-2xl font-bold text-center">Grilla de Recursos</h1>
            <p className="text-center mt-4">Aquí se mostrarán los recursos subidos.</p>
            <div className="mt-8">
                <VistaPreviaImagen src={useImagenTemporal().base64} className="max-h-40 mx-auto" />

            <BotonPrimario
                texto="Exportar Grilla"
                onClick={irASubida}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
            />
        </div>
        </div>
    )


}