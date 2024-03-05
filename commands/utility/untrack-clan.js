import { SlashCommandBuilder } from 'discord.js';
import { getClan } from '../../src/services/clashofclansAPI.js';
import { databaseGet, databaseRun } from '../../src/services/database.js';
import mensajes from '../../src/locale.json' assert { type: 'json' };
import { writeConsoleANDLog } from '../../src/write.js';
import { ClashOfClansError } from '../../src/errorCreate.js';

export default {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('untrack-clan')
		.setDescription('Desvincula tu clan.')
		.addStringOption(option => option
			.setName('clan-tag')
			.setDescription('Este es el TAG del clan.')
			.setRequired(true)),
	async execute(interaction) {
		try {
			let optionClanTag = interaction.options.getString('clan-tag');
			let clan = await getClan(optionClanTag);

			let query = await databaseGet(`SELECT * FROM GuildConnections WHERE guildId = '${interaction.guild.id}' AND clan = '${clan.tag}'`);
			if (!query) return await interaction.reply({ content: 'el clan no esta vinculado a este servidor', ephemeral: true });

			await databaseRun(`DELETE FROM GuildConnections WHERE guildId = '${interaction.guild.id}' AND clan = '${clan.tag}'`);
			await interaction.reply({ content: 'se ha desvinculado el clan X de este servidor', ephemeral: true });
		} catch (error) {
			if (error instanceof ClashOfClansError) {
				if (error.errno === 404) return await interaction.reply({ content: 'Tag incorrecto', ephemeral: true });
			}
			await interaction.reply({ content: mensajes.error.notificar, ephemeral: true });
			await writeConsoleANDLog(error);
		}
	},
};