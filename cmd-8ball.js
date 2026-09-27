const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const ANSWERS = [
  'はい、間違いなく。',
  'その可能性は高い。',
  'たぶんそう。',
  '今は何とも言えない。',
  'もう一度聞いてみて。',
  '期待しない方がいい。',
  'いいえ。',
  '絶対に違う。',
  '状況次第。',
  '兆候は良好。',
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('マジック8ボールに質問します')
    .addStringOption((o) =>
      o.setName('question').setDescription('質問内容').setRequired(true)
    ),
  async execute(interaction) {
    const question = interaction.options.getString('question');
    const answer = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];

    const embed = new EmbedBuilder()
      .setColor(0x2f3136)
      .setTitle('🎱 マジック8ボール')
      .addFields(
        { name: '質問', value: question },
        { name: '答え', value: answer }
      );

    await interaction.reply({ embeds: [embed] });
  },
};
