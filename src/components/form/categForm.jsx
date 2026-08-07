import { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { createCategoria, updateCategoria } from '../../http';

/**
 * Formulario de alta y edicion de categorias.
 *
 * Recibe `categoria` opcional para modo edicion.
 * Usa `key` en el padre para forzar remount al cambiar entre modos.
 *
 * @param {{ categoria?: object, onSaved?: function }} props
 * @returns {JSX.Element}
 */
function CategForm({ categoria, onSaved }) {
  const { toast } = useToast();
  const [nombre, setNombre] = useState(categoria?.nombre || '');
  const [slug, setSlug] = useState(categoria?.slug || '');
  const [submitting, setSubmitting] = useState(false);

  const isEdit = Boolean(categoria);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || !slug.trim()) {
      toast.error('Nombre y slug son obligatorios');
      return;
    }
    setSubmitting(true);
    try {
      if (isEdit) {
        await updateCategoria(categoria.id, { nombre: nombre.trim(), slug: slug.trim().toLowerCase() });
        toast.success('Categoria actualizada');
      } else {
        await createCategoria({ nombre: nombre.trim(), slug: slug.trim().toLowerCase() });
        toast.success('Categoria creada');
        setNombre(''); setSlug('');
      }
      onSaved?.();
    } catch (err) {
      toast.error(err.message || 'Error al guardar categoria');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <h3 className="text-headline-md font-headline text-on-surface mb-4">
        {isEdit ? 'Editar Categoria' : 'Nueva Categoria'}
      </h3>
      <div>
        <label className="block font-label-bold mb-1">Nombre *</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="input"
          placeholder="Nombre de la categoria"
        />
      </div>
      <div>
        <label className="block font-label-bold mb-1">Slug *</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="input"
          placeholder="nombre-de-categoria"
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

export default CategForm;
