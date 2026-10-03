# dsh-turn-continuation

在意外中断或终止失败且尚未完成的 Agent 回合下显示继续重试按钮。

## 安装

锁定公开仓库的提交后，通过 DSH 官方入口安装：

```powershell
pnpm dsh plugin --profile web add github:vb2250158/dsh-turn-continuation#<commit>
```

插件包声明 `dsh.bundle`，安装后会把自己的配置层加入 profile。

## 配置

插件配置保存在 DSH profile 的 `cordis.patch.yml`。多电脑同步仓库只保存仓库地址、固定提交、启停状态和配置，不保存本仓库源码。

## 验证

```powershell
npm test
npm run build
npm pack --dry-run
```

## 许可证

MIT

## 宿主兼容性

0.1.3 的 Typert 描述同时提供 `schema` 和 `create()`，兼容 DSH 0.1.5 与 0.1.6 的读取方式。两种方式使用同一请求与结果校验器。
