const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ComponentType,
  PermissionFlagsBits,
} = require('discord.js');
const { ADMIN_KEY, authorizedUsers } = require('./auth');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('選択したチャンネルを削除します（複数選択可・初回のみキー要）')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption((o) =>
      o.setName('key').setDescription('初回のみ必要なキー（認証済みなら不要）')
    ),
  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: 'このコマンドはサーバー内でのみ使用できます。',
        ephemeral: true,
      });
    }

    if (!authorizedUsers.has(interaction.user.id)) {
      const key = interaction.options.getString('key');
      if (key !== ADMIN_KEY) {
        return interaction.reply({
          content: '🔑 初回のみキーが必要です。`key`オプションにキーを入力して再実行してください。',
          ephemeral: true,
        });
      }
      authorizedUsers.add(interaction.user.id);
    }

    const selectRow = new ActionRowBuilder().addComponents(
      new ChannelSelectMenuBuilder()
        .setCustomId('clear-select')
        .setPlaceholder('削除するチャンネルを選択（複数選択可）')
        .setMinValues(1)
        .setMaxValues(25)
        .addChannelTypes(
          ChannelType.GuildText,
          ChannelType.GuildVoice,
          ChannelType.GuildAnnouncement,
          ChannelType.GuildForum,
          ChannelType.GuildCategory
        )
    );

    const reply = await interaction.reply({
      content: '🗑️ 削除するチャンネルを選択してください（複数選択可・60秒以内）。',
      components: [selectRow],
      ephemeral: true,
      fetchReply: true,
    });

    // 1. チャンネル選択を待つ
    let selectInteraction;
    try {
      selectInteraction = await reply.awaitMessageComponent({
        componentType: ComponentType.ChannelSelect,
        time: 60000,
        filter: (i) => i.user.id === interaction.user.id,
      });
    } catch {
      return interaction.editReply({
        content: '⏱️ 選択がタイムアウトしました。',
        components: [],
      });
    }

    const channels = selectInteraction.channels;
    const names = channels.map((c) => `#${c.name}`).join(', ');

    const confirmRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('clear-confirm')
        .setLabel('削除する')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('clear-cancel')
        .setLabel('キャンセル')
        .setStyle(ButtonStyle.Secondary)
    );

    await selectInteraction.update({
      content: `以下のチャンネルを削除します:\n${names}\n\n本当によろしいですか？（30秒以内に選択）`,
      components: [confirmRow],
    });

    // 2. 削除確認を待つ
    let confirmInteraction;
    try {
      confirmInteraction = await reply.awaitMessageComponent({
        componentType: ComponentType.Button,
        time: 30000,
        filter: (i) => i.user.id === interaction.user.id,
      });
    } catch {
      return interaction.editReply({
        content: '⏱️ 確認がタイムアウトしました。削除はキャンセルされました。',
        components: [],
      });
    }

    if (confirmInteraction.customId === 'clear-cancel') {
      return confirmInteraction.update({
        content: '❌ 削除をキャンセルしました。',
        components: [],
      });
    }

    await confirmInteraction.update({ content: '🗑️ 削除中...', components: [] });

    const deleted = [];
    const failed = [];
    for (const channel of channels.values()) {
      try {
        await channel.delete(`${interaction.user.tag} によるチャンネル削除 (/clear)`);
        deleted.push(channel.name);
      } catch (err) {
        console.error('チャンネル削除エラー:', err);
        failed.push(channel.name);
      }
    }

    const embed = new EmbedBuilder()
      .setColor(deleted.length ? 0x57f287 : 0xed4245)
      .setTitle('🗑️ チャンネル削除完了')
      .addFields(
        {
          name: '削除成功',
          value: deleted.length ? deleted.map((n) => `#${n}`).join(', ') : 'なし',
        },
        {
          name: '削除失敗',
          value: failed.length ? failed.map((n) => `#${n}`).join(', ') : 'なし',
        }
      );

    await interaction.editReply({ content: '', embeds: [embed], components: [] });
  },
};
