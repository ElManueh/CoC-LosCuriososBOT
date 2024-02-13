const datosDiscord = require('./datosDiscord');

// Cambiar nombre de un usuario
async function cambiar_nombre(discordID, nombre, servidor) {
    try {
        let miembro = servidor.members.cache.get(discordID);
        if (!miembro) miembro = await servidor.members.fetch(discordID);
        
        if (miembro.nickname != nombre && servidor.ownerId != discordID) await miembro.setNickname(nombre);
    } catch (error) { console.error("Error: Cambiar nombre"); throw error; }
}

// Cambiar rango de un usuario
async function cambiar_rango(discordID, rango, servidor) {
    let miembro;
    try {   // quitamos rango anterior
        miembro = servidor.members.cache.get(discordID);
        if (!miembro) miembro = await servidor.members.fetch(discordID);

        for (const rango in datosDiscord.rangos) 
            if (miembro.roles.cache.has(datosDiscord.rangos[rango])) await miembro.roles.remove(datosDiscord.rangos[rango]);
    } catch (error) { console.error('Error: Eliminando rango'); throw error; }
    
    if (rango) {    // asignamos nuevo rango
        try {   
            let roleID = datosDiscord.rangos[rango];
            await miembro.roles.add(roleID);
        } catch (error) { console.error("Error: Asignando rango"); throw error; }
    }
}

module.exports = {
    cambiar_nombre,
    cambiar_rango
}