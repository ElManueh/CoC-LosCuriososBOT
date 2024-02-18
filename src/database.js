import { DatabaseError } from './errorCreate.js';
import sqlite3 from 'sqlite3';
const db = new sqlite3.Database("./mybotdata.sqlite");

export async function databaseGet(solicitudDB) {
    return new Promise((resolve, reject) => {
        db.get(solicitudDB, (err, row) => {
            if (!err) return resolve(row);
            return reject(new DatabaseError());
        });
    });
}

export async function databaseAll(solicitudDB) {
    return new Promise((resolve, reject) => {
        db.all(solicitudDB, (err, rows) => {
            if (!err) return resolve(rows);
            return reject(new DatabaseError());
        });
    });
}

export async function databaseRun(solicitudDB) {
    return new Promise((resolve, reject) => {
        db.run(solicitudDB, function(err) {
            if (!err) return resolve(true);
            return reject(new DatabaseError());
        })
    });
}