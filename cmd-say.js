const { SlashCommandBuilder, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Botに普通のメッセージとして発言させます')
    .addStringOption((o) =>
      o.setName('message').setDescription('発言内容').setRequired(true)
    )
    .addChannelOption((o) =>
      o
        .setName('channel')
        .setDescription('発言するチャンネル（省略時はこのチャンネル）')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
    ),
  async execute(interaction) {
    const message = interaction.options.getString('message');
    const target = interaction.options.getChannel('channel') ?? interaction.channel;

    try {
      // 埋め込みではなく、普通のテキストとして送信
      await target.send({ content: message });
      await interaction.reply({
        content: `✅ <#${target.id}> に送信しました。`,
        ephemeral: true,
      });
    } catch (err) {
      console.error('say 送信エラー:', err);
      await interaction.reply({
        content: '⚠️ そのチャンネルに送信できませんでした。Botの閲覧・送信権限を確認してください。',
        ephemeral: true,
      });
    }
  },
};
