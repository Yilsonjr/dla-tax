# Configuración de Google Apps Script para Guardar Formularios en Google Drive

## PROBLEMA RESUELTO
- ✅ PDF ahora tiene formato profesional con espaciado adecuado
- ✅ Secciones claramente delimitadas
- ✅ Mejor legibilidad

## PASOS PARA CONFIGURAR GOOGLE DRIVE

### PASO 1: Crear una Carpeta en Google Drive

1. Ve a [Google Drive](https://drive.google.com)
2. Haz clic en "Crear" → "Carpeta"
3. Nombra la carpeta: `DLA Tax Forms 2026`
4. Abre la carpeta
5. **Copia el ID de la carpeta de la URL:**
   - URL: `https://drive.google.com/drive/folders/1ABC123XYZ...`
   - ID: `1ABC123XYZ...` (la parte después de `/folders/`)
6. **Guarda este ID**, lo necesitarás en el Paso 3

---

### PASO 2: Crear el Google Apps Script

1. Ve a [script.google.com](https://script.google.com)
2. Haz clic en "Nuevo proyecto"
3. Nombra el proyecto: `DLA Tax Form Handler`
4. **Elimina todo el código por defecto**
5. **Copia TODO el código del archivo `GOOGLE_APPS_SCRIPT_IMPROVED.gs`** (que está en tu proyecto)
6. **Pégalo en el editor de Google Apps Script**
7. Guarda el proyecto (Ctrl+S)

---

### PASO 3: Configurar el ID de la Carpeta

1. En el editor de Google Apps Script, busca esta línea:
   ```javascript
   const DRIVE_FOLDER_ID = 'TU_ID_DE_CARPETA_AQUI';
   ```

2. Reemplaza `TU_ID_DE_CARPETA_AQUI` con el ID que copiaste en el PASO 1
   - Ejemplo:
   ```javascript
   const DRIVE_FOLDER_ID = '1ABC123XYZ456DEF789GHI';
   ```

3. Guarda el proyecto

---

### PASO 4: Hacer el Script Público (Deployment)

1. En Google Apps Script, haz clic en "Deploy" (arriba a la derecha)
2. Selecciona "New deployment"
3. Haz clic en el icono de engranaje y selecciona "Web app"
4. Configura:
   - **Execute as:** Tu cuenta de Google
   - **Who has access:** Anyone
5. Haz clic en "Deploy"
6. **Copia la URL de deployment** que aparece (se verá como):
   ```
   https://script.google.com/macros/d/1ABC123XYZ.../usercontent
   ```
7. **Guarda esta URL**, la necesitarás en el Paso 5

---

### PASO 5: Configurar la URL en el Formulario

1. Abre el archivo `index.html` de tu proyecto
2. Busca esta línea (cerca del inicio del formulario):
   ```html
   <input type="hidden" id="google_script_url" value="">
   ```
3. Pega la URL que copiaste en el Paso 4:
   ```html
   <input type="hidden" id="google_script_url" value="https://script.google.com/macros/d/1ABC123XYZ.../usercontent">
   ```
4. Guarda el archivo

---

### PASO 6: Probar la Integración

1. Abre tu formulario en el navegador
2. Llena todos los campos requeridos
3. Dibuja una firma
4. Presiona "SUBMIT & GENERATE PDF / ENVIAR"
5. Verifica que:
   - ✅ Se descargue un PDF con formato profesional
   - ✅ Se muestre el mensaje de éxito
   - ✅ El formulario se limpie automáticamente
   - ✅ El PDF aparezca en tu carpeta de Google Drive

---

## SOLUCIÓN DE PROBLEMAS

### El PDF no se guarda en Google Drive

**Causa:** La URL de Google Apps Script no está configurada correctamente

**Solución:**
1. Verifica que la URL en `index.html` sea correcta
2. Asegúrate de que termina con `/usercontent`
3. Prueba nuevamente

### Error de permisos

**Causa:** Google necesita permisos para acceder a Drive

**Solución:**
1. Cuando ejecutes el script por primera vez, Google te pedirá permisos
2. Haz clic en "Permitir"
3. Selecciona tu cuenta de Google
4. Haz clic en "Permitir" nuevamente

### El PDF se ve vacío

**Causa:** Los datos no se están enviando correctamente

**Solución:**
1. Abre la consola del navegador (F12)
2. Busca errores en la pestaña "Console"
3. Verifica que la URL de Google Apps Script sea correcta

---

## CARACTERÍSTICAS IMPLEMENTADAS

✅ **PDF con formato profesional:**
- Encabezado con logo de DLA TAX SERVICES
- Secciones claramente delimitadas
- Espaciado adecuado entre campos
- Separadores visuales

✅ **Almacenamiento automático:**
- Los PDFs se guardan en Google Drive
- Nombres de archivo con nombre del cliente y timestamp
- Fácil de organizar y buscar

✅ **Datos en hoja de cálculo (opcional):**
- Los datos también se pueden guardar en Google Sheets
- Facilita el análisis y seguimiento

---

## NOTAS IMPORTANTES

- Los PDFs se guardan con el nombre del cliente y un timestamp
- El formulario se limpia automáticamente después de enviar
- Se genera un PDF local (descarga) Y se guarda en Google Drive
- Los datos sensibles (SSN, números de cuenta) se guardan de forma segura

---

## CONTACTO Y SOPORTE

Si tienes problemas:
1. Verifica que todos los IDs estén correctos
2. Asegúrate de que la carpeta de Google Drive tenga permisos de escritura
3. Revisa la consola del navegador para errores
