const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// メモ: シンプルな実装のため、Botの再起動でリマインダーは消えます。
module.exports = {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('指定した分数後にこのチャンネルでリマインドします')
    .addIntegerOption((o) =>
      o.setName('minutes').setDescription('何分後か').setRequired(true).setMinValue(1).setMaxValue(1440)
    )
    .addStringOption((o) =>
      o.setName('message').setDescription('リマインド内容').setRequired(true)
    ),
  async execute(interaction) {
    const minutes = interaction.options.getInteger('minutes');
    const message = interaction.options.getString('message');

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle('⏰ リマインダー設定完了')
      .setDescription(`${minutes}分後にお知らせします: ${message}`);

    await interaction.reply({ embeds: [embed] });

    setTimeout(async () => {
      const reminderEmbed = new EmbedBuilder()
        .setColor(0xfee75c)
        .setTitle('⏰ リマインド')
        .setDescription(message)
        .setFooter({ text: `${interaction.user.username} からの${minutes}分前のリクエスト` });

      try {
        await interaction.followUp({
          content: `<@${interaction.user.id}>`,
          embeds: [reminderEmbed],
        });
      } catch (err) {
        console.error('リマインド送信エラー:', err);
      }
    }, minutes * 60 * 1000);
  },
};
