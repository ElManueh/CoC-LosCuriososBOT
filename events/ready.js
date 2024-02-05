const { Events } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("./mybotdata.sqlite");
const clashofclansAPI = require('../src/clashofclansAPI');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		let solicitudDB, respuestaDB;

		solicitudDB = `CREATE TABLE IF NOT EXISTS usuariosCOC (
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

		respuestaDB = await new Promise(function (resolve) {	// creamos la tabla
			db.run(solicitudDB, (err) => {
				if (!err) return resolve(true);
				console.error(err.message); return resolve(false);
			});
		});
		if (!respuestaDB) return;

		setInterval(async () => {	// BUCLE

			solicitudDB = 'SELECT * FROM usuariosCOC';
			respuestaDB = await new Promise(function (resolve) {	// obtengo todos los usuarios de nuestra DB
				db.all(solicitudDB, (err, rows) => {
					if (!err) return resolve(rows);
					console.error(err.message); return resolve(false);
				});
			});
			if (!respuestaDB) return;

			let usuariosDB = respuestaDB;
			let usuariosAPI;
			await clashofclansAPI.actualizarDatosMiembros()	// obtengo los datos de los usuarios del clan
				.then(usuariosCOC => usuariosAPI = usuariosCOC)
				.catch(err => console.error(err));

			usuariosAPI = usuariosAPI.map(miembro => clashofclansAPI.obtenerUsuario(miembro.tag));
			await Promise.all(usuariosAPI)
				.then(respuesta => usuariosAPI = respuesta)
				.catch(err => console.error(err));

			for (let usuarioAPI of usuariosAPI) {	// por cada miembro en el clan
				let usuarioDB = usuariosDB.filter(usuarioDB => usuarioDB.tag == usuarioAPI.tag);	// busco si el miembro esta en la DB
				if (usuarioDB.length == 0) {	// el usuario no existe en la DB, lo creamos
					let solicitudDB = `INSERT INTO usuariosCOC (discordID, tag, nombre, rango) 
										VALUES (?, ?, ?, ?)`;
					respuestaDB = await new Promise(function(resolve) {
						db.run(solicitudDB, null, usuarioAPI.tag, usuarioAPI.name, usuarioAPI.role, (err) => {
							if (!err) return resolve(true);
							console.error(err.message); return resolve(false);
						});
					});
					if (!respuestaDB) return;
					continue;
				}

				usuarioDB = usuarioDB[0];
				if (usuarioDB.nombre != usuarioAPI.name) {	// nombre cambiado
					solicitudDB = 'UPDATE usuariosCOC SET nombre = ? WHERE tag = ?';
					respuestaDB = await new Promise(function (resolve) {
						db.run(solicitudDB, usuarioAPI.name, usuarioAPI.tag, (err) => {
							if (!err) return resolve(true);
							console.error(err.message); return resolve(false);
						});
					});
					if (!respuestaDB) return;
				}

				if (usuarioDB.tag == '#GQQGJCUYU') console.log(usuarioDB.rango + ' ' + usuarioAPI.role);
				
				if (usuarioDB.rango != usuarioAPI.role) {	// rango cambiado
					solicitudDB = 'UPDATE usuariosCOC SET rango = ? WHERE tag = ?';
					respuestaDB = await new Promise(function (resolve) {
						db.run(solicitudDB, usuarioAPI.role, usuarioAPI.tag, (err) => {
							if (!err) return resolve(true);
							console.error(err.message); return resolve(false);
						});
					});
					if (!respuestaDB) return;
				}

				if (usuarioDB.preferenciaGuerra != usuarioAPI.warPreference) {
					solicitudDB = 'UPDATE usuariosCOC SET preferenciaGuerra = ? WHERE tag = ?';
					respuestaDB = await new Promise(function (resolve) {
						db.run(solicitudDB, usuarioAPI.warPreference, usuarioAPI.tag, (err) => {
							if (!err) return resolve(true);
							console.error(err.message); return resolve(false);
						});
					});
					if (!respuestaDB) return;
				}
			}
		}, 30000);

	},
};