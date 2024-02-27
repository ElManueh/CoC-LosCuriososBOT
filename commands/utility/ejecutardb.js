import { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { databaseRun } from '../../src/services/database.js';
import { writeConsoleANDLog } from '../../src/write.js';
import { discordOwnerId_elmanueh } from '../../src/services/discord.js';
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
        try {
            const databaseRequest = interaction.options.getString('ejecutar');
            if (interaction.user.id !== discordOwnerId_elmanueh) return interaction.reply({ content: mensajes.discord.permisos_insuficientes, ephemeral: true });

            const rollbackButton = new ButtonBuilder()
                .setCustomId('rollback')
                .setLabel('Rollback')
                .setStyle(ButtonStyle.Danger);

            const commitButton = new ButtonBuilder()
                .setCustomId('commit')
                .setLabel('Commit')
                .setStyle(ButtonStyle.Success);

            const row = new ActionRowBuilder()
                .addComponents(commitButton, rollbackButton);
            
            await databaseRun('BEGIN');
            await databaseRun(databaseRequest);

            const messageInteraction = await interaction.reply({ content: '¿Estás seguro? Comprueba que los cambios son los esperados. (30 seg)', components: [row], ephemeral: true });
            try {
                const buttonPressed = await messageInteraction.awaitMessageComponent({ time: 30_000 });
                if (buttonPressed.customId === 'commit') {
                    await databaseRun('COMMIT');
                    await buttonPressed.update({ content: 'Comando REALIZADO correctamente en la base de datos.', components: [], ephemeral: true });
                } else if (buttonPressed.customId === 'rollback') {
                    await databaseRun('ROLLBACK');
                    await buttonPressed.update({ content: 'Comando REVERTIDO correctamente en la base de datos.', components: [], ephemeral: true });
                }
            } catch (error) {
                await databaseRun('ROLLBACK');
                await interaction.editReply({ content: 'No se ha recibido ninguna respuesta, cancelando operación.', components: [] });
            }
        } catch (error) {
            await databaseRun('ROLLBACK');
            await interaction.reply({ content: mensajes.error.notificar, ephemeral: true });
            await writeConsoleANDLog(error);
        }
    }
};