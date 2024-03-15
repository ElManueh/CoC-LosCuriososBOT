import { SlashCommandBuilder, codeBlock } from 'discord.js';
import * as Controller from '../../src/controller.js';
import * as ControllerStatus from '../../src/controller-status.js';
import localeJSON from '../../src/locale.json' assert { type: 'json' };

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

export default {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('consultardb')
    .setDescription('Realiza consultas a la base de datos. (Si no hay consulta muestra un menu de uso)')
    .addStringOption((option) => option.setName('consulta').setDescription('Consulta en formato SQL.')),
  async execute(interaction) {
    try {
      const queryDatabase = interaction.options.getString('consulta');

      await interaction.deferReply({ ephemeral: true });
      const response = await Controller.queryDatabase(queryDatabase);
      switch (response[0]) {
        case ControllerStatus.QUERY_DB_INFO:
          return await interaction.editReply({ content: response[1], ephemeral: true });
        case ControllerStatus.QUERY_DB_FAIL:
          return await interaction.editReply({ content: localeJSON.database_query_incorrect, ephemeral: true });
        case ControllerStatus.QUERY_DB_OK:
          if (!response[1].length) return await interaction.editReply({ content: localeJSON.database_result_not_found, ephemeral: true });
      }

      const responseTable = await mountDataTable(response[1]);
      if (responseTable.length < MAX_LENGTH_DISCORD_MESSAGE) return interaction.editReply({ content: codeBlock(responseTable), ephemeral: true });

      await interaction.editReply({ content: localeJSON.database_loading_data, ephemeral: true });
      await displayDataTable(responseTable, interaction);
    } catch (error) {
      await interaction.editReply({ content: localeJSON.error_notify_in_discord, ephemeral: true });
    }
  }
};
