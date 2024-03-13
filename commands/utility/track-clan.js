import { SlashCommandBuilder } from 'discord.js';
import * as ClashofClansAPI from '../../src/services/clashofclansAPI.js';
import * as Database from '../../src/services/database.js';
import localeJSON from '../../src/locale.json' assert { type: 'json' };
import { writeConsoleANDLog } from '../../src/write.js';
import { ClashOfClansError, DatabaseError, SQLITE_BUSY_TIMEOUT, SQLITE_CONSTRAINT_FOREIGNKEY, SQLITE_CONSTRAINT_UNIQUE } from '../../src/errorCreate.js';

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
		const db = await Database.openConnection();
		try {
			const optionClanTag = interaction.options.getString('clan-tag');
			const clan = await ClashofClansAPI.getClan(optionClanTag);

			await Database.runCommand(db, 'BEGIN IMMEDIATE');
			try {
				await Database.runCommand(db, `INSERT INTO GuildConnections (guildId, clan) VALUES ('${interaction.guild.id}', '${clan.tag}')`);
			} catch (error) {
				if (error instanceof DatabaseError) {
					if (error.code === SQLITE_CONSTRAINT_UNIQUE) return interaction.reply({ content: localeJSON.clashofclans_clan_tracked_fail, ephemeral: true });
					if (error.code === SQLITE_CONSTRAINT_FOREIGNKEY) {
						await Database.runCommand(db, `INSERT INTO ClanData (tag) VALUES ('${clan.tag}')`);
						await Database.runCommand(db, `INSERT INTO GuildConnections (guildId, clan) VALUES ('${interaction.guild.id}', '${clan.tag}')`);
					}
					if (error.code === SQLITE_BUSY_TIMEOUT) throw error;
				}
			}
			await Database.runCommand(db, 'COMMIT');
			await interaction.reply({ content: localeJSON.clashofclans_clan_tracked_ok, ephemeral: true });
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
	},
};