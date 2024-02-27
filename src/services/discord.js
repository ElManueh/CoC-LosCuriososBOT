import { writeConsoleANDLog } from "../write.js";

export const discordGuildId = '1198305691375505590';
export const discordChannelLog = '1198326143846199436';
export const discordRoleAdmin = '1198307374902034432';
export const discordRolesClashofclans = {
    'not_member': '1199079285630193674',
    'member': '1198307089391558848',
    'leader': '1198307014443544717',
    'admin': '1198307066884935811',
    'coLeader': '1198307044621570148',
};

export async function discordNameUpdate(discordId, name, guild) {
    try {
        let member = guild.members.cache.get(discordId);
        if (!member) member = await guild.members.fetch(discordId);
        if (member.nickname != name && guild.ownerId != discordId) await member.setNickname(name);
    } catch (error) { throw error; }
}

export async function discordRoleUpdate(discordId, role, server) {
    try {
        let member = server.members.cache.get(discordId);
        if (!member) member = server.members.fetch(discordId);
        for (const role in discordRolesClashofclans) 
            if (member.roles.cache.has(discordRolesClashofclans[role])) await member.roles.remove(discordRolesClashofclans[role]);

        if (role) await member.roles.add(discordRolesClashofclans[role]);
    } catch (error) { writeConsoleANDLog(error); }
}