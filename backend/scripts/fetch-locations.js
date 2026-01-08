/**
 * Bu script GitHub'dan Türkiye adres verilerini çeker ve
 * backend/data/locations klasörüne uygun formatta kaydeder.
 * 
 * Kullanım: node scripts/fetch-locations.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://raw.githubusercontent.com/metinyildirimnet/turkiye-adresler-json/main';

const fetchJson = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        try {
          const buffer = Buffer.concat(chunks);
          const text = buffer.toString('utf8');
          resolve(JSON.parse(text));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
};

// Türkçe karakterleri düzgün capitalize et
function toTitleCase(str) {
  const lowerCase = str.toLowerCase();
  return lowerCase
    .split(' ')
    .map(word => {
      if (word.length === 0) return word;
      // Türkçe i harfi için özel durum
      const firstChar = word.charAt(0);
      const upperFirst = firstChar === 'i' ? 'İ' : firstChar.toUpperCase();
      return upperFirst + word.slice(1);
    })
    .join(' ');
}

async function main() {
  console.log('🚀 Türkiye adres verileri indiriliyor...\n');

  const outputDir = path.join(__dirname, '..', 'data', 'locations');
  
  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // 1. Şehirler (İller)
    console.log('📍 Şehirler indiriliyor...');
    const sehirler = await fetchJson(`${BASE_URL}/sehirler.json`);
    
    const provinces = sehirler.map(s => ({
      code: s.sehir_id.toString().padStart(2, '0'),
      name: toTitleCase(s.sehir_adi)
    }));
    
    fs.writeFileSync(
      path.join(outputDir, 'provinces.json'),
      JSON.stringify(provinces, null, 2),
      'utf8'
    );
    console.log(`   ✅ ${provinces.length} il kaydedildi`);

    // 2. İlçeler
    console.log('📍 İlçeler indiriliyor...');
    const ilceler = await fetchJson(`${BASE_URL}/ilceler.json`);
    
    const districts = ilceler.map(i => ({
      code: i.ilce_id.toString(),
      name: toTitleCase(i.ilce_adi),
      provinceCode: i.sehir_id.toString().padStart(2, '0')
    }));
    
    fs.writeFileSync(
      path.join(outputDir, 'districts.json'),
      JSON.stringify(districts, null, 2),
      'utf8'
    );
    console.log(`   ✅ ${districts.length} ilçe kaydedildi`);

    // 3. Mahalleler (4 parça halinde)
    console.log('📍 Mahalleler indiriliyor (4 parça)...');
    let allMahalleler = [];
    
    for (let i = 1; i <= 4; i++) {
      console.log(`   📥 mahalleler-${i}.json indiriliyor...`);
      const mahalleler = await fetchJson(`${BASE_URL}/mahalleler-${i}.json`);
      allMahalleler = allMahalleler.concat(mahalleler);
    }
    
    const neighbourhoods = allMahalleler.map(m => ({
      name: toTitleCase(m.mahalle_adi),
      districtCode: m.ilce_id.toString(),
      provinceCode: m.sehir_id.toString().padStart(2, '0')
    }));
    
    fs.writeFileSync(
      path.join(outputDir, 'neighbourhoods.json'),
      JSON.stringify(neighbourhoods, null, 2),
      'utf8'
    );
    console.log(`   ✅ ${neighbourhoods.length} mahalle kaydedildi`);

    console.log('\n🎉 Tüm veriler başarıyla indirildi ve kaydedildi!');
    console.log(`   📂 Konum: ${outputDir}`);

  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

main();
