import { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { closeConnectionDatabase, openConnectionDatabase, runDatabase } from '../../src/services/database.js';
import { writeConsoleANDLog } from '../../src/write.js';
import mensajes from '../../src/locale.json' assert { type: 'json' };

const ELMANUEH_DISCORD_ID = '219739628196855808';

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
        const db = await openConnectionDatabase();
        try {
            const queryDatabase = interaction.options.getString('ejecutar');
            if (interaction.user.id !== ELMANUEH_DISCORD_ID) return interaction.reply({ content: mensajes.discord.permisos_insuficientes, ephemeral: true });
            
            const commitButton = new ButtonBuilder()
                .setCustomId('commit')
                .setLabel('Commit')
                .setStyle(ButtonStyle.Success);
            const rollbackButton = new ButtonBuilder()
                .setCustomId('rollback')
                .setLabel('Rollback')
                .setStyle(ButtonStyle.Danger);
            const rowButtons = new ActionRowBuilder()
                .addComponents(commitButton, rollbackButton);
            
            await runDatabase(db, 'BEGIN EXCLUSIVE');
            await runDatabase(db, queryDatabase);

            const messageInteraction = await interaction.reply({ content: '¿Estás seguro? Comprueba que los cambios son los esperados. (30 seg)', components: [rowButtons], ephemeral: true });
            try {
                const buttonPressed = await messageInteraction.awaitMessageComponent({ time: 30_000 });
                if (buttonPressed.customId === 'commit') {
                    await runDatabase(db, 'COMMIT');
                    await buttonPressed.update({ content: 'Comando REALIZADO correctamente en la base de datos.', components: [], ephemeral: true });
                } else if (buttonPressed.customId === 'rollback') {
                    await runDatabase(db, 'ROLLBACK');
                    await buttonPressed.update({ content: 'Comando REVERTIDO correctamente en la base de datos.', components: [], ephemeral: true });
                }
            } catch (error) {
                await runDatabase(db, 'ROLLBACK');
                await interaction.editReply({ content: 'No se ha recibido ninguna respuesta, cancelando operación.', components: [] });
            }
        } catch (error) {
            await runDatabase(db, 'ROLLBACK');
            await interaction.reply({ content: mensajes.error.notificar, ephemeral: true });
            await writeConsoleANDLog(error);
        } finally {
            await closeConnectionDatabase(db);
        }
    }
};