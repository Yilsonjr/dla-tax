const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { uploadToCloudinary } = require('./cloudinary');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5500',
    'https://yilsonjr.github.io',
    'https://yilsonjr.github.io/dla-tax'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'Backend DLA Tax activo' });
});

// Endpoint principal para recibir formularios (PDF ya generado desde frontend)
app.post('/api/forms', async (req, res) => {
  try {
    console.log('=== INICIO PROCESAMIENTO FORMULARIO ===');
    const { pdf, data } = req.body;

    if (!pdf) {
      return res.status(400).json({
        success: false,
        message: 'PDF es requerido'
      });
    }

    console.log('PDF recibido, guardando en Cloudinary...');

    // Extraer datos básicos
    const taxpayerName = data?.taxpayer_name || 'Unknown';
    const submissionDate = data?.submission_date || new Date().toISOString().split('T')[0];

    // Convertir base64 a buffer
    const pdfBuffer = Buffer.from(pdf.split(',')[1], 'base64');

    // Subir a Cloudinary
    const cloudinaryResult = await uploadToCloudinary(pdfBuffer, taxpayerName);
    console.log('Archivo guardado en Cloudinary:', cloudinaryResult.fileName);

    console.log('=== FIN PROCESAMIENTO EXITOSO ===');

    res.json({
      success: true,
      message: 'Formulario guardado exitosamente en Cloudinary',
      pdf_url: cloudinaryResult.fileUrl,
      fileName: cloudinaryResult.fileName
    });

  } catch (error) {
    console.error('=== ERROR EN PROCESAMIENTO ===');
    console.error('Error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Error procesando formulario: ' + error.message
    });
  }
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error no capturado:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Backend DLA Tax escuchando en puerto ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Endpoint de formularios: POST http://localhost:${PORT}/api/forms`);
});
