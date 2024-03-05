import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getPlayer, verifyPlayerToken } from '../../src/services/clashofclansAPI.js';
import { databaseAll, databaseRun } from '../../src/services/database.js';
import mensajes from '../../src/locale.json' assert { type: 'json' };
import { writeConsoleANDLog } from '../../src/write.js';
import { ClashOfClansError, SQLITE_CONSTRAINT_FOREIGNKEY, SQLITE_CONSTRAINT_UNIQUE } from '../../src/errorCreate.js';

export default {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('track-clan')
		.setDescription('Vincula tu clan a este servidor.')
		.addStringOption(option => option
			.setName('clan-tag')
			.setDescription('Este es el TAG de tu clan de Clash Of Clans.')
			.setRequired(true)),
	async execute(interaction) {
		try {
            /*
                - compruebo que es un clan valido
                    -SI: lo vinculo
                        - si falla: creo el clan y lo vuelvo a vincular
                            - tengo que crear tambien todos los jugadores
                            - asociar cada jugador a ese clan
                        - mensaje avisando de que lo configuren
                    -NO: mensaje error
            */
		} catch (error) {
			await interaction.reply({ content: mensajes.error.notificar, ephemeral: true });
			await writeConsoleANDLog(error);
		}
	},
};