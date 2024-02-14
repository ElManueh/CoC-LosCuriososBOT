const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const clashofclansAPI = require('../../src/clashofclansAPI.js');
const comandosDB = require('../../src/comandosDB');
const datosDiscord = require('../../src/datosDiscord.js');
const discord = require('../../src/discord.js');
const mensajes = require('../../src/locale.json');

module.exports = {
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
		} catch (error) { return interaction.reply({ content: mensajes.error, ephemeral: true }); }

		try {	// Compruebo que el TAG existe
			usuarioAPI = await clashofclansAPI.obtenerUsuario(usuarioTag);
		} catch (error) { 
			await interaction.reply({ content: mensajes.clashofclans.tag_incorrecto, ephemeral: true });
			return interaction.followUp({ content: mensajes.clashofclans.vincular_ejemplo, ephemeral: true });
		}

		try {	// Compruebo que el token es valido
			let tokenValido = await clashofclansAPI.verificarTokenUsuario(usuarioTag, usuarioApi);
			if (!tokenValido) return interaction.reply({ content: mensajes.clashofclans.api_incorrecta, ephemeral: true });
		} catch (error) { 
			await interaction.reply({ content: mensajes.error, ephemeral: true });
			return interaction.followUp({ content: mensajes.clashofclans.vincular_ejemplo, ephemeral: true });
		}

		solicitudDB = `SELECT * FROM usuariosCOC WHERE tag = '${usuarioTag}'`;
		try {	// Compruebo que la cuenta de CoC no este vinculada a una cuenta de Discord
			usuarioDB = await comandosDB.solicitarDBget(solicitudDB);
			if (usuarioDB.length != 0 && usuarioDB.discordID != null) return interaction.reply({ content: mensajes.clashofclans.tag_ya_vinculado, ephemeral: true });
		} catch (error) { return interaction.reply({ content: mensajes.error, ephemeral: true }); }

		if (usuarioDB.length === 0)	// lo añado a la DB
			solicitudDB = `INSERT INTO usuariosCOC (discordID, tag, nombre, rango) VALUES ('${interaction.user.id}', '${usuarioAPI.tag}', '${usuarioAPI.name}', '${usuarioAPI.role}')`;
		else	// vinculamos el discordID con el tag
			solicitudDB = `UPDATE usuariosCOC set discordID = '${interaction.user.id}' WHERE tag = '${usuarioDB.tag}'`;

		try {
			await comandosDB.ejecutarDBrun(solicitudDB);
		} catch (error) { return interaction.reply({ content: mensajes.error, ephemeral: true }); }

		await interaction.reply({ content: mensajes.clashofclans.vinculado_ok, ephemeral: true });

		try {	// actualizamos el rango del usuario y su nombre
			await discord.cambiar_rango(interaction.user.id, usuarioAPI.role, interaction.guild);
			await discord.cambiar_nombre(interaction.user.id, usuarioAPI.name, interaction.guild);
		} catch (error) { console.error(`Error actualizando nombre/rango en Discord --> ${interaction.user.id}`); }

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
		
		const canal = interaction.guild.channels.cache.get(datosDiscord.canal_logs);
		canal.send({ embeds: [mensajeEmbedLog]});
	},
};