const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChannelType,
  PermissionFlagsBits,
} = require('discord.js');
const { ADMIN_KEY, authorizedUsers } = require('./auth');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createspeak')
    .setDescription('チャンネルを作成し、そこで指定回数まとめて発言します（初回のみキー要）')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption((o) =>
      o.setName('content').setDescription('発言する内容').setRequired(true)
    )
    .addStringOption((o) =>
      o.setName('name').setDescription('作成するチャンネル名').setRequired(true)
    )
    .addIntegerOption((o) =>
      o
        .setName('channels')
        .setDescription('作成するチャンネル数')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .addIntegerOption((o) =>
      o
        .setName('times')
        .setDescription('各チャンネルで発言する回数')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(200)
    )
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

    const content = interaction.options.getString('content');
    const baseName = interaction.options.getString('name');
    const channelCount = interaction.options.getInteger('channels');
    const times = interaction.options.getInteger('times');

    await interaction.deferReply({ ephemeral: true });

    // 1. チャンネルを一気に作成
    const names = Array.from({ length: channelCount }, (_, i) =>
      channelCount > 1 ? `${baseName}-${i + 1}` : baseName
    );

    const createResults = await Promise.allSettled(
      names.map((name) =>
        interaction.guild.channels.create({
          name,
          type: ChannelType.GuildText,
          reason: `${interaction.user.tag} による作成 (/createspeak)`,
        })
      )
    );

    const created = [];
    const failed = [];
    createResults.forEach((r, i) => {
      if (r.status === 'fulfilled') created.push(r.value);
      else {
        console.error('チャンネル作成エラー:', r.reason);
        failed.push(names[i]);
      }
    });

    // 2. 全チャンネル・全回数の発言を一気に送信
    await Promise.allSettled(
      created.flatMap((channel) =>
        Array.from({ length: times }, () => channel.send(content))
      )
    );

    const embed = new EmbedBuilder()
      .setColor(created.length ? 0x57f287 : 0xed4245)
      .setTitle('📢 チャンネル作成 & 発言 完了')
      .addFields(
        {
          name: '作成成功',
          value: created.length
            ? created.map((c) => `<#${c.id}>（${times}回発言）`).join('\n').slice(0, 1024)
            : 'なし',
        },
        { name: '作成失敗', value: failed.length ? failed.join(', ').slice(0, 1024) : 'なし' }
      );

    try {
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      // 処理が長引いて応答の有効期限（15分）が切れた場合は、チャンネルに結果を投稿
      console.error('editReply エラー:', err);
      await interaction.channel?.send({ embeds: [embed] }).catch(() => {});
    }
  },
};
