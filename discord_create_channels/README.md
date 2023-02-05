# How to create Categories, Text Channels, Threads, Voice Channels, and Roles in Discord.JS v14

Navigating through Discord.JS' guide and documentation can be confusing if you are new to programming, as many bot creators will also be learning how to code to create their bot (it was my first project too, back in 2018!). This README.md aims to simplify the learning process to make different types of channels from a slash command interaction.
Before anything else, it's essential to share links to relevant resources used in this blog post:

-   [Discord.JS' support server](https://discord.com/invite/djs)
-   [Discord.JS' guide (currently at v14)](https://discordjs.guide/#before-you-begin)
-   [Discord.JS' documentation (currently at v14)](https://discord.js.org/#/docs/discord.js/main/general/welcome)

Remember that if you have any questions, _Google your issue first_, and, if you can't find the solution, join the support server (linked above) and ask for help in the proper v14 help channel.

First, this guide assumes you already have a bot set up, use slash command interactions, you have a command handler set up and the command you are using was already deployed. You will need to update the code on your own if you are still using 'messageCreate' events instead.

Second, this guide assumes you are using Javascript over Typescript. Feel free to use the documentation website (linked above) if you need assistance defining your types.

## Creating your first text channel

Let's start with your basic file. I'll not have options added as I'm not assuming how configurable you will want to make this yet, but you can (and we will) add more options later.

```js
// Importing SlashCommandBuilder is required for every slash command
// We import PermissionFlagsBits so we can restrict this command usage
// We also import ChannelType to define what kind of channel we are creating
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('createnewchannel') // Command name matching file name
		.setDescription('Ths command creates a text channel called "new"')
		// You will usually only want users that can create new channels to
		// be able to use this command and this is what this line does.
		// Feel free to remove it if you want to allow any users to
		// create new channels
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
		// It's impossible to create normal text channels inside DMs, so
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
					'Your channel could not be created! Please check if the bot has the necessary permissions!',
			});
		}
	},
};
```

[_createnewchannel.js_](https://github.com/TheYuriG/blog_lessons/blob/master/discord_create_channels/commands/createnewchannel.js)

Deploying this command, refreshing your client, and triggering the command will always create a new channel called "new". But that's not very versatile, is it? Let's tweak the code a bit so we can choose what name we want to give the channel now.

## Creating a text channel with a dynamic name

To be able to set the name from the command itself, we need to tweak the code a little, add options to the command, and then retrieve the name provided by the user in our file.

```js
data: new SlashCommandBuilder()
	.setName('createchannel') // Command name matching file name
	.setDescription('Creates a new text channel')
	// Text channel name
	.addStringOption((option) =>
		option
			.setName('channelname') // option names need to always be lowercase and have no spaces
			.setDescription('Choose the name to give to the channel')
			.setMinLength(1) // A text channel needs to be named
			.setMaxLength(25) // Discord will cut-off names past the 25 characters,
			// so that's a good hard limit to set. You can manually increase this if you wish
			.setRequired(true)
	)

// ...
// permissions aren't changed, neither our interaction reply
// ...

    // After acknowledging the interaction, we retrieve the string sent by the user
    const chosenChannelName = interaction.options.getString('channelname');
    // Do note that the string passed to the method .getString() needs to
    // match EXACTLY the name of the option provided (line 12 in this file).
    // If it's not a perfect match, this will always return null

    try {
        // Now create the channel in the server.
        await interaction.guild.channels.create({
            name: chosenChannelName, // The name given to the channel by the user
            type: ChannelType.GuildText, // The type of the channel created.
            // Since "text" is the default channel created, this could be ommitted
        });

// ...
// the rest of the code remains unchanged
// ...
```

[_createchannel.js_](https://github.com/TheYuriG/blog_lessons/blob/master/discord_create_channels/commands/createchannel.js)

A small note here: [Discord has a visual limit of around 25 characters for channels on the sidebar](https://discord.com/moderation/208-channel-categories-and-names), but they don't define an actual hard limit for channel names and expect users to have common sense. If you choose to override the 25-character limit in line 15, please ensure there is another limit in place to stop users from creating absurdly long channel names. [Avoid giving them enough rope to hang themselves](https://www.collinsdictionary.com/dictionary/english/give-someone-enough-rope-to-hang-himself-or-herself).

After saving your file, reloading your bot, and redeploying your commands, you now have a command that can quickly create a new text channel. Neat, huh? But we are still creating stray channels at the top of the channel list. Let's change that now.

## Create a channel that is nested in the parent category (when there is one)

More experienced Discord users won't be expecting the newly created channel to appear on the top of the channel list, but instead, to be within the same category of the channel they used the command in. We will now be tweaking our code to create channels with that behavior whenever the server has Categories set up, but still, be able to create stray channels if the command was used in a channel that isn't nested in a category.

```js
// ...
// no code changes prior to the try catch block, except for command name update
// ...

try {
    // Check if this channel where the command was used is stray
    if (!interaction.channel.parent) {
        // If the channel where the command was used is stray,
        // create another stray channel in the server.
        await interaction.guild.channels.create({
            name: chosenChannelName, // The name given to the channel by the user
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
        return;
    }

    // Check if this channel where the command was used belongs to a category
    if (interaction.channel.parent) {
        // If the channel where the command belongs to a category,
        // create another channel in the same category.
        await interaction.channel.parent.children.create({
            name: chosenChannelName, // The name given to the channel by the user
            type: ChannelType.GuildText, // The type of the channel created.
            // Since "text" is the default channel created, this could be ommitted
        });

        // If we managed to create the channel, edit the initial response with
        // a success message
        await interaction.editReply({
            content: 'Your channel was successfully created in the same category!',
        });
        return;
    }
} catch (error) {

// ...
// no code changes past this point
// ...
```

[_createchannelincategory.js_](https://github.com/TheYuriG/blog_lessons/blob/master/discord_create_channels/commands/createchannelincategory.js)

Let's go through this bit by bit.

> _if (!interaction.channel.parent) { (line 45)_

First, we are checking if the channel where the command was used doesn't have a [parent](https://discord.js.org/#/docs/discord.js/main/class/CategoryChannel), which would mean they are not nested within a category. If this check succeeds, then this is a stray channel and we can reuse our previous code to create another stray channel. Do note that we end this if check with a return statement. More on that is below.

> _if (interaction.channel.parent) { (line 66)_

Now we are checking if the channel where the command was used does have a [parent](https://discord.js.org/#/docs/discord.js/main/class/CategoryChannel), meaning they are nested in a category. This could very much be an _else_ block or removed entirely, since the previous _if check_ ends with a _return_ statement. **Feel free to tweak this in your code yourself, the check is only there for educational purposes.**

> _await interaction.channel.parent.children.create({ (line 69)_

Since the channel where the command was used does have a [parent](https://discord.js.org/#/docs/discord.js/main/class/CategoryChannel), we need to create our channel inside that same category. For that, we need to first access the [children](https://discord.js.org/#/docs/discord.js/main/class/CategoryChannelChildManager) of that category and then create our channel within.

Now that we are handling both cases for stray channels and nested channels, let's switch gears for a moment and talk about Threads before we proceed to Voice Channels, Categories, and Roles.

## Create a thread with a dynamic name

Starting a thread is about as simple as creating a channel, all you need is either a message or a channel that will host the thread. Because threads live inside a channel, regardless of using a message as a starting point or not, you don't need to care for categories.

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
```

[_createthread.js_](https://github.com/TheYuriG/blog_lessons/blob/master/discord_create_channels/commands/createthread.js)

Alright, few key points with this code:

-   We are now storing the [message](https://discord.js.org/#/docs/discord.js/main/class/Message) sent as a reply to the interaction in the constant 'interactionReplied' (line 25). This is done so we can refer to that [message](https://discord.js.org/#/docs/discord.js/main/class/Message) later if the user requested to use our message as a parent to the thread we are going to [create](https://discord.js.org/#/docs/discord.js/main/class/Message?scrollTo=startThread) (line 73).
-   We also handle the case that the user might not want to create a thread on the message itself, so an orphaned thread is created in the channel where the command was used instead.

Just like with the checks for messages belonging to categories in the previous lesson, here we also make polar opposite checks (lines 42 and 52; lines 55 and 83; lines 58 and 70) where we could instead use else or nothing at all, considering the previous check already calls return on a positive result. **Feel free to tweak this in your own code, these additional checks are only there for educational purposes.**

## Create a voice channel that is nested in the parent category (when there is one)

Creating a voice channel isn't that much different than creating a text channel. Voice channels won't get their names normalized to lowercase and have their spaces replaced by dashes, so whatever you write will be what will be used. Because of how similar Voice and Text channels are, we can reuse most of the code we used for the text channel and make small adjustments.

```js
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
```

[_createvoicechannel.js_](https://github.com/TheYuriG/blog_lessons/blob/master/discord_create_channels/commands/createvoicechannel.js)

A few tweaks were made, variables were renamed, comments were updated, and error messages were updated, but the process isn't much different from creating a text channel. One of the few features that Voice Channels have over Text Channels is the ability to limit the number of users it can hold at once. Let's tweak that now?

## Create a voice channel that has a maximum number of concurrent users

One of the exclusive features that voice channels have over other channels is the ability to limit the number of users that can use it at the same time. To set this number, all you gotta do is pass in an integer for the userLimit key when creating a voice channel.

```js
// ...
// initial code unchanged
// ...

  // Voice channel limit of participants
.addIntegerOption(
    (option) =>
        option
            .setName('voiceuserlimit') // option names need to always be lowercase and have no spaces
            .setDescription(
                'Select the maximum number of concurrent users for the voice channel'
            )
            .setMinValue(2) // A voice channel with less than 2 users will be useless
            // for nearly every case, so we will disable users from creating voice
            // channels that can take less than that
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

    name: chosenVoiceChannelName, // The name given to the channel by the user
    type: ChannelType.GuildVoice, // The type of the channel created.
    userLimit: voiceChannelUserLimit, // The max number of concurrent users

// ...
// rest of the code unchanged
// ...
```

[_createvoicewithuserlimit.js_](https://github.com/TheYuriG/blog_lessons/blob/master/discord_create_channels/commands/createvoicewithuserlimit.js)

There are a few key points that need to be talked about. The first of them is that we are not requiring the limit to be set (line 30). This allows the user to set a limit if they want but also allows the channel to be unlimited if they don't.

> _const voiceChannelUserLimit = interaction.options.getInteger('voiceuserlimit') ?? undefined;_

To avoid this causing an error when creating the voice channel, we check (in line 49) if a value was passed and, if .getInteger() returns us null, then then the [Javascript Nullish Coalescence](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing) operator "??" will set the value to undefined.

> _userLimit: voiceChannelUserLimit_

Passing _undefined_ to the [userLimit](https://discord.js.org/#/docs/discord.js/main/typedef/GuildChannelCreateOptions) key when creating a voice channel will make it unlimited, while any integer would be used as the actual limit.

## Creating Categories

As mentioned in the previous lessons, Categories are the parents of some channels. Not all channels belong to a Category (the ones that don't, are referred to here as "stray channels").

Categories exist for primarily two reasons: Organizing channels within a certain topic and quickly syncing the permissions of all channels within it. They also are very simple to create, even simpler than Voice Channels or Text Channels, since the number of configuration options for them is so limited.

Let's modify the Text Channel file a bit and then talk about the differences between them and Categories:

```js
// ...
// initial code unchanged
// ...

.addStringOption((option) =>
    option
        .setName('categoryname') // option names need to always be lowercase and have no spaces
        .setDescription('Choose the name to give to the category')
        .setMinLength(1) // A category needs to be named
        .setMaxLength(25) // Discord will cut-off names past the ~27 characters (for categories),
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
    name: chosenCategoryName, // The name given to the channel by the user
    type: ChannelType.GuildCategory, // The type of the channel created.
});

// ...
// rest of the code unchanged
// ...
```

[_createcategory.js_](https://github.com/TheYuriG/blog_lessons/blob/master/discord_create_channels/commands/createcategory.js)

As you probably noticed if you paid attention to the Text Channel with Dynamic Names lesson, not much was changed. We have renamed our variable, updated the command and the option name, and changed the type of channel being created to [GuildCategory](https://discord-api-types.dev/api/discord-api-types-v10/enum/ChannelType#GuildCategory). Simple, right? But there is not much use in having empty categories, so let's populate that our newly created category with some channels now.

## Creating a dynamic named role

Creating roles, like threads, does not care about the channel or its categories. Roles also have many interesting properties that we can modify, like color. Let's tweak a little the code we used for creating a channel.

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
```

[_createrole.js_](https://github.com/TheYuriG/blog_lessons/blob/master/discord_create_channels/commands/createrole.js)

> _await interaction.guild.roles.create({_

To create a role, you need to access the [roles](https://discord.js.org/#/docs/discord.js/main/class/RoleManager) of a server and then create a new role there. Creating a role can take some additional [configuration](https://discord.js.org/#/docs/discord.js/main/typedef/RoleCreateOptions), but all settings are optional (a role with no configuration will be called "new role" and have no color). As in previous lessons, we create a role that has a name provided by the user and, after that role is created, we edit the initial message with a success message (line 46).

Now that we know how to create a role, how about we learn how to create a colored role?

## Creating a colored role

Discord roles can have any color you want. Discord even provides us with some colors themselves that they have standardized. We will both offer to use Discord's standard color selection, while also allowing users to customize exactly the color they want for the role.

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

> _.setName('rolecolor') (line 20)_

The first of the [options](https://discord.js.org/#/docs/discord.js/main/typedef/RoleCreateOptions) we added is _rolecolor_. This option has 25 choices with colors that were standardized by Discord on their role color selection and their brand color palette. This is the easiest way for users to pick a color without needing to find a specific hex code.

> _.setName('customrolecolor') (line 54)_

The second [option](https://discord.js.org/#/docs/discord.js/main/typedef/RoleCreateOptions) we added is _customrolecolor_. This allows users to create a role with ANY color they want, by using a hex code. There are various websites that can be used to get a hex code from a color. The one I've been using for years is [RapidTables](https://www.rapidtables.com/web/color/RGB_Color.html).

> _.setMinLength(8)
> .setMaxLength(8) (lines 58 and 59)_

You might have noticed that we have those strict limiters in place. This is because every RGB hex code has exactly 8 digits, the first two being "0x" which identifies that the following digits are a hexadecimal number. The next two digits are responsible for the Red, the 5th and 6th digits are responsible for the Green and the last 2 digits are responsible for the Blue.

> _const chosenRoleColor =
> interaction.options.getString('customrolecolor') ??
> interaction.options.getString('rolecolor') ??
> undefined; (lines 79 to 82)_

If you noticed that we mention that _customrolecolor_ overrides _rolecolor_ on line 56, this is the reason why. Since a single role can't have two colors, we need to prioritize one of the inputs over the other and since it takes more effort to find a custom RGB hex code, we will assume that the user would rather use that color instead, in case they picked a _rolecolor_ by mistake (or intentionally, since some users enjoy trying to break things just because they can). Here we use the [Javascript Nullish Coalescing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing) operator "??" to check if the user provided any custom value. If they didn't, then we check if they picked one of Discord's standard colors. If they also didn't, then we set the color as _undefined_, so a colorless role can be created as the default fallback.

> _color: chosenRoleColor, (line 91)_

Finally, we use either the _customrolecolor_ or the _rolecolor_ or _undefined_ to set the color (or no color) for the role we will be creating.

Now we have a role and the role can have a color, but what's the use of a role that no one possesses? Let's grant this role to some users.

## Creating a role and then granting it to members

Granting a role to a member is very simple, you just need to access their [roles](https://discord.js.org/#/docs/discord.js/main/class/GuildMemberManager?scrollTo=addRole) and then add the [role](https://discord.js.org/#/docs/discord.js/main/typedef/AddOrRemoveGuildMemberRoleOptions). Let's take a look at what that code would look like.

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
> .addMemberOption((option) => (lines 61 and 62)_

This option allows the user to select a member that will receive the role, once it has been created. This will not ping them or notify them in any way.

> _// Grant role to the member using the command
> .addBooleanOption((option) => (lines 68 and 69)_

This option was added to allow the person using the command to get the role added to them after being created if they select true when using the command.

> _const memberNeedingRole = interaction.options.getMember('membertoreceiverole');
> const grantRoleToSelf = interaction.options.getBoolean('grantroletocommanduser') ?? false (lines 96 and 97)_

Fetches the user input from the options mentioned above. Note how grantRoleToSelf will default to false if the user doesn't select an option. This means that the only way for the user to be granted the role they have created is by manually selecting true when using the command.

> _if (grantRoleToSelf == true) { (line 110)_

Checks if the user requested to give themselves the role after creation and, if they did, attempt to give it to them. This, just like giving a role to any member, is prone to fail if the bot doesn't have permission to Manage Members or if the member that we are trying to give the role already has another role that has higher priority than the all of bot's roles.

> _if (memberNeedingRole != null) { (line 124)_

Check if the user provided us with a member to give the role.

> _if (interaction.member.id === memberNeedingRole.id && grantRoleToSelf == true) { (line 127)_

Check if the member provided is the same person as the user that triggered the command and if they have previously asked to receive the role. This will only give them an error message if they asked for the role twice, otherwise, it will just give them the role.

> _if (interaction.member.id !== memberNeedingRole.id || grantRoleToSelf == false) { (line 137)_

If the member provided is different than the user triggering the command or if a member was provided and the user didn't request to have the role added to themselves with the other option, grant the member to have the role.

That was quite a bit of code we added and with that, we have also covered an edge case where users can try to give themselves the same role twice. Roles are very complex entities and there is a lot more that can be done with them, like setting up additional permissions and updating them post-creation, but that's a lesson for another day.
