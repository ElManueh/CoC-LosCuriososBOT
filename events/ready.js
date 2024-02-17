const { Events } = require('discord.js');
const eventos = require('../src/eventos');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Conectado correctamente como '${client.user.tag}'`);

		try {
			await eventos.actualizarDB();
		} catch (error) { console.error('[-] ERROR: ACTUALIZACION DB DETENIDA'); }

		try {
			await eventos.guerraActual();
		} catch (error) { console.error('[-] ERROR: TRACKING GUERRA ACTUAL DETENIDO') }
	},
};