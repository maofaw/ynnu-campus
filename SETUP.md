# CloudBase 云开发环境配置指南

## 一、开通云开发环境

1. 打开 **https://console.cloud.tencent.com/tcb**（腾讯云开发控制台）
2. 使用微信扫码登录（微信开发者账号）
3. 点击「新建环境」→ 环境名称填 `ynnu-campus`
4. 选择「按量计费」（有免费额度，不会扣费）
5. 点击「立即开通」，等待 1-2 分钟创建完成

## 二、获取环境 ID

1. 进入环境 → 点击顶部环境名称旁的复制按钮
2. 得到类似 `ynnu-campus-7gx8xxxxx` 的环境 ID
3. **修改 `js/cloudbase.js`** 中的 `ENV_ID`：
   ```js
   const ENV_ID = '你的环境ID'; // 替换这里
   ```

## 三、开启匿名登录

1. 控制台 → 环境 → 「用户管理」→「登录设置」
2. 找到「匿名登录」→ 点击「开启」

## 四、创建 4 个数据库集合

1. 控制台 → 「数据库」→「集合管理」→「新建集合」
2. 依次创建以下 4 个集合（名称严格一致）：
   - `campus_buildings`
   - `campus_canteens`  
   - `campus_depts`
   - `campus_events`

## 五、配置安全规则

1. 控制台 → 「数据库」→ 点击每个集合 →「权限设置」
2. 切换到「自定义安全规则」
3. **每个集合**都粘贴以下规则：

```json
{
  "read": true,
  "write": false
}
```

> 含义：所有人可读，Web 端无法写入。管理员通过控制台直接编辑数据。

## 六、导入数据

### 方式 A：控制台导入（推荐）

1. 控制台 → 「数据库」→ 点击「campus_buildings」集合
2. 点击「导入」→ 选择 `data/import/campus_buildings.json`
3. 导入格式选择「JSON Lines」（如果不是），点确定
4. 用同样的方式依次导入其余 3 个 JSON 文件到对应集合

### 方式 B：JSON 批量导入（如控制台不支持直接导入）

在控制台 → 「数据库」→ 记录管理 → 点击「添加记录」→ 逐个复制 JSON 对象粘贴。数据量少（30+条），5 分钟即可完成。

## 七、验证

1. 修改完 `cloudbase.js` 中的 ENV_ID 后
2. 重新 commit + push 到 GitHub
3. GitHub Pages 自动部署后，打开 `https://maofaw.github.io/ynnu-campus/`
4. 检查浏览器控制台有无错误
5. 如果看到「✅ CloudBase 已连接」，即为成功

## 八、管理员日常操作

需要增删改数据时：
- 打开 CloudBase 控制台 → 数据库 → 选中集合 → 直接编辑/新增/删除记录
- 所有修改实时生效，刷新网页即可看到
