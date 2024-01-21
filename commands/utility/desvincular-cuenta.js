const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("./mybotdata.sqlite");

module.exports = {
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('desvincular-cuenta')
        .setDescription('Desvincula tu cuenta de Clash Of Clans de Discord.'),
    async execute(interaction) {
        const usuario = interaction.user;
		let solicitudDB;

        // Creo la tabla si no existe
        solicitudDB = 'CREATE TABLE IF NOT EXISTS usuarios (discordID TEXT, cocTAG TEXT)';
        await db.run(solicitudDB);

        // Compruebo que el usuario se encuentra en la BBDD
        solicitudDB = 'SELECT * FROM usuarios WHERE discordID = ?';
        db.get(solicitudDB, `${usuario.id}`, (err, row) => {
            if (err) return console.error(err.message);
            if (row) {    // El usuario se encuentra en la BBDD y eliminamos su cocTAG
                solicitudDB = 'DELETE FROM usuarios WHERE discordID = ?';
                db.run(solicitudDB, `${usuario.id}`, function(err) {
                    if (err) return console.error(err.message);
                    interaction.reply({ content: 'Se te ha desvinculado correctamente de tu cuenta de ClashOfClans.', ephemeral: true });
                });
            } else {    // El usuario no se encuentra en la BBDD
                interaction.reply({ content: 'No te encuentras vinculado a ninguna cuenta de ClashOfClans.', ephemeral: true });
            }
        });
    },
};