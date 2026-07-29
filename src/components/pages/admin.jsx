import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';
import { getPerfiles, updatePerfilRol, deletePerfil } from '../../http';

/**
 * Vista de administracion de usuarios en /admin.
 * Solo accesible para usuarios con rol 'admin'.
 * Permite listar, buscar, cambiar rol y eliminar usuarios.
 *
 * @returns {JSX.Element}
 */
export default function Admin() {
  const { user, perfil, loading: authLoading } = useAuth();
  const { confirm } = useConfirm();
  const { toast } = useToast();

  const [perfiles, setPerfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    getPerfiles()
      .then(setPerfiles)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-blue">
        <p className="text-dark-muted text-lg">Cargando...</p>
      </div>
    );
  }

  if (!user || perfil?.rol !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  const handleCambiarRol = async (p) => {
    if (p.user_id === user.id) {
      toast.error('No puedes cambiar tu propio rol');
      return;
    }
    const nuevoRol = p.rol === 'admin' ? 'cliente' : 'admin';
    const ok = await confirm({
      title: 'Cambiar rol',
      message: `¿Cambiar rol de ${p.nombre} ${p.apellido} a "${nuevoRol}"?`,
      confirmText: 'Si, cambiar',
      cancelText: 'Cancelar',
    });
    if (!ok) return;
    try {
      await updatePerfilRol(p.id, nuevoRol);
      toast.success(`Rol cambiado a "${nuevoRol}"`);
      setPerfiles((prev) => prev.map((pf) => pf.id === p.id ? { ...pf, rol: nuevoRol } : pf));
    } catch (err) {
      toast.error(err.message || 'Error al cambiar rol');
    }
  };

  const handleEliminar = async (p) => {
    if (p.user_id === user.id) {
      toast.error('No puedes eliminar tu propia cuenta');
      return;
    }
    const ok = await confirm({
      title: 'Eliminar usuario',
      message: `¿Eliminar permanentemente a ${p.nombre} ${p.apellido}?`,
      confirmText: 'Si, eliminar',
      cancelText: 'Cancelar',
    });
    if (!ok) return;
    try {
      await deletePerfil(p.id);
      toast.success(`Usuario eliminado`);
      setPerfiles((prev) => prev.filter((pf) => pf.id !== p.id));
    } catch (err) {
      toast.error(err.message || 'Error al eliminar');
    }
  };

  const buscar = busqueda.toLowerCase();
  const filtrados = busqueda
    ? perfiles.filter((p) =>
        p.nombre?.toLowerCase().includes(buscar) ||
        p.apellido?.toLowerCase().includes(buscar) ||
        (p.dni && p.dni.includes(buscar))
      )
    : perfiles;

  const formatearFecha = (f) => f ? new Date(f).toLocaleDateString('es-AR') : '—';

  return (
    <div className="min-h-screen bg-dark-blue py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-dark-text mb-6">Administracion de Usuarios</h1>

        <div className="mb-4">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, apellido o DNI..."
            className="w-full max-w-md bg-white/10 border border-white/20 rounded-md px-4 py-2 text-dark-text placeholder-dark-muted text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <p className="text-dark-muted text-center py-8">Cargando usuarios...</p>
        ) : error ? (
          <p className="text-red-400 text-center py-8">{error}</p>
        ) : filtrados.length === 0 ? (
          <p className="text-dark-muted text-center py-8">
            {busqueda ? 'No se encontraron usuarios con ese criterio.' : 'No hay usuarios registrados.'}
          </p>
        ) : (
          <div className="overflow-x-auto border border-white/10 rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-dark-muted text-xs uppercase border-b border-white/10">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Apellido</th>
                  <th className="px-4 py-3">DNI</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Registro</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-2 text-dark-text">{p.nombre}</td>
                    <td className="px-4 py-2 text-dark-text">{p.apellido}</td>
                    <td className="px-4 py-2 text-dark-muted">{p.dni || '—'}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${p.rol === 'admin' ? 'bg-blue-600/30 text-blue-300' : 'bg-white/10 text-dark-muted'}`}>
                        {p.rol}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-dark-muted text-xs">{formatearFecha(p.created_at)}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => handleCambiarRol(p)}
                        className="text-dark-muted hover:text-blue-400 px-2 cursor-pointer text-sm"
                        title={p.rol === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                      >
                        {p.rol === 'admin' ? '⬇️' : '⬆️'}
                      </button>
                      <button
                        onClick={() => handleEliminar(p)}
                        className="text-dark-muted hover:text-red-400 px-2 cursor-pointer text-sm"
                        title="Eliminar usuario"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
