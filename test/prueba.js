const clashofclansAPI = require('../src/clashofclansAPI.js');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("./mybotdata.sqlite");


const tag = '#CLGJ02V9';
let solicitudDB, respuestaDB;


let pref = "'in'"

solicitudDB = `SELECT nombre FROM usuariosCOC WHERE preferenciaGuerra = ${pref} AND discordID IS NOT NULL`;

console.log(solicitudDB);

let a;
respuestaDB = db.all(solicitudDB, (err, rows) => {
    return rows;
})



console.log(a)
console.log(respuestaDB)

return;
respuestaDB = new Promise((resolve) => {
    db.all(solicitudDB, (err, rows) => {
        return resolve(rows);
    })
})

respuestaDB.then(r => {
    console.log(r);
})







return;
clashofclansAPI.obtenerUsuario(tag)
    .then(usuario => {
        let info = usuario.achievements.filter(logro => logro.name == 'Most Valuable Clanmate');
            //console.log(info[0].value);
    });

    //



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