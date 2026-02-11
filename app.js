

const questionData = [
    "Unemployment / Desempleo",
    "Mortgage (Form 1098) / Hipoteca (Formulario 1098)",
    "Public Assistance / Asistencia Pública",
    "Real Estate Taxes / Impuestos a la Propiedad",
    "Food Stamps / Cupones de Alimentos",
    "Medical Expenses / Gastos Médicos",
    "Social Security or SSI / Seguro Social o SSI",
    "Medical Insurance / Seguro Médico",
    "Section 8 (Rental Assistance) / Sección 8 (Ayuda para la Renta)",
    "Theft Loss / Pérdida por Robo",
    "Child Support / Manutención de Hijos",
    "Donations / Donaciones",
    "Gambling Income / Ingresos por Lotería o Juegos de Azar",
    "Gambling Losses / Pérdidas por Lotería o Juegos de Azar",
    "Interest Income / Ingresos por Intereses",
    "Car Loan / Préstamo de Vehículo",
    "Pensions or IRA / Pensiones o IRA"
];


        const mContainer = document.getElementById('matrix_container');
        questionData.forEach(q => {
            const id = q.toLowerCase().replace(/[^a-z0-9]/g, '_');
            const row = document.createElement('div');
            row.className = "matrix-row";
            row.innerHTML = `
                <div class="text-[11px] font-bold text-slate-600 pr-2">${q}</div>
                <div class="text-center"><input type="radio" name="q_${id}" value="Yes" class="w-4 h-4 accent-green-600"></div>
                <div class="text-center"><input type="radio" name="q_${id}" value="No" class="w-4 h-4 accent-red-600"></div>
            `;
            mContainer.appendChild(row);
        });

        function toggleStudentInfo() {
            const isStudent = document.querySelector('input[name="tp_student"]:checked')?.value === 'Yes';
            document.getElementById('student_extra_info').classList.toggle('hidden', !isStudent);
        }

        function checkSpouseLogic() {
            const status = document.getElementById('filing_status').value;
            const hasSpouseRadio = document.querySelector('input[name="has_spouse"]:checked')?.value === 'Yes';
            
            // Si el estado civil es casado O si marcó que tiene cónyuge
            const showSpouse = (status.includes("Married") || hasSpouseRadio);
            
            // Mostrar/Ocultar campos de información y sección de firma
            document.getElementById('spouse_section').classList.toggle('hidden', !showSpouse);
            document.getElementById('sp_sig_card').classList.toggle('hidden', !showSpouse);
            if (showSpouse) {
    initSig('sig_sp'); // <-- inicializa aquí cuando ya es visible
  }
        }

        function toggleDeps() {
            const has = document.querySelector('input[name="has_deps"]:checked')?.value === 'Yes';
            document.getElementById('deps_section').classList.toggle('hidden', !has);
            if (has && document.getElementById('deps_container').children.length === 0) addDep();
        }

        function addDep() {
            const container = document.getElementById('deps_container');
            const depCount = container.children.length + 1;
            const div = document.createElement('div');
            div.className = "grid grid-cols-1 md:grid-cols-6 gap-2 bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm relative";
            div.innerHTML = `
                <div class="md:col-span-2"><label class="label-title">Dep #${depCount} Full Name</label><input type="text" class="dep-name text-xs"></div>
                <div><label class="label-title">Date of Birth</label><input type="date" class="dep-dob text-xs"></div>
                <div><label class="label-title">SSN</label><input type="text" class="dep-ssn text-xs"></div>
                <div><label class="label-title">Relation</label><input type="text" class="dep-rel text-xs"></div>
                <div><label class="label-title">Months w/ you</label><input type="number" class="dep-months text-xs" max="12" value="12"></div>
                <button type="button" onclick="this.parentElement.remove(); updateDepLabels();" class="absolute -top-2 -right-2 bg-red-600 text-white w-6 h-6 rounded-full text-xs shadow-lg font-bold flex items-center justify-center">×</button>
            `;
            container.appendChild(div);
        }

        function updateDepLabels() {
            const container = document.getElementById('deps_container');
            Array.from(container.children).forEach((child, index) => {
                const label = child.querySelector('.label-title');
                if (label) label.textContent = `Dep #${index + 1} Full Name`;
            });
        }

        function toggleCC() {
            const has = document.querySelector('input[name="has_cc"]:checked')?.value === 'Yes';
            document.getElementById('cc_section').classList.toggle('hidden', !has);
        }

        function initSig(id) {
            const canvas = document.getElementById(id);
  if (!canvas || canvas.dataset.initialized === '1') return; // <-- agrega esta línea
  canvas.dataset.initialized = '1'; // <-- y esta
  const ctx = canvas.getContext('2d');
  let drawing = false;
  const resize = () => {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const displayWidth = canvas.offsetWidth;
    const displayHeight = canvas.offsetHeight;
    canvas.width = displayWidth * ratio;
    canvas.height = displayHeight * ratio;
    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset
    ctx.scale(ratio, ratio);
  };
            window.addEventListener('resize', resize); resize();
            const getPos = (e) => {
                const rect = canvas.getBoundingClientRect();
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                return { x: clientX - rect.left, y: clientY - rect.top };
            };
            const start = (e) => { drawing = true; ctx.beginPath(); const p = getPos(e); ctx.moveTo(p.x, p.y); e.preventDefault(); };
            const move = (e) => { if(!drawing) return; const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.lineWidth = 2; ctx.strokeStyle = "#0f172a"; ctx.stroke(); e.preventDefault(); };
            const end = () => drawing = false;
            canvas.addEventListener('mousedown', start); canvas.addEventListener('mousemove', move); window.addEventListener('mouseup', end);
            canvas.addEventListener('touchstart', start, {passive: false}); canvas.addEventListener('touchmove', move, {passive: false}); canvas.addEventListener('touchend', end);
        }

        function clearSig(id) {
            const c = document.getElementById(id);
            c.getContext('2d').clearRect(0,0,c.width,c.height);
        }

        // Función para verificar si el canvas de firma tiene contenido
        function hasSignature(id) {
            const canvas = document.getElementById(id);
            const ctx = canvas.getContext('2d');
            const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            // Verificar si hay algún pixel que no sea completamente transparente
            for (let i = 3; i < pixelData.length; i += 4) {
                if (pixelData[i] > 0) return true;
            }
            return false;
        }

        initSig('sig_tp');
        checkSpouseLogic();

        function collectFormData() {
            const data = {
                // Initial Setup
                form_date: document.getElementById('form_date').value,
                prior_client: document.getElementById('prior_client').value,
                referral: document.getElementById('referral').value,
                
                // Taxpayer Information
                tp_name: document.getElementById('tp_name').value,
                tp_dob: document.getElementById('tp_dob').value,
                tp_ssn: document.getElementById('tp_ssn').value,
                tp_phone: document.getElementById('tp_phone').value,
                tp_email: document.getElementById('tp_email').value,
                tp_occ: document.getElementById('tp_occ').value,
                tp_id_type: document.getElementById('tp_id_type').value,
                tp_id_num: document.getElementById('tp_id_num').value,
                tp_id_state: document.getElementById('tp_id_state').value,
                tp_id_issue: document.getElementById('tp_id_issue').value,
                tp_id_exp: document.getElementById('tp_id_exp').value,
                tp_citizen: document.querySelector('input[name="tp_citizen"]:checked')?.value || '',
                tp_student: document.querySelector('input[name="tp_student"]:checked')?.value || '',
                tp_student_inst: document.getElementById('tp_student_inst').value,
                
                // Spouse Information
                has_spouse: document.querySelector('input[name="has_spouse"]:checked')?.value || '',
                sp_name: document.getElementById('sp_name').value,
                sp_dob: document.getElementById('sp_dob').value,
                sp_ssn: document.getElementById('sp_ssn').value,
                sp_ocu: document.getElementById('sp_ocu').value,
                sp_cell: document.getElementById('sp_cell').value,
                sp_email: document.getElementById('sp_email').value,
                sp_id_type: document.getElementById('sp_id_type').value,
                sp_id_num: document.getElementById('sp_id_num').value,
                sp_id_state: document.getElementById('sp_id_state').value,
                sp_id_exp: document.getElementById('sp_id_exp').value,
                
                // Address
                addr_main: document.getElementById('addr_main').value,
                addr_apt: document.getElementById('addr_apt').value,
                addr_city: document.getElementById('addr_city').value,
                addr_state: document.getElementById('addr_state').value,
                addr_zip: document.getElementById('addr_zip').value,
                
                // Filing Status & Dependents
                filing_status: document.getElementById('filing_status').value,
                has_deps: document.querySelector('input[name="has_deps"]:checked')?.value || '',
                
                // Childcare
                has_cc: document.querySelector('input[name="has_cc"]:checked')?.value || '',
                cc_name: document.getElementById('cc_name').value,
                cc_phone: document.getElementById('cc_phone').value,
                cc_id: document.getElementById('cc_id').value,
                cc_addr: document.getElementById('cc_addr').value,
                cc_amt: document.getElementById('cc_amt').value,
                cc_freq: document.getElementById('cc_freq').value,
                
                // Questionnaire
                other_comments: document.getElementById('other_comments').value,
                fee_method: document.getElementById('fee_method').value,
                
                // Direct Deposit
                bank_name: document.getElementById('bank_name').value,
                bank_rt: document.getElementById('bank_rt').value,
                bank_acc: document.getElementById('bank_acc').value,
                bank_type: document.querySelector('input[name="bank_type"]:checked')?.value || '',
                
                // Signatures
                sig_tp_date: document.getElementById('sig_tp_date').value,
                sig_sp_date: document.getElementById('sig_sp_date').value,
                sig_tp: document.getElementById('sig_tp').toDataURL('image/png'),
                sig_sp: document.getElementById('sig_sp').toDataURL('image/png'),
                
                // Dependents
                dependents: []
            };
            
            // Recopilar datos de dependientes
            const depsContainer = document.getElementById('deps_container');
            Array.from(depsContainer.children).forEach(child => {
                data.dependents.push({
                    name: child.querySelector('.dep-name').value,
                    dob: child.querySelector('.dep-dob').value,
                    ssn: child.querySelector('.dep-ssn').value,
                    relation: child.querySelector('.dep-rel').value,
                    months: child.querySelector('.dep-months').value
                });
            });
            
            // Recopilar respuestas del cuestionario
            data.questionnaire = {};
            questionData.forEach(q => {
                const id = q.toLowerCase().replace(/[^a-z0-9]/g, '_');
                data.questionnaire[id] = document.querySelector(`input[name="q_${id}"]:checked`)?.value || '';
            });
            
            return data;
        }

        // Función para resetear el formulario después de envío exitoso
        function resetForm() {
            const form = document.getElementById('fullTaxForm');
            form.reset();
            
            // Limpiar firmas
            clearSig('sig_tp');
            clearSig('sig_sp');
            
            // Limpiar dependientes
            document.getElementById('deps_container').innerHTML = '';
            
            // Ocultar secciones condicionadas
            document.getElementById('spouse_section').classList.add('hidden');
            document.getElementById('sp_sig_card').classList.add('hidden');
            document.getElementById('deps_section').classList.add('hidden');
            document.getElementById('cc_section').classList.add('hidden');
            document.getElementById('student_extra_info').classList.add('hidden');
            
            // Limpiar cuestionario
            document.querySelectorAll('input[type="radio"]').forEach(radio => {
                radio.checked = false;
            });
            
            // Recargar página después de un momento para limpiar todo completamente
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }

        // URL del backend desplegado en Render
        const BACKEND_URL = 'https://dla-tax.onrender.com/api/forms';
        
        async function sendToBackend(pdfBase64, formData) {
            try {
                console.log('Enviando PDF al backend...');
                const response = await fetch(BACKEND_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        pdf: pdfBase64,
                        data: {
                            taxpayer_name: formData.tp_name,
                            submission_date: formData.form_date,
                            has_spouse: formData.has_spouse
                        }
                    })
                });
                
                const result = await response.json();
                console.log('Respuesta del backend:', response.status, result);
                
                if (!response.ok || !result.success) {
                    throw new Error(result.message || 'Error del backend');
                }
                
                console.log('PDF guardado:', result.pdf_url);
                return result;
            } catch (error) {
                console.error('Error enviando al backend:', error);
                throw error;
            }
        }

        function generatePDF(formData) {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
            let yPos = 16;
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;
            const labelColumn = margin;
            const valueColumn = margin + 60;
            const lineHeight = 8;
            const sectionSpacing = 10;

            // Colores
            const titleColor = '#197547';
            const headerBg = '#197547';
            const headerText = '#ffffff';
            const yesBg = [220, 252, 231];  // Verde claro RGB
            const yesText = '#16a34a';
            const noBg = [254, 226, 226];   // Rojo claro RGB
            const noText = '#dc2626';

            // Función para verificar y agregar página
            const checkPageBreak = (space = 15) => {
                if (yPos + space > pageHeight - 15) {
                    doc.addPage();
                    yPos = 18;
                }
            };

            // Agregar línea separadora
            const addSeparator = () => {
                checkPageBreak(8);
                doc.setDrawColor(200, 200, 200);
                doc.line(margin, yPos, pageWidth - margin, yPos);
                yPos += 8;
            };

            // Agregar título de sección
            const addSectionTitle = (title) => {
                checkPageBreak(12);
                doc.setFontSize(11);
                doc.setFont(undefined, 'bold');
                doc.setTextColor(titleColor);
                doc.text(title, margin, yPos);
                yPos += 10;
                doc.setTextColor(0, 0, 0);
            };

            // Agregar campo con etiqueta y valor
            const addField = (label, value) => {
                checkPageBreak(8);
                doc.setFontSize(9);
                doc.setFont(undefined, 'bold');
                doc.setTextColor(40, 40, 40);
                doc.text(label + ':', labelColumn, yPos);
                
                doc.setFont(undefined, 'normal');
                doc.setTextColor(60, 60, 60);
                const valueText = String(value || '').substring(0, 60);
                doc.text(valueText, valueColumn, yPos);
                yPos += lineHeight;
            };

            // HEADER
            doc.setFontSize(20);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(titleColor);
            doc.text('DLA TAX SERVICES', pageWidth / 2, yPos, { align: 'center' });
            yPos += 10;
            
            doc.setFontSize(14);
            doc.setTextColor(50, 50, 50);
            doc.text('TAXPAYER INTAKE FORM 2026', pageWidth / 2, yPos, { align: 'center' });
            yPos += 12;
            
            addSeparator();
            yPos += 2;

            // INITIAL SETUP
            addSectionTitle('INITIAL SETUP');
            addField('Preparation Date', formData.form_date);
            addField('Prior Client', formData.prior_client);
            addField('Referral', formData.referral);
            yPos += sectionSpacing;
            addSeparator();
            yPos += 2;

            // TAXPAYER INFORMATION
            addSectionTitle('01. TAXPAYER INFORMATION');
            addField('Full Name', formData.tp_name);
            addField('Date of Birth', formData.tp_dob);
            addField('SSN / ITIN', formData.tp_ssn);
            addField('Phone', formData.tp_phone);
            addField('Email', formData.tp_email);
            addField('Occupation', formData.tp_occ);
            addField('ID Type', formData.tp_id_type);
            addField('ID Number', formData.tp_id_num);
            addField('ID State', formData.tp_id_state);
            addField('ID Issue Date', formData.tp_id_issue);
            addField('ID Exp Date', formData.tp_id_exp);
            addField('US Citizen', formData.tp_citizen);
            addField('Student', formData.tp_student);
            if (formData.tp_student_inst) addField('Student Institution', formData.tp_student_inst);
            yPos += sectionSpacing;
            addSeparator();
            yPos += 2;

            // SPOUSE INFORMATION
            const hasSpouse = formData.has_spouse === 'Yes';
            if (hasSpouse) {
                addSectionTitle('02. SPOUSE INFORMATION');
                addField('Spouse Name', formData.sp_name);
                addField('Spouse DOB', formData.sp_dob);
                addField('Spouse SSN', formData.sp_ssn);
                addField('Spouse Occupation', formData.sp_ocu);
                addField('Spouse Cell', formData.sp_cell);
                addField('Spouse Email', formData.sp_email);
                addField('Spouse ID Type', formData.sp_id_type);
                addField('Spouse ID Number', formData.sp_id_num);
                addField('Spouse ID State', formData.sp_id_state);
                addField('Spouse ID Exp', formData.sp_id_exp);
                yPos += sectionSpacing;
                addSeparator();
                yPos += 2;
            }

            // ADDRESS
            addSectionTitle('03. RESIDENTIAL ADDRESS');
            addField('Street Address', formData.addr_main);
            addField('Apt/Suite', formData.addr_apt);
            addField('City', formData.addr_city);
            addField('State', formData.addr_state);
            addField('Zip Code', formData.addr_zip);
            yPos += sectionSpacing;
            addSeparator();
            yPos += 2;

            // FILING STATUS & DEPENDENTS
            addSectionTitle('04. FILING STATUS & DEPENDENTS');
            addField('Filing Status', formData.filing_status);
            addField('Has Dependents', formData.has_deps);
            
            if (formData.has_deps === 'Yes' && formData.dependents && formData.dependents.length > 0) {
                formData.dependents.forEach((dep, idx) => {
                    yPos += 4;
                    checkPageBreak(10);
                    doc.setFontSize(10);
                    doc.setFont(undefined, 'bold');
                    doc.setTextColor(titleColor);
                    doc.text(`Dependent #${idx + 1}`, margin, yPos);
                    yPos += 8;
                    doc.setTextColor(0, 0, 0);
                    
                    addField('Name', dep.name);
                    addField('DOB', dep.dob);
                    addField('SSN', dep.ssn);
                    addField('Relation', dep.relation);
                    addField('Months with you', dep.months);
                });
            }
            yPos += sectionSpacing;
            addSeparator();
            yPos += 2;

            // CHILDCARE
            if (formData.has_cc === 'Yes') {
                addSectionTitle('CHILDCARE INFORMATION');
                addField('Provider Name', formData.cc_name);
                addField('Provider Phone', formData.cc_phone);
                addField('Provider Tax ID', formData.cc_id);
                addField('Provider Address', formData.cc_addr);
                addField('Amount Paid', formData.cc_amt);
                addField('Frequency', formData.cc_freq);
                yPos += sectionSpacing;
                addSeparator();
                yPos += 2;
            }

            // QUESTIONNAIRE - TABLA CON AUTOTABLE
            addSectionTitle('INFORMATION QUESTIONNAIRE');
            
            // Preparar datos de la tabla
            const qKeys = Object.keys(formData.questionnaire || {});
            const tableRows = [];
            
            questionData.forEach((q) => {
                let answer = 'N/A';
                const id = q.toLowerCase().replace(/[^a-z0-9]/g, '_');
                
                // Buscar coincidencia en las claves
                for (const key of qKeys) {
                    const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '_');
                    const cleanId = id.toLowerCase().replace(/[^a-z0-9]/g, '_');
                    if (cleanKey.includes(cleanId) || cleanId.includes(cleanKey)) {
                        answer = formData.questionnaire[key] || 'N/A';
                        break;
                    }
                }
                
                let answerDisplay = answer === 'Yes' ? 'YES / SÍ' : answer === 'No' ? 'NO' : 'N/A';
                tableRows.push([q, answerDisplay]);
            });
            
            // Generar tabla con jspdf-autotable
            doc.autoTable({
                startY: yPos,
                head: [['TOPIC / QUESTION (TEMA / PREGUNTA)', 'ANSWER / RESPUESTA']],
                body: tableRows,
                theme: 'grid',
                headStyles: {
                    fillColor: headerBg,
                    textColor: headerText,
                    fontStyle: 'bold',
                    fontSize: 8
                },
                columnStyles: {
                    0: { cellWidth: 140, minCellHeight: 7 },  // Pregunta: 140mm con wrap
                    1: { cellWidth: 45, halign: 'center' }  // Respuesta: 45mm
                },
                styles: {
                    fontSize: 8,
                    cellPadding: 3,
                    lineColor: [200, 200, 200],
                    lineWidth: 0.1,
                    overflow: 'linebreak',
                    valign: 'middle'
                },
                alternateRowStyles: {
                    fillColor: [248, 248, 248]
                },
                didParseCell: function(data) {
                    // Colorear celdas de respuesta
                    if (data.column.index === 1 && data.section === 'body') {
                        const text = data.cell.raw;
                        
                        if (text === 'YES / SÍ') {
                            data.cell.styles.fillColor = yesBg;
                            data.cell.styles.textColor = yesText;
                            data.cell.styles.fontStyle = 'bold';
                        } else if (text === 'NO') {
                            data.cell.styles.fillColor = noBg;
                            data.cell.styles.textColor = noText;
                            data.cell.styles.fontStyle = 'bold';
                        } else {
                            data.cell.styles.fillColor = [240, 240, 240];
                            data.cell.styles.textColor = [153, 153, 153];
                        }
                    }
                }
            });
            
            yPos = doc.lastAutoTable.finalY + 10;
            
            addField('Other Income / Comments', formData.other_comments);
            addField('Payment Method', formData.fee_method);
            yPos += sectionSpacing;
            addSeparator();
            yPos += 2;

            // DIRECT DEPOSIT
            addSectionTitle('DIRECT DEPOSIT');
            addField('Bank Name', formData.bank_name);
            addField('Routing Number', formData.bank_rt);
            addField('Account Number', formData.bank_acc);
            addField('Account Type', formData.bank_type);
            yPos += sectionSpacing;
            addSeparator();
            yPos += 2;

            // SIGNATURES
            addSectionTitle('SIGNATURES');
            const sigTp = document.getElementById('sig_tp');
            const sigSp = document.getElementById('sig_sp');
            
            if (sigTp) {
                const sigTpData = sigTp.toDataURL('image/png');
                // Verificar si hay contenido real
                const hasTpSig = !sigTpData.includes('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
                
                if (hasTpSig) {
                    checkPageBreak(40);
                    doc.setFontSize(10);
                    doc.setFont(undefined, 'bold');
                    doc.setTextColor(40, 40, 40);
                    doc.text('Taxpayer Signature:', margin, yPos);
                    yPos += 8;
                    
                    doc.addImage(sigTpData, 'PNG', margin, yPos, 50, 20);
                    yPos += 22;
                    
                    addField('Signature Date', formData.sig_tp_date);
                    yPos += 6;
                }
            }

            if (hasSpouse && sigSp) {
                const sigSpData = sigSp.toDataURL('image/png');
                const hasSpSig = !sigSpData.includes('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
                
                if (hasSpSig) {
                    checkPageBreak(40);
                    doc.setFontSize(10);
                    doc.setFont(undefined, 'bold');
                    doc.setTextColor(40, 40, 40);
                    doc.text('Spouse Signature:', margin, yPos);
                    yPos += 8;
                    
                    doc.addImage(sigSpData, 'PNG', margin, yPos, 50, 20);
                    yPos += 22;
                    
                    addField('Spouse Signature Date', formData.sig_sp_date);
                }
            }

            // FOOTER
            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(7);
                doc.setTextColor(150, 150, 150);
                doc.text('─────────────────────────────────────────────────────────────────────────────', pageWidth / 2, pageHeight - 15, { align: 'center' });
                doc.setFontSize(9);
                doc.setTextColor(titleColor);
                doc.text('DLA TAX SERVICES', pageWidth / 2, pageHeight - 10, { align: 'center' });
                doc.setFontSize(7);
                doc.setTextColor(150, 150, 150);
                doc.text(`Page ${i} of ${totalPages} | © 2026 DLA Tax Services`, pageWidth / 2, pageHeight - 5, { align: 'center' });
            }

            // Generar como base64
            return doc.output('datauristring');
        }

        // Manejo del envío del formulario
        document.getElementById('fullTaxForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const loader = document.getElementById('loader');
            const loaderMessage = document.getElementById('loader-message');
            loader.classList.remove('hidden');
            
            try {
                // Recopilar datos
                loaderMessage.textContent = 'Collecting form data...';
                const formData = collectFormData();
                
                // Validar firmas
                const tpSig = document.getElementById('sig_tp');
                const hasTpSig = tpSig && !tpSig.toDataURL('image/png').includes('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
                
                if (!hasTpSig) {
                    throw new Error('Taxpayer signature is required');
                }
                
                if (formData.has_spouse === 'Yes') {
                    const spSig = document.getElementById('sig_sp');
                    const hasSpSig = spSig && !spSig.toDataURL('image/png').includes('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
                    if (!hasSpSig) {
                        throw new Error('Spouse signature is required');
                    }
                }
                
                // Generar PDF en frontend
                loaderMessage.textContent = 'Generating PDF...';
                const pdfBase64 = generatePDF(formData);
                console.log('PDF generated successfully');
                
                // Enviar al backend
                loaderMessage.textContent = 'Saving to Cloudinary...';
                const result = await sendToBackend(pdfBase64, formData);
                
                // Éxito
                loader.classList.add('hidden');
                await Swal.fire({
                    icon: 'success',
                    title: 'PDF Generated Successfully!',
                    text: 'Your form has been submitted and saved.',
                    confirmButtonColor: '#197547'
                });
                
                // Resetear formulario
                resetForm();
                
                // Mostrar enlace de descarga
                if (result.pdf_url) {
                    const downloadLink = document.createElement('a');
                    downloadLink.href = result.pdf_url;
                    downloadLink.download = `DLA_Tax_${formData.tp_name.replace(/\s+/g, '_')}_2026.pdf`;
                    downloadLink.textContent = '📄 Download PDF';
                    downloadLink.target = '_blank';
                    downloadLink.className = 'block mt-4 text-green-600 font-bold text-center';
                    
                    // Crear contenedor para el enlace
                    const linkContainer = document.createElement('div');
                    linkContainer.className = 'bg-green-50 p-4 rounded-lg mt-4';
                    linkContainer.appendChild(downloadLink);
                    document.querySelector('.bg-green-900').appendChild(linkContainer);
                }
                
            } catch (error) {
                loader.classList.add('hidden');
                console.error('Error:', error);
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'An error occurred while processing your form.',
                    confirmButtonColor: '#dc2626'
                });
            }
        });
