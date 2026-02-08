const { google } = require('googleapis');
const { Buffer } = require('buffer');

let driveClient = null;

async function initializeDrive() {
  if (driveClient) return driveClient;

  try {
    // Obtener credenciales desde variable de entorno
    let credentials;
    
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      // Si está en variable de entorno (Cloud Run)
      credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Si es una ruta a archivo (desarrollo local)
      const fs = require('fs');
      credentials = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'));
    } else {
      throw new Error('No se encontraron credenciales de Google. Configura GOOGLE_APPLICATION_CREDENTIALS_JSON o GOOGLE_APPLICATION_CREDENTIALS');
    }

    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/drive']
    });

    driveClient = google.drive({ version: 'v3', auth });
    console.log('Google Drive API inicializado correctamente');
    return driveClient;
  } catch (error) {
    console.error('Error inicializando Google Drive:', error.message);
    throw error;
  }
}

async function getOrCreateClientFolder(parentFolderId, clientName) {
  const drive = await initializeDrive();
  
  // Sanitizar nombre de carpeta
  const safeName = clientName
    .trim()
    .replace(/[\\/:*?"<>|]/g, '_')
    .substring(0, 100);

  try {
    // Buscar si la carpeta ya existe
    const response = await drive.files.list({
      q: `'${parentFolderId}' in parents and name='${safeName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      spaces: 'drive',
      fields: 'files(id, name, webViewLink)',
      pageSize: 1
    });

    if (response.data.files && response.data.files.length > 0) {
      console.log(`Carpeta del cliente encontrada: ${safeName}`);
      return response.data.files[0];
    }

    // Si no existe, crearla
    console.log(`Creando carpeta del cliente: ${safeName}`);
    const createResponse = await drive.files.create({
      resource: {
        name: safeName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId]
      },
      fields: 'id, name, webViewLink'
    });

    console.log(`Carpeta creada: ${createResponse.data.name}`);
    return createResponse.data;
  } catch (error) {
    console.error('Error en getOrCreateClientFolder:', error.message);
    throw error;
  }
}

async function uploadToDrive(pdfBuffer, clientName) {
  const drive = await initializeDrive();
  const parentFolderId = process.env.DRIVE_FOLDER_ID;

  if (!parentFolderId) {
    throw new Error('DRIVE_FOLDER_ID no está configurado');
  }

  try {
    // Obtener o crear carpeta del cliente
    const clientFolder = await getOrCreateClientFolder(parentFolderId, clientName);
    
    // Crear nombre del archivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const fileName = `DLA_Tax_${clientName}_${timestamp}.pdf`;

    console.log(`Subiendo archivo: ${fileName} a carpeta: ${clientFolder.name}`);

    // Subir archivo a la carpeta del cliente
    const uploadResponse = await drive.files.create({
      resource: {
        name: fileName,
        mimeType: 'application/pdf',
        parents: [clientFolder.id]
      },
      media: {
        mimeType: 'application/pdf',
        body: pdfBuffer
      },
      fields: 'id, name, webViewLink, webContentLink'
    });

    console.log(`Archivo subido exitosamente: ${uploadResponse.data.name}`);

    return {
      fileName: uploadResponse.data.name,
      fileId: uploadResponse.data.id,
      fileUrl: uploadResponse.data.webViewLink,
      folderUrl: clientFolder.webViewLink
    };
  } catch (error) {
    console.error('Error subiendo a Google Drive:', error.message);
    throw error;
  }
}

module.exports = { uploadToDrive, initializeDrive };
