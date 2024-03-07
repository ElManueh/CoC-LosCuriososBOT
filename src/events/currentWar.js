import { getDatabase, allDatabase, runDatabase, openConnectionDatabase, closeConnectionDatabase } from '../services/database.js';
import { getClanCurrentWar } from '../services/clashofclansAPI.js';
import { writeConsoleANDLog } from '../write.js';
const WAR_ENDED = 'warEnded';

async function getWarEnded(db, clan) {
    try {
        let currentWar = await getClanCurrentWar(clan);
        if (currentWar.state !== WAR_ENDED) return;
        
        let clanData = await getDatabase(db, `SELECT * FROM ClanData WHERE tag = '${clan}'`);
        return currentWar.opponent.tag !== clanData.lastWar ? currentWar : null;  
    } catch (error) {
        await writeConsoleANDLog(error);
    }
}

async function addNewAttack(db, playerClan, lastAttack) {
    try {
        let playerAttacks = playerClan.warAttacks.split(' ');
        for (let i = 0; i < 4; i++) {
            lastAttack += ` ${playerAttacks[i]}`;
        }
        await runDatabase(db, `UPDATE PlayerClanData SET warAttacks = '${lastAttack}' WHERE clan = '${playerClan.clan}' AND player = '${playerClan.player}'`);
    } catch (error) {
        await writeConsoleANDLog(error);
    }
}

async function warPlayersUpdate(db, warEnded) {
    let warPlayers = warEnded.clan.members;
    try {
        for (const warPlayer of warPlayers) {
            let stars = 0;
            if (warPlayer.attacks) for (const attack of warPlayer.attacks) stars += attack.stars;

            let playerClan = await getDatabase(db, `SELECT * FROM PlayerClanData WHERE clan = '${warEnded.clan.tag}' AND player = '${warPlayer.tag}'`);
            let lastAttack = warPlayer.attacks ? `${warPlayer.attacks.length}[${stars}]` : '0[0]';
            await addNewAttack(db, playerClan, lastAttack);
        }
    } catch (error) {
        await writeConsoleANDLog(error);
    }
}

async function otherPlayersUpdate(db, warEnded) {
    try {
        let warPlayers = warEnded.clan.members;
        let playersClan = await allDatabase(db, `SELECT * FROM PlayerClanData WHERE clan = '${warEnded.clan.tag}'`);
        let notWarPlayers = playersClan.filter(playerClan => !warPlayers.map(player => player.tag).includes(playerClan.player));
        for (const notWarPlayer of notWarPlayers) {
            await addNewAttack(db, notWarPlayer, '-');
        }
    } catch (error) {
        await writeConsoleANDLog(error);
    }
}

export async function currentWar() {
    try {
        setInterval(async () => {
            const db = await openConnectionDatabase();
            let connections = await allDatabase(db, `SELECT * FROM GuildConnections`);
            for (const connection of connections) {
                let warEnded = await getWarEnded(db, connection.clan);
                if (!warEnded) continue;

                await warPlayersUpdate(db, warEnded);
                await otherPlayersUpdate(db, warEnded);

                await runDatabase(db, `UPDATE ClanData SET lastWar = '${warEnded.opponent.tag}' WHERE tag = '${connection.clan}'`);
            }
            await closeConnectionDatabase(db);
        }, 5*60_000);
    } catch (error) { 
        await writeConsoleANDLog(error);
    }
}