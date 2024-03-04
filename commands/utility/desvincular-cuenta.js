import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { databaseAll, databaseGet, databaseRun } from '../../src/services/database.js';
import mensajes from '../../src/locale.json' assert { type: 'json' };
import { writeConsoleANDLog } from '../../src/write.js';

export default {
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('desvincular-cuenta')
        .setDescription('Desvincula tu cuenta de Clash Of Clans de Discord.')
        .addStringOption(option => option
			.setName('player-tag')
			.setDescription('tag')
			.setRequired(true)),
    async execute(interaction) {
        const optionPlayerTag = interaction.options.getString('player-tag');
        try {
            let connections = await databaseAll(`SELECT * FROM UserConnections WHERE discordId = '${interaction.user.id}' AND player = '${optionPlayerTag}'`);
            if (!connections.length) return await interaction.reply({ content: mensajes.clashofclans.no_vinculado, ephemeral: true });
            
            await databaseRun(`DELETE FROM UserConnections WHERE discordId = '${interaction.user.id}' AND player = '${optionPlayerTag}'`);
            await interaction.reply({ content: mensajes.clashofclans.desvinculado_ok, ephemeral: true });    

            const player = await databaseGet(`SELECT * FROM PlayerData WHERE tag = '${optionPlayerTag}'`);
            const messageEmbedLog = new EmbedBuilder()
				.setColor(0xFF0000)
				.addFields(
					{ name: 'Discord', value: `${interaction.user.tag}`, inline: true },
					{ name: 'PlayerName', value: `${player.name}`, inline: true },
					{ name: 'PlayerTag', value: `${player.tag}`, inline: true },
				)
				.setTimestamp()
				.setFooter({ text: `${interaction.user.id}`, iconURL: `${interaction.user.avatarURL()}` });

			let clanConnecteds = await databaseAll(`SELECT * FROM GuildConnections WHERE clan = '${player.tag}'`);
			for (const connection of clanConnecteds) {
				if (!connection.channelLogId) continue;
				
				let guild = interaction.client.guilds.cache.get(connection.guild);
				if (!guild) await interaction.client.guilds.fetch(connection.guild);
				let channel = guild.channels.cache.get(connection.channelLogId);
				if (!channel) guild.channels.fetch(connection.channelLogId);

				await channel.send({ embeds: [messageEmbedLog] });
			}
        } catch (error) {
            await interaction.reply({ content: mensajes.error.notificar, ephemeral: true });
            await writeConsoleANDLog(error);
        }
    }
};