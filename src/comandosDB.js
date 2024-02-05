const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("./mybotdata.sqlite");

// GET
async function solicitarDBget(solicitudDB) {
    return new Promise((resolve, reject) => {
        db.get(solicitudDB, (err, row) => {
            if (!err) return resolve(row);
            return reject(err.message);
        });
    });
}

// ALL
async function solicitarDBall(solicitudDB) {
    return new Promise((resolve, reject) => {
        db.all(solicitudDB, (err, rows) => {
            if (!err) return resolve(rows);
            return reject(err.message);
        });
    });
}

// RUN
async function ejecutarDBrun(solicitudDB) {
    return new Promise((resolve, reject) => {
        db.run(solicitudDB, function(err) {
            if (!err) return resolve(true);
            return reject(err.message);
        })
    });
}

module.exports = {
    solicitarDBget,
    solicitarDBall,
    ejecutarDBrun
}