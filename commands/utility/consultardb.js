import { SlashCommandBuilder, codeBlock } from 'discord.js';
import { allDatabase, closeConnectionDatabase, openConnectionDatabase, runDatabase } from '../../src/services/database.js';
import mensajes from '../../src/locale.json' assert { type: 'json' };
import { writeConsoleANDLog } from '../../src/write.js';

const MAX_LENGTH_DISCORD_MESSAGE = 2000;
const COLUMN_PADDING_DEFAULT = 20;
const columnPadding = new Map([
    ['index', 5],
    ['name', 17],
    ['player', 13],
    ['role', 13],
    ['townHall', 11],
    ['warAttacks', 27],
    ['warPreference', 16]
]);

async function mountDataTable(replyDatabase) {
    let responseTable = ' '.repeat(columnPadding.get('index'));
    for (const column in replyDatabase[0]) responseTable += `${column}`.padEnd(columnPadding.get(`${column}`) || COLUMN_PADDING_DEFAULT);
    responseTable += '\n\n';
    
    let countRow = 0;
    for (const user of replyDatabase) {
        responseTable += `${++countRow}`.padEnd(columnPadding.get('index'));
        for (const attribute in user) responseTable += `${user[attribute]}`.padEnd(columnPadding.get(`${attribute}`) || COLUMN_PADDING_DEFAULT);
        responseTable += '\n';
    }
    return responseTable;
}

async function displayDataTable(responseTable, interaction) {
    responseTable = responseTable.split('\n');
    let tableSegment = "";
    for (const row of responseTable) {
        if (tableSegment.length + row.length < MAX_LENGTH_DISCORD_MESSAGE) tableSegment += row + '\n';
        else {
            await interaction.followUp({ content: codeBlock(tableSegment), ephemeral: true });
            tableSegment = row + '\n';
        }
    }
    if (tableSegment.length) await interaction.followUp({ content: codeBlock(tableSegment), ephemeral: true });
}

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
            const tableName = 'vista';
            const tableParameters = 'player, name, role, townHall, warPreference, warAttacks';
            
            const queryDatabase = interaction.options.getString('consulta');
            if (!queryDatabase) return interaction.reply({ content: `TableName: ${tableName}\nParameters: ${tableParameters}`, ephemeral: true });
            
            // aqui comprobar que solo se acceda a la vista y no a otras tablas (a no ser que sea yo)
            
            const query = ` CREATE TEMPORARY VIEW ${tableName} AS
                                SELECT ${tableParameters}
                                FROM PlayerClanData
                                INNER JOIN PlayerData ON PlayerClanData.player = PlayerData.tag`;
            await runDatabase(db, query);
            const replyDatabase = await allDatabase(db, queryDatabase);
            if (!replyDatabase.length) return interaction.reply({ content: 'No hay datos que coincidan con la busqueda.', ephemeral: true });
            
            const responseTable = await mountDataTable(replyDatabase);
            if (responseTable.length < MAX_LENGTH_DISCORD_MESSAGE) return interaction.reply({ content: `${codeBlock(responseTable)}`, ephemeral: true });

            await interaction.reply({ content: 'Loading information', ephemeral: true });
            await displayDataTable(responseTable, interaction);
        } catch (error) { 
            await writeConsoleANDLog(error);
            await interaction.reply({ content: mensajes.error.notificar, ephemeral: true });
        } finally {
            await closeConnectionDatabase(db);
        }
    }
};