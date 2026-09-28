const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChannelType,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Botに埋め込みメッセージを発言させます')
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
    const target = interaction.options.getChannel('channel');

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setDescription(message)
      .setFooter({ text: `${interaction.user.username} より` });

    // チャンネル未指定：従来どおりこのチャンネルに返信
    if (!target) {
      return interaction.reply({ embeds: [embed] });
    }

    // チャンネル指定：そのチャンネルに送信し、実行者にだけ確認を返す
    try {
      await target.send({ embeds: [embed] });
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
