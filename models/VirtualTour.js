import db from '../config/db.js';

class VirtualTour {
  static async create({ nama_ruangan, gambar_panorama, author }) {
    const query = `
      INSERT INTO tb_panorama (nama_ruangan, gambar_panorama, author, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `;
    const values = [nama_ruangan, gambar_panorama, author];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async createHotspot({ id_panorama, pitch, yaw, targetPanoramaId, name, title, deskripsi }) {
    const query = `
      INSERT INTO tb_virtual_tour_360 
        (id_panorama, pitch, yaw, targetPanoramaId, name, title, deskripsi, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `;
    const values = [id_panorama, pitch, yaw, targetPanoramaId, name, title, deskripsi];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async findAll(search = '') {
    let query = `
      SELECT p.*, 
        COALESCE(
          json_agg(
            json_build_object(
              'id', v.id,
              'pitch', v.pitch,
              'yaw', v.yaw,
              'targetPanoramaId', v.targetPanoramaId,
              'name', v.name,
              'title', v.title,
              'deskripsi', v.deskripsi
            )
          ) FILTER (WHERE v.id IS NOT NULL), '[]'
        ) as hotspots
      FROM tb_panorama p
      LEFT JOIN tb_virtual_tour_360 v ON p.id = v.id_panorama
    `;

    if (search) {
      query += ` WHERE p.nama_ruangan ILIKE $1`;
      query += ` GROUP BY p.id`;
      const { rows } = await db.query(query, [`%${search}%`]);
      return rows;
    }

    query += ` GROUP BY p.id`;
    const { rows } = await db.query(query);
    return rows;
  }

  static async findById(id) {
    const query = `
      SELECT p.*, 
        COALESCE(
          json_agg(
            json_build_object(
              'id', v.id,
              'pitch', v.pitch,
              'yaw', v.yaw,
              'targetPanoramaId', v.targetPanoramaId,
              'name', v.name,
              'title', v.title,
              'deskripsi', v.deskripsi
            )
          ) FILTER (WHERE v.id IS NOT NULL), '[]'
        ) as hotspots
      FROM tb_panorama p
      LEFT JOIN tb_virtual_tour_360 v ON p.id = v.id
      WHERE p.id = $1
      GROUP BY p.id
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async update(id, { nama_ruangan, gambar_panorama }) {
    const query = `
      UPDATE panorama
      SET 
        nama_ruangan = $1,
        gambar_panorama = $2,
        updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    const values = [nama_ruangan, gambar_panorama, id];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async updateHotspot(id, { pitch, yaw, targetPanoramaId, name, title, deskripsi }) {
    const query = `
      UPDATE tb_virtual_tour_360
      SET 
        pitch = $1,
        yaw = $2,
        targetPanoramaId = $3,
        name = $4,
        title = $5,
        deskripsi = $6,
        updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `;
    const values = [pitch, yaw, targetPanoramaId, name, title, deskripsi, id];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM tb_panorama WHERE id = $1 RETURNING id';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async deleteHotspot(id) {
    const query = 'DELETE FROM tb_virtual_tour_360 WHERE id = $1 RETURNING id';
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }
}

export default VirtualTour;