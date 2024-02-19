import { Events } from 'discord.js';
import { currentWar } from '../src/events/currentWar.js';
import { databaseUpdate } from '../src/events/databaseUpdate.js';
import { discordGuildId } from '../src/services/discord.js';

export default {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Conectado correctamente como '${client.user.tag}'`);

		try {
			currentWar();
		} catch (error) { console.error('[-] ERROR: ACTUALIZACION DB DETENIDA'); }
		
		try {
			databaseUpdate(client.guilds.cache.get(discordGuildId));
		} catch (error) { console.error('[-] ERROR: TRACKING GUERRA ACTUAL DETENIDO') }
	},
};