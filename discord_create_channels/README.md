# How to create Categories, Text Channels, Threads, Voice Channels, and Roles in Discord.JS v14

Navigating through [Discord.JS' guide](https://discordjs.guide/#before-you-begin) and [documentation](https://discord.js.org/#/docs/discord.js/main/general/welcome) can be confusing if you are new to programming, as many bot creators will also be learning how to code to create their bot (it was my first project too, back in 2018!). This README.md aims to simplify the learning process to make different types of Channels from a slash command interaction.
Before anything else, it's essential to share links to relevant resources used in this blog post:

-   [Discord.JS' support server](https://discord.com/invite/djs)
-   [Discord.JS' guide (currently at v14)](https://discordjs.guide/#before-you-begin)
-   [Discord.JS' documentation (currently at v14)](https://discord.js.org/#/docs/discord.js/main/general/welcome)

Remember that if you have any questions, **Google your issue first**, and, if you can't find the solution, join the [support server](https://discord.com/invite/djs) and ask for help in the proper v14 help channel.

First, this guide assumes you already have a [bot set up](https://discordjs.guide/preparations/setting-up-a-bot-application.html), use [slash command interactions](https://discordjs.guide/creating-your-bot/slash-commands.html), you have a [command handler](https://discordjs.guide/creating-your-bot/command-handling.html) set up and the command you are using was already deployed. You will need to update the code on your own if you are still using `messageCreate` events instead.

Second, this guide assumes you are using Javascript over Typescript. Feel free to use the [documentation website](https://discord.js.org/#/docs/discord.js/main/general/welcome) if you need assistance defining your types.

Third, all code for the topics in these lessons will be available on this [GitHub repository](https://github.com/TheYuriG/blog_lessons/tree/master/discord_create_channels/commands). The code written is very verbose on purpose, as this guide aims to help even the newest programmer to update their bot. You will see values being checked for `true` and then for `false` right after. This is intended because I want to make the code examples extremely clear and easy to understand for newer programmers. If you choose to copy my files and you are more experienced in writing Javascript, feel free to update the code and remove those additional checks.

Last, but not least, this article will briefly touch on the creation of certain Discord features, but will not dive deep into topics like "editing an existing channel" or "setting permissions for channels". These topics can be used to write new guides in the future if the interest is there. If you feel like you have some additional knowledge to share that can build on top of this article, feel free to check the [How to contribute](#how-to-contribute) section.

## Creating your first Text Channel

Let's start with your basic file. We will not have [options](https://discord.js.org/#/docs/discord.js/main/typedef/CommandInteractionOption) added as I'm not assuming how configurable you want the commands to be, but you can (and we will) add more [options](https://discord.js.org/#/docs/discord.js/main/typedef/CommandInteractionOption) later.

```js
// Importing SlashCommandBuilder is required for every slash command
// We import PermissionFlagsBits so we can restrict this command usage
// We also import ChannelType to define what kind of Channel we are creating
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('createnewchannel') // Command name matching file name
		.setDescription('Ths command creates a text channel called "new"')
		// You will usually only want users that can create new Channels to
		// be able to use this command and this is what this line does.
		// Feel free to remove it if you want to allow any users to
		// create new Channels
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
		// It's impossible to create normal Text Channels inside DMs, so
		// it's in your best interest in disabling this command through DMs
		// as well. Threads, however, can be created in DMs, but we will see
		// more about them later in this post
		.setDMPermission(false),
	async execute(interaction) {
		// Before executing any other code, we need to acknowledge the interaction.
		// Discord only gives us 3 seconds to acknowledge an interaction before
		// the interaction gets voided and can't be used anymore.
		await interaction.reply({
			content: 'Fetched all input and working on your request!',
		});

		try {
			// Now create the Channel in the server.
			await interaction.guild.channels.create({
				name: 'new', // The name given to the Channel
				type: ChannelType.GuildText, // The type of the Channel created.
				// Since "text" is the default Channel created, this could be ommitted
			});
			// Notice how we are creating a Channel in the list of Channels
			// of the server. This will cause the Channel to spawn at the top
			// of the Channels list, without belonging to any Categories (more on that later)

			// If we managed to create the Channel, edit the initial response with
			// a success message
			await interaction.editReply({
				content: 'Your channel was successfully created!',
			});
		} catch (error) {
			// If an error occurred and we were not able to create the Channel
			// the bot is most likely received the "Missing Permissions" error.
			// Log the error to the console
			console.log(error);
			// Also inform the user that an error occurred and give them feedback
			// about how to avoid this error if they want to try again
			await interaction.editReply({
				content:
					'Your channel could not be created! Please check if the bot has the necessary permissions!',
			});
		}
	},
};
```

[_createnewchannel.js_](https://github.com/TheYuriG/blog_lessons/blob/master/discord_create_channels/commands/createnewchannel.js)

[Deploying this command](https://discordjs.guide/creating-your-bot/command-deployment.html#command-registration), refreshing your client, and triggering the command will always create a new Channel called "new". But that's not very versatile, is it? Let's tweak the code a bit so we can choose what name we want to give the Channel now.

## Creating a Text Channel with a dynamic name

To be able to set the name from the command itself, we need to tweak the code a little, add [options](https://discord.js.org/#/docs/discord.js/main/typedef/CommandInteractionOption) to the command, and then retrieve the name provided by the user in our file.

```js
// ...
// initial code unchanged
// ...

// Text Channel name
.addStringOption((option) =>
	option
		.setName('channelname') // option names need to always be lowercase and have no spaces
		.setDescription('Choose the name to give to the channel')
		.setMinLength(1) // A Text Channel needs to be named
		.setMaxLength(25) // Discord will cut-off names past the 25 characters,
		// so that's a good hard limit to set. You can manually increase this if you wish
		.setRequired(true)
)

// ...
// code in between unchanged
// ...

const chosenChannelName = interaction.options.getString('channelname');

// ...
// code in between unchanged
// ...

await interaction.guild.channels.create({
    name: chosenChannelName, // The name given to the Channel by the user
    type: ChannelType.GuildText, // The type of the Channel created.
    // Since "text" is the default Channel created, this could be ommitted
});

// ...
// rest of the code unchanged
// ...
```

[_createchannel.js_](https://github.com/TheYuriG/blog_lessons/blob/master/discord_create_channels/commands/createchannel.js)

A small note here: [Discord has a visual limit of around 25 characters for channels on the sidebar](https://discord.com/moderation/208-channel-categories-and-names), but they don't define an actual hard limit for Channel names and expect users to have common sense. If you choose to override the 25-character limit in [line 15](https://github.com/TheYuriG/blog_lessons/blob/4fc83cf7d08c20fc43cc0018d24db2eb9ff33ae1/discord_create_channels/commands/createchannel.js#L15), please ensure there is another limit in place to stop users from creating absurdly long Channel names. [Avoid giving them enough rope to hang themselves](https://www.collinsdictionary.com/dictionary/english/give-someone-enough-rope-to-hang-himself-or-herself).

After saving your file, reloading your bot, and [redeploying your commands](https://discordjs.guide/creating-your-bot/command-deployment.html#command-registration), you now have a command that can quickly create a new [Text Channel](https://discord.js.org/#/docs/discord.js/main/class/TextChannel). Neat, huh? But we are still creating stray Channels at the top of the Channel list. Let's change that now.

## Create a Channel that is nested in the parent Category (when there is one)

More experienced Discord users won't be expecting the newly created Channel to appear on the top of the Channel list, but instead, to be within the same [Category](https://discord.js.org/#/docs/discord.js/main/class/CategoryChannel) of the Channel they used the command in. We will now be tweaking our code to create Channels with that behavior whenever the server has [Categories](https://discord.js.org/#/docs/discord.js/main/class/CategoryChannel) set up, but still, be able to create stray Channels if the command was used in a Channel that isn't nested in a [Category](https://discord.js.org/#/docs/discord.js/main/class/CategoryChannel).

```js
// ...
// initial code unchanged
// ...

// Check if this Channel where the command was used is stray
if (!interaction.channel.parent) {
	// If the Channel where the command was used is stray,
	// create another stray Channel in the server.
	await interaction.guild.channels.create({
		name: chosenChannelName, // The name given to the Channel by the user
		type: ChannelType.GuildText, // The type of the Channel created.
		// Since "text" is the default Channel created, this could be ommitted
	});
	// Notice how we are creating a Channel in the list of Channels
	// of the server. This will cause the Channel to spawn at the top
	// of the Channels list, without belonging to any Categories (more on that later)

	// If we managed to create the Channel, edit the initial response with
	// a success message
	await interaction.editReply({
		content: 'Your channel was successfully created!',
	});
	return;
}

// Check if this Channel where the command was used belongs to a Category
if (interaction.channel.parent) {
	// If the Channel where the command belongs to a Category,
	// create another Channel in the same Category.
	await interaction.channel.parent.children.create({
		name: chosenChannelName, // The name given to the Channel by the user
		type: ChannelType.GuildText, // The type of the Channel created.
		// Since "text" is the default Channel created, this could be ommitted
	});

	// If we managed to create the Channel, edit the initial response with
	// a success message
	await interaction.editReply({
		content: 'Your channel was successfully created in the same category!',
	});
	return;
}

// ...
// rest of the code unchanged
// ...
```

[_createchannelincategory.js_](https://github.com/TheYuriG/blog_lessons/blob/master/discord_create_channels/commands/createchannelincategory.js)

Let's go through this bit by bit.

> _if (!interaction.channel.parent) { ([line 45](https://github.com/TheYuriG/blog_lessons/blob/4fc83cf7d08c20fc43cc0018d24db2eb9ff33ae1/discord_create_channels/commands/createchannelincategory.js#L45))_

First, we are checking if the Channel where the command was used doesn't have a [parent](https://discord.js.org/#/docs/discord.js/main/class/CategoryChannel), which would mean they are not nested within a [Category](https://discord.js.org/#/docs/discord.js/main/class/CategoryChannel). If this check succeeds, then this is a stray Channel and we can reuse our previous code to create another stray Channel. Do note that we end this if check with a `return` statement. More on that is below.

> _if (interaction.channel.parent) { ([line 66](https://github.com/TheYuriG/blog_lessons/blob/4fc83cf7d08c20fc43cc0018d24db2eb9ff33ae1/discord_create_channels/commands/createchannelincategory.js#L66))_

Now we are checking if the Channel where the command was used does have a [parent](https://discord.js.org/#/docs/discord.js/main/class/CategoryChannel), meaning they are nested in a [Category](https://discord.js.org/#/docs/discord.js/main/class/CategoryChannel).

> _await interaction.channel.parent.children.create({ ([line 69](https://github.com/TheYuriG/blog_lessons/blob/4fc83cf7d08c20fc43cc0018d24db2eb9ff33ae1/discord_create_channels/commands/createchannelincategory.js#L69))_

Since the Channel where the command was used does have a [parent](https://discord.js.org/#/docs/discord.js/main/class/CategoryChannel), we need to create our Channel inside that same [Category](https://discord.js.org/#/docs/discord.js/main/class/CategoryChannel). For that, we need to first access the [children](https://discord.js.org/#/docs/discord.js/main/class/CategoryChannelChildManager) of that [Category](https://discord.js.org/#/docs/discord.js/main/class/CategoryChannel) and then create our Channel within.

Now that we are handling both cases for stray Channels and nested Channels, let's switch gears for a moment and talk about [Threads](https://discord.js.org/#/docs/discord.js/main/class/ThreadChannel) before we proceed to [Voice Channels](https://discord.js.org/#/docs/discord.js/main/class/VoiceChannel), [Categories](https://discord.js.org/#/docs/discord.js/main/class/CategoryChannel), and [Roles](https://discord.js.org/#/docs/discord.js/main/class/Role).

## Create a Thread with a dynamic name

Starting a [Thread](https://discord.js.org/#/docs/discord.js/main/class/ThreadChannel) is about as simple as creating a [Channel](https://discord.js.org/#/docs/discord.js/main/class/BaseChannel), all you need is either a message or a [Channel](https://discord.js.org/#/docs/discord.js/main/class/BaseChannel) that will host the [Thread](https://discord.js.org/#/docs/discord.js/main/class/ThreadChannel). Because [Threads](https://discord.js.org/#/docs/discord.js/main/class/ThreadChannel) live inside a [Channel](https://discord.js.org/#/docs/discord.js/main/class/BaseChannel), regardless of using a message as a starting point or not, you don't need to care for [Categories](https://discord.js.org/#/docs/discord.js/main/class/CategoryChannel).

```js
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
			// Check if the current Channel the command was used is a Thread,
			// which would cause the creation of another Thread to fail.
			// Threads cannot be parents of other Threads!
			if (interaction.channel.isThread() == true) {
				// If the current Channel is a Thread, return a fail message
				// and stop the command
				await interactionReplied.edit({
					content: `It's impossible to create a thread within another thread. Try again inside a text channel!`,
				});
				return; // Return statement here to stop all further code execution on this file
			}

			// Check if the Channel where the command was used is not a Thread
			if (interaction.channel.isThread() == false) {
				// If the Channel isn't a Thread, check if the user
				// requested the initial message to be the parent of the Thread
				if (threadWithMessageAsParent == true) {
					// If the initial message will be used as parent for the
					// Thread, check if the message already has a Thread
					if (interactionReplied.hasThread == true) {
						// If the initial message already has a Thread,
						// return an error message to the user and stop the command
						interactionReplied.edit({
							content:
								'It was not possible to create a thread in this message because it already has one.',
						});
						return; // Return statement here to stop all further code execution on this file
					}

					// If the initial message will be used as parent for the
					// Thread, check if the message already doesn't have a Thread
					if (interactionReplied.hasThread == false) {
						// If the initial message doesn't have a Thread,
						// create one.
						await interactionReplied.startThread({
							name: chosenThreadName,
						});
						// We don't return here because we want
						// to use the success message below
					}
				}

				// If the initial message isn't meant to be the parent of
				// the Thread, create an orphaned Thread in this Channel
				if (threadWithMessageAsParent == false) {
					// Create the orphaned Thread in the command Channel
					await interaction.channel.threads.create({
						name: chosenThreadName,
					});
					// We don't return here because we want
					// to use the success message below
				}

				// If we managed to create the Thread, orphaned or using the
				// initial message as parent, edit the initial response
				// with a success message
				await interactionReplied.edit({
					content: 'Your thread was successfully created!',
				});
			}
		} catch (error) {
			// If an error occurred and we were not able to create the Thread,
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
```

[_createthread.js_](https://github.com/TheYuriG/blog_lessons/blob/master/discord_create_channels/commands/createthread.js)

Alright, few key points with this code:

-   We are now storing the [message](https://discord.js.org/#/docs/discord.js/main/class/Message) sent as a reply to the interaction in the constant `interactionReplied` ([line 25](https://github.com/TheYuriG/blog_lessons/blob/4fc83cf7d08c20fc43cc0018d24db2eb9ff33ae1/discord_create_channels/commands/createthread.js#L25)). This is done so we can refer to that [message](https://discord.js.org/#/docs/discord.js/main/class/Message) later if the user requested to use our message as a parent to the [Thread](https://discord.js.org/#/docs/discord.js/main/class/ThreadChannel) we are going to [create](https://discord.js.org/#/docs/discord.js/main/class/Message?scrollTo=startThread) ([line 73](https://github.com/TheYuriG/blog_lessons/blob/4fc83cf7d08c20fc43cc0018d24db2eb9ff33ae1/discord_create_channels/commands/createthread.js#L73)).
-   We also handle the case that the user might not want to create a [Thread](https://discord.js.org/#/docs/discord.js/main/class/ThreadChannel) on the message itself, so an orphaned [Thread](https://discord.js.org/#/docs/discord.js/main/class/ThreadChannel) is created in the [Channel](https://discord.js.org/#/docs/discord.js/main/class/BaseChannel) where the command was used instead.

## Create a Voice Channel that is nested in the parent Category (when there is one)

Creating a [Voice Channel](https://discord.js.org/#/docs/discord.js/main/class/VoiceChannel) isn't that much different than creating a [Text Channel](https://discord.js.org/#/docs/discord.js/main/class/TextChannel). [Voice Channels](https://discord.js.org/#/docs/discord.js/main/class/VoiceChannel) won't get their names normalized to lowercase and have their spaces replaced by dashes, so whatever you write will be what will be used. Because of how similar Voice and [Text Channels](https://discord.js.org/#/docs/discord.js/main/class/TextChannel) are, we can reuse most of the code we used for the [Text Channel](https://discord.js.org/#/docs/discord.js/main/class/TextChannel) and make small adjustments.

```js
// Importing SlashCommandBuilder is required for every slash command
// We import PermissionFlagsBits so we can restrict this command usage
// We also import ChannelType to define what kind of Channel we are creating
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('createvoicechannel') // Command name matching file name
		.setDescription('Creates a new voice channel')
		// Voice Channel name
		.addStringOption((option) =>
			option
				.setName('voicechannelname') // option names need to always be lowercase and have no spaces
				.setDescription('Choose the name to give to the voice channel')
				.setMinLength(1) // A Voice Channel needs to be named
				.setMaxLength(25) // Discord will cut-off names past the 25 characters,
				// so that's a good hard limit to set. You can manually increase this if you wish
				.setRequired(true)
		)
		// You will usually only want users that can create new Channels to
		// be able to use this command and this is what this line does.
		// Feel free to remove it if you want to allow any users to
		// create new Channels
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
		// It's impossible to create Voice Channels inside DMs, so
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
			// Check if this Channel where the command was used is stray
			if (!interaction.channel.parent) {
				// If the Channel where the command was used is stray,
				// create another stray Voice Channel in the server.
				await interaction.guild.channels.create({
					name: chosenVoiceChannelName, // The name given to the Channel by the user
					type: ChannelType.GuildVoice, // The type of the Channel created.
				});
				// Notice how we are creating a Channel in the list of Channels
				// of the server. This will cause the Channel to spawn at the top
				// of the Channels list, without belonging to any Categories

				// If we managed to create the Channel, edit the initial response with
				// a success message
				await interaction.editReply({
					content: 'Your voice channel was successfully created!',
				});
				return;
			}

			// Check if this Channel where the command was used belongs to a Category
			if (interaction.channel.parent) {
				// If the Channel where the command belongs to a Category,
				// create another Channel in the same Category.
				await interaction.channel.parent.children.create({
					name: chosenVoiceChannelName, // The name given to the Channel by the user
					type: ChannelType.GuildVoice, // The type of the Channel created.
				});

				// If we managed to create the Channel, edit the initial response with
				// a success message
				await interaction.editReply({
					content: 'Your voice channel was successfully created in the same category!',
				});
				return;
			}
		} catch (error) {
			// If an error occurred and we were not able to create the Channel
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
```

[_createvoicechannel.js_](https://github.com/TheYuriG/blog_lessons/blob/master/discord_create_channels/commands/createvoicechannel.js)

A few tweaks were made, variables were renamed, comments were updated, and error messages were updated, but the process isn't much different from creating a [Text Channel](https://discord.js.org/#/docs/discord.js/main/class/TextChannel). One of the few features that [Voice Channels](https://discord.js.org/#/docs/discord.js/main/class/VoiceChannel) have over [Text Channels](https://discord.js.org/#/docs/discord.js/main/class/TextChannel) is the ability to limit the number of users it can hold at once. Let's take a look at how to do that now.

## Create a Voice Channel that has a maximum number of concurrent users

One of the exclusive features that [Voice Channels](https://discord.js.org/#/docs/discord.js/main/class/VoiceChannel) have over other Channels is the ability to [limit](https://discord.js.org/#/docs/discord.js/main/class/VoiceChannel?scrollTo=userLimit) the number of users that can use it at the same time. To set this number, all you gotta do is pass in an integer for the [userLimit](https://discord.js.org/#/docs/discord.js/main/class/VoiceChannel?scrollTo=userLimit) key when creating a [Voice Channel](https://discord.js.org/#/docs/discord.js/main/class/VoiceChannel).

```js
// ...
// initial code unchanged
// ...

  // Voice Channel limit of participants
.addIntegerOption(
    (option) =>
        option
            .setName('voiceuserlimit') // option names need to always be lowercase and have no spaces
            .setDescription(
                'Select the maximum number of concurrent users for the voice channel'
            )
            .setMinValue(2) // A voice Channel with less than 2 users will be useless
            // for nearly every case, so we will disable users from creating voice
            // Channels that can take less than that
            .setRequired(false)
)

// ...
// code in between unchanged
// ...

    // After acknowledging the interaction, we retrieve the input sent by the user
    const chosenVoiceChannelName = interaction.options.getString('voicechannelname');
    const voiceChannelUserLimit = interaction.options.getInteger('voiceuserlimit') ?? undefined;

// ...
// code in between unchanged
// ...

    name: chosenVoiceChannelName, // The name given to the Channel by the user
    type: ChannelType.GuildVoice, // The type of the Channel created.
    userLimit: voiceChannelUserLimit, // The max number of concurrent users

// ...
// rest of the code unchanged
// ...
```

[_createvoicewithuserlimit.js_](https://github.com/TheYuriG/blog_lessons/blob/master/discord_create_channels/commands/createvoicewithuserlimit.js)

There are a few key points that need to be talked about. The first of them is that we are not requiring the limit to be set ([line 30](https://github.com/TheYuriG/blog_lessons/blob/4fc83cf7d08c20fc43cc0018d24db2eb9ff33ae1/discord_create_channels/commands/createvoicewithuserlimit.js#L30)). This allows the user to set a limit if they want but also allows the Channel to be unlimited if they don't.

> _const voiceChannelUserLimit = interaction.options.getInteger('voiceuserlimit') ?? undefined;_

To avoid this causing an error when creating the [Voice Channel](https://discord.js.org/#/docs/discord.js/main/class/VoiceChannel), we check ([line 49](https://github.com/TheYuriG/blog_lessons/blob/4fc83cf7d08c20fc43cc0018d24db2eb9ff33ae1/discord_create_channels/commands/createvoicewithuserlimit.js#L49)) if a value was passed and, if .getInteger() returns us null, then then the [Javascript Nullish Coalescence](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing) operator `??` will set the value to `undefined`.

> _userLimit: voiceChannelUserLimit_

Passing _undefined_ to the [userLimit](https://discord.js.org/#/docs/discord.js/main/typedef/GuildChannelCreateOptions) key when creating a [Voice Channel](https://discord.js.org/#/docs/discord.js/main/class/VoiceChannel) will make it unlimited, while any integer would be used as the actual limit.

## Creating Categories

As mentioned in the previous lessons, [Categories](https://discord.js.org/#/docs/discord.js/main/class/CategoryChannel) are the parents of some Channels. Not all Channels belong to a [Category](https://discord.js.org/#/docs/discord.js/main/class/CategoryChannel) (the ones that don't, are referred as "stray Channels").

Categories exist for primarily two reasons: Organizing Channels within a certain topic and quickly syncing the permissions of all Channels within it. They also are very simple to create, even simpler than [Voice Channels](https://discord.js.org/#/docs/discord.js/main/class/VoiceChannel) or [Text Channels](https://discord.js.org/#/docs/discord.js/main/class/TextChannel), since the number of configuration options for them is limited.

Let's modify the [Text Channel](https://discord.js.org/#/docs/discord.js/main/class/TextChannel) file a bit and then talk about the differences between them and [Categories](https://discord.js.org/#/docs/discord.js/main/class/CategoryChannel):

```js
// ...
// initial code unchanged
// ...

.addStringOption((option) =>
    option
        .setName('categoryname') // option names need to always be lowercase and have no spaces
        .setDescription('Choose the name to give to the category')
        .setMinLength(1) // A Category needs to be named
        .setMaxLength(25) // Discord will cut-off names past the ~27 characters (for Categories),
        // so that's a good hard limit to set. You can manually increase this if you wish
        .setRequired(true)
)

// ...
// code in between unchanged
// ...

const chosenCategoryName = interaction.options.getString('categoryname');

// ...
// code in between unchanged
// ...

await interaction.guild.channels.create({
    name: chosenCategoryName, // The name given to the Channel by the user
    type: ChannelType.GuildCategory, // The type of the Channel created.
});

// ...
// rest of the code unchanged
// ...
```

[_createcategory.js_](https://github.com/TheYuriG/blog_lessons/blob/master/discord_create_channels/commands/createcategory.js)

As you probably noticed if you paid attention to the [Create a Text Channel with Dynamic Names](#creating-a-text-channel-with-a-dynamic-name) lesson, not much was changed. We have renamed our variable, updated the command and the [option](https://discord.js.org/#/docs/discord.js/main/typedef/CommandInteractionOption) name, and changed the type of Channel being created to [GuildCategory](https://discord-api-types.dev/api/discord-api-types-v10/enum/ChannelType#GuildCategory). Simple, right? But there is not much use in having empty [Categories](https://discord.js.org/#/docs/discord.js/main/class/CategoryChannel), so let's populate our newly created [Category](https://discord.js.org/#/docs/discord.js/main/class/CategoryChannel) with some Channels now.

## Creating a Category that nests other types of channels

We have seen how to create [Text](https://discord.js.org/#/docs/discord.js/main/class/TextChannel) and [Voice Channels](https://discord.js.org/#/docs/discord.js/main/class/VoiceChannel) that can be nested in their existing parent [Categories](https://discord.js.org/#/docs/discord.js/main/class/CategoryChannel) (when there is one), but now we are going to create a [Category](https://discord.js.org/#/docs/discord.js/main/class/CategoryChannel) and immediately nest newly created [Text Channels](https://discord.js.org/#/docs/discord.js/main/class/TextChannel) and [Voice Channels](https://discord.js.org/#/docs/discord.js/main/class/VoiceChannel) within. As you can probably guess, we won't need to change a lot of our existing code, but we gonna reuse code from a few of our files to accomplish this.

```js
// ...
// initial code unchanged
// ...

// Text Channel name
.addStringOption((option) =>
    option
        .setName('textchannelname') // option names need to always be lowercase and have no spaces
        .setDescription('Choose the name to give to the text channel')
        .setMinLength(1) // A Text Channel needs to be named
        .setMaxLength(25) // Discord will cut-off names past the 25 characters,
        // so that's a good hard limit to set. You can manually increase this if you wish
        .setRequired(true)
    )
// Voice Channel name
.addStringOption((option) =>
    option
        .setName('voicechannelname') // option names need to always be lowercase and have no spaces
        .setDescription('Choose the name to give to the voice channel')
        .setMinLength(1) // A Voice Channel needs to be named
        .setMaxLength(25) // Discord will cut-off names past the 25 characters,
        // so that's a good hard limit to set. You can manually increase this if you wish
        .setRequired(true)
    )

// ...
// code in between unchanged
// ...

const chosenTextChannelName = interaction.options.getString('textchannelname');
const chosenVoiceChannelName = interaction.options.getString('voicechannelname');

// ...
// code in between unchanged
// ...

// Now create the Category in the server.
const newlyCreatedCategory = await interaction.guild.channels.create({
    name: chosenCategoryName, // The name given to the Channel by the user
    type: ChannelType.GuildCategory, // The type of the Channel created.
});

// Now we create the Text Channel within the Category we just created
await newlyCreatedCategory.children.create({
    name: chosenTextChannelName, // The name given to the Channel by the user
    type: ChannelType.GuildText, // The type of the Channel created.
    // Since "text" is the default Channel created, this could be ommitted
});

// Lastly we create the Voice Channel within the same Category
await newlyCreatedCategory.children.create({
    name: chosenVoiceChannelName, // The name given to the Channel by the user
    type: ChannelType.GuildVoice, // The type of the Channel created.
});

// ...
// rest of the code unchanged
// ...
```

[_createcategorywithnestedchannels.js_](https://github.com/TheYuriG/blog_lessons/blob/master/discord_create_channels/commands/createcategorywithnestedchannels.js)

You should be fairly familiar with what's happening here by this point if you have been following along. We are requiring the user to provide us a name for the [Text Channel](https://discord.js.org/#/docs/discord.js/main/class/TextChannel) and the [Voice Channel](https://discord.js.org/#/docs/discord.js/main/class/VoiceChannel), we are then fetching that input and using it to create them nested within the [Category](https://discord.js.org/#/docs/discord.js/main/class/CategoryChannel) we created. There are only two points that I think it's important to go through in more detail:

> _const newlyCreatedCategory = await interaction.guild.channels.create({ ([line 65](https://github.com/TheYuriG/blog_lessons/blob/4fc83cf7d08c20fc43cc0018d24db2eb9ff33ae1/discord_create_channels/commands/createcategorywithnestedchannels.js#L65))_

We are now fetching the [Category](https://discord.js.org/#/docs/discord.js/main/class/CategoryChannel) and storing it to a constant, so it can be used to nest the newly created [Text](https://discord.js.org/#/docs/discord.js/main/class/TextChannel) and [Voice Channels](https://discord.js.org/#/docs/discord.js/main/class/VoiceChannel).

> _await newlyCreatedCategory.children.create({ (lines [74](https://github.com/TheYuriG/blog_lessons/blob/4fc83cf7d08c20fc43cc0018d24db2eb9ff33ae1/discord_create_channels/commands/createcategorywithnestedchannels.js#L74) and [81](https://github.com/TheYuriG/blog_lessons/blob/4fc83cf7d08c20fc43cc0018d24db2eb9ff33ae1/discord_create_channels/commands/createcategorywithnestedchannels.js#L81))_

Since we now have a [Category](https://discord.js.org/#/docs/discord.js/main/class/CategoryChannel), we don't need to transverse through the [interaction](https://discord.js.org/#/docs/discord.js/main/class/CommandInteraction), then the [guild](https://discord.js.org/#/docs/discord.js/main/class/Guild), and then the [channels](https://discord.js.org/#/docs/discord.js/main/class/GuildChannelManager) to create our Channels, we can just use the [Category](https://discord-api-types.dev/api/discord-api-types-v10/enum/ChannelType#GuildCategory)'s [children](https://discord.js.org/#/docs/discord.js/main/class/CategoryChannelChildManager) and nest our Channels inside that.

Not too bad, now isn't it? It's really helpful that all of Discord.JS documentation can easily point you in the right direction whenever you want/need to do something with the API. Now, before we wrap up this post, let's go through our final topic, and let's start creating some [Roles](https://discord.js.org/#/docs/discord.js/main/class/GuildMemberRoleManager).

## Creating a dynamic named role

Creating [Roles](https://discord.js.org/#/docs/discord.js/main/class/Role), like [Threads](https://discord.js.org/#/docs/discord.js/main/class/ThreadChannel), does not care about the Channel or its [Categories](https://discord.js.org/#/docs/discord.js/main/class/CategoryChannel). [Roles](https://discord.js.org/#/docs/discord.js/main/class/Role) also have many interesting properties that we can modify, like color. Let's tweak a little the code we used for creating a Channel.

```js
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
		// You will usually only want users that can create new Channels to
		// be able to use this command and this is what this line does.
		// Feel free to remove it if you want to allow any users to
		// create new Channels
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
			// If an error occurred and we were not able to create the Channel
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
```

[_createrole.js_](https://github.com/TheYuriG/blog_lessons/blob/master/discord_create_channels/commands/createrole.js)

> _await interaction.guild.roles.create({_

To create a role, you need to access the [roles](https://discord.js.org/#/docs/discord.js/main/class/RoleManager) of a server and then create a new [Role](https://discord.js.org/#/docs/discord.js/main/class/Role) there. Creating a [Role](https://discord.js.org/#/docs/discord.js/main/class/Role) can take some additional [configuration](https://discord.js.org/#/docs/discord.js/main/typedef/RoleCreateOptions), but all settings are optional (a [Role](https://discord.js.org/#/docs/discord.js/main/class/Role) with no configuration will be called "new role" and have no color). As in previous lessons, we create a [Role](https://discord.js.org/#/docs/discord.js/main/class/Role) that has a name provided by the user and, after that [Role](https://discord.js.org/#/docs/discord.js/main/class/Role) is created, we edit the initial message with a success message ([line 46](https://github.com/TheYuriG/blog_lessons/blob/4fc83cf7d08c20fc43cc0018d24db2eb9ff33ae1/discord_create_channels/commands/createrole.js#L46)).

Now that we know how to create a role, how about we learn how to create a colored role?

## Creating a colored role

Discord [Roles](https://discord.js.org/#/docs/discord.js/main/class/Role) can have any color you want. Discord even provides us with some colors they have standardized. We will both offer to use Discord's standard color selection, while also allowing users to customize exactly the color they want for the role, using hex codes for RGB colors.

```js
// ...
// initial code unchanged
// ...

// Role color options using Discord's defaults
.addStringOption((option) =>
    option
        .setName('rolecolor')
        .setDescription('Select a color for your role (using Discord defaults)')
        .addChoices(
            { name: 'Aqua', value: '0x1abc9c' },
            { name: 'Green', value: '0x57f287' },
            { name: 'Blue', value: '0x3498db' },
            { name: 'Yellow', value: '0xfee75c' },
            { name: 'LuminousVividPink', value: '0xe91e63' },
            { name: 'Fuchsia', value: '0xeb459e' },
            { name: 'Gold', value: '0xf1c40f' },
            { name: 'Orange', value: '0xe67e22' },
            { name: 'Red', value: '0xed4245' },
            { name: 'Grey', value: '0x95a5a6' },
            { name: 'Navy', value: '0x34495e' },
            { name: 'DarkAqua', value: '0x11806a' },
            { name: 'DarkGreen', value: '0x1f8b4c' },
            { name: 'DarkBlue', value: '0x206694' },
            { name: 'DarkPurple', value: '0x71368a' },
            { name: 'DarkVividPink', value: '0xad1457' },
            { name: 'DarkGold', value: '0xc27c0e' },
            { name: 'DarkOrange', value: '0xa84300' },
            { name: 'DarkRed', value: '0x992d22' },
            { name: 'DarkerGrey', value: '0x7f8c8d' },
            { name: 'LightGrey', value: '0xbcc0c0' },
            { name: 'DarkNavy', value: '0x2c3e50' },
            { name: 'Blurple', value: '0x5865f2' },
            { name: 'Greyple', value: '0x99aab5' },
            { name: 'DarkButNotBlack', value: '0x2c2f33' }
        )
    )
// Role color options using a hex code or integer
// relevant link for hex codes: https://www.rapidtables.com/web/color/RGB_Color.html
.addStringOption((option) =>
    option
        .setName('customrolecolor')
        .setDescription(
            'Select a custom color for your role (hex code only. overrides "rolecolor")'
        )
        .setMinLength(8)
        .setMaxLength(8)
    )

// ...
// code in between unchanged
// ...

const chosenRoleName = interaction.options.getString('rolename');
const chosenRoleColor =
    interaction.options.getString('customrolecolor') ??
    interaction.options.getString('rolecolor') ??
    undefined;

// ...
// code in between unchanged
// ...

name: chosenRoleName,
color: chosenRoleColor,

// ...
// rest of the code unchanged
// ...
```

[_createcoloredrole.js_](https://github.com/TheYuriG/blog_lessons/blob/master/discord_create_channels/commands/createcoloredrole.js)

Once again, let's go through each bit of code individually.

> _.setName('rolecolor') ([line 20](https://github.com/TheYuriG/blog_lessons/blob/4fc83cf7d08c20fc43cc0018d24db2eb9ff33ae1/discord_create_channels/commands/createcoloredrole.js#L20))_

The first of the [options](https://discord.js.org/#/docs/discord.js/main/typedef/RoleCreateOptions) we added is _rolecolor_. This [option](https://discord.js.org/#/docs/discord.js/main/typedef/CommandInteractionOption) has 25 choices with colors that were standardized by Discord on their [role color](https://discord.js.org/#/docs/discord.js/main/class/Role?scrollTo=color) selection and their brand color palette. This is the easiest way for users to pick a color without needing to find a specific hex code.

> _.setName('customrolecolor') ([line 54](https://github.com/TheYuriG/blog_lessons/blob/4fc83cf7d08c20fc43cc0018d24db2eb9ff33ae1/discord_create_channels/commands/createcoloredrole.js#L54))_

The second [option](https://discord.js.org/#/docs/discord.js/main/typedef/RoleCreateOptions) we added is _customrolecolor_. This allows users to create a [Role](https://discord.js.org/#/docs/discord.js/main/class/Role) with ANY color they want, by using a hex code. There are various websites that can be used to get a hex code from a color. The one I've been using for years is [RapidTables](https://www.rapidtables.com/web/color/RGB_Color.html).

> _.setMinLength(8)
> .setMaxLength(8) (lines [58](https://github.com/TheYuriG/blog_lessons/blob/4fc83cf7d08c20fc43cc0018d24db2eb9ff33ae1/discord_create_channels/commands/createcoloredrole.js#L58) and [59](https://github.com/TheYuriG/blog_lessons/blob/4fc83cf7d08c20fc43cc0018d24db2eb9ff33ae1/discord_create_channels/commands/createcoloredrole.js#L59))_

You might have noticed that we have those strict limiters in place. This is because every RGB hex code has exactly 8 digits, the first two being "0x" which identifies that the following digits are a hexadecimal number. The next two digits are responsible for the Red, the 5th and 6th digits are responsible for the Green and the last 2 digits are responsible for the Blue.

> _const chosenRoleColor =
> interaction.options.getString('customrolecolor') ??
> interaction.options.getString('rolecolor') ??
> undefined; (lines [79](https://github.com/TheYuriG/blog_lessons/blob/4fc83cf7d08c20fc43cc0018d24db2eb9ff33ae1/discord_create_channels/commands/createcoloredrole.js#L79) to [82](https://github.com/TheYuriG/blog_lessons/blob/4fc83cf7d08c20fc43cc0018d24db2eb9ff33ae1/discord_create_channels/commands/createcoloredrole.js#L82))_

If you noticed that we mention that `customrolecolor` overrides `rolecolor` on [line 56](https://github.com/TheYuriG/blog_lessons/blob/4fc83cf7d08c20fc43cc0018d24db2eb9ff33ae1/discord_create_channels/commands/createcoloredrole.js#L56), this is the reason why. Since a single [Role](https://discord.js.org/#/docs/discord.js/main/class/Role) can't have two colors, we need to prioritize one of the inputs over the other and since it takes more effort to find a custom RGB hex code, we will assume that the user would rather use that color instead, in case they picked a `rolecolor` by mistake (or intentionally, since some users enjoy trying to break things just because they can). Here we use the [Javascript Nullish Coalescing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing) operator `??` to check if the user provided any custom value. If they didn't, then we check if they picked one of Discord's standard colors. If they also didn't, then we set the color as `undefined`, so a colorless [Role](https://discord.js.org/#/docs/discord.js/main/class/Role) can be created as the default fallback.

> _color: chosenRoleColor, ([line 91](https://github.com/TheYuriG/blog_lessons/blob/4fc83cf7d08c20fc43cc0018d24db2eb9ff33ae1/discord_create_channels/commands/createcoloredrole.js#L91))_

Finally, we use either the `customrolecolor` or the `rolecolor` or `undefined` to set the color (or no color) for the [Role](https://discord.js.org/#/docs/discord.js/main/class/Role) we will be creating.

Now we have a [Role](https://discord.js.org/#/docs/discord.js/main/class/Role) and it can have a color, but what's the use of a [Role](https://discord.js.org/#/docs/discord.js/main/class/Role) that no one possesses? Let's grant this [Role](https://discord.js.org/#/docs/discord.js/main/class/Role) to some [Members](https://discord.js.org/#/docs/discord.js/main/class/GuildMember).

## Creating a role and then granting it to members

Granting a [Role](https://discord.js.org/#/docs/discord.js/main/class/Role) to a [Member](https://discord.js.org/#/docs/discord.js/main/class/GuildMember) is very simple, you just need to access their [Roles](https://discord.js.org/#/docs/discord.js/main/class/GuildMemberManager?scrollTo=addRole) and then add the [Role](https://discord.js.org/#/docs/discord.js/main/typedef/AddOrRemoveGuildMemberRoleOptions). Let's take a look at what that code would look like.

```js
// ...
// initial code unchanged
// ...

// Member that should get the role
.addMemberOption((option) =>
    option
        .setName('membertoreceiverole')
        .setDescription('The user you want to give the newly created role to')
        .setRequired(true)
    )
// Grant role to the member using the command
.addBooleanOption((option) =>
    option
        .setName('grantroletocommanduser') // option names need to always be lowercase and have no spaces
        .setDescription('Choose you should be granted the role after creation')
    )

// ...
// code in between unchanged
// ...

const chosenRoleColor =
    interaction.options.getString('customrolecolor') ??
    interaction.options.getString('rolecolor') ??
    undefined;
const memberNeedingRole = interaction.options.getMember('membertoreceiverole');
const grantRoleToSelf = interaction.options.getBoolean('grantroletocommanduser') ?? false;

// ...
// code in between unchanged
// ...

// Check if the user selected "True" to the option to grant role to self
if (grantRoleToSelf == true) {
    // If they did, navigate their properties until their roles and
    // add the newly created role to them
    await interaction.member.roles.add(coloredRole).catch((e) => {
        // If it fails, send a followUp message with the error
        interaction.followUp({
            content:
                'Failed to give you the new role. Do you have any roles with higher priority than me?',
            ephemeral: true,
        });
    });
}

// Check if a guild member was provided to receive the role
if (memberNeedingRole != null) {
    // Check if the command user requested to get the role
    // and also provided their own member to receive the role
    if (interaction.member.id === memberNeedingRole.id && grantRoleToSelf == true) {
        // If they did, give them an ephemeral error message
        interaction.followUp({
            content: 'You were already granted the role!',
            ephemeral: true,
        });
    }

    // Check if the command user provided a different member
    // than themselves to receive the role
    if (interaction.member.id !== memberNeedingRole.id || grantRoleToSelf == false) {
        // If they did, navigate their properties until their roles and
        // add the newly created role to them
        await memberNeedingRole.roles.add(coloredRole).catch((e) => {
            // If it fails, send a followUp message with the error
            interaction.followUp({
                content:
                    'Failed to give the new role to the member. Do they have any roles with higher priority than me?',
            });
        });
    }
}

// ...
// rest of the code unchanged
// ...
```

[_createandgrantrole.js_](https://github.com/TheYuriG/blog_lessons/blob/master/discord_create_channels/commands/createandgrantrole.js)

Let's break down this code into smaller chunks again.

> _// Member that should get the role
> .addMemberOption((option) => (lines [61](https://github.com/TheYuriG/blog_lessons/blob/4fc83cf7d08c20fc43cc0018d24db2eb9ff33ae1/discord_create_channels/commands/createandgrantrole.js#L61) and [62](https://github.com/TheYuriG/blog_lessons/blob/4fc83cf7d08c20fc43cc0018d24db2eb9ff33ae1/discord_create_channels/commands/createandgrantrole.js#L62))_

This [option](https://discord.js.org/#/docs/discord.js/main/typedef/CommandInteractionOption) allows the user to select a [Member](https://discord.js.org/#/docs/discord.js/main/class/GuildMember) that will receive the role, once it has been created. This will not ping them or notify them in any way.

> _// Grant role to the member using the command
> .addBooleanOption((option) => (lines [68](https://github.com/TheYuriG/blog_lessons/blob/4fc83cf7d08c20fc43cc0018d24db2eb9ff33ae1/discord_create_channels/commands/createandgrantrole.js#L68) and [69](https://github.com/TheYuriG/blog_lessons/blob/4fc83cf7d08c20fc43cc0018d24db2eb9ff33ae1/discord_create_channels/commands/createandgrantrole.js#L69))_

This [option](https://discord.js.org/#/docs/discord.js/main/typedef/CommandInteractionOption) was added to allow the person using the command to get the [Role](https://discord.js.org/#/docs/discord.js/main/class/Role) added to them after being created if they select `true` when using the command.

> _const memberNeedingRole = interaction.options.getMember('membertoreceiverole');
> const grantRoleToSelf = interaction.options.getBoolean('grantroletocommanduser') ?? false (lines [96](https://github.com/TheYuriG/blog_lessons/blob/4fc83cf7d08c20fc43cc0018d24db2eb9ff33ae1/discord_create_channels/commands/createandgrantrole.js#L96) and [97](https://github.com/TheYuriG/blog_lessons/blob/4fc83cf7d08c20fc43cc0018d24db2eb9ff33ae1/discord_create_channels/commands/createandgrantrole.js#L97))_

Fetches the user input from the [options](https://discord.js.org/#/docs/discord.js/main/typedef/CommandInteractionOption) mentioned above. Note how `grantRoleToSelf` will default to false if the user doesn't select an [option](https://discord.js.org/#/docs/discord.js/main/typedef/CommandInteractionOption). This means that the only way for the user to be granted the [Role](https://discord.js.org/#/docs/discord.js/main/class/Role) they have created is by manually selecting `true` when using the command.

> _if (grantRoleToSelf == true) { ([line 110](https://github.com/TheYuriG/blog_lessons/blob/4fc83cf7d08c20fc43cc0018d24db2eb9ff33ae1/discord_create_channels/commands/createandgrantrole.js#L110))_

Checks if the user requested to give themselves the [Role](https://discord.js.org/#/docs/discord.js/main/class/Role) after creation and, if they did, attempt to give it to them. This, just like giving a [Role](https://discord.js.org/#/docs/discord.js/main/class/Role) to any [Member](https://discord.js.org/#/docs/discord.js/main/class/GuildMember), is prone to fail if the bot doesn't have permission to [Manage Members](https://discord.js.org/#/docs/discord.js/main/class/GuildMemberManager) or if the [Member](https://discord.js.org/#/docs/discord.js/main/class/GuildMember) that we are trying to give the [Role](https://discord.js.org/#/docs/discord.js/main/class/Role) already has another [Role](https://discord.js.org/#/docs/discord.js/main/class/Role) that has higher priority than the all of bot's [Roles](https://discord.js.org/#/docs/discord.js/main/class/Role).

> _if (memberNeedingRole != null) { ([line 124](https://github.com/TheYuriG/blog_lessons/blob/4fc83cf7d08c20fc43cc0018d24db2eb9ff33ae1/discord_create_channels/commands/createandgrantrole.js#L124))_

Check if the user provided us with a [Member](https://discord.js.org/#/docs/discord.js/main/class/GuildMember) to give the role.

> _if (interaction.member.id === memberNeedingRole.id && grantRoleToSelf == true) { ([line 127](https://github.com/TheYuriG/blog_lessons/blob/4fc83cf7d08c20fc43cc0018d24db2eb9ff33ae1/discord_create_channels/commands/createandgrantrole.js#L127))_

Check if the [Member](https://discord.js.org/#/docs/discord.js/main/class/GuildMember) provided is the same person as the user that triggered the command and if they have previously asked to receive the [Role](https://discord.js.org/#/docs/discord.js/main/class/Role). This will only give them an error message if they asked for the [Role](https://discord.js.org/#/docs/discord.js/main/class/Role) twice, otherwise, it will just give them the role.

> _if (interaction.member.id !== memberNeedingRole.id || grantRoleToSelf == false) { ([line 137](https://github.com/TheYuriG/blog_lessons/blob/4fc83cf7d08c20fc43cc0018d24db2eb9ff33ae1/discord_create_channels/commands/createandgrantrole.js#L137))_

If the [Member](https://discord.js.org/#/docs/discord.js/main/class/GuildMember) provided is different than the user triggering the command or if a [Member](https://discord.js.org/#/docs/discord.js/main/class/GuildMember) was provided and the user didn't request to have the [Role](https://discord.js.org/#/docs/discord.js/main/class/Role) added to themselves with the other [option](https://discord.js.org/#/docs/discord.js/main/typedef/CommandInteractionOption), grant the [Member](https://discord.js.org/#/docs/discord.js/main/class/GuildMember) to have the [Role](https://discord.js.org/#/docs/discord.js/main/class/Role).

That was quite a bit of code we added and with that, we have also covered an edge case where users can try to give themselves the same [Role](https://discord.js.org/#/docs/discord.js/main/class/Role) twice. [Roles](https://discord.js.org/#/docs/discord.js/main/class/Role) are very complex entities and there is a lot more that can be done with them, like setting up additional permissions and updating them post-creation, but that's a lesson for another day.

### How to contribute

The Discord.JS library is very vast and this guide doesn't cover 100% of everything it's possible do with it.

There are a quite a few topic that are closely related to the lessons given here, like "editing a Role/Channel after it was created", "updating Role permissions", "granting a Role to multiple users at once" and many, many others.

If you would like to contribute with writing your own lesson for any of the topics mentioned above or something else that is closely similar to what was taught here, feel free to create a PR with the full final code file to `./contributions/commands/` and an edit to the README.md in `./contributions/README.md`.

If you are not sure if your topic is close enough to the topics written here, feel free to open an issue first, explaining what your PR intends to teach about and I'll take a look at it and give a reply as soon as possible. I intend to be as accepting as possible, as long as you don't go overboard like trying to teach people "How to Integrate ChatGPT with Discord" or "How to Create your Own Pokemon Game on Discord". The lessons here are meant to be very beginner friendly.

If you are still reading at this point, I assume you are still interested in contributing, so here are the very simple rules:

-   Write verbose code. Don't write codes with shortcuts.
-   -   Avoid writing `if (!access) return`
-   -   Prefer writing `if (access == false) {return}`
-   -   Prefer writing complete functions over assigning anonymous functions to constants.
-   -   -   Remember that the guides here aim to help beginners. It's easier to trim down code if you are experienced than to make it more verbose if you are a beginner.
-   Write comments on everything. While more experienced programmers should strive for [writing self-documenting code](https://en.wikipedia.org/wiki/Self-documenting_code) that doesn't require any comments, that often overwhelms/confuses new programmers.
