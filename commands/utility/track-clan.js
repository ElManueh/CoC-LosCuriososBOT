import { SlashCommandBuilder } from 'discord.js';
import { getClan } from '../../src/services/clashofclansAPI.js';
import { closeConnectionDatabase, openConnectionDatabase, runDatabase } from '../../src/services/database.js';
import mensajes from '../../src/locale.json' assert { type: 'json' };
import { writeConsoleANDLog } from '../../src/write.js';
import { ClashOfClansError, DatabaseError, SQLITE_CONSTRAINT_FOREIGNKEY, SQLITE_CONSTRAINT_UNIQUE } from '../../src/errorCreate.js';

export default {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('track-clan')
		.setDescription('Vincula tu clan a este servidor.')
		.addStringOption(option => option
			.setName('clan-tag')
			.setDescription('Este es el TAG de tu clan de Clash Of Clans.')
			.setRequired(true)),
	async execute(interaction) {
		const db = await openConnectionDatabase();
		try {
			let optionClanTag = interaction.options.getString('clan-tag');
			let clan = await getClan(optionClanTag);

			await runDatabase(db, 'BEGIN');
			try {
				await runDatabase(db, `INSERT INTO GuildConnections (guildId, clan) VALUES ('${interaction.guild.id}', '${clan.tag}')`);
			} catch (error) {
				
				if (error instanceof DatabaseError) {
					if (error.code === SQLITE_CONSTRAINT_UNIQUE) return await interaction.reply({ content: mensajes.clashofclans.tag_ya_vinculado, ephemeral: true });
					if (error.code === SQLITE_CONSTRAINT_FOREIGNKEY) {	// clan no creado
						await runDatabase(db, `INSERT INTO ClanData (tag) VALUES ('${clan.tag}')`);
						await runDatabase(db, `INSERT INTO GuildConnections (guildId, clan) VALUES ('${interaction.guild.id}', '${clan.tag}')`);
					}
				}
			}
			await runDatabase(db, 'COMMIT');

			await interaction.reply({ content: 'Clan vinculado al servidor correctamente. Recuerda configurarlo para tener acceso a las distintas funcionalidades.', ephemeral: true });
			await closeConnectionDatabase(db);
		} catch (error) {
			await closeConnectionDatabase(db);
			if (error instanceof ClashOfClansError) {
				if (error.errno === 404) return await interaction.reply({ content: mensajes.clashofclans.tag_incorrecto, ephemeral: true });
			}

			await interaction.reply({ content: mensajes.error.notificar, ephemeral: true });
			await writeConsoleANDLog(error);
		}
	},
};