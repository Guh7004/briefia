import './globals.css'

export const metadata = {
  title: 'BriefIA — Análise Inteligente de Documentos',
  description: 'Faça upload de relatórios, propostas e contratos e receba um resumo executivo com pontos críticos em segundos.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}
