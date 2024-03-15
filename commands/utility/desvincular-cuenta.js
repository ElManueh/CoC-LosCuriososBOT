import { SlashCommandBuilder } from 'discord.js';
import * as Controller from '../../src/controller.js';
import * as ControllerStatus from '../../src/controller-status.js';
import localeJSON from '../../src/locale.json' assert { type: 'json' };

export default {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('desvincular-cuenta')
    .setDescription('Desvincula tu cuenta de Clash Of Clans de Discord.')
    .addStringOption((option) => option.setName('player-tag').setDescription('tag').setRequired(true)),
  async execute(interaction) {
    try {
      const optionPlayerTag = interaction.options.getString('player-tag');

      await interaction.deferReply({ ephemeral: true });
      const response = await Controller.unlinkAccount(optionPlayerTag, interaction.user.id);
      switch (response) {
        case ControllerStatus.TAG_INCORRECT:
          return await interaction.editReply({ content: localeJSON.clashofclans_tag_incorrect, ephemeral: true });
        case ControllerStatus.UNLINK_ACCOUNT_FAIL:
          return await interaction.editReply({ content: localeJSON.clashofclans_account_unlinked_fail, ephemeral: true });
        case ControllerStatus.UNLINK_ACCOUNT_OK:
          return await interaction.editReply({ content: localeJSON.clashofclans_account_unlinked_ok, ephemeral: true });
      }
    } catch (error) {
      await interaction.editReply({ content: localeJSON.error_notify_in_discord, ephemeral: true });
    }
  }
};
