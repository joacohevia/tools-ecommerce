import { useState, useEffect, useRef } from 'react';
import { useToast } from '../../context/ToastContext';
import { getCategorias, getMarcas, createProducto, updateProducto, uploadImagen } from '../../http';

let _imgId = 0;
function nextImgId() { return `new-${++_imgId}`; }

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const maxSize = 800;
      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height / width) * maxSize);
          width = maxSize;
        } else {
          width = Math.round((width / height) * maxSize);
          height = maxSize;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Error al comprimir imagen'));
      }, file.type || 'image/jpeg', 0.85);
    };
    img.onerror = () => reject(new Error('Error al cargar imagen'));
    img.src = url;
  });
}

/**
 * Formulario de alta y edicion de productos.
 *
 * Soporta modo creacion (sin prop `producto`) y modo edicion
 * (con prop `producto` que precarga todos los campos).
 *
 * @param {{ producto?: object, onSaved?: function }} props
 * @returns {JSX.Element}
 */
function ProductForm({ producto, onSaved }) {
  const { toast } = useToast();

  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [nombre, setNombre] = useState(producto?.nombre || '');
  const [slug, setSlug] = useState(producto?.slug || '');
  const [descripcion, setDescripcion] = useState(producto?.descripcion || '');
  const [precio, setPrecio] = useState(producto?.precio ? String(producto.precio) : '');
  const [precioOferta, setPrecioOferta] = useState(producto?.precio_oferta ? String(producto.precio_oferta) : '');
  const [stock, setStock] = useState(producto?.stock != null ? String(producto.stock) : '0');
  const [categoriaId, setCategoriaId] = useState(producto?.categoria_id ? String(producto.categoria_id) : '');
  const [marcaId, setMarcaId] = useState(producto?.marca_id ? String(producto.marca_id) : '');
  const [destacado, setDestacado] = useState(Boolean(producto?.destacado));
  const [masVendido, setMasVendido] = useState(Boolean(producto?.mas_vendido));

  const [imagenesItems, setImagenesItems] = useState(() => {
    if (producto?.imagenes?.length) {
      return producto.imagenes.map((url, i) => ({ id: `url-${i}`, type: 'existing', url }));
    }
    return [];
  });
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const fileInputRef = useRef(null);

  const isEdit = Boolean(producto);

  useEffect(() => {
    let cancelled = false;
    const cargar = async () => {
      try {
        const [cats, mars] = await Promise.all([getCategorias(), getMarcas()]);
        if (!cancelled) {
          setCategorias(cats);
          setMarcas(mars);
        }
      } catch {
        if (!cancelled) toast.error('Error al cargar categorias y marcas');
      }
    };
    cargar();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const nuevas = files.map((file) => ({
      id: nextImgId(),
      type: 'file',
      file,
      preview: URL.createObjectURL(file),
    }));
    setImagenesItems((prev) => [...prev, ...nuevas]);
    e.target.value = '';
  };

  const handleRemoveImage = (id) => {
    setImagenesItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.type === 'file' && item.preview) URL.revokeObjectURL(item.preview);
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleDragStart = (e, idx) => {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(idx));
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIdx(idx);
  };

  const handleDragLeave = () => {
    setDragOverIdx(null);
  };

  const handleDrop = (e, dropIdx) => {
    e.preventDefault();
    setDragOverIdx(null);
    if (dragIdx === null || dragIdx === dropIdx) return;
    setImagenesItems((prev) => {
      const items = [...prev];
      const [moved] = items.splice(dragIdx, 1);
      items.splice(dropIdx, 0, moved);
      return items;
    });
    setDragIdx(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre.trim() || !slug.trim() || !precio.trim() || !categoriaId || !marcaId) {
      toast.error('Completa los campos obligatorios: nombre, slug, precio, categoria y marca');
      return;
    }

    if (Number(precio) < 0) {
      toast.error('El precio no puede ser negativo');
      return;
    }

    if (precioOferta.trim() && Number(precioOferta) < 0) {
      toast.error('El precio de oferta no puede ser negativo');
      return;
    }

    setSubmitting(true);

    try {
      const newFiles = imagenesItems.filter((i) => i.type === 'file');
      const existingUrls = imagenesItems.filter((i) => i.type === 'existing').map((i) => i.url);

      let newUrls = [];
      for (const item of newFiles) {
        const compressed = await compressImage(item.file);
        const { url } = await uploadImagen(compressed);
        newUrls.push(url);
      }

      const data = {
        nombre: nombre.trim(),
        slug: slug.trim().toLowerCase(),
        descripcion: descripcion.trim() || null,
        precio: Number(precio),
        precio_oferta: precioOferta.trim() ? Number(precioOferta) : null,
        stock: Number(stock),
        categoria_id: Number(categoriaId),
        marca_id: Number(marcaId),
        destacado,
        mas_vendido: masVendido,
        imagenes: [...existingUrls, ...newUrls],
      };

      if (isEdit) {
        await updateProducto(producto.id, data);
        toast.success('Producto actualizado correctamente');
      } else {
        await createProducto(data);
        toast.success('Producto creado correctamente');
        setNombre(''); setSlug(''); setDescripcion(''); setPrecio('');
        setPrecioOferta(''); setStock('0'); setCategoriaId(''); setMarcaId('');
        setDestacado(false); setMasVendido(false);
        imagenesItems.forEach((i) => {
          if (i.type === 'file' && i.preview) URL.revokeObjectURL(i.preview);
        });
        setImagenesItems([]);
      }

      onSaved?.();
    } catch (err) {
      toast.error(err.message || 'Error al guardar producto');
    } finally {
      setSubmitting(false);
    }
  };

  if (categorias.length === 0 && marcas.length === 0) {
    return <p className="text-dark-muted text-center py-4">Cargando opciones...</p>;
  }

  const selectClasses = [
    'w-full rounded-md px-3 py-2 text-sm cursor-pointer appearance-none',
    'bg-black border border-white/20 text-dark-text',
    'focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none',
    '[&>option]:bg-black [&>option]:text-dark-text',
  ].join(' ');

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <h3 className="text-xl font-semibold text-dark-text mb-4">
        {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-dark-text text-sm mb-1">Nombre *</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-dark-text placeholder-dark-muted text-sm"
            placeholder="Nombre del producto"
          />
        </div>
        <div>
          <label className="block text-dark-text text-sm mb-1">Slug *</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-dark-text placeholder-dark-muted text-sm"
            placeholder="nombre-del-producto"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-dark-text text-sm mb-1">Descripcion</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-dark-text placeholder-dark-muted text-sm"
            placeholder="Descripcion opcional..."
          />
        </div>
        <div>
          <label className="block text-dark-text text-sm mb-1">Precio *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-dark-text placeholder-dark-muted text-sm"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-dark-text text-sm mb-1">Precio Oferta</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={precioOferta}
            onChange={(e) => setPrecioOferta(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-dark-text placeholder-dark-muted text-sm"
            placeholder="Opcional"
          />
        </div>
        <div>
          <label className="block text-dark-text text-sm mb-1">Stock</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-dark-text placeholder-dark-muted text-sm"
          />
        </div>
        <div className="relative">
          <label className="block text-dark-text text-sm mb-1">Categoria *</label>
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            className={selectClasses}
          >
            <option value="">Seleccionar...</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id} className="bg-black text-dark-text">{cat.nombre}</option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-3 bottom-[11px] w-4 h-4 text-dark-muted" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.08 1.04l-4.25 4.66a.75.75 0 01-1.08 0l-4.25-4.66a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="relative">
          <label className="block text-dark-text text-sm mb-1">Marca *</label>
          <select
            value={marcaId}
            onChange={(e) => setMarcaId(e.target.value)}
            className={selectClasses}
          >
            <option value="">Seleccionar...</option>
            {marcas.map((mar) => (
              <option key={mar.id} value={mar.id} className="bg-black text-dark-text">{mar.nombre}</option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-3 bottom-[11px] w-4 h-4 text-dark-muted" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.08 1.04l-4.25 4.66a.75.75 0 01-1.08 0l-4.25-4.66a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <label className="flex items-center gap-2 text-dark-text text-sm">
          <input type="checkbox" checked={destacado} onChange={(e) => setDestacado(e.target.checked)} className="rounded" />
          Destacado
        </label>
        <label className="flex items-center gap-2 text-dark-text text-sm">
          <input type="checkbox" checked={masVendido} onChange={(e) => setMasVendido(e.target.checked)} className="rounded" />
          Mas Vendido
        </label>
      </div>

      <div>
        <label className="block text-dark-text text-sm mb-2">Imagenes</label>

        {imagenesItems.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
            {imagenesItems.map((item, idx) => {
              const src = item.type === 'existing' ? item.url : item.preview;
              const isDragging = dragIdx === idx;
              const isOver = dragOverIdx === idx;
              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, idx)}
                  onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
                  className={`relative group rounded-lg border overflow-hidden bg-white/5 transition-all ${
                    isDragging ? 'opacity-40 scale-95' : ''
                  } ${isOver ? 'border-blue-400 ring-2 ring-blue-400/30' : 'border-white/10'}`}
                >
                  <img
                    src={src}
                    alt={`Imagen ${idx + 1}`}
                    className="w-full aspect-square object-contain p-1"
                    draggable={false}
                  />
                  <div className="absolute top-1 left-1 z-10 flex items-center gap-0.5">
                    <span
                      className="flex items-center justify-center w-5 h-5 rounded bg-black/70 text-dark-muted hover:text-dark-text cursor-grab active:cursor-grabbing text-xs leading-none select-none"
                      title="Arrastrar para reordenar"
                    >
                      ≡
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(item.id)}
                    className="absolute top-1 right-1 z-10 flex items-center justify-center w-5 h-5 rounded-full bg-red-600/80 hover:bg-red-500 text-white text-xs leading-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Eliminar imagen"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-dark-muted text-[10px] text-center py-0.5">
                    {item.type === 'existing' ? 'Actual' : 'Nueva'}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${
            imagenesItems.length === 0
              ? 'border-2 border-dashed border-white/20 text-dark-muted hover:border-blue-400 hover:text-blue-400'
              : 'bg-white/10 border border-white/20 text-dark-text hover:bg-white/20'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {imagenesItems.length === 0 ? 'Agregar imagenes' : 'Agregar mas'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleAddImages}
          className="hidden"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors"
        >
          {submitting ? 'Guardando...' : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={() => onSaved?.()}
          className="bg-white/10 hover:bg-white/20 text-dark-text px-4 py-2 rounded-md text-sm cursor-pointer transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default ProductForm;
