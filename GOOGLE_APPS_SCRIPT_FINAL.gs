const DRIVE_FOLDER_ID = '1niuJ-p1SjgtwShG6Sy2L0LosyRrJ2OjK';
const SPREADSHEET_ID = '1qptLtHmuQr6AviPGEXdqGGPuCrDpekq8UA6hrF45ijc';

// Función principal que recibe los datos del formulario
function doPost(e) {
  try {
    Logger.log('=== INICIO DE PROCESAMIENTO ===');
    Logger.log('Datos recibidos: ' + e.postData.contents.substring(0, 100));
    
    const data = JSON.parse(e.postData.contents);
    Logger.log('Datos parseados correctamente');
    Logger.log('Nombre del cliente: ' + data.tp_name);
    
    // Crear PDF con los datos
    Logger.log('Creando PDF...');
    const pdfBlob = createPDFFromData(data);
    Logger.log('PDF creado exitosamente');
    
    // Guardar en Google Drive
    Logger.log('Guardando en Google Drive...');
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    const fileName = `DLA_Tax_${data.tp_name || 'Unknown'}_${new Date().getTime()}.pdf`;
    const file = folder.createFile(pdfBlob);
    file.setName(fileName);
    Logger.log('Archivo guardado en Drive: ' + fileName);
    
    // Guardar en hoja de cálculo
    Logger.log('Guardando en hoja de cálculo...');
    saveToSpreadsheet(data);
    Logger.log('Datos guardados en hoja de cálculo');
    
    Logger.log('=== FIN DE PROCESAMIENTO EXITOSO ===');
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Formulario guardado exitosamente en Google Drive',
      fileName: fileName
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('=== ERROR EN PROCESAMIENTO ===');
    Logger.log('Error: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Error: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Crear PDF con formato profesional usando Google Docs
function createPDFFromData(data) {
  try {
    const doc = DocumentApp.create(`DLA_Tax_${data.tp_name || 'Form'}_${new Date().getTime()}`);
    const body = doc.getBody();
    
    // Limpiar párrafo por defecto
    body.clear();
    
    // Estilos
    const titleStyle = {};
    titleStyle[DocumentApp.Attribute.FONT_SIZE] = 18;
    titleStyle[DocumentApp.Attribute.BOLD] = true;
    titleStyle[DocumentApp.Attribute.FOREGROUND_COLOR] = '#197547';
    
    const sectionStyle = {};
    sectionStyle[DocumentApp.Attribute.FONT_SIZE] = 11;
    sectionStyle[DocumentApp.Attribute.BOLD] = true;
    sectionStyle[DocumentApp.Attribute.FOREGROUND_COLOR] = '#1a1a1a';
    
    const fieldStyle = {};
    fieldStyle[DocumentApp.Attribute.FONT_SIZE] = 9;
    
    // Título
    const title = body.appendParagraph('DLA TAX SERVICES');
    title.setAttributes(titleStyle);
    title.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    title.setSpacingAfter(2);
    
    const subtitle = body.appendParagraph('TAXPAYER INTAKE FORM 2026');
    subtitle.setAttributes(sectionStyle);
    subtitle.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    subtitle.setSpacingAfter(8);
    
    // Línea separadora
    addSeparatorLine(body);
    
    // INITIAL SETUP
    addSectionHeader(body, 'INITIAL SETUP', sectionStyle);
    addTwoColumnFields(body, 
      ['Preparation Date', data.form_date],
      ['Prior Client', data.prior_client],
      fieldStyle);
    addFormField(body, 'Referral', data.referral, fieldStyle);
    addSeparatorLine(body);
    
    // TAXPAYER INFORMATION
    addSectionHeader(body, '01. TAXPAYER INFORMATION', sectionStyle);
    addTwoColumnFields(body,
      ['Full Name', data.tp_name],
      ['Date of Birth', data.tp_dob],
      fieldStyle);
    addTwoColumnFields(body,
      ['SSN / ITIN', data.tp_ssn],
      ['Phone', data.tp_phone],
      fieldStyle);
    addTwoColumnFields(body,
      ['Email', data.tp_email],
      ['Occupation', data.tp_occ],
      fieldStyle);
    addTwoColumnFields(body,
      ['ID Type', data.tp_id_type],
      ['ID Number', data.tp_id_num],
      fieldStyle);
    addTwoColumnFields(body,
      ['ID State', data.tp_id_state],
      ['ID Issue Date', data.tp_id_issue],
      fieldStyle);
    addTwoColumnFields(body,
      ['ID Exp Date', data.tp_id_exp],
      ['US Citizen', data.tp_citizen],
      fieldStyle);
    addTwoColumnFields(body,
      ['Student', data.tp_student],
      ['Student Institution', data.tp_student_inst],
      fieldStyle);
    addSeparatorLine(body);
    
    // SPOUSE INFORMATION
    if (data.has_spouse === 'Yes') {
      addSectionHeader(body, '02. SPOUSE INFORMATION', sectionStyle);
      addTwoColumnFields(body,
        ['Spouse Name', data.sp_name],
        ['Spouse DOB', data.sp_dob],
        fieldStyle);
      addTwoColumnFields(body,
        ['Spouse SSN', data.sp_ssn],
        ['Spouse Occupation', data.sp_ocu],
        fieldStyle);
      addTwoColumnFields(body,
        ['Spouse Cell', data.sp_cell],
        ['Spouse Email', data.sp_email],
        fieldStyle);
      addTwoColumnFields(body,
        ['Spouse ID Type', data.sp_id_type],
        ['Spouse ID Number', data.sp_id_num],
        fieldStyle);
      addTwoColumnFields(body,
        ['Spouse ID State', data.sp_id_state],
        ['Spouse ID Exp', data.sp_id_exp],
        fieldStyle);
      addSeparatorLine(body);
    }
    
    // ADDRESS
    addSectionHeader(body, '03. RESIDENTIAL ADDRESS', sectionStyle);
    addFormField(body, 'Street Address', data.addr_main, fieldStyle);
    addTwoColumnFields(body,
      ['City', data.addr_city],
      ['State', data.addr_state],
      fieldStyle);
    addTwoColumnFields(body,
      ['Zip Code', data.addr_zip],
      ['Apt/Suite', data.addr_apt],
      fieldStyle);
    addSeparatorLine(body);
    
    // FILING STATUS & DEPENDENTS
    addSectionHeader(body, '04. FILING STATUS & DEPENDENTS', sectionStyle);
    addTwoColumnFields(body,
      ['Filing Status', data.filing_status],
      ['Has Dependents', data.has_deps],
      fieldStyle);
    
    if (data.has_deps === 'Yes' && data.dependents && data.dependents.length > 0) {
      data.dependents.forEach((dep, idx) => {
        const depHeader = body.appendParagraph(`Dependent #${idx + 1}`);
        depHeader.setBold(true);
        depHeader.setFontSize(10);
        depHeader.setSpacingBefore(4);
        depHeader.setSpacingAfter(2);
        
        addTwoColumnFields(body,
          ['Name', dep.name],
          ['DOB', dep.dob],
          fieldStyle);
        addTwoColumnFields(body,
          ['SSN', dep.ssn],
          ['Relation', dep.relation],
          fieldStyle);
        addFormField(body, 'Months with you', dep.months, fieldStyle);
      });
    }
    addSeparatorLine(body);
    
    // CHILDCARE
    if (data.has_cc === 'Yes') {
      addSectionHeader(body, 'CHILDCARE INFORMATION', sectionStyle);
      addTwoColumnFields(body,
        ['Provider Name', data.cc_name],
        ['Provider Phone', data.cc_phone],
        fieldStyle);
      addTwoColumnFields(body,
        ['Provider Tax ID', data.cc_id],
        ['Provider Address', data.cc_addr],
        fieldStyle);
      addTwoColumnFields(body,
        ['Amount Paid', data.cc_amt],
        ['Frequency', data.cc_freq],
        fieldStyle);
      addSeparatorLine(body);
    }
    
    // QUESTIONNAIRE
    addSectionHeader(body, 'INFORMATION QUESTIONNAIRE', sectionStyle);
    if (data.questionnaire) {
      let count = 0;
      const entries = Object.keys(data.questionnaire);
      for (let i = 0; i < entries.length; i += 2) {
        const key1 = entries[i];
        const key2 = entries[i + 1];
        const label1 = key1.replace(/_/g, ' ').substring(0, 30);
        const value1 = data.questionnaire[key1];
        
        if (key2) {
          const label2 = key2.replace(/_/g, ' ').substring(0, 30);
          const value2 = data.questionnaire[key2];
          if (value1 || value2) {
            addTwoColumnFields(body,
              [label1, value1],
              [label2, value2],
              fieldStyle);
          }
        } else {
          if (value1) {
            addFormField(body, label1, value1, fieldStyle);
          }
        }
      }
    }
    addTwoColumnFields(body,
      ['Other Income / Comments', data.other_comments],
      ['Payment Method', data.fee_method],
      fieldStyle);
    addSeparatorLine(body);
    
    // DIRECT DEPOSIT
    addSectionHeader(body, 'DIRECT DEPOSIT', sectionStyle);
    addTwoColumnFields(body,
      ['Bank Name', data.bank_name],
      ['Routing Number', data.bank_rt],
      fieldStyle);
    addTwoColumnFields(body,
      ['Account Number', data.bank_acc],
      ['Account Type', data.bank_type],
      fieldStyle);
    addSeparatorLine(body);
    
    // SIGNATURES
    addSectionHeader(body, 'SIGNATURES', sectionStyle);
    addTwoColumnFields(body,
      ['Taxpayer Signature Date', data.sig_tp_date],
      ['Spouse Signature Date', data.sig_sp_date],
      fieldStyle);
    
    // Convertir a PDF
    const pdfBlob = doc.getBlob().getAs('application/pdf');
    Logger.log('PDF convertido a blob');
    
    // Eliminar documento temporal
    DriveApp.getFileById(doc.getId()).setTrashed(true);
    Logger.log('Documento temporal eliminado');
    
    return pdfBlob;
  } catch (error) {
    Logger.log('Error en createPDFFromData: ' + error.toString());
    throw error;
  }
}

// Función auxiliar para agregar encabezado de sección
function addSectionHeader(body, title, style) {
  const section = body.appendParagraph(title);
  section.setAttributes(style);
  section.setSpacingBefore(6);
  section.setSpacingAfter(4);
}

// Función auxiliar para agregar dos campos en una línea
function addTwoColumnFields(body, field1, field2, style) {
  if (!field1[1] && !field2[1]) return;
  
  const label1 = field1[0];
  const value1 = field1[1] || '';
  const label2 = field2[0];
  const value2 = field2[1] || '';
  
  const line = body.appendParagraph(`${label1}: ${value1}     |     ${label2}: ${value2}`);
  line.setAttributes(style);
  line.setSpacingAfter(2);
}

// Función auxiliar para agregar un campo individual
function addFormField(body, label, value, style) {
  if (!value) return;
  
  const field = body.appendParagraph(`${label}: ${value}`);
  field.setAttributes(style);
  field.setSpacingAfter(2);
}

// Función auxiliar para agregar línea separadora
function addSeparatorLine(body) {
  const separator = body.appendParagraph('_'.repeat(100));
  separator.setFontSize(8);
  separator.setSpacingBefore(4);
  separator.setSpacingAfter(4);
}

// Guardar datos en hoja de cálculo
function saveToSpreadsheet(data) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];
    
    // Agregar encabezados si es la primera fila
    if (sheet.getLastRow() === 0) {
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
      sheet.appendRow(headers);
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
    sheet.appendRow(row);
    
    Logger.log('Datos guardados en hoja de cálculo');
  } catch (error) {
    Logger.log('Error guardando en hoja de cálculo: ' + error);
  }
}
