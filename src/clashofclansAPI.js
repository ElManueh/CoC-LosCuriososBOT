const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

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
    throw error;
  }
}

// Obtener información de un usuario
async function obtenerUsuario(usuarioTag) {
  const apiUrl = `${process.env.LINK_API}/players/${encodeURIComponent(usuarioTag)}`;
  try {
    const usuario = await peticionApiGet(apiUrl);
    return usuario;
  } catch (error) {
    throw error.message;
  }
}

// Verificar cuenta de usuario con tokenApi
async function verificarTokenUsuario(usuarioTag, usuarioTokenApi) {
  const apiUrl = `${process.env.LINK_API}/players/${encodeURIComponent(usuarioTag)}/verifytoken`;
  try {
    const tokenValido = await peticionApiPost(apiUrl, usuarioTokenApi);
    return tokenValido.status === 'ok' ? true : false;
  } catch (error) {
    throw error.message;
  }
}

async function obtenerUsuariosClan() {
  const apiUrl = `${process.env.LINK_API}/clans/${encodeURIComponent(process.env.CLAN_TAG)}/members`
  try {
    const usuarios = await peticionApiGet(apiUrl);
    return usuarios.items;
  } catch (error) {
    throw error.message;
  }
}

module.exports = {
  obtenerUsuario,
  verificarTokenUsuario,
  obtenerUsuariosClan
}