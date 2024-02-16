const canal_logs = '1198326143846199436';
const servidor_id = '1198305691375505590';
const rango_administrador = '1198307374902034432';
const rangos = {
    'not_member': '1199079285630193674',
    'member': '1198307089391558848',
    'leader': '1198307014443544717',
    'admin': '1198307066884935811',
    'coLeader': '1198307044621570148',
};

// Cambiar nombre de un usuario
async function cambiar_nombre(discordID, nombre, servidor) {
    try {
        let miembro = servidor.members.cache.get(discordID);
        if (!miembro) miembro = await servidor.members.fetch(discordID);
        
        if (miembro.nickname != nombre && servidor.ownerId != discordID) await miembro.setNickname(nombre);
    } catch (error) { throw error; }
}

// Cambiar rango de un usuario
async function cambiar_rango(discordID, rango, servidor) {
    let miembro;
    try {   // quitamos rango anterior
        miembro = servidor.members.cache.get(discordID);
        if (!miembro) miembro = await servidor.members.fetch(discordID);

        for (const rango in rangos) 
            if (miembro.roles.cache.has(rangos[rango])) await miembro.roles.remove(rangos[rango]);
    } catch (error) { throw error; }
    
    if (rango) {    // asignamos nuevo rango
        let roleID = rangos[rango];
        try {   
            await miembro.roles.add(roleID);
        } catch (error) { throw error; }
    }
}

module.exports = {
    cambiar_nombre,
    cambiar_rango,
    rango_administrador
}