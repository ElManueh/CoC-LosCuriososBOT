import { Events } from 'discord.js';
import { writeConsoleANDLog } from '../src/write.js';

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    await writeConsoleANDLog('-------------------------------------------------');
    await writeConsoleANDLog(`Connected correctly as '${client.user.tag}'`);
  }
};
