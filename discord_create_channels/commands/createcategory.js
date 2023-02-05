// Importing SlashCommandBuilder is required for every slash command
// We import PermissionFlagsBits so we can restrict this command usage
// We also import ChannelType to define what kind of channel we are creating
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('createcategory') // Command name matching file name
		.setDescription('Creates a new category')
		// Category name
		.addStringOption((option) =>
			option
				.setName('categoryname') // option names need to always be lowercase and have no spaces
				.setDescription('Choose the name to give to the category')
				.setMinLength(1) // A category needs to be named
				.setMaxLength(25) // Discord will cut-off names past the ~27 characters (for categories),
				// so that's a good hard limit to set. You can manually increase this if you wish
				.setRequired(true)
		)
		// You will usually only want users that can create new channels to
		// be able to use this command and this is what this line does.
		// Feel free to remove it if you want to allow any users to
		// create new channels
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
		// It's impossible to create categories inside DMs, so it's in your
		// best interest in disabling this command through DMs as well.
		.setDMPermission(false),
	async execute(interaction) {
		// Before executing any other code, we need to acknowledge the interaction.
		// Discord only gives us 3 seconds to acknowledge an interaction before
		// the interaction gets voided and can't be used anymore.
		await interaction.reply({
			content: 'Fetched all input and working on your request!',
		});

		// After acknowledging the interaction, we retrieve the string sent by the user
		const chosenCategoryName = interaction.options.getString('categoryname');
		// Do note that the string passed to the method .getString() needs to
		// match EXACTLY the name of the option provided (line 12 in this file).
		// If it's not a perfect match, this will always return null

		try {
			// Now create the category in the server.
			await interaction.guild.channels.create({
				name: chosenCategoryName, // The name given to the channel by the user
				type: ChannelType.GuildCategory, // The type of the channel created.
			});
			// Notice how we are creating a category in the list of channels
			// of the server. This will cause the category to spawn at the top
			// of the channels list

			// If we managed to create the category, edit the initial response
			// with a success message
			await interaction.editReply({
				content: 'Your category was successfully created!',
			});
		} catch (error) {
			// If an error occurred and we were not able to create the category
			// the bot is most likely received the "Missing Permissions" error.
			// Log the error to the console
			console.log(error);
			// Also inform the user that an error occurred and give them feedback
			// about how to avoid this error if they want to try again
			await interaction.editReply({
				content:
					'Your category could not be created! Please check if the bot has the necessary permissions!',
			});
		}
	},
};
