const cloudinary = require('cloudinary').v2;

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Sube un PDF a Cloudinary
 * @param {Buffer} pdfBuffer - Buffer del PDF
 * @param {string} clientName - Nombre del cliente para el nombre del archivo
 * @returns {Promise<Object>} - URL y datos del archivo subido
 */
async function uploadToCloudinary(pdfBuffer, clientName) {
  try {
    // Sanitizar nombre del cliente
    const safeName = clientName
      .trim()
      .replace(/[\\/:*?"<>|]/g, '_')
      .substring(0, 50);
    
    // Crear nombre del archivo con timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const fileName = `DLA_Tax_${safeName}_${timestamp}`;

    console.log(`Subiendo archivo a Cloudinary: ${fileName}`);

    // Convertir Buffer a base64 para Cloudinary
    const base64Data = pdfBuffer.toString('base64');
    const dataURI = `data:application/pdf;base64,${base64Data}`;

    // Subir a Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      public_id: fileName,
      folder: 'dla-tax-documents',
      resource_type: 'raw', // Importante para archivos no-imagen como PDFs
      format: 'pdf'
    });

    console.log(`Archivo subido exitosamente: ${result.secure_url}`);

    return {
      fileName: `${fileName}.pdf`,
      fileId: result.public_id,
      fileUrl: result.secure_url,
      folderUrl: `https://cloudinary.com/console/${process.env.CLOUDINARY_CLOUD_NAME}/resources/raw`,
      cloudinaryData: result
    };
  } catch (error) {
    console.error('Error subiendo a Cloudinary:', error.message);
    throw error;
  }
}

module.exports = { uploadToCloudinary };
