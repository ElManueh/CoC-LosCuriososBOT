import { Events } from 'discord.js';
import * as Database from '../src/services/database.js';
import { currentWar } from '../src/events/currentWar.js';
import { databaseUpdate } from '../src/events/databaseUpdate.js';
import { writeConsoleANDLog } from '../src/write.js';

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    await writeConsoleANDLog('-------------------------------------------------');
    await writeConsoleANDLog(`Connected correctly as '${client.user.tag}'`);

    try {
      await Database.initialize();
    } catch (error) {
      return writeConsoleANDLog('PLEASE, RESTART THE BOT');
    }

    // This execute the code to manage the database update with information about wars.
    currentWar();
    // This execute the code to manage the update of users clan.
    databaseUpdate();
  }
};
