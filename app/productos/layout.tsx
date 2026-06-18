import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Maestro de Productos y Gestión de Stock | Logtay',
  description: 'Visualiza, filtra y administra el catálogo global de productos y metas de inventario por campaña en el sistema Logtay.',
};

export default function ProductosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}