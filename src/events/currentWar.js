import { databaseGet, databaseAll, databaseRun } from '../services/database.js';
import { getClanCurrentWar } from '../services/clashofclansAPI.js';
import { writeConsoleANDLog } from '../write.js';
const WAR_ENDED = 'warEnded';

async function getWarEnded(clan) {
    try {
        let currentWar = await getClanCurrentWar(clan);
        if (currentWar.state !== WAR_ENDED) return;
        
        let clanData = await databaseGet(`SELECT * FROM ClanData WHERE tag = '${clan}'`);
        return currentWar.opponent.tag !== clanData.lastWar ? currentWar : null;  
    } catch (error) {
        await writeConsoleANDLog(error);
    }
}

async function addNewAttack(playerClan, lastAttack) {
    try {
        let playerAttacks = playerClan.warAttacks.split(' ');
        for (let i = 0; i < 4; i++) {
            lastAttack += ` ${playerAttacks[i]}`;
        }
        await databaseRun(`UPDATE PlayerClanData SET warAttacks = '${lastAttack}' WHERE clan = '${playerClan.clan}' AND player = '${playerClan.player}'`);
    } catch (error) {
        await writeConsoleANDLog(error);
    }
}

async function warPlayersUpdate(warEnded) {
    let warPlayers = warEnded.clan.members;
    try {
        for (const warPlayer of warPlayers) {
            let stars = 0;
            if (warPlayer.attacks) for (const attack of warPlayer.attacks) stars += attack.stars;

            let playerClan = await databaseGet(`SELECT * FROM PlayerClanData WHERE clan = '${warEnded.clan.tag}' AND player = '${warPlayer.tag}'`);
            let lastAttack = warPlayer.attacks ? `${warPlayer.attacks.length}[${stars}]` : '0[0]';
            await addNewAttack(playerClan, lastAttack);
        }
    } catch (error) {
        await writeConsoleANDLog(error);
    }
}

async function otherPlayersUpdate(warEnded) {
    try {
        let warPlayers = warEnded.clan.members;
        let playersClan = await databaseAll(`SELECT * FROM PlayerClanData WHERE clan = '${warEnded.clan.tag}'`);
        let notWarPlayers = playersClan.filter(playerClan => !warPlayers.map(player => player.tag).includes(playerClan.player));
        for (const notWarPlayer of notWarPlayers) {
            await addNewAttack(notWarPlayer, '-');
        }
    } catch (error) {
        await writeConsoleANDLog(error);
    }
}

export async function currentWar() {
    try {
        setInterval(async () => {
            let connections = await databaseAll(`SELECT * FROM GuildConnections`);
            for (const connection of connections) {
                let warEnded = await getWarEnded(connection.clan);
                if (!warEnded) continue;

                await warPlayersUpdate(warEnded);
                await otherPlayersUpdate(warEnded);

                await databaseRun(`UPDATE ClanData SET lastWar = '${warEnded.opponent.tag}' WHERE tag = '${connection.clan}'`);
            }
        }, 5*60_000);
    } catch (error) { 
        await writeConsoleANDLog(error);
    }
}