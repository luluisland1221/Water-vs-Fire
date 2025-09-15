// CrazyGames Casual Games Scraper (Node.js version)
// 需要安装: npm install axios cheerio

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

class CrazyGamesScraper {
    constructor() {
        this.base_url = 'https://www.crazygames.com';
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        };
    }

    async fetchPage(url) {
        try {
            const response = await axios.get(url, {
                headers: this.headers,
                timeout: 10000
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching ${url}:`, error.message);
            return null;
        }
    }

    parseGames(html) {
        const $ = cheerio.load(html);
        const games = [];

        // 查找所有游戏链接
        $('a[href^="/game/"]').each((index, element) => {
            const $element = $(element);
            const href = $element.attr('href');

            // 只处理直接的游戏链接
            if (href && href.match(/^\/game\/[^\/]+$/)) {
                const gameUrl = this.base_url + href;
                let gameName = '';
                let gameImage = '';
                let description = '';

                // 尝试获取游戏名称
                gameName = $element.attr('title') || $element.data('title');

                // 如果没有title，尝试从图片获取
                if (!gameName) {
                    const $img = $element.find('img');
                    gameName = $img.attr('alt') || '';
                }

                // 获取图片URL
                const $img = $element.find('img');
                gameImage = $img.attr('src') || $img.data('src') || '';

                if (gameImage && !gameImage.startsWith('http')) {
                    gameImage = this.base_url + gameImage;
                }

                // 获取描述
                const $desc = $element.find('p[class*="description"]').first();
                description = $desc.text().trim() || `Play ${gameName} online for free`;

                if (gameName && gameUrl) {
                    games.push({
                        name: gameName,
                        url: gameUrl,
                        image: gameImage,
                        description: description
                    });
                }
            }
        });

        return games;
    }

    saveGamesToFile(games, filename = 'crazygames_casual.json') {
        const data = {
            scraped_at: new Date().toISOString(),
            total_games: games.length,
            games: games
        };

        fs.writeFileSync(filename, JSON.stringify(data, null, 2));
        console.log(`Saved ${games.length} games to ${filename}`);
    }

    async scrapeCasualGames() {
        console.log('Scraping CrazyGames Casual Games...');

        const url = 'https://www.crazygames.com/c/casual';
        const html = await this.fetchPage(url);

        if (!html) {
            console.log('Failed to fetch page');
            return [];
        }

        console.log('Page fetched successfully, parsing games...');
        const games = this.parseGames(html);

        console.log(`Found ${games.length} games`);

        // 保存到文件
        this.saveGamesToFile(games);

        // 显示前10个游戏
        console.log('\nFirst 10 games:');
        games.slice(0, 10).forEach((game, index) => {
            console.log(`${index + 1}. ${game.name}`);
            console.log(`   URL: ${game.url}`);
            console.log(`   Image: ${game.image}`);
            console.log(`   Description: ${game.description}`);
            console.log('');
        });

        return games;
    }

    createHtmlPage(games, filename = 'casual_games.html') {
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CrazyGames Casual Games Collection</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .games-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        .game-card {
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        .game-card:hover {
            transform: translateY(-5px);
        }
        .game-image {
            width: 100%;
            height: 150px;
            object-fit: cover;
        }
        .game-info {
            padding: 15px;
        }
        .game-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #333;
        }
        .game-description {
            font-size: 12px;
            color: #666;
            margin-bottom: 10px;
            line-height: 1.4;
        }
        .play-button {
            display: inline-block;
            background: #ff6b6b;
            color: white;
            padding: 8px 16px;
            text-decoration: none;
            border-radius: 5px;
            font-size: 12px;
            transition: background 0.3s ease;
        }
        .play-button:hover {
            background: #ff5252;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>CrazyGames Casual Games Collection</h1>
        <p>Found ${games.length} casual games</p>
    </div>
    <div class="games-grid">
${games.map(game => `
        <div class="game-card">
            <img src="${game.image}" alt="${game.name}" class="game-image" onerror="this.src='https://via.placeholder.com/250x150?text=No+Image'">
            <div class="game-info">
                <div class="game-title">${game.name}</div>
                <div class="game-description">${game.description}</div>
                <a href="${game.url}" target="_blank" class="play-button">Play Now</a>
            </div>
        </div>
`).join('')}
    </div>
</body>
</html>`;

        fs.writeFileSync(filename, htmlContent);
        console.log(`Created HTML page: ${filename}`);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const scraper = new CrazyGamesScraper();
    scraper.scrapeCasualGames().then(games => {
        if (games && games.length > 0) {
            scraper.createHtmlPage(games);
        }
    }).catch(error => {
        console.error('Error:', error);
    });
}

module.exports = CrazyGamesScraper;