import { useState, useRef, useCallback } from 'react'

const STEPS = {
  HOME: 'home',
  CAPTURE: 'capture',
  PROCESSING: 'processing',
  CONFIRM: 'confirm',
  SAVING: 'saving',
  SUCCESS: 'success',
  ERROR: 'error'
}

const COLORES = {
  primary: '#84221F',
  accent: '#E7AF19',
  white: '#FFFFFF',
  textSecondary: '#3A3A3A',
  bg: '#F5F5F5'
}

const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: COLORES.bg,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '480px',
    margin: '0 auto',
    position: 'relative'
  },
  header: {
    backgroundColor: COLORES.primary,
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  headerTitle: {
    color: COLORES.white,
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '28px',
    fontWeight: 700,
    letterSpacing: '1px'
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontFamily: "'Open Sans', sans-serif",
    fontSize: '13px',
    fontWeight: 400
  },
  accentBar: {
    height: '4px',
    backgroundColor: COLORES.accent,
    width: '100%'
  },
  content: {
    flex: 1,
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  card: {
    backgroundColor: COLORES.white,
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  vehicleChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#FFF3F3',
    border: '1.5px solid ' + COLORES.primary,
    borderRadius: '8px',
    padding: '8px 14px',
    marginBottom: '4px'
  },
  vehicleText: {
    fontFamily: "'Barlow', sans-serif",
    fontWeight: 600,
    color: COLORES.primary,
    fontSize: '18px'
  },
  sectionTitle: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: '20px',
    color: COLORES.primary,
    marginBottom: '4px'
  },
  sectionSubtitle: {
    fontFamily: "'Open Sans', sans-serif",
    fontSize: '13px',
    color: COLORES.textSecondary,
    marginBottom: '16px'
  },
  btnPrimary: {
    width: '100%',
    backgroundColor: COLORES.primary,
    color: COLORES.white,
    border: 'none',
    borderRadius: '10px',
    padding: '16px',
    fontSize: '16px',
    fontWeight: 600,
    fontFamily: "'Open Sans', sans-serif",
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    letterSpacing: '0.3px',
    transition: 'opacity 0.15s'
  },
  btnSecondary: {
    width: '100%',
    backgroundColor: COLORES.white,
    color: COLORES.primary,
    border: '2px solid ' + COLORES.primary,
    borderRadius: '10px',
    padding: '14px',
    fontSize: '16px',
    fontWeight: 600,
    fontFamily: "'Open Sans', sans-serif",
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    letterSpacing: '0.3px',
    transition: 'opacity 0.15s'
  },
  label: {
    fontFamily: "'Barlow', sans-serif",
    fontWeight: 600,
    fontSize: '13px',
    color: COLORES.textSecondary,
    marginBottom: '6px',
    display: 'block'
  },
  input: {
    width: '100%',
    border: '1.5px solid #E0E0E0',
    borderRadius: '8px',
    padding: '12px 14px',
    fontSize: '15px',
    fontFamily: "'Open Sans', sans-serif",
    color: COLORES.textSecondary,
    backgroundColor: COLORES.white,
    outline: 'none',
    transition: 'border-color 0.15s'
  },
  inputGroup: {
    marginBottom: '14px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid ' + COLORES.accent,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    margin: '0 auto'
  },
  successIcon: {
    width: '72px',
    height: '72px',
    backgroundColor: '#E8F5E9',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    fontSize: '36px'
  },
  errorBanner: {
    backgroundColor: '#FFF3F3',
    border: '1px solid ' + COLORES.primary,
    borderRadius: '8px',
    padding: '12px 16px',
    color: COLORES.primary,
    fontFamily: "'Open Sans', sans-serif",
    fontSize: '14px',
    marginBottom: '16px'
  }
}

function Header({ vehiculo }) {
  return (
    <>
      <div style={styles.header}>
        <div>
          <div style={styles.headerTitle}>JLA</div>
          <div style={styles.headerSubtitle}>Carga de Combustible</div>
        </div>
      </div>
      <div style={styles.accentBar} />
    </>
  )
}

function Spinner() {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={styles.spinner} />
      <p style={{ marginTop: '16px', fontFamily: "'Open Sans', sans-serif", color: COLORES.textSecondary, fontSize: '14px' }}>
        Procesando imagen...
      </p>
    </div>
  )
}

export default function App() {
  const [step, setStep] = useState(STEPS.HOME)
  const [vehiculo, setVehiculo] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('vehiculo') || ''
  })
  const [modoManual, setModoManual] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [datosIA, setDatosIA] = useState({
    estacion: '',
    fecha: new Date().toISOString().split('T')[0],
    litros: '',
    precio_por_litro: '',
    importe_total: '',
    tipo_combustible: ''
  })
  const [datosCondutor, setDatosConductor] = useState({
    conductor: '',
    metodo_pago: 'YPF en Ruta',
    observaciones: ''
  })
  const [errorMsg, setErrorMsg] = useState('')
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const today = new Date().toISOString().split('T')[0]

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
    setStep(STEPS.PROCESSING)
    processImage(file)
  }, [])

  const processImage = async (file) => {
    try {
      const base64 = await fileToBase64(file)
      const base64Data = base64.split(',')[1]
      const mediaType = file.type || 'image/jpeg'

      const resp = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Data, mediaType })
      })

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        throw new Error(err.error || 'Error al procesar la imagen')
      }

      const data = await resp.json()
      setDatosIA({
        estacion: data.estacion || '',
        fecha: data.fecha || today,
        litros: data.litros != null ? String(data.litros) : '',
        precio_por_litro: data.precio_por_litro != null ? String(data.precio_por_litro) : '',
        importe_total: data.importe_total != null ? String(data.importe_total) : '',
        tipo_combustible: data.tipo_combustible || ''
      })
      setModoManual(false)
      setStep(STEPS.CONFIRM)
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo procesar la imagen. Podés completar los datos manualmente.')
      setDatosIA({
        estacion: '',
        fecha: today,
        litros: '',
        precio_por_litro: '',
        importe_total: '',
        tipo_combustible: ''
      })
      setModoManual(false)
      setStep(STEPS.CONFIRM)
    }
  }

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
  })

  const handleSubmit = async () => {
    if (!datosCondutor.conductor.trim()) {
      setErrorMsg('El nombre del conductor es obligatorio.')
      return
    }
    setErrorMsg('')
    setStep(STEPS.SAVING)

    try {
      const payload = {
        vehiculo: vehiculo || '(sin vehículo)',
        conductor: datosCondutor.conductor,
        estacion: datosIA.estacion,
        fecha: datosIA.fecha,
        litros: datosIA.litros,
        precio_por_litro: datosIA.precio_por_litro,
        importe_total: datosIA.importe_total,
        tipo_combustible: datosIA.tipo_combustible,
        metodo_pago: datosCondutor.metodo_pago,
        observaciones: datosCondutor.observaciones,
        modo: modoManual ? 'Manual' : 'Auto'
      }

      const resp = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        throw new Error(err.error || 'Error al guardar los datos')
      }

      setStep(STEPS.SUCCESS)
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar. Intentá de nuevo.')
      setStep(STEPS.CONFIRM)
    }
  }

  const resetApp = () => {
    setStep(STEPS.HOME)
    setImageFile(null)
    setImagePreview(null)
    setErrorMsg('')
    setModoManual(false)
    setDatosIA({
      estacion: '',
      fecha: today,
      litros: '',
      precio_por_litro: '',
      importe_total: '',
      tipo_combustible: ''
    })
    setDatosConductor({
      conductor: '',
      metodo_pago: 'YPF en Ruta',
      observaciones: ''
    })
  }

  const startManual = () => {
    setModoManual(true)
    setErrorMsg('')
    setStep(STEPS.CONFIRM)
  }

  return (
    <div style={styles.app}>
      <style>{`
        button:active { opacity: 0.75; }
        input:focus, select:focus, textarea:focus {
          border-color: #84221F !important;
          box-shadow: 0 0 0 2px rgba(132,34,31,0.12);
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <Header vehiculo={vehiculo} />

      <div style={styles.content}>
        {/* HOME */}
        {step === STEPS.HOME && (
          <>
            <div style={styles.card}>
              <div style={{ marginBottom: '16px' }}>
                <div style={styles.sectionTitle}>Vehículo</div>
                {vehiculo ? (
                  <div style={styles.vehicleChip}>
                    <span style={{ fontSize: '20px' }}>🚛</span>
                    <span style={styles.vehicleText}>{vehiculo}</span>
                  </div>
                ) : (
                  <div style={{ ...styles.input, color: '#999', fontStyle: 'italic', padding: '10px 14px' }}>
                    Sin vehículo asignado (usá el QR del vehículo)
                  </div>
                )}
              </div>
              <div style={styles.sectionTitle}>Cargá tu ticket</div>
              <div style={styles.sectionSubtitle}>Elegí cómo querés ingresar los datos</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  style={styles.btnPrimary}
                  onClick={() => cameraInputRef.current?.click()}
                >
                  📷 Sacar foto del ticket
                </button>
                <button
                  style={styles.btnSecondary}
                  onClick={startManual}
                >
                  ✏️ Carga manual
                </button>
              </div>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
          </>
        )}

        {/* PROCESSING */}
        {step === STEPS.PROCESSING && (
          <div style={styles.card}>
            <div style={styles.sectionTitle}>Procesando imagen</div>
            <div style={styles.sectionSubtitle}>La IA está leyendo los datos del ticket...</div>
            <Spinner />
          </div>
        )}

        {/* CONFIRM */}
        {step === STEPS.CONFIRM && (
          <>
            {errorMsg && (
              <div style={styles.errorBanner}>
                ⚠️ {errorMsg}
              </div>
            )}
            {imagePreview && !modoManual && (
              <div style={styles.card}>
                <div style={styles.sectionTitle}>Foto del ticket</div>
                <img
                  src={imagePreview}
                  alt="Ticket"
                  style={{ width: '100%', borderRadius: '8px', marginTop: '8px', maxHeight: '200px', objectFit: 'cover' }}
                />
              </div>
            )}
            <div style={styles.card}>
              <div style={styles.sectionTitle}>Datos del ticket</div>
              <div style={{ ...styles.sectionSubtitle, marginBottom: '16px' }}>
                {modoManual ? 'Completá los datos manualmente' : 'Revisá y corregí si es necesario'}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Estación de servicio</label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Ej: YPF, Shell, Axion..."
                  value={datosIA.estacion}
                  onChange={e => setDatosIA(p => ({ ...p, estacion: e.target.value }))}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Fecha del ticket</label>
                <input
                  style={styles.input}
                  type="date"
                  value={datosIA.fecha}
                  onChange={e => setDatosIA(p => ({ ...p, fecha: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Litros</label>
                  <input
                    style={styles.input}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={datosIA.litros}
                    onChange={e => setDatosIA(p => ({ ...p, litros: e.target.value }))}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Precio x litro</label>
                  <input
                    style={styles.input}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={datosIA.precio_por_litro}
                    onChange={e => setDatosIA(p => ({ ...p, precio_por_litro: e.target.value }))}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Importe total ($)</label>
                <input
                  style={styles.input}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={datosIA.importe_total}
                  onChange={e => setDatosIA(p => ({ ...p, importe_total: e.target.value }))}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Tipo de combustible</label>
                <select
                  style={styles.input}
                  value={datosIA.tipo_combustible}
                  onChange={e => setDatosIA(p => ({ ...p, tipo_combustible: e.target.value }))}
                >
                  <option value="">Seleccionar...</option>
                  <option value="nafta premium">Nafta Premium</option>
                  <option value="nafta super">Nafta Super</option>
                  <option value="gasoil">Gasoil</option>
                  <option value="gasoil premium">Gasoil Premium</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.sectionTitle}>Datos del conductor</div>
              <div style={{ height: '4px' }} />

              <div style={styles.inputGroup}>
                <label style={styles.label}>Nombre del conductor *</label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Tu nombre completo"
                  value={datosCondutor.conductor}
                  onChange={e => setDatosConductor(p => ({ ...p, conductor: e.target.value }))}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Método de pago</label>
                <select
                  style={styles.input}
                  value={datosCondutor.metodo_pago}
                  onChange={e => setDatosConductor(p => ({ ...p, metodo_pago: e.target.value }))}
                >
                  <option value="YPF en Ruta">YPF en Ruta</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta</option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Observaciones (opcional)</label>
                <textarea
                  style={{ ...styles.input, resize: 'vertical', minHeight: '80px' }}
                  placeholder="Alguna aclaración adicional..."
                  value={datosCondutor.observaciones}
                  onChange={e => setDatosConductor(p => ({ ...p, observaciones: e.target.value }))}
                />
              </div>
            </div>

            <button style={styles.btnPrimary} onClick={handleSubmit}>
              ✅ Confirmar y guardar
            </button>
            <button style={{ ...styles.btnSecondary, marginBottom: '20px' }} onClick={resetApp}>
              ← Volver
            </button>
          </>
        )}

        {/* SAVING */}
        {step === STEPS.SAVING && (
          <div style={styles.card}>
            <div style={styles.sectionTitle}>Guardando...</div>
            <div style={styles.sectionSubtitle}>Enviando datos a la planilla</div>
            <Spinner />
          </div>
        )}

        {/* SUCCESS */}
        {step === STEPS.SUCCESS && (
          <div style={{ ...styles.card, textAlign: 'center', padding: '32px 20px' }}>
            <div style={styles.successIcon}>✅</div>
            <div style={{ ...styles.sectionTitle, fontSize: '24px', marginBottom: '8px' }}>
              ¡Carga registrada!
            </div>
            <p style={{ fontFamily: "'Open Sans', sans-serif", color: COLORES.textSecondary, fontSize: '14px', marginBottom: '24px' }}>
              Los datos fueron guardados correctamente en la planilla.
            </p>
            <div style={{
              backgroundColor: '#FFF9EC',
              border: '1px solid ' + COLORES.accent,
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '24px',
              textAlign: 'left'
            }}>
              <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: '13px', color: COLORES.textSecondary, marginBottom: '4px' }}>
                🚛 {vehiculo || 'Sin vehículo'} · 👤 {datosCondutor.conductor}
              </div>
              {datosIA.litros && (
                <div style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '13px', color: COLORES.textSecondary }}>
                  ⛽ {datosIA.litros}L · 💰 $ {datosIA.importe_total}
                </div>
              )}
            </div>
            <button style={styles.btnPrimary} onClick={resetApp}>
              + Nueva carga
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
