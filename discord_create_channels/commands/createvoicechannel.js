// Importing SlashCommandBuilder is required for every slash command
// We import PermissionFlagsBits so we can restrict this command usage
// We also import ChannelType to define what kind of channel we are creating
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('createvoicechannel') // Command name matching file name
		.setDescription('Creates a new voice channel')
		// Voice channel name
		.addStringOption((option) =>
			option
				.setName('voicechannelname') // option names need to always be lowercase and have no spaces
				.setDescription('Choose the name to give to the voice channel')
				.setMinLength(1) // A voice channel needs to be named
				.setMaxLength(25) // Discord will cut-off names past the 25 characters,
				// so that's a good hard limit to set. You can manually increase this if you wish
				.setRequired(true)
		)
		// You will usually only want users that can create new channels to
		// be able to use this command and this is what this line does.
		// Feel free to remove it if you want to allow any users to
		// create new channels
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
		// It's impossible to create voice channels inside DMs, so
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
		const chosenVoiceChannelName = interaction.options.getString('voicechannelname');
		// Do note that the string passed to the method .getString() needs to
		// match EXACTLY the name of the option provided (line 12 in this file).
		// If it's not a perfect match, this will always return null

		try {
			// Check if this channel where the command was used is stray
			if (!interaction.channel.parent) {
				// If the channel where the command was used is stray,
				// create another stray voice channel in the server.
				await interaction.guild.channels.create({
					name: chosenVoiceChannelName, // The name given to the channel by the user
					type: ChannelType.GuildVoice, // The type of the channel created.
				});
				// Notice how we are creating a channel in the list of channels
				// of the server. This will cause the channel to spawn at the top
				// of the channels list, without belonging to any categories

				// If we managed to create the channel, edit the initial response with
				// a success message
				await interaction.editReply({
					content: 'Your voice channel was successfully created!',
				});
				return;
			}

			// Check if this channel where the command was used belongs to a category
			if (interaction.channel.parent) {
				// If the channel where the command belongs to a category,
				// create another channel in the same category.
				await interaction.channel.parent.children.create({
					name: chosenVoiceChannelName, // The name given to the channel by the user
					type: ChannelType.GuildVoice, // The type of the channel created.
				});

				// If we managed to create the channel, edit the initial response with
				// a success message
				await interaction.editReply({
					content: 'Your voice channel was successfully created in the same category!',
				});
				return;
			}
		} catch (error) {
			// If an error occurred and we were not able to create the channel
			// the bot is most likely received the "Missing Permissions" error.
			// Log the error to the console
			console.log(error);
			// Also inform the user that an error occurred and give them feedback
			// about how to avoid this error if they want to try again
			await interaction.editReply({
				content:
					'Your voice channel could not be created! Please check if the bot has the necessary permissions!',
			});
		}
	},
};
