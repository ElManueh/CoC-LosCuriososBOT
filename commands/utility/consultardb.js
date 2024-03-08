import { SlashCommandBuilder, codeBlock } from 'discord.js';
import { allDatabase, closeConnectionDatabase, openConnectionDatabase, runDatabase } from '../../src/services/database.js';
import { discordRoleAdmin } from '../../src/services/discord.js';
import mensajes from '../../src/locale.json' assert { type: 'json' };
import { writeConsoleANDLog } from '../../src/write.js';

const columnPadding = new Map([
    ['index', 5],
    ['name', 17],
    ['player', 13],
    ['role', 12],
    ['townHall', 11],
    ['warAttacks', 27],
    ['warPreference', 16]
]);

export default {
    category: 'utility',
    data: new SlashCommandBuilder()
        .setName('consultardb')
        .setDescription('Realiza consultas a la base de datos. (Si no hay consulta muestra un menu de uso)')
        .addStringOption(option => option
            .setName('consulta')
            .setDescription('Consulta en formato SQL.')),
    async execute(interaction) {
        const db = await openConnectionDatabase();
        try {
            const databaseRequest = interaction.options.getString('consulta');
            let member = interaction.guild.members.cache.get(interaction.user.id);
            if (!member) member = await interaction.guild.members.fetch(interaction.user.id);
            if (!member.roles.cache.has(discordRoleAdmin)) return interaction.reply({ content: mensajes.discord.permisos_insuficientes, ephemeral: true });

            if (!databaseRequest) return interaction.reply({ content: mensajes.discord.menu_tabla, ephemeral: true });
            const nameView = 'vista';
            const query = ` CREATE TEMPORARY VIEW ${nameView} 
                            AS
                            SELECT player, name, role, townHall, warPreference, warAttacks
                            FROM PlayerClanData
                            INNER JOIN PlayerData ON PlayerClanData.player = PlayerData.tag`;
            await runDatabase(db, query);
            let databaseResponse = await allDatabase(db, databaseRequest);
            if (databaseResponse.length === 0) return interaction.reply({ content: 'No hay datos que coincidan con la busqueda.', ephemeral: true });
            let response = ' '.repeat(columnPadding.get('index'));
            for (const column in databaseResponse[0]) response += `${column}`.padEnd(columnPadding.get(`${column}`));
            response += '\n\n';
            let count = 0;
            for (const user of databaseResponse) {
                response += `${++count}`.padEnd(columnPadding.get('index'));
                for (const attribute in user) response += `${user[attribute]}`.padEnd(columnPadding.get(`${attribute}`));
                response += '\n';
            }

            if (response.length < 2000) return interaction.reply({ content: `${codeBlock(response)}`, ephemeral: true });

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
            await closeConnectionDatabase(db);
        } catch (error) { 
            await closeConnectionDatabase(db);
            await writeConsoleANDLog(error);
            await interaction.reply({ content: mensajes.error.notificar, ephemeral: true });
        }
    }
};