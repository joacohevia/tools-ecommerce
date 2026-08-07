import { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { createMarca, updateMarca } from '../../http';

/**
 * Formulario de alta y edicion de marcas.
 *
 * Recibe `marca` opcional para modo edicion.
 * Usa `key` en el padre para forzar remount al cambiar entre modos.
 *
 * @param {{ marca?: object, onSaved?: function }} props
 * @returns {JSX.Element}
 */
function MarcaForm({ marca, onSaved }) {
  const { toast } = useToast();
  const [nombre, setNombre] = useState(marca?.nombre || '');
  const [submitting, setSubmitting] = useState(false);

  const isEdit = Boolean(marca);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    setSubmitting(true);
    try {
      if (isEdit) {
        await updateMarca(marca.id, { nombre: nombre.trim() });
        toast.success('Marca actualizada');
      } else {
        await createMarca({ nombre: nombre.trim() });
        toast.success('Marca creada');
        setNombre('');
      }
      onSaved?.();
    } catch (err) {
      toast.error(err.message || 'Error al guardar marca');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <h3 className="text-headline-md font-headline text-on-surface mb-4">
        {isEdit ? 'Editar Marca' : 'Nueva Marca'}
      </h3>
      <div>
        <label className="block font-label-bold mb-1">Nombre *</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="input"
          placeholder="Nombre de la marca"
        />
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary py-2 text-sm"
        >
          {submitting ? 'Guardando...' : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={() => onSaved?.()}
          className="btn-secondary py-2 text-sm"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default MarcaForm;
