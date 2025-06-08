import db from '../config/db.js';

class HeadSpeech {
    static async getHeadSpeech() {
        try {
            const result = await db.query(
                'SELECT * FROM tb_headspeechs ORDER BY created_at DESC LIMIT 1'
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error getting head speech:', error);
            throw error;
        }
    }

    static async updateHeadSpeech(id, { text_speech }) {
        try {
            const result = await db.query(
                `UPDATE tb_headspeechs SET 
            text_speech = $1,
            updated_at = NOW()
            WHERE id = $2 RETURNING *`,
                [text_speech, id]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error updating head speech:', error);
            throw error;
        }
    }

    static async createHeadSpeech({ text_speech }) {
        try {
            const result = await db.query(
                `INSERT INTO tb_headspeechs 
            (text_speech, created_at) 
            VALUES ($1, NOW()) RETURNING *`,
                [text_speech]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error creating head speech:', error);
            throw error;
        }
    }
}

export default HeadSpeech;