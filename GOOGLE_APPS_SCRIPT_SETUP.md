# Configuración de Google Apps Script para Guardar Formularios en Google Drive

## Paso 1: Crear un Google Apps Script

1. Ve a [script.google.com](https://script.google.com)
2. Crea un nuevo proyecto
3. Copia y pega el siguiente código en el editor:

```javascript
// ID de la carpeta en Google Drive donde se guardarán los PDFs
// Reemplaza esto con el ID de tu carpeta de Google Drive
const DRIVE_FOLDER_ID = 'TU_ID_DE_CARPETA_AQUI';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Crear el PDF usando Google Docs
    const pdfBlob = createPDFFromData(data);
    
    // Guardar en Google Drive
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    const fileName = `DLA_Tax_Intake_${data.tp_name}_${new Date().getTime()}.pdf`;
    folder.createFile(pdfBlob).setName(fileName);
    
    // Guardar también los datos en una hoja de cálculo
    saveToSpreadsheet(data);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Formulario guardado exitosamente'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function createPDFFromData(data) {
  const doc = DocumentApp.create(`DLA_Tax_Intake_${data.tp_name}`);
  const body = doc.getBody();
  
  // Agregar contenido al documento
  body.appendParagraph('DLA TAX SERVICES').setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph('TAXPAYER INTAKE FORM 2026').setHeading(DocumentApp.ParagraphHeading.HEADING2);
  
  // INITIAL SETUP
  body.appendParagraph('INITIAL SETUP').setHeading(DocumentApp.ParagraphHeading.HEADING3);
  body.appendParagraph(`Preparation Date: ${data.form_date || 'N/A'}`);
  body.appendParagraph(`Prior Client: ${data.prior_client || 'N/A'}`);
  body.appendParagraph(`Referral: ${data.referral || 'N/A'}`);
  
  // TAXPAYER INFORMATION
  body.appendParagraph('01. TAXPAYER INFORMATION').setHeading(DocumentApp.ParagraphHeading.HEADING3);
  body.appendParagraph(`Full Name: ${data.tp_name || 'N/A'}`);
  body.appendParagraph(`Date of Birth: ${data.tp_dob || 'N/A'}`);
  body.appendParagraph(`SSN / ITIN: ${data.tp_ssn || 'N/A'}`);
  body.appendParagraph(`Phone: ${data.tp_phone || 'N/A'}`);
  body.appendParagraph(`Email: ${data.tp_email || 'N/A'}`);
  body.appendParagraph(`Occupation: ${data.tp_occ || 'N/A'}`);
  body.appendParagraph(`ID Type: ${data.tp_id_type || 'N/A'}`);
  body.appendParagraph(`ID Number: ${data.tp_id_num || 'N/A'}`);
  body.appendParagraph(`ID State: ${data.tp_id_state || 'N/A'}`);
  body.appendParagraph(`ID Issue Date: ${data.tp_id_issue || 'N/A'}`);
  body.appendParagraph(`ID Exp Date: ${data.tp_id_exp || 'N/A'}`);
  body.appendParagraph(`US Citizen: ${data.tp_citizen || 'N/A'}`);
  body.appendParagraph(`Student: ${data.tp_student || 'N/A'}`);
  body.appendParagraph(`Student Institution: ${data.tp_student_inst || 'N/A'}`);
  
  // SPOUSE INFORMATION
  if (data.has_spouse === 'Yes') {
    body.appendParagraph('02. SPOUSE INFORMATION').setHeading(DocumentApp.ParagraphHeading.HEADING3);
    body.appendParagraph(`Spouse Name: ${data.sp_name || 'N/A'}`);
    body.appendParagraph(`Spouse DOB: ${data.sp_dob || 'N/A'}`);
    body.appendParagraph(`Spouse SSN: ${data.sp_ssn || 'N/A'}`);
    body.appendParagraph(`Spouse Occupation: ${data.sp_ocu || 'N/A'}`);
    body.appendParagraph(`Spouse Cell: ${data.sp_cell || 'N/A'}`);
    body.appendParagraph(`Spouse Email: ${data.sp_email || 'N/A'}`);
  }
  
  // ADDRESS
  body.appendParagraph('03. RESIDENTIAL ADDRESS').setHeading(DocumentApp.ParagraphHeading.HEADING3);
  body.appendParagraph(`Street Address: ${data.addr_main || 'N/A'}`);
  body.appendParagraph(`Apt/Suite: ${data.addr_apt || 'N/A'}`);
  body.appendParagraph(`City: ${data.addr_city || 'N/A'}`);
  body.appendParagraph(`State: ${data.addr_state || 'N/A'}`);
  body.appendParagraph(`Zip Code: ${data.addr_zip || 'N/A'}`);
  
  // FILING STATUS & DEPENDENTS
  body.appendParagraph('04. FILING STATUS & DEPENDENTS').setHeading(DocumentApp.ParagraphHeading.HEADING3);
  body.appendParagraph(`Filing Status: ${data.filing_status || 'N/A'}`);
  body.appendParagraph(`Has Dependents: ${data.has_deps || 'N/A'}`);
  
  // DIRECT DEPOSIT
  body.appendParagraph('DIRECT DEPOSIT').setHeading(DocumentApp.ParagraphHeading.HEADING3);
  body.appendParagraph(`Bank Name: ${data.bank_name || 'N/A'}`);
  body.appendParagraph(`Routing Number: ${data.bank_rt || 'N/A'}`);
  body.appendParagraph(`Account Number: ${data.bank_acc || 'N/A'}`);
  body.appendParagraph(`Account Type: ${data.bank_type || 'N/A'}`);
  
  // Convertir a PDF
  const pdfBlob = DocumentApp.getActiveDocument().getBlob().getAs('application/pdf');
  
  // Eliminar el documento temporal
  DriveApp.getFileById(doc.getId()).setTrashed(true);
  
  return pdfBlob;
}

function saveToSpreadsheet(data) {
  try {
    // Obtener o crear la hoja de cálculo
    const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
    let sheet;
    
    if (spreadsheetId) {
      sheet = SpreadsheetApp.openById(spreadsheetId);
    } else {
      // Crear nueva hoja de cálculo si no existe
      sheet = SpreadsheetApp.create('DLA Tax Forms Responses');
      PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', sheet.getId());
      
      // Agregar encabezados
      const headers = [
        'Timestamp',
        'Full Name',
        'Email',
        'Phone',
        'SSN',
        'Address',
        'City',
        'State',
        'Zip',
        'Filing Status',
        'Has Spouse',
        'Has Dependents'
      ];
      sheet.getSheets()[0].appendRow(headers);
    }
    
    // Agregar fila con datos
    const row = [
      new Date(),
      data.tp_name || '',
      data.tp_email || '',
      data.tp_phone || '',
      data.tp_ssn || '',
      data.addr_main || '',
      data.addr_city || '',
      data.addr_state || '',
      data.addr_zip || '',
      data.filing_status || '',
      data.has_spouse || '',
      data.has_deps || ''
    ];
    sheet.getSheets()[0].appendRow(row);
    
  } catch (error) {
    Logger.log('Error saving to spreadsheet: ' + error);
  }
}
```

## Paso 2: Obtener el ID de tu Carpeta de Google Drive

1. Abre Google Drive
2. Crea una carpeta llamada "DLA Tax Forms" (o el nombre que prefieras)
3. Abre la carpeta
4. En la URL, copia el ID (la parte después de `/folders/`)
   - Ejemplo: `https://drive.google.com/drive/folders/1ABC123XYZ...` → ID es `1ABC123XYZ...`

## Paso 3: Configurar el Google Apps Script

1. En el editor de Google Apps Script, reemplaza `TU_ID_DE_CARPETA_AQUI` con el ID de tu carpeta
2. Guarda el proyecto
3. Haz clic en "Deploy" → "New deployment"
4. Selecciona "Type" → "Web app"
5. Configura:
   - Execute as: Tu cuenta de Google
   - Who has access: Anyone
6. Copia la URL de deployment (se verá como: `https://script.google.com/macros/d/...`)

## Paso 4: Actualizar el formulario HTML

En el archivo `index.html`, busca esta línea:
```html
<input type="hidden" id="google_script_url" value="TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI">
```

Y reemplázala con la URL que copiaste en el Paso 3:
```html
<input type="hidden" id="google_script_url" value="https://script.google.com/macros/d/TU_ID_AQUI/usercontent">
```

## Paso 5: Verificar permisos

Cuando ejecutes el script por primera vez, Google te pedirá permisos para:
- Acceder a Google Drive
- Crear documentos
- Crear hojas de cálculo

Acepta todos los permisos.

## Resultado Final

Cuando un cliente complete y envíe el formulario:
1. Se generará un PDF con todos los datos
2. Se guardará automáticamente en tu carpeta de Google Drive
3. Los datos se registrarán en una hoja de cálculo de Google Sheets
4. El cliente verá un mensaje de éxito

## Notas Importantes

- Los PDFs se guardarán con el nombre del cliente y un timestamp
- Los datos también se guardarán en una hoja de cálculo para fácil consulta
- Asegúrate de que la carpeta de Google Drive tenga permisos adecuados
- El script se ejecuta en los servidores de Google, no en el navegador del cliente
