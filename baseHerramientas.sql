-- ============================================================
-- Esquema Herramientas Tandil (Supabase)
-- Ejecutar en el SQL Editor de Supabase en este orden:
--   1. categorias  2. marcas  3. productos
-- Luego configurar Storage desde el dashboard.
-- ============================================================

-- 1. CATEGORIAS
create table categorias (
  id bigserial primary key,
  nombre text not null unique,
  slug text not null unique,
  created_at timestamptz default now()
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

-- 2. MARCAS
create table marcas (
  id bigserial primary key,
  nombre text not null unique,
  created_at timestamptz default now()
);

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

-- 3. PRODUCTOS
create table productos (
  id bigserial primary key,
  nombre text not null,
  descripcion text,
  slug text not null unique,
  precio numeric(10,2) not null,
  precio_oferta numeric(10,2),
  stock integer default 0,
  categoria_id bigint not null references categorias(id),
  marca_id bigint not null references marcas(id),
  destacado boolean default false,
  mas_vendido boolean default false,
  imagenes text[] default '{}'::text[],
  created_at timestamptz default now()
);
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
