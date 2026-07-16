import { useEffect, useState } from "react";
import { getCategorias } from "../../http";

const SeccionHerramientas = () => {
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    getCategorias().then(setCategorias).catch(console.error);
  }, []);

  if (!categorias.length) return null;

  return (
    <div className="my-8 p-6 bg-white shadow-md rounded-lg max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold text-center mb-6">Herramientas</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {categorias.map((cat) => (
          <div
            key={cat.id}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:shadow-lg hover:bg-gray-50 transition cursor-pointer"
          >
            <span className="text-2xl font-bold text-gray-700 mb-2">{cat.nombre}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeccionHerramientas;
