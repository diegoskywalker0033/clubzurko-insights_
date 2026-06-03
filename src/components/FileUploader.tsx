'use client'

import { useCallback, useState } from 'react'
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react'
import { useDashboardStore } from '@/lib/store'
import { parseExcelReclutamiento } from '@/lib/kpis'
import clsx from 'clsx'

export default function FileUploader() {
  const { setRawData, setUploaded, isUploaded, fileName } = useDashboardStore()
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('Solo se aceptan archivos Excel (.xlsx)'); return
    }
    setLoading(true); setError(null)
    try {
      const data = await parseExcelReclutamiento(file)
      if (data.length === 0) throw new Error('No se encontraron datos válidos')
      setRawData(data); setUploaded(file.name)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al leer el archivo')
    } finally { setLoading(false) }
  }, [setRawData, setUploaded])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  if (isUploaded) {
    return (
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
        <CheckCircle2 size={16} className="text-green-600 shrink-0"/>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-green-800">Datos cargados</p>
          <p className="text-[11px] text-green-600 truncate">{fileName}</p>
        </div>
        <button onClick={()=>useDashboardStore.setState({isUploaded:false,fileName:'',rawData:[]})}
          className="shrink-0 text-[11px] text-green-700 underline hover:no-underline">
          Cambiar
        </button>
      </div>
    )
  }

  return (
    <div>
      <label
        onDragOver={e=>{e.preventDefault();setDragging(true)}}
        onDragLeave={()=>setDragging(false)}
        onDrop={onDrop}
        className={clsx(
          'flex flex-col items-center gap-2 border-2 border-dashed rounded-lg px-4 py-4 cursor-pointer transition-colors',
          dragging ? 'border-brand-red bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300',
        )}>
        {loading ? (
          <div className="flex items-center gap-2 text-zurko-dark">
            <div className="w-4 h-4 border-2 border-brand-red border-t-transparent rounded-full animate-spin"/>
            <span className="text-xs">Procesando...</span>
          </div>
        ) : (
          <>
            <FileSpreadsheet size={20} className="text-zurko-light shrink-0"/>
            <div className="text-center">
              <p className="text-xs font-medium text-zurko-black">
                Sube <span className="text-brand-red">MÉTRICAS_PRESUPUESTO.xlsx</span>
              </p>
              <p className="text-[11px] text-zurko-dark mt-0.5">Toca para seleccionar</p>
            </div>
            <Upload size={12} className="text-zurko-light"/>
          </>
        )}
        <input type="file" accept=".xlsx,.xls" onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f)}} className="hidden"/>
      </label>
      {error && (
        <div className="flex items-center gap-2 mt-2 text-xs text-red-600">
          <AlertCircle size={12}/>{error}
        </div>
      )}
    </div>
  )
}
