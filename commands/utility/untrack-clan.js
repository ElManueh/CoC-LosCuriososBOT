import { SlashCommandBuilder } from 'discord.js';
import * as ClashofClansAPI from '../../src/services/clashofclansAPI.js';
import * as Database from '../../src/services/database.js';
import localeJSON from '../../src/locale.json' assert { type: 'json' };
import { writeConsoleANDLog } from '../../src/write.js';
import { ClashOfClansError } from '../../src/errorCreate.js';

export default {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('untrack-clan')
    .setDescription('Desvincula tu clan.')
    .addStringOption((option) => option.setName('clan-tag').setDescription('Este es el TAG del clan.').setRequired(true)),
  async execute(interaction) {
    const db = await Database.openConnection();
    try {
      let optionClanTag = interaction.options.getString('clan-tag');
      let clan = await ClashofClansAPI.getClan(optionClanTag);

      await Database.runCommand(db, 'BEGIN IMMEDIATE');
      let queryDatabase = await Database.getSingleRow(db, `SELECT * FROM GuildConnections WHERE guildId = '${interaction.guild.id}' AND clan = '${clan.tag}'`);
      if (!queryDatabase) return interaction.reply({ content: localeJSON.clashofclans_clan_untracked_fail, ephemeral: true });

      await Database.runCommand(db, `DELETE FROM GuildConnections WHERE guildId = '${interaction.guild.id}' AND clan = '${clan.tag}'`);
      await interaction.reply({ content: localeJSON.clashofclans_clan_untracked_ok, ephemeral: true });
      await Database.runCommand(db, 'COMMIT');
    } catch (error) {
      await Database.runCommand(db, 'ROLLBACK');
      await writeConsoleANDLog(error);
      if (error instanceof ClashOfClansError) {
        if (error.errno === 404) return interaction.reply({ content: localeJSON.clashofclans_tag_incorrect, ephemeral: true });
      }
      await interaction.reply({ content: localeJSON.error_notify_in_discord, ephemeral: true });
    } finally {
      await Database.closeConnection(db);
    }
  }
};
