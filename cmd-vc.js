const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const { players } = require('./voice-state');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vc')
    .setDescription('ボイスチャンネルに参加・退出します')
    .addStringOption((o) =>
      o
        .setName('action')
        .setDescription('参加するか退出するか')
        .setRequired(true)
        .addChoices(
          { name: '参加', value: 'join' },
          { name: '退出', value: 'leave' }
        )
    ),
  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: 'このコマンドはサーバー内でのみ使用できます。',
        ephemeral: true,
      });
    }

    const action = interaction.options.getString('action');

    if (action === 'join') {
      const voiceChannel = interaction.member.voice?.channel;
      if (!voiceChannel) {
        return interaction.reply({
          content: '⚠️ まずあなた自身がボイスチャンネルに参加してから実行してください。',
          ephemeral: true,
        });
      }

      try {
        joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: interaction.guild.id,
          adapterCreator: interaction.guild.voiceAdapterCreator,
          selfDeaf: true,
        });
      } catch (err) {
        console.error('VC参加エラー:', err);
        return interaction.reply({
          content: '⚠️ ボイスチャンネルへの参加に失敗しました。',
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setColor(0x57f287)
        .setDescription(`🔊 <#${voiceChannel.id}> に参加しました。`);
      return interaction.reply({ embeds: [embed] });
    }

    // action === 'leave'
    const connection = getVoiceConnection(interaction.guild.id);
    if (!connection) {
      return interaction.reply({
        content: '⚠️ ボイスチャンネルに参加していません。',
        ephemeral: true,
      });
    }

    players.get(interaction.guild.id)?.stop();
    players.delete(interaction.guild.id);
    connection.destroy();

    const embed = new EmbedBuilder()
      .setColor(0xed4245)
      .setDescription('👋 ボイスチャンネルから退出しました。');
    return interaction.reply({ embeds: [embed] });
  },
};
