import { databaseAll, databaseRun } from '../services/database.js';
import { getUsersClan, getUserInfo } from '../services/clashofclansAPI.js';
import { discordNameUpdate, discordRoleUpdate } from '../services/discord.js';

async function createTableDB() {
    let databaseRequest = `CREATE TABLE IF NOT EXISTS usuariosCOC (
        discordID			TEXT 		UNIQUE,
        tag 				TEXT 		NOT NULL	UNIQUE PRIMARY KEY,
        nombre 				TEXT 		NOT NULL,
        rango 				TEXT 		NOT NULL,
        preferenciaGuerra 	TEXT 		DEFAULT 'out',	
        ataquesUltGuerra 	TEXT 		DEFAULT '- - - - -',
        puntosUltJuegos 	TEXT 		DEFAULT '0',
        puntosUltAsaltos 	TEXT 		DEFAULT '0',
        totalCapital 		TEXT	 	DEFAULT '0'
        )`;

    try {
        await databaseRun(databaseRequest);
    } catch (error) { console.error(error); }
}

async function getUsersClanData() {
    try {
        let usersClan = await getUsersClan();
        if (usersClan.length <= 30) usersClan = usersClan.map(user => getUserInfo(user.tag));
        else {
            let first30users = usersClan.slice([], 30).map(user => getUserInfo(user.tag));
            await new Promise(resolve => setTimeout(resolve, 1000));
            let lastUsers = usersClan.slice(30, ).map(user => getUserInfo(user.tag));
            usersClan = first30users.concat(lastUsers);
        }
        return await Promise.all(usersClan);
    } catch (error) { console.error(error); }
}

async function usersClanUpdate(usersClan, usersDatabase, discordGuild) {
    try {
        for (const userClan of usersClan) {
            let userDatabase = usersDatabase.filter(user => user.tag === userClan.tag);
            if (!userDatabase.length) await databaseRun(`INSERT INTO usuariosCOC (discordID, tag, nombre, rango) VALUES (null, '${userClan.tag}', '${userClan.name}', '${userClan.role}')`);

            userDatabase = userDatabase[0];
            if (userDatabase.nombre != userDatabase.name) { // name changed
                await databaseRun(`UPDATE usuariosCOC SET nombre = '${userClan.name}' WHERE tag = '${userClan.tag}'`);
                if (userDatabase.discordID) await discordNameUpdate(userDatabase.discordID, userClan.name, discordGuild);
            }

            if (userDatabase.rango != userClan.role) {  // role changed
                await databaseRun(`UPDATE usuariosCOC SET rango = '${userClan.role}' WHERE tag = '${userClan.tag}'`);
                if (userDatabase.discordID) await discordRoleUpdate(userDatabase.discordID, userClan.role, discordGuild);
            }

            if (userDatabase.preferenciaGuerra != userClan.warPreference) { // preferenceWar changed
                await databaseRun(`UPDATE usuariosCOC SET preferenciaGuerra = '${userClan.warPreference}' WHERE tag = '${userClan.tag}'`);
            }
        }
    } catch (error) { console.error(error); }
}

async function otherUsersUpdate(usersClan, usersDatabase, discordGuild) {
    try {
        let usersExternalDatabase = usersDatabase.filter(user => !usersClan.map(user => user.tag).includes(user.tag));
        for (const userExternalDatabase of usersExternalDatabase) {
            if (userExternalDatabase.rango === 'not_member') continue;
            await databaseRun(`UPDATE usuariosCOC SET rango = 'not_member' WHERE tag = '${userExternalDatabase.tag}'`);
            if (userExternalDatabase.discordID) await discordRoleUpdate(userExternalDatabase.discordID, 'not_member', discordGuild);
        }
    } catch (error) { console.error(error); }
}

export async function databaseUpdate(discordGuild) {
    try {
        await createTableDB();
        setInterval(async () => {
            let usersDatabase = await databaseAll('SELECT * FROM usuariosCOC');
            let usersClan = await getUsersClanData();

            await usersClanUpdate(usersClan, usersDatabase, discordGuild);
            await otherUsersUpdate(usersClan, usersDatabase, discordGuild);
        }, 1*10*1000)
    } catch (error) { console.error(error); }
}