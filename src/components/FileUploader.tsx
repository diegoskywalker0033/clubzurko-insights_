'use client'
import {useCallback} from 'react'
import {useDashboardStore} from '@/lib/store'
import {parseExcelReclutamiento} from '@/lib/kpis'
import {Upload} from 'lucide-react'
export default function FileUploader(){
  const{setRawData,isUploaded,fileName}=useDashboardStore()
  const onFile=useCallback(async(file:File)=>{try{const d=await parseExcelReclutamiento(file);setRawData(d,file.name)}catch(e){alert(`Error: ${e}`)}},[setRawData])
  return(<div className={`flex items-center gap-3 border-2 border-dashed rounded-xl px-5 py-3 transition-colors ${isUploaded?'border-green-300 bg-green-50':'border-gray-200 bg-white hover:border-brand-red'}`}>
    <Upload size={16} className={isUploaded?'text-green-600':'text-zurko-dark'}/>
    <div className="flex-1 min-w-0"><p className="text-xs font-medium">{isUploaded?`✓ ${fileName}`:'Arrastra tu Excel aquí o haz clic'}</p><p className="text-[10px] text-zurko-dark mt-0.5">{isUploaded?'Datos cargados':'Hoja: SEGUIMIENTO SEMANAL PROYECTOS'}</p></div>
    <label className="cursor-pointer"><span className="text-xs text-brand-red font-medium border border-brand-red rounded-md px-3 py-1.5 hover:bg-red-50">{isUploaded?'Cambiar':'Subir'}</span><input type="file" accept=".xlsx,.xls" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)onFile(f)}}/></label>
  </div>)
}
