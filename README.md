# @openilink/app-currency

微信汇率换算 -- 30+ 货币实时汇率查询与换算，基于 Frankfurter 免费 API，零配置即用。

> **一键安装** -- 前往 [OpeniLink Hub 应用市场](https://hub.openilink.com) 搜索「汇率」，点击安装即可在微信中使用。

## 功能亮点

- **实时汇率换算** -- 支持全球 30+ 主要货币之间的即时换算
- **汇率查询** -- 查看基准货币对多种目标货币的当前汇率
- **货币列表** -- 查看所有支持的货币代码和名称
- **无需 API Key** -- 使用完全免费的 Frankfurter API，零配置

## 使用方式

安装到 Bot 后，直接用微信对话即可：

**自然语言（推荐）**

- "100 美元等于多少人民币"
- "今天欧元汇率多少"

**命令调用**

- `/convert_currency --amount 100 --from USD --to CNY`

**AI 自动调用** -- Hub AI 在多轮对话中会自动判断是否需要调用汇率功能，无需手动触发。

### AI Tools

| 工具名 | 说明 |
|--------|------|
| `convert_currency` | 汇率换算 |
| `get_exchange_rate` | 查询汇率 |
| `list_currencies` | 列出支持的货币 |

<details>
<summary><strong>部署与开发</strong></summary>

### 快速开始

```bash
npm install
npm run dev
```

### Docker 部署

```bash
docker-compose up -d
```

### 环境变量

| 变量名 | 必填 | 默认值 | 说明 |
|--------|------|--------|------|
| `HUB_URL` | 是 | -- | OpeniLink Hub 服务地址 |
| `BASE_URL` | 是 | -- | 本服务的公网回调地址 |
| `DB_PATH` | 否 | `data/currency.db` | SQLite 数据库文件路径 |
| `PORT` | 否 | `8092` | HTTP 服务端口 |

### API 路由

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/hub/webhook` | 接收 Hub 推送的事件 |
| `GET` | `/oauth/setup` | 启动 OAuth 安装流程 |
| `GET` | `/oauth/redirect` | OAuth 回调处理 |
| `GET` | `/manifest.json` | 返回应用清单 |
| `GET` | `/health` | 健康检查 |

</details>

## 安全与隐私

- **无需 API Key** -- 使用免费公开 API，不需要任何认证信息
- **不存储数据** -- 纯工具型应用，请求即响应，无任何持久化
- 如需自部署：`docker compose up -d`

## License

MIT
