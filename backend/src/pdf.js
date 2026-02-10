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

      // QUESTIONNAIRE - Tabla profesional con tres columnas: Pregunta | Sí | No
      addSection('INFORMATION QUESTIONNAIRE');
      if (formData.questionnaire) {
        const entries = Object.entries(formData.questionnaire);
        
        // Configuración de la tabla
        const colQuestionX = 40;
        const colYesX = 420;
        const colNoX = 480;
        const questionWidth = 370;
        const checkWidth = 50;
        const rowHeight = 22;
        let startY = doc.y;
        
        // Dibujar encabezados de tabla bilingües
        doc.fontSize(7).fillColor(titleColor).font('Helvetica-Bold');
        doc.text('Topic / Question (Tema / Pregunta)', colQuestionX, startY);
        doc.text('YES / SÍ', colYesX, startY, { width: checkWidth, align: 'center' });
        doc.text('NO', colNoX, startY, { width: checkWidth, align: 'center' });
        
        // Línea bajo encabezados
        startY += 16;
        doc.strokeColor(titleColor).lineWidth(1);
        doc.moveTo(colQuestionX, startY - 4).lineTo(530, startY - 4).stroke();
        
        // Mapeo completo de preguntas con texto original
        const questionMap = {
          'unemployment_desempleo': 'Unemployment / Desempleo',
          'mortgage_form_1098_hipoteca_formulario_1098': 'Mortgage (Form 1098) / Hipoteca (Formulario 1098)',
          'public_assistance_asistencia_publica': 'Public Assistance / Asistencia Pública',
          'real_estate_taxes_impuestos_a_la_propiedad': 'Real Estate Taxes / Impuestos a la Propiedad',
          'food_stamps_cupones_de_alimentos': 'Food Stamps / Cupones de Alimentos',
          'medical_expenses_gastos_medicos': 'Medical Expenses / Gastos Médicos',
          'social_security_or_ssi_seguro_social_o_ssi': 'Social Security or SSI / Seguro Social o SSI',
          'medical_insurance_seguro_medico': 'Medical Insurance / Seguro Médico',
          'section_8_rental_assistance_seccion_8_ayuda_para_la_renta': 'Section 8 (Rental Assistance) / Sección 8 (Ayuda para la Renta)',
          'theft_loss_perdida_por_robo': 'Theft Loss / Pérdida por Robo',
          'child_support_manutencion_de_hijos': 'Child Support / Manutención de Hijos',
          'donations_donaciones': 'Donations / Donaciones',
          'gambling_income_ingresos_por_loteria_o_juegos_de_azar': 'Gambling Income / Ingresos por Lotería o Juegos de Azar',
          'gambling_losses_perdidas_por_loteria_o_juegos_de_azar': 'Gambling Losses / Pérdidas por Lotería o Juegos de Azar',
          'interest_income_ingresos_por_intereses': 'Interest Income / Ingresos por Intereses',
          'car_loan_prestamo_de_vehiculo': 'Car Loan / Préstamo de Vehículo',
          'pensions_or_ira_pensiones_o_ira': 'Pensions or IRA / Pensiones o IRA'
        };
        
        // Función para obtener texto de pregunta
        const getQuestionText = (key) => {
          return questionMap[key] || key.replace(/^q_/i, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        };
        
        // Dibujar cada fila de la tabla
        entries.forEach(([key, value], index) => {
          let currentY = startY + (index * rowHeight);
          
          // Verificar si necesitamos nueva página
          if (currentY > 720) {
            doc.addPage();
            startY = 50;
            currentY = startY;
          }
          
          // Dibujar línea de separación sutil
          if (index > 0) {
            doc.strokeColor('#e0e0e0').lineWidth(0.5);
            doc.moveTo(colQuestionX, currentY - 4).lineTo(530, currentY - 4).stroke();
          }
          
          // Pregunta (texto completo sin truncar)
          const questionText = getQuestionText(key);
          doc.fontSize(8).fillColor(textColor).font('Helvetica');
          doc.text(questionText, colQuestionX, currentY, { width: questionWidth, lineGap: 1 });
          
          // Dibujar círculos para selección - centrados en la fila
          const circleY = currentY + 8; // Centrado vertical en la fila
          const circleRadius = 5;
          
          // Círculo para YES (centro en colYesX + 25 = 445)
          doc.strokeColor('#333333').lineWidth(0.5);
          doc.circle(colYesX + 25, circleY, circleRadius).stroke();
          
          // Círculo para NO (centro en colNoX + 25 = 505)
          doc.circle(colNoX + 25, circleY, circleRadius).stroke();
          
          // Marcar según respuesta - DENTRO del círculo
          doc.fontSize(9).font('Helvetica-Bold');
          if (value === 'Yes') {
            doc.fillColor('#197547'); // Verde - ✓ dentro del círculo
            doc.text('✓', colYesX + 25 - 5, circleY - 5, { width: 10, align: 'center' });
          } else if (value === 'No') {
            doc.fillColor('#cc0000'); // Rojo - ✓ dentro del círculo
            doc.text('✓', colNoX + 25 - 5, circleY - 5, { width: 10, align: 'center' });
          }
          
          // Actualizar doc.y después de dibujar la fila
          doc.y = currentY + rowHeight;
        });
        
        // Actualizar posición Y después de la tabla
        doc.y = startY + (entries.length * rowHeight) + 20;
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

      // SIGNATURES - En la misma página si hay espacio
      addSection('SIGNATURES & AUTHORIZATION');
      
      // Verificar espacio disponible antes de firmas
      if (doc.y > 650) {
        doc.addPage();
      }
      
      addTwoFields('Taxpayer Signature Date', formData.sig_tp_date || 'N/A', 'Spouse Signature Date', formData.sig_sp_date || 'N/A');

      // Insertar firmas en una fila si existen
      if ((formData.sig_tp && formData.sig_tp.startsWith('data:image')) ||
          (formData.has_spouse === 'Yes' && formData.sig_sp && formData.sig_sp.startsWith('data:image'))) {
        
        const sigY = doc.y + 10;
        
        // Firma del contribuyente
        if (formData.sig_tp && formData.sig_tp.startsWith('data:image')) {
          try {
            const sigBuffer = Buffer.from(formData.sig_tp.split(',')[1], 'base64');
            doc.fontSize(8).fillColor(textColor).font('Helvetica-Bold').text('Taxpayer Signature:', 40, sigY);
            doc.image(sigBuffer, 40, sigY + 15, { width: 200, height: 50 });
          } catch (e) {
            console.warn('No se pudo insertar firma del contribuyente:', e.message);
          }
        }
        
        // Firma del cónyuge
        if (formData.has_spouse === 'Yes' && formData.sig_sp && formData.sig_sp.startsWith('data:image')) {
          try {
            const sigBuffer = Buffer.from(formData.sig_sp.split(',')[1], 'base64');
            doc.fontSize(8).fillColor(textColor).font('Helvetica-Bold').text('Spouse Signature:', 300, sigY);
            doc.image(sigBuffer, 300, sigY + 15, { width: 200, height: 50 });
          } catch (e) {
            console.warn('No se pudo insertar firma del cónyuge:', e.message);
          }
        }
        
        doc.y = sigY + 80;
      }

      // Pie de página - solo en la última página
      if (doc.y > 700) {
        doc.addPage();
      }
      doc.moveDown(2);
      doc.fontSize(8).fillColor('#666666').text('─────────────────────────────────────────────────────────────────────────────', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(9).fillColor(titleColor).font('Helvetica-Bold').text('DLA TAX SERVICES', { align: 'center' });
      doc.fontSize(8).fillColor('#666666').font('Helvetica').text('Precise Preparation for Maximum Refunds | Preparación Precisa para Máximos Reembolsos', { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(7).fillColor('#999999').text('© 2026 DLA Tax Services - Document generated automatically / Documento generado automáticamente', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generatePDF };
