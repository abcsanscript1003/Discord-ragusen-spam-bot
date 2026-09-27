const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Botの応答速度を確認します'),
  async execute(interaction) {
    const sent = await interaction.reply({ content: '計測中...', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(
      `🏓 Pong!\nレイテンシ: ${latency}ms\nAPIレイテンシ: ${Math.round(interaction.client.ws.ping)}ms`
    );
  },
};
