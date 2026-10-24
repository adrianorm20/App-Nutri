import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI, SchemaType, type Schema } from '@google/generative-ai';

// Interface das opções de refeições por dia
export interface DiaPlano {
  dia: string;
  refeicoes: {
    cafe_da_manha: string[];
    lanche_manha: string[];
    almoco: string[];
    lanche_tarde: string[];
    jantar: string[];
  };
}

export interface PlanoAlimentarSemanal {
  plano_semanal: DiaPlano[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configura CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Utilize POST.' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    console.error('GEMINI_API_KEY não configurada no ambiente.');
    return res.status(500).json({
      error: 'Chave da API do Gemini não configurada no servidor (GEMINI_API_KEY). Cadastre no .env.local e nas Environment Variables da Vercel.',
    });
  }

  try {
    const { dadosPaciente } = (req.body as any) || {};

    if (!dadosPaciente) {
      return res.status(400).json({ error: 'Dados do paciente não informados na requisição.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Schema rigoroso para Structured Outputs (tipo Schema do SDK)
    const schema: Schema = {
      type: SchemaType.OBJECT,
      properties: {
        plano_semanal: {
          type: SchemaType.ARRAY,
          description: 'Lista com o cardápio para os 7 dias da semana',
          items: {
            type: SchemaType.OBJECT,
            properties: {
              dia: {
                type: SchemaType.STRING,
                description: 'Nome do dia da semana (ex: Segunda-feira)',
              },
              refeicoes: {
                type: SchemaType.OBJECT,
                properties: {
                  cafe_da_manha: {
                    type: SchemaType.ARRAY,
                    description: '5 opções saudáveis para o café da manhã',
                    items: { type: SchemaType.STRING },
                  },
                  lanche_manha: {
                    type: SchemaType.ARRAY,
                    description: '5 opções práticas para o lanche da manhã',
                    items: { type: SchemaType.STRING },
                  },
                  almoco: {
                    type: SchemaType.ARRAY,
                    description: '5 opções balanceadas para o almoço brasileiro',
                    items: { type: SchemaType.STRING },
                  },
                  lanche_tarde: {
                    type: SchemaType.ARRAY,
                    description: '5 opções saudáveis para o lanche da tarde',
                    items: { type: SchemaType.STRING },
                  },
                  jantar: {
                    type: SchemaType.ARRAY,
                    description: '5 opções nutritivas e leves para o jantar',
                    items: { type: SchemaType.STRING },
                  },
                },
                required: ['cafe_da_manha', 'lanche_manha', 'almoco', 'lanche_tarde', 'jantar'],
              },
            },
            required: ['dia', 'refeicoes'],
          },
        },
      },
      required: ['plano_semanal'],
    };

    // Suporte ao modelo configurado ou os modelos Flash de alta performance do Google
    const requestedModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

    let model;
    try {
      model = genAI.getGenerativeModel({
        model: requestedModel,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 0.7,
        },
      });
    } catch {
      model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 0.7,
        },
      });
    }

    const dadosPacienteFormatados = typeof dadosPaciente === 'string'
      ? dadosPaciente
      : JSON.stringify(dadosPaciente, null, 2);

    const prompt = `Você é um nutricionista clínico profissional especialista na culinária e rotina brasileira.
Gere um plano alimentar semanal completo, saudável e diversificado com base nos dados do paciente fornecidos abaixo.

Dados do Paciente (Metas, Alergias, Restrições e Histórico):
${dadosPacienteFormatados}

# Regras Críticas de Execução:
- Você deve responder APENAS e estritamente o objeto JSON solicitado.
- Não inclua blocos de código markdown (como \`\`\`json ... \`\`\`), explicações, introduções ou textos complementares.
- Adapte o cardápio rigorosamente a quaisquer alergias ou restrições descritas nos dados.
- Utilize alimentos comuns, acessíveis e culturalmente aceitos no Brasil.
- Evite repetições monótonas de alimentos nos dias seguidos.

O formato do JSON retornado deve seguir exatamente esta estrutura:
{
  "plano_semanal": [
    {
      "dia": "Segunda-feira",
      "refeicoes": {
        "cafe_da_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_manha": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "almoco": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "lanche_tarde": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"],
        "jantar": ["Opção 1", "Opção 2", "Opção 3", "Opção 4", "Opção 5"]
      }
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let jsonParsed: PlanoAlimentarSemanal;
    try {
      jsonParsed = JSON.parse(responseText);
    } catch {
      // Limpeza de segurança caso retorne com crases ou formatação residual
      const cleanText = responseText.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
      jsonParsed = JSON.parse(cleanText);
    }

    if (!jsonParsed || !Array.isArray(jsonParsed.plano_semanal)) {
      throw new Error('A resposta gerada pelo modelo não possui o array plano_semanal.');
    }

    return res.status(200).json(jsonParsed);
  } catch (error: any) {
    console.error('Erro na Serverless Function /api/gerar-plano:', error);
    return res.status(500).json({
      error: error?.message || 'Falha ao processar e gerar o plano alimentar via IA.',
    });
  }
}
