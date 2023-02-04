// Importing SlashCommandBuilder is required for every slash command
// We import PermissionFlagsBits so we can restrict this command usage
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('createrole') // Command name matching file name
		.setDescription('Creates a new role')
		// Role name
		.addStringOption((option) =>
			option
				.setName('rolename') // option names need to always be lowercase and have no spaces
				.setDescription('Choose the name to give to the role')
				.setMinLength(1) // A role needs to be named
				.setMaxLength(100) // Hard limit set by Discord for role names
				.setRequired(true)
		)
		// You will usually only want users that can create new channels to
		// be able to use this command and this is what this line does.
		// Feel free to remove it if you want to allow any users to
		// create new channels
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
		// It's impossible to create roles inside DMs, so
		// it's in your best interest in disabling this command through DMs
		.setDMPermission(false),
	async execute(interaction) {
		// Before executing any other code, we need to acknowledge the interaction.
		// Discord only gives us 3 seconds to acknowledge an interaction before
		// the interaction gets voided and can't be used anymore.
		await interaction.reply({
			content: 'Fetched all input and working on your request!',
		});

		// After acknowledging the interaction, we retrieve the string sent by the user
		const chosenRoleName = interaction.options.getString('rolename');
		// Do note that the string passed to the method .getString() needs to
		// match EXACTLY the name of the option provided (line 12 in this file).
		// If it's not a perfect match, this will always return null

		try {
			// Create the role
			await interaction.guild.roles.create({
				name: chosenRoleName,
			});

			// Inform the user about the role creation being successful
			await interaction.editReply({ content: 'Your role was created successfully!' });
			return;
		} catch (error) {
			// If an error occurred and we were not able to create the channel
			// the bot is most likely received the "Missing Permissions" error.
			// Log the error to the console
			console.log(error);
			// Also inform the user that an error occurred and give them feedback
			// about how to avoid this error if they want to try again
			await interaction.editReply({
				content:
					'Your role could not be created! Please check if the bot has the necessary permissions!',
			});
			return;
		}
	},
};
