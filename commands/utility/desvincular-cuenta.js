const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("./mybotdata.sqlite");
const { rangos } = require('../../src/datos.js');

module.exports = {
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('desvincular-cuenta')
        .setDescription('Desvincula tu cuenta de Clash Of Clans de Discord.'),
    async execute(interaction) {
        const usuario = interaction.user;
        const miembro = interaction.guild.members.cache.get(usuario.id);
		let solicitudDB, respuestaDB;

        // Creo la tabla si no existe
        solicitudDB = 'CREATE TABLE IF NOT EXISTS usuarios (discordID TEXT, cocTAG TEXT)';
        await db.run(solicitudDB);

        // Compruebo que el usuario se encuentra en la BBDD
        solicitudDB = 'SELECT * FROM usuarios WHERE discordID = ?';
        respuestaDB = await new Promise((resolve, reject) => {
            db.get(solicitudDB, `${usuario.id}`, (err, row) => {
                if (err) return console.error(err.message);
                return row ? resolve(true) : resolve(false);
            });
        });
        if (respuestaDB) {  // El usuario se encuentra en la BBDD y eliminamos su cocTAG
            solicitudDB = 'DELETE FROM usuarios WHERE discordID = ?';
            respuestaDB = await new Promise((resolve, reject) => {
                db.run(solicitudDB, `${usuario.id}`, function(err) {
                    if (err) return console.error(err.message);
                    resolve(true);
                });
            });
            if (respuestaDB) await interaction.reply({ content: 'Se te ha desvinculado correctamente de tu cuenta de ClashOfClans.', ephemeral: true });
            for (const rango in rangos) {
                if (miembro.roles.cache.has(rangos[rango])) await interaction.guild.members.cache.get(usuario.id).roles.remove(rangos[rango]);
            }
        } else {// El usuario no se encuentra en la BBDD
            await interaction.reply({ content: 'No te encuentras vinculado a ninguna cuenta de ClashOfClans.', ephemeral: true });
        }
    }
};