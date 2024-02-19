import { SlashCommandBuilder, codeBlock } from 'discord.js';
import { databaseGet, databaseAll, databaseRun } from '../../src/services/database.js';
import mensajes from '../../src/locale.json' assert { type: 'json' };

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
        const solicitudDB = interaction.options.getString('ejecutar');

        // Permisos mios
        if (interaction.user.id != '219739628196855808') return interaction.reply({ content: mensajes.discord.permisos_insuficientes, ephemeral: true });

        try {   // Solicitud a la DB
            await comandosDB.ejecutarDBrun(solicitudDB);
        } catch (error) { return interaction.reply({ content: mensajes.discord.ejecuciondb_incorrecta, ephemeral: true }); }

        await interaction.reply({ content: 'Comando realizado correctamente en la base de datos.', ephemeral: true });
    }
};