const clashofclansAPI = require('../src/clashofclansAPI.js');
const comandosDB = require('../src/comandosDB');
const discord = require('../src/discord.js');
const eventos = require('../src/eventos.js');

const tag = '#CLGJ02V9';
const server = '1198305691375505590';
const discordID = '381077425448026114';

let solicitudDB, respuestaDB;


clashofclansAPI.obtenerGuerraActualClan()
    .then(resp => console.log(resp))

