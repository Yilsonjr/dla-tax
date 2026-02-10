

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

        // Envío a backend Node.js/Express
        // URL del backend desplegado en Render
        const BACKEND_URL = 'https://dla-tax.onrender.com/api/forms';
        
        async function sendToGoogleDrive(formData) {
            try {
                console.log('Enviando datos al backend...');
                const response = await fetch(BACKEND_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                
                const result = await response.json();
                console.log('Respuesta del backend:', response.status, result);
                
                if (!response.ok || !result.success) {
                    throw new Error(result.message || 'Error del backend');
                }
                
                console.log('Archivo guardado:', result.fileName);
                console.log('fileUrl:', result.fileUrl);
                console.log('folderUrl:', result.folderUrl);
                
                return true;
            } catch (error) {
                console.error('Error enviando al backend:', error);
                return false;
            }
        }



        function generatePDF() {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
            let yPos = 20;
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;
            const labelColumn = margin;
            const valueColumn = margin + 60;
            const lineHeight = 8;
            const sectionSpacing = 12;

            // Función para verificar y agregar página
            const checkPageBreak = (space = 15) => {
                if (yPos + space > pageHeight - 15) {
                    doc.addPage();
                    yPos = 20;
                }
            };

            // Agregar línea separadora
            const addSeparator = () => {
                checkPageBreak(8);
                doc.setDrawColor(100, 100, 100);
                doc.line(margin, yPos, pageWidth - margin, yPos);
                yPos += 8;
            };

            // Agregar título de sección
            const addSectionTitle = (title) => {
                checkPageBreak(12);
                doc.setFontSize(11);
                doc.setFont(undefined, 'bold');
                doc.setTextColor(25, 118, 75);
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
            doc.setTextColor(25, 118, 75);
            doc.text('DLA TAX SERVICES', margin, yPos);
            yPos += 10;
            
            doc.setFontSize(14);
            doc.setTextColor(50, 50, 50);
            doc.text('TAXPAYER INTAKE FORM 2026', margin, yPos);
            yPos += 12;
            
            addSeparator();
            yPos += 2;

            // INITIAL SETUP
            addSectionTitle('INITIAL SETUP');
            addField('Preparation Date', document.getElementById('form_date').value);
            addField('Prior Client', document.getElementById('prior_client').value);
            addField('Referral', document.getElementById('referral').value);
            yPos += sectionSpacing;
            addSeparator();
            yPos += 2;

            // TAXPAYER INFORMATION
            addSectionTitle('01. TAXPAYER INFORMATION');
            addField('Full Name', document.getElementById('tp_name').value);
            addField('Date of Birth', document.getElementById('tp_dob').value);
            addField('SSN / ITIN', document.getElementById('tp_ssn').value);
            addField('Phone', document.getElementById('tp_phone').value);
            addField('Email', document.getElementById('tp_email').value);
            addField('Occupation', document.getElementById('tp_occ').value);
            addField('ID Type', document.getElementById('tp_id_type').value);
            addField('ID Number', document.getElementById('tp_id_num').value);
            addField('ID State', document.getElementById('tp_id_state').value);
            addField('ID Issue Date', document.getElementById('tp_id_issue').value);
            addField('ID Exp Date', document.getElementById('tp_id_exp').value);
            addField('US Citizen', document.querySelector('input[name="tp_citizen"]:checked')?.value || '');
            addField('Student', document.querySelector('input[name="tp_student"]:checked')?.value || '');
            addField('Student Institution', document.getElementById('tp_student_inst').value);
            yPos += sectionSpacing;
            addSeparator();
            yPos += 2;

            // SPOUSE INFORMATION
            const hasSpouse = document.querySelector('input[name="has_spouse"]:checked')?.value === 'Yes';
            if (hasSpouse) {
                addSectionTitle('02. SPOUSE INFORMATION');
                addField('Spouse Name', document.getElementById('sp_name').value);
                addField('Spouse DOB', document.getElementById('sp_dob').value);
                addField('Spouse SSN', document.getElementById('sp_ssn').value);
                addField('Spouse Occupation', document.getElementById('sp_ocu').value);
                addField('Spouse Cell', document.getElementById('sp_cell').value);
                addField('Spouse Email', document.getElementById('sp_email').value);
                addField('Spouse ID Type', document.getElementById('sp_id_type').value);
                addField('Spouse ID Number', document.getElementById('sp_id_num').value);
                addField('Spouse ID State', document.getElementById('sp_id_state').value);
                addField('Spouse ID Exp', document.getElementById('sp_id_exp').value);
                yPos += sectionSpacing;
                addSeparator();
                yPos += 2;
            }

            // ADDRESS
            addSectionTitle('03. RESIDENTIAL ADDRESS');
            addField('Street Address', document.getElementById('addr_main').value);
            addField('Apt/Suite', document.getElementById('addr_apt').value);
            addField('City', document.getElementById('addr_city').value);
            addField('State', document.getElementById('addr_state').value);
            addField('Zip Code', document.getElementById('addr_zip').value);
            yPos += sectionSpacing;
            addSeparator();
            yPos += 2;

            // FILING STATUS & DEPENDENTS
            addSectionTitle('04. FILING STATUS & DEPENDENTS');
            addField('Filing Status', document.getElementById('filing_status').value);
            addField('Has Dependents', document.querySelector('input[name="has_deps"]:checked')?.value || '');
            
            const hasDeps = document.querySelector('input[name="has_deps"]:checked')?.value === 'Yes';
            if (hasDeps) {
                const depsContainer = document.getElementById('deps_container');
                Array.from(depsContainer.children).forEach((child, idx) => {
                    yPos += 4;
                    checkPageBreak(10);
                    doc.setFontSize(10);
                    doc.setFont(undefined, 'bold');
                    doc.setTextColor(25, 118, 75);
                    doc.text(`Dependent #${idx + 1}`, margin, yPos);
                    yPos += 8;
                    doc.setTextColor(0, 0, 0);
                    
                    addField('Name', child.querySelector('.dep-name').value);
                    addField('DOB', child.querySelector('.dep-dob').value);
                    addField('SSN', child.querySelector('.dep-ssn').value);
                    addField('Relation', child.querySelector('.dep-rel').value);
                    addField('Months with you', child.querySelector('.dep-months').value);
                });
            }
            yPos += sectionSpacing;
            addSeparator();
            yPos += 2;

            // CHILDCARE
            const hasCC = document.querySelector('input[name="has_cc"]:checked')?.value === 'Yes';
            if (hasCC) {
                addSectionTitle('CHILDCARE INFORMATION');
                addField('Provider Name', document.getElementById('cc_name').value);
                addField('Provider Phone', document.getElementById('cc_phone').value);
                addField('Provider Tax ID', document.getElementById('cc_id').value);
                addField('Provider Address', document.getElementById('cc_addr').value);
                addField('Amount Paid', document.getElementById('cc_amt').value);
                addField('Frequency', document.getElementById('cc_freq').value);
                yPos += sectionSpacing;
                addSeparator();
                yPos += 2;
            }

            // QUESTIONNAIRE
            addSectionTitle('INFORMATION QUESTIONNAIRE');
            questionData.forEach(q => {
                const id = q.toLowerCase().replace(/[^a-z0-9]/g, '_');
                const answer = document.querySelector(`input[name="q_${id}"]:checked`)?.value || '';
                addField(q, answer);
            });
            addField('Other Income / Comments', document.getElementById('other_comments').value);
            addField('Payment Method', document.getElementById('fee_method').value);
            yPos += sectionSpacing;
            addSeparator();
            yPos += 2;

            // DIRECT DEPOSIT
            addSectionTitle('DIRECT DEPOSIT');
            addField('Bank Name', document.getElementById('bank_name').value);
            addField('Routing Number', document.getElementById('bank_rt').value);
            addField('Account Number', document.getElementById('bank_acc').value);
            addField('Account Type', document.querySelector('input[name="bank_type"]:checked')?.value || '');
            yPos += sectionSpacing;
            addSeparator();
            yPos += 2;

            // SIGNATURES
            addSectionTitle('SIGNATURES');
            const sigTp = document.getElementById('sig_tp');
            const sigSp = document.getElementById('sig_sp');
            
            if (sigTp && sigTp.toDataURL() !== 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==') {
                checkPageBreak(30);
                doc.setFontSize(10);
                doc.setFont(undefined, 'bold');
                doc.setTextColor(40, 40, 40);
                doc.text('Taxpayer Signature:', margin, yPos);
                yPos += 10;
                
                const sigTpImg = sigTp.toDataURL('image/png');
                doc.addImage(sigTpImg, 'PNG', margin, yPos, 50, 20);
                yPos += 25;
                
                addField('Signature Date', document.getElementById('sig_tp_date').value);
                yPos += 4;
            }

            if (hasSpouse && sigSp && sigSp.toDataURL() !== 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==') {
                checkPageBreak(30);
                doc.setFontSize(10);
                doc.setFont(undefined, 'bold');
                doc.setTextColor(40, 40, 40);
                doc.text('Spouse Signature:', margin, yPos);
                yPos += 10;
                
                const sigSpImg = sigSp.toDataURL('image/png');
                doc.addImage(sigSpImg, 'PNG', margin, yPos, 50, 20);
                yPos += 25;
                
                addField('Spouse Signature Date', document.getElementById('sig_sp_date').value);
            }

            const fileName = `DLA_Tax_Intake_${new Date().getTime()}.pdf`;
            doc.save(fileName);
        }

        document.getElementById('fullTaxForm').onsubmit = async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            
            // VALIDACIÓN: Requerir firma del contribuyente (TAXPAYER SIGNATURE)
            if (!hasSignature('sig_tp')) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Taxpayer Signature',
                    text: `Por favor, firme el formulario en "Taxpayer Signature" antes de enviar.
                    Please sign the form in "Taxpayer Signature" before submitting.`,
                    confirmButtonText: 'Accept'
                });
                return; // Detener el envío
            }
            
            document.getElementById('loader').classList.remove('hidden');
            try {
                // Recopilar datos del formulario
                const formData = collectFormData();
                
                // Enviar a Google Drive primero
                const driveSuccess = await sendToGoogleDrive(formData);
                
                // Solo generar PDF localmente si el envío al backend fue exitoso
                if (driveSuccess) {
                    generatePDF();
                }
                
                document.getElementById('loader').classList.add('hidden');

                await Swal.fire({
                    icon: 'success',
                    title: 'Enviado',
                    text: 'Tu formulario fue enviado exitosamente y guardado.',
                    confirmButtonText: 'Aceptar'
                });

                // Resetear formulario y UI asociada
                form.reset();

                // Limpiar dependientes dinámicos
                const depsContainer = document.getElementById('deps_container');
                if (depsContainer) depsContainer.innerHTML = '';

                // Ocultar secciones condicionales
                document.getElementById('spouse_section')?.classList.add('hidden');
                document.getElementById('sp_sig_card')?.classList.add('hidden');
                document.getElementById('deps_section')?.classList.add('hidden');
                document.getElementById('cc_section')?.classList.add('hidden');

                // Limpiar firmas
                clearSig('sig_tp');
                clearSig('sig_sp');

                // Restablecer selects con placeholder vacío si aplica
                document.querySelectorAll('select').forEach(s => {
                    if (s.querySelector('option[value=""]')) s.value = '';
                });

                // Asegurar radios de "No"
                const ensureChecked = (name, value) => {
                    const el = document.querySelector(`input[name="${name}"][value="${value}"]`);
                    if (el) el.checked = true;
                };
                ensureChecked('has_spouse','No');
                ensureChecked('has_deps','No');
                ensureChecked('has_cc','No');

                // Reaplicar lógica dependiente del estado
                checkSpouseLogic();
                toggleDeps();
                toggleCC();

                // Volver arriba
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (err) {
                document.getElementById('loader').classList.add('hidden');
                console.error('Error:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo generar o enviar el formulario. Inténtalo nuevamente.',
                    confirmButtonText: 'Cerrar'
                });
            }
        };
