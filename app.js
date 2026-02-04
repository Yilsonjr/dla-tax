
        const questionData = [
            "W-2 (Wages from Employer)", "1099-NEC / 1099-K (Self Employed)", "Unemployment Compensation (1099-G)",
            "Interest/Dividends (1099-INT/DIV)", "Retirement/IRA Distributions (1099-R)", "Social Security Benefits (SSA-1099)",
            "Gambling Winnings (W-2G)", "Health Insurance through Marketplace (1095-A)", "Student Loan Interest (1098-E)",
            "Mortgage Interest (1098)", "Charity Donations", "Medical/Dental Expenses",
            "Child Support Paid/Received", "Identity Theft Protection PIN (IP PIN)", "Did you receive a Refund Advance last year?",
            "Foreign Bank Accounts?", "Virtual Currency / Crypto Transactions?", "Any dependent in College? (1098-T)"
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
            const ctx = canvas.getContext('2d');
            let drawing = false;
            const resize = () => {
                const ratio = Math.max(window.devicePixelRatio || 1, 1);
                canvas.width = canvas.offsetWidth * ratio;
                canvas.height = canvas.offsetHeight * ratio;
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

        initSig('sig_tp');
        initSig('sig_sp');

        document.getElementById('fullTaxForm').onsubmit = async (e) => {
            e.preventDefault();
            document.getElementById('loader').classList.remove('hidden');
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.text("DLA TAX SERVICES - INTAKE 2026", 10, 10);
            doc.save(`DLA_Tax_Intake_2026.pdf`);
            document.getElementById('loader').classList.add('hidden');
        };