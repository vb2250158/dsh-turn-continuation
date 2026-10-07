# dsh-turn-continuation

This release requires DSH 0.2.1-alpha.1 or a compatible 0.2 release. See [compatibility details](docs/dsh-0.2-compatibility.md).

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

0.1.3 的 Typert 描述同时提供 `schema` 和 `create()`，兼容 DSH 0.1.5 与 0.1.7 的读取方式。两种方式使用同一请求与结果校验器。

## Plugin display metadata

The plugin list shows **Turn continuation** in English and **任务续跑** in Chinese, following the DSH interface language. `locale/en.json` and `locale/zh.json` provide the title and description; `icon.svg` supplies self-contained artwork. The package exports and publishes these resources. The icon is adapted from Lucide; see [ICON_LICENSE.txt](ICON_LICENSE.txt).

The icon uses a centered 36 × 36 viewBox to leave more space around the artwork inside the plugin icon frame.
