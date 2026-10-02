const {
  SlashCommandBuilder,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');
const { getVoiceConnection, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const play = require('play-dl');
const { players } = require('./voice-state');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('youtube')
    .setDescription('YouTubeのリンクを入力してVCで音楽を再生します'),
  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: 'このコマンドはサーバー内でのみ使用できます。',
        ephemeral: true,
      });
    }

    const modal = new ModalBuilder()
      .setCustomId('youtube-modal')
      .setTitle('YouTube再生');

    const urlInput = new TextInputBuilder()
      .setCustomId('youtube-url')
      .setLabel('YouTubeのリンクを入力してください')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('https://www.youtube.com/watch?v=...')
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(urlInput));

    await interaction.showModal(modal);

    // モーダルの送信を待つ（自分自身のみ・60秒以内）
    let submitted;
    try {
      submitted = await interaction.awaitModalSubmit({
        filter: (i) => i.user.id === interaction.user.id && i.customId === 'youtube-modal',
        time: 60000,
      });
    } catch {
      return; // タイムアウト。モーダルは自動で閉じるため何もしなくてよい
    }

    const url = submitted.fields.getTextInputValue('youtube-url');
    await submitted.deferReply({ ephemeral: true });

    const connection = getVoiceConnection(interaction.guild.id);
    if (!connection) {
      return submitted.editReply({
        content: '⚠️ まず `/vc action:参加` でBotをボイスチャンネルに参加させてください。',
      });
    }

    const validation = play.yt_validate(url);
    if (validation !== 'video') {
      return submitted.editReply({
        content: '⚠️ 有効なYouTubeの動画リンクを入力してください。',
      });
    }

    try {
      const stream = await play.stream(url);
      const resource = createAudioResource(stream.stream, { inputType: stream.type });
      const player = createAudioPlayer();

      player.on('error', (err) => console.error('再生エラー:', err));
      player.play(resource);
      connection.subscribe(player);
      players.set(interaction.guild.id, player);

      let title = url;
      try {
        const info = await play.video_info(url);
        title = info.video_details.title ?? url;
      } catch {
        // タイトル取得失敗時はURLのまま表示
      }

      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('🎵 再生を開始しました')
        .setDescription(title);

      await submitted.editReply({ embeds: [embed] });
    } catch (err) {
      console.error('YouTube再生エラー:', err);
      await submitted.editReply({
        content: '⚠️ 再生に失敗しました。リンクを確認するか、しばらくしてからお試しください。',
      });
    }
  },
};
