import { createContext, useState, useContext } from "react";

const ImagenContext = createContext();


export function ImageProvider({ children }) {
  const [imagenBlob, setImagenBlob] = useState(null);

  return (
   <ImagenContext.Provider value = {{imagenBlob, setImagenBlob}}>
    {children}
   </ImagenContext.Provider>

  );
}
// eslint-disable-next-line react-refresh/only-export-components
export function useImagenTemporal(){
  return useContext(ImagenContext);
}
