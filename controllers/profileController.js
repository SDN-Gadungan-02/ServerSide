import db from '../config/db.js';

const ProfileController = {
    getAllProfile: async (req, res) => {
        try {
            const [profiles] = await db.query('SELECT * FROM profile_sekolah');
            res.json({
                success: true,
                data: profiles
            });
        } catch (error) {
            console.error('Error fetching profiles:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch profiles'
            });
        }
    },
    createProfile: async (req, res) => {
        try {
            const { nama_guru, pas_foto, NIP, keterangan_guru, author } = req.body;

            // Validation
            if (!nama_guru || !pas_foto || !NIP || !keterangan_guru || !author) {
                return res.status(400).json({
                    success: false,
                    message: 'nama_guru, pas_foto, NIP, and email are required'
                });
            }

            // Insert new profile
            const [result] = await db.query(
                'INSERT INTO profile_sekolah (nama_guru, pas_foto, NIP, keterangan_guru, author) VALUES (?, ?, ?, ?, ?)',
                [nama_guru, pas_foto, NIP, keterangan_guru, author]
            );

            res.json({
                success: true,
                message: 'Profile created successfully',
                data: { id: result.insertId, nama_guru, pas_foto, NIP, keterangan_guru, author }
            });
        } catch (error) {
            console.error('Error creating profile:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create profile'
            });
        }
    },
    updateProfile: async (req, res) => {

        try {
            const { id } = req.params;
            const { nama_guru, pas_foto, NIP, keterangan_guru, author } = req.body;

            // Validation
            if (!nama_guru || !pas_foto || !NIP || !keterangan_guru || !author) {
                return res.status(400).json({
                    success: false,
                    message: 'nama_guru, pas_foto, NIP, and email are required'
                });
            }

            // Update profile
            const [result] = await db.query(
                'UPDATE profile_sekolah SET nama_guru = ?, pas_foto = ?, NIP = ?, keterangan_guru = ?, author = ? WHERE id_profile_sekolah = ?',
                [nama_guru, pas_foto, NIP, keterangan_guru, author, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Profile not found'
                });
            }

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: { id, nama_guru, pas_foto, NIP, keterangan_guru, author }
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update profile'
            });
        }
    },
    deleteProfile: async (req, res) => {
        try {
            const { id } = req.params;

            // Delete profile
            const [result] = await db.query(
                'DELETE FROM profile_sekolah WHERE id_profile_sekolah = ?',
                [id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Profile not found'
                });
            }

            res.json({
                success: true,
                message: 'Profile deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting profile:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete profile'
            });
        }
    }
}

export default ProfileController;