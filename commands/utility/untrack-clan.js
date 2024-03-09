import { SlashCommandBuilder } from 'discord.js';
import { getClan } from '../../src/services/clashofclansAPI.js';
import { closeConnectionDatabase, getDatabase, openConnectionDatabase, runDatabase } from '../../src/services/database.js';
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
		const db = await openConnectionDatabase();
		try {
			let optionClanTag = interaction.options.getString('clan-tag');
			let clan = await getClan(optionClanTag);

			await runDatabase(db, 'BEGIN IMMEDIATE');
			let queryDatabase = await getDatabase(db, `SELECT * FROM GuildConnections WHERE guildId = '${interaction.guild.id}' AND clan = '${clan.tag}'`);
			if (!queryDatabase) return interaction.reply({ content: 'el clan no esta vinculado a este servidor', ephemeral: true });

			await runDatabase(db, `DELETE FROM GuildConnections WHERE guildId = '${interaction.guild.id}' AND clan = '${clan.tag}'`);
			await interaction.reply({ content: 'se ha desvinculado el clan X de este servidor', ephemeral: true });
			await runDatabase(db, 'COMMIT');
		} catch (error) {
			await runDatabase(db, 'ROLLBACK');
			await writeConsoleANDLog(error);
			if (error instanceof ClashOfClansError) {
				if (error.errno === 404) return interaction.reply({ content: 'Tag incorrecto', ephemeral: true });
			}
			await interaction.reply({ content: mensajes.error.notificar, ephemeral: true });
		} finally {
			await closeConnectionDatabase(db);
		}
	},
};