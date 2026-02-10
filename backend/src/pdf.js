const PDFDocument = require('pdfkit');
const PDFDocumentTable = require('pdfkit-table');
const { Buffer } = require('buffer');

// Mixin para agregar método table
PDFDocument.prototype.table = function(tableData, options) {
  return new Promise((resolve) => {
    const doc = this;
    const {
      headers = [],
      rows = [],
      columnsSize = [],
      x = 40,
      y = null,
      width = null,
      height = null,
      padding = 5,
      headerBackgroundColor = '#197547',
      headerTextColor = '#ffffff',
      bodyTextColor = '#000000',
      divider = { horizontal: { width: 0.5, color: '#e0e0e0' }, vertical: null }
    } = options;

    const startY = y || doc.y;
    const tableWidth = width || (515 - x);
    const rowHeight = 26;
    const headerHeight = 22;
    
    // Calcular anchos de columnas si no se especifican
    const colCount = headers.length;
    const colWidth = tableWidth / colCount;
    const finalColSizes = columnsSize.length === colCount ? columnsSize : Array(colCount).fill(colWidth);

    // Dibujar header
    let currentY = startY;
    
    // Fondo del header
    doc.rect(x, currentY, tableWidth, headerHeight).fill(headerBackgroundColor);
    
    // Texto del header
    headers.forEach((header, i) => {
      const colX = x + finalColSizes.slice(0, i).reduce((a, b) => a + b, 0) + padding;
      doc.fillColor(headerTextColor).fontSize(8).font('Helvetica-Bold');
      doc.text(header.label || '', colX, currentY + 8, {
        width: finalColSizes[i] - (padding * 2),
        align: header.align || 'left'
      });
    });
    
    currentY += headerHeight;

    // Dibujar filas
    rows.forEach((row, rowIndex) => {
      // Fondo alternado
      if (rowIndex % 2 === 1) {
        doc.fillColor('#f8f8f8').rect(x, currentY, tableWidth, rowHeight).fill();
      }

      headers.forEach((header, colIndex) => {
        const colX = x + finalColSizes.slice(0, colIndex).reduce((a, b) => a + b, 0) + padding;
        const cellWidth = finalColSizes[colIndex] - (padding * 2);
        
        // Color especial para columna ANSWER
        if (header.property === 'answer') {
          const answer = row[header.property] || '';
          if (answer.startsWith('YES')){
            doc.fillColor('#dcfce7').rect(x + finalColSizes.slice(0, colIndex).reduce((a, b) => a + b, 0), currentY, finalColSizes[colIndex], rowHeight).fill();
            doc.fillColor('#16a34a').fontSize(9).font('Helvetica-Bold');
          } else if (answer === 'NO') {
            doc.fillColor('#fee2e2').rect(x + finalColSizes.slice(0, colIndex).reduce((a, b) => a + b, 0), currentY, finalColSizes[colIndex], rowHeight).fill();
            doc.fillColor('#dc2626').fontSize(9).font('Helvetica-Bold');
          } else {
            doc.fillColor('#999999').fontSize(9).font('Helvetica');
          }
        } else {
          doc.fillColor('#000000').fontSize(8).font('Helvetica');
        }
        
        doc.text(String(row[header.property] || ''), colX, currentY + 8, {
          width: cellWidth,
          align: header.align || 'center'
        });
      });

      // Línea horizontal
      doc.strokeColor('#e0e0e0').lineWidth(0.5);
      doc.moveTo(x, currentY + rowHeight).lineTo(x + tableWidth, currentY + rowHeight).stroke();

      currentY += rowHeight;
    });

    doc.y = currentY + 5;
    resolve();
  });
};

async function generatePDF(formData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'letter',
        margin: 40
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Estilos
      const titleColor = '#197547';
      const textColor = '#1a1a1a';

      // Encabezado
      doc.fontSize(20).fillColor(titleColor).font('Helvetica-Bold').text('DLA TAX SERVICES', { align: 'center' });
      doc.fontSize(14).fillColor(textColor).text('TAXPAYER INTAKE FORM 2026', { align: 'center' });
      doc.moveDown(0.5);
      doc.strokeColor('#cccccc').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(0.5);

      // Función auxiliar para agregar sección
      const addSection = (title) => {
        doc.fontSize(11).fillColor(titleColor).font('Helvetica-Bold').text(title);
        doc.moveDown(0.3);
      };

      // Función auxiliar para agregar dos campos en una línea
      const addTwoFields = (label1, value1, label2, value2) => {
        doc.fontSize(9).fillColor(textColor).font('Helvetica-Bold');
        const x1 = 40;
        const x2 = 300;
        const y = doc.y;
        
        doc.text(`${label1}:`, x1, y);
        doc.fontSize(9).font('Helvetica').fillColor('#555555');
        doc.text(String(value1 || '').substring(0, 40), x1 + 100, y);
        
        doc.fontSize(9).font('Helvetica-Bold').fillColor(textColor);
        doc.text(`${label2}:`, x2, y);
        doc.fontSize(9).font('Helvetica').fillColor('#555555');
        doc.text(String(value2 || '').substring(0, 40), x2 + 100, y);
        
        doc.moveDown(0.8);
      };

      // Función auxiliar para agregar un campo
      const addField = (label, value) => {
        doc.fontSize(9).fillColor(textColor).font('Helvetica-Bold');
        doc.text(`${label}:`, 40);
        doc.fontSize(9).font('Helvetica').fillColor('#555555');
        doc.text(String(value || '').substring(0, 60), 140);
        doc.moveDown(0.5);
      };

      // INITIAL SETUP
      addSection('INITIAL SETUP');
      addTwoFields('Preparation Date', formData.form_date, 'Prior Client', formData.prior_client);
      addField('Referral', formData.referral);
      doc.moveDown(0.3);
      doc.strokeColor('#eeeeee').lineWidth(0.5).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(0.3);

      // TAXPAYER INFORMATION
      addSection('01. TAXPAYER INFORMATION');
      addTwoFields('Full Name', formData.tp_name, 'Date of Birth', formData.tp_dob);
      addTwoFields('SSN / ITIN', formData.tp_ssn, 'Phone', formData.tp_phone);
      addTwoFields('Email', formData.tp_email, 'Occupation', formData.tp_occ);
      addTwoFields('ID Type', formData.tp_id_type, 'ID Number', formData.tp_id_num);
      addTwoFields('ID State', formData.tp_id_state, 'ID Issue Date', formData.tp_id_issue);
      addTwoFields('ID Exp Date', formData.tp_id_exp, 'US Citizen', formData.tp_citizen);
      addTwoFields('Student', formData.tp_student, 'Student Institution', formData.tp_student_inst);
      doc.moveDown(0.3);
      doc.strokeColor('#eeeeee').lineWidth(0.5).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(0.3);

      // SPOUSE INFORMATION
      if (formData.has_spouse === 'Yes') {
        addSection('02. SPOUSE INFORMATION');
        addTwoFields('Spouse Name', formData.sp_name, 'Spouse DOB', formData.sp_dob);
        addTwoFields('Spouse SSN', formData.sp_ssn, 'Spouse Occupation', formData.sp_ocu);
        addTwoFields('Spouse Cell', formData.sp_cell, 'Spouse Email', formData.sp_email);
        addTwoFields('Spouse ID Type', formData.sp_id_type, 'Spouse ID Number', formData.sp_id_num);
        addTwoFields('Spouse ID State', formData.sp_id_state, 'Spouse ID Exp', formData.sp_id_exp);
        doc.moveDown(0.3);
        doc.strokeColor('#eeeeee').lineWidth(0.5).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
        doc.moveDown(0.3);
      }

      // ADDRESS
      addSection('03. RESIDENTIAL ADDRESS');
      addField('Street Address', formData.addr_main);
      addTwoFields('City', formData.addr_city, 'State', formData.addr_state);
      addTwoFields('Zip Code', formData.addr_zip, 'Apt/Suite', formData.addr_apt);
      doc.moveDown(0.3);
      doc.strokeColor('#eeeeee').lineWidth(0.5).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(0.3);

      // FILING STATUS & DEPENDENTS
      addSection('04. FILING STATUS & DEPENDENTS');
      addTwoFields('Filing Status', formData.filing_status, 'Has Dependents', formData.has_deps);

      if (formData.has_deps === 'Yes' && formData.dependents && formData.dependents.length > 0) {
        formData.dependents.forEach((dep, idx) => {
          doc.fontSize(10).fillColor(titleColor).font('Helvetica-Bold').text(`Dependent #${idx + 1}`);
          doc.moveDown(0.2);
          addTwoFields('Name', dep.name, 'DOB', dep.dob);
          addTwoFields('SSN', dep.ssn, 'Relation', dep.relation);
          addField('Months with you', dep.months);
        });
      }
      doc.moveDown(0.3);
      doc.strokeColor('#eeeeee').lineWidth(0.5).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(0.3);

      // CHILDCARE
      if (formData.has_cc === 'Yes') {
        addSection('CHILDCARE INFORMATION');
        addTwoFields('Provider Name', formData.cc_name, 'Provider Phone', formData.cc_phone);
        addTwoFields('Provider Tax ID', formData.cc_id, 'Provider Address', formData.cc_addr);
        addTwoFields('Amount Paid', formData.cc_amt, 'Frequency', formData.cc_freq);
        doc.moveDown(0.3);
        doc.strokeColor('#eeeeee').lineWidth(0.5).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
        doc.moveDown(0.3);
      }

      // QUESTIONNAIRE - TABLA REAL CON PDFKIT-TABLE
      addSection('INFORMATION QUESTIONNAIRE');
      if (formData.questionnaire) {
        // Debug: mostrar las claves que llegan
        const qKeys = Object.keys(formData.questionnaire);
        console.log('Keys recibidas del cuestionario:', qKeys);
        
        // Mapeo de preguntas
        const questionDefs = [
          { patterns: ['unemployment', 'desempleo'], text: 'Unemployment / Desempleo' },
          { patterns: ['mortgage', 'hipoteca', '1098'], text: 'Mortgage (Form 1098) / Hipoteca (Form 1098)' },
          { patterns: ['public_assistance', 'asistencia'], text: 'Public Assistance / Asistencia Pública' },
          { patterns: ['real_estate', 'propiedad'], text: 'Real Estate Taxes / Impuestos a la Propiedad' },
          { patterns: ['food_stamps', 'cupones'], text: 'Food Stamps / Cupones de Alimentos' },
          { patterns: ['medical_expenses', 'gastos'], text: 'Medical Expenses / Gastos Médicos' },
          { patterns: ['social_security', 'ssi', 'seguro'], text: 'Social Security or SSI / Seguro Social o SSI' },
          { patterns: ['medical_insurance', 'seguro'], text: 'Medical Insurance / Seguro Médico' },
          { patterns: ['section_8', 'rental', 'renta'], text: 'Section 8 (Rental Assistance) / Sección 8' },
          { patterns: ['theft_loss', 'robo'], text: 'Theft Loss / Pérdida por Robo' },
          { patterns: ['child_support', 'manutencion'], text: 'Child Support / Manutención de Hijos' },
          { patterns: ['donations', 'donaciones'], text: 'Donations / Donaciones' },
          { patterns: ['gambling_income', 'azar'], text: 'Gambling Income / Ingresos por Juegos' },
          { patterns: ['gambling_losses', 'azar'], text: 'Gambling Losses / Pérdidas por Juegos' },
          { patterns: ['interest_income', 'intereses'], text: 'Interest Income / Ingresos por Intereses' },
          { patterns: ['car_loan', 'vehiculo'], text: 'Car Loan / Préstamo de Vehículo' },
          { patterns: ['pensions', 'ira'], text: 'Pensions or IRA / Pensiones o IRA' }
        ];
        
        // Preparar datos de la tabla
        const tableData = {
          headers: [
            { label: 'TOPIC / QUESTION (TEMA / PREGUNTA)', property: 'question', width: 350 },
            { label: 'ANSWER / RESPUESTA', property: 'answer', width: 165, align: 'center' }
          ],
          rows: []
        };
        
        // Llenar filas
        questionDefs.forEach((qDef) => {
          let answer = 'N/A';
          for (const key of qKeys) {
            const lowerKey = key.toLowerCase().replace(/[^a-z0-9]/g, '_');
            const cleanPattern = qDef.patterns[0].replace(/[^a-z0-9]/g, '_');
            if (lowerKey.includes(cleanPattern)) {
              answer = formData.questionnaire[key];
              console.log(`PDF: ${qDef.text} = ${answer} (key: ${key})`);
              break;
            }
          }
          
          tableData.rows.push({
            question: qDef.text,
            answer: answer === 'Yes' ? 'YES / SÍ' : answer === 'No' ? 'NO' : 'N/A'
          });
        });
        
        // Dibujar tabla
        doc.table(tableData, {
          columnsSize: [350, 165],
          x: 40,
          y: doc.y,
          width: 515,
          padding: 5,
          headerBackgroundColor: '#197547',
          headerTextColor: '#ffffff'
        });
      }

      // OTHER INCOME & PAYMENT METHOD
      addSection('OTHER INFORMATION');
      addField('Other Income / Comments', formData.other_comments || 'N/A');
      addField('Payment Method', formData.fee_method || 'N/A');
      doc.moveDown(0.3);

      // DIRECT DEPOSIT
      addSection('DIRECT DEPOSIT INFORMATION');
      addTwoFields('Bank Name', formData.bank_name || 'N/A', 'Routing Number', formData.bank_rt || 'N/A');
      addTwoFields('Account Number', formData.bank_acc || 'N/A', 'Account Type', formData.bank_type || 'N/A');
      doc.moveDown(0.3);

      // SIGNATURES
      addSection('SIGNATURES & AUTHORIZATION');
      
      if (doc.y > 650) {
        doc.addPage();
      }
      
      addTwoFields('Taxpayer Signature Date', formData.sig_tp_date || 'N/A', 'Spouse Signature Date', formData.sig_sp_date || 'N/A');

      // Insertar firmas
      if ((formData.sig_tp && formData.sig_tp.startsWith('data:image')) || 
          (formData.has_spouse === 'Yes' && formData.sig_sp && formData.sig_sp.startsWith('data:image'))) {
        
        const sigY = doc.y + 15;
        
        if (formData.sig_tp && formData.sig_tp.startsWith('data:image')) {
          try {
            const sigBuffer = Buffer.from(formData.sig_tp.split(',')[1], 'base64');
            doc.fontSize(8).fillColor(textColor).font('Helvetica-Bold').text('Taxpayer Signature:', 40, sigY);
            doc.image(sigBuffer, 40, sigY + 15, { width: 200, height: 50 });
          } catch (e) {
            console.warn('Error inserting taxpayer signature:', e.message);
          }
        }
        
        if (formData.has_spouse === 'Yes' && formData.sig_sp && formData.sig_sp.startsWith('data:image')) {
          try {
            const sigBuffer = Buffer.from(formData.sig_sp.split(',')[1], 'base64');
            doc.fontSize(8).fillColor(textColor).font('Helvetica-Bold').text('Spouse Signature:', 300, sigY);
            doc.image(sigBuffer, 300, sigY + 15, { width: 200, height: 50 });
          } catch (e) {
            console.warn('Error inserting spouse signature:', e.message);
          }
        }
        
        doc.y = sigY + 80;
      }

      // Pie de página
      if (doc.y > 700) {
        doc.addPage();
      }
      doc.moveDown(2);
      doc.fillColor('#666666').fontSize(8).text('─────────────────────────────────────────────────────────────────────────────', { align: 'center' });
      doc.moveDown(0.5);
      doc.fillColor('#197547').fontSize(9).font('Helvetica-Bold').text('DLA TAX SERVICES', { align: 'center' });
      doc.fillColor('#666666').fontSize(8).font('Helvetica').text('Precise Preparation for Maximum Refunds | Preparación Precisa para Máximos Reembolsos', { align: 'center' });
      doc.moveDown(0.3);
      doc.fillColor('#999999').fontSize(7).text('© 2026 DLA Tax Services - Document generated automatically', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generatePDF };
