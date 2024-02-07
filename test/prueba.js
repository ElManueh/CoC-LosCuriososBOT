const clashofclansAPI = require('../src/clashofclansAPI.js');
const comandosDB = require('../src/comandosDB.js');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("./mybotdata.sqlite");


const tag = '#CLGJ02V9';
let solicitudDB, respuestaDB;