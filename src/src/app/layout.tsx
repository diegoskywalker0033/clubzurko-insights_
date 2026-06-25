import type {Metadata} from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'
export const metadata:Metadata={title:'ClubZurko Insights',description:'Dashboard de reclutamiento'}
export default function RootLayout({children}:{children:React.ReactNode}){
  return(<html lang="es"><body><div className="flex min-h-screen"><Sidebar/><main className="flex-1 pt-14 md:pt-0 overflow-x-hidden">{children}</main></div></body></html>)
}
