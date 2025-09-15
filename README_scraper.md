# CrazyGames Casual Games Scraper

这个工具可以帮你爬取CrazyGames休闲游戏页面的游戏信息，包括游戏名称、链接、图片和描述。

## 使用方法

### 方法1: 使用Python脚本 (推荐)

1. 确保已安装Python 3.6+
2. 安装依赖：
   ```bash
   pip install requests beautifulsoup4
   ```
3. 运行爬虫：
   ```bash
   python simple_scraper.py
   ```

### 方法2: 使用Node.js脚本

1. 确保已安装Node.js 16+
2. 安装依赖：
   ```bash
   npm install
   ```
3. 运行爬虫：
   ```bash
   npm start
   # 或者
   node node_scraper.js
   ```

### 方法3: 使用原生JavaScript

1. 确保已安装Node.js
2. 运行爬虫：
   ```bash
   node scraper.js
   ```

## 输出文件

运行后会在当前目录生成以下文件：

- `crazygames_casual.json` - 包含所有游戏信息的JSON文件
- `casual_games.html` - 包含所有游戏的HTML页面展示

## JSON文件格式

```json
{
  "scraped_at": "2024-01-01T12:00:00.000Z",
  "total_games": 50,
  "games": [
    {
      "name": "游戏名称",
      "url": "https://www.crazygames.com/game/game-name",
      "image": "https://example.com/image.jpg",
      "description": "游戏描述"
    }
  ]
}
```

## 功能特点

- ✅ 爬取游戏名称
- ✅ 爬取游戏链接
- ✅ 爬取游戏图片
- ✅ 爬取游戏描述
- ✅ 生成JSON数据文件
- ✅ 生成HTML展示页面
- ✅ 错误处理和重试机制
- ✅ 详细的日志输出

## 注意事项

1. 请合理使用，不要过于频繁地请求，避免对目标网站造成压力
2. 网站结构可能会变化，需要定期更新解析逻辑
3. 请遵守目标网站的robots.txt规则
4. 爬取的数据仅用于学习研究目的

## 故障排除

如果遇到问题，请检查：

1. 网络连接是否正常
2. 依赖是否正确安装
3. 目标网站是否可以正常访问
4. 是否有防火墙或代理设置

## 自定义配置

你可以修改脚本中的以下参数：

- `headers` - 请求头信息
- `timeout` - 请求超时时间
- `base_url` - 目标网站URL
- 输出文件名和路径

## 许可证

MIT License