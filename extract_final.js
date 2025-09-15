// 最终版本的游戏数据提取
const fs = require('fs');

// 读取Next.js数据
const data = JSON.parse(fs.readFileSync('next_data.json', 'utf8'));

// 提取所有游戏数据
const topGames = data.props.pageProps.topGames || [];
const topMobileGames = data.props.pageProps.topMobileGames || [];
const linkBoostedGames = data.props.pageProps.linkBoostedGames || [];

// 合并所有游戏并去重
const allGames = [...topGames, ...topMobileGames, ...linkBoostedGames];
const uniqueGames = [];
const seenSlugs = new Set();

allGames.forEach(game => {
  if (game.slug && !seenSlugs.has(game.slug)) {
    seenSlugs.add(game.slug);
    uniqueGames.push(game);
  }
});

console.log('Found games:');
console.log('- Top games:', topGames.length);
console.log('- Top mobile games:', topMobileGames.length);
console.log('- Link boosted games:', linkBoostedGames.length);
console.log('- Total unique games:', uniqueGames.length);

// 显示前5个游戏的信息
console.log('\n=== First 5 games ===');
uniqueGames.slice(0, 5).forEach((game, index) => {
    console.log(`\n${index + 1}. ${game.title || game.name || 'Unknown'}`);
    console.log('   URL:', `https://www.crazygames.com/game/${game.slug}`);
    console.log('   Image:', game.cover?.thumbnailUrl || game.cover?.url || 'No image');
    console.log('   Category:', game.categoryName || 'Unknown');
    console.log('   Mobile Friendly:', game.mobileFriendly ? 'Yes' : 'No');
});

// 保存游戏数据
const gameData = {
    scraped_at: new Date().toISOString(),
    total_games: uniqueGames.length,
    games: uniqueGames.map(game => ({
        name: game.title || game.name || 'Unknown Game',
        url: `https://www.crazygames.com/game/${game.slug}`,
        image: game.cover ? `https://imgs.crazygames.com/${game.cover}?width=300&height=200&crop=true` : '',
        description: `${game.title || game.name} - Play online for free on CrazyGames`,
        category: game.categoryName || 'casual',
        mobile_friendly: game.mobileFriendly || false,
        android_friendly: game.androidFriendly || false,
        ios_friendly: game.iosFriendly || false,
        slug: game.slug || '',
        id: game.id || ''
    }))
};

// 保存为JSON文件
fs.writeFileSync('crazygames_games_final.json', JSON.stringify(gameData, null, 2));
console.log(`\nSaved ${uniqueGames.length} games to crazygames_games_final.json`);

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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            color: white;
        }
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .games-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 25px;
            max-width: 1200px;
            margin: 0 auto;
        }
        .game-card {
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            transition: all 0.3s ease;
            position: relative;
        }
        .game-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.2);
        }
        .game-image {
            width: 100%;
            height: 180px;
            object-fit: cover;
            background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
        }
        .game-info {
            padding: 20px;
        }
        .game-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
            line-height: 1.3;
        }
        .game-description {
            font-size: 14px;
            color: #666;
            margin-bottom: 15px;
            line-height: 1.4;
        }
        .game-badges {
            display: flex;
            gap: 8px;
            margin-bottom: 15px;
            flex-wrap: wrap;
        }
        .badge {
            background: #e3f2fd;
            color: #1976d2;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
        }
        .badge.mobile {
            background: #e8f5e8;
            color: #2e7d32;
        }
        .play-button {
            display: inline-block;
            background: linear-gradient(45deg, #ff6b6b, #ff8e53);
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 25px;
            font-size: 14px;
            font-weight: bold;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
        }
        .play-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
        }
        .stats {
            text-align: center;
            margin-top: 30px;
            color: white;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎮 CrazyGames Casual Games Collection</h1>
        <p>Found ${uniqueGames.length} amazing casual games</p>
        <p>Scraped on: ${new Date().toLocaleString()}</p>
    </div>
    <div class="games-grid">
${gameData.games.map(game => `
        <div class="game-card">
            <img src="${game.image}" alt="${game.name}" class="game-image" onerror="this.src='https://via.placeholder.com/280x180?text=No+Image'">
            <div class="game-info">
                <div class="game-title">${game.name}</div>
                <div class="game-description">${game.description}</div>
                <div class="game-badges">
                    <span class="badge">${game.category}</span>
                    ${game.mobile_friendly ? '<span class="badge mobile">📱 Mobile Friendly</span>' : ''}
                    ${game.android_friendly ? '<span class="badge mobile">🤖 Android</span>' : ''}
                    ${game.ios_friendly ? '<span class="badge mobile">🍎 iOS</span>' : ''}
                </div>
                <a href="${game.url}" target="_blank" class="play-button">▶ Play Now</a>
            </div>
        </div>
`).join('')}
    </div>
    <div class="stats">
        <p>Total games: ${uniqueGames.length} | Mobile friendly: ${gameData.games.filter(g => g.mobile_friendly).length} |
           Android supported: ${gameData.games.filter(g => g.android_friendly).length} |
           iOS supported: ${gameData.games.filter(g => g.ios_friendly).length}</p>
    </div>
</body>
</html>`;

fs.writeFileSync('casual_games_final.html', htmlContent);
console.log('Created HTML page: casual_games_final.html');

console.log('\n=== Summary ===');
console.log(`Total games found: ${uniqueGames.length}`);
console.log('Files created:');
console.log('- crazygames_games_final.json (raw data)');
console.log('- casual_games_final.html (visual page)');