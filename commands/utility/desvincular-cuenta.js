import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { allDatabase, closeConnectionDatabase, getDatabase, openConnectionDatabase, runDatabase } from '../../src/services/database.js';
import localeJSON from '../../src/locale.json' assert { type: 'json' };
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
		const db = await openConnectionDatabase();
        try {
            let connections = await allDatabase(db, `SELECT * FROM UserConnections WHERE discordId = '${interaction.user.id}' AND player = '${optionPlayerTag}'`);
            if (!connections.length) return await interaction.reply({ content: localeJSON.clashofclans_account_unlinked_fail, ephemeral: true });
            
            await runDatabase(db, `DELETE FROM UserConnections WHERE discordId = '${interaction.user.id}' AND player = '${optionPlayerTag}'`);
            await interaction.reply({ content: localeJSON.clashofclans_account_unlinked_ok, ephemeral: true });    

            const player = await getDatabase(db, `SELECT * FROM PlayerData WHERE tag = '${optionPlayerTag}'`);
            const messageEmbedLog = new EmbedBuilder()
				.setColor(0xFF0000)
				.addFields(
					{ name: 'Discord', value: `${interaction.user.tag}`, inline: true },
					{ name: 'PlayerName', value: `${player.name}`, inline: true },
					{ name: 'PlayerTag', value: `${player.tag}`, inline: true },
				)
				.setTimestamp()
				.setFooter({ text: `${interaction.user.id}`, iconURL: `${interaction.user.avatarURL()}` });

			let clanConnecteds = await allDatabase(db, `SELECT * FROM GuildConnections WHERE clan = '${player.tag}'`);
			for (const connection of clanConnecteds) {
				if (!connection.channelLogId) continue;
				
				let guild = interaction.client.guilds.cache.get(connection.guild);
				if (!guild) await interaction.client.guilds.fetch(connection.guild);
				let channel = guild.channels.cache.get(connection.channelLogId);
				if (!channel) guild.channels.fetch(connection.channelLogId);

				await channel.send({ embeds: [messageEmbedLog] });
			}
			await closeConnectionDatabase(db);
        } catch (error) {
			await closeConnectionDatabase(db);
            await interaction.reply({ content: localeJSON.error_notify_in_discord, ephemeral: true });
            await writeConsoleANDLog(error);
        }
    }
};