const express = require('express');
const router  = express.Router();
const { verificarToken } = require('../middleware/authMiddleware');
const {
  upload,
  createPublicacion,
  updatePublicacion,
  deletePublicacion,
  donarPublicacion,
  getPublicaciones,
  getPublicacionesFacets,
  getPublicacionById,
  getPublicacionesByUser,
  getAdminStats,
  getHistorialAdmin,
} = require('../controllers/publicacionesController');

// ── Rutas admin protegidas por JWT ────────────────────────────────────────────
router.get('/api/admin/stats',      verificarToken, getAdminStats);
router.get('/api/admin/donaciones', verificarToken, getHistorialAdmin);

// Rutas específicas ANTES de la ruta con parámetro :id
router.get('/api/publicaciones/facets', getPublicacionesFacets);
router.get('/api/publicaciones/usuario/:userId', getPublicacionesByUser);

router.get('/api/publicaciones', getPublicaciones);
router.post('/api/publicaciones', upload.single('foto'), createPublicacion);
router.put('/api/publicaciones/:id/donar', donarPublicacion);
router.patch('/api/publicaciones/:id', updatePublicacion);
router.delete('/api/publicaciones/:id', deletePublicacion);
router.get('/api/publicaciones/:id', getPublicacionById);

module.exports = router;
