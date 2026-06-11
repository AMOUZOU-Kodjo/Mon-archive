import pool from '../src/config/database.js';

const result = await pool.query(
  'SELECT id, url, url_thumbnail, nom_fichier FROM medias WHERE url LIKE $1 ORDER BY id DESC LIMIT 5',
  ['/api/files/%']
);

for (const row of result.rows) {
  const thumbName = row.url.replace('/api/files/', '').replace(/\.pdf$/i, '.jpg');
  const newThumb = row.url_thumbnail || `/api/files/thumbnails/${thumbName}`;
  console.log(`ID=${row.id} file=${row.url.slice(0, 40)}... thumb=${row.url_thumbnail ? 'SET' : 'EMPTY'} -> ${newThumb}`);

  if (!row.url_thumbnail) {
    await pool.query('UPDATE medias SET url_thumbnail = $1 WHERE id = $2', [newThumb, row.id]);
    console.log(`  -> Updated thumbnail`);
  }
}

await pool.end();
