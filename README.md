# @openilink/app-currency

汇率换算工具，基于 Frankfurter 免费 API，支持全球主要货币实时汇率查询与换算。

## 特色

- **无需 API Key** — 使用完全免费的 Frankfurter API
- **实时汇率换算** — 支持全球主要货币之间的换算
- **汇率查询** — 查看基准货币对多种目标货币的汇率
- **货币列表** — 查看所有支持的货币代码和名称

## 快速开始

```bash
npm install
npm run dev
```

### Docker 部署

```bash
docker-compose up -d
```

## 环境变量

| 变量名 | 必填 | 默认值 | 说明 |
|--------|------|--------|------|
| `HUB_URL` | 是 | — | OpeniLink Hub 服务地址 |
| `BASE_URL` | 是 | — | 本服务的公网回调地址 |
| `DB_PATH` | 否 | `data/currency.db` | SQLite 数据库文件路径 |
| `PORT` | 否 | `8092` | HTTP 服务端口 |

## 3 个 AI Tools

| 工具名 | 说明 |
|--------|------|
| `convert_currency` | 汇率换算 |
| `get_exchange_rate` | 查询汇率 |
| `list_currencies` | 列出支持的货币 |

## API 路由

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/hub/webhook` | 接收 Hub 推送的事件 |
| `GET` | `/oauth/setup` | 启动 OAuth 安装流程 |
| `GET` | `/oauth/redirect` | OAuth 回调处理 |
| `GET` | `/manifest.json` | 返回应用清单 |
| `GET` | `/health` | 健康检查 |

## License

MIT
