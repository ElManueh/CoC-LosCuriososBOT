import { SlashCommandBuilder, codeBlock } from 'discord.js';
import { databaseAll } from '../../src/services/database.js';
import { discordRoleAdmin } from '../../src/services/discord.js';
import mensajes from '../../src/locale.json' assert { type: 'json' };

export default {
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('consultardb')
        .setDescription('Realiza consultas a la base de datos. (Si no hay consulta muestra un menu de uso)')
        .addStringOption(option => option
            .setName('consulta')
            .setDescription('Consulta en formato SQL.')),
    async execute(interaction) {
        try {
            const databaseRequest = interaction.options.getString('consulta');
            let member = interaction.guild.members.cache.get(interaction.user.id);
            if (!member) member = await interaction.guild.members.fetch(interaction.user.id);
            if (!member.roles.cache.has(discordRoleAdmin)) return interaction.reply({ content: mensajes.discord.permisos_insuficientes, ephemeral: true });

            if (!databaseRequest) return interaction.reply({ content: mensajes.discord.menu_tabla, ephemeral: true });
            let databaseResponse = await databaseAll(databaseRequest);
            if (databaseResponse.length === 0) return interaction.reply({ content: 'No hay datos que coincidan con la busqueda.', ephemeral: true });

            let response = '';
            for (const column in databaseResponse[0]) response += `${column}`.padEnd(20);
            response += '\n\n';
            for (const user of databaseResponse) {
                for (const attribute in user) response += `${user[attribute]}`.padEnd(20);
                response += '\n';
            }

            if (response.length < 2000) return interaction.reply({ content: `${codeBlock(respuesta)}`, ephemeral: true });

            await interaction.reply({ content: 'Aqui viene la tabla grande', ephemeral: true });
            response = response.split('\n');
            
            let response2 = "";
            for (const line of response) {
                if (response2.length + line.length < 2000) response2 += line + '\n';
                else {
                    await interaction.followUp({ content: codeBlock(response2), ephemeral: true });
                    response2 = line + '\n';
                }
            }
            if (response2.length != 0) await interaction.followUp({ content: codeBlock(response2), ephemeral: true });
        } catch (error) { console.error(error); }
    }
};