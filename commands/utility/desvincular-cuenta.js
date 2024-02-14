const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const datosDiscord = require('../../src/datosDiscord.js');
const comandosDB = require('../../src/comandosDB');
const discord = require('../../src/discord.js');
const mensajes = require('../../src/locale.json');

module.exports = {
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('desvincular-cuenta')
        .setDescription('Desvincula tu cuenta de Clash Of Clans de Discord.'),
    async execute(interaction) {
        let usuarioDB;

        let solicitudDB = `SELECT * FROM usuariosCOC WHERE discordID = ${interaction.user.id}`;
        try {   // comprobar si el usuario se encuentra vinculado
            usuarioDB = await comandosDB.solicitarDBget(solicitudDB);
            if (!usuarioDB) return interaction.reply({ content: mensajes.clashofclans.no_vinculado, ephemeral:true });
        } catch (error) { return interaction.reply({ content: mensajes.error, ephemeral: true }); }

        solicitudDB = `UPDATE usuariosCOC SET discordID = ${null} WHERE tag = '${usuarioDB.tag}'`;
        try {   // lo desvinculamos de su cuenta
            await comandosDB.ejecutarDBrun(solicitudDB);
        } catch (error) { return interaction.reply({ content: mensajes.error, ephemeral: true }); }

        try {   // ahora actualizamos su rango y nombre de Discord
            await discord.cambiar_rango(interaction.user.id, null, interaction.guild);
            await discord.cambiar_nombre(interaction.user.id, null, interaction.guild);
        } catch (error) { return console.error(`Error actualizando nombre y rango en Discord --> ${interaction.user.id}`); }

        await interaction.reply({ content: mensajes.clashofclans.desvinculado_ok, ephemeral: true });

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