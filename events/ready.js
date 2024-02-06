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

		await comandosDB.ejecutarDBrun(solicitudDB)
			.catch(err => { console.error(err); return; });

		setInterval(async () => {	// BUCLE
			let usuariosDB, usuariosAPI;

			solicitudDB = 'SELECT * FROM usuariosCOC';
			await comandosDB.solicitarDBall(solicitudDB)	// obtengo todos los usuarios de nuestra DB
				.then(usuarios => usuariosDB = usuarios)
				.catch(err => { console.error(err); return; });
			if (!usuariosDB) return;

			await clashofclansAPI.actualizarDatosMiembros()	// obtengo los datos de los usuarios del clan
				.then(usuarios => usuariosAPI = usuarios)
				.catch(err => { console.error(err); return; });
			if (!usuariosAPI) return;
			
			usuariosAPI = usuariosAPI.map(usuario => clashofclansAPI.obtenerUsuario(usuario.tag)); 
			await Promise.all(usuariosAPI)
				.then(usuarios => usuariosAPI = usuarios)
				.catch(err => { console.error(err); return; });

			for (let usuarioAPI of usuariosAPI) {	// por cada miembro en el clan
				let usuarioDB = usuariosDB.filter(usuario => usuario.tag == usuarioAPI.tag);	// busco si el miembro esta en la DB
				
				if (usuarioDB.length == 0) {	// el usuario no existe en la DB, lo creamos
					let solicitudDB = `INSERT INTO usuariosCOC (discordID, tag, nombre, rango) VALUES (${null}, '${usuarioAPI.tag}', '${usuarioAPI.name}', '${usuarioAPI.role}')`;
					await comandosDB.ejecutarDBrun(solicitudDB)
						.catch(err => { console.error(err); return; });
					continue;
				}

				usuarioDB = usuarioDB[0];
				if (usuarioDB.nombre != usuarioAPI.name) {	// nombre cambiado
					solicitudDB = `UPDATE usuariosCOC SET nombre = '${usuarioAPI.name}' WHERE tag = '${usuarioAPI.tag}'`;
					await comandosDB.ejecutarDBrun(solicitudDB)
						.catch(err => { console.error(err); return; });	
				}
				
				if (usuarioDB.rango != usuarioAPI.role) {	// rango cambiado
					solicitudDB = `UPDATE usuariosCOC SET rango = '${usuarioAPI.role}' WHERE tag = '${usuarioAPI.tag}'`;
					await comandosDB.ejecutarDBrun(solicitudDB)
						.catch(err => { console.error(err); return; });
				}

				if (usuarioDB.preferenciaGuerra != usuarioAPI.warPreference) {	// preferenciaGuerra cambiado
					solicitudDB = `UPDATE usuariosCOC SET preferenciaGuerra = '${usuarioAPI.warPreference}' WHERE tag = '${usuarioAPI.tag}'`;
					await comandosDB.ejecutarDBrun(solicitudDB)
						.catch(err => { console.error(err); return; });
				}
			}
		}, 5000);

	},
};