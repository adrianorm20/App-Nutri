import { GoogleGenerativeAI, SchemaType, type Schema } from '@google/generative-ai';
import type { PlanoAlimentarSemanal } from '../components/pacientes/PlanoAlimentarSection';

// Schema rigoroso para Structured Outputs
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

export async function gerarPlanoComGemini(dadosPaciente: any): Promise<PlanoAlimentarSemanal> {
  const apiKey =
    import.meta.env.VITE_GEMINI_API_KEY ||
    import.meta.env.GEMINI_API_KEY ||
    (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '');

  if (!apiKey) {
    throw new Error('Chave da API do Gemini não configurada (VITE_GEMINI_API_KEY ou GEMINI_API_KEY no .env.local).');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const requestedModel =
    import.meta.env.VITE_GEMINI_MODEL ||
    import.meta.env.GEMINI_MODEL ||
    'gemini-3.5-flash-lite';

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
      model: 'gemini-3.5-flash-lite',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: 0.7,
      },
    });
  }

  const dadosPacienteFormatados =
    typeof dadosPaciente === 'string'
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
    const cleanText = responseText.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
    jsonParsed = JSON.parse(cleanText);
  }

  if (!jsonParsed || !Array.isArray(jsonParsed.plano_semanal) || jsonParsed.plano_semanal.length === 0) {
    throw new Error('A resposta gerada não contém a estrutura de plano semanal.');
  }

  return jsonParsed;
}

