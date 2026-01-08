const { DataSource } = require('typeorm');
require('dotenv').config();

async function fixFirstPost() {
  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });
  
  await ds.initialize();
  
  // Get first post id
  const post = await ds.query("SELECT id FROM posts WHERE title LIKE 'Kayıp Kedi%'");
  if (post.length > 0) {
    const postId = post[0].id;
    console.log('Found post ID:', postId);
    
    // Check if tags already exist
    const existingTags = await ds.query('SELECT * FROM post_tags WHERE "postId" = $1', [postId]);
    console.log('Existing tags:', existingTags.length);
    
    if (existingTags.length === 0) {
      // Add tags (Kedi=4, Acil=1)
      await ds.query('INSERT INTO post_tags ("postId", "tagId") VALUES ($1, $2)', [postId, 4]);
      await ds.query('INSERT INTO post_tags ("postId", "tagId") VALUES ($1, $2)', [postId, 1]);
      console.log('Tags added to first post');
    } else {
      console.log('Tags already exist');
    }
  }
  
  await ds.destroy();
}

fixFirstPost();
