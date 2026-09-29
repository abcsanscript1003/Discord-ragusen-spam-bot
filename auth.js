// /clear と /createspeak で共有する管理者キー認証の状態
// 一度キーで認証したユーザーIDは、Bot再起動までキー入力なしで実行できる

const ADMIN_KEY = 'Ragusenさいつよ';
const authorizedUsers = new Set();

module.exports = { ADMIN_KEY, authorizedUsers };
