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

function peticionApi(apiUrl) {
  return axios.get(apiUrl, axiosConfig)
  .then(response => {
    return response.data;
  })
  .catch(error => {
    //console.error(error.response.data);
  });
}

// Extraer informacion importante sobre un usuario
function playerInfo(playerTag) {
  let apiUrl = `${process.env.LINK_API}/players/${encodeURIComponent(playerTag)}`;
  peticionApi(apiUrl)
  .then(usuario => {
    console.log(`Nombre: ${usuario.name}`);
    console.log(`Tag: ${usuario.tag}`);
    console.log(`Rol: ${usuario.role}`);
    let participaGuerra = usuario.warPreference == "in" ? "Si" : "No" ;
    console.log(`GuerraParticipacion: ${participaGuerra} `);
    console.log(`ContribucionTotalCapital: ${usuario.clanCapitalContributions}`);
    console.log("");
  })
  .catch(error => {
    console.error(error.usuario);
  });  
}

function obtenerJugadoresClan(clanTag) {
  let apiUrl = `${process.env.LINK_API}/clans/${encodeURIComponent(clanTag)}/members`;
  return peticionApi(apiUrl)
  .then(miembrosClan => {
    return miembrosClan.items
  })
  .catch(error => {
    console.error(error.miembrosClan);
  });  
}

function infoAsaltoSemana(semanasDesdeUltimoAsalto = 0) {
  let apiUrl = `${process.env.LINK_API}/clans/${encodeURIComponent(process.env.CLAN_TAG)}/capitalraidseasons`;
  return peticionApi(apiUrl)
  .then(listaAsaltos => {
    return listaAsaltos.items[semanasDesdeUltimoAsalto];
  })
  .catch(error => {
    console.error(error.listaAsaltos);
  }); 
}

function prueba() {
  let apiUrl = `${process.env.LINK_API}/clans/${encodeURIComponent(process.env.CLAN_TAG)}`;
  return peticionApi(apiUrl)
  .then(infoClan => {
    console.log(infoClan);
  })
  .catch(error => {
    console.error(error.infoClan);
  }); 
}

// Funcion que comprueba si un TAG existe
function existeUsuarioTAG(usuarioTAG) {
  let apiUrl = `${process.env.LINK_API}/players/${encodeURIComponent(usuarioTAG)}`;
  return peticionApi(apiUrl)
  .then(usuario => {
    return usuario ? true : false;
  })
  .catch(error => {
    console.error(error.usuario);
  });  
}

module.exports = {
  prueba,
  existeUsuarioTAG
}