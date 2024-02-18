const clashofclansAPI = require('../clashofclansAPI');
const comandosDB = require('../comandosDB');
const discord = require('../discord');
const mensajes = require('../locale.json');

const resp = require('../../test/b.json');

async function actualizarDB() {
    let solicitudDB = `CREATE TABLE IF NOT EXISTS usuariosCOC (
        discordID			TEXT 		UNIQUE,
        tag 				TEXT 		NOT NULL	UNIQUE PRIMARY KEY,
        nombre 				TEXT 		NOT NULL,
        rango 				TEXT 		NOT NULL,
        preferenciaGuerra 	TEXT 		DEFAULT "out",	
        ataquesUltGuerra 	TEXT 		DEFAULT "-",
        puntosUltJuegos 	TEXT 		DEFAULT "0",
        puntosUltAsaltos 	TEXT 		DEFAULT "0",
        totalCapital 		TEXT	 	DEFAULT "0"
        )`;

    try {
        await comandosDB.ejecutarDBrun(solicitudDB);
    } catch (error) { throw console.error(mensajes.error.data_base + ' Crear DB.'); }

    setInterval(async () => {	// BUCLE
        let usuariosDB, usuariosAPI;

        solicitudDB = 'SELECT * FROM usuariosCOC';
        try {	// obtengo todos los usuarios de nuestra DB
            usuariosDB = await comandosDB.solicitarDBall(solicitudDB);
        } catch (error) { return console.error(mensajes.error.data_base + ' Obtener usuarios DB.'); }

        try {	// obtengo los datos de los usuarios del clan
            usuariosAPI = await clashofclansAPI.obtenerUsuariosClan();
            if (usuariosAPI.length <= 30) usuariosAPI = usuariosAPI.map(usuario => clashofclansAPI.obtenerUsuario(usuario.tag));
            else {
                let primeros30usuarios = usuariosAPI.slice([], 30).map(usuario => clashofclansAPI.obtenerUsuario(usuario.tag));
                setTimeout(() => { }, 1000);
                let ultimosUsuarios = usuariosAPI.slice(30,).map(usuario => clashofclansAPI.obtenerUsuario(usuario.tag));
                usuariosAPI = primeros30usuarios.concat(ultimosUsuarios);
            }
            usuariosAPI = await Promise.all(usuariosAPI);
        } catch (error) { return console.error(mensajes.error.clashofclans + ' Obtener usuarios Clan.'); }

        for (let usuarioAPI of usuariosAPI) {	// por cada usuario en el clan
            let usuarioDB = usuariosDB.filter(usuario => usuario.tag === usuarioAPI.tag);	// busco si el miembro esta en la DB
            if (!usuarioDB.length) {	// el usuario no existe en la DB, lo creamos
                let solicitudDB = `INSERT INTO usuariosCOC (discordID, tag, nombre, rango) VALUES (null, '${usuarioAPI.tag}', '${usuarioAPI.name}', '${usuarioAPI.role}')`;
                try {
                    await comandosDB.ejecutarDBrun(solicitudDB);
                } catch (error) { return console.error(mensajes.error.data_base + ` Insertar nuevo usuario --> ${usuarioAPI.tag}.`); }
                continue;
            }

            usuarioDB = usuarioDB[0];
            if (usuarioDB.nombre != usuarioAPI.name) {	// nombre cambiado
                solicitudDB = `UPDATE usuariosCOC SET nombre = '${usuarioAPI.name}' WHERE tag = '${usuarioAPI.tag}'`;
                try {
                    await comandosDB.ejecutarDBrun(solicitudDB);
                } catch (error) { return console.error(mensajes.error.data_base + ` Actualizar nombre usuario --> ${usuarioAPI.tag}.`); }

                try {
                    if (usuarioDB.discordID) await discord.cambiar_nombre(usuarioDB.discordID, usuarioAPI.name, discord.servidor_id);
                } catch (error) { return console.error(mensajes.error.discord + ` Actualizar nombre usuario --> ${usuarioAPI.tag}.`); }
            }

            if (usuarioDB.rango != usuarioAPI.role) {	// rango cambiado
                solicitudDB = `UPDATE usuariosCOC SET rango = '${usuarioAPI.role}' WHERE tag = '${usuarioAPI.tag}'`;
                try {
                    await comandosDB.ejecutarDBrun(solicitudDB);
                } catch (error) { return console.error(mensajes.error.data_base + ` Actualizar rango usuario --> ${usuarioAPI.tag}.`); }

                try {
                    if (usuarioDB.discordID) await discord.cambiar_rango(usuarioDB.discordID, usuarioAPI.role, discord.servidor_id);
                } catch (error) { return console.error(mensajes.error.discord + ` Actualizar rango usuario --> ${usuarioAPI.tag}.`); }
            }

            if (usuarioDB.preferenciaGuerra != usuarioAPI.warPreference) {	// preferenciaGuerra cambiado
                solicitudDB = `UPDATE usuariosCOC SET preferenciaGuerra = '${usuarioAPI.warPreference}' WHERE tag = '${usuarioAPI.tag}'`;
                try {
                    await comandosDB.ejecutarDBrun(solicitudDB);
                } catch (error) { return console.error(mensajes.error.data_base + ` Actualizar preferencia guerra usuario --> ${usuarioAPI.tag}.`); }
            }
        }

        let usuariosDBexternos = usuariosDB.filter(usuario => !usuariosAPI.map(usuario => usuario.tag).includes(usuario.tag));
        for (let usuarioDBexterno of usuariosDBexternos) {	// por cada usuario que NO es del clan
            if (usuarioDBexterno.rango === 'not_member') continue;
            solicitudDB = `UPDATE usuariosCOC SET rango = 'not_member' WHERE tag = '${usuarioDBexterno.tag}'`;
            try {
                await comandosDB.ejecutarDBrun(solicitudDB);
            } catch (error) { return console.error(mensajes.error.data_base + ` Actualizar rango usuario externo --> ${usuarioDBexterno.tag}.`); }

            try {
                if (usuarioDBexterno.discordID) await discord.cambiar_rango(usuarioDBexterno.discordID, 'not_member', discord.servidor_id);
            } catch (error) { return console.error(mensajes.error.discord + ` Actualizar rango usuario externo --> ${usuarioDBexterno.tag}.`); }
        }
    }, 2 * 60 * 1000);
}

async function guerraActual() {
    let solicitudDB = `CREATE TABLE IF NOT EXISTS guerraCOC (
        tagClanEnemigo		TEXT 		UNIQUE
        )`;

    try { 
        await comandosDB.ejecutarDBrun(solicitudDB);
    } catch (error) { throw console.error(mensajes.error.data_base + ' Crear DB.'); }

    try {
        solicitudDB = 'SELECT * FROM guerraCOC'
        let campo = await comandosDB.solicitarDBget(solicitudDB);
        if (!campo) solicitudDB = 'INSERT INTO guerraCOC (tagClanEnemigo) VALUES (null)';
        await comandosDB.ejecutarDBrun(solicitudDB);
    } catch (error) { throw console.error(mensajes.error.data_base + 'Insertar tag por defecto.'); }
    
    while (true) {
        console.log("empieza");
        let guerraActual, tagClanEnemigoDB;
        do {
            try { 
                //guerraActual = await clashofclansAPI.obtenerGuerraActualClan();
                guerraActual = resp;
            } catch (error) { console.error(mensajes.error.clashofclans + ' Obtener guerra actual.'); continue; }

            if (guerraActual.state != 'warEnded') {
                console.log(1);
                await new Promise(resolve => setTimeout(resolve, 5*1000));
            }
        } while (guerraActual.state != 'warEnded');

        solicitudDB = 'SELECT * FROM guerraCOC';
        try {
            tagClanEnemigoDB = await comandosDB.solicitarDBget(solicitudDB);
        } catch (error) { console.error(mensajes.error.data_base + ' Obtener tag clan enemigo.'); continue; }

        if (tagClanEnemigoDB.tagClanEnemigo === guerraActual.opponent.tag) {
            console.log("igual");
            await new Promise(resolve => setTimeout(resolve, 5*1000));
            continue;
        }
        console.log(1)
        let usuariosGuerra = guerraActual.clan.members;
        for (const usuarioGuerra of usuariosGuerra) {
            let estrellas = 0;
            if (usuarioGuerra.attacks) for (const ataque of usuarioGuerra.attacks) estrellas += ataque.stars;
            // obtener la cadena de la db
            // la transformo
            // y la inserto

            solicitudDB = `SELECT * FROM usuariosCOC WHERE tag = '${usuarioGuerra.tag}'`;
            let usuarioDB = await comandosDB.solicitarDBget(solicitudDB);
            let cadena = usuarioDB.ataquesUltGuerra;

            let separado = cadena.split(' ');
            let actual = usuarioGuerra.attacks ? `${usuarioGuerra.attacks.length}[${estrellas}]` : '0[0]';
            for (let i = 0; i < 4; i++) actual += ` ${separado[i]}`;

            solicitudDB = `UPDATE usuariosCOC SET ataquesUltGuerra = '${actual}' WHERE tag = '${usuarioGuerra.tag}'`;
            try {
                await comandosDB.ejecutarDBrun(solicitudDB);
            } catch (error) { console.error(error); }
        }

        solicitudDB = 'SELECT * FROM usuariosCOC';
        let usuariosNoGuerra;
        try {
            usuariosNoGuerra = await comandosDB.solicitarDBall(solicitudDB);
        } catch (error) { console.error(error); }

        usuariosNoGuerra = usuariosNoGuerra.filter(usuario => !usuariosGuerra.map(usuario => usuario.tag).includes(usuario.tag));
        for (const usuarioNoGuerra of usuariosNoGuerra) {
            solicitudDB = `SELECT * FROM usuariosCOC WHERE tag = '${usuarioNoGuerra.tag}'`;
            let usuarioDB = await comandosDB.solicitarDBget(solicitudDB);
            let cadena = usuarioDB.ataquesUltGuerra;

            let separado = cadena.split(' ');
            let actual = '-';
            for (let i = 0; i < 4; i++) actual += ` ${separado[i]}`;

            solicitudDB = `UPDATE usuariosCOC SET ataquesUltGuerra = '${actual}' WHERE tag = '${usuarioNoGuerra.tag}'`;    // cambiar
            try {
                await comandosDB.ejecutarDBrun(solicitudDB);
            } catch (error) { console.error(error); }
        }

        solicitudDB = `UPDATE guerraCOC SET tagClanEnemigo = '${guerraActual.opponent.tag}'`;
        try {
            await comandosDB.ejecutarDBrun(solicitudDB);
        } catch (error) { console.error(error); }
    }
}

module.exports = {
    actualizarDB,
    guerraActual
}