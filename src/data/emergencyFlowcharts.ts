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
  description: 'Fluxograma de AVC agudo espelhado no protocolo de admissão, neuroimagem e reperfusão',
  category: 'neurological',
  priority: 'high',
  icon: 'brain',
  color: 'from-purple-600 to-purple-800',
  initialStep: 'avaliacao_multiprofissional_sala_vermelha',
  finalSteps: ['tratamento_conservador_antiregante', 'trombolise_iv_alteplase', 'trombectomia'],
  steps: {
    avaliacao_multiprofissional_sala_vermelha: {
      id: 'avaliacao_multiprofissional_sala_vermelha',
      title: 'AVALIAÇÃO MULTIPROFISSIONAL NA SALA VERMELHA',
      description: 'Avaliação inicial com equipe multiprofissional',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-2 text-sm">
          <ul class="list-disc pl-5 space-y-1">
            <li>Enfermeiro</li>
            <li>Médico emergencista</li>
            <li>Médico neurologista</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Aplicar Cincinnati', nextStep: 'avaliacao_cincinnati_fast', value: 'seguir' }
      ]
    },
    avaliacao_cincinnati_fast: {
      id: 'avaliacao_cincinnati_fast',
      title: 'AVALIAÇÃO CINCINNATI (FAST)',
      description: 'Triagem clínica rápida antes da aquisição de neuroimagem',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
            <p class="font-semibold text-blue-900">ⓘ Como fazer o Cincinnati</p>
            <ul class="list-disc pl-5 mt-1 space-y-1">
              <li><strong>Face:</strong> pedir para sorrir e observar assimetria</li>
              <li><strong>Braço:</strong> elevar ambos por 10 segundos e avaliar queda unilateral</li>
              <li><strong>Fala:</strong> repetir frase simples e avaliar disartria/afasia</li>
              <li><strong>Tempo:</strong> registrar última vez visto bem</li>
            </ul>
          </div>
          <details class="bg-white border border-slate-200 rounded p-3">
            <summary class="cursor-pointer font-medium text-slate-700">ⓘ Ver demonstração em vídeo (Veo 3)</summary>
            <div class="mt-3">
              <video controls preload="metadata" class="w-full rounded-lg border border-slate-200">
                <source src="/videos/Vídeo_Simulando_AVC_com_Legenda.mp4" type="video/mp4" />
                Seu navegador não suporta vídeo HTML5.
              </video>
              <p class="text-xs text-slate-500 mt-2">Arquivo esperado: <strong>/public/videos/Vídeo_Simulando_AVC_com_Legenda.mp4</strong></p>
            </div>
          </details>
        </div>
      `,
      options: [
        { text: 'Cincinnati compatível com AVC', nextStep: 'aquisicao_neuroimagem', value: 'positivo', critical: true },
        { text: 'Cincinnati não sugestivo', nextStep: 'tratamento_conservador_antiregante', value: 'negativo' }
      ]
    },
    aquisicao_neuroimagem: {
      id: 'aquisicao_neuroimagem',
      title: 'AQUISIÇÃO DE NEUROIMAGEM',
      description: 'Definir estratégia conforme recurso do centro e tempo de sintomas',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="grid md:grid-cols-2 gap-3">
            <div class="bg-slate-50 p-3 rounded border border-slate-200">
              <strong>Centros apenas com trombólise</strong>
              <ul class="list-disc pl-5 mt-1 space-y-1">
                <li>Tempo de sintomas menor que 4,5 horas</li>
                <li>TC de crânio sem contraste</li>
              </ul>
            </div>
            <div class="bg-slate-50 p-3 rounded border border-slate-200">
              <strong>Centros com trombólise e trombectomia</strong>
              <ul class="list-disc pl-5 mt-1 space-y-1">
                <li>Tempo menor que 8 horas: TC sem contraste + Angio TC vasos intra e extracranianos</li>
                <li>Tempo entre 8 e 24 horas: Angio TC vasos intra e extracranianos + TC perfusão (se disponível) ou RM + APM</li>
              </ul>
            </div>
          </div>
        </div>
      `,
      options: [
        { text: 'Prosseguir', nextStep: 'avaliar_tc_cranio_sem_contraste', value: 'seguir' }
      ]
    },
    avaliar_tc_cranio_sem_contraste: {
      id: 'avaliar_tc_cranio_sem_contraste',
      title: 'Avaliar TC de crânio sem contraste',
      description: 'Avaliar extensão de hipodensidade e déficit neurológico',
      type: 'question',
      critical: true,
      options: [
        {
          text: 'Hipodensidade menor que 1/3 território da ACM e déficit neurológico com prejuízo na função',
          nextStep: 'tempo_sintomas_menor_45h',
          value: 'criterios_tc_ok',
          critical: true
        },
        {
          text: 'Não atende critérios',
          nextStep: 'tratamento_conservador_antiregante',
          value: 'criterios_tc_nao'
        }
      ]
    },
    tempo_sintomas_menor_45h: {
      id: 'tempo_sintomas_menor_45h',
      title: 'Tempo de sintomas menor que 4,5 horas?',
      description: 'Definir elegibilidade para trombólise IV imediata',
      type: 'question',
      critical: true,
      timeSensitive: true,
      options: [
        { text: 'Sim', nextStep: 'trombolise_iv_alteplase', value: 'sim', critical: true },
        { text: 'Não', nextStep: 'avaliar_angiotc_vasos', value: 'nao' }
      ]
    },
    trombolise_iv_alteplase: {
      id: 'trombolise_iv_alteplase',
      title: 'TROMBÓLISE IV COM ALTEPLASE',
      description: 'Realizar trombólise intravenosa',
      type: 'medication',
      critical: true,
      content: `
        <div class="space-y-2 text-sm">
          <ul class="list-disc pl-5 space-y-1">
            <li>Iniciar conforme protocolo institucional</li>
            <li>Monitorização clínica e neurológica contínua</li>
          </ul>
        </div>
      `,
      options: []
    },
    avaliar_angiotc_vasos: {
      id: 'avaliar_angiotc_vasos',
      title: 'Avaliar Angio TC de vasos intra e extracranianos',
      description: 'Pesquisar oclusão de grande vaso',
      type: 'question',
      critical: true,
      options: [
        { text: 'Prosseguir para decisão de oclusão', nextStep: 'oclusao_grande_vaso', value: 'seguir' }
      ]
    },
    oclusao_grande_vaso: {
      id: 'oclusao_grande_vaso',
      title: 'Oclusão de Grande Vaso?',
      description: 'Definir tratamento endovascular ou conservador',
      type: 'question',
      critical: true,
      options: [
        { text: 'Sim', nextStep: 'tempo_sintomas_menor_8h', value: 'sim', critical: true },
        { text: 'Não', nextStep: 'tratamento_conservador_antiregante', value: 'nao' }
      ]
    },
    tempo_sintomas_menor_8h: {
      id: 'tempo_sintomas_menor_8h',
      title: 'Tempo de sintomas menor que 8 horas?',
      description: 'Definir trombectomia imediata ou avaliação por perfusão/RM',
      type: 'question',
      critical: true,
      timeSensitive: true,
      options: [
        { text: 'Sim', nextStep: 'trombectomia', value: 'sim', critical: true },
        { text: 'Não', nextStep: 'avaliar_tc_perfusao_ou_rm', value: 'nao' }
      ]
    },
    avaliar_tc_perfusao_ou_rm: {
      id: 'avaliar_tc_perfusao_ou_rm',
      title: 'Avaliar TC Perfusão ou RM',
      description: 'Avaliar viabilidade de trombectomia na janela estendida',
      type: 'question',
      critical: true,
      options: [
        { text: 'Prosseguir para critérios', nextStep: 'criterios_trombectomia_janela_estendida', value: 'seguir' }
      ]
    },
    criterios_trombectomia_janela_estendida: {
      id: 'criterios_trombectomia_janela_estendida',
      title: 'TROMBECTOMIA SE:',
      description: 'Aplicar critérios de indicação em janela estendida',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-2 text-sm">
          <ul class="list-disc pl-5 space-y-1">
            <li>Tempo de sintomas menor que 24 horas</li>
            <li>Volume de core menor que 70 ml</li>
            <li>Razão mismatch maior que 1,8</li>
            <li>Seguir RM via protocolo</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Critérios atendidos', nextStep: 'trombectomia', value: 'sim', critical: true },
        { text: 'Critérios não atendidos', nextStep: 'tratamento_conservador_antiregante', value: 'nao' }
      ]
    },
    trombectomia: {
      id: 'trombectomia',
      title: 'TROMBECTOMIA',
      description: 'Encaminhar imediatamente para trombectomia mecânica',
      type: 'procedure',
      critical: true,
      requiresSpecialist: true,
      timeSensitive: true,
      content: `
        <div class="bg-purple-50 p-3 rounded border-l-4 border-purple-500 text-sm">
          <p>Acionar equipe neurointervencionista e centro de referência sem atraso.</p>
        </div>
      `,
      options: []
    },
    tratamento_conservador_antiregante: {
      id: 'tratamento_conservador_antiregante',
      title: 'TRATAMENTO CONSERVADOR (ANTIAGREGANTE)',
      description: 'Conduta clínica conservadora quando sem indicação de reperfusão',
      type: 'result',
      content: `
        <div class="bg-gray-50 p-4 rounded border-l-4 border-gray-500">
          <h4 class="font-bold text-gray-800">Conduta Conservadora</h4>
          <p class="text-gray-700">Seguir protocolo clínico institucional para antiagregação e suporte.</p>
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

// Fluxograma de Diarreia
export const diarreiaFlowchart: EmergencyFlowchart = {
  id: 'diarreia',
  name: 'Diarreia Aguda e Crônica',
  description: 'Protocolo para definição, classificação e manejo da diarreia.',
  category: 'gastrointestinal',
  priority: 'medium',
  icon: 'activity',
  color: 'from-amber-500 to-orange-600',
  initialStep: 'start',
  finalSteps: ['outcome', 'not_diarrhea', 'chronic_flow'],
  steps: {
    start: {
      id: 'start',
      title: 'Definição de Diarreia',
      description: 'Critérios para definição de caso',
      type: 'question',
      content: `
        <div class="space-y-3">
          <div class="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
            <strong>Critérios:</strong>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Maior ou igual a 3 evacuações em 24 horas</li>
            <li>Fezes líquidas ou amolecidas</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Preenche critérios', nextStep: 'duration', value: 'yes' },
        { text: 'Não preenche critérios', nextStep: 'not_diarrhea', value: 'no' }
      ]
    },
    not_diarrhea: {
      id: 'not_diarrhea',
      title: 'Não é Diarreia',
      description: 'Quadro não compatível com a definição de diarreia.',
      type: 'result',
      content: `
        <div class="bg-gray-50 p-4 rounded border-l-4 border-gray-500">
          <h4 class="font-bold text-gray-800">Encerrar Fluxo</h4>
          <p class="text-gray-700">Considerar outros diagnósticos diferenciais.</p>
        </div>
      `,
      options: []
    },
    duration: {
      id: 'duration',
      title: 'Classificação por Duração',
      description: 'Tempo de início dos sintomas',
      type: 'question',
      options: [
        { text: 'Menor ou igual a 14 dias (Aguda)', nextStep: 'warning_check', value: 'acute' },
        { text: 'Maior que 14 dias e menor ou igual a 30 dias (Persistente)', nextStep: 'persistent_flow', value: 'persistent' },
        { text: 'Maior que 4 semanas (Crônica)', nextStep: 'chronic_flow', value: 'chronic' }
      ]
    },
    persistent_flow: {
      id: 'persistent_flow',
      title: 'Diarreia Persistente',
      description: 'Duração entre 14 e 30 dias',
      type: 'result',
      content: `
        <div class="bg-amber-50 p-4 rounded border-l-4 border-amber-500">
          <h4 class="font-bold text-amber-800">Diarreia Persistente</h4>
          <p class="text-amber-700">Avaliar causas infecciosas persistentes, intolerâncias alimentares secundárias ou doenças inflamatórias iniciais.</p>
          <p class="mt-2 text-sm">Recomendado: Solicitar exames complementares (Hemograma, Eletrólitos, Ureia, Creatinina, Exames de fezes).</p>
        </div>
      `,
      options: [
        { text: 'Solicitar Exames', nextStep: 'exams_check', value: 'exams' }
      ]
    },
    chronic_flow: {
      id: 'chronic_flow',
      title: 'Diarreia Crônica',
      description: 'Duração maior que 4 semanas',
      type: 'result',
      content: `
        <div class="bg-purple-50 p-4 rounded border-l-4 border-purple-500">
          <h4 class="font-bold text-purple-800">Diarreia Crônica</h4>
          <p class="text-purple-700">Necessita investigação ambulatorial especializada para doenças inflamatórias intestinais, síndromes disabsortivas, neoplasias, etc.</p>
        </div>
      `,
      options: []
    },
    warning_check: {
      id: 'warning_check',
      title: 'Sinais de Alerta',
      description: 'Avaliação de gravidade obrigatória',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-3">
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-500">
            <strong>Sinais de Alerta:</strong>
          </div>
          <ul class="list-disc pl-5 space-y-1 text-sm">
            <li>Sangue nas fezes</li>
            <li>Febre maior que 38,5 ºC</li>
            <li>Maior que 6 evacuações/dia</li>
            <li>Dor abdominal intensa</li>
            <li>Vômitos persistentes</li>
            <li>Idade maior que 70 anos</li>
            <li>Imunossupressão</li>
            <li>Uso recente de antibióticos</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Sim, possui sinais de alerta', nextStep: 'severe_potential', value: 'yes', critical: true },
        { text: 'Não possui sinais de alerta', nextStep: 'hydration_assessment', value: 'no' }
      ]
    },
    severe_potential: {
      id: 'severe_potential',
      title: 'Diarreia Potencialmente Grave',
      description: 'Presença de sinais de alerta',
      type: 'action',
      critical: true,
      content: `
        <div class="bg-red-50 p-4 rounded border-l-4 border-red-500">
          <h4 class="font-bold text-red-800">Atenção</h4>
          <p class="text-red-700">Classificado como POTENCIALMENTE GRAVE. Avaliar hidratação imediatamente.</p>
        </div>
      `,
      options: [
        { text: 'Avaliar Hidratação', nextStep: 'hydration_assessment', value: 'assess' }
      ]
    },
    hydration_assessment: {
      id: 'hydration_assessment',
      title: 'Avaliação de Hidratação',
      description: 'Selecione o quadro que melhor descreve o paciente',
      type: 'question',
      content: `
        <div class="space-y-4 text-sm">
          <div class="border p-3 rounded bg-green-50">
            <strong>A) SEM DESIDRATAÇÃO</strong>
            <ul class="list-disc pl-5 mt-1">
              <li>Estado geral normal</li>
              <li>Mucosas úmidas</li>
              <li>Pulso normal</li>
              <li>Sem sinais de choque</li>
            </ul>
          </div>
          <div class="border p-3 rounded bg-yellow-50">
            <strong>B) DESIDRATAÇÃO LEVE/MODERADA</strong> (maior ou igual a 2 sinais, incl. maior ou igual a 1 chave*)
            <ul class="list-disc pl-5 mt-1">
              <li>Irritabilidade ou hipoatividade*</li>
              <li>Olhos fundos</li>
              <li>Mucosas secas</li>
              <li>Sede aumentada*</li>
              <li>Turgor cutâneo diminuído</li>
            </ul>
          </div>
          <div class="border p-3 rounded bg-red-50">
            <strong>C) DESIDRATAÇÃO GRAVE</strong> (Qualquer um)
            <ul class="list-disc pl-5 mt-1">
              <li>Letargia ou coma</li>
              <li>Incapaz de beber</li>
              <li>Pulso radial ausente</li>
              <li>Hipotensão / choque</li>
            </ul>
          </div>
        </div>
      `,
      options: [
        { text: 'Quadro A (Sem Desidratação)', nextStep: 'plan_a', value: 'A' },
        { text: 'Quadro B (Leve/Moderada)', nextStep: 'plan_b', value: 'B' },
        { text: 'Quadro C (Grave)', nextStep: 'plan_c', value: 'C', critical: true }
      ]
    },
    plan_a: {
      id: 'plan_a',
      title: 'PLANO A - Sem Desidratação',
      description: 'Tratamento Domiciliar',
      type: 'action',
      content: `
        <div class="space-y-3">
          <div class="bg-green-50 p-3 rounded border-l-4 border-green-500">
            <strong>Conduta:</strong>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Aumentar ingestão de líquidos (água, chás, sucos, água de coco)</li>
            <li>Administrar SRO após cada evacuação líquida</li>
            <li>Manter alimentação habitual</li>
            <li>Manter aleitamento materno (se aplicável)</li>
            <li>Orientar sinais de alerta (piora, vômitos, sangue, sede intensa)</li>
            <li><strong>Se criança:</strong> Prescrever ZINCO por 10–14 dias</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Avaliar necessidade de exames', nextStep: 'exams_check', value: 'exams' }
      ]
    },
    plan_b: {
      id: 'plan_b',
      title: 'PLANO B - Desidratação Leve/Moderada',
      description: 'Terapia de Reidratação Oral (TRO) na Unidade',
      type: 'action',
      timeSensitive: true,
      content: `
        <div class="space-y-3">
          <div class="bg-yellow-50 p-3 rounded border-l-4 border-yellow-500">
            <strong>Conduta:</strong>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Administrar SRO via oral na unidade de saúde</li>
            <li>Pequenos volumes, frequentes (ex: colherada ou goles)</li>
            <li>Reavaliar continuamente o estado de hidratação</li>
            <li>Se vômitos: aguardar 10min e tentar novamente mais devagar</li>
            <li><strong>Meta:</strong> Desaparecimento dos sinais de desidratação → Migrar para PLANO A</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Melhora (Ir para Plano A)', nextStep: 'plan_a', value: 'improved' },
        { text: 'Sem melhora/Piora (Ir para Plano C)', nextStep: 'plan_c', value: 'worsened', critical: true },
        { text: 'Solicitar Exames', nextStep: 'exams_check', value: 'exams' }
      ]
    },
    plan_c: {
      id: 'plan_c',
      title: 'PLANO C - Desidratação Grave',
      description: 'Reidratação Endovenosa (Urgência)',
      type: 'action',
      critical: true,
      timeSensitive: true,
      content: `
        <div class="space-y-3">
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-500">
            <strong>Conduta Imediata:</strong>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Iniciar reidratação endovenosa imediata (Ringer Lactato ou SF 0,9%)</li>
            <li>Fase rápida de expansão (conforme idade/peso)</li>
            <li>Encaminhar para hospital se necessário</li>
            <li>Reavaliar após 2 horas (ou antes se necessário)</li>
            <li>Se estabilizar e aceitar via oral: Introduzir SRO concomitante</li>
            <li>Suspender EV quando plenamente hidratado</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Estabilizou (Ir para Plano B)', nextStep: 'plan_b', value: 'stabilized' },
        { text: 'Solicitar Exames Obrigatórios', nextStep: 'exams_check', value: 'exams' }
      ]
    },
    exams_check: {
      id: 'exams_check',
      title: 'Necessidade de Exames',
      description: 'Verificar critérios para solicitação',
      type: 'question',
      content: `
        <p class="mb-2">A diarreia se enquadra em algum destes casos?</p>
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li>Sanguinolenta (Disenteria)</li>
          <li>Grave (Desidratação grave / Choque)</li>
          <li>Persistente (maior que 14 dias)</li>
          <li>Paciente Imunodeprimido</li>
          <li>Paciente Idoso</li>
        </ul>
      `,
      options: [
        { text: 'Sim (Solicitar Hemograma/Bioquímica)', nextStep: 'request_general_exams', value: 'yes' },
        { text: 'Não', nextStep: 'stool_exams_check', value: 'no' }
      ]
    },
    request_general_exams: {
      id: 'request_general_exams',
      title: 'Solicitar Exames Gerais',
      description: 'Exames laboratoriais indicados',
      type: 'action',
      content: `
        <div class="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
          <strong>Solicitar:</strong>
          <ul class="list-disc pl-5 mt-1">
            <li>Hemograma completo</li>
            <li>Eletrólitos (Na, K)</li>
            <li>Ureia e Creatinina</li>
            <li>Gasometria venosa (se sinais de acidose/gravidade)</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Prosseguir', nextStep: 'stool_exams_check', value: 'next' }
      ]
    },
    stool_exams_check: {
      id: 'stool_exams_check',
      title: 'Exames de Fezes',
      description: 'Indicações específicas',
      type: 'question',
      content: `
        <div class="space-y-2 text-sm">
          <p>Verifique as indicações:</p>
          <ul class="list-disc pl-5">
            <li><strong>Sangue nas fezes:</strong> Solicitar Coprocultura</li>
            <li><strong>Uso recente de ATB ou internação:</strong> Pesquisar Clostridium difficile (toxinas A e B)</li>
            <li><strong>Viagem recente / HIV / Creche:</strong> Pesquisa de Ovos e Parasitas (EPF)</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Exames indicados', nextStep: 'antibiotics_check', value: 'indicated' },
        { text: 'Nenhum exame indicado', nextStep: 'antibiotics_check', value: 'none' }
      ]
    },
    antibiotics_check: {
      id: 'antibiotics_check',
      title: 'Antibioticoterapia',
      description: 'Uso de antibióticos é exceção',
      type: 'question',
      content: `
        <p class="mb-2">O paciente apresenta algum destes quadros?</p>
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li>Disenteria (sangue + muco) com toxemia (febre alta, queda do estado geral)</li>
          <li>Suspeita de Cólera (diarreia aquosa profusa "água de arroz" + desidratação grave)</li>
          <li>Imunossupressão grave</li>
          <li>Sepse de foco abdominal suspeita</li>
        </ul>
      `,
      options: [
        { text: 'Sim (Considerar ATB)', nextStep: 'prescribe_abx', value: 'yes', critical: true },
        { text: 'Não (Não prescrever ATB)', nextStep: 'outcome', value: 'no' }
      ]
    },
    prescribe_abx: {
      id: 'prescribe_abx',
      title: 'Prescrição de Antibiótico',
      description: 'Selecionar conforme protocolo local',
      type: 'action',
      content: `
        <div class="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
          <strong>Opções empíricas comuns (avaliar resistência local):</strong>
          <ul class="list-disc pl-5 mt-1">
            <li><strong>Disenteria:</strong> Ciprofloxacino 500mg 12/12h (3-5d) ou Ceftriaxona (se grave)</li>
            <li><strong>Cólera:</strong> Doxiciclina ou Azitromicina</li>
            <li><strong>Giardíase/Amebíase:</strong> Metronidazol (se confirmado ou alta suspeita)</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Prosseguir', nextStep: 'outcome', value: 'next' }
      ]
    },
    outcome: {
      id: 'outcome',
      title: 'Desfecho',
      description: 'Orientações finais',
      type: 'result',
      content: `
        <div class="space-y-3">
          <div class="bg-green-50 p-3 rounded border-l-4 border-green-500">
            <strong>Se sintomas resolverem:</strong>
            <p>Alta com orientações de higiene e dieta.</p>
          </div>
          <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500">
            <strong>Se sintomas persistirem:</strong>
            <p>Reavaliar diagnóstico (Diarreia persistente ou crônica, intolerâncias, causas não infecciosas).</p>
          </div>
        </div>
      `,
      options: []
    }
  }
}

// Fluxograma de Gasometria Arterial (padrão EmergencyFlowchart)
export const gasometryFlowchart: EmergencyFlowchart = {
  id: 'gasometria',
  name: 'Gasometria Arterial',
  description: 'Interpretação estruturada de gasometria arterial com fluxo passo a passo.',
  category: 'respiratory',
  priority: 'high',
  icon: 'activity',
  color: 'from-blue-600 to-slate-700',
  initialStep: 'tipo_gasometria',
  finalSteps: [
    'gasometria_normal',
    'equilibrio_acido_base_com_hipoxemia_leve',
    'equilibrio_acido_base_com_hipoxemia_moderada',
    'equilibrio_acido_base_com_hipoxemia_grave',
    'disturbio_misto_ph_normal',
    'acidose_respiratoria_aguda',
    'acidose_respiratoria_cronica',
    'acidose_metabolica_hipercloremica',
    'acidose_metabolica_ag_alto',
    'acidose_metabolica_ag_alto_alcalose',
    'acidose_metabolica_ag_alto_acidose_normo_ag',
    'alcalose_metabolica_compensada',
    'alcalose_metabolica_mista',
    'alcalose_respiratoria_aguda',
    'alcalose_respiratoria_cronica',
    'alcalose_respiratoria_mista'
  ],
  steps: {
    tipo_gasometria: {
      id: 'tipo_gasometria',
      title: 'Tipo de Gasometria',
      description: 'Definir tipo para interpretação.',
      type: 'question',
      options: [
        { text: 'Arterial', nextStep: 'coleta_parametros', value: 'arterial' },
        { text: 'Venosa central/periférica (em construção)', nextStep: 'venosa_em_construcao', value: 'venosa' }
      ]
    },
    venosa_em_construcao: {
      id: 'venosa_em_construcao',
      title: 'Módulo Venoso em Construção',
      description: 'Fluxo venoso ainda não disponível.',
      type: 'result',
      content: `
        <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500 text-sm">
          <p>O fluxo completo implementado nesta fase é o da <strong>gasometria arterial</strong>.</p>
        </div>
      `,
      options: []
    },
    coleta_parametros: {
      id: 'coleta_parametros',
      title: 'Coleta de Parâmetros',
      description: 'Registrar os valores da gasometria arterial.',
      type: 'question',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
            <p><strong>Obrigatórios:</strong> pH, PaCO2 e HCO3.</p>
            <p><strong>Se disponíveis:</strong> PaO2, Na, Cl e albumina (úteis para oxigenação e AG).</p>
          </div>
          <div class="bg-slate-50 p-3 rounded border border-slate-200">
            <p>Henderson-Hasselbalch: pH = 6,10 + log [HCO3] / (0,03 × PaCO2)</p>
          </div>
        </div>
      `,
      options: [
        { text: 'Parâmetros registrados', nextStep: 'avaliar_ph', value: 'dados_ok' }
      ]
    },
    avaliar_ph: {
      id: 'avaliar_ph',
      title: 'Avaliar pH',
      description: 'Primeira bifurcação do fluxograma.',
      type: 'question',
      options: [
        { text: 'pH < 7,35 (Acidemia)', nextStep: 'acidemia_eixo', value: 'acidemia' },
        { text: 'pH entre 7,35 e 7,45 (pH normal)', nextStep: 'ph_normal_checar', value: 'ph_normal' },
        { text: 'pH > 7,45 (Alcalemia)', nextStep: 'alcalemia_eixo', value: 'alcalemia' }
      ]
    },
    ph_normal_checar: {
      id: 'ph_normal_checar',
      title: 'pH Normal: checar HCO3, PaCO2 e oxigenação',
      description: 'Definir equilíbrio ácido-base e classificar hipoxemia quando presente.',
      type: 'question',
      options: [
        { text: 'HCO3 e PaCO2 normais (sem hipoxemia)', nextStep: 'gasometria_normal', value: 'normal' },
        { text: 'HCO3 e/ou PaCO2 alterados', nextStep: 'disturbio_misto_ph_normal', value: 'misto' },
        { text: 'Hipoxemia Leve (PaO2 60-79)', nextStep: 'equilibrio_acido_base_com_hipoxemia_leve', value: 'hipox_leve' },
        { text: 'Hipoxemia Moderada (PaO2 40-59)', nextStep: 'equilibrio_acido_base_com_hipoxemia_moderada', value: 'hipox_mod' },
        { text: 'Hipoxemia Grave (PaO2 < 40)', nextStep: 'equilibrio_acido_base_com_hipoxemia_grave', value: 'hipox_grave' }
      ]
    },
    gasometria_normal: {
      id: 'gasometria_normal',
      title: 'Gasometria Normal',
      description: 'Equilíbrio ácido-base preservado e oxigenação adequada.',
      type: 'result',
      content: `
        <div class="bg-green-50 p-4 rounded border-l-4 border-green-500">
          <h4 class="font-bold text-green-800">Gasometria Normal</h4>
          <p class="text-green-700">pH, PaCO2 e HCO3 dentro dos limites fisiológicos.</p>
          <p class="text-green-700">PaO2 adequada (sem hipoxemia).</p>
        </div>
      `,
      options: []
    },
    equilibrio_acido_base_com_hipoxemia_leve: {
      id: 'equilibrio_acido_base_com_hipoxemia_leve',
      title: 'Equilíbrio Ácido-Base com Hipoxemia Leve',
      description: 'PaO2 entre 60 e 79 mmHg, apesar de eixo ácido-base normal.',
      type: 'result',
      content: `
        <div class="bg-yellow-50 p-4 rounded border-l-4 border-yellow-500">
          <h4 class="font-bold text-yellow-800">Hipoxemia Leve</h4>
          <p class="text-yellow-700">Equilíbrio ácido-base preservado.</p>
          <p class="text-yellow-700"><strong>Atenção:</strong> PaO2 entre 60-79 mmHg indica troca gasosa prejudicada leve.</p>
        </div>
      `,
      options: []
    },
    equilibrio_acido_base_com_hipoxemia_moderada: {
      id: 'equilibrio_acido_base_com_hipoxemia_moderada',
      title: 'Equilíbrio Ácido-Base com Hipoxemia Moderada',
      description: 'PaO2 entre 40 e 59 mmHg, com comprometimento importante de oxigenação.',
      type: 'result',
      critical: true,
      content: `
        <div class="bg-orange-50 p-4 rounded border-l-4 border-orange-500">
          <h4 class="font-bold text-orange-800">Hipoxemia Moderada</h4>
          <p class="text-orange-700">Equilíbrio ácido-base preservado.</p>
          <p class="text-orange-700"><strong>Alerta:</strong> PaO2 entre 40-59 mmHg. Necessário oxigenoterapia e monitorização.</p>
        </div>
      `,
      options: []
    },
    equilibrio_acido_base_com_hipoxemia_grave: {
      id: 'equilibrio_acido_base_com_hipoxemia_grave',
      title: 'Equilíbrio Ácido-Base com Hipoxemia Grave',
      description: 'PaO2 abaixo de 40 mmHg, situação crítica de oxigenação.',
      type: 'result',
      critical: true,
      content: `
        <div class="bg-red-50 p-4 rounded border-l-4 border-red-500">
          <h4 class="font-bold text-red-800">Hipoxemia Grave</h4>
          <p class="text-red-700">Equilíbrio ácido-base preservado.</p>
          <p class="text-red-700"><strong>CRÍTICO:</strong> PaO2 < 40 mmHg. Risco iminente de hipóxia tecidual.</p>
        </div>
      `,
      options: []
    },
    disturbio_misto_ph_normal: {
      id: 'disturbio_misto_ph_normal',
      title: 'Distúrbio Misto com pH Normal',
      description: 'pH normal com alterações compensadas em sentidos opostos.',
      type: 'result',
      options: []
    },
    acidemia_eixo: {
      id: 'acidemia_eixo',
      title: 'Acidemia: eixo principal',
      description: 'Definir acidose metabólica ou respiratória.',
      type: 'question',
      options: [
        { text: 'PaCO2 > 45 mmHg', nextStep: 'acidose_respiratoria_classificar', value: 'resp' },
        { text: 'HCO3 < 22 mEq/L', nextStep: 'acidose_metabolica_winter', value: 'met' }
      ]
    },
    acidose_respiratoria_classificar: {
      id: 'acidose_respiratoria_classificar',
      title: 'Acidose Respiratória: aguda ou crônica',
      description: 'Comparar HCO3 medido com HCO3 esperado.',
      type: 'question',
      content: `
        <div class="space-y-2 text-sm">
          <p><strong>Aguda:</strong> HCO3 esperado = 24 + [(PaCO2 - 40) / 10] (≈ +1 mEq/L por 10 mmHg).</p>
          <p><strong>Crônica:</strong> HCO3 esperado = 24 + 4×[(PaCO2 - 40) / 10] (≈ +4 mEq/L por 10 mmHg).</p>
        </div>
      `,
      options: [
        { text: 'Compatível com padrão agudo', nextStep: 'acidose_respiratoria_aguda', value: 'aguda' },
        { text: 'Compatível com padrão crônico', nextStep: 'acidose_respiratoria_cronica', value: 'cronica' }
      ]
    },
    acidose_respiratoria_aguda: {
      id: 'acidose_respiratoria_aguda',
      title: 'Acidose Respiratória Aguda',
      description: 'Compensação renal aguda.',
      type: 'result',
      options: []
    },
    acidose_respiratoria_cronica: {
      id: 'acidose_respiratoria_cronica',
      title: 'Acidose Respiratória Crônica',
      description: 'Compensação renal crônica.',
      type: 'result',
      options: []
    },
    acidose_metabolica_winter: {
      id: 'acidose_metabolica_winter',
      title: 'Acidose Metabólica: Fórmula de Winter',
      description: 'Avaliar compensação respiratória e prosseguir para cálculo do Ânion Gap.',
      type: 'question',
      content: `
        <div class="bg-slate-50 p-3 rounded border border-slate-200 text-sm">
          <p>PaCO2 esperada = 1,5 × HCO3 + 8 ± 2</p>
        </div>
      `,
      options: [
        { text: 'PaCO2 abaixo da faixa esperada (sugere alcalose respiratória associada)', nextStep: 'acidose_metabolica_ag', value: 'winter_baixo' },
        { text: 'PaCO2 dentro da faixa esperada', nextStep: 'acidose_metabolica_ag', value: 'winter_ok' },
        { text: 'PaCO2 acima da faixa esperada (sugere acidose respiratória associada)', nextStep: 'acidose_metabolica_ag', value: 'winter_alto' }
      ]
    },
    acidose_metabolica_alcalose_resp: {
      id: 'acidose_metabolica_alcalose_resp',
      title: 'Distúrbio Misto',
      description: 'Acidose metabólica + alcalose respiratória.',
      type: 'result',
      options: []
    },
    acidose_metabolica_acidose_resp: {
      id: 'acidose_metabolica_acidose_resp',
      title: 'Distúrbio Misto',
      description: 'Acidose metabólica + acidose respiratória.',
      type: 'result',
      options: []
    },
    acidose_metabolica_ag: {
      id: 'acidose_metabolica_ag',
      title: 'Ânion Gap (AG)',
      description: 'Classificar acidose metabólica por AG em normal ou elevado.',
      type: 'question',
      content: `
        <div class="space-y-2 text-sm">
          <p>AG = Na - (HCO3 + Cl)</p>
          <p>AG corrigido (Figge) = AG + [(4,0 - albumina) × 2,5]</p>
        </div>
      `,
      options: [
        { text: 'AG normal (8–12)', nextStep: 'acidose_metabolica_hipercloremica', value: 'ag_normal' },
        { text: 'AG elevado (>12)', nextStep: 'acidose_metabolica_delta_delta', value: 'ag_alto' }
      ]
    },
    acidose_metabolica_hipercloremica: {
      id: 'acidose_metabolica_hipercloremica',
      title: 'Acidose Metabólica Hiperclorêmica',
      description: 'Acidose metabólica com AG normal.',
      type: 'result',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500">
            <p><strong>Classificação:</strong> Acidose metabólica com <strong>Ânion Gap normal</strong> (hiperclorêmica).</p>
          </div>
          <div class="bg-slate-50 p-3 rounded border border-slate-200">
            <p><strong>Causas frequentes:</strong></p>
            <ul class="list-disc pl-5 mt-1 space-y-1">
              <li>Perda gastrointestinal de bicarbonato (diarreia, fístulas intestinais)</li>
              <li>Acidose tubular renal (tipos 1, 2 e 4)</li>
              <li>Infusão excessiva de solução salina 0,9%</li>
              <li>Uso de inibidor de anidrase carbônica (ex.: acetazolamida)</li>
              <li>Derivações urinárias intestinais (ex.: ureterossigmoidostomia)</li>
            </ul>
          </div>
        </div>
      `,
      options: []
    },
    acidose_metabolica_delta_delta: {
      id: 'acidose_metabolica_delta_delta',
      title: 'Delta/Delta',
      description: 'Pesquisar distúrbios metabólicos associados.',
      type: 'question',
      content: `
        <div class="space-y-2 text-sm">
          <p>ΔAG = AG do paciente - 10</p>
          <p>ΔHCO3 = 24 - HCO3 do paciente</p>
          <p>Δ/Δ = ΔAG ÷ ΔHCO3</p>
        </div>
      `,
      options: [
        { text: 'Δ/Δ entre 1 e 2', nextStep: 'acidose_metabolica_ag_alto', value: 'delta_1_2' },
        { text: 'Δ/Δ > 2', nextStep: 'acidose_metabolica_ag_alto_alcalose', value: 'delta_maior_2' },
        { text: 'Δ/Δ < 1', nextStep: 'acidose_metabolica_ag_alto_acidose_normo_ag', value: 'delta_menor_1' }
      ]
    },
    acidose_metabolica_ag_alto: {
      id: 'acidose_metabolica_ag_alto',
      title: 'Acidose Metabólica com AG Aumentado',
      description: 'Distúrbio isolado principal.',
      type: 'result',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-500">
            <p><strong>Classificação:</strong> Acidose metabólica com <strong>Ânion Gap alto</strong>.</p>
          </div>
          <div class="bg-slate-50 p-3 rounded border border-slate-200">
            <p><strong>Causas frequentes (GOLD MARK):</strong></p>
            <ul class="list-disc pl-5 mt-1 space-y-1">
              <li>Glicóis (etilenoglicol, propilenoglicol)</li>
              <li>Oxoprolina (uso crônico de paracetamol)</li>
              <li>L-lactato (acidose láctica)</li>
              <li>D-lactato</li>
              <li>Metanol</li>
              <li>AAS (salicilatos)</li>
              <li>Insuficiência renal (uremia)</li>
              <li>Cetoacidose (diabética, alcoólica ou jejum)</li>
            </ul>
          </div>
        </div>
      `,
      options: []
    },
    acidose_metabolica_ag_alto_alcalose: {
      id: 'acidose_metabolica_ag_alto_alcalose',
      title: 'Distúrbio Misto',
      description: 'Acidose metabólica com AG aumentado + alcalose metabólica.',
      type: 'result',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-orange-50 p-3 rounded border-l-4 border-orange-500">
            <p><strong>Classificação:</strong> Acidose metabólica com <strong>Ânion Gap alto</strong> associada à alcalose metabólica.</p>
          </div>
          <div class="bg-slate-50 p-3 rounded border border-slate-200">
            <p>Investigar simultaneamente causas de AG alto e fatores de alcalose (vômitos, diuréticos, depleção de volume).</p>
          </div>
        </div>
      `,
      options: []
    },
    acidose_metabolica_ag_alto_acidose_normo_ag: {
      id: 'acidose_metabolica_ag_alto_acidose_normo_ag',
      title: 'Distúrbio Misto',
      description: 'Acidose metabólica com AG aumentado + acidose metabólica com AG normal.',
      type: 'result',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500">
            <p><strong>Classificação:</strong> Distúrbio misto com componente de <strong>AG alto</strong> e componente <strong>AG normal</strong>.</p>
          </div>
          <div class="bg-slate-50 p-3 rounded border border-slate-200">
            <p>Esse padrão sugere sobreposição de causas, como acidose láctica/cetoacidose junto de perdas de bicarbonato ou acidose tubular renal.</p>
          </div>
        </div>
      `,
      options: []
    },
    alcalemia_eixo: {
      id: 'alcalemia_eixo',
      title: 'Alcalemia: eixo principal',
      description: 'Definir alcalose metabólica ou respiratória.',
      type: 'question',
      options: [
        { text: 'HCO3 > 27 mEq/L', nextStep: 'alcalose_metabolica_compensacao', value: 'met' },
        { text: 'PaCO2 < 35 mmHg', nextStep: 'alcalose_respiratoria_compensacao', value: 'resp' }
      ]
    },
    alcalose_metabolica_compensacao: {
      id: 'alcalose_metabolica_compensacao',
      title: 'Alcalose Metabólica: compensação',
      description: 'Avaliar PaCO2 esperada.',
      type: 'question',
      content: `
        <div class="bg-slate-50 p-3 rounded border border-slate-200 text-sm">
          <p>PaCO2 esperada = HCO3 + 15 ± 2</p>
        </div>
      `,
      options: [
        { text: 'PaCO2 dentro da faixa esperada', nextStep: 'alcalose_metabolica_compensada', value: 'compensada' },
        { text: 'PaCO2 fora da faixa esperada', nextStep: 'alcalose_metabolica_mista', value: 'mista' }
      ]
    },
    alcalose_metabolica_compensada: {
      id: 'alcalose_metabolica_compensada',
      title: 'Alcalose Metabólica Compensada',
      description: 'Compensação respiratória apropriada.',
      type: 'result',
      options: []
    },
    alcalose_metabolica_mista: {
      id: 'alcalose_metabolica_mista',
      title: 'Distúrbio Misto',
      description: 'Alcalose metabólica com compensação não esperada.',
      type: 'result',
      options: []
    },
    alcalose_respiratoria_compensacao: {
      id: 'alcalose_respiratoria_compensacao',
      title: 'Alcalose Respiratória: compensação renal',
      description: 'Comparar padrões agudo e crônico.',
      type: 'question',
      content: `
        <div class="space-y-2 text-sm">
          <p><strong>Aguda:</strong> HCO3 esperado = 24 - 2×[(40 - PaCO2)/10]</p>
          <p><strong>Crônica:</strong> HCO3 esperado = 24 - 5×[(40 - PaCO2)/10] (±2)</p>
        </div>
      `,
      options: [
        { text: 'Compatível com padrão crônico', nextStep: 'alcalose_respiratoria_cronica', value: 'cronica' },
        { text: 'Compatível com padrão agudo', nextStep: 'alcalose_respiratoria_aguda', value: 'aguda' },
        { text: 'Fora dos padrões esperados', nextStep: 'alcalose_respiratoria_mista', value: 'mista' }
      ]
    },
    alcalose_respiratoria_aguda: {
      id: 'alcalose_respiratoria_aguda',
      title: 'Alcalose Respiratória Aguda',
      description: 'Compensação renal aguda.',
      type: 'result',
      options: []
    },
    alcalose_respiratoria_cronica: {
      id: 'alcalose_respiratoria_cronica',
      title: 'Alcalose Respiratória Crônica',
      description: 'Compensação renal crônica.',
      type: 'result',
      options: []
    },
    alcalose_respiratoria_mista: {
      id: 'alcalose_respiratoria_mista',
      title: 'Distúrbio Misto',
      description: 'Alcalose respiratória com resposta metabólica não esperada.',
      type: 'result',
      options: []
    }
  }
}

// Fluxograma de Crise Aguda de Asma (adulto)
export const asthmaFlowchart: EmergencyFlowchart = {
  id: 'asthma',
  name: 'Crise Asmática no PS',
  description: 'Fluxo prático por gravidade: classificação inicial, tratamento na 1ª hora, reavaliação e destino.',
  category: 'respiratory',
  priority: 'high',
  icon: 'activity',
  color: 'from-cyan-600 to-blue-700',
  initialStep: 'asma_tipo',
  finalSteps: [
    'asma_alta_final',
    'asma_observacao_ps',
    'asma_internacao',
    'asma_uti',
    'asma_intubacao'
  ],
  steps: {
    asma_tipo: {
      id: 'asma_tipo',
      title: 'Início - Suspeita de Asma Aguda no PS',
      description: 'Dispneia, tosse, sibilância e progressão rápida exigem avaliação sistemática.',
      type: 'question',
      content: `
        <div class="space-y-2 text-sm">
          <p><strong>Quadro típico:</strong> dispneia, tosse, sibilância e opressão torácica.</p>
          <p>Avaliar precocemente para prevenir deterioração clínica e insuficiência respiratória.</p>
        </div>
      `,
      options: [
        { text: 'Iniciar avaliação clínica imediata', nextStep: 'asma_avaliacao_inicial', value: 'asma' }
      ]
    },
    asma_avaliacao_inicial: {
      id: 'asma_avaliacao_inicial',
      title: 'Avaliação Inicial (Minuto 0)',
      description: 'Sinais vitais, exame respiratório e PFE para classificar gravidade.',
      type: 'question',
      content: `
        <div class="space-y-2 text-sm">
          <p><strong>Registrar:</strong> SatO2, FR, FC, PA, nível de consciência, uso de musculatura acessória, ausculta pulmonar e PFE (se possível).</p>
          <p>Considerar gasometria se hipoxemia importante, fadiga, rebaixamento de consciência ou piora progressiva.</p>
        </div>
      `,
      options: [
        { text: 'Classificar gravidade', nextStep: 'asma_classificacao_gravidade', value: 'avaliacao_ok' }
      ]
    },
    asma_classificacao_gravidade: {
      id: 'asma_classificacao_gravidade',
      title: 'Classificação de Gravidade',
      description: 'Leve, moderada, grave ou risco de vida.',
      type: 'question',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500">
            <p><strong>Leve:</strong> fala frases, FR &lt; 20, FC &lt; 100, PFE &gt; 80%, SatO2 &gt; 95%.</p>
          </div>
          <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500">
            <p><strong>Moderada:</strong> fala frases curtas, FR 20-30, FC 100-120, PFE 50-80%, SatO2 90-95%.</p>
          </div>
          <div class="bg-orange-50 p-3 rounded border-l-4 border-orange-500">
            <p><strong>Grave:</strong> fala palavras, FR &gt; 30, FC &gt; 120, PFE &lt; 50%, SatO2 &lt; 90%.</p>
          </div>
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-600">
            <p><strong>Risco de vida:</strong> exaustão, confusão/sonolência, hipotensão, bradipneia, cianose, tórax silencioso.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'Leve', nextStep: 'asma_tratamento_1h_leve_moderada', value: 'leve' },
        { text: 'Moderada', nextStep: 'asma_tratamento_1h_leve_moderada', value: 'moderada' },
        { text: 'Grave', nextStep: 'asma_tratamento_1h_grave_vida', value: 'grave', critical: true },
        { text: 'Risco de vida', nextStep: 'asma_tratamento_1h_grave_vida', value: 'risco_vida', critical: true }
      ]
    },
    asma_tratamento_1h_leve_moderada: {
      id: 'asma_tratamento_1h_leve_moderada',
      title: 'Tratamento 1h Leve/Moderada',
      description: 'Conduta inicial para exacerbação leve ou moderada.',
      type: 'question',
      content: `
        <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500 text-sm">
          <p>Iniciar SABA imediatamente como base do tratamento da exacerbação aguda.</p>
        </div>
      `,
      options: [
        { text: 'Broncodilatar com SABA', nextStep: 'asma_saba_leve_moderada', value: 'saba_lm' }
      ]
    },
    asma_saba_leve_moderada: {
      id: 'asma_saba_leve_moderada',
      title: 'SABA Leve/Moderada',
      description: 'Broncodilatação inicial com salbutamol.',
      type: 'question',
      content: `
        <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500 text-sm">
          <p><strong>Salbutamol:</strong> 400-800 mcg (4-8 jatos) com espaçador OU nebulização 2,5-5 mg em 4 ml SF, repetir a cada 20 min até 3 doses.</p>
        </div>
      `,
      options: [
        { text: 'Seguir para suporte com O2', nextStep: 'asma_o2_leve_moderada', value: 'saba_ok' }
      ]
    },
    asma_o2_leve_moderada: {
      id: 'asma_o2_leve_moderada',
      title: 'O2 de Suporte',
      description: 'Oxigênio quando houver dessaturação.',
      type: 'question',
      content: `
        <div class="space-y-2 text-sm">
          <div class="bg-blue-50 p-3 rounded border border-blue-200">
            <p><strong>O2 se SatO2 &lt; 94%.</strong> Alvo 93-95%.</p>
          </div>
          <div class="bg-slate-50 p-3 rounded border border-slate-200">
            <p>Oxigenoterapia suplementar: cateter 1-5 L/min, máscara simples 5-10 L/min ou reservatório 10-15 L/min, com monitorização contínua.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'Fazer corticoide sistêmico', nextStep: 'asma_corticoide_leve_moderada', value: 'o2_lm_ok' }
      ]
    },
    asma_corticoide_leve_moderada: {
      id: 'asma_corticoide_leve_moderada',
      title: 'Corticoide Leve/Moderada',
      description: 'Corticoide sistêmico precoce na 1ª hora.',
      type: 'question',
      content: `
        <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500 text-sm">
          <p><strong>Corticoide sistêmico:</strong> Prednisona/Prednisolona 40-50 mg VO ou Metilpred 40-80 mg IV quando VO não for possível.</p>
        </div>
      `,
      options: [
        { text: 'Reavaliar após 1 hora', nextStep: 'asma_reavaliacao_1h', value: 'lm_1h' }
      ]
    },
    asma_tratamento_1h_grave_vida: {
      id: 'asma_tratamento_1h_grave_vida',
      title: 'Tratamento 1h Grave/Risco de Vida',
      description: 'Conduta intensiva imediata.',
      type: 'question',
      content: `
        <div class="bg-red-50 p-3 rounded border-l-4 border-red-600 text-sm">
          <p>Crise grave ou risco de vida: iniciar protocolo intensivo na primeira hora sem atraso.</p>
        </div>
      `,
      options: [
        { text: 'Oxigenar imediatamente', nextStep: 'asma_o2_grave_vida', value: 'grave_o2', critical: true }
      ]
    },
    asma_o2_grave_vida: {
      id: 'asma_o2_grave_vida',
      title: 'O2 Imediato',
      description: 'Suporte ventilatório inicial.',
      type: 'question',
      content: `
        <div class="bg-red-50 p-3 rounded border-l-4 border-red-600 text-sm">
          <p><strong>O2 imediato</strong> com alvo de SatO2 93-95%.</p>
        </div>
      `,
      options: [
        { text: 'Nebulizar com SABA + Ipratrópio', nextStep: 'asma_nebulizacao_grave_vida', value: 'o2_grave_ok', critical: true }
      ]
    },
    asma_nebulizacao_grave_vida: {
      id: 'asma_nebulizacao_grave_vida',
      title: 'Nebulização Grave/Risco',
      description: 'Broncodilatação combinada intensiva.',
      type: 'question',
      content: `
        <div class="space-y-2 text-sm">
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-600">
            <p><strong>Salbutamol 5 mg + Ipratrópio 0,5 mg</strong> em 4 ml SF, repetir a cada 20 minutos.</p>
          </div>
          <div class="bg-slate-50 p-3 rounded border border-slate-200">
            <p>Adicionar brometo de ipratrópio em exacerbações moderadas/graves reduz hospitalização quando associado ao SABA.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'Iniciar corticoide IV', nextStep: 'asma_corticoide_grave_vida', value: 'neb_grave_ok', critical: true }
      ]
    },
    asma_corticoide_grave_vida: {
      id: 'asma_corticoide_grave_vida',
      title: 'Corticoide IV Grave/Risco',
      description: 'Corticoide sistêmico precoce na primeira hora.',
      type: 'question',
      content: `
        <div class="bg-red-50 p-3 rounded border-l-4 border-red-600 text-sm">
          <p><strong>Corticoide IV:</strong> Metilpred 60-125 mg IV ou Hidrocortisona 200 mg IV.</p>
        </div>
      `,
      options: [
        { text: 'Fazer magnésio EV', nextStep: 'asma_magnesio_grave_vida', value: 'cort_grave_ok', critical: true }
      ]
    },
    asma_magnesio_grave_vida: {
      id: 'asma_magnesio_grave_vida',
      title: 'Magnésio EV',
      description: 'Adjuvante na crise grave.',
      type: 'question',
      content: `
        <div class="bg-red-50 p-3 rounded border-l-4 border-red-600 text-sm">
          <p><strong>Sulfato de Magnésio:</strong> 2 g IV em 20 min (dose única).</p>
        </div>
      `,
      options: [
        { text: 'Considerar beta-agonista SC', nextStep: 'asma_considerar_sc_grave_vida', value: 'mg_grave_ok', critical: true }
      ]
    },
    asma_considerar_sc_grave_vida: {
      id: 'asma_considerar_sc_grave_vida',
      title: 'Considerar Beta-Agonista SC',
      description: 'Resgate adicional se nebulização for insuficiente.',
      type: 'question',
      content: `
        <div class="bg-red-50 p-3 rounded border-l-4 border-red-600 text-sm">
          <p>Considerar Terbutalina SC 0,25-0,5 mg em casos selecionados.</p>
        </div>
      `,
      options: [
        { text: 'Reavaliar após 1 hora', nextStep: 'asma_reavaliacao_1h', value: 'grave_1h', critical: true }
      ]
    },
    asma_reavaliacao_1h: {
      id: 'asma_reavaliacao_1h',
      title: 'Reavaliação Após 1 Hora',
      description: 'Reclassificar resposta após broncodilatação e corticoide inicial.',
      type: 'question',
      content: `
        <div class="space-y-2 text-sm">
          <p><strong>Reavaliar:</strong> sintomas, fala, SatO2, FR, FC, PFE (%) e impressao clinica global.</p>
          <div class="bg-slate-50 p-3 rounded border border-slate-200">
            <p><strong>Classificacao apos broncodilatador inicial:</strong></p>
            <p><strong>Boa:</strong> SatO2 &gt; 95%, FR &lt; 25, FC &lt; 110, fala em frases, PFE &gt; 70%.</p>
            <p><strong>Incompleta:</strong> SatO2 90-95%, FR 25-30, FC 110-125, fala em frases/palavras, PFE 40-69%.</p>
            <p><strong>Ma resposta/deterioracao:</strong> PFE &lt; 50%, piora clinica.</p>
            <p><strong>Ameaca a vida:</strong> SatO2 &lt; 90% com O2, bradicardia, hipotensao, confusao, torax silencioso, cianose.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'Aplicar reavaliação', nextStep: 'asma_decisao_1h', value: 'reav_1h_ok' }
      ]
    },
    asma_decisao_1h: {
      id: 'asma_decisao_1h',
      title: 'Decisão Pós-Reavaliação',
      description: 'Definir melhora, resposta parcial ou falha.',
      type: 'question',
      options: [
        { text: 'Boa resposta (PFE > 70% e melhora clínica)', nextStep: 'asma_resposta_boa', value: 'melhora' },
        { text: 'Resposta incompleta (PFE 50-70% / sintomas persistentes)', nextStep: 'asma_resposta_incompleta', value: 'parcial' },
        { text: 'Má resposta ou deterioração (PFE < 50%)', nextStep: 'asma_resposta_ma', value: 'sem_resposta', critical: true, requiresImmediateAction: true }
      ]
    },
    asma_resposta_boa: {
      id: 'asma_resposta_boa',
      title: 'Boa Resposta',
      description: 'Resposta adequada após tratamento inicial.',
      type: 'question',
      content: `
        <div class="bg-green-50 p-3 rounded border-l-4 border-green-600 text-sm">
          <p><strong>Boa resposta:</strong> PFE &gt; 70%, SatO2 &gt; 94% e melhora clínica.</p>
        </div>
      `,
      options: [
        { text: 'Seguir para alta do PS', nextStep: 'asma_alta_assistida', value: 'boa_alta' }
      ]
    },
    asma_resposta_incompleta: {
      id: 'asma_resposta_incompleta',
      title: 'Resposta Incompleta',
      description: 'Melhora parcial com sintomas persistentes.',
      type: 'question',
      content: `
        <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500 text-sm">
          <p><strong>Resposta incompleta:</strong> PFE 50-70% e sintomas persistentes.</p>
        </div>
      `,
      options: [
        { text: 'Iniciar observação no PS', nextStep: 'asma_observacao_ps', value: 'obs_ps' }
      ]
    },
    asma_resposta_ma: {
      id: 'asma_resposta_ma',
      title: 'Má Resposta / Deterioração',
      description: 'Piora clínica ou falha de resposta ao tratamento inicial.',
      type: 'question',
      critical: true,
      content: `
        <div class="bg-red-50 p-3 rounded border-l-4 border-red-600 text-sm">
          <p><strong>Má resposta/deterioração:</strong> PFE &lt; 50% e/ou piora clínica.</p>
        </div>
      `,
      options: [
        { text: 'Escalonar para terapias de resgate', nextStep: 'asma_escalonamento', value: 'escalonar_resgate', critical: true }
      ]
    },
    asma_escalonamento: {
      id: 'asma_escalonamento',
      title: 'Terapias de Resgate',
      description: 'Para má resposta após 1ª hora de tratamento.',
      type: 'question',
      content: `
        <div class="space-y-2 text-sm">
          <div class="bg-orange-50 p-3 rounded border-l-4 border-orange-500">
            <p><strong>Crise grave/refratária:</strong> iniciar terapias adjuvantes de 2a linha, transferir para UTI, monitorização cardíaca contínua, acesso venoso calibroso e gasometria arterial.</p>
          </div>
          <div class="bg-slate-50 p-3 rounded border border-slate-200">
            <p><strong>Adjuvantes intensivos no fluxo:</strong> magnésio IV, salbutamol IV, aminofilina, heliox (se disponível) e VNI/BIPAP em selecionados.</p>
            <p>Reavaliar frequentemente para necessidade de UTI e intubação.</p>
            <p><em>Referências:</em> ERS 2013, SBPT 2012, ATS, OpenEvidence.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'Iniciar terapias adjuvantes de 2ª linha', nextStep: 'asma_resgate_magnesio', value: 'resgate' },
        { text: 'Fadiga, hipercapnia, alteração de consciência ou piora rápida', nextStep: 'asma_falencia_respiratoria', value: 'falencia', critical: true, requiresImmediateAction: true }
      ]
    },
    asma_resgate_magnesio: {
      id: 'asma_resgate_magnesio',
      title: 'Magnésio 2 g IV se não feito',
      description: 'Primeira terapia adjuvante em crise refratária.',
      type: 'question',
      content: `
        <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500 text-sm">
          <p><strong>Sulfato de Magnesio IV:</strong> 2 g EV em 15-20 min (dose unica) se ainda nao realizado.</p>
          <p>Monitorar FC, PA e reflexos; efeitos adversos: rubor, hipotensao leve e bradicardia.</p>
        </div>
      `,
      options: [
        { text: 'Seguir para próxima terapia de resgate', nextStep: 'asma_resgate_beta_iv', value: 'magnesio_ok' }
      ]
    },
    asma_resgate_beta_iv: {
      id: 'asma_resgate_beta_iv',
      title: 'Salbutamol IV',
      description: 'Considerar quando broncodilatação inalatória é insuficiente.',
      type: 'question',
      content: `
        <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500 text-sm">
          <p><strong>Salbutamol IV:</strong> bolus 0,1-0,2 mcg/kg + infusão 0,1-0,2 mcg/kg/min (conforme protocolo institucional).</p>
          <p>Requer monitorizacao cardiaca continua e vigilancia de lactato/potassio.</p>
        </div>
      `,
      options: [
        { text: 'Seguir para próxima terapia de resgate', nextStep: 'asma_resgate_aminofilina', value: 'beta_iv_ok' }
      ]
    },
    asma_resgate_aminofilina: {
      id: 'asma_resgate_aminofilina',
      title: 'Aminofilina',
      description: 'Opção de resgate em centros com experiência e monitorização.',
      type: 'question',
      content: `
        <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500 text-sm">
          <p><strong>Aminofilina:</strong> ataque 5-6 mg/kg IV em 20-30 min, seguido de manutenção 0,5-0,7 mg/kg/h.</p>
          <p>Evitar em arritmias e monitorar níveis séricos/efeitos adversos.</p>
        </div>
      `,
      options: [
        { text: 'Seguir para próxima terapia de resgate', nextStep: 'asma_resgate_heliox', value: 'aminofilina_ok' }
      ]
    },
    asma_resgate_heliox: {
      id: 'asma_resgate_heliox',
      title: 'Heliox se disponível',
      description: 'Adjuvante para reduzir trabalho respiratório em refratários.',
      type: 'question',
      content: `
        <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500 text-sm">
          <p>Considerar <strong>heliox</strong> em pacientes com broncoespasmo grave refratário, conforme disponibilidade local.</p>
        </div>
      `,
      options: [
        { text: 'Seguir para suporte ventilatório não invasivo', nextStep: 'asma_resgate_vni', value: 'heliox_ok' }
      ]
    },
    asma_resgate_vni: {
      id: 'asma_resgate_vni',
      title: 'Considerar VNI',
      description: 'Tentativa criteriosa em pacientes selecionados.',
      type: 'question',
      content: `
        <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500 text-sm">
          <p>VNI/BIPAP pode ser tentativa temporária em paciente cooperativo, hemodinamicamente estável e sem contraindicação.</p>
          <p>Não atrasar intubação se houver piora clínica.</p>
        </div>
      `,
      options: [
        { text: 'Reavaliar necessidade de UTI', nextStep: 'asma_decisao_uti', value: 'vni_reavaliar' }
      ]
    },
    asma_decisao_uti: {
      id: 'asma_decisao_uti',
      title: 'Precisa de UTI?',
      description: 'Decisão após terapias de resgate e reavaliação clínica.',
      type: 'question',
      options: [
        { text: 'Não, sem critérios de UTI no momento', nextStep: 'asma_criterios_internacao_enfermaria', value: 'sem_uti' },
        { text: 'Sim, há critérios para UTI', nextStep: 'asma_criterios_uti', value: 'com_uti', critical: true }
      ]
    },
    asma_criterios_internacao_enfermaria: {
      id: 'asma_criterios_internacao_enfermaria',
      title: 'Critérios de Internação em Enfermaria',
      description: 'Persistência de sintomas sem necessidade imediata de UTI.',
      type: 'question',
      content: `
        <div class="space-y-2 text-sm">
          <div class="bg-orange-50 p-3 rounded border-l-4 border-orange-500">
            <p><strong>Internar em enfermaria se:</strong> sem retorno à linha de base após 4h, SpO2&lt;92% após 1h, PFE&lt;40% após tratamento, fadiga muscular, alteração de consciência, impossibilidade de tratamento ambulatorial ou fatores de risco para asma fatal.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'Admitir em enfermaria', nextStep: 'asma_internacao', value: 'internacao_enfermaria', critical: true }
      ]
    },
    asma_criterios_uti: {
      id: 'asma_criterios_uti',
      title: 'Critérios de UTI',
      description: 'Falência respiratória iminente ou necessidade de suporte avançado.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-2 text-sm">
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-600">
            <p><strong>Critérios UTI:</strong> PaO2&lt;60, PaCO2&gt;45, consciência alterada, exaustão, necessidade de ventilação mecânica e ausência de resposta ao tratamento inicial.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'Admitir em UTI', nextStep: 'asma_uti', value: 'admitir_uti', critical: true }
      ]
    },
    asma_falencia_respiratoria: {
      id: 'asma_falencia_respiratoria',
      title: 'Grave com Risco de Vida',
      description: 'Conduta intensiva imediata e avaliação para via aérea avançada.',
      type: 'question',
      critical: true,
      content: `
        <div class="bg-red-50 p-3 rounded border-l-4 border-red-600 text-sm">
          <p><strong>Sinais críticos:</strong> exaustão, hipercapnia progressiva, confusão/rebaixamento, tórax silencioso, cianose ou instabilidade hemodinâmica.</p>
          <p>Acionar suporte avançado, manter broncodilatação intensiva e preparar UTI/IOT conforme evolução.</p>
        </div>
      `,
      options: [
        { text: 'Necessita intubação orotraqueal imediata', nextStep: 'asma_intubacao', value: 'iot', critical: true, requiresImmediateAction: true },
        { text: 'UTI com suporte intensivo e vigilância contínua', nextStep: 'asma_uti', value: 'uti' }
      ]
    },
    asma_observacao_ps: {
      id: 'asma_observacao_ps',
      title: 'Resposta Incompleta - Observação no PS',
      description: 'Observar por 2-4 horas com tratamento seriado.',
      type: 'question',
      content: `
        <div class="space-y-2 text-sm">
          <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500">
            <p>Continuar broncodilatadores (salbutamol ± ipratrópio), manter corticoide e monitorar resposta clínica.</p>
          </div>
          <div class="bg-slate-50 p-3 rounded border border-slate-200">
            <p>Observação por 2-4 horas e manutenção do tratamento.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'Manter observação por 2-4h', nextStep: 'asma_repetir_nebulizacao', value: 'observar_repetir' }
      ]
    },
    asma_repetir_nebulizacao: {
      id: 'asma_repetir_nebulizacao',
      title: 'Repetir Nebulizações',
      description: 'Broncodilatação seriada durante observação.',
      type: 'question',
      content: `
        <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500 text-sm">
          <p>Repetir nebulizações a cada 1-2 horas, com reavaliação clínica seriada.</p>
        </div>
      `,
      options: [
        { text: 'Reavaliar novamente', nextStep: 'asma_reavaliar_novamente', value: 'reavaliar_pos_obs' }
      ]
    },
    asma_reavaliar_novamente: {
      id: 'asma_reavaliar_novamente',
      title: 'Reavaliar Novamente',
      description: 'Nova decisão após período de observação.',
      type: 'question',
      options: [
        { text: 'Melhora clínica progressiva', nextStep: 'asma_criterios_alta', value: 'melhora_obs' },
        { text: 'Sem melhora relevante', nextStep: 'asma_internacao', value: 'sem_melhora', critical: true },
        { text: 'Piora clínica', nextStep: 'asma_falencia_respiratoria', value: 'piora', critical: true, requiresImmediateAction: true }
      ]
    },
    asma_internacao: {
      id: 'asma_internacao',
      title: 'Internação hospitalar',
      description: 'Persistência de gravidade ou resposta insuficiente ao tratamento no PS.',
      type: 'result',
      critical: true,
      content: `
        <div class="bg-orange-50 p-3 rounded border-l-4 border-orange-600 text-sm">
          <p>Internar se PFE &lt; 60%, hipoxemia persistente, necessidade frequente de broncodilatador, piora clínica ou risco social.</p>
        </div>
      `,
      options: []
    },
    asma_uti: {
      id: 'asma_uti',
      title: 'Internação em UTI',
      description: 'Suporte intensivo com broncodilatação contínua e vigilância de falência ventilatória.',
      type: 'result',
      critical: true,
      content: `
        <div class="bg-red-50 p-3 rounded border-l-4 border-red-600 text-sm">
          <p>Monitorização intensiva, broncodilatação contínua, corticoide EV, magnésio e estratégias avançadas conforme refratariedade.</p>
        </div>
      `,
      options: []
    },
    asma_intubacao: {
      id: 'asma_intubacao',
      title: 'Intubação + Ventilação Mecânica',
      description: 'Conduta para deterioração crítica.',
      type: 'result',
      critical: true,
      content: `
        <div class="bg-red-100 p-3 rounded border-l-4 border-red-700 text-sm">
          <p><strong>Via aérea avançada:</strong> IOT + ventilação mecânica protetora (Vt 4-6 ml/kg, FR baixa, tempo expiratório prolongado e hipercapnia permissiva quando aplicável).</p>
        </div>
      `,
      options: []
    },
    asma_alta_assistida: {
      id: 'asma_alta_assistida',
      title: 'Alta do PS',
      description: 'Paciente com boa resposta após reavaliação.',
      type: 'question',
      content: `
        <div class="bg-green-50 p-3 rounded border-l-4 border-green-600 text-sm">
          <p><strong>Prescrever na alta:</strong> beta-2 inalatório, corticoide VO por 5-7 dias, orientações e retorno.</p>
        </div>
      `,
      options: [
        { text: 'Checar critérios de alta', nextStep: 'asma_criterios_alta', value: 'checar_alta' }
      ]
    },
    asma_criterios_alta: {
      id: 'asma_criterios_alta',
      title: 'Critérios de Alta Atendidos?',
      description: 'Confirmação final de segurança para alta.',
      type: 'question',
      content: `
        <div class="space-y-2 text-sm">
          <div class="bg-green-50 p-3 rounded border border-green-200">
            <p><strong>Critérios de alta:</strong> PFE &gt; 70%, SatO2 &gt; 94% em ar ambiente, sintomas mínimos, intervalo do beta-2 &lt; 4/4h e prescrição adequada.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'Sim, critérios atendidos', nextStep: 'asma_alta_final', value: 'alta_ok' },
        { text: 'Não, manter em ambiente hospitalar', nextStep: 'asma_internacao', value: 'alta_negada', critical: true }
      ]
    },
    asma_alta_final: {
      id: 'asma_alta_final',
      title: 'Alta do PS',
      description: 'Alta com plano terapêutico e retorno orientado.',
      type: 'result',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-green-50 p-3 rounded border-l-4 border-green-600">
            <p><strong>ALTA com plano terapêutico:</strong> 1) corticoide oral 5-7 dias; 2) ICS-formoterol como reliever (ou ICS regular + SABA resgate); 3) plano de ação escrito personalizado; 4) retorno em 24-48h; 5) revisão de técnica inalatória, adesão e gatilhos.</p>
          </div>
          <div class="bg-emerald-50 p-3 rounded border border-emerald-200">
            <p><strong>Plano de ação escrito:</strong> reconhecer piora, aumentar medicação, quando procurar emergência e contatos úteis.</p>
          </div>
          <div class="bg-cyan-50 p-3 rounded border border-cyan-200">
            <p><strong>Prevenção pós-crise:</strong> otimizar manutenção, avaliar adesão/técnica, reduzir exposição a alérgenos/irritantes e tratar comorbidades (rinite, DRGE, obesidade).</p>
          </div>
          <div class="bg-slate-50 p-3 rounded border border-slate-200">
            <p><strong>Track 1 (preferencial):</strong> ICS-formoterol em todas as etapas; resgate 1-2 inalações conforme sintomas.</p>
            <p><strong>Track 2 (alternativa):</strong> ICS regular + SABA resgate; escalonar ICS/LABA e considerar tiotrópio/biológico conforme fenótipo.</p>
            <p><strong>Zonas do plano:</strong> verde (PFE&gt;80%), amarela (PFE 50-80%), vermelha (PFE&lt;50% com procura imediata de emergência).</p>
            <p><strong>Acompanhamento:</strong> retorno em 24-48h e revisão seriada ambulatorial.</p>
            <p><em>Referências:</em> GINA 2024, SBPT 2012, ATS, O'Byrne 2018, Bateman 2018.</p>
          </div>
        </div>
      `,
      options: []
    }
  }
}

// Fluxograma de GECA (Gastroenterite Aguda)
export const gecaFlowchart: EmergencyFlowchart = {
  id: 'geca',
  name: 'GECA - Gastroenterite Aguda',
  description: 'Protocolo de manejo da gastroenterite aguda em adultos e crianças.',
  category: 'gastrointestinal',
  priority: 'medium',
  icon: 'activity',
  color: 'from-amber-500 to-orange-600',
  initialStep: 'start',
  finalSteps: ['outcome', 'not_geca', 'chronic_flow', 'emergency_transfer'],
  steps: {
    start: {
      id: 'start',
      title: 'Triagem: Compatibilidade com GECA',
      description: 'Verificar se o quadro é compatível',
      type: 'question',
      content: `
        <div class="space-y-3">
          <div class="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
            <strong>Definição:</strong>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Diarreia OU Vômitos</li>
            <li>Início agudo</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Suspeita de GECA', nextStep: 'emergency_exclusion', value: 'yes' },
        { text: 'Não compatível', nextStep: 'not_geca', value: 'no' }
      ]
    },
    not_geca: {
      id: 'not_geca',
      title: 'Não é GECA',
      description: 'Quadro não compatível.',
      type: 'result',
      content: `
        <div class="bg-gray-50 p-4 rounded border-l-4 border-gray-500">
          <h4 class="font-bold text-gray-800">Encerrar Fluxo</h4>
          <p class="text-gray-700">Considerar outros diagnósticos diferenciais.</p>
        </div>
      `,
      options: []
    },
    emergency_exclusion: {
      id: 'emergency_exclusion',
      title: 'Exclusão Rápida de Emergência',
      description: 'Verificar sinais de gravidade imediata',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-3">
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-500">
            <strong>Sinais de Emergência (Qualquer um):</strong>
          </div>
          <ul class="list-disc pl-5 space-y-1 text-sm">
            <li>Rebaixamento de consciência / confusão importante</li>
            <li>Sinais de choque (PA baixa, extremidades frias, pulso fraco)</li>
            <li>Dor abdominal intensa contínua / abdome agudo</li>
            <li>Vômitos incoercíveis</li>
            <li>Sangue vivo em grande quantidade / melena</li>
            <li>Convulsão</li>
            <li>Criança com prostração importante / letargia</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Sim (Emergência)', nextStep: 'emergency_protocol', value: 'yes', critical: true },
        { text: 'Não (Seguir fluxo)', nextStep: 'duration_check', value: 'no' }
      ]
    },
    emergency_protocol: {
      id: 'emergency_protocol',
      title: 'Emergência - Plano C',
      description: 'Encaminhamento urgente necessário',
      type: 'action',
      critical: true,
      timeSensitive: true,
      content: `
        <div class="bg-red-50 p-4 rounded border-l-4 border-red-600">
          <h4 class="font-bold text-red-800">URGÊNCIA MÉDICA</h4>
          <p class="text-red-700 mb-2">Iniciar Plano C imediatamente e solicitar avaliação médica de urgência.</p>
          <ul class="list-disc pl-5 text-red-700 text-sm">
            <li>Acesso venoso imediato</li>
            <li>Monitorização contínua</li>
            <li>Preparar encaminhamento</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Encaminhar (Finalizar)', nextStep: 'emergency_transfer', value: 'transfer', critical: true }
      ]
    },
    emergency_transfer: {
      id: 'emergency_transfer',
      title: 'Transferência para Emergência',
      description: 'Paciente encaminhado ao setor de emergência',
      type: 'result',
      content: `
        <div class="bg-red-50 p-4 rounded border-l-4 border-red-600">
          <h4 class="font-bold text-red-800">Transferência Realizada</h4>
          <p class="text-red-700">Paciente encaminhado para sala de emergência/UTI.</p>
        </div>
      `,
      options: []
    },
    duration_check: {
      id: 'duration_check',
      title: 'Classificação por Duração',
      description: 'Tempo de evolução dos sintomas',
      type: 'question',
      options: [
        { text: 'Menor ou igual a 14 dias (Aguda)', nextStep: 'hydration_assessment_geca', value: 'acute' },
        { text: 'Maior que 14 dias (Persistente/Não Típica)', nextStep: 'investigate_geca', value: 'persistent' }
      ]
    },
    investigate_geca: {
      id: 'investigate_geca',
      title: 'Investigação Necessária',
      description: 'Diarreia persistente ou não típica',
      type: 'action',
      content: `
        <div class="bg-amber-50 p-4 rounded border-l-4 border-amber-500">
          <h4 class="font-bold text-amber-800">Investigar</h4>
          <p class="text-amber-700">Solicitar exames (hemograma, eletrólitos, parasitológico, pesquisa de outras causas).</p>
        </div>
      `,
      options: [
        { text: 'Prosseguir para Hidratação', nextStep: 'hydration_assessment_geca', value: 'next' }
      ]
    },
    hydration_assessment_geca: {
      id: 'hydration_assessment_geca',
      title: 'Avaliação de Hidratação',
      description: 'Decisão Central',
      type: 'question',
      content: `
        <div class="space-y-4 text-sm">
          <div class="border p-3 rounded bg-green-50">
            <strong>A) SEM DESIDRATAÇÃO</strong>
            <ul class="list-disc pl-5 mt-1">
              <li>Estado geral bom</li>
              <li>Mucosas úmidas</li>
              <li>Diurese preservada</li>
              <li>Sem taquicardia/hipotensão relevante</li>
            </ul>
          </div>
          <div class="border p-3 rounded bg-yellow-50">
            <strong>B) DESIDRATAÇÃO LEVE/MODERADA</strong> (Sinais presentes)
            <ul class="list-disc pl-5 mt-1">
              <li>Sede aumentada</li>
              <li>Mucosa seca, olhos fundos</li>
              <li>Redução de diurese</li>
              <li>Irritabilidade/hipoatividade (criança)</li>
            </ul>
          </div>
          <div class="border p-3 rounded bg-red-50">
            <strong>C) DESIDRATAÇÃO GRAVE</strong> (Qualquer um)
            <ul class="list-disc pl-5 mt-1">
              <li>Incapaz de beber</li>
              <li>Letargia/coma</li>
              <li>Pulso radial ausente ou muito fraco</li>
              <li>Choque/hipotensão importante</li>
            </ul>
          </div>
        </div>
      `,
      options: [
        { text: 'Quadro A (Sem Desidratação)', nextStep: 'plan_a_geca', value: 'A' },
        { text: 'Quadro B (Leve/Moderada)', nextStep: 'plan_b_geca', value: 'B' },
        { text: 'Quadro C (Grave)', nextStep: 'plan_c_geca', value: 'C', critical: true }
      ]
    },
    plan_a_geca: {
      id: 'plan_a_geca',
      title: 'PLANO A (Domicílio)',
      description: 'Baixo Risco',
      type: 'action',
      content: `
        <div class="space-y-3">
          <div class="bg-green-50 p-3 rounded border-l-4 border-green-500">
            <strong>Conduta:</strong>
            <ul class="list-disc pl-5 mt-1">
              <li>Orientar SRO após cada evacuação/vômito</li>
              <li>Aumentar líquidos (evitar muito açúcar)</li>
              <li>Manter alimentação habitual</li>
              <li>Se criança: Zinco por 10-14 dias</li>
            </ul>
          </div>
        </div>
      `,
      options: [
        { text: 'Avaliar Inflamação/Disenteria', nextStep: 'inflammation_check', value: 'next' }
      ]
    },
    plan_b_geca: {
      id: 'plan_b_geca',
      title: 'PLANO B (Observação)',
      description: 'Unidade de Saúde',
      type: 'action',
      timeSensitive: true,
      content: `
        <div class="space-y-3">
          <div class="bg-yellow-50 p-3 rounded border-l-4 border-yellow-500">
            <strong>Conduta:</strong>
            <ul class="list-disc pl-5 mt-1">
              <li>Iniciar SRO fracionado (pequenos volumes)</li>
              <li>Observar e reavaliar repetidamente</li>
              <li>Se vômitos: considerar antiemético (objetivo: permitir SRO)</li>
            </ul>
          </div>
        </div>
      `,
      options: [
        { text: 'Melhora (Migrar para Plano A)', nextStep: 'plan_a_geca', value: 'improved' },
        { text: 'Piora/Não tolera VO (Migrar para Plano C)', nextStep: 'plan_c_geca', value: 'worsened', critical: true }
      ]
    },
    plan_c_geca: {
      id: 'plan_c_geca',
      title: 'PLANO C (Grave)',
      description: 'Hidratação Venosa',
      type: 'action',
      critical: true,
      timeSensitive: true,
      content: `
        <div class="space-y-3">
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-500">
            <strong>Conduta:</strong>
            <ul class="list-disc pl-5 mt-1">
              <li>Iniciar hidratação EV imediata</li>
              <li>Encaminhar para hospital</li>
              <li>Associar SRO via oral assim que possível</li>
              <li>Reavaliar em curto intervalo (1-2h)</li>
            </ul>
          </div>
        </div>
      `,
      options: [
        { text: 'Avaliar Inflamação/Disenteria', nextStep: 'inflammation_check', value: 'next' }
      ]
    },
    inflammation_check: {
      id: 'inflammation_check',
      title: 'Sinais de Inflamação / Disenteria',
      description: 'Avaliar necessidade de conduta específica',
      type: 'question',
      content: `
        <p class="mb-2">O paciente apresenta:</p>
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li>Fezes com sangue ou muco/pus?</li>
          <li>Febre alta com sangue nas fezes?</li>
        </ul>
      `,
      options: [
        { text: 'Sim (Disenteria/Inflamatória)', nextStep: 'dysentery_action', value: 'yes' },
        { text: 'Não', nextStep: 'exams_indication_geca', value: 'no' }
      ]
    },
    dysentery_action: {
      id: 'dysentery_action',
      title: 'Conduta na Disenteria',
      description: 'Suspeita de diarreia inflamatória',
      type: 'action',
      content: `
        <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500">
          <strong>Atenção:</strong>
          <ul class="list-disc pl-5 mt-1">
            <li>Evitar antidiarreicos (ex: loperamida)</li>
            <li>Considerar antibiótico se toxemia/gravidade</li>
            <li>Aumentar prioridade de investigação</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Prosseguir', nextStep: 'exams_indication_geca', value: 'next' }
      ]
    },
    exams_indication_geca: {
      id: 'exams_indication_geca',
      title: 'Indicação de Exames',
      description: 'Quando solicitar exames laboratoriais ou de fezes',
      type: 'question',
      content: `
        <div class="space-y-3 text-sm">
          <div>
            <strong>Laboratoriais (Sangue):</strong>
            <p>Se desidratação moderada/grave, idoso, comorbidades, imunossuprimido.</p>
          </div>
          <div>
            <strong>Fezes (Coprocultura/Parasitológico/C. difficile):</strong>
            <p>Se grave/sanguinolenta, imunossupressão, persistente, uso recente de ATB, viagem/HIV.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'Solicitar Exames', nextStep: 'antibiotic_check_geca', value: 'request' },
        { text: 'Não solicitar', nextStep: 'antibiotic_check_geca', value: 'skip' }
      ]
    },
    antibiotic_check_geca: {
      id: 'antibiotic_check_geca',
      title: 'Avaliação de Antibiótico',
      description: 'Regra do "Não Rotina"',
      type: 'question',
      content: `
        <p class="mb-2">Indicação precisa para ATB?</p>
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li>Disenteria com queda do estado geral</li>
          <li>Suspeita de Cólera grave</li>
          <li>Imunossuprimido grave</li>
          <li>Sepse/sinais sistêmicos</li>
        </ul>
        <p class="mt-2 text-xs text-gray-500">GECA aquosa leve/moderada sem invasão: NÃO usar antibiótico.</p>
      `,
      options: [
        { text: 'Sim (Considerar ATB)', nextStep: 'outcome_geca', value: 'yes' },
        { text: 'Não (Sem ATB)', nextStep: 'outcome_geca', value: 'no' }
      ]
    },
    outcome_geca: {
      id: 'outcome_geca',
      title: 'Critérios de Retorno e Desfecho',
      description: 'Orientações finais para alta',
      type: 'result',
      content: `
        <div class="space-y-3">
          <div class="bg-green-50 p-3 rounded border-l-4 border-green-500">
            <strong>Critérios de Retorno (Reavaliar se):</strong>
            <ul class="list-disc pl-5 mt-1 text-sm">
              <li>Piora da diarreia ou vômitos repetidos</li>
              <li>Muita sede / redução da urina</li>
              <li>Sangue nas fezes</li>
              <li>Febre persistente</li>
              <li>Não melhora em 48h (24h se criança/idoso)</li>
            </ul>
          </div>
        </div>
      `,
      options: []
    }
  }
}

// Mapa de todos os fluxogramas disponíveis
// Fluxograma de Picada de Aranha
export const spiderBiteFlowchart: EmergencyFlowchart = {
  id: 'spider_bite',
  name: 'Picada de Aranha',
  description: 'Protocolo de classificação e manejo de acidentes por aranha.',
  category: 'trauma',
  priority: 'medium',
  icon: 'alert-circle',
  color: 'from-amber-700 to-orange-900',
  initialStep: 'start',
  finalSteps: ['discharge', 'transfer', 'urgent_referral', 'end_flow'],
  steps: {
    start: {
      id: 'start',
      title: 'Confirmação do Evento',
      description: 'Paciente relata picada ou apresenta lesão compatível?',
      type: 'question',
      options: [
        { text: 'História de picada ou lesão compatível', nextStep: 'time_check', value: 'confirmed' },
        { text: 'Sem história clara ou lesão atípica', nextStep: 'end_flow', value: 'not_spider' }
      ]
    },
    end_flow: {
      id: 'end_flow',
      title: 'Fluxo Encerrado',
      description: 'Caso não compatível com picada de aranha.',
      type: 'result',
      content: `
        <div class="bg-gray-50 p-4 rounded border-l-4 border-gray-500">
          <h4 class="font-bold text-gray-800">Considerar outros diagnósticos</h4>
          <p class="text-gray-700">Avaliar celulite, abscesso, alergias ou picada de outros insetos.</p>
        </div>
      `,
      options: []
    },
    time_check: {
      id: 'time_check',
      title: 'Tempo desde a Picada',
      description: 'Quanto tempo faz desde o acidente?',
      type: 'question',
      options: [
        { text: 'Menos de 24 horas', nextStep: 'triage', value: 'acute' },
        { text: 'Entre 24 e 72 horas', nextStep: 'brown_spider_warning', value: 'subacute' },
        { text: 'Mais de 72 horas', nextStep: 'triage', value: 'late' }
      ]
    },
    brown_spider_warning: {
      id: 'brown_spider_warning',
      title: 'Atenção: Aranha-marrom',
      description: 'Evolução tardia (>24h).',
      type: 'action',
      content: `
        <div class="bg-yellow-50 p-3 rounded border-l-4 border-yellow-500">
          <strong>Suspeita de Loxosceles:</strong>
          <p>Lesões por aranha-marrom podem evoluir significativamente entre 24-72h (necrose, hemólise).</p>
        </div>
      `,
      options: [
        { text: 'Prosseguir para Triagem', nextStep: 'triage', value: 'next' }
      ]
    },
    triage: {
      id: 'triage',
      title: 'Avaliação de Gravidade (Triagem)',
      description: 'Sinais de perigo imediato?',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-2">
            <p>Verificar presença de:</p>
            <ul class="list-disc pl-5 font-bold text-red-700">
                <li>Rebaixamento de consciência</li>
                <li>Dispneia ou Dor torácica</li>
                <li>Vômitos persistentes</li>
                <li>Convulsão</li>
                <li>Hipotensão / Choque</li>
            </ul>
        </div>
      `,
      options: [
        { text: 'SIM - Sinais presentes', nextStep: 'urgent_referral', value: 'severe', critical: true },
        { text: 'NÃO - Estável', nextStep: 'symptom_evaluation', value: 'stable' }
      ]
    },
    urgent_referral: {
      id: 'urgent_referral',
      title: 'ENCAMINHAMENTO URGENTE',
      description: 'Emergência Médica',
      type: 'result',
      content: `
        <div class="bg-red-100 p-4 rounded border-l-4 border-red-600">
          <h4 class="font-bold text-red-900 text-lg">EMERGÊNCIA</h4>
          <p class="text-red-800 mb-2">Monitorização e suporte imediato.</p>
          <ul class="list-disc pl-5 text-red-800">
            <li>Acesso venoso e O2 se necessário</li>
            <li>Monitorização cardíaca</li>
            <li>Tratar choque/convulsão conforme protocolo</li>
          </ul>
        </div>
      `,
      options: []
    },
    symptom_evaluation: {
      id: 'symptom_evaluation',
      title: 'Característica dos Sintomas',
      description: 'Qual o padrão predominante?',
      type: 'question',
      options: [
        { text: 'Dor leve, eritema discreto, sem sistêmicos', nextStep: 'mild_treatment', value: 'mild' },
        { text: 'Dor INTENSA imediata, irradiação, sudorese', nextStep: 'phoneutria_suspicion', value: 'phoneutria' },
        { text: 'Lesão progressiva, violácea/bolha/necrose', nextStep: 'loxosceles_suspicion', value: 'loxosceles' },
        { text: 'Dor + Câimbras/Rigidez abdominal/Taquicardia', nextStep: 'latrodectus_suspicion', value: 'latrodectus' }
      ]
    },
    phoneutria_suspicion: {
      id: 'phoneutria_suspicion',
      title: 'Suspeita: Aranha-Armadeira',
      description: 'Gênero Phoneutria',
      type: 'action',
      group: 'phoneutria',
      content: `
        <div class="bg-orange-50 p-3 rounded border-l-4 border-orange-500">
          <strong>Característica:</strong> Dor imediata e intensa.
          <p>Verificar sinais sistêmicos na próxima etapa.</p>
        </div>
      `,
      options: [{ text: 'Avaliar Sistêmicos', nextStep: 'systemic_check', value: 'next' }]
    },
    loxosceles_suspicion: {
      id: 'loxosceles_suspicion',
      title: 'Suspeita: Aranha-Marrom',
      description: 'Gênero Loxosceles',
      type: 'action',
      group: 'loxosceles',
      content: `
         <div class="bg-purple-50 p-3 rounded border-l-4 border-purple-500">
          <strong>Característica:</strong> Lesão dermonecrótica, evolução lenta.
        </div>
      `,
      options: [{ text: 'Avaliar Sistêmicos', nextStep: 'systemic_check', value: 'next' }]
    },
    latrodectus_suspicion: {
      id: 'latrodectus_suspicion',
      title: 'Suspeita: Viúva-Negra',
      description: 'Gênero Latrodectus',
      type: 'action',
      group: 'latrodectus',
      content: `
         <div class="bg-slate-800 text-white p-3 rounded border-l-4 border-slate-500">
          <strong>Característica:</strong> Latrodectismo (dor muscular, fácies dolorosa, contraturas).
        </div>
      `,
      options: [{ text: 'Avaliar Sistêmicos', nextStep: 'systemic_check', value: 'next' }]
    },
    systemic_check: {
      id: 'systemic_check',
      title: 'Avaliação Sistêmica',
      description: 'Presença de sinais sistêmicos?',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-2">
            <strong>Sinais de Alerta:</strong>
            <ul class="list-disc pl-5 text-sm">
                <li>Sudorese intensa / Vômitos</li>
                <li>Taquicardia / Hipertensão</li>
                <li>Espasmos musculares / Alteração neurológica</li>
                <li>Hemólise (urina escura) - Loxosceles</li>
            </ul>
        </div>
      `,
      options: [
        { text: 'SIM - Sinais Sistêmicos', nextStep: 'moderate_severe', value: 'yes', critical: true },
        { text: 'NÃO - Apenas local', nextStep: 'mild_treatment', value: 'no' }
      ]
    },
    moderate_severe: {
      id: 'moderate_severe',
      title: 'Classificação: Moderado/Grave',
      description: 'Indicação de observação e possível soroterapia.',
      type: 'action',
      content: `
        <div class="bg-red-50 p-3 rounded border-l-4 border-red-500">
          <strong>Conduta:</strong>
          <ul class="list-disc pl-5">
            <li>Internação/Observação hospitalar</li>
            <li>Monitorização contínua</li>
            <li>Avaliar indicação de Antiveneno</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Avaliar Antiveneno', nextStep: 'antivenom', value: 'next' }
      ]
    },
    antivenom: {
      id: 'antivenom',
      title: 'Indicação de Antiveneno',
      description: 'Critérios para uso de soro específico.',
      type: 'question',
      critical: true,
      requiresSpecialist: true,
      content: `
        <p><strong>Considerar ANTIVENENO se:</strong></p>
        <ul class="list-disc pl-5 mb-2">
          <li>Sintomas sistêmicos moderados/graves</li>
          <li>Dor intensa refratária (Armadeira)</li>
          <li>Lesão extensa ou hemólise (Marrom)</li>
          <li>Espasmos importantes (Viúva-negra)</li>
        </ul>
        <p class="text-sm text-red-600 font-bold">Uso exclusivo hospitalar.</p>
      `,
      options: [
        { text: 'Indicado (Solicitar Soro)', nextStep: 'exams', value: 'yes', critical: true },
        { text: 'Não Indicado (Suporte)', nextStep: 'exams', value: 'no' }
      ]
    },
    mild_treatment: {
      id: 'mild_treatment',
      title: 'Tratamento - Casos Leves',
      description: 'Manejo sintomático local.',
      type: 'action',
      content: `
        <div class="bg-green-50 p-3 rounded border-l-4 border-green-500">
          <strong>Protocolo Leve:</strong>
          <ul class="list-disc pl-5">
            <li>Limpeza local com água e sabão</li>
            <li>Compressa fria (alívio da dor)</li>
            <li>Analgesia simples (Dipirona/Paracetamol)</li>
            <li><strong>NÃO</strong> fazer torniquete, incisão ou sucção!</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Orientações de Alta', nextStep: 'discharge', value: 'next' }
      ]
    },
    exams: {
      id: 'exams',
      title: 'Exames Complementares',
      description: 'Necessidade de investigação laboratorial.',
      type: 'action',
      content: `
        <p><strong>Solicitar se:</strong> Moderado/Grave, Loxosceles confirmado ou dúvida diagnóstica.</p>
        <ul class="list-disc pl-5 mt-2 bg-blue-50 p-2 rounded">
            <li>Hemograma (leucocitose, plaquetas)</li>
            <li>Função Renal (Ureia/Cr)</li>
            <li>Eletrolitos</li>
            <li>CPK (se dores musculares)</li>
            <li>Coagulograma</li>
        </ul>
      `,
      options: [
        { text: 'Concluir Protocolo (Observação)', nextStep: 'transfer', value: 'finish' }
      ]
    },
    transfer: {
      id: 'transfer',
      title: 'Observação / Internação',
      description: 'Paciente deve permanecer sob cuidados médicos.',
      type: 'result',
      content: `
            <div class="bg-blue-100 p-4 rounded text-blue-900">
                <strong>Conduta Definida</strong>
                <p>Manter paciente em observação para monitorar evolução da lesão e sintomas sistêmicos. Reavaliar periodicamente.</p>
            </div>
        `,
      options: []
    },
    discharge: {
      id: 'discharge',
      title: 'Alta com Orientações',
      description: 'Sinais de retorno imediato.',
      type: 'result',
      content: `
        <div class="bg-green-50 p-4 rounded border-l-4 border-green-500">
          <h4 class="font-bold text-green-800">Alta Médica</h4>
          <p>Orientar retorno imediato se:</p>
          <ul class="list-disc pl-5 mt-1 text-green-700">
            <li>Piora da dor ou aumento da lesão</li>
            <li>Surgimento de bolhas ou escurecimento (necrose)</li>
            <li>Febre, vômitos ou alteração urinária</li>
          </ul>
        </div>
      `,
      options: []
    }
  }
}

// Fluxograma de TVP (Trombose Venosa Profunda)
export const tvpFlowchart: EmergencyFlowchart = {
  id: 'tvp',
  name: 'TVP - Trombose Venosa Profunda',
  description: 'Estratificação clínica com Escore de Wells e conduta diagnóstica/terapêutica inicial.',
  category: 'cardiovascular',
  priority: 'high',
  icon: 'activity',
  color: 'from-indigo-600 to-blue-800',
  initialStep: 'start',
  finalSteps: ['tvp_excluida', 'seguimento_ambulatorial', 'anticoagulacao_iniciada', 'encaminhamento_urgente'],
  steps: {
    start: {
      id: 'start',
      title: 'Suspeita Clínica de TVP',
      description: 'Paciente com dor/edema unilateral de membro inferior.',
      type: 'question',
      options: [
        { text: 'Prosseguir avaliação clínica', nextStep: 'avaliacao_clinica', value: 'start_eval' }
      ]
    },
    avaliacao_clinica: {
      id: 'avaliacao_clinica',
      title: 'Avaliação Clínica Inicial',
      description: 'Registrar sinais/sintomas e comparar com membro contralateral.',
      type: 'action',
      content: `
        <div class="space-y-3">
          <div class="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
            <strong>Achados sugestivos:</strong>
          </div>
          <ul class="list-disc pl-5 space-y-1 text-sm">
            <li>Dor unilateral em panturrilha/coxa, pior à deambulação.</li>
            <li>Edema assimétrico com ou sem cacifo, calor local e rubor.</li>
            <li>Sensibilidade à palpação em trajeto venoso profundo.</li>
            <li>Veias colaterais superficiais não varicosas.</li>
            <li>Medir circunferência da panturrilha 10 cm abaixo da tuberosidade tibial e comparar lados.</li>
          </ul>
          <p class="text-xs text-slate-600"><strong>Nota:</strong> sinal de Homans não deve ser usado isoladamente.</p>
        </div>
      `,
      options: [
        { text: 'Aplicar Escore de Wells para TVP', nextStep: 'wells_score', value: 'wells' }
      ]
    },
    wells_score: {
      id: 'wells_score',
      title: 'Escore de Wells - TVP',
      description: 'Somar critérios clínicos e classificar probabilidade pré-teste.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-indigo-50 p-3 rounded border-l-4 border-indigo-500">
            <strong>Critérios (+1 cada):</strong>
            <ul class="list-disc pl-5 mt-1 space-y-1">
              <li>Câncer ativo (tratamento recente/paliativo)</li>
              <li>Paralisia/paresia ou imobilização com gesso em MI</li>
              <li>Leito maior ou igual a 3 dias ou cirurgia maior até 12 semanas</li>
              <li>Dor à palpação ao longo do sistema venoso profundo</li>
              <li>Perna inteira edemaciada</li>
              <li>Panturrilha maior ou igual a 3 cm versus lado assintomático</li>
              <li>Edema com cacifo limitado à perna sintomática</li>
              <li>Veias colaterais superficiais não varicosas</li>
              <li>TVP prévia documentada</li>
            </ul>
            <p class="mt-2"><strong>Subtrair 2 pontos:</strong> diagnóstico alternativo tão provável quanto TVP.</p>
          </div>
          <div class="bg-slate-50 p-3 rounded border border-slate-200">
            <strong>Interpretação:</strong> Baixa menor ou igual a 0 | Moderada 1-2 | Alta maior ou igual a 3.
          </div>
        </div>
      `,
      options: [
        { text: 'Baixa probabilidade (menor ou igual a 0)', nextStep: 'baixa_probabilidade', value: 'low' },
        { text: 'Moderada/Alta probabilidade (maior ou igual a 1)', nextStep: 'moderada_probabilidade', value: 'moderate_high', critical: true }
      ]
    },
    baixa_probabilidade: {
      id: 'baixa_probabilidade',
      title: 'Probabilidade Baixa',
      description: 'Estratégia inicial com D-dímero de alta sensibilidade.',
      type: 'question',
      content: `
        <div class="bg-green-100 p-3 rounded border-l-4 border-green-700 text-sm text-green-950 leading-relaxed">
          <p><strong>Conduta:</strong> Solicitar D-dímero de alta sensibilidade.</p>
          <p>Se negativo, TVP pode ser excluída em paciente de baixa probabilidade.</p>
          <p>Se positivo, prosseguir para ultrassonografia venosa compressiva.</p>
        </div>
      `,
      options: [
        { text: 'D-dímero negativo', nextStep: 'tvp_excluida', value: 'ddimer_negative' },
        { text: 'D-dímero positivo', nextStep: 'us_compressiva', value: 'ddimer_positive' }
      ]
    },
    moderada_probabilidade: {
      id: 'moderada_probabilidade',
      title: 'Moderada/Alta Probabilidade',
      description: 'Realizar Doppler venoso de membros inferiores.',
      type: 'action',
      critical: true,
      content: `
        <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500 text-sm">
          <p><strong>Conduta direta:</strong> realizar US venosa compressiva (Doppler) sem etapa prévia de D-dímero.</p>
        </div>
      `,
      options: [
        { text: 'Realizar Doppler venoso de membros inferiores', nextStep: 'us_compressiva', value: 'direct_us', critical: true }
      ]
    },
    us_compressiva: {
      id: 'us_compressiva',
      title: 'Ultrassonografia Doppler venosa de membro inferior',
      description: 'Interpretar resultado e definir próximo passo.',
      type: 'question',
      critical: true,
      options: [
        { text: 'USG positiva para trombose', nextStep: 'checar_contra_anticoagulacao', value: 'us_positive', critical: true },
        { text: 'USG negativa para trombose', nextStep: 'us_negativa_conduta', value: 'us_negative' }
      ]
    },
    us_negativa_conduta: {
      id: 'us_negativa_conduta',
      title: 'US Negativa - Reavaliação',
      description: 'Decisão baseada na persistência da suspeita clínica.',
      type: 'question',
      content: `
        <div class="bg-slate-50 p-3 rounded border border-slate-200 text-sm">
          <p>US negativa não exclui TVP em suspeita clínica alta.</p>
          <p>Se persistir dúvida/suspeita clínica, repetir ultrassonografia em 5–7 dias.</p>
        </div>
      `,
      options: [
        { text: 'Persistem dúvida ou sinais clínicos', nextStep: 'repetir_us', value: 'high_suspicion' },
        { text: 'Dúvida afastada após reavaliação', nextStep: 'tvp_excluida', value: 'low_suspicion' }
      ]
    },
    repetir_us: {
      id: 'repetir_us',
      title: 'Repetir Ultrassonografia em 5–7 dias',
      description: 'Repetição do exame por persistência de suspeita clínica.',
      type: 'question',
      options: [
        { text: 'Com trombose', nextStep: 'checar_contra_anticoagulacao', value: 'repeat_positive', critical: true },
        { text: 'Sem trombose', nextStep: 'seguimento_ambulatorial', value: 'repeat_negative' }
      ]
    },
    checar_contra_anticoagulacao: {
      id: 'checar_contra_anticoagulacao',
      title: 'Checar contraindicações à anticoagulação',
      description: 'Classificar contraindicações absolutas/relativas e decidir conduta inicial.',
      type: 'question',
      critical: true,
      content: `
        <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500 text-sm">
          <p><strong>Mini fluxograma:</strong> avaliar contraindicações absolutas/relativas antes de iniciar a anticoagulação.</p>
        </div>
      `,
      options: [
        { text: 'Sem contraindicação relevante: seguir para anticoagulação', nextStep: 'tratamento_inicial', value: 'proceed_anticoag' },
        { text: 'Solicitar avaliação da Cirurgia Vascular', nextStep: 'encaminhamento_urgente', value: 'inpatient', critical: true }
      ]
    },
    tratamento_inicial: {
      id: 'tratamento_inicial',
      title: 'Anticoagulação',
      description: 'Escolher esquema terapêutico, duração e prescrição.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500">
            <strong>Solicitar avaliação do Cirurgião Vascular</strong> após confirmação de TVP, especialmente em casos extensos, iliofemorais ou com sinais de gravidade.
          </div>
          <div class="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
            <strong>Opções terapêuticas (resumo):</strong>
            <ul class="list-disc pl-5 mt-1">
              <li>Rivaroxabana: 15 mg 2x/dia por 21 dias, depois 20 mg 1x/dia.</li>
              <li>Apixabana: 10 mg 2x/dia por 7 dias, depois 5 mg 2x/dia.</li>
              <li>Dabigatrana: 150 mg 2x/dia após 5–10 dias de anticoagulação parenteral.</li>
              <li>Edoxabana: 60 mg 1x/dia após 5–10 dias de parenteral (30 mg se CrCl 15–50 mL/min ou ≤60 kg).</li>
              <li>Enoxaparina: 1 mg/kg 2x/dia (ou ajuste conforme função renal).</li>
              <li>HNF EV: bolus 80 U/kg (ou 5.000 U) e infusão 18 U/kg/h (ou 1.300 U/h), com ajuste por TTPa.</li>
              <li>Varfarina: alvo INR 2–3, sobreposta com heparina por pelo menos 5 dias.</li>
            </ul>
          </div>
          <div class="bg-slate-50 p-3 rounded border border-slate-200">
            <strong>Duração sugerida:</strong> 3 meses em evento provocado; considerar estendido em não provocada/trombofilia/câncer ativo.
          </div>
          <div class="bg-slate-50 p-3 rounded border border-slate-200">
            <strong>Complicações e seguimento:</strong>
            <ul class="list-disc pl-5 mt-1">
              <li>Suspeita de TEP: escalonar urgência e investigação imediata.</li>
              <li>Sangramento: suspender anticoagulante e considerar antídotos/reversão conforme droga.</li>
              <li>Reavaliar em 1–2 semanas e em 3 meses; monitorar adesão, função renal/hepática e sinais de recorrência.</li>
            </ul>
          </div>
        </div>
      `,
      options: [
        { text: 'Paciente anticoagulado e fluxo finalizado', nextStep: 'anticoagulacao_iniciada', value: 'outpatient' },
        { text: 'Paciente anticoagulado e encaminhado para avaliação da Cirurgia Vascular', nextStep: 'encaminhamento_urgente', value: 'inpatient', critical: true }
      ]
    },
    conduta_gestante: {
      id: 'conduta_gestante',
      title: 'TVP na Gestação/Puerpério',
      description: 'Estratégia preferencial com heparina de baixo peso molecular.',
      type: 'action',
      requiresSpecialist: true,
      content: `
        <div class="bg-purple-50 p-3 rounded border-l-4 border-purple-500 text-sm">
          <p><strong>Conduta:</strong> LMWH durante a gestação e até 6 semanas pós-parto (mínimo total de 3 meses).</p>
          <p>Evitar varfarina e DOACs na gestação.</p>
        </div>
      `,
      options: [
        { text: 'Registrar conduta e iniciar seguimento', nextStep: 'anticoagulacao_iniciada', value: 'pregnancy_plan' }
      ]
    },
    conduta_cancer: {
      id: 'conduta_cancer',
      title: 'TVP com Câncer Ativo',
      description: 'Anticoagulação prolongada enquanto doença/tratamento ativos.',
      type: 'action',
      requiresSpecialist: true,
      content: `
        <div class="bg-indigo-50 p-3 rounded border-l-4 border-indigo-500 text-sm">
          <p><strong>Opções:</strong> apixabana, rivaroxabana, edoxabana ou LMWH conforme perfil de risco e interações.</p>
          <p>Geralmente manter por tempo estendido enquanto câncer ativo.</p>
        </div>
      `,
      options: [
        { text: 'Registrar plano e iniciar anticoagulação', nextStep: 'anticoagulacao_iniciada', value: 'cancer_plan' }
      ]
    },
    tvp_excluida: {
      id: 'tvp_excluida',
      title: 'TVP Excluída',
      description: 'Baixa probabilidade com D-dímero negativo ou investigação sem trombose.',
      type: 'result',
      content: `
        <div class="bg-green-50 p-4 rounded border-l-4 border-green-500">
          <h4 class="font-bold text-green-800">TVP improvável/excluída</h4>
          <p class="text-green-700">Reavaliar diagnóstico alternativo: celulite, ruptura de cisto de Baker, lesão musculoesquelética, entre outros.</p>
        </div>
      `,
      options: []
    },
    anticoagulacao_iniciada: {
      id: 'anticoagulacao_iniciada',
      title: 'Paciente anticoagulado e fluxo finalizado',
      description: 'Anticoagulação instituída com plano de seguimento.',
      type: 'result',
      content: `
        <div class="space-y-3">
          <div class="bg-blue-50 p-4 rounded border-l-4 border-blue-500">
            <h4 class="font-bold text-blue-800">Conduta Inicial Concluída</h4>
            <ul class="list-disc pl-5 text-blue-700 text-sm mt-1">
              <li>Documentar escore de Wells e via diagnóstica no prontuário.</li>
              <li>Orientar sinais de sangramento e alerta para TEP.</li>
              <li>Programar reavaliação em 1-2 semanas e em 3 meses.</li>
            </ul>
          </div>
        </div>
      `,
      options: []
    },
    seguimento_ambulatorial: {
      id: 'seguimento_ambulatorial',
      title: 'Alta com Seguimento Ambulatorial',
      description: 'Sem trombose em reavaliação e estabilidade clínica.',
      type: 'result',
      content: `
        <div class="bg-emerald-50 p-4 rounded border-l-4 border-emerald-500">
          <h4 class="font-bold text-emerald-800">Seguimento Ambulatorial</h4>
          <p class="text-emerald-700">Manter orientação de retorno imediato se piora de edema/dor ou sintomas respiratórios súbitos.</p>
        </div>
      `,
      options: []
    },
    encaminhamento_urgente: {
      id: 'encaminhamento_urgente',
      title: 'Paciente anticoagulado e encaminhado para avaliação da Cirurgia Vascular',
      description: 'Encaminhar para avaliação especializada após decisão clínica.',
      type: 'result',
      critical: true,
      content: `
        <div class="bg-red-50 p-4 rounded border-l-4 border-red-600">
          <h4 class="font-bold text-red-800">Avaliação vascular prioritária</h4>
          <ul class="list-disc pl-5 text-red-700 text-sm mt-1">
            <li>Encaminhar após início da anticoagulação quando houver necessidade de avaliação cirúrgica especializada.</li>
            <li>Em cenário de risco hemorrágico elevado, individualizar conduta e discutir estratégia com equipe de referência.</li>
            <li>Sinais de gravidade (flegmasia, dor intensa progressiva, suspeita de TEP associada) exigem prioridade máxima.</li>
          </ul>
        </div>
      `,
      options: []
    }
  }
}

// Fluxograma de DPOC
export const dpocFlowchart: EmergencyFlowchart = {
  id: 'dpoc_exacerbado',
  name: 'DPOC Exacerbado',
  description: 'Manejo e conduta na exacerbação da Doença Pulmonar Obstrutiva Crônica (DPOC)',
  category: 'respiratory',
  priority: 'high',
  icon: 'activity',
  color: 'from-blue-600 to-blue-800',
  initialStep: 'start',
  finalSteps: ['alta_ambulatorial', 'encaminhar_hospital', 'alta_hospitalar', 'manter_internacao'],
  steps: {
    start: {
      id: 'start',
      title: 'Avaliação Inicial (DPOC)',
      description: 'Paciente com suspeita de exacerbação de DPOC',
      type: 'question',
      content: `
        <div class="space-y-3">
          <div class="bg-blue-50 p-3 rounded border-l-4 border-blue-500 text-sm">
            <strong>Diagnóstico de DPOC:</strong>
            <ul class="list-disc pl-5 space-y-1">
              <li>Sintomas respiratórios crônicos: Dispneia progressiva (principal), Tosse crônica, Expectoração.</li>
              <li>Associado a fator de risco: Tabagismo (principal), Exposição ocupacional / biomassa, Poluição.</li>
            </ul>
            <p class="mt-2">O diagnóstico só é confirmado com espirometria (Relação VEF1/CVF &lt; 0,7 pós-broncodilatador), o que define obstrução persistente ao fluxo aéreo.</p>
          </div>
          <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500 text-sm">
            <strong>Nota: Definição de exacerbação aguda de DPOC</strong>
            <p>Piora aguda dos sintomas respiratórios (dispneia, tosse, volume e/ou purulência do escarro) que requer mudança terapêutica, duração &lt;14 dias.</p>
            <p class="mt-1"><strong>Desencadeantes:</strong> Infecção bacteriana (50-70%), viral, poluição ambiental, baixa aderência.</p>
            <p class="mt-1"><strong>Critérios de Anthonisen:</strong> aumento da dispneia, aumento do volume do escarro, aumento da purulência do escarro.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'Avaliar paciente', nextStep: 'avaliacao_inicial', value: 'avaliar' }
      ]
    },
    avaliacao_inicial: {
      id: 'avaliacao_inicial',
      title: 'Avaliação Clínica e Sinais Vitais',
      description: 'Avaliar: Saturação de O2, Frequência respiratória, Uso de musculatura acessória, Nível de consciência, Sinais de instabilidade',
      type: 'question',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
            <strong>Avaliação inicial obrigatória:</strong>
            <ul class="list-disc pl-5 mt-1 space-y-1">
              <li>Anamnese detalhada (tempo de sintomas, gravidade basal, medicações em uso).</li>
              <li>Sinais vitais completos: PA, FC, FR, Temperatura e SpO2.</li>
              <li>Exame físico: Ausculta pulmonar (sibilos, roncos, MV diminuído), uso de musculatura acessória, cianose, edema MMII, turgência jugular.</li>
              <li>Estado mental: Confusão, agitação, sonolência. Capacidade de falar frases completas.</li>
              <li>Solicitar exames: RX tórax, ECG, hemograma, PCR, ureia, creatinina, eletrólitos. Gasometria se SpO2 &lt;92% ou sinais de gravidade.</li>
            </ul>
          </div>
        </div>
      `,
      options: [
        { text: 'Checar Sinais de Gravidade', nextStep: 'sinais_gravidade', value: 'checar_gravidade' }
      ]
    },
    sinais_gravidade: {
      id: 'sinais_gravidade',
      title: 'Sinais de Gravidade',
      description: 'Há sinais de gravidade?',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-500">
            <strong>Sinais de gravidade:</strong>
            <ul class="list-disc pl-5 mt-1 space-y-1">
              <li>SatO₂ &lt; 88% ou SpO₂ &lt; 90% em ar ambiente</li>
              <li>FR ≥ 25 a 30 irpm</li>
              <li>FC ≥ 110 bpm</li>
              <li>Rebaixamento de consciência / Alteração do estado mental</li>
              <li>Uso de musculatura acessória / Acidose (pH &lt;7,35)</li>
              <li>Instabilidade hemodinâmica / Comorbidades descompensadas</li>
            </ul>
          </div>
        </div>
      `,
      options: [
        { text: 'Sim, há sinais de gravidade', nextStep: 'medidas_iniciais_graves', value: 'grave', critical: true },
        { text: 'Não, quadro leve/moderado', nextStep: 'tratamento_inicial_leve', value: 'leve' }
      ]
    },
    tratamento_inicial_leve: {
      id: 'tratamento_inicial_leve',
      title: 'Iniciar Tratamento Ambulatorial',
      description: 'Iniciar broncodilatadores (SABA ± SAMA) + Corticoide sistêmico',
      type: 'action',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
            <strong>Broncodilatadores de curta ação:</strong>
            <ul class="list-disc pl-5 mt-1 space-y-1">
              <li><strong>SABA (Salbutamol):</strong> Spray 100-200 mcg (1-2 jatos) a cada 4-6h com espaçador, OU Nebulização 2,5-5mg diluído em 3-4 mL SF a cada 4-6h.</li>
              <li><strong>SAMA (Ipratrópio):</strong> Spray 40-80 mcg (2-4 jatos) a cada 6-8h, OU Nebulização 0,5mg (20 gotas) em SF a cada 6-8h.</li>
              <li><strong>Combinação (Preferencial - Berodual):</strong> Spray 2-4 jatos a cada 6h com espaçador, OU Nebulização 20-40 gotas em 3mL de SF a cada 6h.</li>
            </ul>
          </div>
          <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500">
            <strong>Corticoide Sistêmico:</strong>
            <ul class="list-disc pl-5 mt-1">
              <li>Prednisona VO 40 mg/dia OU Prednisolona 30-40mg VO 1x/dia por 5–7 dias.</li>
              <li>Sem necessidade de desmame se ≤14 dias. Reduz tempo de recuperação e recaída.</li>
            </ul>
          </div>
        </div>
      `,
      options: [
        { text: 'Checar indicação de antibiótico', nextStep: 'indicacao_atb', value: 'atb_check' }
      ]
    },
    medidas_iniciais_graves: {
      id: 'medidas_iniciais_graves',
      title: 'Medidas Iniciais (Graves)',
      description: 'Oxigenoterapia controlada, Monitorização contínua, Acesso venoso',
      type: 'action',
      critical: true,
      timeSensitive: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
            <strong>Oxigenoterapia controlada:</strong>
            <ul class="list-disc pl-5 mt-1 space-y-1">
              <li><strong>Meta de SpO2: 88-92%</strong> (evitar hiperóxia que pode piorar hipercapnia).</li>
              <li>Hospitalar: Preferir máscara de Venturi com FiO2 inicial 24-28% e fluxo de 4 L/min. Evitar alto fluxo não controlado.</li>
              <li>Monitorar gasometria arterial entre 30-60 min após início/ajuste de oxigênio.</li>
            </ul>
          </div>
          <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500">
            <strong>Broncodilatadores e Corticoides na Urgência:</strong>
            <ul class="list-disc pl-5 mt-1 space-y-1">
              <li>SABA + SAMA: Repetir a cada 20 min na 1ª hora se necessário. Preferir combinação.</li>
              <li>Corticosteroide Endovenoso (se incapaz VO): Metilprednisolona 40-125mg EV 6/6h OU Hidrocortisona 100-200mg EV 6-8h. (Duração 5-7 dias total).</li>
            </ul>
          </div>
        </div>
      `,
      options: [
        { text: 'Avaliar insuficiência respiratória', nextStep: 'insuficiencia_respiratoria', value: 'insuf' }
      ]
    },
    insuficiencia_respiratoria: {
      id: 'insuficiencia_respiratoria',
      title: 'Insuficiência Respiratória',
      description: 'Há insuficiência respiratória manifesta / Risco elevado?',
      type: 'question',
      critical: true,
      options: [
        { text: 'Sim', nextStep: 'avaliar_gasometria', value: 'sim', critical: true },
        { text: 'Não', nextStep: 'investigacao_causa', value: 'nao' }
      ]
    },
    investigacao_causa: {
      id: 'investigacao_causa',
      title: 'Investigação de Causa Base',
      description: 'Infecção respiratória, Pneumonia, Embolia pulmonar, Insuficiência cardíaca, Outras causas',
      type: 'action',
      content: `
        <div class="space-y-3 text-sm">
          <ul class="list-disc pl-5 space-y-2">
            <li><strong>Infecção (70-80%):</strong> História clínica, mudança de escarro. Solicitar Hemograma, PCR, Rx/TC tórax.</li>
            <li><strong>Cardíaca:</strong> ECG, troponina, BNP, Ecocardiograma.</li>
            <li><strong>TEP:</strong> Considerar embolia pulmonar (Escore de Wells). Se alta probabilidade: Angio-TC direto. Se baixa/interm: D-dímero.</li>
            <li><strong>Complementar:</strong> Doppler MMII se suspeita clínica.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Prosseguir', nextStep: 'tratamento_intensivo', value: 'prosseguir' }
      ]
    },
    avaliar_gasometria: {
      id: 'avaliar_gasometria',
      title: 'Avaliar Gasometria Arterial',
      description: 'Avaliar pH e PaCO2',
      type: 'question',
      critical: true,
      options: [
        { text: 'Acidose respiratória (pH < 7,35 e PaCO2 > 45)', nextStep: 'acidose_respiratoria', value: 'acidose', critical: true },
        { text: 'Sem acidose respiratória (pH ≥ 7,35)', nextStep: 'manter_o2_tratamento', value: 'normal' }
      ]
    },
    acidose_respiratoria: {
      id: 'acidose_respiratoria',
      title: 'Acidose Respiratória (pH < 7,35)?',
      description: 'Definir necessidade de Ventilação Não Invasiva',
      type: 'question',
      critical: true,
      options: [
        { text: 'Sim', nextStep: 'iniciar_vni', value: 'sim', critical: true },
        { text: 'Não', nextStep: 'manter_o2_tratamento', value: 'nao' }
      ]
    },
    manter_o2_tratamento: {
      id: 'manter_o2_tratamento',
      title: 'Manter O2 e Tratamento Clínico',
      description: 'Continuar tratamento medicamentoso e oxigênio',
      type: 'action',
      options: [
        { text: 'Prosseguir', nextStep: 'tratamento_intensivo', value: 'prosseguir' }
      ]
    },
    iniciar_vni: {
      id: 'iniciar_vni',
      title: 'Iniciar VNI (Ventilação Não Invasiva)',
      description: 'Parâmetros iniciais e cuidados',
      type: 'action',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
            <strong>Indicações e Contraindicações:</strong>
            <ul class="list-disc pl-5 mt-1">
              <li><strong>Indicações:</strong> Acidose respiratória (pH 7,25-7,35 e PaCO2 >45 mmHg), FR >25 irpm com fadiga.</li>
              <li><strong>Contraindicações:</strong> Parada respiratória, instabilidade cardiovascular, incapacidade de proteção de via aérea, agitação grave.</li>
            </ul>
          </div>
          <div class="bg-purple-50 p-3 rounded border-l-4 border-purple-500">
            <strong>Parâmetros Iniciais (BiPAP):</strong>
            <ul class="list-disc pl-5 mt-1">
              <li>IPAP: 10-12 cmH2O (ajustar progressivamente até 15-20 visando VC de 6-8 mL/kg).</li>
              <li>EPAP: 4-5 cmH2O.</li>
              <li>FiO2 titulada para SpO2 entre 88-92%.</li>
              <li>Reavaliação: Gasometria em 1-2 horas.</li>
            </ul>
          </div>
        </div>
      `,
      options: [
        { text: 'Avaliar resposta', nextStep: 'respondeu_vni', value: 'avaliar' }
      ]
    },
    respondeu_vni: {
      id: 'respondeu_vni',
      title: 'Respondeu à VNI?',
      description: 'Critérios de sucesso: melhora clínica, redução da FR, melhora do pH/PaCO2 em 1-2h',
      type: 'question',
      critical: true,
      options: [
        { text: 'Sim', nextStep: 'manter_vni', value: 'sim' },
        { text: 'Não (Falha na VNI)', nextStep: 'intubacao', value: 'nao', critical: true }
      ]
    },
    manter_vni: {
      id: 'manter_vni',
      title: 'Manter VNI + Tratamento Clínico',
      description: 'Continuar VNI e tratamento',
      type: 'action',
      options: [
        { text: 'Prosseguir', nextStep: 'tratamento_intensivo', value: 'prosseguir' }
      ]
    },
    intubacao: {
      id: 'intubacao',
      title: 'Intubação e Ventilação Invasiva',
      description: 'Estratégia ventilatória protetora',
      type: 'procedure',
      critical: true,
      requiresSpecialist: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-600">
            <strong>Estratégia Ventilatória:</strong>
            <ul class="list-disc pl-5 mt-1 space-y-1">
              <li>Modo VCV ou PCV. Volume Corrente 6-8 mL/kg peso predito.</li>
              <li>FR inicial: 8-14 irpm.</li>
              <li>PEEP: 5-8 cmH2O (evitar auto-PEEP). PPlatô &lt;30 e Driving Pressure &lt;15.</li>
              <li>Tempo expiratório prolongado (I:E 1:3 a 1:5) para evitar aprisionamento aéreo. Fluxo inspiratório alto (60-100 L/min).</li>
              <li>Aceitar hipercapnia permissiva (pH > 7.20-7.25).</li>
              <li>Monitorar pressões e auto-PEEP.</li>
            </ul>
          </div>
        </div>
      `,
      options: [
        { text: 'Encaminhar para UTI', nextStep: 'manter_internacao', value: 'uti', critical: true }
      ]
    },
    tratamento_intensivo: {
      id: 'tratamento_intensivo',
      title: 'Manter Tratamento Clínico Intensivo',
      description: 'Monitoramento contínuo em internação',
      type: 'action',
      options: [
        { text: 'Checar indicação de antibiótico', nextStep: 'indicacao_atb_hospitalar', value: 'atb_check' }
      ]
    },
    indicacao_atb: {
      id: 'indicacao_atb',
      title: 'Indicação de Antibiótico? (Ambulatorial)',
      description: 'Critérios de Anthonisen e Antibioticoterapia',
      type: 'question',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
            <strong>Critérios de Anthonisen:</strong>
            <ol class="list-decimal pl-5 mt-1 space-y-1">
              <li>Aumento da dispneia</li>
              <li>Aumento do volume do escarro</li>
              <li>Escarro purulento</li>
            </ol>
            <p class="mt-2"><strong>Tipo I (Grave):</strong> 3 critérios. Indicação clara de ATB.</p>
            <p><strong>Tipo II (Moderado):</strong> 2 critérios (um DEVE ser purulência). Indicação de ATB.</p>
            <p><strong>Tipo III (Leve):</strong> 1 critério. Geralmente NÃO precisa de ATB.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'Sim (Tipo I ou II)', nextStep: 'iniciar_atb', value: 'sim' },
        { text: 'Não', nextStep: 'houve_melhora_clinica', value: 'nao' }
      ]
    },
    iniciar_atb: {
      id: 'iniciar_atb',
      title: 'Iniciar Antibiótico',
      description: 'Esquemas Ambulatoriais',
      type: 'medication',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500">
            <strong>Esquemas Ambulatoriais:</strong>
            <ul class="list-disc pl-5 mt-1 space-y-1">
              <li><strong>1ª Escolha:</strong> Amoxicilina-clavulanato 875/125mg VO 12/12h por 5-7 dias (ou Amoxicilina 500mg 8/8h).</li>
              <li><strong>Alternativas (alergia):</strong> Azitromicina 500mg VO 1x/dia por 3 dias OU Claritromicina 500mg VO 12/12h por 5-7 dias.</li>
              <li><strong>Fluoroquinolonas (risco Pseudomonas / uso ATB prévio):</strong> Levofloxacino 500mg VO 1x/dia por 5-7 dias.</li>
              <li><strong>Pseudomonas:</strong> Ciprofloxacino 500-750mg VO 12/12h por 7-10 dias.</li>
            </ul>
          </div>
        </div>
      `,
      options: [
        { text: 'Prosseguir', nextStep: 'houve_melhora_clinica', value: 'prosseguir' }
      ]
    },
    indicacao_atb_hospitalar: {
      id: 'indicacao_atb_hospitalar',
      title: 'Indicação de Antibiótico? (Hospitalar)',
      description: 'Critérios de Anthonisen para pacientes internados',
      type: 'question',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
            <strong>Indicações:</strong>
            <p>Presença dos 3 critérios de Anthonisen ou 2 critérios (sendo um purulência), OU necessidade de VNI / VMI.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'Sim', nextStep: 'iniciar_atb_hospitalar', value: 'sim' },
        { text: 'Não', nextStep: 'paciente_estabilizado', value: 'nao' }
      ]
    },
    iniciar_atb_hospitalar: {
      id: 'iniciar_atb_hospitalar',
      title: 'Iniciar Antibiótico Hospitalar',
      description: 'Esquemas Endovenosos / Hospitalares',
      type: 'medication',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500">
            <strong>Sem Risco para Pseudomonas:</strong>
            <ul class="list-disc pl-5 mt-1">
              <li>Amoxicilina-clavulanato 1-2g EV 8/8h OU Ceftriaxona 1-2g EV 1x/dia OU Levofloxacino 750mg EV 1x/dia.</li>
            </ul>
          </div>
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-500">
            <strong>Com Risco para Pseudomonas:</strong>
            <p class="text-xs mb-1">(VEF1 &lt;30%, uso recente de ATB, >4 exacerbações/ano, bronquiectasias)</p>
            <ul class="list-disc pl-5">
              <li>Piperacilina-tazobactam 4,5g EV 6/6h OU Cefepime 2g EV 8/8h OU Meropenem 1g EV 8/8h.</li>
              <li>Considerar associação com Ciprofloxacino 400mg EV 12/12h.</li>
            </ul>
            <p class="mt-1">Duração habitual: 5-7 dias (ajustar por culturas).</p>
          </div>
        </div>
      `,
      options: [
        { text: 'Prosseguir', nextStep: 'paciente_estabilizado', value: 'prosseguir' }
      ]
    },
    houve_melhora_clinica: {
      id: 'houve_melhora_clinica',
      title: 'Houve Melhora Clínica?',
      description: 'Avaliar resposta ao tratamento inicial',
      type: 'question',
      options: [
        { text: 'Sim', nextStep: 'alta_ambulatorial', value: 'sim' },
        { text: 'Não', nextStep: 'encaminhar_hospital', value: 'nao' }
      ]
    },
    paciente_estabilizado: {
      id: 'paciente_estabilizado',
      title: 'Paciente Estabilizado?',
      description: 'Avaliar critérios de estabilidade para alta',
      type: 'question',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-green-50 p-3 rounded border-l-4 border-green-500">
            <strong>Critérios de Alta:</strong>
            <ul class="list-disc pl-5 mt-1">
              <li>Broncodilatador ≥ intervalo 4h com boa resposta.</li>
              <li>Capacidade de deambular pelo quarto e alimentar-se.</li>
              <li>Estabilidade clínica por 12-24h (sinais vitais, gasometria).</li>
              <li>SpO2 >90% ou retorno ao basal.</li>
              <li>Compreensão do plano terapêutico e técnica inalatória adequada.</li>
            </ul>
          </div>
        </div>
      `,
      options: [
        { text: 'Sim', nextStep: 'alta_hospitalar', value: 'sim' },
        { text: 'Não', nextStep: 'manter_internacao', value: 'nao' }
      ]
    },
    alta_ambulatorial: {
      id: 'alta_ambulatorial',
      title: 'Alta com Orientação e Seguimento',
      description: 'Plano terapêutico para casa',
      type: 'result',
      content: `
        <div class="bg-green-50 p-4 rounded border-l-4 border-green-500 text-sm">
          <h4 class="font-bold text-green-800">Alta Ambulatorial</h4>
          <ul class="list-disc pl-5 mt-2 space-y-1">
            <li>Revisar técnica inalatória.</li>
            <li>Consulta precoce em 7-14 dias e 4-6 semanas.</li>
            <li>Ajustar terapia de manutenção e reforçar cessação tabágica.</li>
          </ul>
        </div>
      `,
      options: []
    },
    alta_hospitalar: {
      id: 'alta_hospitalar',
      title: 'Alta Hospitalar com Plano Terapêutico e Prevenção',
      description: 'Orientações pós-internação',
      type: 'result',
      content: `
        <div class="bg-green-50 p-4 rounded border-l-4 border-green-500 text-sm">
          <h4 class="font-bold text-green-800">Alta Hospitalar Segura</h4>
          <ul class="list-disc pl-5 mt-2 space-y-1">
            <li>Agendar consulta de revisão (7-14 dias).</li>
            <li>Otimizar manutenção (LABA + LAMA para todos).</li>
            <li>Encaminhar para reabilitação pulmonar.</li>
            <li>Atualizar vacinas (influenza, pneumocócica, COVID-19).</li>
            <li>Fornecer plano de ação escrito para o paciente.</li>
          </ul>
        </div>
      `,
      options: []
    },
    encaminhar_hospital: {
      id: 'encaminhar_hospital',
      title: 'Encaminhar para Avaliação Hospitalar',
      description: 'Paciente sem resposta ao manejo ambulatorial',
      type: 'result',
      content: `
        <div class="bg-red-50 p-4 rounded border-l-4 border-red-500 text-sm">
          <h4 class="font-bold text-red-800">Transferência/Internação</h4>
          <p>Devido à ausência de melhora, o paciente requer avaliação e suporte hospitalar.</p>
        </div>
      `,
      options: []
    },
    manter_internacao: {
      id: 'manter_internacao',
      title: 'Manter Internação / UTI',
      description: 'Paciente grave ou ainda não estabilizado',
      type: 'result',
      content: `
        <div class="bg-red-50 p-4 rounded border-l-4 border-red-500 text-sm">
          <h4 class="font-bold text-red-800">Critérios para UTI:</h4>
          <ul class="list-disc pl-5 mt-2 space-y-1">
            <li>Dispneia grave refratária</li>
            <li>Alteração grave do nível de consciência</li>
            <li>Instabilidade hemodinâmica / Choque</li>
            <li>Necessidade de VNI ou VMI</li>
            <li>Acidose respiratória grave (pH &lt; 7,25)</li>
            <li>Hipoxemia grave refratária</li>
          </ul>
        </div>
      `,
      options: []
    }
  }
}

export const emergencyFlowcharts: Record<string, EmergencyFlowchart> = {
  iam: iamFlowchart,
  avc: avcFlowchart,
  sepsis: sepsisFlowchart,
  dengue: dengueFlowchart,
  gasometria: gasometryFlowchart,
  asthma: asthmaFlowchart,
  diarreia: diarreiaFlowchart,
  geca: gecaFlowchart,
  spider_bite: spiderBiteFlowchart,
  tvp: tvpFlowchart,
  dpoc_exacerbado: dpocFlowchart,
}

// Lista completa de todos os fluxogramas disponíveis
export const allFlowcharts = [
  // Ferramentas
  { id: 'gasometria', name: 'Gasometria', category: 'respiratory', implemented: true },

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
  { id: 'avc', name: 'AVC (Agudo)', category: 'neurological', implemented: true },
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
  { id: 'diarreia', name: 'Diarreia', category: 'gastrointestinal', implemented: true },
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
  { id: 'asthma', name: 'Crise asmática/Broncoespasmo', category: 'respiratory', implemented: true },
  { id: 'dispneia', name: 'Dispnéia', category: 'respiratory', implemented: false },
  { id: 'dpoc_exacerbado', name: 'DPOC exacerbado', category: 'respiratory', implemented: true },
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
  { id: 'tvp', name: 'TVP', category: 'cardiovascular', implemented: true },

  // Distúrbios Hidroeletrolíticos (DHEL)
  { id: 'dhel_hipercalcemia', name: 'DHEL - Hipercalcemia', category: 'metabolic', implemented: false },
  { id: 'dhel_hipercalemia', name: 'DHEL - Hipercalemia', category: 'metabolic', implemented: false },
  { id: 'dhel_hipermagnesemia', name: 'DHEL - Hipermagnesemia', category: 'metabolic', implemented: false },
  { id: 'dhel_hipernatremia', name: 'DHEL - Hipernatremia', category: 'metabolic', implemented: false },
  { id: 'dhel_hipocalcemia', name: 'DHEL - Hipocalcemia', category: 'metabolic', implemented: false },
  { id: 'dhel_hipocalemia', name: 'DHEL - Hipocalemia', category: 'metabolic', implemented: false },
  { id: 'dhel_hipomagnesemia', name: 'DHEL - Hipomagnesemia', category: 'metabolic', implemented: false },
  { id: 'dhel_hiponatremia', name: 'DHEL - Hiponatremia sintomática', category: 'metabolic', implemented: true },

  // Ginecológicos
  { id: 'corrimento_vaginal', name: 'Corrimento vaginal', category: 'gynecological', implemented: false },
  { id: 'sangramento_vaginal', name: 'Sangramento vaginal', category: 'gynecological', implemented: false },

  // Gastroenterológicos
  { id: 'geca', name: 'GECA', category: 'gastrointestinal', implemented: true },
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
  { id: 'picada_aranha', name: 'Picada de aranha', category: 'trauma', implemented: true },
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
