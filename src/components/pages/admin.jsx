import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';
import { deletePerfil, getPerfiles, updatePerfilRol } from '../../http';

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
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <p className="text-on-surface-variant text-lg">Cargando...</p>
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
    <div className="min-h-screen bg-surface py-22 px-margin-mobile md:px-margin-desktop">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-headline text-headline-lg text-on-surface mb-6">Administracion de Usuarios</h1>

        <div className="mb-4">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, apellido o DNI..."
            className="input max-w-md"
          />
        </div>

        {loading ? (
          <p className="text-on-surface-variant text-center py-8">Cargando usuarios...</p>
        ) : error ? (
          <p className="text-error text-center py-8">{error}</p>
        ) : filtrados.length === 0 ? (
          <p className="text-on-surface-variant text-center py-8">
            {busqueda ? 'No se encontraron usuarios con ese criterio.' : 'No hay usuarios registrados.'}
          </p>
        ) : (
          <div className="table-admin">
            <table className="w-full text-sm text-left">
              <thead>
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
                  <tr key={p.id}>
                    <td className="px-4 py-2 text-on-surface">{p.nombre}</td>
                    <td className="px-4 py-2 text-on-surface">{p.apellido}</td>
                    <td className="px-4 py-2 text-on-surface-variant">{p.dni || '—'}</td>
                    <td className="px-4 py-2">
                      <span className={p.rol === 'admin' ? 'badge-rol-admin' : 'badge-rol-cliente'}>
                        {p.rol}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-on-surface-variant text-xs">{formatearFecha(p.created_at)}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => handleCambiarRol(p)}
                        className="text-on-surface-variant hover:text-primary px-2 cursor-pointer text-sm"
                        title={p.rol === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                      >
                        {p.rol === 'admin' ? '⬇️' : '⬆️'}
                      </button>
                      <button
                        onClick={() => handleEliminar(p)}
                        className="text-on-surface-variant hover:text-error px-2 cursor-pointer text-sm"
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
