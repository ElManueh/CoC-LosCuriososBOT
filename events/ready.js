const { Events, DefaultWebSocketManagerOptions } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("./mybotdata.sqlite");
const funcionesBD = require("../src/basededatos");
const clashofclansAPI = require('../src/clashofclansAPI');

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
			preferenciaGuerra 	TEXT 		NOT NULL	DEFAULT "out",	
			ataquesUltGuerra 	TEXT 		NOT NULL	DEFAULT "-",
			puntosUltJuegos 	TEXT 		NOT NULL 	DEFAULT "0",
			puntosUltAsaltos 	TEXT 		NOT NULL 	DEFAULT "0",
			totalCapital 		TEXT	 	NOT NULL	DEFAULT "0"
			)`;

		
		db.run(solicitudDB, (result, err) => {
			if (!err) console.log(result);
			else console.log(err);
		});

			return;
		
		console.error('ERROR CREANDO / CARGANDO LA BASE DE DATOS\n' + error);
		console.log("f");
		

		
		

		// puntos en los ultimos juegos	CAMPEON DE LOS JUEGOS
		// puntos en el ultimo asalto	CAPITALISMO AGRESIVO
		// contribuido 	MEJOR ALIADO DEL CLAN
		// ataques ultima guerra { -, 0, 1, 2 }
		// escudo guerra

		return;
		try {
			let solicitudDB = 'CREATE TABLE IF NOT EXISTS usuarios (discordID TEXT, cocTAG TEXT, nombreCOC TEXT, rangoCOC TEXT, capital INTEGER)';
			db.run(solicitudDB);
		} catch (error) {
			console.error('Error al crear la DB\n' + error);
		}

		let solicitudD2B, respuestaDB;

		setInterval(async () => {
			// AQUI SE ACTUALIZAN LOS VALORES

			// nombre
			// rango
			// capital
			
			solicitudDB = 'SELECT * FROM usuarios';
			respuestaDB = await new Promise((resolve, reject) => {
				db.all(solicitudDB, (err, row) => {
					if (!err) resolve(row);
					reject(err);
				})
			})

			
			let datosMiembros;
			try {
				datosMiembros = await clashofclansAPI.actualizarDatosMiembros();
			} catch (error) {
				console.log('error');
			}

			let a;
			for (const miembro of datosMiembros) {
				// comprobamos tag, nombre y rol
				// miembro.tag miembro.name miembro.role

				// mirar si el usuario existe en la db
				// si no existe añadirlo con los nuevos valores
				// si existe comprobar cada uno de los valores
				// si un valor es diferente, actualizar la db con los nuevos valores del usuario

				a = respuestaDB.filter(usuarioDB => usuarioDB.cocTAG == miembro.tag);
				//console.log(a);

				
				if (a.length == 0) {	// insertamos si no existe y acabamos
					let solicitudDB = 'INSERT INTO usuarios (discordID, cocTAG, nombreCOC, rangoCOC, capital) VALUES (?, ?, ?, ?, ?)';
					db.run(solicitudDB, null, miembro.tag, miembro.name, miembro.role, 0, () => {
						console.log('insertado');
					});
				} else {
					a = a[0];
					if (a.nombreCOC != miembro.name || a.rangoCOC != miembro.role) {	// valores desactualizados
						solicitudDB = 'UPDATE usuarios SET nombreCOC = ?, rangoCOC = ? WHERE cocTAG = ?';
						db.run(solicitudDB, miembro.name, miembro.role, miembro.tag, () => {
							console.log('usuario actualizado');
						})
					}
				}
				
			}
		}, 3000);

	},
};