const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timestamp')
    .setDescription('現在時刻をDiscordタイムスタンプ形式で表示します'),
  async execute(interaction) {
    const now = Math.floor(Date.now() / 1000);
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('🕒 現在時刻')
      .addFields(
        { name: '短い日時', value: `<t:${now}:f>`, inline: true },
        { name: '相対表示', value: `<t:${now}:R>`, inline: true },
        { name: 'コピー用', value: `\`<t:${now}:f>\`` }
      );

    await interaction.reply({ embeds: [embed] });
  },
};
