import db from "../config/db";

const VisimisiController = {

    getAllVisimisi: async (req, res) => {
        try {
            const [visimisi] = await db.query('SELECT * FROM visimisi');
            res.json({
                success: true,
                data: visimisi
            });
        } catch (error) {
            console.error('Error fetching visimisi:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch visimisi'
            });
        }
    },

    createVisimisi: async (req, res) => {
        try {
            const { text_vimis, author } = req.body;

            // Validation
            if (!text_vimis || !author) {
                return res.status(400).json({
                    success: false,
                    message: 'text_vimis, and author are required'
                });
            }

            // Insert new visimisi
            const [result] = await db.query(
                'INSERT INTO visimisi (text_vimis, author) VALUES (?, ?, ?)',
                [text_vimis, author]
            );

            res.json({
                success: true,
                message: 'Visi Misi created successfully',
                data: { id: result.insertId, text_vimis, author }
            });
        } catch (error) {
            console.error('Error creating visimisi:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create visimisi'
            });
        }
    },

    updateVisimisi: async (req, res) => {
        try {
            const { id } = req.params;
            const { text_vimis, author } = req.body;

            // Validation
            if (!text_vimis || !author) {
                return res.status(400).json({
                    success: false,
                    message: 'text_vimis, and author are required'
                });
            }

            // Update visimisi
            const [result] = await db.query(
                'UPDATE visimisi SET visi = ?, misi = ?, author = ? WHERE id = ?',
                [text_vimis, author, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Visi Misi not found'
                }
                );
            }
        } catch (error) {
            console.error('Error updating visimisi:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update visimisi'
            });
        }
    }
}

export default VisimisiController;