const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const archivoClashOfClansAPI = require('../../src/clashofclansAPI.js');
const archivoDatosDiscord = require('../../src/datosDiscord.js');
const archivoDB = require('../../src/comandosDB.js');
const fs = require('fs');
const mensaje = JSON.parse(fs.readFileSync('./src/locale.json', 'utf-8'));

module.exports = {
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('desvincular-cuenta')
        .setDescription('Desvincula tu cuenta de Clash Of Clans de Discord.'),
    async execute(interaction) {
        let usuarioTag;
		let solicitudDB, respuestaDB;
        try {   // Compruebo que el usuario se encuentra en la BBDD
            solicitudDB = 'SELECT * FROM usuarios WHERE discordID = ?';
            respuestaDB = await archivoDB.solicitarDB1Parametro(solicitudDB, interaction.user.id);
            if (!respuestaDB) return interaction.reply({ content: mensaje.clashofclans.no_vinculado, ephemeral:true });
            usuarioTag = respuestaDB.cocTAG;
        } catch (error) {
            console.log('Error consulta DB.\n' + error);
            return interaction.reply({ content: mensaje.error, ephemeral: true });
        }

        try {   // El usuario se encuentra en la BBDD y eliminamos su cocTAG
            solicitudDB = 'DELETE FROM usuarios WHERE discordID = ?';
            await archivoDB.ejecutarDB1Parametro(solicitudDB, interaction.user.id);          
        } catch (error) {
            console.log('Error eliminación DB.\n' + error);
            return interaction.reply({ content: mensaje.error, ephemeral:true });
        }

        let miembro = interaction.guild.members.cache.get(interaction.user.id);
        if (!miembro) miembro = interaction.guild.members.fetch(interaction.user.id);
        for (const rango in archivoDatosDiscord.rangos) if (miembro.roles.cache.has(archivoDatosDiscord.rangos[rango])) miembro.roles.remove(archivoDatosDiscord.rangos[rango]);

        if (miembro.nickname && miembro.id != interaction.guild.ownerId) miembro.setNickname(null);
        interaction.reply({ content: 'Se te ha desvinculado correctamente de tu cuenta de ClashOfClans.', ephemeral: true });

        let nombreCOC;
        try {
            nombreCOC = await archivoClashOfClansAPI.obtenerUsuarioNombre(usuarioTag);
        } catch (error) {
            console.error('Error obteniendo el nombre en la API.\n' + error);
            return await interaction.reply({ content: mensaje.error, ephemeral: true });
        }

        const mensajeEmbedLog = new EmbedBuilder()
            .setColor(0xFF0000)
            .addFields(
                { name: 'Discord', value: `${interaction.user.tag}`, inline: true },
                { name: 'Nombre CoC', value: `${nombreCOC}`, inline: true },
                { name: 'Tag CoC', value: `${usuarioTag}`, inline: true },
            )
            .setTimestamp()
            .setFooter({ text: `${interaction.user.id}`, iconURL: `${interaction.user.avatarURL()}` });
		
		const canal = interaction.guild.channels.cache.get(archivoDatosDiscord.canal_logs);
		canal.send({ embeds: [mensajeEmbedLog]});
    }
};