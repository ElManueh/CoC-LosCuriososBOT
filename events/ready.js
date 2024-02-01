const { Events } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("./mybotdata.sqlite");
const funcionesBD = require("../src/basededatos");
const clashofclansAPI = require('../src/clashofclansAPI');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		try {
			let solicitudDB = 'CREATE TABLE IF NOT EXISTS usuarios (discordID TEXT, cocTAG TEXT)';
			await db.run(solicitudDB);
		} catch (error) {
			console.error('Error al crear la DB\n' + error);
		}

		let solicitudDB, respuestaDB;

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

			// console.log(respuestaDB);

			console.log(respuestaDB);
			return;
			let datosMiembros;
			try {
				// datosMiembros = await clashofclansAPI.actualizarDatosMiembros();
			} catch (error) {
				console.log('error');
			}

			datosMiembros.forEach(miembro => {
				// comprobamos tag, nombre y rol
				// miembro.tag miembro.name miembro.role

				// mirar si el usuario existe en la db
				// si no existe añadirlo con los nuevos valores
				// si existe comprobar cada uno de los valores
				// si un valor es diferente, actualizar la db con los nuevos valores del usuario

				
			respuestaDB = respuestaDB.filter(usuarioDB => usuarioDB.cocTAG == miembro.tag);
			if (!respuesta) {	// insertamos si no existe y acabamos
				let solicitudDB = 'INSERT INTO usuarios (discordID, cocTAG, nombreCOC, rangoCOC, capital) VALUES (?, ?, ?, ?, ?)';
				db.run(solicitudDB, null, miembro.tag, miembro.name, miembro,rol, 0, () => {
					console.log('insertado');
				});
				return;
			} 

			if (usuarioDB.nombreCOC != miembro.name || usuarioDB.rangoCOC != miembro.role) {	// valores desactualizados
				solicitudDB = 'UPDATE usuarios SET nombreCOC = ?, rangoCOC = ? WHERE cocTAG = ?';
				db.run(solicitudDB, miembro.name, miembro.role, miembro.tag, () => {
					console.log('usuario actualizado');
				})
			}

			});

			
			// hago solicitud con miembros del clan (devuelve en JSON)
			// realizar busquedas sobre ese JSON

			console.log(1);
		}, 3000)

		try {
			let solicitudDB = 'UPDATE usuarios SET capital=0';
			await db.run(solicitudDB);
		} catch (error) { console.log("error") }
	},
};