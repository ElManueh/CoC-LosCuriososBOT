const axios = require('axios');
const { discordSort } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

const clanTag = '#2G00G8RP8';

// Configuración de la solicitud con la clave de API
const axiosConfig = {
  headers: {
    'Authorization': `Bearer ${process.env.API_KEY}`,
    'Accept': 'application/json',
  },
};

// Solicitud API GET
async function peticionApiGet(apiUrl) {
  try {
    const respuestaApi = await axios.get(apiUrl, axiosConfig);
    return respuestaApi.data;
  } catch (error) {
    // console.error('- Solicitud a COC_API incorrecta.');
    throw error;
  }
}

// Solicitud API POST
async function peticionApiPost(apiUrl, bodyData) {
  const data = { "token": `${bodyData}` };
  try {
    const respuestaApi = await axios.post(apiUrl, data, axiosConfig);
    return respuestaApi.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Comprobar TAG valido de usuario
async function existeUsuarioTag(usuarioTag) {
  const apiUrl = `${process.env.LINK_API}/players/${encodeURIComponent(usuarioTag)}`;
  try {
    await peticionApiGet(apiUrl);
    return true;
  } catch {
    return false;
  }
}

// Verificar cuenta de usuario con tokenApi
async function verificarToken(usuarioTag, usuarioTokenApi) {
  const apiUrl = `${process.env.LINK_API}/players/${encodeURIComponent(usuarioTag)}/verifytoken`;
  try {
    const respuesta = await peticionApiPost(apiUrl, usuarioTokenApi);
    return respuesta.status == "ok" ? true : false;
  } catch {
    return false;
  }
}

// Devuelve el role que tiene el usuario
async function obtenerUsuarioRol(usuarioTag) {
  const apiUrl = `${process.env.LINK_API}/players/${encodeURIComponent(usuarioTag)}`;
  try {
    const respuesta = await peticionApiGet(apiUrl);
    if (respuesta.clan.tag != clanTag) return 'not_member';
    return respuesta.role.toLowerCase();
  } catch {
    return 'not_member';
  }
}

module.exports = {
  existeUsuarioTag,
  verificarToken,
  obtenerUsuarioRol
}