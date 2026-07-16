Generame un reporte en formato JSON de todos los productos que tiene la Base de datos

1. Obtene la lista de productos de GET http://localhost:3000/api/productos
3. Combinalo en un solo JSON con este formato:
```json
{
  "generado": "2024-01-01",
  "total_de_herramientas": 3,
  "productos": [
    {
      "nombre": "user1",
      "descripcion": "Este producto es bueno",
      "precio": "10000",
    }
  ]
}
```
4. Escribi el resultado en un archivo llamado reporte-usuarios.json