const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { existeUsuarioTag, verificarToken, obtenerUsuarioRol } = require('../../src/clashofclansAPI.js');
const { rangos } = require('../../src/datos.js');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("./mybotdata.sqlite");

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
		const canal = interaction.client.channels.cache.get('1198348572861673542');
		const usuario = interaction.user;
		let solicitudDB, respuestaDB;

		// Creo la tabla si no existe
		solicitudDB = 'CREATE TABLE IF NOT EXISTS usuarios (discordID TEXT, cocTAG TEXT)';
		await db.run(solicitudDB);

		// Compruebo que el usuario no se encuentre vinculado a otra cuenta de clashofclans
		solicitudDB = 'SELECT * FROM usuarios WHERE discordID = ?';
		respuestaDB = await new Promise((resolve, reject) => {
			db.get(solicitudDB, `${usuario.id}`, (err, row) => {
				if (err) reject(err.message);
				resolve(row);
			});
		});
		if (respuestaDB) return await interaction.reply({ content: 'Tu cuenta de Discord se encuentra vinculada ya a una cuenta de ClashOfClans.\n' +
															  'Desvinculate de la anterior antes de volver a vincularte a otra cuenta.', ephemeral: true });

		// Compruebo que el TAG existe
		if (!await existeUsuarioTag(usuarioTag)) return await interaction.reply({ content: 'El TAG proporcionado no existe.', ephemeral: true });

		// Compruebo que el token es valido
		if (!await verificarToken(usuarioTag, usuarioApi)) return interaction.reply({ content: 'La API proporcionada no es correcta o ya ha caducado.', ephemeral: true });

		// Compruebo que el TAG no este asignado a otro usuario
		solicitudDB = 'SELECT * FROM usuarios WHERE cocTAG = ?';
		respuestaDB = await new Promise((resolve, reject) => {
			db.get(solicitudDB, `${usuarioTag}`, (err, row) => {
				if (err) reject(err.message);
				resolve(row);
			});
		});
		if (respuestaDB) return await interaction.reply({ content: 'El TAG ya se encuentra asignado en otro usuario. Contacte con un moderador.', ephemeral: true });

		// Vinculamos al usuario con el TAG
		solicitudDB = 'INSERT INTO usuarios (discordID, cocTAG) VALUES (?, ?)';
		respuestaDB = await new Promise((resolve, reject) => {
			db.run(solicitudDB, `${usuario.id}`, `${usuarioTag}`, function(err) {
				if (err) reject(err.message);
				resolve(true);
			})
		})
		if (!respuestaDB) return await interaction.reply({ content: 'ERROR', ephemeral: true });
		
		// TODO HA IDO BIEN
		interaction.reply({ content: 'Se te ha vinculado correctamente a la cuenta de ClashOfClans.', ephemeral: true });

		const roleID = rangos[await obtenerUsuarioRol(usuarioTag)];
		await interaction.guild.members.cache.get(usuario.id).roles.add(roleID);

		return;

		// si todo va bien
		const mensajeEmbed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setAuthor({ name: `${usuario.id}`, iconURL: `${usuario.avatarURL()}` })
			.addFields(
				{ name: 'Nombre', value: `${usuario.tag}`, inline: true },
				{ name: 'ID', value: `${usuario.id}`, inline: true},
				{ name: 'Tag CoC', value: `${usuarioTAG}`, inline: true },
			)
			.setTimestamp()
			.setFooter({ text: `${usuario.id}`, iconURL: `${usuario.avatarURL()}` });

		//await canal.send({ embeds: [mensajeEmbed] });
		//await interaction.reply({ content: 'no se que poner', ephemeral: true });
	},
};