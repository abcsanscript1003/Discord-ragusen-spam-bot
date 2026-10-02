// /vc と /youtube で共有する、サーバーごとのボイス接続・再生プレイヤー
const players = new Map(); // guildId -> AudioPlayer

module.exports = { players };
