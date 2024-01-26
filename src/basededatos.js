const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("./mybotdata.sqlite");

// GET (1 parámetro)
async function solicitarDB1Parametro(solicitudDB, primerParametro) {
    return new Promise((resolve, reject) => {
        db.get(solicitudDB, primerParametro, (err, row) => {
            if (err) reject(err.message);
            resolve(row);
        });
    });
}

// RUN (1 parámetro)
async function ejecutarDB1Parametro(solicitudDB, primerParametro) {
    return new Promise((resolve, reject) => {
        db.run(solicitudDB, primerParametro, function(err) {
            if (err) reject(err.message);
            resolve(true);
        })
    });
}

// RUN (2 parámetro)
async function ejecutarDB2Parametro(solicitudDB, primerParametro, segundoParametro) {
    return new Promise((resolve, reject) => {
        db.run(solicitudDB, primerParametro, segundoParametro, function(err) {
            if (err) reject(err.message);
            resolve(true);
        })
    });
}

module.exports = {
    solicitarDB1Parametro,
    ejecutarDB1Parametro,
    ejecutarDB2Parametro
}