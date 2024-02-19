import { databaseGet, databaseAll, databaseRun } from '../services/database.js';
import { getCurrentWarClan } from '../services/clashofclansAPI.js';
import { DatabaseError } from '../errorCreate.js';

async function createTableDB() {
    let databaseRequest = `CREATE TABLE IF NOT EXISTS guerraCOC (
        tagClanEnemigo		TEXT 		UNIQUE
        )`;

    try { 
        await databaseRun(databaseRequest);
        let databaseResponse = await databaseGet('SELECT * FROM guerraCOC');
        if (!databaseResponse) await databaseRun('INSERT INTO guerraCOC (tagClanEnemigo) VALUES (null)');
    } catch (error) { console.error(error); }
}

async function getWarEnded() {
    let currentWar, databaseClanTag;
    try {
        do {
            currentWar = await getCurrentWarClan();
            // currentWar = resp;
            if (currentWar.state != 'warEnded') await new Promise(resolve => setTimeout(resolve, 30*60*1000));     
        } while (currentWar.state != 'warEnded');

        databaseClanTag = await databaseGet('SELECT * FROM guerraCOC');
        if (currentWar.opponent.tag === databaseClanTag.tagClanEnemigo) return await new Promise(resolve => setTimeout(resolve(), 30*60*1000));
        return currentWar;
    } catch (error) { console.error(error); }
}

async function warMembersUpdate(warEnded) {
    let usersWar = warEnded.clan.members;
    try {
        for (const userWar of usersWar) {
            let stars = 0;
            if (userWar.attacks) for (const attack of userWar.attacks) stars += attack.stars;
    
            let userDatabase = await databaseGet(`SELECT * FROM usuariosCOC WHERE tag = '${userWar.tag}'`);
            let attacksLog = userDatabase.ataquesUltGuerra;
            attacksLog = attacksLog.split(' ');
    
            let attacksCurrentWar = userWar.attacks ? `${userWar.attacks.length}[${stars}]` : '0[0]';
            for (let i = 0; i < 4; i++) attacksCurrentWar += ` ${attacksLog[i]}`;
    
            await databaseRun(`UPDATE usuariosCOC SET ataquesUltGuerra = '${attacksCurrentWar}' WHERE tag = '${userWar.tag}'`);
        }
    } catch (error) { console.error(error); }
}

async function otherMembersUpdate(usersWar) {
    try {
        let usersDatabase = await databaseAll('SELECT * FROM usuariosCOC');
        let usersNotWar = usersDatabase.filter(user => !usersWar.map(user => user.tag).includes(user.tag));
        for (const userNotWar of usersNotWar) {
            let userDatabase = usersDatabase.filter(user => user.tag === userNotWar.tag);
            let attacksLog = userDatabase.ataquesUltGuerra;
            attacksLog = attacksLog.split(' ');

            let attacksCurrentWar = '-';
            for (let i = 0; i < 4; i++) attacksCurrentWar += `${attacksLog[i]}`;
            await databaseRun(`UPDATE usuariosCOC SET ataquesUltGuerra = '${attacksCurrentWar}' WHERE tag = '${userNotWar.tag}'`);
        }
    } catch (error) { console.error(error); }
}

export async function currentWar() {
    try {
        await createTableDB();
        while (true) {
            let warEnded = await getWarEnded();
            if (!warEnded) continue;

            await warMembersUpdate(warEnded);
            await otherMembersUpdate(warEnded.clan.members);

            await databaseRun(`UPDATE guerraCOC SET tagClanEnemigo = '${warEnded.opponent.tag}'`);
        }
    } catch (error) { console.error(error); }
}