import { allDatabase, closeConnectionDatabase, getDatabase, openConnectionDatabase, runDatabase } from '../services/database.js';
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

async function playersClanUpdate(db, playersClan, playersDatabase) {
    try {
        await runDatabase(db, 'BEGIN');
        for (const playerClan of playersClan) {
            let playerDatabase = playersDatabase.filter(player => player.tag === playerClan.tag);
            try {
                await runDatabase(db, `INSERT INTO PlayerClanData (clan, player, role) VALUES ('${playerClan.clan.tag}', '${playerClan.tag}', '${playerClan.role}')`);
            } catch (error) {
                if (error instanceof DatabaseError) {
                    if (error.code === SQLITE_CONSTRAINT_FOREIGNKEY) {  // player dont exists
                        await runDatabase(db, `INSERT INTO PlayerData (tag, name, townHall, warPreference) VALUES ('${playerClan.tag}', '${playerClan.name}', '${playerClan.townHallLevel}', '${playerClan.warPreference}')`);
                        await runDatabase(db, `INSERT INTO PlayerClanData (clan, player, role) VALUES ('${playerClan.clan.tag}', '${playerClan.tag}', '${playerClan.role}')`);
                        continue;
                    }

                    if (error.code === SQLITE_CONSTRAINT_UNIQUE) {  // player exists
                        if (playerClan.role !== playerDatabase.role) {
                            await runDatabase(db, `UPDATE PlayerClanData SET role = '${playerClan.role}' WHERE clan = '${playerClan.clan.tag}' AND player = '${playerClan.tag}'`);
                        }
                    }
                }
            }

            playerDatabase = await getDatabase(db, `SELECT * FROM PlayerData WHERE tag = '${playerClan.tag}'`);
            if (playerDatabase.name !== playerClan.name) {   // name changed
                await runDatabase(db, `UPDATE PlayerData SET name = '${playerClan.name}' WHERE tag = '${playerClan.tag}'`);
            }

            if (playerDatabase.townHall !== playerClan.townHallLevel) { // townHallLevel changed
                await runDatabase(db, `UPDATE PlayerData SET townHall = '${playerClan.townHallLevel}' WHERE tag = '${playerClan.tag}'`);
            }

            if (playerDatabase.warPreference !== playerClan.warPreference) { // warPreference changed
                await runDatabase(db, `UPDATE PlayerData SET warPreference = '${playerClan.warPreference}' WHERE tag = '${playerClan.tag}'`);
            }
        }
        await runDatabase(db, 'COMMIT');
    } catch (error) {
        await writeConsoleANDLog(error);
        await runDatabase(db, 'ROLLBACK');
    }
}

async function otherPlayersUpdate(db, playersClan, playersDatabase) {
    try {
        await runDatabase(db, 'BEGIN');
        let playersExternalDatabase = playersDatabase.filter(player => !playersClan.map(player => player.tag).includes(player.player));
        for (const playerExternalDatabase of playersExternalDatabase) {
            if (playerExternalDatabase.role === 'not_member') continue;
            await runDatabase(db, `UPDATE PlayerClanData SET role = 'not_member' WHERE clan = '${playerExternalDatabase.clan}' AND player = '${playerExternalDatabase.player}'`);
        }
        await runDatabase(db, 'COMMIT');
    } catch (error) {
        await writeConsoleANDLog(error);
        await runDatabase(db, 'ROLLBACK');
    }
}

export async function databaseUpdate() {
    try {
        setInterval(async () => {
            const db = await openConnectionDatabase();
            console.log('actualizado')
            let connections = await allDatabase(db, `SELECT * FROM GuildConnections`);
            for (const connection of connections) {
                console.log(connection.clan)
                let playersDatabase = await allDatabase(db, `SELECT * FROM PlayerClanData WHERE clan = '${connection.clan}'`);
                let playersClan = await getPlayersClanData(connection.clan);

                await playersClanUpdate(db, playersClan, playersDatabase);
                await otherPlayersUpdate(db, playersClan, playersDatabase);
                
                const date = new Date().toISOString().replace(/[-:]/g, '');
                await runDatabase(db, `UPDATE ClanData SET lastUpdate = '${date}' WHERE tag = '${connection.clan}'`);
            }
            await closeConnectionDatabase(db);
        }, 2*60_000);
    } catch (error) { await writeConsoleANDLog(error); }
}