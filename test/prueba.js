const clashofclansAPI = require('../src/clashofclansAPI.js');
const comandosDB = require('../src/comandosDB.js');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("./mybotdata.sqlite");


const tag = '#CLGJ02V9';
let solicitudDB, respuestaDB;

async function a() {
    try {	// obtengo los datos de los usuarios del clan
        usuariosAPI = await clashofclansAPI.obtenerUsuariosClan();
        if (usuariosAPI.length <= 30) usuariosAPI = usuariosAPI.map(usuario => clashofclansAPI.obtenerUsuario(usuario.tag));
        else {
            let primeros30usuarios = usuariosAPI.slice([],30).map(usuario => clashofclansAPI.obtenerUsuario(usuario.tag));
            setTimeout(() => {}, 1000);
            let ultimosUsuarios = usuariosAPI.slice(30,).map(usuario => clashofclansAPI.obtenerUsuario(usuario.tag));
            usuariosAPI = primeros30usuarios.concat(ultimosUsuarios);
        }
        usuariosAPI = await Promise.all(usuariosAPI);
    } catch (error) { return; }
}


a()
