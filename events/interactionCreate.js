import { Events } from 'discord.js';
import mensajes from '../src/locale.json' assert { type: 'json' };

function getCurrentDateTime() {
    const now = new Date();
    
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();

    const hour = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const formattedDate = `${day}/${month}/${year}`;
    const formattedTime = `${hour}:${minutes}:${seconds}`;

    return `[${formattedDate}][${formattedTime}]`;
}

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
			let messageLog = `${getCurrentDateTime()} [+] ${interaction.user.tag}: /${interaction.commandName}`;
			if (interaction.options.data.length !== 0) interaction.options.data.forEach(option => { messageLog += ` [${option.value}]` });
			
			console.log(messageLog);
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