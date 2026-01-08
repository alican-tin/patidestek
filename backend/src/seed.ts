import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';

config();

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    host: process.env.DATABASE_URL ? undefined : process.env.DB_HOST || 'localhost',
    port: process.env.DATABASE_URL ? undefined : parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DATABASE_URL ? undefined : process.env.DB_USER || 'postgres',
    password: process.env.DATABASE_URL ? undefined : process.env.DB_PASS || 'postgres',
    database: process.env.DATABASE_URL ? undefined : process.env.DB_NAME || 'patidestek',
    entities: ['dist/modules/**/*.entity.js'],
    synchronize: false,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  });

  await dataSource.initialize();
  console.log('Database connected for seeding');

  try {
    // ==================== USERS ====================
    const users = [
      { name: 'Admin', email: 'admin@patidestek.local', password: 'Admin123!', role: 'ADMIN' },
      { name: 'Ayşe Yılmaz', email: 'ayse@test.com', password: 'Test123!', role: 'USER' },
      { name: 'Mehmet Kaya', email: 'mehmet@test.com', password: 'Test123!', role: 'USER' },
      { name: 'Zeynep Demir', email: 'zeynep@test.com', password: 'Test123!', role: 'USER' },
      { name: 'Ali Öztürk', email: 'ali@test.com', password: 'Test123!', role: 'USER' },
      { name: 'Fatma Çelik', email: 'fatma@test.com', password: 'Test123!', role: 'USER' },
      { name: 'Emre Aydın', email: 'emre@test.com', password: 'Test123!', role: 'USER' },
    ];

    const userIds: Record<string, number> = {};

    for (const user of users) {
      const existing = await dataSource.query('SELECT id FROM users WHERE email = $1', [user.email]);
      if (existing.length === 0) {
        const passwordHash = await bcrypt.hash(user.password, 10);
        const result = await dataSource.query(
          `INSERT INTO users (name, email, "passwordHash", role, "isBanned", "createdAt")
           VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id`,
          [user.name, user.email, passwordHash, user.role, false]
        );
        userIds[user.email] = result[0].id;
        console.log(`User created: ${user.email}`);
      } else {
        userIds[user.email] = existing[0].id;
      }
    }

    // ==================== CATEGORIES ====================
    const categories = ['Kayıp', 'Buldum', 'Sahiplendirme', 'Yardım'];
    const categoryMap: Record<string, number> = {};

    for (const name of categories) {
      const existing = await dataSource.query('SELECT id FROM categories WHERE name = $1', [name]);
      if (existing.length === 0) {
        const result = await dataSource.query('INSERT INTO categories (name) VALUES ($1) RETURNING id', [name]);
        categoryMap[name] = result[0].id;
        console.log(`Category created: ${name}`);
      } else {
        categoryMap[name] = existing[0].id;
      }
    }

    // ==================== TAGS ====================
    const tags = [
      'Kedi', 'Köpek', 'Kuş', 'Tavşan', 'Diğer',
      'Yavru', 'Yaşlı', 'Yaralı', 'Hasta',
      'Kısır', 'Aşılı', 'Acil', 'Mama', 'Tedavi', 'Geçici Yuva'
    ];
    const tagMap: Record<string, number> = {};

    for (const name of tags) {
      const existing = await dataSource.query('SELECT id FROM tags WHERE name = $1', [name]);
      if (existing.length === 0) {
        const result = await dataSource.query('INSERT INTO tags (name) VALUES ($1) RETURNING id', [name]);
        tagMap[name] = result[0].id;
        console.log(`Tag created: ${name}`);
      } else {
        tagMap[name] = existing[0].id;
      }
    }

    // ==================== POSTS (20+ for 2 pages) ====================
    const samplePosts = [
      {
        title: 'Kayıp Kedi - Kadıköy Moda',
        description: 'Dün akşam saatlerinde Kadıköy Moda civarında kaybolan tekir kedimizi arıyoruz. 2 yaşında, kısırlaştırılmış dişi. Boyunluğu mavi renkli. Gören olursa lütfen iletişime geçsin.',
        imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800',
        provinceCode: '34', provinceName: 'İstanbul', districtCode: '1421', districtName: 'Kadıköy',
        category: 'Kayıp', tags: ['Kedi', 'Kısır', 'Acil'], user: 'ayse@test.com',
      },
      {
        title: 'Sahiplendirmeye Yavru Köpekler',
        description: '2 aylık, aşıları yapılmış 4 adet yavru köpek sahiplendirmek istiyoruz. Melez ancak çok sevgi dolu ve sağlıklılar. İlgilenen ailelere teslim edilecektir.',
        imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
        provinceCode: '06', provinceName: 'Ankara', districtCode: '1231', districtName: 'Çankaya',
        category: 'Sahiplendirme', tags: ['Köpek', 'Yavru', 'Aşılı'], user: 'mehmet@test.com',
      },
      {
        title: 'Yaralı Kuş Bulundu - Beşiktaş',
        description: 'Beşiktaş parkta kanadı kırık bir muhabbet kuşu bulduk. Şu an evimizde bakıyoruz ama kalıcı olarak bakamayız.',
        imageUrl: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800',
        provinceCode: '34', provinceName: 'İstanbul', districtCode: '1183', districtName: 'Beşiktaş',
        category: 'Buldum', tags: ['Kuş', 'Yaralı'], user: 'zeynep@test.com',
      },
      {
        title: 'Acil Mama Desteği - Sokak Kedileri',
        description: 'Mahallemizde beslediğimiz 15 sokak kedisi için mama desteğine ihtiyacımız var. Kış ayları yaklaşıyor ve düzenli mama sağlamakta zorlanıyoruz.',
        imageUrl: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=800',
        provinceCode: '35', provinceName: 'İzmir', districtCode: '1203', districtName: 'Bornova',
        category: 'Yardım', tags: ['Kedi', 'Mama', 'Acil'], user: 'ali@test.com',
      },
      {
        title: 'Kayıp Golden Retriever - Bahçelievler',
        description: 'Bahçelievler Yenibosna mahallesinde kaybolan 5 yaşındaki Golden Retriever cinsi köpeğimizi arıyoruz. Adı Max, çok sevecen.',
        imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800',
        provinceCode: '34', provinceName: 'İstanbul', districtCode: '2005', districtName: 'Bahçelievler',
        category: 'Kayıp', tags: ['Köpek', 'Acil'], user: 'fatma@test.com',
      },
      {
        title: 'Sahiplendirmeye Yetişkin Kedi',
        description: '4 yaşında, kısır ve aşılı dişi van kedisi. Taşınma nedeniyle sahiplendiriyoruz. Çok uysal ve tüy dökümü azdır.',
        imageUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800',
        provinceCode: '06', provinceName: 'Ankara', districtCode: '1922', districtName: 'Etimesgut',
        category: 'Sahiplendirme', tags: ['Kedi', 'Kısır', 'Aşılı'], user: 'emre@test.com',
      },
      {
        title: 'Tedavi Desteği - Kırık Bacaklı Köpek',
        description: 'Sokakta bulduğumuz köpeğin arka bacağı kırık. Ameliyat masrafları için yardım topluyoruz. Veteriner raporu mevcut.',
        imageUrl: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=800',
        provinceCode: '34', provinceName: 'İstanbul', districtCode: '1852', districtName: 'Ümraniye',
        category: 'Yardım', tags: ['Köpek', 'Yaralı', 'Tedavi', 'Acil'], user: 'ayse@test.com',
      },
      {
        title: 'Buldum - Sarı Tekir Kedi Üsküdar',
        description: 'Üsküdar Çengelköy civarında sarı tekir bir kedi bulduk. Çok bakımlı görünüyor, muhtemelen kayıp. Sahibi arıyoruz.',
        imageUrl: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800',
        provinceCode: '34', provinceName: 'İstanbul', districtCode: '1708', districtName: 'Üsküdar',
        category: 'Buldum', tags: ['Kedi'], user: 'mehmet@test.com',
      },
      {
        title: 'Geçici Yuva Aranıyor - 3 Yavru Kedi',
        description: 'Annesi trafik kazasında ölen 3 yavru kedi için geçici yuva arıyoruz. 1 aylık, biberon ile besleniyor.',
        imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800',
        provinceCode: '35', provinceName: 'İzmir', districtCode: '1448', districtName: 'Karşıyaka',
        category: 'Yardım', tags: ['Kedi', 'Yavru', 'Geçici Yuva', 'Acil'], user: 'zeynep@test.com',
      },
      {
        title: 'Kayıp Papağan - Maltepe',
        description: 'Yeşil pakistan papağanımız balkonda uçtu. Adı Coco, konuşabiliyor. Görenler lütfen haber versin.',
        imageUrl: 'https://images.unsplash.com/photo-1544923246-77307dd628b5?w=800',
        provinceCode: '34', provinceName: 'İstanbul', districtCode: '2012', districtName: 'Maltepe',
        category: 'Kayıp', tags: ['Kuş', 'Acil'], user: 'ali@test.com',
      },
      {
        title: 'Sahiplendirme - Tavşan',
        description: 'Holland Lop cinsi tavşanımızı sahiplendiriyoruz. 1 yaşında, kafesi ve tüm malzemeleri ile birlikte verilecektir.',
        imageUrl: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=800',
        provinceCode: '06', provinceName: 'Ankara', districtCode: '1745', districtName: 'Keçiören',
        category: 'Sahiplendirme', tags: ['Tavşan'], user: 'fatma@test.com',
      },
      {
        title: 'Hasta Kedi - Veteriner Yardımı',
        description: 'Sokakta bulduğumuz kedinin gözlerinde enfeksiyon var. Tedavi masrafları için destek arıyoruz.',
        imageUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800',
        provinceCode: '34', provinceName: 'İstanbul', districtCode: '1604', districtName: 'Sarıyer',
        category: 'Yardım', tags: ['Kedi', 'Hasta', 'Tedavi'], user: 'emre@test.com',
      },
      {
        title: 'Kayıp Husky - Ataşehir',
        description: 'Mavi gözlü Sibirya Husky cinsi köpeğimiz kayboldu. 3 yaşında, erkek, çipli. Ödül var.',
        imageUrl: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=800',
        provinceCode: '34', provinceName: 'İstanbul', districtCode: '2049', districtName: 'Ataşehir',
        category: 'Kayıp', tags: ['Köpek', 'Acil'], user: 'ayse@test.com',
      },
      {
        title: 'Mama Bağışı - Sokak Köpekleri',
        description: 'Sultangazi bölgesinde 20+ sokak köpeği besliyoruz. Kışlık mama stoku için yardımlarınızı bekliyoruz.',
        imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800',
        provinceCode: '34', provinceName: 'İstanbul', districtCode: '2055', districtName: 'Sultangazi',
        category: 'Yardım', tags: ['Köpek', 'Mama'], user: 'mehmet@test.com',
      },
      {
        title: 'Sahiplendirme - İki Kardeş Kedi',
        description: 'İkiz kardeş 8 aylık iki kedimizi birlikte sahiplendirmek istiyoruz. Birbirlerinden ayrılmasınlar. Aşılı ve kısır.',
        imageUrl: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=800',
        provinceCode: '35', provinceName: 'İzmir', districtCode: '1819', districtName: 'Konak',
        category: 'Sahiplendirme', tags: ['Kedi', 'Aşılı', 'Kısır'], user: 'zeynep@test.com',
      },
      {
        title: 'Buldum - Yaşlı Köpek Pendik',
        description: 'Pendik sahilde yaşlı bir köpek bulduk. Tasmalı ama telefon yok. Sahibini arıyoruz.',
        imageUrl: 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=800',
        provinceCode: '34', provinceName: 'İstanbul', districtCode: '1835', districtName: 'Pendik',
        category: 'Buldum', tags: ['Köpek', 'Yaşlı'], user: 'ali@test.com',
      },
      {
        title: 'Acil - Yavru Köpek Donmak Üzere',
        description: 'Esenyurt bölgesinde inşaatta yavru köpek bulduk. Çok soğuk, acil geçici yuva lazım. Lütfen yardım edin.',
        imageUrl: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=800',
        provinceCode: '34', provinceName: 'İstanbul', districtCode: '2053', districtName: 'Esenyurt',
        category: 'Yardım', tags: ['Köpek', 'Yavru', 'Geçici Yuva', 'Acil'], user: 'fatma@test.com',
      },
      {
        title: 'Kayıp Siyah Kedi - Bostancı',
        description: 'Tamamen siyah, sarı gözlü kedimiz Bostancı civarında kayboldu. 4 yaşında, erkek, korkak.',
        imageUrl: 'https://images.unsplash.com/photo-1511044568932-338cba0ad803?w=800',
        provinceCode: '34', provinceName: 'İstanbul', districtCode: '1421', districtName: 'Kadıköy',
        category: 'Kayıp', tags: ['Kedi'], user: 'emre@test.com',
      },
      {
        title: 'Sahiplendirme - Yaşlı Köpek',
        description: '10 yaşında melez köpeğimizi sahiplendiriyoruz. Sakin, eğitimli, çocuklarla arası iyi. Yaşlılık dönemini seven bir ailede geçirmesini istiyoruz.',
        imageUrl: 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=800',
        provinceCode: '06', provinceName: 'Ankara', districtCode: '1130', districtName: 'Altındağ',
        category: 'Sahiplendirme', tags: ['Köpek', 'Yaşlı', 'Kısır'], user: 'ayse@test.com',
      },
      {
        title: 'Tedavi Sonrası Kedi - Geçici Yuva',
        description: 'Ameliyat geçiren kedimiz iyileşene kadar geçici yuva arıyoruz. Yaklaşık 2 hafta bakım gerekiyor.',
        imageUrl: 'https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=800',
        provinceCode: '34', provinceName: 'İstanbul', districtCode: '1663', districtName: 'Şişli',
        category: 'Yardım', tags: ['Kedi', 'Tedavi', 'Geçici Yuva'], user: 'mehmet@test.com',
      },
      {
        title: 'Buldum - Muhabbet Kuşu Beylikdüzü',
        description: 'Balkonumuza mavi muhabbet kuşu kondu. Evcil olduğu belli. Sahibi lütfen iletişime geçsin.',
        imageUrl: 'https://images.unsplash.com/photo-1520808663317-647b476a81b9?w=800',
        provinceCode: '34', provinceName: 'İstanbul', districtCode: '2051', districtName: 'Beylikdüzü',
        category: 'Buldum', tags: ['Kuş'], user: 'zeynep@test.com',
      },
    ];

    const postIds: number[] = [];

    for (const post of samplePosts) {
      const existing = await dataSource.query('SELECT id FROM posts WHERE title = $1', [post.title]);
      
      if (existing.length === 0) {
        const daysAgo = Math.floor(Math.random() * 30);
        const result = await dataSource.query(
          `INSERT INTO posts (title, description, "imageUrl", "provinceCode", "provinceName", "districtCode", "districtName", "neighbourhoodName", status, "ownerId", "categoryId", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW() - INTERVAL '${daysAgo} days', NOW() - INTERVAL '${daysAgo} days')
           RETURNING id`,
          [
            post.title, post.description, post.imageUrl,
            post.provinceCode, post.provinceName, post.districtCode, post.districtName, '',
            'APPROVED', userIds[post.user], categoryMap[post.category],
          ]
        );
        
        const postId = result[0].id;
        postIds.push(postId);
        
        for (const tagName of post.tags) {
          await dataSource.query(
            'INSERT INTO post_tags ("postId", "tagId") VALUES ($1, $2)',
            [postId, tagMap[tagName]]
          );
        }
        
        console.log(`Post created: ${post.title}`);
      } else {
        postIds.push(existing[0].id);
      }
    }

    // ==================== COMMENTS ====================
    const commentTexts = [
      'Umarım en kısa sürede bulunur, çok üzüldüm.',
      'Paylaştım, inşallah yardımcı olur.',
      'Çok tatlı görünüyor, keşke alabilsem.',
      'Bu bölgede yaşıyorum, gözüm üzerinde olacak.',
      'Allah kolaylık versin, zor bir süreç.',
      'DM attım, yardımcı olmak istiyorum.',
      'Aşıları tam mı acaba?',
      'Veteriner önerisi: Şu kliniği deneyebilirsiniz.',
      'Biz de geçen ay benzer durum yaşadık, anlıyorum sizi.',
      'Sosyal medyada paylaştım, umarım yayılır.',
      'Ne kadar güzel bir hayvan, sahipleri şanslı.',
      'Konum bilgisi daha detaylı olabilir mi?',
      'Geçici yuva sağlayabilirim, iletişime geçelim.',
      'Mama desteği için yanınızdayız.',
      'Çok üzücü bir durum, bir an önce çözülsün.',
    ];

    const userEmails = Object.keys(userIds);
    
    for (const postId of postIds) {
      const commentCount = Math.floor(Math.random() * 4) + 1; // 1-4 yorum
      
      for (let i = 0; i < commentCount; i++) {
        const randomUser = userEmails[Math.floor(Math.random() * userEmails.length)];
        const randomComment = commentTexts[Math.floor(Math.random() * commentTexts.length)];
        const daysAgo = Math.floor(Math.random() * 10);
        
        const existingComment = await dataSource.query(
          'SELECT id FROM comments WHERE "postId" = $1 AND "userId" = $2 AND content = $3',
          [postId, userIds[randomUser], randomComment]
        );
        
        if (existingComment.length === 0) {
          await dataSource.query(
            `INSERT INTO comments (content, "postId", "userId", "createdAt")
             VALUES ($1, $2, $3, NOW() - INTERVAL '${daysAgo} days')`,
            [randomComment, postId, userIds[randomUser]]
          );
        }
      }
    }
    console.log('Comments added to posts');

    console.log('\n========================================');
    console.log('SEED COMPLETED SUCCESSFULLY!');
    console.log('========================================');
    console.log(`Users: ${users.length}`);
    console.log(`Posts: ${samplePosts.length}`);
    console.log(`Comments: ~${postIds.length * 2} (random)`);
    console.log('----------------------------------------');
    console.log('Test Users:');
    console.log('  admin@patidestek.local / Admin123!');
    console.log('  ayse@test.com / Test123!');
    console.log('  mehmet@test.com / Test123!');
    console.log('========================================\n');

  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

seed().catch((error) => {
  console.error('Seed script failed:', error);
  process.exit(1);
});
