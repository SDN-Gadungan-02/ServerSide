import HeadSpeech from '../models/HeadSpeech.js';


const HeadSpeechController = {
    getHeadSpeech: async (req, res) => {
        try {
            const headSpeech = await HeadSpeech.getHeadSpeech();

            if (!headSpeech) {
                return res.json({
                    success: true,
                    data: {
                        id: null,
                        text_speech: "Pidato kepala sekolah belum tersedia",
                        created_at: null,
                    }
                });
            }
            res.json({
                success: true,
                data: headSpeech
            });
        } catch (error) {
            console.error('Error getting head speech:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get head speech',
                error: error.message
            });
        }
    },

    updateHeadSpeech: async (req, res) => {
        try {
            const { text_speech } = req.body;

            if (!text_speech) {
                return res.status(400).json({
                    success: false,
                    message: 'Text speech is required'
                });
            }

            // Cek apakah sudah ada pidato
            let existingHeadSpeech = await HeadSpeech.getHeadSpeech();
            let updatedHeadSpeech;

            if (existingHeadSpeech) {
                updatedHeadSpeech = await HeadSpeech.updateHeadSpeech(existingHeadSpeech.id, {
                    text_speech
                });
            } else {
                updatedHeadSpeech = await HeadSpeech.createHeadSpeech({
                    text_speech,
                });
            }

            res.json({
                success: true,
                data: {
                    ...updatedHeadSpeech,
                    text: updatedHeadSpeech.text_speech // Tambahkan field text untuk kompatibilitas
                }
            });
        } catch (error) {
            console.error('Error updating head speech:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update head speech',
                error: error.message
            });
        }
    }
};

export default HeadSpeechController;