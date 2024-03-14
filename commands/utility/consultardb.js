import { SlashCommandBuilder, codeBlock } from 'discord.js';
import * as Database from '../../src/services/database.js';
import localeJSON from '../../src/locale.json' assert { type: 'json' };
import { writeConsoleANDLog } from '../../src/write.js';

const MAX_LENGTH_DISCORD_MESSAGE = 2000;
const COLUMN_PADDING_DEFAULT = 20;
const columnPadding = new Map([
  ['addCapital', 13],
  ['clanGames', 12],
  ['index', 5],
  ['lootCapital', 14],
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
  let tableSegment = '';
  for (const row of responseTable) {
    if (tableSegment.length + row.length < MAX_LENGTH_DISCORD_MESSAGE) tableSegment += row + '\n';
    else {
      await interaction.followUp({ content: codeBlock(tableSegment), ephemeral: true });
      tableSegment = row + '\n';
    }
  }
  if (tableSegment.length) await interaction.followUp({ content: codeBlock(tableSegment), ephemeral: true });
}

async function checkQuery(queryDatabase) {
  queryDatabase = queryDatabase.toLowerCase();
  const allowedPattern = /^\s*select\b/i;
  if (!allowedPattern.test(queryDatabase)) throw new Error('query not allowed');
}

export default {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('consultardb')
    .setDescription('Realiza consultas a la base de datos. (Si no hay consulta muestra un menu de uso)')
    .addStringOption((option) => option.setName('consulta').setDescription('Consulta en formato SQL.')),
  async execute(interaction) {
    const db = await Database.openConnection();
    try {
      const tableName = 'vista';
      const tableParameters = 'player, name, role, townHall, lootCapital, addCapital, clanGames, warPreference, warAttacks';

      const queryDatabase = interaction.options.getString('consulta');
      if (!queryDatabase) return interaction.reply({ content: `TableName: ${tableName}\nParameters: ${tableParameters}`, ephemeral: true });
      await checkQuery(queryDatabase);

      // aqui comprobar que solo se acceda a la vista y no a otras tablas (a no ser que sea yo)
      const query = ` CREATE TEMPORARY VIEW ${tableName} AS
                                SELECT ${tableParameters}
                                FROM PlayerClanData
                                INNER JOIN PlayerData ON PlayerClanData.player = PlayerData.tag
                                WHERE role != 'not_member'`;
      await Database.runCommand(db, query);
      const replyDatabase = await Database.getMultipleRow(db, queryDatabase);
      if (!replyDatabase.length) return interaction.reply({ content: localeJSON.database_result_not_found, ephemeral: true });

      const responseTable = await mountDataTable(replyDatabase);
      if (responseTable.length < MAX_LENGTH_DISCORD_MESSAGE) return interaction.reply({ content: `${codeBlock(responseTable)}`, ephemeral: true });

      await interaction.reply({ content: localeJSON.database_loading_data, ephemeral: true });
      await displayDataTable(responseTable, interaction);
    } catch (error) {
      await writeConsoleANDLog(error);
      await interaction.reply({ content: localeJSON.error_notify_in_discord, ephemeral: true });
    } finally {
      await Database.closeConnection(db);
    }
  }
};
