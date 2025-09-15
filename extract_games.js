// 提取Next.js数据中的游戏信息
const fs = require('fs');

// 读取Next.js数据
const data = JSON.parse(fs.readFileSync('next_data.json', 'utf8'));

// 提取游戏数据
const games = data.props.pageProps.games || [];
console.log('Found', games.length, 'games');

// 显示前5个游戏的信息
console.log('\n=== First 5 games ===');
games.slice(0, 5).forEach((game, index) => {
    console.log(`\n${index + 1}. ${game.title || game.name || 'Unknown'}`);
    console.log('   URL:', `https://www.crazygames.com/game/${game.slug}`);
    console.log('   Image:', game.thumbnailUrl || game.imageUrl || game.image || 'No image');
    console.log('   Description:', game.description ? game.description.substring(0, 100) + '...' : 'No description');
});

// 保存游戏数据
const gameData = {
    scraped_at: new Date().toISOString(),
    total_games: games.length,
    games: games.map(game => ({
        name: game.title || game.name || 'Unknown Game',
        url: `https://www.crazygames.com/game/${game.slug}`,
        image: game.thumbnailUrl || game.imageUrl || game.image || '',
        description: game.description || `${game.title || game.name} online for free`,
        category: game.category || 'casual',
        tags: game.tags || [],
        slug: game.slug || '',
        rating: game.rating || 0,
        plays: game.plays || 0
    }))
};

// 保存为JSON文件
fs.writeFileSync('crazygames_casual_games.json', JSON.stringify(gameData, null, 2));
console.log(`\nSaved ${games.length} games to crazygames_casual_games.json`);

// 创建HTML展示页面
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
            height: 50px;
            overflow: hidden;
        }
        .game-stats {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 11px;
            color: #888;
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
        .rating {
            color: #ffa500;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>CrazyGames Casual Games Collection</h1>
        <p>Found ${games.length} casual games</p>
        <p>Scraped on: ${new Date().toLocaleString()}</p>
    </div>
    <div class="games-grid">
${gameData.games.map(game => `
        <div class="game-card">
            <img src="${game.image}" alt="${game.name}" class="game-image" onerror="this.src='https://via.placeholder.com/250x150?text=No+Image'">
            <div class="game-info">
                <div class="game-title">${game.name}</div>
                <div class="game-description">${game.description}</div>
                <div class="game-stats">
                    <span class="rating">★ ${game.rating.toFixed(1)}</span>
                    <span>🎮 ${game.plays.toLocaleString()}</span>
                </div>
                <a href="${game.url}" target="_blank" class="play-button">Play Now</a>
            </div>
        </div>
`).join('')}
    </div>
</body>
</html>`;

fs.writeFileSync('casual_games.html', htmlContent);
console.log('Created HTML page: casual_games.html');

console.log('\n=== Summary ===');
console.log(`Total games found: ${games.length}`);
console.log('Files created:');
console.log('- crazygames_casual_games.json (raw data)');
console.log('- casual_games.html (visual page)');