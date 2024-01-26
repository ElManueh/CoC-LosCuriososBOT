const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const archivoClashOfClansAPI = require('../../src/clashofclansAPI.js');
const archivoDatosDiscord = require('../../src/datosDiscord.js');
const archivoDB = require('../../src/basededatos.js');
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
		let solicitudDB, respuestaDB;

		try {	// Compruebo que el usuario no se encuentre vinculado a otra cuenta de clashofclans
			solicitudDB = 'SELECT * FROM usuarios WHERE discordID = ?';
			respuestaDB = await archivoDB.solicitarDB1Parametro(solicitudDB, interaction.user.id);
			if (respuestaDB) return await interaction.reply({ content: mensaje.clashofclans.discord_ya_vinculado, ephemeral: true });
		} catch (error) {
			console.log('Error consulta DB.\n' + error);
			return await interaction.reply({ content: mensaje.error, ephemeral: true });
		}

		// Compruebo que el TAG existe
		if (!await archivoClashOfClansAPI.existeUsuarioTag(usuarioTag)) return await interaction.reply({ content: mensaje.clashofclans.tag_incorrecto, ephemeral: true });

		// Compruebo que el token es valido
		if (!await archivoClashOfClansAPI.verificarToken(usuarioTag, usuarioApi)) return interaction.reply({ content: mensaje.clashofclans.api_incorrecta, ephemeral: true });

		try {	// Compruebo que el TAG no este asignado a otro usuario
			solicitudDB = 'SELECT * FROM usuarios WHERE cocTAG = ?';
			respuestaDB = await archivoDB.solicitarDB1Parametro(solicitudDB, usuarioTag);
			if (respuestaDB) return await interaction.reply({ content: mensaje.clashofclans.tag_ya_vinculado, ephemeral: true });
		} catch (error) {
			console.log('Error consulta DB.\n' + error);
			return await interaction.reply({ content: mensaje.error, ephemeral: true });
		}

		try {	// Vinculamos el usuario con el TAG
			solicitudDB = 'INSERT INTO usuarios (discordID, cocTAG) VALUES (?, ?)';
			respuestaDB = await archivoDB.ejecutarDB2Parametro(solicitudDB, interaction.user.id, usuarioTag);
			if (!respuestaDB) return await interaction.reply({ content: mensaje.error, ephemeral: true });
		} catch (error) {
			console.log('Error inserción DB.\n' + error);
			return await interaction.reply({ content: mensaje.error, ephemeral: true });
		}

		// ==========================
		// ==== TODO HA IDO BIEN ====
		// ==========================
		let roleID;
		try {	// asignamos el role correspondiente
			roleID = archivoDatosDiscord.rangos[await archivoClashOfClansAPI.obtenerUsuarioRol(usuarioTag)];
		} catch (error) {
			console.log('Error obtiendo el rol en la API.\n' + error);
			return interaction.reply({ content: mensaje.error, ephemeral: true });
		}
		
		let miembro = interaction.guild.members.cache.get(interaction.user.id);
		if (!miembro) miembro = interaction.guild.members.fetch(interaction.user.id);
		miembro.roles.add(roleID);

		let nombreCOC;
        try {
            nombreCOC = await archivoClashOfClansAPI.obtenerUsuarioNombre(usuarioTag);
        } catch (error) {
            console.error('Error obteniendo el nombre en la API.\n' + error);
            return await interaction.reply({ content: mensaje.error, ephemeral: true });
        }

		await interaction.reply({ content: mensaje.clashofclans.vinculado_ok, ephemeral: true });
        if (interaction.guild.ownerId == interaction.user.id)
			await interaction.followUp({ content: mensaje.discord.modificar_nombre_owner, ephemeral: true });
		else
			await miembro.setNickname(nombreCOC);
        
		const mensajeEmbedLog = new EmbedBuilder()
            .setColor(0x00FF00)
            .addFields(
                { name: 'Discord', value: `${interaction.user.tag}`, inline: true },
                { name: 'Nombre CoC', value: `${nombreCOC}`, inline: true },
                { name: 'Tag CoC', value: `${usuarioTag}`, inline: true },
            )
            .setTimestamp()
            .setFooter({ text: `${interaction.user.id}`, iconURL: `${interaction.user.avatarURL()}` });
		
		const canal = interaction.guild.channels.cache.get(archivoDatosDiscord.canal_logs);
		canal.send({ embeds: [mensajeEmbedLog]});
	},
};