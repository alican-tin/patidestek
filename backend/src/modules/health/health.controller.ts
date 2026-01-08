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
        { name: 'Test User', email: 'test@test.com', password: 'Test123!', role: 'USER' },
      ];

      for (const user of users) {
        const existing = await this.dataSource.query('SELECT id FROM users WHERE email = $1', [user.email]);
        if (existing.length === 0) {
          const passwordHash = await bcrypt.hash(user.password, 10);
          await this.dataSource.query(
            `INSERT INTO users (name, email, "passwordHash", role, "isBanned", "createdAt")
             VALUES ($1, $2, $3, $4, $5, NOW())`,
            [user.name, user.email, passwordHash, user.role, false]
          );
          results.push(`User created: ${user.email}`);
        } else {
          results.push(`User exists: ${user.email}`);
        }
      }

      // ==================== CATEGORIES ====================
      const categories = ['Kayıp', 'Buldum', 'Sahiplendirme', 'Yardım'];
      for (const name of categories) {
        const existing = await this.dataSource.query('SELECT id FROM categories WHERE name = $1', [name]);
        if (existing.length === 0) {
          await this.dataSource.query('INSERT INTO categories (name) VALUES ($1)', [name]);
          results.push(`Category created: ${name}`);
        } else {
          results.push(`Category exists: ${name}`);
        }
      }

      // ==================== TAGS ====================
      const tags = [
        'Kedi', 'Köpek', 'Kuş', 'Tavşan', 'Diğer',
        'Yavru', 'Yaşlı', 'Yaralı', 'Hasta',
        'Kısır', 'Aşılı', 'Acil', 'Mama', 'Tedavi', 'Geçici Yuva'
      ];
      for (const name of tags) {
        const existing = await this.dataSource.query('SELECT id FROM tags WHERE name = $1', [name]);
        if (existing.length === 0) {
          await this.dataSource.query('INSERT INTO tags (name) VALUES ($1)', [name]);
          results.push(`Tag created: ${name}`);
        } else {
          results.push(`Tag exists: ${name}`);
        }
      }

      return { success: true, results };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
