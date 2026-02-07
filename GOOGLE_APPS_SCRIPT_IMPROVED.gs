// ============================================================================
// GOOGLE APPS SCRIPT - DLA TAX SERVICES FORM HANDLER
// ============================================================================
// Reemplaza TU_ID_DE_CARPETA_AQUI con el ID de tu carpeta de Google Drive
// ============================================================================

const DRIVE_FOLDER_ID = 'TU_ID_DE_CARPETA_AQUI';
const SPREADSHEET_ID = 'TU_ID_DE_HOJA_DE_CALCULO_AQUI'; // Opcional

// Función principal que recibe los datos del formulario
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Crear PDF con los datos
    const pdfBlob = createPDFFromData(data);
    
    // Guardar en Google Drive
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    const fileName = `DLA_Tax_${data.tp_name || 'Unknown'}_${new Date().getTime()}.pdf`;
    const file = folder.createFile(pdfBlob);
    file.setName(fileName);
    
    // Guardar en hoja de cálculo (opcional)
    if (SPREADSHEET_ID && SPREADSHEET_ID !== 'TU_ID_DE_HOJA_DE_CALCULO_AQUI') {
      saveToSpreadsheet(data);
    }
    
    Logger.log('Formulario guardado: ' + fileName);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Formulario guardado exitosamente en Google Drive',
      fileName: fileName
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Error: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Crear PDF con formato profesional
function createPDFFromData(data) {
  const doc = DocumentApp.create(`DLA_Tax_${data.tp_name || 'Form'}`);
  const body = doc.getBody();
  
  // Estilos
  const titleStyle = {};
  titleStyle[DocumentApp.Attribute.FONT_SIZE] = 18;
  titleStyle[DocumentApp.Attribute.BOLD] = true;
  titleStyle[DocumentApp.Attribute.FOREGROUND_COLOR] = '#197547';
  
  const sectionStyle = {};
  sectionStyle[DocumentApp.Attribute.FONT_SIZE] = 12;
  sectionStyle[DocumentApp.Attribute.BOLD] = true;
  sectionStyle[DocumentApp.Attribute.FOREGROUND_COLOR] = '#1a1a1a';
  
  // Título
  const title = body.appendParagraph('DLA TAX SERVICES');
  title.setAttributes(titleStyle);
  title.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  
  const subtitle = body.appendParagraph('TAXPAYER INTAKE FORM 2026');
  subtitle.setAttributes(sectionStyle);
  subtitle.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  
  body.appendParagraph(''); // Espacio
  
  // INITIAL SETUP
  addSection(body, 'INITIAL SETUP', sectionStyle);
  addField(body, 'Preparation Date', data.form_date);
  addField(body, 'Prior Client', data.prior_client);
  addField(body, 'Referral', data.referral);
  body.appendParagraph('');
  
  // TAXPAYER INFORMATION
  addSection(body, '01. TAXPAYER INFORMATION', sectionStyle);
  addField(body, 'Full Name', data.tp_name);
  addField(body, 'Date of Birth', data.tp_dob);
  addField(body, 'SSN / ITIN', data.tp_ssn);
  addField(body, 'Phone', data.tp_phone);
  addField(body, 'Email', data.tp_email);
  addField(body, 'Occupation', data.tp_occ);
  addField(body, 'ID Type', data.tp_id_type);
  addField(body, 'ID Number', data.tp_id_num);
  addField(body, 'ID State', data.tp_id_state);
  addField(body, 'ID Issue Date', data.tp_id_issue);
  addField(body, 'ID Exp Date', data.tp_id_exp);
  addField(body, 'US Citizen', data.tp_citizen);
  addField(body, 'Student', data.tp_student);
  addField(body, 'Student Institution', data.tp_student_inst);
  body.appendParagraph('');
  
  // SPOUSE INFORMATION
  if (data.has_spouse === 'Yes') {
    addSection(body, '02. SPOUSE INFORMATION', sectionStyle);
    addField(body, 'Spouse Name', data.sp_name);
    addField(body, 'Spouse DOB', data.sp_dob);
    addField(body, 'Spouse SSN', data.sp_ssn);
    addField(body, 'Spouse Occupation', data.sp_ocu);
    addField(body, 'Spouse Cell', data.sp_cell);
    addField(body, 'Spouse Email', data.sp_email);
    addField(body, 'Spouse ID Type', data.sp_id_type);
    addField(body, 'Spouse ID Number', data.sp_id_num);
    addField(body, 'Spouse ID State', data.sp_id_state);
    addField(body, 'Spouse ID Exp', data.sp_id_exp);
    body.appendParagraph('');
  }
  
  // ADDRESS
  addSection(body, '03. RESIDENTIAL ADDRESS', sectionStyle);
  addField(body, 'Street Address', data.addr_main);
  addField(body, 'Apt/Suite', data.addr_apt);
  addField(body, 'City', data.addr_city);
  addField(body, 'State', data.addr_state);
  addField(body, 'Zip Code', data.addr_zip);
  body.appendParagraph('');
  
  // FILING STATUS & DEPENDENTS
  addSection(body, '04. FILING STATUS & DEPENDENTS', sectionStyle);
  addField(body, 'Filing Status', data.filing_status);
  addField(body, 'Has Dependents', data.has_deps);
  
  if (data.has_deps === 'Yes' && data.dependents && data.dependents.length > 0) {
    data.dependents.forEach((dep, idx) => {
      body.appendParagraph(`Dependent #${idx + 1}`).setBold(true);
      addField(body, 'Name', dep.name);
      addField(body, 'DOB', dep.dob);
      addField(body, 'SSN', dep.ssn);
      addField(body, 'Relation', dep.relation);
      addField(body, 'Months with you', dep.months);
    });
  }
  body.appendParagraph('');
  
  // CHILDCARE
  if (data.has_cc === 'Yes') {
    addSection(body, 'CHILDCARE INFORMATION', sectionStyle);
    addField(body, 'Provider Name', data.cc_name);
    addField(body, 'Provider Phone', data.cc_phone);
    addField(body, 'Provider Tax ID', data.cc_id);
    addField(body, 'Provider Address', data.cc_addr);
    addField(body, 'Amount Paid', data.cc_amt);
    addField(body, 'Frequency', data.cc_freq);
    body.appendParagraph('');
  }
  
  // QUESTIONNAIRE
  addSection(body, 'INFORMATION QUESTIONNAIRE', sectionStyle);
  if (data.questionnaire) {
    Object.keys(data.questionnaire).forEach(key => {
      const label = key.replace(/_/g, ' ').toUpperCase();
      addField(body, label, data.questionnaire[key]);
    });
  }
  addField(body, 'Other Income / Comments', data.other_comments);
  addField(body, 'Payment Method', data.fee_method);
  body.appendParagraph('');
  
  // DIRECT DEPOSIT
  addSection(body, 'DIRECT DEPOSIT', sectionStyle);
  addField(body, 'Bank Name', data.bank_name);
  addField(body, 'Routing Number', data.bank_rt);
  addField(body, 'Account Number', data.bank_acc);
  addField(body, 'Account Type', data.bank_type);
  body.appendParagraph('');
  
  // SIGNATURES
  addSection(body, 'SIGNATURES', sectionStyle);
  addField(body, 'Taxpayer Signature Date', data.sig_tp_date);
  if (data.has_spouse === 'Yes') {
    addField(body, 'Spouse Signature Date', data.sig_sp_date);
  }
  
  // Convertir a PDF
  const pdfBlob = doc.getBlob().getAs('application/pdf');
  
  // Eliminar documento temporal
  DriveApp.getFileById(doc.getId()).setTrashed(true);
  
  return pdfBlob;
}

// Función auxiliar para agregar secciones
function addSection(body, title, style) {
  const section = body.appendParagraph(title);
  section.setAttributes(style);
  section.setSpacingBefore(10);
  section.setSpacingAfter(5);
}

// Función auxiliar para agregar campos
function addField(body, label, value) {
  if (!value) return;
  const field = body.appendParagraph(`${label}: ${value}`);
  field.setFontSize(10);
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
