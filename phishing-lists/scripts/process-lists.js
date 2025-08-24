// scripts/process-lists.js
const https = require('https');
const fs = require('fs');

async function downloadPhishingList() {
  const url = 'https://raw.githubusercontent.com/mitchellkrogza/Phishing.Database/master/phishing-domains-ACTIVE.txt';
  
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function processLists() {
  try {
    console.log('Downloading phishing list...');
    const rawData = await downloadPhishingList();
    
    const domains = rawData.split('\n')
      .filter(line => line.trim() && !line.startsWith('#'))
      .filter(domain => !/^\d+\.\d+\.\d+\.\d+$/.test(domain)) // IP除去
      .map(domain => domain.toLowerCase().trim())
      .filter((domain, index, array) => array.indexOf(domain) === index); // 重複除去

    const metadata = {
      count: domains.length,
      updated: new Date().toISOString(),
      source: 'Phishing.Database'
    };

    fs.writeFileSync('lists/phishing-domains.json', JSON.stringify(domains));
    fs.writeFileSync('lists/metadata.json', JSON.stringify(metadata, null, 2));
    
    console.log(`✓ Processed ${domains.length} phishing domains`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

processLists();