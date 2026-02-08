# Guía de Despliegue - Backend DLA Tax Services

## Opción 1: Google Cloud Run (Recomendado - Gratis)

### Requisitos previos
- Cuenta de Google Cloud (gratis con créditos iniciales)
- Google Cloud CLI instalado
- Proyecto de Google Cloud creado

### Pasos

#### 1. Crear Service Account en Google Cloud

```bash
# Ir a Google Cloud Console
# Proyecto → Credenciales → Crear credenciales → Cuenta de servicio

# O usar gcloud CLI:
gcloud iam service-accounts create dla-tax-backend \
  --display-name="DLA Tax Backend Service Account"

# Crear clave JSON
gcloud iam service-accounts keys create key.json \
  --iam-account=dla-tax-backend@PROJECT_ID.iam.gserviceaccount.com
```

#### 2. Compartir carpeta de Google Drive con Service Account

1. Abre la carpeta en Google Drive donde quieres guardar los PDFs
2. Haz clic en "Compartir"
3. Copia el email de la Service Account: `dla-tax-backend@PROJECT_ID.iam.gserviceaccount.com`
4. Comparte la carpeta con permiso "Editor"
5. Copia el ID de la carpeta de la URL: `https://drive.google.com/drive/folders/AQUI_VA_EL_ID`

#### 3. Preparar credenciales para Cloud Run

```bash
# Convertir key.json a Base64
cat key.json | base64 -w 0 > key.json.b64

# Copiar el contenido de key.json.b64
cat key.json.b64
```

#### 4. Desplegar en Cloud Run

```bash
# Desde la carpeta backend/

# Construir imagen
gcloud builds submit --tag gcr.io/PROJECT_ID/dla-tax-backend

# Desplegar
gcloud run deploy dla-tax-backend \
  --image gcr.io/PROJECT_ID/dla-tax-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DRIVE_FOLDER_ID=1niuJ-p1SjgtwShG6Sy2L0LosyRrJ2OjK \
  --set-env-vars GOOGLE_APPLICATION_CREDENTIALS_JSON="$(cat key.json.b64 | base64 -d | base64)"
```

#### 5. Obtener URL del servicio

```bash
gcloud run services describe dla-tax-backend --region us-central1
```

Copia la URL (algo como: `https://dla-tax-backend-xxxxx.a.run.app`)

---

## Opción 2: Render (Alternativa simple - Gratis)

### Pasos

1. Ir a https://render.com y crear cuenta
2. Conectar repositorio de GitHub
3. Crear nuevo "Web Service"
4. Configurar:
   - **Name**: dla-tax-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`
   - **Plan**: Free

5. Agregar variables de entorno:
   - `DRIVE_FOLDER_ID`: Tu ID de carpeta
   - `GOOGLE_APPLICATION_CREDENTIALS_JSON`: El contenido Base64 del key.json

6. Deploy

Render te dará una URL como: `https://dla-tax-backend.onrender.com`

---

## Opción 3: Desarrollo Local

### Requisitos
- Node.js 18+
- npm

### Pasos

```bash
# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env

# Editar .env con tus valores:
# - DRIVE_FOLDER_ID
# - GOOGLE_APPLICATION_CREDENTIALS (ruta al key.json)

# Iniciar servidor
npm start

# O con nodemon (desarrollo)
npm run dev
```

El servidor estará en `http://localhost:8080`

---

## Actualizar Frontend

Una vez tengas la URL del backend, actualiza tu `app.js`:

```javascript
// Reemplaza la URL de Google Apps Script con la del backend
const API_URL = 'https://tu-backend-url.com/api/forms';

async function sendToGoogleDrive(formData) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  const result = await response.json();
  if (result.success) {
    console.log('Archivo guardado:', result.fileUrl);
    console.log('Carpeta:', result.folderUrl);
  }
  return result.success;
}
```

---

## Verificar que funciona

```bash
# Health check
curl https://tu-backend-url.com/health

# Respuesta esperada:
# {"ok":true,"message":"Backend DLA Tax activo"}
```

---

## Costos

- **Google Cloud Run**: 2 millones de invocaciones/mes gratis (más que suficiente)
- **Render**: Gratis con limitaciones (suficiente para este caso)
- **Google Drive API**: Gratis (con tu cuenta de Google)

---

## Solución de problemas

### Error: "DRIVE_FOLDER_ID no está configurado"
- Verifica que la variable de entorno esté configurada en Cloud Run/Render

### Error: "No se encontraron credenciales de Google"
- Asegúrate de que GOOGLE_APPLICATION_CREDENTIALS_JSON esté en Base64
- Verifica que el key.json sea válido

### Error: "Permiso denegado" al subir a Drive
- Comparte la carpeta con el email de la Service Account
- Asegúrate de dar permiso "Editor"

### El PDF se ve vacío
- Verifica que los datos del formulario se estén enviando correctamente
- Revisa los logs en Cloud Run/Render

---

## Monitoreo

### Cloud Run
```bash
gcloud run services describe dla-tax-backend --region us-central1
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=dla-tax-backend" --limit 50
```

### Render
- Dashboard de Render muestra logs en tiempo real

---

## Próximos pasos

1. Desplegar backend en Cloud Run o Render
2. Obtener URL del servicio
3. Actualizar app.js con la nueva URL
4. Probar formulario completo
5. Verificar que los PDFs se guardan en Google Drive
