const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('サイコロを振ります')
    .addIntegerOption((o) =>
      o.setName('sides').setDescription('サイコロの面数（デフォルト6）').setMinValue(2).setMaxValue(1000)
    )
    .addIntegerOption((o) =>
      o.setName('count').setDescription('振る回数（デフォルト1）').setMinValue(1).setMaxValue(20)
    ),
  async execute(interaction) {
    const sides = interaction.options.getInteger('sides') ?? 6;
    const count = interaction.options.getInteger('count') ?? 1;

    const results = Array.from(
      { length: count },
      () => Math.floor(Math.random() * sides) + 1
    );
    const total = results.reduce((a, b) => a + b, 0);

    const embed = new EmbedBuilder()
      .setColor(0xed4245)
      .setTitle(`🎲 D${sides} を ${count} 回`)
      .setDescription(`結果: ${results.join(', ')}\n合計: **${total}**`);

    await interaction.reply({ embeds: [embed] });
  },
};
