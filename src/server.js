import aplicacion from './app.js';
import { conectarBaseDatos } from './config/conexionBaseDatos.js';
import { entorno } from './config/entorno.js';

const iniciarServidor = async () => {
  try {
    await conectarBaseDatos();
    aplicacion.listen(entorno.puerto, () => {
      console.log(`Servidor activo en el puerto ${entorno.puerto}`);
    });
  } catch (error) {
    console.error(`No se pudo iniciar el servidor: ${error.message}`);
    process.exit(1);
  }
};

iniciarServidor();
