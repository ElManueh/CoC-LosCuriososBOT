const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const clashofclansAPI = require('../../src/clashofclansAPI.js');
const comandosDB = require('../../src/comandosDB');
const datosDiscord = require('../../src/datosDiscord.js');
const fs = require('fs');
const mensaje = JSON.parse(fs.readFileSync('./src/locale.json', 'utf-8'));

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
		try {	// compruebo que el usuario no se encuentre vinculado a otra cuenta de clashofclans
			usuarioDB = await comandosDB.solicitarDBget(solicitudDB);
			if (usuarioDB) return interaction.reply({ content: mensaje.clashofclans.discord_ya_vinculado, ephemeral: true });
		} catch (error) {
			console.error(error); return interaction.reply({ content: mensaje.error, ephemeral: true });
		}

		try {	// Compruebo que el TAG existe
			usuarioAPI = await clashofclansAPI.obtenerUsuario(usuarioTag);
		} catch (error) {
			console.error(error); return interaction.reply({ content: mensaje.clashofclans.tag_incorrecto, ephemeral: true });
		}

		try {	// Compruebo que el token es valido
			let tokenValido = await clashofclansAPI.verificarTokenUsuario(usuarioTag, usuarioApi);
			if (!tokenValido) return interaction.reply({ content: mensaje.clashofclans.api_incorrecta, ephemeral: true });
		} catch (error) {
			console.error(error); return interaction.reply({ content: mensaje.error, ephemeral: true });
		}

		solicitudDB = `SELECT * FROM usuariosCOC WHERE tag = '${usuarioTag}'`;
		try {	// compruebo que la cuenta de CoC no este vinculada a una cuenta de Discord
			usuarioDB = await comandosDB.solicitarDBget(solicitudDB);
			if (usuarioDB.length != 0 && usuarioDB.discordID != null) return interaction.reply({ content: mensaje.clashofclans.tag_ya_vinculado, ephemeral: true });
		} catch (error) {
			console.error(error); return interaction.reply({ content: mensaje.error, ephemeral: true });
		}

		if (usuarioDB.length == 0)	// lo añado a la DB
			solicitudDB = `INSERT INTO usuariosCOC (discordID, tag, nombre, rango) VALUES ('${interaction.user.id}', '${usuarioAPI.tag}', '${usuarioAPI.name}', '${usuarioAPI.role}')`;
		else	// vinculamos el discordID con el tag
			solicitudDB = `UPDATE usuariosCOC set discordID = '${interaction.user.id}' WHERE tag = '${usuarioDB.tag}'`;

		try {
			await comandosDB.ejecutarDBrun(solicitudDB);
		} catch (error) {
			console.error(error); return interaction.reply({ content: mensaje.error, ephemeral: true });
		}

		interaction.reply({ content: mensaje.clashofclans.vinculado_ok, ephemeral: true });

		// actualizamos el rango del usuario
		let roleID = datosDiscord.rangos[usuarioAPI.role];
		let miembro = interaction.guild.members.cache.get(interaction.user.id);
		if (!miembro) miembro = interaction.guild.members.fetch(interaction.user.id);
		await miembro.roles.add(roleID);

		// actualizamos el nombre del usuario
        if (interaction.guild.ownerId == interaction.user.id)
			interaction.followUp({ content: mensaje.discord.modificar_nombre_owner, ephemeral: true });
		else
			await miembro.setNickname(usuarioAPI.name);
        
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