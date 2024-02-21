import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUserInfo, verifyUserToken } from '../../src/services/clashofclansAPI.js';
import { databaseGet, databaseRun } from '../../src/services/database.js';
import { discordNameUpdate, discordRoleUpdate, discordChannelLog } from '../../src/services/discord.js';
import mensajes from '../../src/locale.json' assert { type: 'json' };

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
		try {
			const optionUserTag = interaction.options.getString('usuario-tag');
			const optionUserApi = interaction.options.getString('codigo-api');
			
			let userDatabase = await databaseGet(`SELECT * FROM usuariosCOC WHERE discordID = '${interaction.user.id}'`);
			if (userDatabase) return interaction.reply({ content: mensajes.clashofclans.discord_ya_vinculado, ephemeral: true });

			let userClan = await getUserInfo(optionUserTag);
			let tokenVerified = await verifyUserToken(optionUserTag, optionUserApi);
			if (!tokenVerified) return interaction.reply({ content: mensajes.clashofclans.api_incorrecta, ephemeral: true });

			userDatabase = await databaseGet(`SELECT * FROM usuariosCOC WHERE tag = '${userClan.tag}'`);
			if (userDatabase.length !== 0 && userDatabase.discordID != null) return interaction.reply({ content: mensajes.clashofclans.tag_ya_vinculado, ephemeral: true });

			if (userDatabase.length === 0)
				await databaseRun(`INSERT INTO usuariosCOC (discordID, tag, nombre, rango) 
									VALUES ('${interaction.user.id}', '${userClan.tag}', '${userClan.name}', '${userClan.role}')`);
			else
				await databaseRun(`UPDATE usuariosCOC set discordID = '${interaction.user.id}' WHERE tag = '${userDatabase.tag}'`);

			await interaction.reply({ content: mensajes.clashofclans.vinculado_ok, ephemeral: true });
			await discordNameUpdate(interaction.user.id, userClan.name, interaction.guild);
			await discordRoleUpdate(interaction.user.id, userClan.role, interaction.guild);

			if (interaction.guild.ownerId === interaction.user.id) await interaction.followUp({ content: mensajes.discord.modificar_nombre_owner, ephemeral: true });

			const messageEmbedLog = new EmbedBuilder()
				.setColor(0x00FF00)
				.addFields(
					{ name: 'Discord', value: `${interaction.user.tag}`, inline: true },
					{ name: 'Nombre CoC', value: `${userClan.name}`, inline: true },
					{ name: 'Tag CoC', value: `${userClan.tag}`, inline: true },
				)
				.setTimestamp()
				.setFooter({ text: `${interaction.user.id}`, iconURL: `${interaction.user.avatarURL()}` });
		
			const channel = interaction.guild.channels.cache.get(discordChannelLog);
			await channel.send({ embeds: [messageEmbedLog]});
		} catch (error) {
			await interaction.reply({ content: mensajes.error.notificar, ephemeral: true });
			console.error(error);
		}
	},
};