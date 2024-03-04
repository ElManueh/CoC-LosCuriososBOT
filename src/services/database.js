import sqlite3 from 'sqlite3';
import { DatabaseError } from '../errorCreate.js';
import { writeConsoleANDLog } from '../write.js';
const db = new sqlite3.Database('./mybotdata.sqlite');

export async function databaseGet(solicitudDB) {
    return new Promise((resolve, reject) => {
        db.get(solicitudDB, (err, row) => {
            if (!err) return resolve(row);
            return reject(new DatabaseError(err));
        });
    });
}

export async function databaseAll(solicitudDB) {
    return new Promise((resolve, reject) => {
        db.all(solicitudDB, (err, rows) => {
            if (!err) return resolve(rows);
            return reject(new DatabaseError(err));
        });
    });
}

export async function databaseRun(solicitudDB) {
    return new Promise((resolve, reject) => {
        db.run(solicitudDB, function(err) {
            if (!err) return resolve(true);
            return reject(DatabaseError(err));
        })
    });
}

export async function createDatabase() {
    const TablePlayerData = `
        CREATE TABLE IF NOT EXISTS PlayerData (
            tag                 TEXT    NOT NULL,
            name                TEXT    NOT NULL,
            townHall            TEXT    NOT NULL,
            warPreference       TEXT    NOT NULL,
            PRIMARY KEY (tag)
        );
    `;
    const TableClanData = `
        CREATE TABLE IF NOT EXISTS ClanData (
            tag                 TEXT    NOT NULL,
            lastUpdate          TEXT,
            lastWar             TEXT,
            PRIMARY KEY (tag)
        );
    `;
    const TablePlayerClanData = `
        CREATE TABLE IF NOT EXISTS PlayerClanData (
            clan                TEXT    NOT NULL,
            player              TEXT 	NOT NULL,
            role                TEXT    NOT NULL,
            warAttacks          TEXT 	NOT NULL    DEFAULT '- - - - -',
            PRIMARY KEY (clan, player),
            CONSTRAINT fk_clan FOREIGN KEY (clan) REFERENCES ClanData(tag)
                ON DELETE CASCADE
                ON UPDATE CASCADE,
            CONSTRAINT fk_player FOREIGN KEY (player) REFERENCES PlayerData(tag)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        );
    `;
    const TableUserConnections = `
        CREATE TABLE IF NOT EXISTS UserConnections (
            discordId           TEXT    NOT NULL,
            player              TEXT    NOT NULL,
            PRIMARY KEY (discordId, player),
            CONSTRAINT fk_player FOREIGN KEY (player) REFERENCES PlayerData(tag)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        );
    `;
    const TableGuildConnections = `
        CREATE TABLE IF NOT EXISTS GuildConnections (
            guildId             TEXT    NOT NULL,
            clan                TEXT    NOT NULL,
            channelLogId        TEXT,
            notMemberRoleId     TEXT,
            memberRoleId        TEXT,
            adminRoleId         TEXT,
            coLeaderRoleId      TEXT,
            leaderRoleId        TEXT,
            PRIMARY KEY (guildId, clan),
            CONSTRAINT fk_clan FOREIGN KEY (clan) REFERENCES ClanData(tag)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        );
    `;

    try {
        await databaseRun('PRAGMA foreign_keys = ON');
        await databaseRun('BEGIN');
        await databaseRun(TablePlayerData);
        await databaseRun(TableClanData);
        await databaseRun(TablePlayerClanData);
        await databaseRun(TableUserConnections);
        await databaseRun(TableGuildConnections);
        await databaseRun('COMMIT');
    } catch (error) {
        await databaseRun('ROLLBACK');
        await writeConsoleANDLog(error);
        throw error;
    }
}
