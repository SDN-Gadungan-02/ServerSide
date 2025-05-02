import VirtualTour from '../models/VirtualTour.js';
import fs from 'fs';
import path from 'path';

const VirtualTourController = {
    async getAllVirtualTours(req, res) {
        try {
            const { search } = req.query;
            const tours = await VirtualTour.findAll(search);
            res.json({
                success: true,
                data: tours
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get virtual tours',
                error: error.message
            });
        }
    },

    async getVirtualTour(req, res) {
        try {
            const tour = await VirtualTour.findById(req.params.id);
            if (!tour) {
                return res.status(404).json({
                    success: false,
                    message: 'Virtual tour not found'
                });
            }
            res.json({
                success: true,
                data: tour
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get virtual tour',
                error: error.message
            });
        }
    },

    async createVirtualTour(req, res) {
        try {
            const { nama_ruangan } = req.body;
            const author = req.user.id;

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Panorama image is required'
                });
            }

            const gambar_panorama = `/uploads/panorama/${req.file.filename}`;
            const panorama = await VirtualTour.create({ nama_ruangan, gambar_panorama, author });

            res.status(201).json({
                success: true,
                data: panorama
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to create virtual tour',
                error: error.message
            });
        }
    },

    async updateVirtualTour(req, res) {
        try {
            const { id } = req.params;
            const { nama_ruangan } = req.body;

            let gambar_panorama;
            if (req.file) {
                gambar_panorama = `/uploads/panorama/${req.file.filename}`;
                // Delete old image if exists
                const oldTour = await VirtualTour.findById(id);
                if (oldTour.gambar_panorama) {
                    const oldPath = path.join(process.cwd(), 'static', oldTour.gambar_panorama);
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }
                }
            }

            const updated = await VirtualTour.update(id, {
                nama_ruangan,
                gambar_panorama: gambar_panorama || undefined
            });

            res.json({
                success: true,
                data: updated
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to update virtual tour',
                error: error.message
            });
        }
    },

    async deleteVirtualTour(req, res) {
        try {
            const { id } = req.params;
            const tour = await VirtualTour.findById(id);

            if (!tour) {
                return res.status(404).json({
                    success: false,
                    message: 'Virtual tour not found'
                });
            }

            // Delete image file
            if (tour.gambar_panorama) {
                const imagePath = path.join(process.cwd(), 'static', tour.gambar_panorama);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }

            await VirtualTour.delete(id);

            res.json({
                success: true,
                message: 'Virtual tour deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to delete virtual tour',
                error: error.message
            });
        }
    },

    async createHotspot(req, res) {
        try {
            const { id } = req.params;
            const { pitch, yaw, targetPanoramaId, name, title, deskripsi } = req.body;

            const hotspot = await VirtualTour.createHotspot({
                id_panorama: id,
                pitch,
                yaw,
                targetPanoramaId: targetPanoramaId,
                name,
                title,
                deskripsi
            });

            res.status(201).json({
                success: true,
                data: hotspot
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: 'Failed to create hotspot',
                error: error.message
            });
        }
    },

    async updateHotspot(req, res) {
        try {
            const { id, hotspotId } = req.params;
            const { pitch, yaw, targetPanoramaId, name, title, deskripsi } = req.body;

            const hotspot = await VirtualTour.updateHotspot(hotspotId, {
                pitch,
                yaw,
                targetPanoramaId,
                name,
                title,
                deskripsi
            });

            res.json({
                success: true,
                data: hotspot
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to update hotspot',
                error: error.message
            });
        }
    },

    async deleteHotspot(req, res) {
        try {
            const { hotspotId } = req.params;
            await VirtualTour.deleteHotspot(hotspotId);

            res.json({
                success: true,
                message: 'Hotspot deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to delete hotspot',
                error: error.message
            });
        }
    }
};

export default VirtualTourController;