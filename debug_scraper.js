// 调试版本的爬虫，保存HTML内容供分析
const axios = require('axios');
const fs = require('fs');

async function debugScraper() {
    try {
        console.log('Fetching page content...');

        const response = await axios.get('https://www.crazygames.com/c/casual', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            },
            timeout: 10000
        });

        console.log('Page fetched, saving content...');

        // 保存HTML内容到文件
        fs.writeFileSync('page_content.html', response.data);
        console.log('HTML content saved to page_content.html');

        // 分析页面结构
        console.log('\n=== Analyzing page structure ===');
        console.log('Content length:', response.data.length);

        // 查找所有游戏链接
        const gameLinks = response.data.match(/href="\/game\/[^"]*"/g) || [];
        console.log('Found game links:', gameLinks.length);
        console.log('Sample links:', gameLinks.slice(0, 5));

        // 查找所有图片
        const images = response.data.match(/src="[^"]*\.(jpg|jpeg|png|webp|gif)"/g) || [];
        console.log('Found images:', images.length);
        console.log('Sample images:', images.slice(0, 3));

        // 查找游戏卡片
        const gameCards = response.data.match(/<div[^>]*class="[^"]*game[^"]*"[^>]*>/g) || [];
        console.log('Found game cards:', gameCards.length);

        // 查找数据属性
        const dataProps = response.data.match(/data-[^=]*="[^"]*"/g) || [];
        console.log('Found data properties:', dataProps.length);
        console.log('Sample data props:', dataProps.slice(0, 5));

        // 查找JSON数据
        const jsonMatches = response.data.match(/\{[^}]*"game"[^}]*\}/g) || [];
        console.log('Found JSON game data:', jsonMatches.length);

        // 保存JSON数据
        if (jsonMatches.length > 0) {
            fs.writeFileSync('json_data.txt', jsonMatches.join('\n'));
            console.log('JSON data saved to json_data.txt');
        }

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Headers:', error.response.headers);
        }
    }
}

debugScraper();