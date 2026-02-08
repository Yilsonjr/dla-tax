# Backend DLA Tax Services

Backend Node.js/Express para generar y almacenar PDFs de formularios de impuestos en Google Drive.

## Características

✅ Generación de PDFs profesionales con pdfkit
✅ Almacenamiento automático en Google Drive
✅ Organización por cliente (subcarpetas)
✅ Validación de datos
✅ CORS configurado
✅ Logs detallados
✅ Listo para producción (Cloud Run, Render, etc.)

## Requisitos

- Node.js 18+
- npm
- Cuenta de Google Cloud (para Service Account)
- Carpeta en Google Drive

## Instalación

```bash
# Clonar o descargar el proyecto
cd backend

# Instalar dependencias
npm install

# Copiar archivo de configuración
cp .env.example .env

# Editar .env con tus valores
nano .env
```

## Configuración

### Variables de entorno (.env)

```
PORT=8080
DRIVE_FOLDER_ID=tu_id_de_carpeta_aqui
GOOGLE_APPLICATION_CREDENTIALS=/ruta/a/key.json
```

### Obtener credenciales de Google

1. Ir a [Google Cloud Console](https://console.cloud.google.com)
2. Crear un proyecto
3. Habilitar Google Drive API
4. Crear Service Account
5. Descargar clave JSON
6. Compartir carpeta de Drive con el email de la Service Account

Ver `DEPLOYMENT.md` para instrucciones detalladas.

## Uso local

```bash
# Iniciar servidor
npm start

# Con nodemon (desarrollo)
npm run dev
```

El servidor estará disponible en `http://localhost:8080`

### Health check

```bash
curl http://localhost:8080/health
```

### Enviar formulario

```bash
curl -X POST http://localhost:8080/api/forms \
  -H "Content-Type: application/json" \
  -d @formulario.json
```

## Despliegue

### Cloud Run (Recomendado)

```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/dla-tax-backend
gcloud run deploy dla-tax-backend \
  --image gcr.io/PROJECT_ID/dla-tax-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DRIVE_FOLDER_ID=tu_id
```

### Render

1. Conectar repositorio en Render
2. Crear Web Service
3. Configurar variables de entorno
4. Deploy

Ver `DEPLOYMENT.md` para instrucciones completas.

## Estructura del proyecto

```
backend/
├── src/
│   ├── index.js          # Servidor Express
│   ├── pdf.js            # Generación de PDFs
│   ├── drive.js          # Integración con Google Drive
│   └── validators.js     # Validación de datos
├── package.json
├── Dockerfile
├── .env.example
├── DEPLOYMENT.md         # Guía de despliegue
└── README.md
```

## API

### POST /api/forms

Recibe datos del formulario y genera PDF en Google Drive.

**Request:**
```json
{
  "tp_name": "John Doe",
  "tp_dob": "1990-01-01",
  "tp_ssn": "123-45-6789",
  "tp_phone": "555-1234",
  "tp_email": "john@example.com",
  "addr_main": "123 Main St",
  "addr_city": "New York",
  "addr_state": "NY",
  "addr_zip": "10001",
  "filing_status": "Single",
  "has_spouse": "No",
  "has_deps": "No",
  "has_cc": "No",
  "sig_tp": "data:image/png;base64,...",
  "sig_sp": "data:image/png;base64,...",
  ...
}
```

**Response (éxito):**
```json
{
  "success": true,
  "message": "Formulario guardado exitosamente en Google Drive",
  "fileName": "DLA_Tax_John_Doe_2024-01-15T10-30-45.pdf",
  "fileUrl": "https://drive.google.com/file/d/...",
  "fileId": "1ABC123...",
  "folderUrl": "https://drive.google.com/drive/folders/..."
}
```

**Response (error):**
```json
{
  "success": false,
  "message": "Error procesando formulario: ..."
}
```

### GET /health

Verifica que el servidor está activo.

**Response:**
```json
{
  "ok": true,
  "message": "Backend DLA Tax activo"
}
```

## Logs

El servidor registra todas las operaciones:

```
=== INICIO PROCESAMIENTO FORMULARIO ===
Datos validados correctamente
Cliente: John Doe
Generando PDF...
PDF generado exitosamente
Subiendo a Google Drive...
Carpeta del cliente encontrada: John_Doe
Subiendo archivo: DLA_Tax_John_Doe_2024-01-15T10-30-45.pdf a carpeta: John_Doe
Archivo subido exitosamente: DLA_Tax_John_Doe_2024-01-15T10-30-45.pdf
=== FIN PROCESAMIENTO EXITOSO ===
```

## Seguridad

- CORS configurado para dominios específicos
- Validación de datos de entrada
- Límite de tamaño de payload (10 MB)
- Sanitización de nombres de archivos
- Uso de Service Account (no credenciales de usuario)

## Costos

- **Google Cloud Run**: 2 millones de invocaciones/mes gratis
- **Google Drive API**: Gratis
- **Render**: Gratis (con limitaciones)

## Soporte

Para problemas o preguntas, revisa `DEPLOYMENT.md` o los logs del servidor.

## Licencia

MIT
