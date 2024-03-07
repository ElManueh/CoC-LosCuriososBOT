import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getPlayer, verifyPlayerToken } from '../../src/services/clashofclansAPI.js';
import { allDatabase, closeConnectionDatabase, openConnectionDatabase, runDatabase } from '../../src/services/database.js';
import mensajes from '../../src/locale.json' assert { type: 'json' };
import { writeConsoleANDLog } from '../../src/write.js';
import { ClashOfClansError, SQLITE_CONSTRAINT_FOREIGNKEY, SQLITE_CONSTRAINT_UNIQUE } from '../../src/errorCreate.js';

export default {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('vincular-cuenta')
		.setDescription('Vincula tu cuenta de Clash Of Clans a Discord.')
		.addStringOption(option => option
			.setName('usuario-tag')
			.setDescription('Este es el TAG de tu cuenta de Clash Of Clans.')
			.setRequired(true))
		.addStringOption(option => option
			.setName('codigo-api')
			.setDescription('Este es el codigo API de tu cuenta de Clash Of Clans.')
			.setRequired(true)),
	async execute(interaction) {
		const db = await openConnectionDatabase();
		try {
			const optionPlayerTag = interaction.options.getString('usuario-tag');
			const optionPlayerToken = interaction.options.getString('codigo-api');

			let playerClan = await getPlayer(optionPlayerTag);
			let tokenVerified = await verifyPlayerToken(optionPlayerTag, optionPlayerToken);
			if (!tokenVerified) return interaction.reply({ content: mensajes.clashofclans.api_incorrecta, ephemeral: true });

			await runDatabase(db, 'BEGIN');
			try {
				await runDatabase(db, `INSERT INTO UserConnections VALUES ('${interaction.user.id}', '${playerClan.tag}')`);
			} catch (error) {
				if (error.code === SQLITE_CONSTRAINT_UNIQUE) return await interaction.reply({ content: mensajes.clashofclans.tag_ya_vinculado, ephemeral: true });
				if (error.code === SQLITE_CONSTRAINT_FOREIGNKEY) {
					await runDatabase(db, `INSERT INTO PlayerData VALUES ('${playerClan.tag}', '${playerClan.name}', '${playerClan.townHallLevel}', '${playerClan.warPreference}')`);
					await runDatabase(db, `INSERT INTO UserConnections VALUES ('${interaction.user.id}', '${playerClan.tag}')`);
				}
			}
			await runDatabase(db, 'COMMIT');
			await interaction.reply({ content: mensajes.clashofclans.vinculado_ok, ephemeral: true });

			const messageEmbedLog = new EmbedBuilder()
				.setColor(0x00FF00)
				.addFields(
					{ name: 'Discord', value: `${interaction.user.tag}`, inline: true },
					{ name: 'PlayerName', value: `${playerClan.name}`, inline: true },
					{ name: 'PlayerTag', value: `${playerClan.tag}`, inline: true },
				)
				.setTimestamp()
				.setFooter({ text: `${interaction.user.id}`, iconURL: `${interaction.user.avatarURL()}` });

			let clanConnecteds = await allDatabase(db, `SELECT * FROM GuildConnections WHERE clan = '${playerClan.tag}'`);
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
			if (error instanceof ClashOfClansError) {
				if (error.errno === 404) return await interaction.reply({ content: mensajes.clashofclans.tag_incorrecto, ephemeral: true });
			}
			await interaction.reply({ content: mensajes.error.notificar, ephemeral: true });
			await writeConsoleANDLog(error);
		}
	},
};