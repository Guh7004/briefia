import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = file.name.toLowerCase()

    let text = ''

    if (fileName.endsWith('.txt')) {
      text = buffer.toString('utf-8')
    } else if (fileName.endsWith('.pdf')) {
      // For PDF, use base64 and Gemini's vision
      const base64 = buffer.toString('base64')
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: base64,
          },
        },
        'Extraia todo o texto deste documento PDF.',
      ])
      text = result.response.text()
    } else if (fileName.endsWith('.docx')) {
      const mammoth = (await import('mammoth')).default
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    } else {
      return NextResponse.json({ error: 'Formato não suportado. Use PDF, DOCX ou TXT.' }, { status: 400 })
    }

    if (!text || text.trim().length < 50) {
      return NextResponse.json({ error: 'Não foi possível extrair texto suficiente do documento.' }, { status: 400 })
    }

    // Limit text to avoid token overflow
    const truncated = text.slice(0, 12000)

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `Você é um analista financeiro e de negócios sênior. Analise o documento abaixo e responda SOMENTE em JSON válido, sem markdown, sem blocos de código, apenas o JSON puro.

Documento:
"""
${truncated}
"""

Responda com este JSON exato:
{
  "summary": "Resumo executivo em 3-4 frases claras e objetivas em português",
  "keyPoints": ["ponto crítico 1", "ponto crítico 2", "ponto crítico 3", "ponto crítico 4"],
  "questions": ["pergunta relevante 1", "pergunta relevante 2", "pergunta relevante 3"],
  "risk": "Baixo" | "Médio" | "Alto"
}`

    const result = await model.generateContent(prompt)
    const raw = result.response.text().trim()

    let parsed
    try {
      // Remove markdown code blocks if present
      const clean = raw.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim()
      parsed = JSON.parse(clean)
    } catch {
      return NextResponse.json({ error: 'Erro ao processar resposta da IA. Tente novamente.' }, { status: 500 })
    }

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('Analyze error:', err)
    return NextResponse.json({ error: 'Erro interno. Tente novamente.' }, { status: 500 })
  }
}
