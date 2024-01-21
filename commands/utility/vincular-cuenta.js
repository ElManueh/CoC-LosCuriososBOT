const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { existeUsuarioTAG } = require('../../clashofclansAPI.js');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("./mybotdata.sqlite");

module.exports = {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('vincular-cuenta')
		.setDescription('Vincula tu cuenta de Clash Of Clans a Discord.')
		.addStringOption(option => option
			.setName('tag')
			.setDescription('Este es el TAG de tu cuenta de Clash Of Clans.')
			.setRequired(true)),
	async execute(interaction) {
		const usuarioTAG = interaction.options.getString('tag');
		const canal = interaction.client.channels.cache.get('1198348572861673542');
		const usuario = interaction.user;
		let solicitudDB, respuestaDB;

		// Compruebo que el TAG existe
		if (!await existeUsuarioTAG(usuarioTAG)) return interaction.reply({ content: 'El TAG proporcionado no es correcto.', ephemeral: true });

		// Creo la tabla si no existe
		solicitudDB = 'CREATE TABLE IF NOT EXISTS usuarios (discordID TEXT, cocTAG TEXT)';
		await db.run(solicitudDB);

		// Compruebo que el usuario no se encuentre vinculado a otra cuenta
		solicitudDB = 'SELECT * FROM usuarios WHERE discordID = ?';
		respuestaDB = await new Promise((resolve, reject) => {
			db.get(solicitudDB, `${usuario.id}`, (err, row) => {
				if (err) reject(err.message);
				resolve(row);
			});
		});
		if (respuestaDB) { // El usuario se encuentra en la BBDD
			return interaction.reply({ content: 'Tu cuenta de Discord se encuentra vinculada ya a una cuenta de ClashOfClans.\n' +
												'Desvinculate de la anterior antes de volver a vincularte a otra cuenta.', ephemeral: true });
		}
		
		// Compruebo que el TAG no este asignado a otro usuario
		solicitudDB = 'SELECT * FROM usuarios WHERE cocTAG = ?';
		respuestaDB = await new Promise((resolve, reject) => {
			db.get(solicitudDB, `${usuarioTAG}`, (err, row) => {
				if (err) reject(err.message);
				resolve(row);
			});
		});
		if (respuestaDB) {	// El TAG ya esta asignado a otro usuario
			return interaction.reply({ content: 'El TAG ya se encuentra asignado en otro usuario. Contacte con un moderador.', ephemeral: true });
		}

		// Vinculamos al usuario con el TAG
		solicitudDB = 'INSERT INTO usuarios (discordID, cocTAG) VALUES (?, ?)';
		respuestaDB = await new Promise((resolve, reject) => {
			db.run(solicitudDB, `${usuario.id}`, `${usuarioTAG}`, function(err) {
				if (err) reject(err.message);
				interaction.reply({ content: 'Se te ha vinculado correctamente a la cuenta de ClashOfClans.', ephemeral: true });
			})
		})
		
		// HAY QUE ASIGNAR ROLES Y ACTUALIZAR NOMBRE

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