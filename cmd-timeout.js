const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('指定したユーザーを一定時間タイムアウトします')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) =>
      o.setName('user').setDescription('対象のユーザー').setRequired(true)
    )
    .addIntegerOption((o) =>
      o
        .setName('minutes')
        .setDescription('タイムアウトする時間（分）')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(40320) // 28日（Discordの上限）
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
    const minutes = interaction.options.getInteger('minutes');
    const reason = interaction.options.getString('reason') ?? '理由なし';

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      return interaction.reply({
        content: '⚠️ そのユーザーはこのサーバーにいません。',
        ephemeral: true,
      });
    }

    if (!member.moderatable) {
      return interaction.reply({
        content: '⚠️ このユーザーをタイムアウトできません（相手の権限がBotより高い可能性があります）。',
        ephemeral: true,
      });
    }

    try {
      await member.timeout(minutes * 60 * 1000, reason);
    } catch (err) {
      console.error('timeout エラー:', err);
      return interaction.reply({
        content: '⚠️ タイムアウトに失敗しました。',
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setColor(0xfee75c)
      .setTitle('⏲️ タイムアウトしました')
      .addFields(
        { name: '対象', value: `<@${target.id}>`, inline: true },
        { name: '実行者', value: `<@${interaction.user.id}>`, inline: true },
        { name: '時間', value: `${minutes}分`, inline: true },
        { name: '理由', value: reason }
      );

    // ephemeralを付けない＝チャンネルの全員から見える
    await interaction.reply({ embeds: [embed] });
  },
};
