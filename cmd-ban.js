const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('指定したユーザーをサーバーからBANします')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((o) =>
      o.setName('user').setDescription('対象のユーザー').setRequired(true)
    )
    .addStringOption((o) => o.setName('reason').setDescription('理由'))
    .addIntegerOption((o) =>
      o
        .setName('delete_days')
        .setDescription('直近何日分のメッセージも削除するか（省略可・0〜7）')
        .setMinValue(0)
        .setMaxValue(7)
    ),
  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: 'このコマンドはサーバー内でのみ使用できます。',
        ephemeral: true,
      });
    }

    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') ?? '理由なし';
    const deleteDays = interaction.options.getInteger('delete_days') ?? 0;

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (member && !member.bannable) {
      return interaction.reply({
        content: '⚠️ このユーザーをBANできません（相手の権限がBotより高い可能性があります）。',
        ephemeral: true,
      });
    }

    try {
      await interaction.guild.members.ban(target.id, {
        reason,
        deleteMessageSeconds: deleteDays * 24 * 60 * 60,
      });
    } catch (err) {
      console.error('ban エラー:', err);
      return interaction.reply({
        content: '⚠️ BANに失敗しました。',
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setColor(0xed4245)
      .setTitle('🔨 BANしました')
      .addFields(
        { name: '対象', value: `${target.tag}`, inline: true },
        { name: '実行者', value: `<@${interaction.user.id}>`, inline: true },
        { name: '理由', value: reason }
      );

    await interaction.reply({ embeds: [embed] });
  },
};
