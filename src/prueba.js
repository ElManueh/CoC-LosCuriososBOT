const clashofclansAPI = require('./clashofclansAPI.js');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("./mybotdata.sqlite");
const db2 = new sqlite3.Database("./mybotdata2.sqlite");



const tag = '#CLGJ02V9';
clashofclansAPI.obtenerUsuario(tag)
    .then(usuario => {
        let info = usuario.achievements.filter(logro => logro.name == 'Most Valuable Clanmate');
            //console.log(info[0].value);
    });

    //
let solicitudDB, respuestaDB;


solicitudDB = 'UPDATE usuariosCOC SET discordID = ? WHERE tag = ?';
db.run(solicitudDB, '806578640317710367', '#2J0VUVUJR');

return;
solicitudDB = 'SELECT discordID, cocTAG FROM usuarios WHERE discordID IS NOT NULL'
respuestaDB = new Promise((resolve) => {
    db2.all(solicitudDB, (err, row) => {
        return resolve(row);
    });
})

respuestaDB.then(r => {
    for(let sol of r){
        solicitudDB = 'UPDATE usuariosCOC SET discordID = ? WHERE tag = ?';
        db.run(solicitudDB, sol.discordID, sol.cocTAG);
    }
});



    return;
 solicitudDB = 'UPDATE usuariosCOC SET discordID = 333 WHERE tag = ?'
//db.run(solicitudDB, '#VQ0YR2QL');

solicitudDB = 'SELECT discordID, tag FROM usuariosCOC WHERE discordID IS NOT NULL'
 respuestaDB = new Promise((resolve) => {
    db.all(solicitudDB, (err, row) => {
        return resolve(row);
    });
})

respuestaDB.then(r => {
    for (let resp of r) {
        solicitudDB = 'UPDATE usuarios SET discordID = ? WHERE cocTAG = ?';
        db.run(solicitudDB, resp.discordID, resp.tag);
    }
});