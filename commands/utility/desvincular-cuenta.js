import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { databaseGet, databaseRun } from '../../src/services/database.js';
import { discordNameUpdate, discordRoleUpdate, discordChannelLog } from '../../src/services/discord.js';
import mensajes from '../../src/locale.json' assert { type: 'json' };
import { writeConsoleANDLog } from '../../src/write.js';

export default {
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('desvincular-cuenta')
        .setDescription('Desvincula tu cuenta de Clash Of Clans de Discord.'),
    async execute(interaction) {
        try {
            let databaseUser = await databaseGet(`SELECT * FROM usuariosCOC WHERE discordID = '${interaction.user.id}'`);
            if (!databaseUser) return interaction.reply({ content: mensajes.clashofclans.no_vinculado, ephemeral: true });

            await databaseRun(`UPDATE usuariosCOC SET discordID = ${null} WHERE tag = '${databaseUser.tag}'`);

            await discordNameUpdate(interaction.user.id, null, interaction.guild);
            await discordRoleUpdate(interaction.user.id, null, interaction.guild);

            await interaction.reply({ content: mensajes.clashofclans.desvinculado_ok, ephemeral: true });

            const messageEmbedLog = new EmbedBuilder()
                .setColor(0xFF0000)
                .addFields(
                    { name: 'Discord', value: `${interaction.user.tag}`, inline: true },
                    { name: 'Nombre CoC', value: `${databaseUser.nombre}`, inline: true },
                    { name: 'Tag CoC', value: `${databaseUser.tag}`, inline: true },
                )
                .setTimestamp()
                .setFooter({ text: `${interaction.user.id}`, iconURL: `${interaction.user.avatarURL()}` });
		
            const channel = interaction.guild.channels.cache.get(discordChannelLog);
            await channel.send({ embeds: [messageEmbedLog]});
        } catch (error) {
            await interaction.reply({ content: mensajes.error.notificar, ephemeral: true });
            await writeConsoleANDLog(error);
        }
    }
};