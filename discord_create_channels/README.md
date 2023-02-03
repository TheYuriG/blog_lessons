# How to create Categories, Text Channels, Threads, Voice Channels, and Roles in Discord.JS v14
Navigating through Discord.JS' guide and documentation can be confusing if you are new to programming, as many bot creators will also be learning how to code to create their bot (it was my first project too, back in 2018!). This README.md aims to simplify the learning process to make different types of channels from a slash command interaction.
Before anything else, it's essential to share links to relevant resources used in this blog post:

- [Discord.JS' support server](https://discord.com/invite/djs)
- [Discord.JS' guide (currently at v14)](https://discordjs.guide/#before-you-begin)
- [Discord.JS' documentation (currently at v14)](https://discord.js.org/#/docs/discord.js/main/general/welcome)

Remember that if you have any questions, _Google your issue first_, and, if you can't find the solution, join the support server (linked above) and ask for help in the proper v14 help channel.

First, this guide assumes you already have a bot set up, use slash command interactions, you have a command handler set up and the command you are using was already deployed. You will need to update the code on your own if you are still using 'messageCreate' events instead.

Second, this guide assumes you are using Javascript over Typescript. Links to the proper documentation entry points will be provided at all points if you need assistance defining your types.

Let's start with your basic file. I'll not have options added as I'm not assuming how configurable you will want to make this yet, but you can (and we will) add more options later.

```js
// Importing SlashCommandBuilder is required for every slash command
// We also import ChannelType to define what kind of channel we are creating
const { SlashCommandBuilder, ChannelType } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder()
   .setName('createnewchannel') // Command name matching file name
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
```
[*createnewchannel.js*](https://github.com/TheYuriG/blog_lessons/blob/master/discord_create_channels/commands/createnewchannel.js)

Deploying this command, refreshing your client, and triggering the command will always create a new channel called "new". But that's not very versatile, is it? Let's tweak the code a bit so we can choose what name we want to give the channel now.
