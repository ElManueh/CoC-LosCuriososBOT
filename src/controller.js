import * as ClashofClansAPI from './services/clashofclansAPI.js';
import * as Database from './services/database.js';
import * as ControllerStatus from './controller-status.js';
import * as ErrorCreate from './errorCreate.js';
import { writeConsoleANDLog } from './write.js';

export async function linkAccount(playerTag, playerToken, userId) {
  const db = await Database.openConnection();
  try {
    const playerClan = await ClashofClansAPI.getPlayer(playerTag);
    if (!playerClan) return ControllerStatus.TAG_INCORRECT;

    const tokenVerified = await ClashofClansAPI.verifyPlayerToken(playerTag, playerToken);
    if (!tokenVerified) return ControllerStatus.TOKEN_INCORRECT;

    await Database.runCommand(db, 'BEGIN IMMEDIATE');
    try {
      await Database.runCommand(db, `INSERT INTO UserConnections VALUES ('${userId}', '${playerClan.tag}')`);
    } catch (error) {
      switch (error.code) {
        case ErrorCreate.SQLITE_CONSTRAINT_UNIQUE:
          return ControllerStatus.LINK_ACCOUNT_FAIL;
        case ErrorCreate.SQLITE_CONSTRAINT_FOREIGNKEY:
          await Database.runCommand(db, `INSERT INTO PlayerData VALUES ('${playerClan.tag}', '${playerClan.name}', '${playerClan.townHallLevel}', '${playerClan.warPreference}')`);
          await Database.runCommand(db, `INSERT INTO UserConnections VALUES ('${userId}', '${playerClan.tag}')`);
        default:
          throw error;
      }
    }

    await Database.runCommand(db, 'COMMIT');
    return ControllerStatus.LINK_ACCOUNT_OK;
  } catch (error) {
    await writeConsoleANDLog(error);
    await Database.runCommand(db, 'ROLLBACK');
    throw error;
  } finally {
    await Database.closeConnection(db);
  }
}

