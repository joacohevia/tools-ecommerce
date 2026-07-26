-- ============================================================
-- Esquema Herramientas Tandil (Supabase)
-- Ejecutar en el SQL Editor de Supabase en este orden:
--   1. categorias  2. marcas  3. productos
-- Luego configurar Storage desde el dashboard.
-- ============================================================

CREATE TABLE public.categorias (
  id bigint NOT NULL DEFAULT nextval('categorias_id_seq'::regclass),
  nombre text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categorias_pkey PRIMARY KEY (id)
);
CREATE TABLE public.marcas (
  id bigint NOT NULL DEFAULT nextval('marcas_id_seq'::regclass),
  nombre text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT marcas_pkey PRIMARY KEY (id)
);
CREATE TABLE public.productos (
  id bigint NOT NULL DEFAULT nextval('productos_id_seq'::regclass),
  nombre text NOT NULL,
  descripcion text,
  slug text NOT NULL UNIQUE,
  precio numeric NOT NULL,
  precio_oferta numeric,
  stock integer DEFAULT 0,
  categoria_id bigint NOT NULL,
  marca_id bigint NOT NULL,
  destacado boolean DEFAULT false,
  mas_vendido boolean DEFAULT false,
  imagenes ARRAY DEFAULT '{}'::text[],
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT productos_pkey PRIMARY KEY (id),
  CONSTRAINT productos_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias(id),
  CONSTRAINT productos_marca_id_fkey FOREIGN KEY (marca_id) REFERENCES public.marcas(id)
);
CREATE TABLE public.perfiles (
  id bigint NOT NULL DEFAULT nextval('perfiles_id_seq'::regclass),
  user_id uuid NOT NULL,
  nombre text NOT NULL,
  apellido text NOT NULL,
  dni text,
  rol text NOT NULL DEFAULT 'cliente'::text CHECK (rol = ANY (ARRAY['admin'::text, 'cliente'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT perfiles_pkey PRIMARY KEY (id),
  CONSTRAINT perfiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.pedidos (
  id bigint NOT NULL DEFAULT nextval('pedidos_id_seq'::regclass),
  perfil_id bigint NOT NULL,
  estado text NOT NULL DEFAULT 'pendiente'::text CHECK (estado = ANY (ARRAY['pendiente'::text, 'confirmado'::text, 'enviado'::text, 'entregado'::text, 'cancelado'::text])),
  total numeric NOT NULL DEFAULT 0,
  nota text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT pedidos_pkey PRIMARY KEY (id),
  CONSTRAINT pedidos_perfil_id_fkey FOREIGN KEY (perfil_id) REFERENCES public.perfiles(id)
);
CREATE TABLE public.pedido_items (
  id bigint NOT NULL DEFAULT nextval('pedido_items_id_seq'::regclass),
  pedido_id bigint NOT NULL,
  producto_id bigint NOT NULL,
  cantidad integer NOT NULL CHECK (cantidad > 0),
  precio_unitario numeric NOT NULL,
  subtotal numeric DEFAULT ((cantidad)::numeric * precio_unitario),
  CONSTRAINT pedido_items_pkey PRIMARY KEY (id),
  CONSTRAINT pedido_items_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedidos(id),
  CONSTRAINT pedido_items_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id)
);

insert into categorias (nombre, slug) values
  ('Taladros', 'taladros'),
  ('Cortadoras', 'cortadoras'),
  ('Amoladoras', 'amoladoras'),
  ('Martillos', 'martillos'),
  ('Soldadoras', 'soldadoras'),
  ('Hidrolavadoras', 'hidrolavadoras'),
  ('Sierras', 'sierras'),
  ('Lijadoras', 'lijadoras'),
  ('Compresores', 'compresores'),
  ('Generadores', 'generadores'),
  ('Otras Herramientas', 'otras-herramientas');



insert into marcas (nombre) values
  ('Bosch'),
  ('Makita'),
  ('DeWalt'),
  ('Black & Decker'),
  ('Stanley'),
  ('Einhell'),
  ('Skil'),
  ('Gamma'),
  ('Lusqtoff'),
  ('Dowen'),
  ('Otra Marca');


-- ============================================================
-- Nota: Las imágenes se suben a Supabase Storage, no a la DB.
-- Crear el bucket "productos" desde el dashboard:
--   Storage > New bucket > nombre: productos > público: sí
-- Políticas RLS sugeridas para el bucket "productos":
--   - SELECT: permitir a todos (bucket público)
--   - INSERT: permitir a authenticated (o a todos para MVP)
-- El endpoint POST /api/upload del backend maneja la subida.
/*
El slug es un identificador URL-friendly que se usa para tener rutas limpias 
y humanas en vez de IDs numéricos.
Ejemplo con slug:
/categoria/taladros          ← se lee solo
/producto/taladro-bosch-220v ← se lee solo
Sin slug (solo ID):
/categoria/5                  ← no dice nada

*/
-- ============================================================
-- 10 productos de prueba para Herramientas Tandil
-- Ejecutar en el SQL Editor de Supabase

INSERT INTO productos (nombre, descripcion, slug, precio, precio_oferta, stock, categoria_id, marca_id, destacado, mas_vendido) VALUES
('Taladro Percutor Bosch 850W', 'Taladro percutor de 850W con mandril de 13mm, ideal para concreto y metal.', 'taladro-percutor-bosch-850w', 125000.00, 98000.00, 15, 1, 1, true, true),
('Cortadora de Disco Makita 2000W', 'Cortadora de disco de 7 pulgadas, potencia 2000W, incluye protector.', 'cortadora-disco-makita-2000w', 185000.00, 159000.00, 8, 2, 2, true, false),
('Amoladora Angular DeWalt 4½"', 'Amoladora angular de 4½ pulgadas, 820W, empuñadura lateral ajustable.', 'amoladora-angular-dewalt-45', 89000.00, NULL, 20, 3, 3, false, true),
('Martillo Combinado Einhell 1500W', 'Martillo combinado con función de rotopercutor, incluye set de brocas.', 'martillo-combinado-einhell-1500w', 112000.00, 95000.00, 12, 4, 6, true, true),
('Soldadora Inverter Lusqtoff 200A', 'Soldadora inverter portátil 200A, con porta electrodo y pinza de masa.', 'soldadora-inverter-lusqtoff-200a', 145000.00, NULL, 6, 5, 9, false, false),
('Hidrolavadora Black & Decker 1800W', 'Hidrolavadora eléctrica 1800W, presión máxima 130 bar, incluye accesorios.', 'hidrolavadora-black-decker-1800w', 178000.00, 149000.00, 10, 6, 4, true, false),
('Sierra Circular Skil 1400W', 'Sierra circular de 7¼ pulgadas, profundidad de corte 65mm, láser guía.', 'sierra-circular-skil-1400w', 98000.00, 82000.00, 14, 7, 7, false, true),
('Lijadora Orbital Bosch 300W', 'Lijadora orbital 300W, velocidad variable, base de 125mm, recolección de polvo.', 'lijadora-orbital-bosch-300w', 72000.00, NULL, 18, 8, 1, false, false),
('Compresor Dowen 50L 2HP', 'Compresor de aire 50 litros, 2HP, max 8 bares, con ruedas para traslado.', 'compresor-dowen-50l-2hp', 220000.00, 195000.00, 5, 9, 10, false, true),
('Generador Gamma 3000W Nafta', 'Generador eléctrico naftero 3000W, arranque manual, 4 tomas 220V.', 'generador-gamma-3000w-nafta', 350000.00, NULL, 3, 10, 8, true, true);



