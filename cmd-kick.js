const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('指定したユーザーをサーバーからキックします')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((o) =>
      o.setName('user').setDescription('対象のユーザー').setRequired(true)
    )
    .addStringOption((o) => o.setName('reason').setDescription('理由')),
  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: 'このコマンドはサーバー内でのみ使用できます。',
        ephemeral: true,
      });
    }

    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') ?? '理由なし';

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      return interaction.reply({
        content: '⚠️ そのユーザーはこのサーバーにいません。',
        ephemeral: true,
      });
    }

    if (!member.kickable) {
      return interaction.reply({
        content: '⚠️ このユーザーをキックできません（相手の権限がBotより高い可能性があります）。',
        ephemeral: true,
      });
    }

    try {
      await member.kick(reason);
    } catch (err) {
      console.error('kick エラー:', err);
      return interaction.reply({
        content: '⚠️ キックに失敗しました。',
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setColor(0xed4245)
      .setTitle('👢 キックしました')
      .addFields(
        { name: '対象', value: `${target.tag}`, inline: true },
        { name: '実行者', value: `<@${interaction.user.id}>`, inline: true },
        { name: '理由', value: reason }
      );

    await interaction.reply({ embeds: [embed] });
  },
};
