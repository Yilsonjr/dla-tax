const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { generatePDF } = require('./pdf');
const { uploadToDrive } = require('./drive');
const { validateFormData } = require('./validators');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5500',
    'https://yilsondev.github.io',
    'https://yilsondev.github.io/dla-tax'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'Backend DLA Tax activo' });
});

// Endpoint principal para recibir formularios
app.post('/api/forms', async (req, res) => {
  try {
    console.log('=== INICIO PROCESAMIENTO FORMULARIO ===');
    const formData = req.body;

    // Validar datos
    const validation = validateFormData(formData);
    if (!validation.valid) {
      console.error('Validación fallida:', validation.errors);
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos: ' + validation.errors.join(', ')
      });
    }

    console.log('Datos validados correctamente');
    console.log('Cliente:', formData.tp_name);

    // Generar PDF
    console.log('Generando PDF...');
    const pdfBuffer = await generatePDF(formData);
    console.log('PDF generado exitosamente');

    // Subir a Google Drive
    console.log('Subiendo a Google Drive...');
    const driveResult = await uploadToDrive(pdfBuffer, formData.tp_name);
    console.log('Archivo guardado en Drive:', driveResult.fileName);

    console.log('=== FIN PROCESAMIENTO EXITOSO ===');

    res.json({
      success: true,
      message: 'Formulario guardado exitosamente en Google Drive',
      fileName: driveResult.fileName,
      fileUrl: driveResult.fileUrl,
      fileId: driveResult.fileId,
      folderUrl: driveResult.folderUrl
    });

  } catch (error) {
    console.error('=== ERROR EN PROCESAMIENTO ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);

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
