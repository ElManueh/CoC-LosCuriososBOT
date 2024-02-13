const clashofclansAPI = require('../src/clashofclansAPI.js');
const comandosDB = require('../src/comandosDB.js');
const discord = require('../src/discord.js');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("./mybotdata.sqlite");


const tag = '#CLGJ02V9';
let solicitudDB, respuestaDB;

let server = '1198305691375505590';
let discordID = '381077425448026114';

try {
    discord.cambiar_nombre(discordID, 'joseluis', server);
} catch (error) {
    
}