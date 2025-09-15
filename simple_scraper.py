"""
CrazyGames Casual Games Scraper
使用Python和requests库爬取CrazyGames休闲游戏页面
"""

import requests
import json
import re
from bs4 import BeautifulSoup
import time

class CrazyGamesScraper:
    def __init__(self):
        self.base_url = 'https://www.crazygames.com'
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }

    def fetch_page(self, url):
        """获取网页内容"""
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            return response.text
        except requests.RequestException as e:
            print(f"Error fetching {url}: {e}")
            return None

    def parse_games(self, html):
        """解析HTML提取游戏信息"""
        games = []
        soup = BeautifulSoup(html, 'html.parser')

        # 查找所有游戏卡片
        game_cards = soup.find_all('a', href=re.compile(r'/game/[^/]+$'))

        for card in game_cards:
            try:
                # 提取游戏链接
                game_url = card.get('href', '')
                if not game_url.startswith('/game/'):
                    continue

                full_url = self.base_url + game_url

                # 提取游戏名称
                name = card.get('title', '') or card.get('data-title', '')
                if not name:
                    # 尝试从alt属性获取
                    img = card.find('img')
                    if img:
                        name = img.get('alt', '')

                # 提取图片URL
                image = ''
                img = card.find('img')
                if img:
                    image = img.get('src', '') or img.get('data-src', '')
                    if image and not image.startswith('http'):
                        image = self.base_url + image

                # 提取描述
                description = ''
                desc_elem = card.find('p', class_=re.compile(r'description', re.I))
                if desc_elem:
                    description = desc_elem.get_text(strip=True)

                if name and full_url:
                    games.append({
                        'name': name,
                        'url': full_url,
                        'image': image,
                        'description': description or f'Play {name} online for free'
                    })

            except Exception as e:
                print(f"Error parsing game card: {e}")
                continue

        return games

    def save_games_to_file(self, games, filename='crazygames_casual.json'):
        """保存游戏数据到文件"""
        data = {
            'scraped_at': time.strftime('%Y-%m-%d %H:%M:%S'),
            'total_games': len(games),
            'games': games
        }

        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"Saved {len(games)} games to {filename}")

    def scrape_casual_games(self):
        """主爬取函数"""
        print("Scraping CrazyGames Casual Games...")

        url = 'https://www.crazygames.com/c/casual'
        html = self.fetch_page(url)

        if not html:
            print("Failed to fetch page")
            return []

        print("Page fetched successfully, parsing games...")
        games = self.parse_games(html)

        print(f"Found {len(games)} games")

        # 保存到文件
        self.save_games_to_file(games)

        # 显示前10个游戏
        print("\nFirst 10 games:")
        for i, game in enumerate(games[:10], 1):
            print(f"{i}. {game['name']}")
            print(f"   URL: {game['url']}")
            print(f"   Image: {game['image']}")
            print(f"   Description: {game['description']}")
            print()

        return games

    def create_html_page(self, games, filename='casual_games.html'):
        """创建HTML页面展示游戏"""
        html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CrazyGames Casual Games Collection</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }}
        .header {{
            text-align: center;
            margin-bottom: 30px;
        }}
        .games-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }}
        .game-card {{
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }}
        .game-card:hover {{
            transform: translateY(-5px);
        }}
        .game-image {{
            width: 100%;
            height: 150px;
            object-fit: cover;
        }}
        .game-info {{
            padding: 15px;
        }}
        .game-title {{
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #333;
        }}
        .game-description {{
            font-size: 12px;
            color: #666;
            margin-bottom: 10px;
            line-height: 1.4;
        }}
        .play-button {{
            display: inline-block;
            background: #ff6b6b;
            color: white;
            padding: 8px 16px;
            text-decoration: none;
            border-radius: 5px;
            font-size: 12px;
            transition: background 0.3s ease;
        }}
        .play-button:hover {{
            background: #ff5252;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>CrazyGames Casual Games Collection</h1>
        <p>Found {len(games)} casual games</p>
    </div>
    <div class="games-grid">
"""

        for game in games:
            html_content += f"""
        <div class="game-card">
            <img src="{game['image']}" alt="{game['name']}" class="game-image" onerror="this.src='https://via.placeholder.com/250x150?text=No+Image'">
            <div class="game-info">
                <div class="game-title">{game['name']}</div>
                <div class="game-description">{game['description']}</div>
                <a href="{game['url']}" target="_blank" class="play-button">Play Now</a>
            </div>
        </div>
"""

        html_content += """
    </div>
</body>
</html>
"""

        with open(filename, 'w', encoding='utf-8') as f:
            f.write(html_content)

        print(f"Created HTML page: {filename}")

if __name__ == '__main__':
    scraper = CrazyGamesScraper()
    games = scraper.scrape_casual_games()

    if games:
        # 创建HTML页面
        scraper.create_html_page(games)