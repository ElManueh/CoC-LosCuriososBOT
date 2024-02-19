import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUserInfo, verifyUserToken } from '../../src/services/clashofclansAPI.js';
import { databaseGet, databaseAll, databaseRun } from '../../src/services/database.js';
import { discordNameUpdate, discordRoleUpdate } from '../../src/services/discord.js';
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
		const usuarioTag = interaction.options.getString('usuario-tag');
		const usuarioApi = interaction.options.getString('codigo-api');
		let solicitudDB, usuarioDB, usuarioAPI;

		solicitudDB = `SELECT * FROM usuariosCOC WHERE discordID = '${interaction.user.id}'`;
		try {	// Compruebo que el usuario no se encuentre vinculado a otra cuenta de clashofclans
			usuarioDB = await comandosDB.solicitarDBget(solicitudDB);
			if (usuarioDB) return interaction.reply({ content: mensajes.clashofclans.discord_ya_vinculado, ephemeral: true });
		} catch (error) { throw mensajes.error.data_base + ' Obtener usuario DB.'; }

		try {	// Compruebo que el TAG existe
			usuarioAPI = await clashofclansAPI.obtenerUsuario(usuarioTag);
		} catch (error) { throw mensajes.error.clashofclans + ' Obtener usuario API.'; }

		try {	// Compruebo que el token es valido
			let tokenValido = await clashofclansAPI.verificarTokenUsuario(usuarioTag, usuarioApi);
			if (!tokenValido) return interaction.reply({ content: mensajes.clashofclans.api_incorrecta, ephemeral: true });
		} catch (error) { throw mensajes.error.clashofclans + ' Obtener verificacion token.'; }

		solicitudDB = `SELECT * FROM usuariosCOC WHERE tag = '${usuarioAPI.tag}'`;
		try {	// Compruebo que la cuenta de CoC no este vinculada a una cuenta de Discord
			usuarioDB = await comandosDB.solicitarDBget(solicitudDB);
			if (usuarioDB.length != 0 && usuarioDB.discordID != null) return interaction.reply({ content: mensajes.clashofclans.tag_ya_vinculado, ephemeral: true });
		} catch (error) { throw mensajes.error.data_base + ' Obtener usuario DB.'; }

		if (usuarioDB.length === 0)	// lo añado a la DB
			solicitudDB = `INSERT INTO usuariosCOC (discordID, tag, nombre, rango) VALUES ('${interaction.user.id}', '${usuarioAPI.tag}', '${usuarioAPI.name}', '${usuarioAPI.role}')`;
		else	// vinculamos el discordID con el tag
			solicitudDB = `UPDATE usuariosCOC set discordID = '${interaction.user.id}' WHERE tag = '${usuarioDB.tag}'`;

		try {
			await comandosDB.ejecutarDBrun(solicitudDB);
		} catch (error) { throw mensajes.error.data_base + ' Insertar nuevo usuario.'; }

		await interaction.reply({ content: mensajes.clashofclans.vinculado_ok, ephemeral: true });

		try {	// actualizamos el rango del usuario
			await discord.cambiar_rango(interaction.user.id, usuarioAPI.role, interaction.guild);
		} catch (error) { console.error(mensajes.error.discord + ' Actualizar rango.'); }

		try {	// actualizamos el nombre del usuario
			await discord.cambiar_nombre(interaction.user.id, usuarioAPI.name, interaction.guild);
		} catch (error) { console.error(mensajes.error.discord + ' Actualizar nombre.'); }

        if (interaction.guild.ownerId == interaction.user.id) await interaction.followUp({ content: mensajes.discord.modificar_nombre_owner, ephemeral: true });
        
		const mensajeEmbedLog = new EmbedBuilder()
            .setColor(0x00FF00)
            .addFields(
                { name: 'Discord', value: `${interaction.user.tag}`, inline: true },
                { name: 'Nombre CoC', value: `${usuarioAPI.name}`, inline: true },
                { name: 'Tag CoC', value: `${usuarioAPI.tag}`, inline: true },
            )
            .setTimestamp()
            .setFooter({ text: `${interaction.user.id}`, iconURL: `${interaction.user.avatarURL()}` });
		
		const canal = interaction.guild.channels.cache.get(discord.canal_logs);
		await canal.send({ embeds: [mensajeEmbedLog]});
	},
};