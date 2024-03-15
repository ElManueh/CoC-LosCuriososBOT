import { SlashCommandBuilder } from 'discord.js';
import * as Controller from '../../src/controller.js';
import * as ControllerStatus from '../../src/controller-status.js';
import localeJSON from '../../src/locale.json' assert { type: 'json' };

export default {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('untrack-clan')
    .setDescription('Desvincula tu clan.')
    .addStringOption((option) => option.setName('clan-tag').setDescription('Este es el TAG del clan.').setRequired(true)),
  async execute(interaction) {
    try {
      const optionClanTag = interaction.options.getString('clan-tag');

      await interaction.deferReply({ ephemeral: true });
      const response = await Controller.untrackClan(optionClanTag, interaction.guild.id);
      switch (response) {
        case ControllerStatus.TAG_INCORRECT:
          return await interaction.editReply({ content: localeJSON.clashofclans_tag_incorrect, ephemeral: true });
        case ControllerStatus.UNTRACKED_FAIL:
          return await interaction.editReply({ content: localeJSON.clashofclans_clan_untracked_fail, ephemeral: true });
        case ControllerStatus.UNTRACKED_OK:
          return await interaction.editReply({ content: localeJSON.clashofclans_clan_untracked_ok, ephemeral: true });
      }
    } catch (error) {
      await interaction.editReply({ content: localeJSON.error_notify_in_discord, ephemeral: true });
    }
  }
};
