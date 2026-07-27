## pasos a seguir:
porque cuando me logueaba no podia ver los productos? Por permisos de supabase

probar todos los enpoint del backend especialmente los de admin
sacar el scrol de atras en los form
poder subir mas de una foto



animacion al agregar al carrito
ojo en password
el relleno de campos debe permanecer blanco al llenar
el registro debe tener mas margen
acomodar rutas del breadcrum
desarrollo mobile
agregar fotos y productos reales /
patron para el bancken  
-Crear un componente para confirmar desiciones
-Crear un componente formularioAlta para dar de alta un producto
-Crear comp para dar de alta una categoria 

-al hacer click en herramientas debe hacer scroll hacia arriba
solucionar errores de consola

vamos a hacer un plan para hacer la vista del admin una vez logueado. Las paginas van a ser la mismas lo unico que va a cambiar es que al ser admin se va a mostrar los permisos que tenga el admin para los productos: Permisos solo para la pagina Home:
-Al cerrar session me debe dirigir automaticamente al home
-Si el admin esta logueado, al hacer hover en las cards debe mostrarse dos iconos, uno de eliminar y otro de editar.
-Si hacemos click en eliminar debe salir un cartel para confirmar la desicion(componente ya escrito )
-Si hacemos click en editar debe salir el mismo formulario de dar de alta un producto pero con los campos completos. Y si se habre de esa manera el boton de guardar debe dirigirse a la API como un PUT que seria un edit

 Estados de UI no contemplados
Estado
Loading (botón disabled + spinner)
Error (credenciales inválidas, email ya existe, etc.)
Email no confirmado (Supabase envía confirmation email por defecto)
Sesión expirada

 El menú de usuario del nav tiene una decisión de diseño sin resolver
Actualmente hay 3 opciones hardcodeadas: "Soy admin" → /login, "Soy cliente" → /login, "Quiero registrarme" → /registro.
Cuando haya sesión, ¿qué mostramos?:
¿Nombre del usuario + "Cerrar sesión"?
¿Rol del usuario?
¿Link a "Mi cuenta" / "Mis pedidos"?
¿El admin ve algo distinto al cliente?

# Feactuers
Feacture: test del proyecto
Objetivo: quiero crear todos los test del sistema tanto del backend como del frontend
1-crear los test necesarios dentro de la carpeta test en la raiz del proyecto. Dentro dividir los test por las distintas carpetas del sistema como por emjemplo compnentes/ backend/...ect
2-crear archivo donde puedar ver los resultados de los test

Feacture: test del proyecto
Objetivo: quiero crear todos los test del sistema tanto del backend como del frontend
1-crear los test necesarios dentro de la carpeta test en la raiz del proyecto. Dentro dividir los test por las distintas carpetas del sistema como por emjemplo compnentes/ backend/...ect
2-crear archivo donde puedar ver los resultados de los test

# comandos test
Comando	      Qué hace
npm test	Vitest en modo watch (frontend + backend en paralelo)
npm run test:run	Corre todos los tests una vez (CI)
npm run test:ui	Abre interfaz visual de Vitest en navegador
npm run test:coverage	Corre tests + genera reporte HTML de cobertura
npm run test:frontend	Solo tests del frontend
npm run test:backend	Solo tests del backend
npm run test:e2e	Corre tests Playwright (requiere app corriendo)