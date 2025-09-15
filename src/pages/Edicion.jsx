import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import BotonPrimario from "../components/ui/BotonPrimario";
import BotonVolver from "../components/ui/BotonVolver";
import useImagenTemporal from "../hooks/useImagenTemporal";
import { aplicarFiltroCanvas } from "../hooks/aplicarFiltroCanvas";

// Filtros
const FILTROS = [
  { id: "ninguno", label: "Original" },
  { id: "grises", label: "Escala de grises" },
  { id: "blancoNegro", label: "Blanco y negro" },
];

// CSS de preview (no hornea, solo visual)
const claseFiltroPreview = (id) => {
  switch (id) {
    case "grises":
      return "filter grayscale";
    case "blancoNegro":
      return "filter grayscale contrast-200";
    default:
      return "";
  }
};

export default function Edicion() {
  const navigate = useNavigate();
  const location = useLocation();

  // Hook con compat y flag de carga lista
  const {
    originalBase64,
    base64: legacyBase64,
    setOriginalBase64Once,
    ready,
  } = useImagenTemporal();

  // Fallback si venís directo de LayoutSelector pasando la imagen
  const base64FromState = location.state?.base64Tmp || null;
  const layoutSeleccionado = location.state?.layoutSeleccionado || null;

  // Fuente final de imagen (hook > legacy > state)
  const imgBase64 = originalBase64 || legacyBase64 || base64FromState;

  // Si vino por state y aún no está persistida como original, persistimos ahora
  useEffect(() => {
    if (!originalBase64 && base64FromState && typeof setOriginalBase64Once === "function") {
      setOriginalBase64Once(base64FromState);
    }
  }, [originalBase64, base64FromState, setOriginalBase64Once]);

  // Solo redirige a /subida cuando el hook ya está listo y no hay imagen por ningún lado
  useEffect(() => {
    if (ready && !imgBase64) {
      navigate("/subida", { replace: true });
    }
  }, [ready, imgBase64, navigate]);

  const [filtro, setFiltro] = useState("ninguno");
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  const clasePreview = useMemo(() => claseFiltroPreview(filtro), [filtro]);

  const handleConfirmar = async () => {
    if (!imgBase64) return;
    setProcesando(true);
    setError("");

    try {
      // Hornea solo al confirmar (no destructivo)
      const base64Procesada =
        filtro === "ninguno" ? imgBase64 : await aplicarFiltroCanvas(imgBase64, filtro);

      // Enviamos a Grilla por state. NO escribimos en storage.
      navigate("/grilla", {
        state: { base64Procesada, layoutSeleccionado, filtroAplicado: filtro },
      });
    } catch (e) {
      console.error(e);
      setError("Ocurrió un error al aplicar el filtro. Probá de nuevo.");
    } finally {
      setProcesando(false);
    }
  };

  if (!ready || !imgBase64) {
    return (
      <main className="min-h-screen bg-emerald-900 text-white p-4">
        <p className="text-center opacity-80 mt-10">Cargando imagen…</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-900 text-white p-4 pb-24">
      <BotonVolver />
      <header className="flex align-middle justify-center items-center mb-3">
        
        <h1 className="flex text-lg font-semibold">Edición rápida</h1>
        <div className="" />
      </header>

      {/* Preview */}
      <div className="mb-4 max-w-md mx-auto">
        <div className="rounded-2xl border border-emerald-700 p-2 bg-emerald-800/30">
          <div className="w-full max-h-[420px] overflow-hidden rounded-xl bg-emerald-900">
            <img
              src={imgBase64}
              alt="Preview"
              className={`w-full h-full object-contain ${clasePreview}`}
              draggable={false}
            />
          </div>
          <p className="text-xs text-emerald-200 mt-2">
            
          </p>
        </div>
      </div>

      {/* Filtros */}
      <section className="mb-4 max-w-md mx-auto">
        <h2 className="text-sm font-medium mb-2">Filtro</h2>
        <div className="grid grid-cols-2 gap-2">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`px-3 py-2 rounded-xl text-sm border ${
                filtro === f.id
                  ? "bg-white text-emerald-900 border-white"
                  : "bg-emerald-800 border-emerald-700 text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {error && (
        <div className="mb-3 text-red-300 text-sm bg-red-900/30 px-3 py-2 rounded-xl max-w-md mx-auto">
          {error}
        </div>
      )}

      {/* CTA fijo abajo con tu botón primario */}
      <div className="fixed left-0 right-0 bottom-0 p-4 bg-emerald-950/90 backdrop-blur">
        <div className="max-w-md mx-auto">
          <BotonPrimario
            className="w-full h-12 text-base"
            onClick={handleConfirmar}
            texto={procesando ? "Aplicando filtro..." : "Ir a la grilla"}
            disabled={!imgBase64 || procesando}
          />
          <p className="text-[11px] text-emerald-200 mt-2 text-center">
          
          </p>
        </div>
      </div>
    </div>
  );
}
