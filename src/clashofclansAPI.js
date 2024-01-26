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
    return (respuesta.status == "ok") ? true : false;
  } catch {
    return false;
  }
}

// Devuelve el role que tiene el usuario
async function obtenerUsuarioRol(usuarioTag) {
  const apiUrl = `${process.env.LINK_API}/players/${encodeURIComponent(usuarioTag)}`;
  try {
    const respuesta = await peticionApiGet(apiUrl);
    return (respuesta.clan.tag == process.env.CLAN_TAG) ? respuesta.role.toLowerCase() : 'not_member';
  } catch {
    return 'not_member';
  }
}

// Devuelve el nombre que tiene el usuario
async function obtenerUsuarioNombre(usuarioTag) {
  const apiUrl = `${process.env.LINK_API}/players/${encodeURIComponent(usuarioTag)}`;
  try {
    const respuesta = await peticionApiGet(apiUrl);
    return respuesta.name;
  } catch (error) {
    //console.log(error);
    throw error;
  }
}

module.exports = {
  existeUsuarioTag,
  verificarToken,
  obtenerUsuarioRol,
  obtenerUsuarioNombre
}