// CrazyGames Casual Games Scraper
// 这个脚本可以爬取CrazyGames休闲游戏页面的游戏信息

const https = require('https');
const http = require('http');
const fs = require('fs');

class CrazyGamesScraper {
    constructor() {
        this.baseUrl = 'https://www.crazygames.com';
        this.games = [];
    }

    // 下载网页内容
    async fetchPage(url) {
        return new Promise((resolve, reject) => {
            const protocol = url.startsWith('https') ? https : http;

            const options = {
                hostname: new URL(url).hostname,
                path: new URL(url).pathname,
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                }
            };

            const req = protocol.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    if (res.statusCode === 200) {
                        resolve(data);
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.end();
        });
    }

    // 解析HTML提取游戏信息
    parseGames(html) {
        const games = [];

        // 使用正则表达式匹配游戏卡片
        // 注意：实际使用时可能需要根据页面结构调整正则表达式

        // 匹配游戏链接和名称
        const gameLinkRegex = /<a[^>]*href="\/game\/([^"]*)"[^>]*title="([^"]*)"[^>]*>/gi;
        const gameImageRegex = /<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi;

        let match;
        while ((match = gameLinkRegex.exec(html)) !== null) {
            const gameSlug = match[1];
            const gameName = match[2];

            // 构建完整的游戏URL
            const gameUrl = `${this.baseUrl}/game/${gameSlug}`;

            // 构建可能的图片URL
            const imageUrl = `${this.baseUrl}/game/${gameSlug}/thumbnail`;

            games.push({
                name: gameName,
                url: gameUrl,
                image: imageUrl,
                description: `Play ${gameName} online for free on CrazyGames`
            });
        }

        return games;
    }

    // 更精确的游戏卡片匹配
    parseGameCards(html) {
        const games = [];

        // 匹配游戏容器
        const cardRegex = /<div[^>]*class="[^"]*game-card[^"]*"[^>]*>[\s\S]*?<\/div>/gi;
        let cardMatch;

        while ((cardMatch = cardRegex.exec(html)) !== null) {
            const cardHtml = cardMatch[0];

            // 提取游戏名称
            const nameMatch = cardHtml.match(/title="([^"]*)"/i);
            const name = nameMatch ? nameMatch[1] : 'Unknown Game';

            // 提取游戏链接
            const urlMatch = cardHtml.match(/href="\/game\/([^"]*)"/i);
            const url = urlMatch ? `${this.baseUrl}/game/${urlMatch[1]}` : '';

            // 提取图片URL
            const imageMatch = cardHtml.match(/src="([^"]*\.(jpg|jpeg|png|webp))"/i);
            const image = imageMatch ? (imageMatch[1].startsWith('http') ? imageMatch[1] : `${this.baseUrl}${imageMatch[1]}`) : '';

            // 提取描述
            const descMatch = cardHtml.match(/<p[^>]*class="[^"]*description[^"]*"[^>]*>([^<]*)<\/p>/i);
            const description = descMatch ? descMatch[1].trim() : '';

            if (name && url) {
                games.push({
                    name: name,
                    url: url,
                    image: image,
                    description: description || `Play ${name} online for free`
                });
            }
        }

        return games;
    }

    // 保存游戏数据到文件
    saveGamesToFile(games, filename = 'crazygames_casual.json') {
        const data = {
            scraped_at: new Date().toISOString(),
            total_games: games.length,
            games: games
        };

        fs.writeFileSync(filename, JSON.stringify(data, null, 2));
        console.log(`Saved ${games.length} games to ${filename}`);
    }

    // 主爬取函数
    async scrapeCasualGames() {
        try {
            console.log('Scraping CrazyGames Casual Games...');

            const url = 'https://www.crazygames.com/c/casual';
            const html = await this.fetchPage(url);

            console.log('Page fetched successfully, parsing games...');

            // 尝试不同的解析方法
            let games = this.parseGameCards(html);

            if (games.length === 0) {
                console.log('No games found with card parsing, trying alternative method...');
                games = this.parseGames(html);
            }

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

        } catch (error) {
            console.error('Error scraping games:', error);
            return [];
        }
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const scraper = new CrazyGamesScraper();
    scraper.scrapeCasualGames();
}

module.exports = CrazyGamesScraper;