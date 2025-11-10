import { EmergencyFlowchart } from '@/types/emergency'

// Fluxograma de Infarto Agudo do Miocárdio (IAM)
export const iamFlowchart: EmergencyFlowchart = {
  id: 'iam',
  name: 'Infarto Agudo do Miocárdio (IAM)',
  description: 'Protocolo de manejo do IAM com supradesnivelamento do segmento ST',
  category: 'cardiovascular',
  priority: 'high',
  icon: 'heart',
  color: 'from-red-600 to-red-800',
  initialStep: 'start',
  finalSteps: ['discharge', 'transfer'],
  steps: {
    start: {
      id: 'start',
      title: 'Avaliação Inicial - IAM',
      description: 'Paciente com dor torácica suspeita de IAM',
      type: 'question',
      options: [
        { text: 'Dor típica + ECG alterado', nextStep: 'ecg_analysis', value: 'typical' },
        { text: 'Dor atípica', nextStep: 'atypical_pain', value: 'atypical' }
      ]
    },
    ecg_analysis: {
      id: 'ecg_analysis',
      title: 'Análise do ECG',
      description: 'Verificar presença de supradesnivelamento do segmento ST',
      type: 'question',
      critical: true,
      options: [
        { text: 'ST elevado ≥ 2mm', nextStep: 'stemi_confirmed', value: 'stemi', critical: true },
        { text: 'ST normal ou deprimido', nextStep: 'nstemi_evaluation', value: 'nstemi' }
      ]
    },
    stemi_confirmed: {
      id: 'stemi_confirmed',
      title: 'IAM com Supra-ST Confirmado',
      description: 'Iniciar protocolo de reperfusão imediata',
      type: 'action',
      critical: true,
      timeSensitive: true,
      content: `
        <div class="space-y-3">
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-500">
            <strong>URGENTE:</strong> Tempo porta-balão ≤ 90 minutos
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Monitorização cardíaca contínua</li>
            <li>Oxigenação se SpO2 < 90%</li>
            <li>Acesso venoso periférico</li>
            <li>Preparar para cateterismo</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Iniciar Medicações', nextStep: 'medications', value: 'meds', critical: true }
      ]
    },
    medications: {
      id: 'medications',
      title: 'Medicações do IAM',
      description: 'Administrar medicações conforme protocolo',
      type: 'medication',
      critical: true,
      content: `
        <div class="space-y-3">
          <div class="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
            <strong>Medicações Essenciais:</strong>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li><strong>AAS:</strong> 300mg mastigável</li>
            <li><strong>Clopidogrel:</strong> 600mg</li>
            <li><strong>Heparina:</strong> 60UI/kg (máx 4000UI)</li>
            <li><strong>Nitrato:</strong> SL se PA > 90mmHg</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Preparar Cateterismo', nextStep: 'catheterization', value: 'cath', critical: true }
      ]
    },
    catheterization: {
      id: 'catheterization',
      title: 'Cateterismo Cardíaco',
      description: 'Encaminhar para laboratório de hemodinâmica',
      type: 'procedure',
      critical: true,
      requiresSpecialist: true,
      content: `
        <div class="space-y-3">
          <div class="bg-purple-50 p-3 rounded border-l-4 border-purple-500">
            <strong>Preparativos:</strong>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Jejum de 6 horas</li>
            <li>Exames pré-operatórios</li>
            <li>Consentimento informado</li>
            <li>Preparar sala de hemodinâmica</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Transferir para Hemodinâmica', nextStep: 'transfer', value: 'transfer' }
      ]
    },
    transfer: {
      id: 'transfer',
      title: 'Transferência Realizada',
      description: 'Paciente encaminhado para cateterismo',
      type: 'result',
      content: `
        <div class="bg-green-50 p-4 rounded border-l-4 border-green-500">
          <h4 class="font-bold text-green-800">Protocolo IAM Concluído</h4>
          <p class="text-green-700">Paciente transferido para hemodinâmica dentro do tempo recomendado</p>
        </div>
      `,
      options: []
    }
  }
}

// Fluxograma de AVC
export const avcFlowchart: EmergencyFlowchart = {
  id: 'avc',
  name: 'Acidente Vascular Cerebral (AVC)',
  description: 'Protocolo de manejo do AVC isquêmico agudo',
  category: 'neurological',
  priority: 'high',
  icon: 'brain',
  color: 'from-purple-600 to-purple-800',
  initialStep: 'start',
  finalSteps: ['discharge', 'transfer'],
  steps: {
    start: {
      id: 'start',
      title: 'Avaliação Inicial - AVC',
      description: 'Paciente com sintomas neurológicos agudos',
      type: 'question',
      options: [
        { text: 'Sintomas típicos de AVC', nextStep: 'fast_assessment', value: 'typical' },
        { text: 'Sintomas atípicos', nextStep: 'differential_diagnosis', value: 'atypical' }
      ]
    },
    fast_assessment: {
      id: 'fast_assessment',
      title: 'Avaliação FAST',
      description: 'Face, Arms, Speech, Time',
      type: 'question',
      critical: true,
      options: [
        { text: 'FAST Positivo', nextStep: 'time_window', value: 'positive', critical: true },
        { text: 'FAST Negativo', nextStep: 'imaging', value: 'negative' }
      ]
    },
    time_window: {
      id: 'time_window',
      title: 'Janela Terapêutica',
      description: 'Verificar tempo desde início dos sintomas',
      type: 'question',
      critical: true,
      timeSensitive: true,
      options: [
        { text: '< 4,5 horas', nextStep: 'tpa_candidate', value: 'early', critical: true },
        { text: '4,5-6 horas', nextStep: 'thrombectomy_candidate', value: 'intermediate' },
        { text: '> 6 horas', nextStep: 'supportive_care', value: 'late' }
      ]
    },
    tpa_candidate: {
      id: 'tpa_candidate',
      title: 'Candidato a TPA',
      description: 'Avaliar critérios para trombólise',
      type: 'action',
      critical: true,
      content: `
        <div class="space-y-3">
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-500">
            <strong>Critérios para TPA:</strong>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Idade ≥ 18 anos</li>
            <li>PA < 185/110 mmHg</li>
            <li>Glicemia > 50 mg/dL</li>
            <li>Sem hemorragia ativa</li>
            <li>Sem cirurgia recente</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Critérios Atendidos', nextStep: 'tpa_administration', value: 'eligible', critical: true },
        { text: 'Critérios Não Atendidos', nextStep: 'supportive_care', value: 'ineligible' }
      ]
    },
    tpa_administration: {
      id: 'tpa_administration',
      title: 'Administração de TPA',
      description: 'Trombólise com alteplase',
      type: 'medication',
      critical: true,
      content: `
        <div class="space-y-3">
          <div class="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
            <strong>Dosagem TPA:</strong>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li><strong>Dose:</strong> 0,9 mg/kg (máx 90mg)</li>
            <li><strong>Bolus:</strong> 10% em 1 minuto</li>
            <li><strong>Infusão:</strong> 90% em 60 minutos</li>
            <li><strong>Monitorização:</strong> 24h após TPA</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Transferir para UTI', nextStep: 'transfer', value: 'transfer' }
      ]
    },
    transfer: {
      id: 'transfer',
      title: 'Transferência Realizada',
      description: 'Paciente encaminhado para unidade especializada',
      type: 'result',
      content: `
        <div class="bg-green-50 p-4 rounded border-l-4 border-green-500">
          <h4 class="font-bold text-green-800">Protocolo AVC Concluído</h4>
          <p class="text-green-700">Paciente transferido para unidade de AVC</p>
        </div>
      `,
      options: []
    }
  }
}

// Fluxograma de Sepse
export const sepsisFlowchart: EmergencyFlowchart = {
  id: 'sepsis',
  name: 'Sepse Grave e Choque Séptico',
  description: 'Protocolo de manejo da sepse conforme Surviving Sepsis Campaign',
  category: 'infectious',
  priority: 'high',
  icon: 'activity',
  color: 'from-orange-600 to-red-600',
  initialStep: 'start',
  finalSteps: ['discharge', 'transfer'],
  steps: {
    start: {
      id: 'start',
      title: 'Avaliação de Sepse',
      description: 'Paciente com suspeita de infecção',
      type: 'question',
      options: [
        { text: 'Sinais de sepse', nextStep: 'qsofa_assessment', value: 'sepsis' },
        { text: 'Sem sinais de sepse', nextStep: 'infection_treatment', value: 'infection' }
      ]
    },
    qsofa_assessment: {
      id: 'qsofa_assessment',
      title: 'Avaliação qSOFA',
      description: 'Quick SOFA Score',
      type: 'question',
      critical: true,
      options: [
        { text: 'qSOFA ≥ 2', nextStep: 'severe_sepsis', value: 'positive', critical: true },
        { text: 'qSOFA < 2', nextStep: 'infection_treatment', value: 'negative' }
      ]
    },
    severe_sepsis: {
      id: 'severe_sepsis',
      title: 'Sepse Grave Confirmada',
      description: 'Iniciar protocolo de sepse grave',
      type: 'action',
      critical: true,
      timeSensitive: true,
      content: `
        <div class="space-y-3">
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-500">
            <strong>Bundle de 1 hora:</strong>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Hemocultura antes de antibiótico</li>
            <li>Antibiótico de amplo espectro</li>
            <li>Reposição volêmica 30ml/kg</li>
            <li>Vasopressor se hipotensão persistir</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Iniciar Bundle', nextStep: 'antibiotics', value: 'bundle', critical: true }
      ]
    },
    antibiotics: {
      id: 'antibiotics',
      title: 'Antibioticoterapia',
      description: 'Administrar antibiótico de amplo espectro',
      type: 'medication',
      critical: true,
      content: `
        <div class="space-y-3">
          <div class="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
            <strong>Antibióticos Recomendados:</strong>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li><strong>Piperacilina-Tazobactam:</strong> 4,5g IV 6/6h</li>
            <li><strong>Meropenem:</strong> 1g IV 8/8h</li>
            <li><strong>Vancomicina:</strong> 15-20mg/kg IV 12/12h</li>
            <li><strong>Duração:</strong> 7-10 dias</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Monitorizar Resposta', nextStep: 'monitoring', value: 'monitor' }
      ]
    },
    monitoring: {
      id: 'monitoring',
      title: 'Monitorização Intensiva',
      description: 'Acompanhar resposta ao tratamento',
      type: 'action',
      critical: true,
      content: `
        <div class="space-y-3">
          <div class="bg-yellow-50 p-3 rounded border-l-4 border-yellow-500">
            <strong>Monitorização:</strong>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>PAM > 65 mmHg</li>
            <li>Lactato < 2 mmol/L</li>
            <li>Diurese > 0,5 ml/kg/h</li>
            <li>Hemodinâmica estável</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Transferir para UTI', nextStep: 'transfer', value: 'transfer' }
      ]
    },
    transfer: {
      id: 'transfer',
      title: 'Transferência Realizada',
      description: 'Paciente encaminhado para UTI',
      type: 'result',
      content: `
        <div class="bg-green-50 p-4 rounded border-l-4 border-green-500">
          <h4 class="font-bold text-green-800">Protocolo Sepse Concluído</h4>
          <p class="text-green-700">Paciente transferido para UTI</p>
        </div>
      `,
      options: []
    }
  }
}

// Fluxograma de Dengue (Emergência)
export const dengueFlowchart: EmergencyFlowchart = {
  id: 'dengue',
  name: 'Dengue - Classificação de Risco (Emergência)',
  description: 'Protocolo rápido de classificação e manejo inicial do paciente com suspeita de dengue.',
  category: 'infectious',
  priority: 'high',
  icon: 'activity',
  color: 'from-teal-600 to-green-700',
  initialStep: 'start',
  finalSteps: ['discharge', 'transfer', 'icu'],
  steps: {
    start: {
      id: 'start',
      title: 'Avaliação Inicial - Dengue',
      description: 'Identificar sinais de alarme ou gravidade e definir conduta.',
      type: 'question',
      options: [
        { text: 'Sem sinais de alarme/gravidade', nextStep: 'group_a', value: 'A' },
        { text: 'Sangramento/Risco social/Comorbidades', nextStep: 'group_b', value: 'B' },
        { text: 'Sinais de alarme', nextStep: 'group_c', value: 'C', critical: true },
        { text: 'Sinais de gravidade', nextStep: 'group_d', value: 'D', critical: true }
      ]
    },
    group_a: {
      id: 'group_a',
      title: 'Grupo A - Ambulatorial',
      description: 'Sem sinais de alarme ou gravidade. Hidratação oral e orientações.',
      type: 'group',
      group: 'A',
      content: `
        <ul class="list-disc pl-5 space-y-1">
          <li>Hidratação oral e antitérmicos (dipirona/paracetamol).</li>
          <li>Evitar AINEs e salicilatos.</li>
          <li>Retorno imediato se surgirem sinais de alarme.</li>
        </ul>
      `,
      options: [
        { text: 'Alta com orientações', nextStep: 'discharge', value: 'discharge' }
      ]
    },
    group_b: {
      id: 'group_b',
      title: 'Grupo B - Observação',
      description: 'Sangramento cutâneo/PL positivo, risco social ou comorbidades.',
      type: 'group',
      group: 'B',
      content: `
        <ul class="list-disc pl-5 space-y-1">
          <li>Hidratação oral enquanto aguarda hemograma.</li>
          <li>Observação e reavaliação clínica após resultados.</li>
          <li>Solicitar hemograma completo obrigatório.</li>
        </ul>
      `,
      options: [
        { text: 'Encaminhar para reavaliação', nextStep: 'transfer', value: 'observe' }
      ]
    },
    group_c: {
      id: 'group_c',
      title: 'Grupo C - Sinais de Alarme',
      description: 'Internação para hidratação venosa e monitorização.',
      type: 'action',
      critical: true,
      group: 'C',
      timeSensitive: true,
      content: `
        <div class="space-y-2">
          <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500">
            <strong>Conduta:</strong> Internar, iniciar hidratação EV, monitorizar sinais vitais e hematócrito.
          </div>
        </div>
      `,
      options: [
        { text: 'Internar e tratar', nextStep: 'transfer', value: 'admit', critical: true }
      ]
    },
    group_d: {
      id: 'group_d',
      title: 'Grupo D - Gravidade',
      description: 'Sinais de gravidade: choque, sangramento grave ou comprometimento de órgãos.',
      type: 'action',
      critical: true,
      group: 'D',
      timeSensitive: true,
      requiresSpecialist: true,
      content: `
        <div class="space-y-2">
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-600">
            <strong>Conduta imediata:</strong> Reanimação com cristaloides, hemoderivados conforme necessidade e UTI.
          </div>
        </div>
      `,
      options: [
        { text: 'Encaminhar para UTI', nextStep: 'icu', value: 'icu', critical: true }
      ]
    },
    discharge: {
      id: 'discharge',
      title: 'Alta com Orientações',
      description: 'Paciente apto para alta com hidratação oral e sinais de alerta.',
      type: 'result',
      content: `
        <div class="bg-green-50 p-4 rounded border-l-4 border-green-500">
          <h4 class="font-bold text-green-800">Protocolo Dengue Concluído</h4>
          <p class="text-green-700">Alta ambulatorial com orientações de retorno.</p>
        </div>
      `,
      options: []
    },
    transfer: {
      id: 'transfer',
      title: 'Encaminhamento/Internação',
      description: 'Paciente encaminhado para observação ou internação conforme caso.',
      type: 'result',
      content: `
        <div class="bg-blue-50 p-4 rounded border-l-4 border-blue-500">
          <h4 class="font-bold text-blue-800">Encaminhamento Realizado</h4>
          <p class="text-blue-700">Paciente sob observação/internação para manejo clínico.</p>
        </div>
      `,
      options: []
    },
    icu: {
      id: 'icu',
      title: 'UTI',
      description: 'Paciente encaminhado para unidade de terapia intensiva.',
      type: 'result',
      content: `
        <div class="bg-red-50 p-4 rounded border-l-4 border-red-600">
          <h4 class="font-bold text-red-800">Gravidade - UTI</h4>
          <p class="text-red-700">Monitorização intensiva e suporte avançado.</p>
        </div>
      `,
      options: []
    }
  }
}

// Mapa de todos os fluxogramas disponíveis
export const emergencyFlowcharts: Record<string, EmergencyFlowchart> = {
  iam: iamFlowchart,
  avc: avcFlowchart,
  sepsis: sepsisFlowchart,
  dengue: dengueFlowchart,
  // Adicionar mais fluxogramas conforme implementados
}

// Lista de categorias com fluxogramas
// Lista completa de todos os fluxogramas disponíveis
export const allFlowcharts = [
  // Hematológicos
  { id: 'anemia_hemolitica', name: 'Anemia hemolítica', category: 'hematological', implemented: false },
  
  // Infecciosos
  { id: 'arranhadura_gato', name: 'Arranhadura de gato', category: 'infectious', implemented: false },
  { id: 'candidíase', name: 'Candidíase', category: 'infectious', implemented: false },
  { id: 'dengue', name: 'Dengue', category: 'infectious', implemented: true },
  { id: 'endocardite', name: 'Endocardite Infecciosa', category: 'infectious', implemented: false },
  { id: 'gonorreia', name: 'Gonorréia', category: 'infectious', implemented: false },
  { id: 'hepatite_a', name: 'Hepatite A', category: 'infectious', implemented: false },
  { id: 'hepatite_b', name: 'Hepatite B', category: 'infectious', implemented: false },
  { id: 'hepatite_c', name: 'Hepatite C', category: 'infectious', implemented: false },
  { id: 'hepatite_delta', name: 'Hepatite Delta', category: 'infectious', implemented: false },
  { id: 'herpes_zoster', name: 'Herpes Zoster', category: 'infectious', implemented: false },
  { id: 'ivas', name: 'Infecção de vias aéreas superiores (Gripe/Resfriado)', category: 'infectious', implemented: false },
  { id: 'itu', name: 'ITU', category: 'infectious', implemented: false },
  { id: 'meningite', name: 'Meningite', category: 'infectious', implemented: false },
  { id: 'pneumonia', name: 'Pneumonia', category: 'infectious', implemented: false },
  { id: 'sifilis', name: 'Sífilis', category: 'infectious', implemented: false },
  { id: 'uretrite', name: 'Uretrite', category: 'infectious', implemented: false },
  
  // Musculoesqueléticos
  { id: 'artralgia', name: 'Artralgia', category: 'musculoskeletal', implemented: false },
  { id: 'lombalgia', name: 'Lombalgia', category: 'musculoskeletal', implemented: false },
  { id: 'mialgia', name: 'Mialgia', category: 'musculoskeletal', implemented: false },
  
  // Neurológicos
  { id: 'avc_hemorragico', name: 'AVC hemorrágico', category: 'neurological', implemented: false },
  { id: 'avci', name: 'AVCi', category: 'neurological', implemented: false },
  { id: 'cefaleia', name: 'Cefaléia', category: 'neurological', implemented: false },
  { id: 'crise_convulsiva', name: 'Crise convulsiva', category: 'neurological', implemented: false },
  { id: 'delirium', name: 'Delirium', category: 'neurological', implemented: false },
  { id: 'rebaixamento_consciencia', name: 'Rebaixamento do nível de consciência', category: 'neurological', implemented: false },
  { id: 'sindrome_guillain_barre', name: 'Síndrome de Guillain-Barré', category: 'neurological', implemented: false },
  { id: 'tce', name: 'TCE', category: 'neurological', implemented: false },
  
  // Dermatológicos
  { id: 'celulite', name: 'Celulite', category: 'dermatological', implemented: false },
  { id: 'erisipela', name: 'Erisipela', category: 'dermatological', implemented: false },
  
  // Endócrinos
  { id: 'cetoacidose_diabetica', name: 'Cetoacidose diabética', category: 'endocrine', implemented: false },
  { id: 'hiperglicemia', name: 'Hiperglicemia', category: 'endocrine', implemented: false },
  { id: 'hipoglicemia', name: 'Hipoglicemia', category: 'endocrine', implemented: false },
  
  // Gastrointestinais
  { id: 'colecistite', name: 'Colecistite', category: 'gastrointestinal', implemented: false },
  { id: 'colelitiase', name: 'Colelitíase', category: 'gastrointestinal', implemented: false },
  { id: 'diarreia', name: 'Diarréia', category: 'gastrointestinal', implemented: false },
  { id: 'disfagia', name: 'Disfagia', category: 'gastrointestinal', implemented: false },
  { id: 'doenca_hemorroidaria', name: 'Doença hemorroidária', category: 'gastrointestinal', implemented: false },
  { id: 'dor_abdominal', name: 'Dor abdominal', category: 'gastrointestinal', implemented: false },
  { id: 'epigastralgia', name: 'Epigastralgia', category: 'gastrointestinal', implemented: false },
  { id: 'hemorragia_digestiva_alta', name: 'Hemorragia Digestiva Alta', category: 'gastrointestinal', implemented: false },
  { id: 'pancreatite_aguda', name: 'Pancreatite Aguda', category: 'gastrointestinal', implemented: false },
  { id: 'vomitos', name: 'Vômitos', category: 'gastrointestinal', implemented: false },
  
  // Renais/Urológicos
  { id: 'colica_renal', name: 'Cólica Renal', category: 'renal', implemented: false },
  { id: 'disuria', name: 'Disúria', category: 'renal', implemented: false },
  { id: 'hematuria', name: 'Hematúria', category: 'renal', implemented: false },
  { id: 'torcao_testicular', name: 'Torção testicular', category: 'renal', implemented: false },
  
  // Oftalmológicos
  { id: 'conjuntivite', name: 'Conjuntivite', category: 'ophthalmological', implemented: false },
  
  // Respiratórios
  { id: 'crise_asmatica', name: 'Crise asmática/Broncoespasmo', category: 'respiratory', implemented: false },
  { id: 'dispneia', name: 'Dispnéia', category: 'respiratory', implemented: false },
  { id: 'dpoc_exacerbado', name: 'DPOC exacerbado', category: 'respiratory', implemented: false },
  { id: 'edema_agudo_pulmao', name: 'Edema Agudo de Pulmão', category: 'respiratory', implemented: false },
  { id: 'tep', name: 'TEP', category: 'respiratory', implemented: false },
  { id: 'tosse', name: 'Tosse', category: 'respiratory', implemented: false },
  
  // Psiquiátricos
  { id: 'crise_ansiedade', name: 'Crise de ansiedade', category: 'psychiatric', implemented: false },
  { id: 'surto_psicotico', name: 'Surto psicótico', category: 'psychiatric', implemented: false },
  
  // Cardiovasculares
  { id: 'derrame_pericardico', name: 'Derrame pericárdico', category: 'cardiovascular', implemented: false },
  { id: 'derrame_pleural', name: 'Derrame pleural', category: 'cardiovascular', implemented: false },
  { id: 'dor_toracica', name: 'Dor torácica', category: 'cardiovascular', implemented: false },
  { id: 'fibrilacao_atrial_estavel', name: 'Fibrilação atrial de alta resposta ventricular estável', category: 'cardiovascular', implemented: false },
  { id: 'fibrilacao_atrial_instavel', name: 'Fibrilação atrial de alta resposta ventricular instável', category: 'cardiovascular', implemented: false },
  { id: 'flutter_atrial', name: 'Flutter atrial', category: 'cardiovascular', implemented: false },
  { id: 'hipertensao', name: 'Hipertensão (Urgência e Emergência Hipertensiva)', category: 'cardiovascular', implemented: false },
  { id: 'iam', name: 'IAM', category: 'cardiovascular', implemented: true },
  { id: 'insuficiencia_cardiaca', name: 'Insuficiência Cardíaca descompensada', category: 'cardiovascular', implemented: false },
  { id: 'miocardite', name: 'Miocardite', category: 'cardiovascular', implemented: false },
  { id: 'oclusao_arterial_aguda', name: 'Oclusão Arterial Aguda', category: 'cardiovascular', implemented: false },
  { id: 'pericardite', name: 'Pericardite', category: 'cardiovascular', implemented: false },
  { id: 'tamponamento_cardiaco', name: 'Tamponamento cardíaco', category: 'cardiovascular', implemented: false },
  { id: 'taquicardia_atrial_multifocal', name: 'Taquicardia atrial multifocal', category: 'cardiovascular', implemented: false },
  { id: 'taquicardia_sinusal', name: 'Taquicardia sinusal', category: 'cardiovascular', implemented: false },
  { id: 'taquicardia_supraventricular_estavel', name: 'Taquicardia supra-ventricular estável', category: 'cardiovascular', implemented: false },
  { id: 'taquicardia_supraventricular_instavel', name: 'Taquicardia supra-ventricular instável', category: 'cardiovascular', implemented: false },
  { id: 'torsades_de_points', name: 'Torsades de points', category: 'cardiovascular', implemented: false },
  { id: 'tv_monomorfica_estavel', name: 'TV monomórfica estável', category: 'cardiovascular', implemented: false },
  { id: 'tv_monomorfica_instavel', name: 'TV monomórfica instável', category: 'cardiovascular', implemented: false },
  { id: 'tv_polimorfica', name: 'TV polimórfica', category: 'cardiovascular', implemented: false },
  { id: 'tvp', name: 'TVP', category: 'cardiovascular', implemented: false },
  
  // Distúrbios Hidroeletrolíticos (DHEL)
  { id: 'dhel_hipercalcemia', name: 'DHEL - Hipercalcemia', category: 'metabolic', implemented: false },
  { id: 'dhel_hipercalemia', name: 'DHEL - Hipercalemia', category: 'metabolic', implemented: false },
  { id: 'dhel_hipermagnesemia', name: 'DHEL - Hipermagnesemia', category: 'metabolic', implemented: false },
  { id: 'dhel_hipernatremia', name: 'DHEL - Hipernatremia', category: 'metabolic', implemented: false },
  { id: 'dhel_hipocalcemia', name: 'DHEL - Hipocalcemia', category: 'metabolic', implemented: false },
  { id: 'dhel_hipocalemia', name: 'DHEL - Hipocalemia', category: 'metabolic', implemented: false },
  { id: 'dhel_hipomagnesemia', name: 'DHEL - Hipomagnesemia', category: 'metabolic', implemented: false },
  { id: 'dhel_hiponatremia', name: 'DHEL - Hiponatremia sintomática', category: 'metabolic', implemented: false },
  
  // Ginecológicos
  { id: 'corrimento_vaginal', name: 'Corrimento vaginal', category: 'gynecological', implemented: false },
  { id: 'sangramento_vaginal', name: 'Sangramento vaginal', category: 'gynecological', implemented: false },
  
  // Gastroenterológicos
  { id: 'geca', name: 'GECA', category: 'gastrointestinal', implemented: false },
  { id: 'icteria', name: 'Icterícia', category: 'gastrointestinal', implemented: false },
  
  // Intoxicações
  { id: 'intoxicacao_alcool', name: 'Intoxicação por álcool', category: 'toxicological', implemented: false },
  { id: 'intoxicacao_chumbinho', name: 'Intoxicação por chumbinho', category: 'toxicological', implemented: false },
  { id: 'intoxicacao_cocaina', name: 'Intoxicação por cocaína', category: 'toxicological', implemented: false },
  { id: 'intoxicacao_etilenoglicol', name: 'Intoxicação por etilenoglicol', category: 'toxicological', implemented: false },
  { id: 'intoxicacao_metanol', name: 'Intoxicação por metanol', category: 'toxicological', implemented: false },
  { id: 'intoxicacao_organofosforado', name: 'Intoxicação por organofosforado', category: 'toxicological', implemented: false },
  
  // Oncológicos
  { id: 'leucemia_mieloide_aguda', name: 'Leucemia Mielóide Aguda', category: 'oncological', implemented: false },
  { id: 'linfoma_hodgkin', name: 'Linfoma de Hodgkin', category: 'oncological', implemented: false },
  { id: 'mieloma_multiplo', name: 'Mieloma múltiplo', category: 'oncological', implemented: false },
  
  // Traumatológicos/Acidentes
  { id: 'mordedura_cachorro', name: 'Mordedura de cachorro', category: 'trauma', implemented: false },
  { id: 'picada_aranha', name: 'Picada de aranha', category: 'trauma', implemented: false },
  { id: 'picada_cobras', name: 'Picada de cobras', category: 'trauma', implemented: false },
  { id: 'picada_escorpiao', name: 'Picada de escorpião', category: 'trauma', implemented: false },
  { id: 'queimaduras', name: 'Queimaduras', category: 'trauma', implemented: false },
  
  // Otorrinolaringológicos
  { id: 'otite', name: 'Otite', category: 'otorhinolaryngological', implemented: false },
  { id: 'rinite', name: 'Rinite', category: 'otorhinolaryngological', implemented: false },
  { id: 'sinusite', name: 'Sinusite', category: 'otorhinolaryngological', implemented: false },
  
  // Metabólicos
  { id: 'rabdomiolise', name: 'Rabdomiólise', category: 'metabolic', implemented: false },
  
  // Alérgicos/Imunológicos
  { id: 'reacao_alergica', name: 'Reação alérgica', category: 'allergic', implemented: false }
]

export const emergencyCategories = {
  cardiovascular: allFlowcharts.filter(f => f.category === 'cardiovascular').map(f => f.id),
  neurological: allFlowcharts.filter(f => f.category === 'neurological').map(f => f.id),
  infectious: allFlowcharts.filter(f => f.category === 'infectious').map(f => f.id),
  respiratory: allFlowcharts.filter(f => f.category === 'respiratory').map(f => f.id),
  gastrointestinal: allFlowcharts.filter(f => f.category === 'gastrointestinal').map(f => f.id),
  renal: allFlowcharts.filter(f => f.category === 'renal').map(f => f.id),
  endocrine: allFlowcharts.filter(f => f.category === 'endocrine').map(f => f.id),
  hematological: allFlowcharts.filter(f => f.category === 'hematological').map(f => f.id),
  musculoskeletal: allFlowcharts.filter(f => f.category === 'musculoskeletal').map(f => f.id),
  dermatological: allFlowcharts.filter(f => f.category === 'dermatological').map(f => f.id),
  ophthalmological: allFlowcharts.filter(f => f.category === 'ophthalmological').map(f => f.id),
  psychiatric: allFlowcharts.filter(f => f.category === 'psychiatric').map(f => f.id),
  metabolic: allFlowcharts.filter(f => f.category === 'metabolic').map(f => f.id),
  gynecological: allFlowcharts.filter(f => f.category === 'gynecological').map(f => f.id),
  toxicological: allFlowcharts.filter(f => f.category === 'toxicological').map(f => f.id),
  oncological: allFlowcharts.filter(f => f.category === 'oncological').map(f => f.id),
  trauma: allFlowcharts.filter(f => f.category === 'trauma').map(f => f.id),
  otorhinolaryngological: allFlowcharts.filter(f => f.category === 'otorhinolaryngological').map(f => f.id),
  allergic: allFlowcharts.filter(f => f.category === 'allergic').map(f => f.id)
}

// Função para obter fluxograma por ID
export const getFlowchartById = (id: string): EmergencyFlowchart | null => {
  return emergencyFlowcharts[id] || null
}

// Função para listar fluxogramas por categoria
export const getFlowchartsByCategory = (category: string): EmergencyFlowchart[] => {
  const flowchartIds = emergencyCategories[category as keyof typeof emergencyCategories] || []
  return flowchartIds.map(id => emergencyFlowcharts[id]).filter(Boolean)
}

// Função para listar todos os fluxogramas
export const getAllFlowcharts = (): EmergencyFlowchart[] => {
  return Object.values(emergencyFlowcharts)
}