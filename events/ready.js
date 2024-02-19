import { Events } from 'discord.js';
import { currentWar } from '../src/events/currentWar.js';
import { databaseUpdate } from '../src/events/databaseUpdate.js';

export default {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Conectado correctamente como '${client.user.tag}'`);

		try {
			await currentWar();
		} catch (error) { console.error('[-] ERROR: ACTUALIZACION DB DETENIDA'); }

		try {
			await databaseUpdate('1198305691375505590');
		} catch (error) { console.error('[-] ERROR: TRACKING GUERRA ACTUAL DETENIDO') }
	},
};