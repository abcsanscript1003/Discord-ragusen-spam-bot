const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const NUMBER_EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('リアクション投票を作成します')
    .addStringOption((o) =>
      o.setName('question').setDescription('質問内容').setRequired(true)
    )
    .addStringOption((o) =>
      o.setName('option1').setDescription('選択肢1').setRequired(true)
    )
    .addStringOption((o) =>
      o.setName('option2').setDescription('選択肢2').setRequired(true)
    )
    .addStringOption((o) => o.setName('option3').setDescription('選択肢3'))
    .addStringOption((o) => o.setName('option4').setDescription('選択肢4'))
    .addStringOption((o) => o.setName('option5').setDescription('選択肢5')),
  async execute(interaction) {
    const question = interaction.options.getString('question');
    const options = [1, 2, 3, 4, 5]
      .map((n) => interaction.options.getString(`option${n}`))
      .filter(Boolean);

    const embed = new EmbedBuilder()
      .setColor(0x3ba55d)
      .setTitle(`📊 ${question}`)
      .setDescription(
        options.map((opt, i) => `${NUMBER_EMOJIS[i]} ${opt}`).join('\n')
      )
      .setFooter({ text: `${interaction.user.username} が作成` });

    const reply = await interaction.reply({ embeds: [embed], fetchReply: true });
    for (let i = 0; i < options.length; i++) {
      await reply.react(NUMBER_EMOJIS[i]);
    }
  },
};
