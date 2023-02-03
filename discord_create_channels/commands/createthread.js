// Importing SlashCommandBuilder is required for every slash command
const { SlashCommandBuilder } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('createthread') // Command name matching file name
		.setDescription('Creates a new thread')
		// Thread name
		.addStringOption((option) =>
			option
				.setName('threadname') // option names need to always be lowercase and have no spaces
				.setDescription('Choose the name to give to the thread')
				.setRequired(true)
		)
		// Thread starts from message
		.addBooleanOption((option) =>
			option
				.setName('messageparent') // option names need to always be lowercase and have no spaces
				.setDescription('Choose if this thread should be use the initial message as parent')
				.setRequired(true)
		),
	async execute(interaction) {
		// Before executing any other code, we need to acknowledge the interaction.
		// Discord only gives us 3 seconds to acknowledge an interaction before
		// the interaction gets voided and can't be used anymore.
		const interactionReplied = await interaction.reply({
			content: 'Fetched all input and working on your request!',
			fetchReply: true, // notice how we are instantiating this reply to
			// a constant and passing `fetchReply: true` in the reply options
		});

		// After acknowledging the interaction, we retrieve the string sent by the user
		const chosenThreadName = interaction.options.getString('threadname');
		const threadWithMessageAsParent = interaction.options.getBoolean('messageparent');
		// Do note that the string passed to the method .getString() and .getBoolean()
		// needs to match EXACTLY the name of the options provided (line 10 and 17
		// in this file). If it's not a perfect match, these will always return null

		try {
			// Check if the current channel the command was used is a thread,
			// which would cause the creation of another thread to fail.
			// Threads cannot be parents of other threads!
			if (interaction.channel.isThread() == true) {
				// If the current channel is a thread, return a fail message
				// and stop the command
				await interactionReplied.edit({
					content: `It's impossible to create a thread within another thread. Try again inside a text channel!`,
				});
				return; // Return statement here to stop all further code execution on this file
			}

			// Check if the channel where the command was used is not a thread
			if (interaction.channel.isThread() == false) {
				// If the channel isn't a thread, check if the user
				// requested the initial message to be the parent of the thread
				if (threadWithMessageAsParent == true) {
					// If the initial message will be used as parent for the
					// thread, check if the message already has a thread
					if (interactionReplied.hasThread == true) {
						// If the initial message already has a thread,
						// return an error message to the user and stop the command
						interactionReplied.edit({
							content:
								'It was not possible to create a thread in this message because it already has one.',
						});
						return; // Return statement here to stop all further code execution on this file
					}

					// If the initial message will be used as parent for the
					// thread, check if the message already doesn't have a thread
					if (interactionReplied.hasThread == false) {
						// If the initial message doesn't have a thread,
						// create one.
						await interactionReplied.startThread({
							name: chosenThreadName,
						});
						// We don't return here because we want
						// to use the success message below
					}
				}

				// If the initial message isn't meant to be the parent of
				// the thread, create an orphaned thread in this channel
				if (threadWithMessageAsParent == false) {
					// Create the orphaned thread in the command channel
					await interaction.channel.threads.create({
						name: chosenThreadName,
					});
					// We don't return here because we want
					// to use the success message below
				}

				// If we managed to create the thread, orphaned or using the
				// initial message as parent, edit the initial response
				// with a success message
				await interactionReplied.edit({
					content: 'Your thread was successfully created!',
				});
			}
		} catch (error) {
			// If an error occurred and we were not able to create the thread,
			// the bot is most likely received the "Missing Permissions" error.
			// Log the error to the console
			console.log(error);
			// Also inform the user that an error occurred and give them feedback
			// about how to avoid this error if they want to try again
			await interactionReplied.edit({
				content:
					'Your thread could not be created! Please check if the bot has the necessary permissions!',
			});
			return;
		}
	},
};
