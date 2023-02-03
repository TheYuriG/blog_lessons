// Importing SlashCommandBuilder is required for every slash command
// We also import ChannelType to define what kind of channel we are creating
const { SlashCommandBuilder, ChannelType } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('createnewchannel')
		.setDescription('Ths command creates a text channel called "new"'),
	async execute(interaction) {
		// Before executing any other code, we need to acknowledge the interaction.
		// Discord only gives us 3 seconds to acknowledge an interaction before
		// the interaction gets voided and can't be used anymore.
		await interaction.reply({
			content: 'Fetched all input and working on your request!',
		});

		try {
			// Now create the channel in the server.
			await interaction.guild.channels.create({
				name: 'new', // The name given to the channel
				type: ChannelType.GuildText, // The type of the channel created.
				// Since "text" is the default channel created, this could be ommitted
			});
			// Notice how we are creating a channel in the list of channels
			// of the server. This will cause the channel to spawn at the top
			// of the channels list, without belonging to any categories (more on that later)

			// If we managed to create the channel, edit the initial response with
			// a success message
			await interaction.editReply({
				content: 'Your channel was successfully created!',
			});
		} catch (error) {
			// If an error occurred and we were not able to create the channel
			// the bot is most likely received the "Missing Permissions" error.
			// Log the error to the console
			console.log(error);
			// Also inform the user that an error occurred and give them feedback
			// about how to avoid this error if they want to try again
			await interaction.editReply({
				content:
					'Your channel was could not be created! Please check if the bot has the necessary permissions!',
			});
		}
	},
};
