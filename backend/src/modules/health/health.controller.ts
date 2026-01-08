import { Controller, Get, Post, Query } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Controller('health')
export class HealthController {
  constructor(private dataSource: DataSource) {}

  @Get()
  check() {
    return { status: 'ok' };
  }

  @Post('seed')
  async seed(@Query('secret') secret: string) {
    // Simple secret protection
    if (secret !== 'patidestek2026') {
      return { error: 'Unauthorized' };
    }

    const results: string[] = [];

    try {
      // ==================== USERS ====================
      const users = [
        { name: 'Admin', email: 'admin@patidestek.local', password: 'Admin123!', role: 'ADMIN' },
        { name: 'Ayse Yilmaz', email: 'ayse@test.com', password: 'Test123!', role: 'USER' },
        { name: 'Mehmet Kaya', email: 'mehmet@test.com', password: 'Test123!', role: 'USER' },
      ];

      const userIds: Record<string, number> = {};
      for (const user of users) {
        const existing = await this.dataSource.query('SELECT id FROM users WHERE email = $1', [user.email]);
        if (existing.length === 0) {
          const passwordHash = await bcrypt.hash(user.password, 10);
          const result = await this.dataSource.query(
            `INSERT INTO users (name, email, "passwordHash", role, "isBanned", "createdAt")
             VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id`,
            [user.name, user.email, passwordHash, user.role, false]
          );
          userIds[user.email] = result[0].id;
          results.push(`User created: ${user.email}`);
        } else {
          userIds[user.email] = existing[0].id;
          results.push(`User exists: ${user.email}`);
        }
      }

      // ==================== CATEGORIES ====================
      const categories = ['Kayıp', 'Buldum', 'Sahiplendirme', 'Yardım'];
      const categoryIds: Record<string, number> = {};
      for (const name of categories) {
        const existing = await this.dataSource.query('SELECT id FROM categories WHERE name = $1', [name]);
        if (existing.length === 0) {
          const result = await this.dataSource.query('INSERT INTO categories (name) VALUES ($1) RETURNING id', [name]);
          categoryIds[name] = result[0].id;
          results.push(`Category created: ${name}`);
        } else {
          categoryIds[name] = existing[0].id;
          results.push(`Category exists: ${name}`);
        }
      }

      // ==================== TAGS ====================
      const tags = [
        'Kedi', 'Köpek', 'Kuş', 'Tavşan', 'Diğer',
        'Yavru', 'Yaşlı', 'Yaralı', 'Hasta',
        'Kısır', 'Aşılı', 'Acil', 'Mama', 'Tedavi', 'Geçici Yuva'
      ];
      const tagIds: Record<string, number> = {};
      for (const name of tags) {
        const existing = await this.dataSource.query('SELECT id FROM tags WHERE name = $1', [name]);
        if (existing.length === 0) {
          const result = await this.dataSource.query('INSERT INTO tags (name) VALUES ($1) RETURNING id', [name]);
          tagIds[name] = result[0].id;
          results.push(`Tag created: ${name}`);
        } else {
          tagIds[name] = existing[0].id;
          results.push(`Tag exists: ${name}`);
        }
      }

      // ==================== POSTS (15 posts for 2 pages) ====================
      const posts = [
        { title: 'Kayip Kedi - Kadikoy', desc: 'Tekir kedim kayboldu, yardim edin', type: 'LOST', cat: 'Kayıp', tag: 'Kedi', user: 'ayse@test.com' },
        { title: 'Sahiplendirmelik Yavru Kopekler', desc: '2 aylik sevimli yavrular', type: 'ADOPTION', cat: 'Sahiplendirme', tag: 'Köpek', user: 'mehmet@test.com' },
        { title: 'Yarali Kus Buldum', desc: 'Bahcede yarali kus buldum', type: 'FOUND', cat: 'Buldum', tag: 'Kuş', user: 'ayse@test.com' },
        { title: 'Mama Yardimi Gerekiyor', desc: 'Sokak kedileri icin mama lazim', type: 'ADOPTION', cat: 'Yardım', tag: 'Mama', user: 'mehmet@test.com' },
        { title: 'Kayip Kopek - Besiktas', desc: 'Golden Retriever kayip', type: 'LOST', cat: 'Kayıp', tag: 'Köpek', user: 'ayse@test.com' },
        { title: 'Yavru Kediler Sahiplendiriliyor', desc: '3 aylik 4 yavru kedi', type: 'ADOPTION', cat: 'Sahiplendirme', tag: 'Kedi', user: 'mehmet@test.com' },
        { title: 'Tedavi Yardimi - Yarali Kopek', desc: 'Ameliyat masrafi icin destek', type: 'ADOPTION', cat: 'Yardım', tag: 'Tedavi', user: 'ayse@test.com' },
        { title: 'Buldum - Tasli Kedi', desc: 'Sisli civarinda tasli kedi buldum', type: 'FOUND', cat: 'Buldum', tag: 'Kedi', user: 'mehmet@test.com' },
        { title: 'Gecici Yuva Araniyor', desc: 'Yavru kopek icin gecici yuva', type: 'ADOPTION', cat: 'Yardım', tag: 'Geçici Yuva', user: 'ayse@test.com' },
        { title: 'Kayip Tavsan - Uskudar', desc: 'Beyaz tavsan kayboldu', type: 'LOST', cat: 'Kayıp', tag: 'Tavşan', user: 'mehmet@test.com' },
        { title: 'Asili Kedi Sahiplendirme', desc: 'Asilari tam, kisir disi kedi', type: 'ADOPTION', cat: 'Sahiplendirme', tag: 'Kedi', user: 'ayse@test.com' },
        { title: 'Acil Tedavi - Hasta Yavru', desc: 'Yavru kedi cok hasta, yardim', type: 'ADOPTION', cat: 'Yardım', tag: 'Acil', user: 'mehmet@test.com' },
        { title: 'Buldum - Yaralı Kopek', desc: 'Yarali kopek buldum, sahip araniyor', type: 'FOUND', cat: 'Buldum', tag: 'Köpek', user: 'ayse@test.com' },
        { title: 'Yasli Kedi Sahiplendirme', desc: '10 yasinda sakin kedi', type: 'ADOPTION', cat: 'Sahiplendirme', tag: 'Yaşlı', user: 'mehmet@test.com' },
        { title: 'Kayip Papagan', desc: 'Yesil papagan uctu gitti', type: 'LOST', cat: 'Kayıp', tag: 'Kuş', user: 'ayse@test.com' },
      ];

      let postCount = 0;
      for (const post of posts) {
        const userId = userIds[post.user];
        const categoryId = categoryIds[post.cat];
        const tagId = tagIds[post.tag];
        
        if (userId && categoryId) {
          const existing = await this.dataSource.query('SELECT id FROM posts WHERE title = $1', [post.title]);
          if (existing.length === 0) {
            const result = await this.dataSource.query(
              `INSERT INTO posts (title, description, status, "categoryId", "userId", "provinceCode", "provinceName", "districtCode", "districtName", "createdAt", "updatedAt")
               VALUES ($1, $2, 'APPROVED', $3, $4, '34', 'İstanbul', '1421', 'Kadıköy', NOW(), NOW()) RETURNING id`,
              [post.title, post.desc, categoryId, userId]
            );
            const postId = result[0].id;
            
            // Add tag to post
            if (tagId) {
              await this.dataSource.query(
                `INSERT INTO post_tags ("postsId", "tagsId") VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                [postId, tagId]
              );
            }
            postCount++;
          }
        }
      }
      results.push(`Posts created: ${postCount}`);

      return { success: true, results };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
