// CloudBase 云开发初始化
// 使用 CDN 引入 SDK 后，全局 cloudbase 对象可用

let db = null;
let cloudbaseReady = false;

async function initCloudbase() {
  // TODO: 替换为你的 CloudBase 环境 ID
  // 在微信云开发控制台 → 设置 → 环境 ID 中获取
  const ENV_ID = 'your-env-id';

  try {
    const app = cloudbase.init({
      env: ENV_ID
    });

    // 匿名登录（只读用户，安全规则保证无法写入）
    const auth = app.auth();
    await auth.signInAnonymously();

    db = app.database();
    cloudbaseReady = true;
    console.log('✅ CloudBase 已连接，匿名登录成功');
  } catch (err) {
    console.error('❌ CloudBase 初始化失败:', err);
    cloudbaseReady = false;
  }
}

// 页面加载时初始化
initCloudbase();
