import sqlite3 from 'sqlite3';
import { DatabaseError } from '../errorCreate.js';
import { writeConsoleANDLog } from '../write.js';

// Create new connection with the database
export async function openConnectionDatabase() {
    return new Promise(async (resolve, reject) => {
        const connection = new sqlite3.Database('./mybotdata.sqlite', (err) => {
            if (!err) return resolve(connection);
            return reject(new DatabaseError(err));
        });
        await runDatabase(connection, 'PRAGMA foreign_keys = 1');
    });
}

// Close existing connection with the database
export async function closeConnectionDatabase(connection) {
    return new Promise((resolve, reject) => {
        connection.close((err) => {
            if (!err) return resolve();
            return reject(new DatabaseError(err));
        });
    });
}

// Get one row in the database
export async function getDatabase(connection, request) {
    return new Promise((resolve, reject) => {
        connection.get(request, (err, row) => {
            if (!err) return resolve(row);
            return reject(new DatabaseError(err));
        });
    });
}

// Get all the rows in the database
export async function allDatabase(connection, request) {
    return new Promise((resolve, reject) => {
        connection.all(request, (err, rows) => {
            if (!err) return resolve(rows);
            return reject(new DatabaseError(err));
        });
    });
}

// Execute a command in the database
export async function runDatabase(connection, request) {
    return new Promise((resolve, reject) => {
        connection.run(request, function(err) {
            if (!err) return resolve(true);
            return reject(new DatabaseError(err));
        })
    });
}

// Create all the tables for the database
export async function createDatabase() {
    const TablePlayerData = `
        CREATE TABLE IF NOT EXISTS PlayerData (
            tag                 TEXT    NOT NULL,
            name                TEXT    NOT NULL,
            townHall            INTEGER NOT NULL,
            warPreference       TEXT    NOT NULL,
            lootCapitalT        INTEGER NOT NULL,
            addCapitalT         INTEGER NOT NULL,
            clanGamesT          INTEGER NOT NULL,
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
            lootCapital         INTEGER NOT NULL    DEFAULT 0,
            addCapital          INTEGER NOT NULL    DEFAULT 0,
            clanGames           INTEGER NOT NULL    DEFAULT 0,
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

    const db = await openConnectionDatabase();
    try {
        await runDatabase(db, 'BEGIN');
        await runDatabase(db, TablePlayerData);
        await runDatabase(db, TableClanData);
        await runDatabase(db, TablePlayerClanData);
        await runDatabase(db, TableUserConnections);
        await runDatabase(db, TableGuildConnections);
        await runDatabase(db, 'COMMIT');
        await closeConnectionDatabase(db);
    } catch (error) {
        await runDatabase('ROLLBACK');
        await closeConnectionDatabase(db);
        await writeConsoleANDLog(error);
        throw error;
    }
}