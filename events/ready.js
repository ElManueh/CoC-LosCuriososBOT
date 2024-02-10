const { Events } = require('discord.js');
const clashofclansAPI = require('../src/clashofclansAPI');
const comandosDB = require('../src/comandosDB');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		let solicitudDB = `CREATE TABLE IF NOT EXISTS usuariosCOC (
			discordID			TEXT 		UNIQUE,
			tag 				TEXT 		NOT NULL	UNIQUE PRIMARY KEY,
			nombre 				TEXT 		NOT NULL,
			rango 				TEXT 		NOT NULL,
			preferenciaGuerra 	TEXT 		DEFAULT "out",	
			ataquesUltGuerra 	TEXT 		DEFAULT "-",
			puntosUltJuegos 	TEXT 		DEFAULT "0",
			puntosUltAsaltos 	TEXT 		DEFAULT "0",
			totalCapital 		TEXT	 	DEFAULT "0"
			)`;

		try {
			await comandosDB.ejecutarDBrun(solicitudDB);
		} catch (error) { return console.error(err); }

		setInterval(async () => {	// BUCLE
			let usuariosDB, usuariosAPI;

			solicitudDB = 'SELECT * FROM usuariosCOC';
			try {	// obtengo todos los usuarios de nuestra DB
				usuariosDB = await comandosDB.solicitarDBall(solicitudDB);
			} catch (error) { return; }
			
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

			for (let usuarioAPI of usuariosAPI) {	// por cada usuario en el clan
				let usuarioDB = usuariosDB.filter(usuario => usuario.tag === usuarioAPI.tag);	// busco si el miembro esta en la DB
				if (!usuarioDB.length) {	// el usuario no existe en la DB, lo creamos
					let solicitudDB = `INSERT INTO usuariosCOC (discordID, tag, nombre, rango) VALUES (${null}, '${usuarioAPI.tag}', '${usuarioAPI.name}', '${usuarioAPI.role}')`;
					try {
						await comandosDB.ejecutarDBrun(solicitudDB);
					} catch (error) { return; }
					continue;
				}

				usuarioDB = usuarioDB[0];
				if (usuarioDB.nombre != usuarioAPI.name) {	// nombre cambiado
					solicitudDB = `UPDATE usuariosCOC SET nombre = '${usuarioAPI.name}' WHERE tag = '${usuarioAPI.tag}'`;
					try {
						await comandosDB.ejecutarDBrun(solicitudDB);
					} catch (error) { return; }
				}
				
				if (usuarioDB.rango != usuarioAPI.role) {	// rango cambiado
					solicitudDB = `UPDATE usuariosCOC SET rango = '${usuarioAPI.role}' WHERE tag = '${usuarioAPI.tag}'`;
					try {
						await comandosDB.ejecutarDBrun(solicitudDB);
					} catch (error) { return; }
				}

				if (usuarioDB.preferenciaGuerra != usuarioAPI.warPreference) {	// preferenciaGuerra cambiado
					solicitudDB = `UPDATE usuariosCOC SET preferenciaGuerra = '${usuarioAPI.warPreference}' WHERE tag = '${usuarioAPI.tag}'`;
					try {
						await comandosDB.ejecutarDBrun(solicitudDB);
					} catch (error) { return; }
				}
			}
		}, 5*1000);

	},
};