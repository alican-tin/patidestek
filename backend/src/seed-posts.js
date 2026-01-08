const { DataSource } = require('typeorm');
require('dotenv').config();

async function seedPosts() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'patidestek',
  });

  await dataSource.initialize();
  console.log('Connected to database');

  try {
    const adminEmail = 'admin@patidestek.local';
    const adminUser = await dataSource.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    
    if (adminUser.length === 0) {
      console.log('Admin user not found. Please run npm run seed first.');
      return;
    }
    
    const adminId = adminUser[0].id;
    console.log('Admin ID:', adminId);

    const categoryRows = await dataSource.query('SELECT id, name FROM categories');
    const categoryMap = {};
    categoryRows.forEach(c => { categoryMap[c.name] = c.id; });
    console.log('Categories:', Object.keys(categoryMap));

    const tagRows = await dataSource.query('SELECT id, name FROM tags');
    const tagMap = {};
    tagRows.forEach(t => { tagMap[t.name] = t.id; });
    console.log('Tags:', Object.keys(tagMap));

    const posts = [
      { 
        title: 'Kayıp Kedi - Kadıköy', 
        desc: 'Dün akşam saatlerinde Kadıköy Moda civarında kaybolan tekir kedimizi arıyoruz. 2 yaşında, kısırlaştırılmış dişi. Boyunluğu mavi renkli.', 
        img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800', 
        pCode: '34', pName: 'İstanbul', dCode: '34019', dName: 'Kadıköy', nName: 'Moda Mahallesi',
        cat: 'Kayıp', tags: ['Kedi', 'Acil'] 
      },
      { 
        title: 'Sahiplendirmeye Yavru Köpekler', 
        desc: '2 aylık, aşıları yapılmış 4 adet yavru köpek sahiplendirmek istiyoruz. Melez ancak çok sevgi dolu ve sağlıklılar.', 
        img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800', 
        pCode: '06', pName: 'Ankara', dCode: '06008', dName: 'Çankaya', nName: 'Kızılay Mahallesi',
        cat: 'Sahiplendirme', tags: ['Köpek', 'Yavru'] 
      },
      { 
        title: 'Yaralı Kuş Bulundu - Beşiktaş', 
        desc: 'Beşiktaş parkta kanadı kırık bir muhabbet kuşu bulduk. Şu an evimizde bakıyoruz ama kalıcı olarak bakamayız.', 
        img: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800', 
        pCode: '34', pName: 'İstanbul', dCode: '34004', dName: 'Beşiktaş', nName: 'Abbasağa Mahallesi',
        cat: 'Bulundu', tags: ['Kuş', 'Yaralı'] 
      },
      { 
        title: 'Acil Mama Desteği - Sokak Kedileri', 
        desc: 'Mahallemizde beslediğimiz 15 sokak kedisi için mama desteğine ihtiyacımız var. Kış ayları yaklaşıyor ve düzenli mama sağlamakta zorlanıyoruz.', 
        img: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=800', 
        pCode: '35', pName: 'İzmir', dCode: '35004', dName: 'Bornova', nName: 'Erzene Mahallesi',
        cat: 'Acil Yardım', tags: ['Kedi', 'Mama', 'Acil'] 
      }
    ];

    for (const p of posts) {
      const existing = await dataSource.query('SELECT id FROM posts WHERE title = $1', [p.title]);
      
      if (existing.length === 0) {
        const result = await dataSource.query(
          `INSERT INTO posts (title, description, "imageUrl", "provinceCode", "provinceName", "districtCode", "districtName", "neighbourhoodName", status, "ownerId", "categoryId", "createdAt", "updatedAt") 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()) RETURNING id`,
          [p.title, p.desc, p.img, p.pCode, p.pName, p.dCode, p.dName, p.nName, 'APPROVED', adminId, categoryMap[p.cat]]
        );
        
        const postId = result[0].id;
        
        for (const tagName of p.tags) {
          if (tagMap[tagName]) {
            await dataSource.query(
              'INSERT INTO post_tags ("postId", "tagId") VALUES ($1, $2)',
              [postId, tagMap[tagName]]
            );
          }
        }
        
        console.log('Created post:', p.title);
      } else {
        console.log('Post already exists:', p.title);
      }
    }

    console.log('Sample posts seeding completed!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await dataSource.destroy();
  }
}

seedPosts();
