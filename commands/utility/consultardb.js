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

        // Permisos administrador
        let usuario = interaction.guild.members.cache.get(interaction.user.id);
        if (!usuario) usuario = interaction.guild.members.fetch(interaction.user.id);
        if (!usuario.roles.cache.has('1198307374902034432')) return interaction.reply({ content: mensajes.discord.permisos_insuficientes, ephemeral: true });

        // Tabla ayuda
        if (!solicitudDB) return interaction.reply({ content: mensajes.discord.menu_tabla, ephemeral: true });

        let respuestaDB;
        try {   // Solicitud a la DB
            respuestaDB = await comandosDB.solicitarDBall(solicitudDB);
        } catch (error) { return interaction.reply({ content: mensajes.discord.consultadb_incorrecta, ephemeral: true }); }
        
        if (respuestaDB.length === 0) return interaction.reply({ content: 'No hay datos que coincidan con la busqueda.', ephemeral: true });

        let respuesta = '';
        for (const campo in respuestaDB[0]) {
            respuesta += `${campo}`.padEnd(20);
        }
        respuesta += '\n\n';
        for (const usuario of respuestaDB) {
            for (const atributo in usuario) {
                respuesta += `${usuario[atributo]}`.padEnd(20);
            }
            respuesta += '\n';
        }

        if (respuesta.length < 2000) {  // Tablas pequeñas
            respuesta = '```' + respuesta + '```';
            return interaction.reply({ content: `${respuesta}`, ephemeral: true });
        }
        
        // Tablas grandes
        await interaction.reply({ content: 'Aqui viene la tabla grande', ephemeral: true });
        respuesta = respuesta.split('\n');
        let respuesta2 = "";

        for (const linea of respuesta) {
            if (respuesta2.length + linea.length < 2000) respuesta2 += linea;
            else {
                respuesta2 = '```' + respuesta2 + '```';
                await interaction.followUp({ content: respuesta2, ephemeral: true });
                respuesta2 = linea;
            }
        }
        respuesta2 = '```' + respuesta2 + '```';
        if (respuesta2.length != 0) await interaction.followUp({ content: respuesta2, ephemeral: true });
    }
};