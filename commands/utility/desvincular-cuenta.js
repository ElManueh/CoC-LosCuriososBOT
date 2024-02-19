import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { databaseGet, databaseAll, databaseRun } from '../../src/services/database.js';
import { discordNameUpdate, discordRoleUpdate } from '../../src/services/discord.js';
import mensajes from '../../src/locale.json' assert { type: 'json' };

export default {
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
        } catch (error) { throw mensajes.error.data_base + ' Obtener usuario.'; }

        solicitudDB = `UPDATE usuariosCOC SET discordID = ${null} WHERE tag = '${usuarioDB.tag}'`;
        try {   // lo desvinculamos de su cuenta
            await comandosDB.ejecutarDBrun(solicitudDB);
        } catch (error) { throw mensajes.error.data_base + ' Eliminar usuario.'; }

        try {   // actualizamos su rango de discord
            await discord.cambiar_rango(interaction.user.id, null, interaction.guild);
        } catch (error) { console.error(mensajes.error.discord + ' Actualizando rango.'); }

        try {   // actualizamos su nombre de discord
            await discord.cambiar_nombre(interaction.user.id, null, interaction.guild);
        } catch (error) { console.error(mensajes.error.discord + ' Actualizando nombre.'); }

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
		
		const canal = interaction.guild.channels.cache.get(discord.canal_logs);
		await canal.send({ embeds: [mensajeEmbedLog]});
    }
};