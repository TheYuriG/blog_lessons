// Importing SlashCommandBuilder is required for every slash command
const { SlashCommandBuilder } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('example')
		.setDescription('This command does nothing by default'),
	async execute(interaction) {},
};
