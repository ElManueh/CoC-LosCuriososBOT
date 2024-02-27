import { SlashCommandBuilder } from 'discord.js';
import { databaseRun } from '../../src/services/database.js';
import mensajes from '../../src/locale.json' assert { type: 'json' };
import { writeConsoleANDLog } from '../../src/write.js';

export default {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('ejecutardb')
		.setDescription('Realiza acciones en la base de datos. (Ten cuidado con lo que ejecutas)')
		.addStringOption(option => option
			.setName('ejecutar')
			.setDescription('Ejecucion en formato SQL.')
            .setRequired(true)),
	async execute(interaction) {
        try {
            const databaseRequest = interaction.options.getString('ejecutar');
            if (interaction.user.id != '219739628196855808') return interaction.reply({ content: mensajes.discord.permisos_insuficientes, ephemeral: true });
            await databaseRun(databaseRequest);
            await interaction.reply({ content: 'Comando realizado correctamente en la base de datos.', ephemeral: true });
        } catch (error) {
            await interaction.reply({ content: mensajes.error.notificar, ephemeral: true });
            await writeConsoleANDLog(error);
        }
    }
};