const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('choose')
    .setDescription('選択肢からランダムに1つ選びます')
    .addStringOption((o) =>
      o
        .setName('options')
        .setDescription('カンマ区切りで選択肢を入力（例: ラーメン,カレー,寿司）')
        .setRequired(true)
    ),
  async execute(interaction) {
    const raw = interaction.options.getString('options');
    const choices = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (choices.length < 2) {
      return interaction.reply({
        content: 'カンマ区切りで2つ以上の選択肢を入力してください。',
        ephemeral: true,
      });
    }

    const picked = choices[Math.floor(Math.random() * choices.length)];

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle('🎯 選択結果')
      .setDescription(`候補: ${choices.join(' / ')}\n\n選ばれたのは… **${picked}**`);

    await interaction.reply({ embeds: [embed] });
  },
};
