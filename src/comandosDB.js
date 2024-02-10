const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("./mybotdata.sqlite");

// GET
async function solicitarDBget(solicitudDB) {
    return new Promise((resolve, reject) => {
        db.get(solicitudDB, (err, row) => {
            if (!err) return resolve(row);
            console.error(err); return reject(err);
        });
    });
}

// ALL
async function solicitarDBall(solicitudDB) {
    return new Promise((resolve, reject) => {
        db.all(solicitudDB, (err, rows) => {
            if (!err) return resolve(rows);
            console.error(err); return reject(err);
        });
    });
}

// RUN
async function ejecutarDBrun(solicitudDB) {
    return new Promise((resolve, reject) => {
        db.run(solicitudDB, function(err) {
            if (!err) return resolve(true);
            console.error(err); return reject(err);
        })
    });
}

module.exports = {
    solicitarDBget,
    solicitarDBall,
    ejecutarDBrun
}