const { rangos } = require('./datos.js');
const { existeUsuarioTag, verificarToken, obtenerUsuarioRol } = require('./clashofclansAPI.js');

for (const clave in rangos) {
    const valor = rangos[clave];
    console.log(`Clave: ${clave}, Valor: ${valor}`);
}