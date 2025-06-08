import Visimisi from '../models/Visimisi.js';

const VisimisiController = {
    getVisiMisi: async (req, res) => {
        try {
            const visimisi = await Visimisi.getVimis();

            if (!visimisi) {
                return res.json({
                    success: true,
                    data: {
                        id: null,
                        text_visi: "Visi sekolah belum tersedia",
                        text_misi: [],
                        text_tujuan: [],
                        author: null,
                        created_at: null
                    }
                });
            }

            // Clean and format the data
            const cleanMisi = () => {
                if (!visimisi.text_misi) return [];
                if (Array.isArray(visimisi.text_misi)) return visimisi.text_misi;
                const misi = visimisi.text_misi.split('|').filter(item => item && !item.includes("belum tersedia"));
                return misi.length > 0 ? misi : ["Misi sekolah belum tersedia"];
            };

            const cleanTujuan = () => {
                if (!visimisi.text_tujuan) return [];
                if (Array.isArray(visimisi.text_tujuan)) return visimisi.text_tujuan;
                const tujuan = visimisi.text_tujuan.split('|').filter(item => item && !item.includes("belum tersedia") && !item.includes("sasasa"));
                return tujuan.length > 0 ? tujuan : ["Tujuan sekolah belum tersedia"];
            };

            res.json({
                success: true,
                data: {
                    ...visimisi,
                    text_visi: visimisi.text_visi || "Visi sekolah belum tersedia",
                    text_misi: cleanMisi(),
                    text_tujuan: cleanTujuan()
                }
            });
        } catch (error) {
            console.error('Error getting vision and mission:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get vision and mission',
                error: error.message
            });
        }
    },

    updateVisiMisi: async (req, res) => {
        try {
            const { text_visi, text_misi, text_tujuan } = req.body;
            const author = req.user.username;

            if (!text_visi || !text_misi || !text_tujuan) {
                return res.status(400).json({
                    success: false,
                    message: 'Vision, mission and goals text are required'
                });
            }

            let existing = await Visimisi.getVimis();
            let updated;

            if (existing) {
                updated = await Visimisi.updateVimis(existing.id, {
                    text_visi,
                    text_misi: Array.isArray(text_misi) ? text_misi.join('|') : text_misi,
                    text_tujuan: Array.isArray(text_tujuan) ? text_tujuan.join('|') : text_tujuan,
                    author
                });
            } else {
                updated = await Visimisi.createVimis({
                    text_visi,
                    text_misi: Array.isArray(text_misi) ? text_misi.join('|') : text_misi,
                    text_tujuan: Array.isArray(text_tujuan) ? text_tujuan.join('|') : text_tujuan,
                    author
                });
            }

            res.json({
                success: true,
                data: {
                    ...updated,
                    text_misi: updated.text_misi.split('|'),
                    text_tujuan: updated.text_tujuan.split('|')
                }
            });
        } catch (error) {
            console.error('Error updating vision and mission:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update vision and mission',
                error: error.message
            });
        }
    }
};

export default VisimisiController;