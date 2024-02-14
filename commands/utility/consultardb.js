const { SlashCommandBuilder } = require('discord.js');
const comandosDB = require('../../src/comandosDB.js');
const mensajes = require('../../src/locale.json');

module.exports = {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('consultardb')
		.setDescription('Realiza consultas a la base de datos. (Si no hay consulta muestra un menu de uso)')
		.addStringOption(option => option
			.setName('consulta')
			.setDescription('Consulta en formato SQL.')),
	async execute(interaction) {
        const solicitudDB = interaction.options.getString('consulta');

        let usuario = interaction.guild.members.cache.get(interaction.user.id);
        if (!usuario) usuario = interaction.guild.members.fetch(interaction.user.id);
        if (!usuario.roles.cache.has('1198307374902034432')) return interaction.reply({ content: mensajes.discord.permisos_insuficientes, ephemeral: true });

        if (!solicitudDB) return interaction.reply({ content: mensajes.discord.menu_tabla, ephemeral: true });

        let respuestaDB;
        try {
            respuestaDB = await comandosDB.solicitarDBall(solicitudDB);
        } catch (error) {
            return interaction.reply({ content: mensajes.discord.consultadb_incorrecta, ephemeral: true });
        }

        console.log(respuestaDB);

        let respuesta = "```ID             | Tag         | Nombre       | Rol       | Estado | Otra columna1 | Otra columna2 | Otra columna3 | Otra columna4\n";
        respuesta += "------------------------------------------------------------------------------------------------------------------------------\n";
        for (const usuario of respuestaDB) {
            for (const atributo in usuario) {
                respuesta += `${usuario[atributo]}`.padEnd(20);
            }
            respuesta += `\n`;
        }
        respuesta += "```";
        await interaction.reply({ content: `${respuesta}`, ephemeral: true }); 
        //console.log(respuestaDB);
    }
};