// Importing SlashCommandBuilder is required for every slash command
// We import PermissionFlagsBits so we can restrict this command usage
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('createandgrantrole') // Command name matching file name
		.setDescription('Creates a new role and then grants it to a member')
		// Role name
		.addStringOption((option) =>
			option
				.setName('rolename') // option names need to always be lowercase and have no spaces
				.setDescription('Choose the name to give to the role')
				.setMinLength(1) // A role needs to be named
				.setMaxLength(100) // Hard limit set by Discord for role names
				.setRequired(true)
		)
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
		const chosenRoleColor =
			interaction.options.getString('customrolecolor') ??
			interaction.options.getString('rolecolor') ??
			undefined;
		const memberNeedingRole = interaction.options.getMember('membertoreceiverole');
		const grantRoleToSelf = interaction.options.getBoolean('grantroletocommanduser') ?? false;
		// Do note that the string passed to the method .getString() needs to
		// match EXACTLY the name of the option provided (line 12 in this file).
		// If it's not a perfect match, this will always return null

		try {
			// Create the role
			const coloredRole = await interaction.guild.roles.create({
				name: chosenRoleName,
				color: chosenRoleColor,
			});

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

			// Inform the user about the role creation being successful
			await interaction.editReply({ content: 'Your role was created successfully!' });
			return;
		} catch (error) {
			// If an error occurred and we were not able to create the channel
			// the bot is most likely received the "Missing Permissions" error
			// or because they chose an invalid color for the role.
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
