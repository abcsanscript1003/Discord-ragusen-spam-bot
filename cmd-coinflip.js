const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('コインを投げます'),
  async execute(interaction) {
    const result = Math.random() < 0.5 ? '表' : '裏';
    const embed = new EmbedBuilder()
      .setColor(0xfee75c)
      .setTitle('🪙 コイントス')
      .setDescription(`結果: **${result}**`);

    await interaction.reply({ embeds: [embed] });
  },
};
