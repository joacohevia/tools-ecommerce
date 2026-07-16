import { useEffect, useState } from "react";
import { getProductos } from "../../http";

const SeccionNov = () => {
  const [novedades, setNovedades] = useState([]);

  useEffect(() => {
    getProductos().then((data) => setNovedades(data.slice(0, 6))).catch(console.error);
  }, []);

  if (!novedades.length) return null;

  return (
    <section className="my-8">
      <h2 className="text-2xl font-semibold mb-6 text-center">Novedades</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {novedades.map((nov) => (
          <div key={nov.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition">
            <img
              src={nov.imagenes?.[0] || "https://via.placeholder.com/300x200"}
              alt={nov.nombre}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-800">{nov.nombre}</h3>
              <p className="text-sm text-gray-600 mt-2">{nov.descripcion}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SeccionNov;
