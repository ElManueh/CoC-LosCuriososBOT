import { Events } from 'discord.js';
import mensajes from '../src/locale.json' assert { type: 'json' };

export default {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			console.log(`[+] ${interaction.user.tag}: ${interaction.commandName}`);
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: mensajes.error.notificar, ephemeral: true });
			} else {
				await interaction.reply({ content: mensajes.error.notificar, ephemeral: true });
			}
		}
	},
};