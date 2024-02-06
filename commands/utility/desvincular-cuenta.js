const { SlashCommandBuilder, EmbedBuilder, ReactionUserManager } = require('discord.js');
const datosDiscord = require('../../src/datosDiscord.js');
const comandosDB = require('../../src/comandosDB');
const fs = require('fs');
const mensaje = JSON.parse(fs.readFileSync('./src/locale.json', 'utf-8'));

module.exports = {
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('desvincular-cuenta')
        .setDescription('Desvincula tu cuenta de Clash Of Clans de Discord.'),
    async execute(interaction) {
        
        let usuarioDB, respuestaDB;
        let solicitudDB = `SELECT * FROM usuariosCOC WHERE discordID = ${interaction.user.id}`;
        await comandosDB.solicitarDBget(solicitudDB)    // comprobar si el usuario se encuentra vinculado
            .then(usuario => { if (!usuario) interaction.reply({ content: mensaje.clashofclans.no_vinculado, ephemeral:true }); else usuarioDB = usuario; })
            .catch(err => { console.error(err); interaction.reply({ content: mensaje.error, ephemeral: true }); });
        if (!usuarioDB) return;

        solicitudDB = `UPDATE usuariosCOC SET discordID = ${null} WHERE tag = '${usuarioDB.tag}'`;
        await comandosDB.ejecutarDBrun(solicitudDB) // lo desvinculamos de su cuenta
            .catch(err => { console.error(err); interaction.reply({ content: mensaje.error, ephemeral: true }); respuestaDB = true });
        if (respuestaDB) return;
        
        // ahora actualizamos su rango y nombre de Discord
        let miembro = interaction.guild.members.cache.get(interaction.user.id);
        if (!miembro) miembro = interaction.guild.members.fetch(interaction.user.id);
        for (const rango in datosDiscord.rangos) if (miembro.roles.cache.has(datosDiscord.rangos[rango])) miembro.roles.remove(datosDiscord.rangos[rango]); // quitamos rango

        if (miembro.nickname && miembro.id != interaction.guild.ownerId) miembro.setNickname(null); // reiniciamos nickname
        interaction.reply({ content: 'Se te ha desvinculado correctamente de tu cuenta de ClashOfClans.', ephemeral: true });

        const mensajeEmbedLog = new EmbedBuilder()
            .setColor(0xFF0000)
            .addFields(
                { name: 'Discord', value: `${interaction.user.tag}`, inline: true },
                { name: 'Nombre CoC', value: `${usuarioDB.nombre}`, inline: true },
                { name: 'Tag CoC', value: `${usuarioDB.tag}`, inline: true },
            )
            .setTimestamp()
            .setFooter({ text: `${interaction.user.id}`, iconURL: `${interaction.user.avatarURL()}` });
		
		const canal = interaction.guild.channels.cache.get(datosDiscord.canal_logs);
		canal.send({ embeds: [mensajeEmbedLog]});
    }
};