import { databaseAll, databaseGet, databaseRun } from '../services/database.js';
import { getClanPlayers, getPlayer } from '../services/clashofclansAPI.js';
import { writeConsoleANDLog } from '../write.js';
import { DatabaseError, SQLITE_CONSTRAINT_FOREIGNKEY, SQLITE_CONSTRAINT_UNIQUE } from '../errorCreate.js';

async function getPlayersClanData(clan) {
    try {
        let playersClan = await getClanPlayers(clan);
        playersClan = playersClan.map(player => getPlayer(player.tag));
        return await Promise.all(playersClan);
    } catch (error) { 
        await writeConsoleANDLog(error); 
        await new Promise(resolve => setTimeout(resolve, 2*60_000));
        return await getPlayersClanData(clan);
    }
}

async function playersClanUpdate(playersClan, playersDatabase) {
    try {
        await databaseRun('BEGIN');
        for (const playerClan of playersClan) {
            let playerDatabase = playersDatabase.filter(player => player.tag === playerClan.tag);
            try {
                await databaseRun(`INSERT INTO PlayerClanData (clan, player, role) VALUES ('${playerClan.clan.tag}', '${playerClan.tag}', '${playerClan.role}')`);
            } catch (error) {
                if (error instanceof DatabaseError) {
                    if (error.code === SQLITE_CONSTRAINT_FOREIGNKEY) {  // player dont exists
                        await databaseRun(`INSERT INTO PlayerData (tag, name, townHall, warPreference) VALUES ('${playerClan.tag}', '${playerClan.name}', '${playerClan.townHallLevel}', '${playerClan.warPreference}')`);
                        await databaseRun(`INSERT INTO PlayerClanData (clan, player, role) VALUES ('${playerClan.clan.tag}', '${playerClan.tag}', '${playerClan.role}')`);
                        continue;
                    }

                    if (error.code === SQLITE_CONSTRAINT_UNIQUE) {  // player exists
                        if (playerClan.role !== playerDatabase.role) {
                            await databaseRun(`UPDATE PlayerClanData SET role = '${playerClan.role}' WHERE clan = '${playerClan.clan.tag}' AND player = '${playerClan.tag}'`);
                        }
                    }
                }
            }

            playerDatabase = await databaseGet(`SELECT * FROM PlayerData WHERE tag = '${playerClan.tag}'`);
            if (playerDatabase.name !== playerClan.name) {   // name changed
                await databaseRun(`UPDATE PlayerData SET name = '${playerClan.name}' WHERE tag = '${playerClan.tag}'`);
            }

            if (playerDatabase.townHall !== playerClan.townHallLevel) { // townHallLevel changed
                await databaseRun(`UPDATE PlayerData SET townHall = '${playerClan.townHallLevel}' WHERE tag = '${playerClan.tag}'`);
            }

            if (playerDatabase.warPreference !== playerClan.warPreference) { // warPreference changed
                await databaseRun(`UPDATE PlayerData SET warPreference = '${playerClan.warPreference}' WHERE tag = '${playerClan.tag}'`);
            }
        }
        await databaseRun('COMMIT');
    } catch (error) {
        await writeConsoleANDLog(error);
        await databaseRun('ROLLBACK');
    }
}

async function otherPlayersUpdate(playersClan, playersDatabase) {
    try {
        await databaseRun('BEGIN');
        let playersExternalDatabase = playersDatabase.filter(player => !playersClan.map(player => player.tag).includes(player.player));
        for (const playerExternalDatabase of playersExternalDatabase) {
            if (playerExternalDatabase.role === 'not_member') continue;
            await databaseRun(`UPDATE PlayerClanData SET role = 'not_member' WHERE clan = '${playerExternalDatabase.clan}' AND player = '${playerExternalDatabase.player}'`);
        }
        await databaseRun('COMMIT');
    } catch (error) {
        await writeConsoleANDLog(error);
        await databaseRun('ROLLBACK');
    }
}

export async function databaseUpdate() {
    try {
        setInterval(async () => {
            console.log('actualizado')
            let connections = await databaseAll(`SELECT * FROM GuildConnections`);
            for (const connection of connections) {
                console.log(connection.clan)
                let playersDatabase = await databaseAll(`SELECT * FROM PlayerClanData WHERE clan = '${connection.clan}'`);
                let playersClan = await getPlayersClanData(connection.clan);

                await playersClanUpdate(playersClan, playersDatabase);
                await otherPlayersUpdate(playersClan, playersDatabase);
                
                const date = new Date().toISOString().replace(/[-:]/g, '');
                await databaseRun(`UPDATE ClanData SET lastUpdate = '${date}' WHERE tag = '${connection.clan}'`);
            }
        }, 2*60_000);
    } catch (error) { await writeConsoleANDLog(error); }
}