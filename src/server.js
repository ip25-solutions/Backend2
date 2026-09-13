import aplicacion from './app.js';
import { entorno } from './config/entorno.js';

aplicacion.listen(entorno.puerto, () => {
  console.log(`Servidor activo en el puerto ${entorno.puerto}`);
});
