import { Events } from 'discord.js';
import { currentWar } from '../src/events/currentWar.js';
import { databaseUpdate } from '../src/events/databaseUpdate.js';
import { discordGuildId } from '../src/services/discord.js';
import { RequestCountClashOfClansCreate } from '../src/services/clashofclansAPI.js';

export default {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Conectado correctamente como '${client.user.tag}'`);
		// This execute the code to manage the database update with information about wars.
		currentWar();
		// This execute the code to manage the update of users clan.
		databaseUpdate(client.guilds.cache.get(discordGuildId));
		// Initialize limit rate of api coc.
		RequestCountClashOfClansCreate();
	},
};