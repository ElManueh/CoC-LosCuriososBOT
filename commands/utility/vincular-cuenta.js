import { SlashCommandBuilder } from 'discord.js';
import * as Controller from '../../src/controller.js';
import * as ControllerStatus from '../../src/controller-status.js';
import localeJSON from '../../src/locale.json' assert { type: 'json' };

export default {
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('vincular-cuenta')
    .setDescription('Vincula tu cuenta de Clash Of Clans a Discord.')
    .addStringOption((option) => option.setName('usuario-tag').setDescription('Este es el TAG de tu cuenta de Clash Of Clans.').setRequired(true))
    .addStringOption((option) => option.setName('codigo-api').setDescription('Este es el codigo API de tu cuenta de Clash Of Clans.').setRequired(true)),
  async execute(interaction) {
    try {
      const optionPlayerTag = interaction.options.getString('usuario-tag');
      const optionPlayerToken = interaction.options.getString('codigo-api');

      await interaction.deferReply({ ephemeral: true });
      const response = await Controller.linkAccount(optionPlayerTag, optionPlayerToken, interaction.user.id);
      switch (response) {
        case ControllerStatus.TAG_INCORRECT:
          return await interaction.editReply({ content: localeJSON.clashofclans_tag_incorrect, ephemeral: true });
        case ControllerStatus.TOKEN_INCORRECT:
          return await interaction.editReply({ content: localeJSON.clashofclans_token_incorrect, ephemeral: true });
        case ControllerStatus.LINK_ACCOUNT_FAIL:
          return await interaction.editReply({ content: localeJSON.clashofclans_account_linked_fail, ephemeral: true });
        case ControllerStatus.LINK_ACCOUNT_OK:
          return await interaction.editReply({ content: localeJSON.clashofclans_account_linked_ok, ephemeral: true });
        default:
          throw response;
      }
    } catch (error) {
      await interaction.editReply({ content: localeJSON.error_notify_in_discord, ephemeral: true });
    }
  }
};
