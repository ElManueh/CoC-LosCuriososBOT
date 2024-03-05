import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getPlayer, verifyPlayerToken } from '../../src/services/clashofclansAPI.js';
import { databaseAll, databaseRun } from '../../src/services/database.js';
import mensajes from '../../src/locale.json' assert { type: 'json' };
import { writeConsoleANDLog } from '../../src/write.js';
import { ClashOfClansError, SQLITE_CONSTRAINT_FOREIGNKEY, SQLITE_CONSTRAINT_UNIQUE } from '../../src/errorCreate.js';

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
            /*
                - comprobar que el tag se esta trackeando en ese clan
                - SI:   desvinculo el clan
                - NO:   mensaje de error
            */
		} catch (error) {
			await interaction.reply({ content: mensajes.error.notificar, ephemeral: true });
			await writeConsoleANDLog(error);
		}
	},
};