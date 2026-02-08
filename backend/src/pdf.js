const PDFDocument = require('pdfkit');
const { Buffer } = require('buffer');

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

      // QUESTIONNAIRE
      addSection('INFORMATION QUESTIONNAIRE');
      if (formData.questionnaire) {
        const entries = Object.entries(formData.questionnaire);
        for (let i = 0; i < entries.length; i += 2) {
          const [key1, value1] = entries[i];
          const [key2, value2] = entries[i + 1] || [null, null];
          const label1 = key1.replace(/_/g, ' ').substring(0, 25);
          const label2 = key2 ? key2.replace(/_/g, ' ').substring(0, 25) : '';
          if (value1 || value2) {
            addTwoFields(label1, value1, label2, value2);
          }
        }
      }
      addTwoFields('Other Income / Comments', formData.other_comments, 'Payment Method', formData.fee_method);
      doc.moveDown(0.3);
      doc.strokeColor('#eeeeee').lineWidth(0.5).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(0.3);

      // DIRECT DEPOSIT
      addSection('DIRECT DEPOSIT');
      addTwoFields('Bank Name', formData.bank_name, 'Routing Number', formData.bank_rt);
      addTwoFields('Account Number', formData.bank_acc, 'Account Type', formData.bank_type);
      doc.moveDown(0.3);
      doc.strokeColor('#eeeeee').lineWidth(0.5).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(0.3);

      // SIGNATURES
      addSection('SIGNATURES');
      addTwoFields('Taxpayer Signature Date', formData.sig_tp_date, 'Spouse Signature Date', formData.sig_sp_date);

      // Insertar firmas si existen
      if (formData.sig_tp && formData.sig_tp.startsWith('data:image')) {
        try {
          const sigBuffer = Buffer.from(formData.sig_tp.split(',')[1], 'base64');
          doc.fontSize(9).fillColor(textColor).font('Helvetica-Bold').text('Taxpayer Signature:');
          doc.image(sigBuffer, 40, doc.y, { width: 150, height: 60 });
          doc.moveDown(3);
        } catch (e) {
          console.warn('No se pudo insertar firma del contribuyente:', e.message);
        }
      }

      if (formData.has_spouse === 'Yes' && formData.sig_sp && formData.sig_sp.startsWith('data:image')) {
        try {
          const sigBuffer = Buffer.from(formData.sig_sp.split(',')[1], 'base64');
          doc.fontSize(9).fillColor(textColor).font('Helvetica-Bold').text('Spouse Signature:');
          doc.image(sigBuffer, 40, doc.y, { width: 150, height: 60 });
          doc.moveDown(3);
        } catch (e) {
          console.warn('No se pudo insertar firma del cónyuge:', e.message);
        }
      }

      // Pie de página
      doc.moveDown(1);
      doc.fontSize(8).fillColor('#999999').text('DLA TAX SERVICES © 2026 - Documento generado automáticamente', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generatePDF };
