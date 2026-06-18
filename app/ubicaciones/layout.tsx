// app/ubicaciones/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mapeo de Almacenes y Gestión de Ubicaciones | Logtay',
  description: 'Organiza, limpia y actualiza mediante archivos CSV los puntos de control y ubicaciones físicas de inventario en la plataforma logística Logtay.',
};

export default function UbicacionesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}
