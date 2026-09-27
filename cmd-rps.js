const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const HANDS = { rock: 'グー', paper: 'パー', scissors: 'チョキ' };
const ORDER = ['rock', 'paper', 'scissors'];

function judge(user, bot) {
  if (user === bot) return 'draw';
  const beats = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
  return beats[user] === bot ? 'win' : 'lose';
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rps')
    .setDescription('Botとじゃんけんをします')
    .addStringOption((o) =>
      o
        .setName('hand')
        .setDescription('出す手を選択')
        .setRequired(true)
        .addChoices(
          { name: 'グー', value: 'rock' },
          { name: 'チョキ', value: 'scissors' },
          { name: 'パー', value: 'paper' }
        )
    ),
  async execute(interaction) {
    const userHand = interaction.options.getString('hand');
    const botHand = ORDER[Math.floor(Math.random() * ORDER.length)];
    const result = judge(userHand, botHand);
    const resultText =
      result === 'draw' ? 'あいこ' : result === 'win' ? 'あなたの勝ち！' : 'あなたの負け…';

    const embed = new EmbedBuilder()
      .setColor(result === 'win' ? 0x57f287 : result === 'lose' ? 0xed4245 : 0xfee75c)
      .setTitle('✊✋✌️ じゃんけん')
      .addFields(
        { name: 'あなた', value: HANDS[userHand], inline: true },
        { name: 'Bot', value: HANDS[botHand], inline: true },
        { name: '結果', value: resultText }
      );

    await interaction.reply({ embeds: [embed] });
  },
};
