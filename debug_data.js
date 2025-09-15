// 调试Next.js数据结构
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('next_data.json', 'utf8'));
const pageProps = data.props.pageProps;

console.log('PageProps keys:', Object.keys(pageProps));

// 检查每个可能的字段
const possibleGameFields = ['games', 'gameList', 'items', 'results', 'data', 'content', 'tiles'];

possibleGameFields.forEach(field => {
  if (pageProps[field]) {
    console.log(`\n=== Field: ${field} ===`);
    console.log('Type:', typeof pageProps[field]);
    console.log('Length:', Array.isArray(pageProps[field]) ? pageProps[field].length : 'N/A');

    if (Array.isArray(pageProps[field]) && pageProps[field].length > 0) {
      console.log('First item keys:', Object.keys(pageProps[field][0]));
      console.log('First item:', JSON.stringify(pageProps[field][0], null, 2));
    }
  }
});

// 查找包含游戏关键词的字段
Object.keys(pageProps).forEach(key => {
  const value = pageProps[key];
  if (key.toLowerCase().includes('game') && Array.isArray(value)) {
    console.log(`\n=== Game-related field: ${key} ===`);
    console.log('Length:', value.length);
    if (value.length > 0) {
      console.log('Sample keys:', Object.keys(value[0]));
    }
  }
});