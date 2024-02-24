# Bot de Discord - Clash Of Clans

## Información
Proporciona la capacidad de tomar decisiones acerca de que miembros son activos en tu clan, tomando datos como el número de donaciones, número de ataques en guerra y estrellas conseguidas, puntos en los asaltos y medallas invertidas en la capital, entre otras muchas cosas.

## Instalación
Para poder ejecutar el programa, antes debes descargarte los modulos necesarios con
```
npm install
```
Además, tendras que crear un archivo `.env` con las siguientes variables.
```js
DISCORD_TOKEN=""    #Token del bot de Discord 
CLIENT_ID=""  #Id del bot de Discord 
GUILD_ID="" #Id del servidor donde estará el bot

API_KEY=""  #Clave proporcionada por la api de Clash Of Clans para realizar peticiones
CLAN_TAG="" #Tag del clan que quieres vigilar
LINK_API="https://api.clashofclans.com/v1"
```


## 🛠️ Desarrollado
- [**Node JS**](https://nodejs.org/) - Es un entorno de ejecución de JavaScript multiplataforma de código abierto.
- [**ClashOfClans API**](https://developer.clashofclans.com/) - Proporciona acceso casi en tiempo real a datos relacionados con el juego.
- [**Discord JS**](https://discord.js.org/) - Potente módulo Node.js que te permite interactuar con la API de Discord muy fácilmente.