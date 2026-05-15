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
      title: 'Suspeita de Dengue',
      description: 'Definir caso suspeito, lembrar da notificação obrigatória e classificar a gravidade.',
      type: 'question',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-slate-50 p-3 rounded border border-slate-200">
            <p><strong>Caso suspeito de dengue:</strong> febre, geralmente com duração de 2 a 7 dias, associada a duas ou mais manifestações como náuseas, vômitos, exantema, mialgia, artralgia, cefaleia, dor retro-orbitária, petéquias, prova do laço positiva ou leucopenia.</p>
          </div>
          <div class="bg-slate-50 p-3 rounded border border-slate-200">
            <p>Também considerar suspeita em criança com quadro febril agudo, geralmente de 2 a 7 dias, sem foco de infecção aparente.</p>
          </div>
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-600">
            <p><strong>Notificação obrigatória:</strong> notificar todo caso suspeito de dengue, mesmo antes da classificação final.</p>
          </div>
        </div>
      `,
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
        <div class="space-y-3 text-sm">
          <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500">
            <p><strong>Tratamento ambulatorial:</strong> hidratação oral vigorosa, antitérmicos (dipirona ou paracetamol) e evitar AINEs e salicilatos.</p>
          </div>
          <div class="bg-sky-50 p-3 rounded border border-sky-200">
            <p><strong>Hidratação oral:</strong> orientar água, soro de reidratação oral, sucos, chás e água de coco, fracionando ao longo do dia.</p>
            <p class="mt-2"><strong>Crianças (&lt;13 anos):</strong></p>
            <ul class="list-disc pl-5 space-y-1 mt-1">
              <li>Até 10 kg: 130 mL/kg/dia.</li>
              <li>Acima de 10 kg até 20 kg: 100 mL/kg/dia.</li>
              <li>Acima de 20 kg: 80 mL/kg/dia.</li>
            </ul>
          </div>
          <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500">
            <p><strong>Importante:</strong> os sinais de alarme e o agravamento do quadro costumam ocorrer na fase de remissão da febre.</p>
            <p class="mt-2">Orientar retorno imediato se surgirem sinais de alarme, se houver piora clínica ou no dia da melhora da febre, quando pode se iniciar a fase crítica.</p>
            <p class="mt-2">Se não houver defervescência, orientar retorno no 5º dia da doença para reavaliação clínica.</p>
          </div>
          <div class="bg-red-50 p-3 rounded border border-red-200">
            <p><strong>Na alta:</strong> entregar cartão de acompanhamento da dengue.</p>
          </div>
        </div>
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
          <ul class="list-disc pl-5 mt-3 space-y-1 text-green-700">
            <li>Manter hidratação oral conforme orientação clínica.</li>
            <li>Retornar imediatamente se surgirem sinais de alarme ou piora do quadro.</li>
            <li>Retornar no dia da melhora da febre, pela possibilidade de entrada na fase crítica.</li>
            <li>Se a febre não ceder, retornar no 5º dia da doença para reavaliação.</li>
            <li>Entregar cartão de acompanhamento da dengue.</li>
          </ul>
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
        <div class="space-y-2 text-sm">
          <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500">
            <p><strong>Preferir VO:</strong> Prednisona ou Prednisolona 40-60 mg/dia por 5-7 dias.</p>
          </div>
          <div class="bg-slate-50 p-3 rounded border border-slate-200">
            <p><strong>IV apenas se VO não for possível:</strong> reservar metilprednisolona IV para vômitos, incapacidade de deglutir ou outra impossibilidade prática de usar a via oral.</p>
          </div>
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
      title: 'SABA + Ipratrópio',
      description: 'Broncodilatação combinada intensiva.',
      type: 'question',
      content: `
        <div class="space-y-2 text-sm">
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-600">
            <p><strong>Salbutamol + brometo de ipratrópio:</strong> associar ipratrópio nas exacerbações moderadas a graves, sobretudo se PFE &lt; 60%, SpO2 &lt; 92% persistente ou necessidade de múltiplas doses de SABA.</p>
          </div>
          <div class="bg-slate-50 p-3 rounded border border-slate-200">
            <p><strong>MDI com espaçador (adultos):</strong> 4-8 jatos de ipratrópio (80-160 mcg) a cada 20 min na 1ª hora, em associação ao salbutamol.</p>
            <p><strong>Nebulização (adultos):</strong> ipratrópio 500 mcg associado ao salbutamol, repetir a cada 20 min por até 3 doses na 1ª hora.</p>
            <p><strong>Observação prática:</strong> existem combinações fixas para nebulização, como salbutamol 2,5 mg + ipratrópio 500 mcg, quando disponíveis no serviço.</p>
            <p>Adicionar brometo de ipratrópio em exacerbações moderadas/graves reduz hospitalização quando associado ao SABA.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'Iniciar corticoide sistêmico precoce', nextStep: 'asma_corticoide_grave_vida', value: 'neb_grave_ok', critical: true }
      ]
    },
    asma_corticoide_grave_vida: {
      id: 'asma_corticoide_grave_vida',
      title: 'Corticoide Sistêmico Precoce',
      description: 'Corticoide sistêmico precoce na primeira hora.',
      type: 'question',
      content: `
        <div class="space-y-2 text-sm">
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-600">
            <p><strong>Indicação:</strong> iniciar corticoide sistêmico idealmente na 1ª hora em todas as exacerbações moderadas a graves ou quando não houver resposta imediata ao broncodilatador.</p>
          </div>
          <div class="bg-slate-50 p-3 rounded border border-slate-200">
            <p><strong>Preferir VO se o paciente conseguir deglutir:</strong> Prednisona ou Prednisolona 40-60 mg/dia por 5-7 dias.</p>
            <p><strong>Reservar IV para casos selecionados:</strong> metilprednisolona IV quando houver vômitos, incapacidade de deglutir, necessidade de UTI ou impossibilidade prática da via oral.</p>
            <p><strong>Metilprednisolona IV (adultos):</strong> 60-125 mg IV, com transição para VO após melhora clínica.</p>
            <p><strong>Equivalência útil:</strong> metilprednisolona 4 mg = prednisolona 5 mg = hidrocortisona 20 mg.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'Reavaliar após 1 hora', nextStep: 'asma_reavaliacao_1h', value: 'cort_grave_ok', critical: true }
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
      description: 'Para má resposta após SABA/ipratrópio e corticoide sistêmico na 1ª hora.',
      type: 'question',
      content: `
        <div class="space-y-2 text-sm">
          <div class="bg-orange-50 p-3 rounded border-l-4 border-orange-500">
            <p><strong>Crise grave/refratária:</strong> se não houver resposta adequada após SABA/ipratrópio e corticoide sistêmico precoce, iniciar terapias adjuvantes de 2ª linha, com monitorização intensiva.</p>
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
      description: 'Primeira terapia adjuvante após má resposta ao tratamento inicial.',
      type: 'question',
      content: `
        <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500 text-sm">
          <p><strong>Sulfato de Magnésio IV:</strong> 2 g EV em 15-20 min, se ainda não realizado, para crise grave com resposta inadequada ao tratamento inicial.</p>
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
            <p><strong>Resposta incompleta não encerra o fluxo:</strong> manter o paciente em observação e repetir o esquema broncodilatador durante 2-4 horas.</p>
          </div>
          <div class="bg-slate-50 p-3 rounded border border-slate-200">
            <p>Continuar salbutamol, considerar manter ipratrópio conforme gravidade/resposta, manter corticoide sistêmico e monitorar evolução clínica seriada.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'Repetir esquema e manter observação por 2-4h', nextStep: 'asma_repetir_nebulizacao', value: 'observar_repetir' }
      ]
    },
    asma_repetir_nebulizacao: {
      id: 'asma_repetir_nebulizacao',
      title: 'Repetir Esquema Durante Observação',
      description: 'Broncodilatação seriada e manutenção do tratamento durante o período observacional.',
      type: 'question',
      content: `
        <div class="space-y-2 text-sm">
          <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500">
            <p><strong>Repetir o esquema broncodilatador:</strong> manter salbutamol em doses seriadas, geralmente a cada 1-2 horas, conforme resposta clínica e protocolo institucional.</p>
          </div>
          <div class="bg-slate-50 p-3 rounded border border-slate-200">
            <p>Se estava usando associação com ipratrópio, reavaliar a necessidade de mantê-la conforme gravidade e resposta. Manter corticoide sistêmico e observação por 2-4 horas.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'Após observação, reavaliar novamente', nextStep: 'asma_reavaliar_novamente', value: 'reavaliar_pos_obs' }
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
  name: 'Gastroenterite Aguda',
  description: 'Fluxo completo de avaliação, estratificação de gravidade, suporte e desfecho na gastroenterite aguda.',
  category: 'gastrointestinal',
  priority: 'medium',
  icon: 'activity',
  color: 'from-amber-500 to-orange-600',
  initialStep: 'start',
  finalSteps: ['not_geca', 'alta_orientacoes_final', 'internacao_hospitalar', 'emergency_transfer'],
  steps: {
    start: {
      id: 'start',
      title: 'Início',
      description: 'Paciente com suspeita de gastroenterocolite aguda.',
      type: 'question',
      content: `
        <div class="space-y-3">
          <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500">
            <strong>Suspeita clínica:</strong> diarreia e/ou vômitos de início agudo.
          </div>
        </div>
      `,
      options: [
        { text: 'Seguir admissão', nextStep: 'admissao_avaliacao_inicial', value: 'seguir' },
        { text: 'Quadro não compatível', nextStep: 'not_geca', value: 'nao_compat' }
      ]
    },
    not_geca: {
      id: 'not_geca',
      title: 'Não é GECA',
      description: 'Caso não compatível com gastroenterite aguda.',
      type: 'result',
      content: `
        <div class="bg-gray-50 p-4 rounded border-l-4 border-gray-500">
          <h4 class="font-bold text-gray-800">Encerrar Fluxo</h4>
          <p class="text-gray-700">Investigar diagnósticos diferenciais (abdominais, infecciosos e não infecciosos).</p>
        </div>
      `,
      options: []
    },
    admissao_avaliacao_inicial: {
      id: 'admissao_avaliacao_inicial',
      title: 'Admissão e Avaliação Inicial',
      description: 'Anamnese e exame físico direcionados.',
      type: 'action',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500">
            <strong>História clínica completa:</strong>
            <ul class="list-disc pl-5 mt-1 space-y-1">
              <li>Início dos sintomas, duração, número de evacuações e aspecto das fezes.</li>
              <li>Sangue/muco, vômitos, febre, dor abdominal e desidratação percebida.</li>
              <li>História epidemiológica: viagens, creche, surtos, uso recente de antibióticos e comorbidades.</li>
            </ul>
          </div>
          <div class="bg-slate-50 p-3 rounded border border-slate-200">
            <strong>Exame físico:</strong> estado geral, mucosas, turgor, pulso, PA, enchimento capilar, diurese e dor abdominal.
          </div>
        </div>
      `,
      options: [
        { text: 'Estratificar gravidade', nextStep: 'classificar_gravidade_geca', value: 'estratificar' }
      ]
    },
    classificar_gravidade_geca: {
      id: 'classificar_gravidade_geca',
      title: 'Classificar Gravidade',
      description: 'Definir abordagem inicial por gravidade.',
      type: 'question',
      content: `
        <div class="space-y-4 text-sm">
          <div class="bg-green-50 p-3 rounded border-l-4 border-green-500">
            <strong>LEVE</strong>
            <ul class="list-disc pl-5 mt-1">
              <li>Menos de 3 evacuações/dia.</li>
              <li>Sem sangue nas fezes e sem febre alta.</li>
              <li>Sem desidratação importante.</li>
            </ul>
          </div>
          <div class="bg-yellow-50 p-3 rounded border-l-4 border-yellow-500">
            <strong>MODERADA</strong>
            <ul class="list-disc pl-5 mt-1">
              <li>3 a 6 evacuações/dia e/ou febre baixa.</li>
              <li>Sinais de desidratação leve/moderada.</li>
              <li>Pode necessitar observação, TRO supervisionada e exames básicos.</li>
            </ul>
          </div>
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-500">
            <strong>GRAVE</strong>
            <ul class="list-disc pl-5 mt-1">
              <li>Maior ou igual a 6 evacuações/dia, sangue vivo ou melena.</li>
              <li>Febre alta, vômitos incoercíveis ou desidratação grave.</li>
              <li>Instabilidade hemodinâmica ou dor abdominal intensa.</li>
            </ul>
          </div>
        </div>
      `,
      options: [
        { text: 'Leve', nextStep: 'tro_oral_protocolo', value: 'leve' },
        { text: 'Moderada', nextStep: 'tro_oral_protocolo', value: 'moderada' },
        { text: 'Grave', nextStep: 'grave_manejo_inicial_geca', value: 'grave', critical: true }
      ]
    },
    tro_oral_protocolo: {
      id: 'tro_oral_protocolo',
      title: 'TRO (Hidratação Oral)',
      description: 'Reposição oral e dieta conforme tolerância.',
      type: 'action',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500">
            <strong>Hidratação oral (TRO):</strong>
            <ul class="list-disc pl-5 mt-1 space-y-1">
              <li>SRO em pequenos volumes, fracionado e frequente.</li>
              <li>Reposição após perdas (evacuações e vômitos).</li>
              <li>Manter alimentação habitual conforme tolerância.</li>
              <li>Evitar excesso de açúcares simples e bebidas irritativas.</li>
            </ul>
          </div>
          <div class="bg-slate-50 p-3 rounded border border-slate-200">
            <strong>Técnica:</strong> pausar 5-10 min após vômito e reiniciar lentamente.
          </div>
        </div>
      `,
      options: [
        { text: 'Adicionar sintomáticos', nextStep: 'sintomaticos_geca', value: 'sintomaticos' }
      ]
    },
    sintomaticos_geca: {
      id: 'sintomaticos_geca',
      title: 'Sintomáticos',
      description: 'Controle de náuseas, vômitos e dor.',
      type: 'action',
      content: `
        <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500 text-sm">
          <strong>Opções usuais:</strong>
          <ul class="list-disc pl-5 mt-1 space-y-1">
            <li>Antiemético para permitir TRO (ex.: ondansetrona em dose ajustada).</li>
            <li>Analgésico/antitérmico conforme perfil clínico.</li>
            <li>Evitar antidiarreico em suspeita de disenteria.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Reavaliar', nextStep: 'tro_support_response_geca', value: 'reavaliar' }
      ]
    },
    tro_support_response_geca: {
      id: 'tro_support_response_geca',
      title: 'Melhorou com TRO e Suporte?',
      description: 'Reavaliação clínica após hidratação e suporte inicial.',
      type: 'question',
      content: `
        <div class="space-y-2 text-sm">
          <p>Houve melhora clínica sustentada após TRO e medidas de suporte?</p>
          <ul class="list-disc pl-5">
            <li>Menor frequência de evacuações/vômitos.</li>
            <li>Melhor aceitação de líquidos/alimentos.</li>
            <li>Sinais de hidratação mais adequados.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Sim', nextStep: 'alta_orientacoes_final', value: 'sim' },
        { text: 'Não', nextStep: 'exames_basicos_laboratoriais_geca', value: 'nao' }
      ]
    },
    grave_manejo_inicial_geca: {
      id: 'grave_manejo_inicial_geca',
      title: 'Grave - Manejo Inicial',
      description: 'Estabilização imediata e início de suporte intensivo.',
      type: 'action',
      critical: true,
      timeSensitive: true,
      content: `
        <div class="bg-red-50 p-4 rounded border-l-4 border-red-600">
          <h4 class="font-bold text-red-800">Prioridade Máxima</h4>
          <ul class="list-disc pl-5 mt-2 text-sm text-red-800">
            <li>Monitorização contínua e avaliação frequente.</li>
            <li>Correção volêmica imediata e controle de eletrólitos.</li>
            <li>Considerar internação/transferência conforme estabilidade.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Solicitar exames e suporte', nextStep: 'exames_basicos_laboratoriais_geca', value: 'exames_suporte', critical: true }
      ]
    },
    exames_basicos_laboratoriais_geca: {
      id: 'exames_basicos_laboratoriais_geca',
      title: 'Exames Básicos Laboratoriais',
      description: 'Avaliação inicial laboratorial para casos sem resposta ou graves.',
      type: 'action',
      content: `
        <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500 text-sm">
          <strong>Solicitar:</strong>
          <ul class="list-disc pl-5 mt-1 space-y-1">
            <li>Hemograma e marcadores inflamatórios.</li>
            <li>Função renal (ureia/creatinina) e eletrólitos (Na, K, Cl).</li>
            <li>Gasometria venosa se acidose/sinais de gravidade.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Avaliar fezes', nextStep: 'exames_fezes_indicados_geca', value: 'fezes' }
      ]
    },
    exames_fezes_indicados_geca: {
      id: 'exames_fezes_indicados_geca',
      title: 'Exames de Fezes Indicados?',
      description: 'Definir necessidade de investigação etiológica específica.',
      type: 'question',
      content: `
        <div class="text-sm">
          <ul class="list-disc pl-5 space-y-1">
            <li>Diarreia com sangue/febre alta.</li>
            <li>Imunossuprimido, HIV, viagem recente ou creche/surto.</li>
            <li>Sintomas persistentes ou recorrentes.</li>
            <li>Suspeita de C. difficile (uso recente de antibiótico/internação).</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Sim', nextStep: 'exames_fezes_detalhados_geca', value: 'sim' },
        { text: 'Não', nextStep: 'exames_imagem_necessarios_geca', value: 'nao' }
      ]
    },
    exames_fezes_detalhados_geca: {
      id: 'exames_fezes_detalhados_geca',
      title: 'Exames de Fezes',
      description: 'Painel orientado por contexto clínico e epidemiológico.',
      type: 'action',
      content: `
        <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500 text-sm">
          <ul class="list-disc pl-5 space-y-1">
            <li>Coprocultura em casos graves/sangue nas fezes/surto.</li>
            <li>Parasitológico de fezes em persistência, viagem, HIV ou imunossupressão.</li>
            <li>Pesquisa de toxina/PCR para C. difficile quando indicado.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Avaliar necessidade de imagem', nextStep: 'exames_imagem_necessarios_geca', value: 'avaliar_imagem' }
      ]
    },
    exames_imagem_necessarios_geca: {
      id: 'exames_imagem_necessarios_geca',
      title: 'Exames de Imagem Necessários?',
      description: 'Avaliar dor intensa, complicação abdominal ou diagnóstico alternativo.',
      type: 'question',
      content: `
        <div class="text-sm">
          <ul class="list-disc pl-5 space-y-1">
            <li>Suspeita de abdome agudo, isquemia ou megacólon tóxico.</li>
            <li>Piora sem explicação após medidas iniciais.</li>
            <li>Sinais peritoneais, distensão importante ou dor desproporcional.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Sim', nextStep: 'imagem_endoscopia_geca', value: 'sim' },
        { text: 'Não', nextStep: 'decidir_suporte_geca', value: 'nao' }
      ]
    },
    imagem_endoscopia_geca: {
      id: 'imagem_endoscopia_geca',
      title: 'Imagem e Endoscopia',
      description: 'Exames direcionados em casos selecionados.',
      type: 'action',
      content: `
        <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500 text-sm">
          <ul class="list-disc pl-5 space-y-1">
            <li>Radiografia simples para avaliar distensão/perfuração.</li>
            <li>Tomografia com contraste se suspeita de complicação abdominal.</li>
            <li>Colonoscopia em cenário selecionado (suspeita inflamatória/pseudomembranosa).</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Decidir suporte clínico', nextStep: 'decidir_suporte_geca', value: 'suporte' }
      ]
    },
    decidir_suporte_geca: {
      id: 'decidir_suporte_geca',
      title: 'Hidratação Venosa / Internação?',
      description: 'Definir se há necessidade de suporte hospitalar.',
      type: 'question',
      content: `
        <div class="text-sm">
          <ul class="list-disc pl-5 space-y-1">
            <li>Persistência de intolerância oral.</li>
            <li>Distúrbio hidroeletrolítico importante.</li>
            <li>Instabilidade clínica ou impossibilidade de seguimento seguro.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Sim', nextStep: 'hidratacao_venosa_protocolo_geca', value: 'sim' },
        { text: 'Não', nextStep: 'criterios_internacao_geca', value: 'nao' }
      ]
    },
    hidratacao_venosa_protocolo_geca: {
      id: 'hidratacao_venosa_protocolo_geca',
      title: 'Hidratação Venosa',
      description: 'Protocolo completo de reposição venosa.',
      type: 'action',
      timeSensitive: true,
      content: `
        <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500 text-sm">
          <ul class="list-disc pl-5 space-y-1">
            <li>Iniciar cristaloide isotônico e ajustar por peso/perdas.</li>
            <li>Repor eletrólitos conforme monitorização seriada.</li>
            <li>Reintroduzir VO assim que houver melhora clínica.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Aplicar critérios de internação', nextStep: 'criterios_internacao_geca', value: 'criterios' }
      ]
    },
    criterios_internacao_geca: {
      id: 'criterios_internacao_geca',
      title: 'Critérios de Internação',
      description: 'Definir necessidade de manutenção em ambiente hospitalar.',
      type: 'question',
      content: `
        <div class="text-sm">
          <ul class="list-disc pl-5 space-y-1">
            <li>Instabilidade hemodinâmica ou desidratação grave persistente.</li>
            <li>Alterações laboratoriais importantes (Na, K, função renal, acidose).</li>
            <li>Incapacidade de manter VO, comorbidades relevantes ou alto risco social.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Internar', nextStep: 'internacao_hospitalar', value: 'internar', critical: true },
        { text: 'Sem necessidade de internação', nextStep: 'indicacao_antibiotico_empirico_geca', value: 'sem_internacao' }
      ]
    },
    indicacao_antibiotico_empirico_geca: {
      id: 'indicacao_antibiotico_empirico_geca',
      title: 'Indicação de Antibiótico Empírico?',
      description: 'Antibiótico não é rotina; usar apenas em cenários selecionados.',
      type: 'question',
      content: `
        <div class="text-sm">
          <ul class="list-disc pl-5 space-y-1">
            <li>Disenteria febril com toxemia/queda do estado geral.</li>
            <li>Suspeita de cólera grave.</li>
            <li>Imunossupressão grave ou sepse.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Sim', nextStep: 'antibiotico_empirico_esquemas_geca', value: 'sim' },
        { text: 'Não', nextStep: 'suspeita_c_difficile_geca', value: 'nao' }
      ]
    },
    antibiotico_empirico_esquemas_geca: {
      id: 'antibiotico_empirico_esquemas_geca',
      title: 'Antibiótico Empírico - Esquemas',
      description: 'Escolha orientada por perfil clínico e epidemiológico.',
      type: 'action',
      content: `
        <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500 text-sm">
          <ul class="list-disc pl-5 space-y-1">
            <li>Disenteria grave: opções como azitromicina/ciprofloxacino conforme resistência local.</li>
            <li>Cólera: considerar doxiciclina/azitromicina.</li>
            <li>Imunossuprimidos: ajustar conforme risco e gravidade.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Avaliar C. difficile', nextStep: 'suspeita_c_difficile_geca', value: 'avaliar_cdif' }
      ]
    },
    suspeita_c_difficile_geca: {
      id: 'suspeita_c_difficile_geca',
      title: 'Suspeita Diagnóstica de C. difficile?',
      description: 'Diarreia associada a antibiótico/internação recente.',
      type: 'question',
      options: [
        { text: 'Sim', nextStep: 'tratamento_c_difficile_geca', value: 'sim' },
        { text: 'Não', nextStep: 'parasitoses_identificadas_geca', value: 'nao' }
      ]
    },
    tratamento_c_difficile_geca: {
      id: 'tratamento_c_difficile_geca',
      title: 'Clostridioides difficile - Tratamento',
      description: 'Manejo conforme gravidade e protocolo local.',
      type: 'action',
      content: `
        <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500 text-sm">
          <ul class="list-disc pl-5 space-y-1">
            <li>Suspender antibiótico precipitante quando possível.</li>
            <li>Preferir vancomicina VO/fidaxomicina conforme disponibilidade e gravidade.</li>
            <li>Monitorar sinais de colite grave/megacólon tóxico.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Avaliar parasitoses', nextStep: 'parasitoses_identificadas_geca', value: 'avaliar_parasitoses' }
      ]
    },
    parasitoses_identificadas_geca: {
      id: 'parasitoses_identificadas_geca',
      title: 'Parasitoses Identificadas?',
      description: 'Decisão baseada em exames de fezes e contexto clínico.',
      type: 'question',
      options: [
        { text: 'Sim', nextStep: 'tratamento_parasitoses_geca', value: 'sim' },
        { text: 'Não', nextStep: 'reavaliacao_clinica_integrada_geca', value: 'nao' }
      ]
    },
    tratamento_parasitoses_geca: {
      id: 'tratamento_parasitoses_geca',
      title: 'Tratamento de Parasitoses',
      description: 'Terapia específica conforme agente etiológico.',
      type: 'action',
      content: `
        <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500 text-sm">
          <ul class="list-disc pl-5 space-y-1">
            <li>Giardíase/Amebíase: metronidazol/tinidazol conforme protocolo.</li>
            <li>Criptosporidiose e outros agentes: tratar conforme etiologia e imunidade.</li>
            <li>Orientar higiene, água segura e prevenção de reinfecção.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Reavaliar', nextStep: 'reavaliacao_clinica_integrada_geca', value: 'reavaliar' }
      ]
    },
    reavaliacao_clinica_integrada_geca: {
      id: 'reavaliacao_clinica_integrada_geca',
      title: 'Reavaliação Clínica Integrada',
      description: 'Síntese clínica para definir alta/seguimento.',
      type: 'question',
      content: `
        <div class="text-sm">
          <ul class="list-disc pl-5 space-y-1">
            <li>Checar hidratação, sintomas, sinais vitais e exames.</li>
            <li>Definir necessidade de ajuste terapêutico e seguimento.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Estável para alta/seguimento', nextStep: 'alta_orientacoes_final', value: 'alta' },
        { text: 'Sem estabilidade clínica', nextStep: 'internacao_hospitalar', value: 'internar', critical: true }
      ]
    },
    alta_orientacoes_final: {
      id: 'alta_orientacoes_final',
      title: 'Alta com Orientações',
      description: 'Desfecho com orientações de segurança e retorno.',
      type: 'result',
      content: `
        <div class="space-y-3">
          <div class="bg-green-50 p-3 rounded border-l-4 border-green-500">
            <h4 class="font-bold text-green-800">Alta com orientações</h4>
            <ul class="list-disc pl-5 mt-2 text-sm text-green-900 space-y-1">
              <li>Manter hidratação, alimentação habitual e reposição após perdas.</li>
              <li>Retornar se febre alta, sangue nas fezes, oligúria, letargia, piora da dor, persistência &gt; 7 dias ou intolerância oral.</li>
              <li>Programar reavaliação se idosos, crianças, imunossuprimidos ou comorbidades.</li>
            </ul>
          </div>
        </div>
      `,
      options: []
    },
    internacao_hospitalar: {
      id: 'internacao_hospitalar',
      title: 'Internação Hospitalar',
      description: 'Paciente sem critérios de segurança para manejo ambulatorial.',
      type: 'result',
      critical: true,
      content: `
        <div class="bg-red-50 p-4 rounded border-l-4 border-red-600">
          <h4 class="font-bold text-red-800">Manter em ambiente hospitalar</h4>
          <p class="text-red-700 text-sm mt-1">Seguir suporte clínico, monitorização e terapêutica direcionada conforme evolução.</p>
        </div>
      `,
      options: []
    },
    emergency_transfer: {
      id: 'emergency_transfer',
      title: 'Transferência para Emergência',
      description: 'Encaminhamento imediato para unidade de maior complexidade.',
      type: 'result',
      critical: true,
      content: `
        <div class="bg-red-50 p-4 rounded border-l-4 border-red-600">
          <h4 class="font-bold text-red-800">Transferência Realizada</h4>
          <p class="text-red-700">Paciente transferido para suporte avançado e monitorização intensiva.</p>
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
  finalSteps: ['tvp_excluida', 'seguimento_ambulatorial', 'anticoagulacao_iniciada', 'encaminhamento_urgente', 'tvp_urgencia_vascular_imediata', 'tvp_internacao_investigacao_clinica', 'tvp_internacao_investigar_tep'],
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
      description: 'Realizar ultrassonografia com Doppler de membros inferiores (MMII).',
      type: 'action',
      critical: true,
      content: `
        <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500 text-sm">
          <p><strong>Conduta direta:</strong> realizar USG com Doppler de membros inferiores (MMII) sem etapa prévia de D-dímero.</p>
        </div>
      `,
      options: [
        { text: 'Realizar USG com Doppler de membros inferiores (MMII)', nextStep: 'us_compressiva', value: 'direct_us', critical: true }
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
      title: 'USG Negativa - Reavaliação',
      description: 'Decisão baseada na persistência da suspeita clínica.',
      type: 'question',
      content: `
        <div class="bg-slate-50 p-3 rounded border border-slate-200 text-sm">
          <p>USG negativa não exclui TVP em suspeita clínica alta.</p>
          <p>Se persistir dúvida/suspeita clínica, repetir USG em 5–7 dias.</p>
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
      title: 'Encaminhamento para avaliação da Cirurgia Vascular',
      description: 'Encaminhar para avaliação especializada conforme cenário clínico.',
      type: 'result',
      critical: true,
      content: `
        <div class="bg-red-50 p-4 rounded border-l-4 border-red-600">
          <h4 class="font-bold text-red-800">Avaliação vascular prioritária</h4>
          <ul class="list-disc pl-5 text-red-700 text-sm mt-1">
            <li>Encaminhar para avaliação cirúrgica especializada com prioridade.</li>
            <li>Se anticoagulação já tiver sido iniciada, manter conduta até definição da equipe vascular.</li>
            <li>Em cenário de risco hemorrágico elevado, individualizar conduta e discutir estratégia com equipe de referência.</li>
            <li>Sinais de gravidade (flegmasia, dor intensa progressiva, suspeita de TEP associada) exigem prioridade máxima.</li>
          </ul>
        </div>
      `,
      options: []
    },
    tvp_urgencia_vascular_imediata: {
      id: 'tvp_urgencia_vascular_imediata',
      title: 'URGÊNCIA VASCULAR + INTERNAÇÃO IMEDIATA',
      description: 'Presença de sinal de alerta com gravidade local do membro, compatível com necessidade de avaliação vascular urgente.',
      type: 'result',
      critical: true,
      timeSensitive: true,
      content: `
        <div class="space-y-3">
          <div class="bg-red-100 p-4 rounded border-l-4 border-red-700 text-red-950">
            <h4 class="font-bold text-red-900">Interromper fluxo ambulatorial</h4>
            <p class="text-sm mt-1">Os <strong>quatro primeiros sinais de alerta</strong> desta caixa exigem <strong>internação hospitalar mandatória</strong> e <strong>acionamento urgente da Cirurgia Vascular</strong>.</p>
          </div>
          <div class="bg-red-50 p-4 rounded border border-red-300 text-sm text-red-900">
            <ul class="list-disc pl-5 space-y-1">
              <li>Suspeitar flegmasia cerulea dolens/TVP iliofemoral em edema súbito importante, dor intensa e cianose.</li>
              <li>Acionar avaliação vascular imediata e priorizar leito hospitalar.</li>
              <li>Persistindo suspeita de TEP associada, conduzir investigação em paralelo conforme estabilidade clínica.</li>
            </ul>
          </div>
        </div>
      `,
      options: []
    },
    tvp_internacao_investigacao_clinica: {
      id: 'tvp_internacao_investigacao_clinica',
      title: 'INTERNAÇÃO IMEDIATA + APROFUNDAMENTO DA INVESTIGAÇÃO',
      description: 'Situação de alto risco tromboembólico, com necessidade de internação mandatória e seguimento da investigação.',
      type: 'result',
      critical: true,
      timeSensitive: true,
      content: `
        <div class="space-y-3">
          <div class="bg-amber-100 p-4 rounded border-l-4 border-amber-700 text-amber-950">
            <h4 class="font-bold text-amber-900">Interromper fluxo ambulatorial</h4>
            <p class="text-sm mt-1"><strong>Alto risco de TVP</strong>. Deve-se proceder imediatamente na investigação. Solicitar exames pertinentes. <strong>Internação hospitalar mandatória</strong>.</p>
          </div>
          <div class="bg-amber-50 p-4 rounded border border-amber-300 text-sm text-amber-900">
            <ul class="list-disc pl-5 space-y-1">
              <li>Trata-se de situação de alto risco para evento tromboembólico.</li>
              <li>Manter investigação diagnóstica e acompanhamento intra-hospitalar conforme evolução clínica.</li>
              <li>Acionar outras especialidades apenas se houver achados adicionais que justifiquem avaliação direcionada.</li>
            </ul>
          </div>
        </div>
      `,
      options: []
    },
    tvp_internacao_investigar_tep: {
      id: 'tvp_internacao_investigar_tep',
      title: 'INTERNAÇÃO IMEDIATA + INVESTIGAÇÃO DE POSSÍVEL TEP',
      description: 'Presença de sintomas respiratórios sugestivos de tromboembolismo pulmonar associado.',
      type: 'result',
      critical: true,
      timeSensitive: true,
      content: `
        <div class="space-y-3">
          <div class="bg-red-100 p-4 rounded border-l-4 border-red-700 text-red-950">
            <h4 class="font-bold text-red-900">Interromper fluxo ambulatorial</h4>
            <p class="text-sm mt-1">Atenção para a possibilidade de <strong>embolia pulmonar</strong>. Deve-se solicitar investigação e exames pertinentes para o diagnóstico. <strong>Internação hospitalar mandatória</strong>.</p>
          </div>
          <div class="bg-red-50 p-4 rounded border border-red-300 text-sm text-red-900">
            <ul class="list-disc pl-5 space-y-1">
              <li>Reavaliar imediatamente estabilidade clínica, oxigenação e sinais de repercussão hemodinâmica.</li>
              <li>Prosseguir com investigação dirigida para TEP conforme protocolo institucional e disponibilidade local.</li>
              <li>Avaliação da Cirurgia Vascular não é automática neste cenário, salvo outros achados concomitantes que a indiquem.</li>
            </ul>
          </div>
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

export const influenzaFlowchart: EmergencyFlowchart = {
  id: 'influenza',
  name: 'Influenza / Síndrome Gripal',
  description: 'Estratificação de síndrome gripal, SRAG, necessidade de oseltamivir e nível de internação.',
  category: 'infectious',
  priority: 'high',
  icon: 'activity',
  color: 'from-sky-600 to-cyan-800',
  initialStep: 'start',
  finalSteps: [
    'influenza_ambulatorial_sintomaticos',
    'influenza_ambulatorial_oseltamivir',
    'influenza_internacao_enfermaria',
    'influenza_internacao_uti'
  ],
  steps: {
    start: {
      id: 'start',
      title: 'Paciente com sintomas de síndrome gripal',
      description: 'Definir se há sinais de gravidade e seguir a classificação clínica.',
      type: 'question',
      content: `
        <div class="space-y-4 text-sm">
          <div class="rounded-xl border border-sky-200 bg-sky-50 p-4">
            <p><strong>Síndrome gripal:</strong> na ausência de outro diagnóstico específico, considerar em paciente com <strong>febre</strong> (mesmo que referida) associada a <strong>tosse</strong> ou <strong>dor de garganta</strong>, somada a pelo menos um dos seguintes sintomas: <strong>mialgia</strong>, <strong>cefaleia</strong> ou <strong>artralgia</strong>.</p>
          </div>
          <div class="rounded-xl border border-red-200 bg-red-50 p-4">
            <p class="font-semibold text-red-800">Notificação e cuidados iniciais importantes</p>
            <ul class="list-disc pl-5 mt-2 space-y-1 text-red-900">
              <li>Considerar isolamento por gotículas e máscara cirúrgica para o paciente.</li>
              <li>Influenza A e B têm maior importância clínica em humanos.</li>
              <li>Oseltamivir deve ser priorizado em pacientes hospitalizados ou com fatores de risco para complicações.</li>
            </ul>
          </div>
          <details class="rounded-xl border border-slate-200 bg-white p-4">
            <summary class="cursor-pointer font-semibold text-slate-800">Ver pontos que não podem passar despercebidos</summary>
            <div class="mt-3 space-y-2 text-slate-700">
              <p>A influenza acomete vias aéreas superiores e inferiores e pode evoluir com <strong>síndrome respiratória aguda</strong>.</p>
              <p>O subtipo H1N1 mantém maior relevância clínica no Brasil, com incubação de <strong>1 a 7 dias</strong>.</p>
              <p>A principal complicação é a <strong>pneumonia viral</strong>, podendo haver coinfecção bacteriana associada.</p>
              <p>O tratamento antiviral indicado inclui <strong>oseltamivir</strong> ou <strong>zanamivir</strong>, com maior benefício quando iniciado nas primeiras 48 horas.</p>
              <p>Pacientes graves com pneumonia podem necessitar de <strong>antibioticoterapia de amplo espectro</strong> conforme avaliação clínica.</p>
            </div>
          </details>
          <details class="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
            <summary class="cursor-pointer font-semibold text-cyan-900">Esquema antiviral de referência</summary>
            <div class="mt-3 space-y-2 text-cyan-950">
              <p><strong>Adulto:</strong> oseltamivir 75 mg VO de 12/12 horas por 5 dias.</p>
              <p><strong>Criança &gt; 1 ano:</strong> dose por peso: 30 mg (&lt; 15 kg), 45 mg (&gt; 15 a 23 kg), 60 mg (&gt; 23 a 40 kg) ou 75 mg (&gt; 40 kg) VO de 12/12 horas por 5 dias.</p>
              <p><strong>Criança &lt; 1 ano:</strong> 12 mg (&lt; 3 meses), 20 mg (3 a 5 meses) ou 25 mg (6 a 11 meses) VO de 12/12 horas por 5 dias.</p>
              <p><strong>Zanamivir:</strong> 2 inalações de 5 mg de 12/12 horas por 5 dias em adultos e crianças a partir de 7 anos.</p>
            </div>
          </details>
        </div>
      `,
      options: [
        { text: 'Iniciar avaliação clínica', nextStep: 'influenza_sinais_gravidade', value: 'start_influenza' }
      ]
    },
    influenza_sinais_gravidade: {
      id: 'influenza_sinais_gravidade',
      title: 'Há sinais de gravidade?',
      description: 'Sinais de gravidade definem transição para SRAG e necessidade de avaliação hospitalar.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p class="font-semibold text-amber-900">Considerar gravidade quando houver:</p>
            <ul class="list-disc pl-5 mt-2 space-y-1 text-amber-900">
              <li>Dispneia</li>
              <li>Desconforto respiratório</li>
              <li>SatO2 menor que 95% em ar ambiente</li>
              <li>Exacerbação de doença de base</li>
            </ul>
          </div>
        </div>
      `,
      options: []
    },
    influenza_fatores_risco: {
      id: 'influenza_fatores_risco',
      title: 'Síndrome gripal - fatores de risco ou piora clínica',
      description: 'Na ausência de sinais de gravidade, decidir se há indicação ambulatorial de oseltamivir.',
      type: 'question',
      content: `
        <div class="space-y-3 text-sm">
          <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p class="font-semibold text-emerald-900">Sem gravidade imediata: avaliar fatores de risco e sinais de piora clínica.</p>
          </div>
        </div>
      `,
      options: []
    },
    influenza_criterios_uti: {
      id: 'influenza_criterios_uti',
      title: 'SRAG - há indicação de internação em UTI?',
      description: 'Definir nível de internação quando o paciente já apresenta sinais de gravidade.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="rounded-xl border border-rose-200 bg-rose-50 p-4">
            <p class="font-semibold text-rose-900">Critérios que favorecem UTI:</p>
            <ul class="list-disc pl-5 mt-2 space-y-1 text-rose-900">
              <li>Choque</li>
              <li>Disfunção de órgãos vitais</li>
              <li>Insuficiência respiratória</li>
              <li>Instabilidade hemodinâmica</li>
            </ul>
          </div>
        </div>
      `,
      options: []
    },
    influenza_ambulatorial_sintomaticos: {
      id: 'influenza_ambulatorial_sintomaticos',
      title: 'Ambulatorial',
      description: 'Tratamento sintomático e vigilância clínica.',
      type: 'result',
      generatesPrescription: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p><strong>Conduta:</strong> sintomáticos, aumento da ingestão de líquidos e retorno apenas se houver piora do quadro ou sinais de gravidade.</p>
            <p class="mt-2">Orientar etiqueta respiratória, hidratação adequada e reavaliação se febre persistente ou surgimento de dispneia.</p>
          </div>
        </div>
      `,
      options: []
    },
    influenza_ambulatorial_oseltamivir: {
      id: 'influenza_ambulatorial_oseltamivir',
      title: 'Ambulatorial com oseltamivir',
      description: 'Paciente sem gravidade imediata, mas com fator de risco ou piora clínica.',
      type: 'result',
      generatesPrescription: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p><strong>Conduta:</strong> oseltamivir, exames radiográficos quando pertinentes, sintomáticos, aumento da ingestão de líquidos e retorno em 48 horas ou antes se piora clínica/sinais de gravidade.</p>
            <p class="mt-2">Fatores de risco e sinais de piora clínica justificam início do antiviral mesmo sem SRAG.</p>
          </div>
        </div>
      `,
      options: []
    },
    influenza_internacao_enfermaria: {
      id: 'influenza_internacao_enfermaria',
      title: 'Internação em enfermaria',
      description: 'Paciente com SRAG sem critério imediato de UTI.',
      type: 'result',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <p><strong>Conduta:</strong> oseltamivir, considerar antibioticoterapia de amplo espectro quando houver suspeita de pneumonia/coinfecção bacteriana, exames radiográficos, sintomáticos, hidratação venosa, oxigenoterapia se necessária e exames complementares.</p>
            <p class="mt-2">Manter isolamento por gotículas e reavaliação seriada da necessidade de escalonamento para terapia intensiva.</p>
          </div>
        </div>
      `,
      options: []
    },
    influenza_internacao_uti: {
      id: 'influenza_internacao_uti',
      title: 'Internação em unidade intensiva',
      description: 'Paciente com SRAG e indicação de terapia intensiva.',
      type: 'result',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="rounded-xl border border-red-200 bg-red-50 p-4">
            <p><strong>Conduta:</strong> oseltamivir, considerar antibioticoterapia de amplo espectro quando houver suspeita de pneumonia/coinfecção bacteriana, exames radiográficos, sintomáticos, hidratação venosa, oxigenoterapia se necessária e exames complementares, com monitorização intensiva.</p>
            <p class="mt-2">Priorizar suporte ventilatório/hemodinâmico conforme necessidade e manutenção de monitorização intensiva contínua.</p>
          </div>
        </div>
      `,
      options: []
    }
  }
}

// Fluxograma de Pneumonia Adquirida na Comunidade (PAC)
export const pneumoniaFlowchart: EmergencyFlowchart = {
  id: 'pneumonia',
  name: 'Pneumonia Adquirida na Comunidade (PAC)',
  description: 'Manejo da PAC com triagem de gravidade, PSI preferencial, CURB-65 quando PSI não estiver disponível e antibioticoterapia por cenário clínico.',
  category: 'infectious',
  priority: 'high',
  icon: 'stethoscope',
  color: 'from-sky-600 to-cyan-700',
  initialStep: 'pac_inicio',
  finalSteps: [
    'pac_estabilizacao_seguir_sepse',
    'pac_internacao_limitacao',
    'pac_psi_baixo',
    'pac_psi_intermediario',
    'pac_psi_alto',
    'pac_curb_baixo',
    'pac_curb_intermediario',
    'pac_curb_alto'
  ],
  steps: {
    pac_inicio: {
      id: 'pac_inicio',
      title: 'PAC - Avaliação Inicial',
      description: 'Paciente com suspeita de pneumonia adquirida na comunidade.',
      type: 'question',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-sky-50 p-3 rounded border-l-4 border-sky-500">
            <p><strong>Não deixar passar:</strong> febre persistente, FR &gt; 25 irpm, expectoração, FC &gt; 100 bpm, estertores, queda de sons respiratórios, mialgia e sudorese noturna.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Idosos podem ter apresentação atípica: declínio cognitivo, fraqueza, perda de funcionalidade ou alteração de consciência.</li>
            <li>Radiografia de tórax é indicada em todos os pacientes, pois confirma diagnóstico e pesquisa derrame pleural/doença multilobar.</li>
            <li>Use escore para decisão de tratamento ambulatorial ou hospitalar. O PSI é preferencial por maior acurácia.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Iniciar triagem de gravidade', nextStep: 'pac_sepse_insuficiencia', value: 'iniciar' }
      ]
    },
    pac_sepse_insuficiencia: {
      id: 'pac_sepse_insuficiencia',
      title: 'Sinais de Sepse ou Insuficiência Respiratória Aguda?',
      description: 'Identificar necessidade de estabilização clínica imediata.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-2 text-sm">
          <p>Se houver sepse, choque, hipoxemia importante, esforço respiratório, rebaixamento ou falência ventilatória, interrompa o fluxo de escore e estabilize.</p>
        </div>
      `,
      options: [
        { text: 'Sim - estabilizar e seguir protocolo de sepse/ficha laranja-vermelha', nextStep: 'pac_estabilizacao_seguir_sepse', value: 'sim', critical: true, requiresImmediateAction: true },
        { text: 'Não - avaliar limitadores ambulatoriais', nextStep: 'pac_limitadores_ambulatoriais', value: 'nao' }
      ]
    },
    pac_limitadores_ambulatoriais: {
      id: 'pac_limitadores_ambulatoriais',
      title: 'Condição Limitante ao Tratamento Ambulatorial?',
      description: 'Via oral, vulnerabilidade social e doença mental limitante podem exigir internação independente do escore.',
      type: 'question',
      content: `
        <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500 text-sm">
          <p><strong>Internar independente do escore</strong> se houver impossibilidade de via oral, vulnerabilidade social ou doença mental limitante.</p>
        </div>
      `,
      options: [
        { text: 'Sim - internar para tratamento e suporte adequado', nextStep: 'pac_internacao_limitacao', value: 'sim', critical: true },
        { text: 'Não - decidir escore', nextStep: 'pac_escore_psi_disponivel', value: 'nao' }
      ]
    },
    pac_escore_psi_disponivel: {
      id: 'pac_escore_psi_disponivel',
      title: 'Escore PSI Disponível para Aplicação?',
      description: 'PSI é a ferramenta preferencial; CURB-65 é opção mais simples quando o PSI não puder ser aplicado.',
      type: 'question',
      content: `
        <div class="grid md:grid-cols-2 gap-3 text-sm">
          <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500">
            <p><strong>PSI:</strong> preferencial por maior acurácia. Usa dados demográficos, comorbidades, exame físico e exames laboratoriais.</p>
          </div>
          <div class="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
            <p><strong>CURB-65:</strong> simples e rápido à beira-leito, porém menos acurado.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'Calcular PSI', nextStep: 'pac_calcular_psi', value: 'psi' },
        { text: 'Calcular CURB-65', nextStep: 'pac_calcular_curb65', value: 'curb65' }
      ]
    },
    pac_calcular_psi: {
      id: 'pac_calcular_psi',
      title: 'Calculadora PSI (Pneumonia Severity Index)',
      description: 'Pontue fatores demográficos, comorbidades, exame físico e exames laboratoriais.',
      type: 'question',
      options: [
        { text: 'Aplicar PSI', nextStep: 'pac_psi_baixo', value: 'psi' }
      ]
    },
    pac_calcular_curb65: {
      id: 'pac_calcular_curb65',
      title: 'Calculadora CURB-65',
      description: 'Pontue confusão, ureia, frequência respiratória, pressão arterial e idade.',
      type: 'question',
      options: [
        { text: 'Aplicar CURB-65', nextStep: 'pac_curb_baixo', value: 'curb65' }
      ]
    },
    pac_estabilizacao_seguir_sepse: {
      id: 'pac_estabilizacao_seguir_sepse',
      title: 'Estabilização Clínica Imediata',
      description: 'Seguir protocolo de sepse/ficha laranja-vermelha.',
      type: 'result',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-600">
            <p><strong>Conduta:</strong> oxigênio conforme alvo, acesso venoso, monitorização, lactato/culturas quando indicado, antibiótico precoce e suporte hemodinâmico/ventilatório.</p>
          </div>
          <p>Após estabilização, definir local de internação e antibioticoterapia hospitalar conforme gravidade e risco de Pseudomonas.</p>
        </div>
      `,
      options: []
    },
    pac_internacao_limitacao: {
      id: 'pac_internacao_limitacao',
      title: 'Internação por Limitador Ambulatorial',
      description: 'Tratamento e suporte adequado independente do escore de risco.',
      type: 'result',
      content: `
        <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500 text-sm">
          <p><strong>Destino:</strong> internação para garantir via de administração, observação clínica, suporte social e adesão terapêutica.</p>
        </div>
      `,
      options: []
    },
    pac_psi_baixo: {
      id: 'pac_psi_baixo',
      title: 'PSI Baixo - PORT I/II',
      description: 'Tratamento ambulatorial se não houver limitadores ou instabilidade clínica.',
      type: 'result',
      group: 'PORT I/II',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500">
            <p><strong>Conduta:</strong> tratamento ambulatorial, retorno em 48 a 72 horas ou antes se piora.</p>
          </div>
          <p><strong>Antibioticoterapia:</strong> previamente hígidos podem receber beta-lactâmico ou macrolídeo; com comorbidades/ATB recente, preferir beta-lactâmico + macrolídeo ou quinolona.</p>
        </div>
      `,
      options: []
    },
    pac_psi_intermediario: {
      id: 'pac_psi_intermediario',
      title: 'PSI Intermediário - PORT III/IV',
      description: 'Internação em enfermaria.',
      type: 'result',
      group: 'PORT III/IV',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-yellow-50 p-3 rounded border-l-4 border-yellow-500">
            <p><strong>Destino:</strong> internação em enfermaria.</p>
          </div>
          <p><strong>Sem risco para Pseudomonas:</strong> ceftriaxona + azitromicina ou claritromicina.</p>
          <p><strong>Com risco para Pseudomonas:</strong> piperacilina-tazobactam associada a azitromicina, claritromicina ou levofloxacino.</p>
        </div>
      `,
      options: []
    },
    pac_psi_alto: {
      id: 'pac_psi_alto',
      title: 'PSI Alto - PORT V',
      description: 'Internação em terapia intensiva.',
      type: 'result',
      group: 'PORT V',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-600">
            <p><strong>Destino:</strong> internação em terapia intensiva.</p>
          </div>
          <p>Definir antibioticoterapia hospitalar conforme risco de Pseudomonas e perfil local. Considerar corticoterapia na pneumonia grave conforme avaliação clínica e protocolo institucional.</p>
        </div>
      `,
      options: []
    },
    pac_curb_baixo: {
      id: 'pac_curb_baixo',
      title: 'CURB-65 0 ou 1',
      description: 'Tratamento ambulatorial.',
      type: 'result',
      group: 'CURB 0-1',
      content: `
        <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500 text-sm">
          <p><strong>Conduta:</strong> tratamento ambulatorial com retorno em 48 a 72 horas ou antes se piora.</p>
        </div>
      `,
      options: []
    },
    pac_curb_intermediario: {
      id: 'pac_curb_intermediario',
      title: 'CURB-65 = 2',
      description: 'Internação hospitalar.',
      type: 'result',
      group: 'CURB 2',
      content: `
        <div class="bg-yellow-50 p-3 rounded border-l-4 border-yellow-500 text-sm">
          <p><strong>Conduta:</strong> internação hospitalar para antibioticoterapia e monitorização.</p>
        </div>
      `,
      options: []
    },
    pac_curb_alto: {
      id: 'pac_curb_alto',
      title: 'CURB-65 3 a 5',
      description: 'Internação hospitalar; considerar UTI se 4 ou 5 pontos.',
      type: 'result',
      group: 'CURB 3-5',
      critical: true,
      content: `
        <div class="bg-red-50 p-3 rounded border-l-4 border-red-600 text-sm">
          <p><strong>Conduta:</strong> internação hospitalar. Considerar UTI se escore 4 ou 5 ou se houver instabilidade clínica.</p>
        </div>
      `,
      options: []
    }
  }
}

// Fluxograma de Rinossinusites (viral, alérgica e bacteriana)
export const sinusitisFlowchart: EmergencyFlowchart = {
  id: 'sinusite',
  name: 'Rinossinusites Viral, Alérgica e Bacteriana',
  description: 'Classificação prática das rinossinusites com foco em evitar antibiótico desnecessário e identificar critérios bacterianos.',
  category: 'otorhinolaryngological',
  priority: 'medium',
  icon: 'stethoscope',
  color: 'from-teal-600 to-cyan-700',
  initialStep: 'rino_inicio',
  finalSteps: [
    'rino_internacao_alerta',
    'rino_alergica',
    'rino_viral',
    'rino_bacteriana',
    'rino_reavaliar_sem_antibiotico'
  ],
  steps: {
    rino_inicio: {
      id: 'rino_inicio',
      title: 'Rinossinusite - Avaliação Inicial',
      description: 'Paciente com congestão nasal, rinorreia, dor/pressão facial, tosse ou sintomas nasossinusais.',
      type: 'question',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-cyan-50 p-3 rounded border-l-4 border-cyan-500">
            <p><strong>Essencial:</strong> as causas mais comuns são alergia e vírus respiratórios, responsáveis por mais de 80% dos casos.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Rinossinusites virais costumam melhorar espontaneamente em 7 a 10 dias.</li>
            <li>Imagem geralmente não ajuda no manejo inicial; radiografia simples dos seios da face não é recomendada na rinossinusite aguda.</li>
            <li>O tratamento sintomático se baseia em lavagem nasal, corticosteroide nasal e medicações para dor/febre.</li>
            <li>Descongestionante nasal pode ajudar, mas não deve ser usado por mais de 5 a 10 dias pelo risco de rinite medicamentosa.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Iniciar classificação', nextStep: 'rino_sinais_internacao', value: 'iniciar' }
      ]
    },
    rino_sinais_internacao: {
      id: 'rino_sinais_internacao',
      title: 'Há Sinais de Complicação ou Internação?',
      description: 'Pesquisar sinais orbitários, neurológicos, sepse ou dor intensa refratária.',
      type: 'question',
      critical: true,
      content: `
        <div class="bg-red-50 p-3 rounded border-l-4 border-red-600 text-sm">
          <p><strong>Internar/encaminhar imediatamente</strong> se houver diplopia, redução visual, alteração de mobilidade ocular, proptose, sinais meníngeos, alteração mental, sepse ou dor facial/cefaleia intensa sem resposta a medicação oral.</p>
        </div>
      `,
      options: [
        { text: 'Sim - indicar internação/avaliação urgente', nextStep: 'rino_internacao_alerta', value: 'internacao', critical: true, requiresImmediateAction: true },
        { text: 'Não - seguir classificação etiológica', nextStep: 'rino_padrao_alergico', value: 'sem_alerta' }
      ]
    },
    rino_padrao_alergico: {
      id: 'rino_padrao_alergico',
      title: 'Predomínio de Padrão Alérgico?',
      description: 'Coriza hialina crônica, prurido/congestão ocular, espirros, sibilância ou história atópica.',
      type: 'question',
      content: `
        <div class="space-y-2 text-sm">
          <p>Rinossinusites alérgicas costumam vir associadas a coriza hialina crônica, sibilância, congestão/prurido ocular e sintomas recorrentes com gatilhos.</p>
          <p><strong>Antibiótico não é indicado</strong> quando o quadro é predominantemente alérgico e não há critérios bacterianos.</p>
        </div>
      `,
      options: [
        { text: 'Sim - rinossinusite alérgica', nextStep: 'rino_alergica', value: 'alergica' },
        { text: 'Não - avaliar duração e piora', nextStep: 'rino_duracao_menor_10_sem_piora', value: 'nao_alergica' }
      ]
    },
    rino_duracao_menor_10_sem_piora: {
      id: 'rino_duracao_menor_10_sem_piora',
      title: 'Sintomas por Menos de 10 Dias e Sem Sinais de Piora?',
      description: 'Quadros virais costumam resolver espontaneamente, sem antibiótico.',
      type: 'question',
      content: `
        <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500 text-sm">
          <p>Se sintomas duram menos de 10 dias e não há piora após fase inicial, a etiologia mais provável é viral. Não prescrever antibiótico.</p>
        </div>
      `,
      options: [
        { text: 'Sim - rinossinusite viral', nextStep: 'rino_viral', value: 'viral' },
        { text: 'Não - pesquisar critérios bacterianos', nextStep: 'rino_criterios_bacterianos', value: 'avaliar_bacteriana' }
      ]
    },
    rino_criterios_bacterianos: {
      id: 'rino_criterios_bacterianos',
      title: 'Mais de 10 Dias ou Piora Após o 5º Dia?',
      description: 'A duração prolongada ou piora pós-viral favorece etiologia bacteriana.',
      type: 'question',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500">
            <p><strong>Considere antibiótico</strong> se houver duração maior que 10 dias ou piora após o 5º dia, especialmente com rinorreia unilateral/purulenta, dor facial unilateral intensa ou febre.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Piora após fase inicial.</li>
            <li>Rinorreia predominantemente unilateral.</li>
            <li>Rinorreia posterior purulenta.</li>
            <li>Dor facial unilateral intensa.</li>
            <li>Febre ≥ 37,8°C.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Sim - considerar antibiótico', nextStep: 'rino_bacteriana', value: 'bacteriana' },
        { text: 'Não - sintomáticos e reavaliação', nextStep: 'rino_reavaliar_sem_antibiotico', value: 'sem_criterio_bacteriano' }
      ]
    },
    rino_alergica: {
      id: 'rino_alergica',
      title: 'Rinossinusite Alérgica',
      description: 'Manejo sem antibiótico, com foco em controle nasal e reavaliação.',
      type: 'result',
      group: 'Alérgica',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-sky-50 p-3 rounded border-l-4 border-sky-500">
            <p><strong>Conduta:</strong> não prescrever antibiótico. Usar lavagem nasal, corticosteroide nasal e sintomáticos para dor/febre quando necessário.</p>
          </div>
          <p>Anti-histamínicos não têm papel no tratamento da rinossinusite aguda; individualizar apenas se o quadro de rinite alérgica associada for predominante.</p>
        </div>
      `,
      options: []
    },
    rino_viral: {
      id: 'rino_viral',
      title: 'Rinossinusite Viral',
      description: 'Menos de 10 dias, sem sinais de piora: não usar antibiótico.',
      type: 'result',
      group: 'Viral',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500">
            <p><strong>Conduta:</strong> não prescrever antibiótico. A maioria resolve espontaneamente.</p>
          </div>
          <p>Orientar lavagem nasal, corticosteroide nasal, sintomáticos para dor/febre e retorno se febre persistente, piora clínica ou sinais orbitários/neurológicos.</p>
        </div>
      `,
      options: []
    },
    rino_bacteriana: {
      id: 'rino_bacteriana',
      title: 'Rinossinusite Bacteriana',
      description: 'Mais de 10 dias ou piora após o 5º dia, com critérios compatíveis.',
      type: 'result',
      group: 'Bacteriana',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500">
            <p><strong>Conduta:</strong> considerar antibiótico associado a tratamento sintomático.</p>
          </div>
          <p><strong>Antibióticos de escolha:</strong> amoxicilina 500 mg VO 8/8h por 5 a 7 dias; amoxicilina + clavulanato 875/125 mg VO 12/12h por 5 a 7 dias; cefuroxima 500 mg VO 12/12h por 5 a 7 dias; doxiciclina 100 mg VO 12/12h por 5 a 7 dias.</p>
        </div>
      `,
      options: []
    },
    rino_reavaliar_sem_antibiotico: {
      id: 'rino_reavaliar_sem_antibiotico',
      title: 'Sem Critério Bacteriano Atual',
      description: 'Tratamento sintomático e reavaliação clínica.',
      type: 'result',
      content: `
        <div class="bg-blue-50 p-3 rounded border-l-4 border-blue-500 text-sm">
          <p><strong>Conduta:</strong> não iniciar antibiótico neste momento. Tratar sintomas e orientar retorno se passar de 10 dias, piorar após o 5º dia ou surgirem sinais de complicação.</p>
        </div>
      `,
      options: []
    },
    rino_internacao_alerta: {
      id: 'rino_internacao_alerta',
      title: 'Indicação de Internação/Avaliação Urgente',
      description: 'Sinais de complicação orbitária, neurológica, sepse ou dor refratária.',
      type: 'result',
      critical: true,
      content: `
        <div class="bg-red-50 p-3 rounded border-l-4 border-red-600 text-sm">
          <p><strong>Conduta:</strong> encaminhar para avaliação hospitalar/urgência, considerar imagem avançada e avaliação especializada conforme quadro.</p>
        </div>
      `,
      options: []
    }
  }
}

// Fluxograma de atendimento de emergência para Anafilaxia (WAO 2020)
export const anaphylaxisFlowchart: EmergencyFlowchart = {
  id: 'anafilaxia',
  name: 'Anafilaxia',
  description: 'Reconhecimento precoce pelos critérios WAO 2020, adrenalina IM imediata, tratamento adjunto por ABCDE e reavaliação em 5-10 minutos.',
  category: 'allergic',
  priority: 'high',
  icon: 'zap',
  color: 'from-red-600 to-rose-800',
  initialStep: 'ana_inicio',
  finalSteps: [
    'ana_sem_criterios_observar',
    'ana_observacao_alta',
    'ana_repetir_adrenalina_internacao',
    'ana_internacao_via_aerea_choque'
  ],
  steps: {
    ana_inicio: {
      id: 'ana_inicio',
      title: 'Anafilaxia - Reconhecimento Imediato',
      description: 'Início agudo em minutos ou poucas horas: não retardar adrenalina IM quando critérios são atendidos.',
      type: 'question',
      critical: true,
      timeSensitive: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-600">
            <p><strong>Anafilaxia = reconhecimento precoce + adrenalina IM sem atraso.</strong></p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>ABCDe primário imediatamente.</li>
            <li>Retirar o agente causal se possível.</li>
            <li>Posicionar em Trendelenburg/elevar pernas se hipotensão ou colapso.</li>
            <li>Sintomas cutâneos podem estar ausentes durante hipotensão.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Aplicar critérios WAO 2020', nextStep: 'ana_criterios_wao', value: 'avaliar' }
      ]
    },
    ana_criterios_wao: {
      id: 'ana_criterios_wao',
      title: 'Critérios Diagnósticos WAO 2020',
      description: 'Definir se há anafilaxia provável e iniciar adrenalina IM.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <p><strong>Cenário 1:</strong> início agudo com pele/mucosas e pelo menos comprometimento respiratório, circulatório ou gastrointestinal grave.</p>
          <p><strong>Cenário 2:</strong> alérgeno conhecido/suspeito com hipotensão, broncoespasmo ou envolvimento laríngeo, mesmo sem pele/mucosas.</p>
        </div>
      `,
      options: [
        { text: 'Critérios preenchidos / alta suspeita', nextStep: 'ana_adrenalina_im', value: 'anafilaxia', critical: true, requiresImmediateAction: true },
        { text: 'Critérios não preenchidos', nextStep: 'ana_sem_criterios_observar', value: 'sem_criterios' }
      ]
    },
    ana_adrenalina_im: {
      id: 'ana_adrenalina_im',
      title: 'Adrenalina IM Imediata',
      description: 'Aplicar no músculo vasto lateral da coxa. Repetir até 3 doses a cada 5-15 minutos se necessário.',
      type: 'medication',
      critical: true,
      timeSensitive: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-yellow-50 p-3 rounded border-l-4 border-yellow-500">
            <p><strong>Apresentação:</strong> adrenalina 1:1000 = 1 mg/mL.</p>
            <p><strong>Local:</strong> intramuscular no vasto lateral da coxa.</p>
          </div>
          <p>Após adrenalina, realizar tratamento adjunto conforme ABCDE e manifestação clínica dominante.</p>
        </div>
      `,
      options: [
        { text: 'Selecionar tratamento adjunto', nextStep: 'ana_tratamento_adjunto', value: 'adrenalina_aplicada', critical: true }
      ]
    },
    ana_tratamento_adjunto: {
      id: 'ana_tratamento_adjunto',
      title: 'Tratamento Adjunto após Adrenalina',
      description: 'Selecionar condutas conforme hipotensão, estridor, dispneia, urticária e vômitos.',
      type: 'question',
      critical: true,
      content: `
        <div class="bg-orange-50 p-3 rounded border-l-4 border-orange-500 text-sm">
          <p>Tratamento adjunto nunca substitui adrenalina IM. Conduzir ABCDE, oxigênio, volume, broncodilatador, anti-histamínico/corticoide e antiemético conforme manifestação.</p>
        </div>
      `,
      options: [
        { text: 'Reavaliar em 5-10 minutos', nextStep: 'ana_reavaliacao_5_10', value: 'adjunto' }
      ]
    },
    ana_reavaliacao_5_10: {
      id: 'ana_reavaliacao_5_10',
      title: 'Reavaliação após 5-10 minutos',
      description: 'Avaliar resposta clínica depois de adrenalina IM e tratamento adjunto.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-2 text-sm">
          <p>Reavaliar via aérea, respiração, circulação, estado mental, urticária/angioedema e sintomas gastrointestinais.</p>
          <p>Se sem resposta, repetir adrenalina IM e considerar adrenalina EV, glucagon em usuário de beta-bloqueador e manejo avançado de via aérea.</p>
        </div>
      `,
      options: [
        { text: 'Resposta clínica adequada', nextStep: 'ana_observacao_alta', value: 'resposta' },
        { text: 'Sem resposta / piora', nextStep: 'ana_repetir_adrenalina_internacao', value: 'sem_resposta', critical: true, requiresImmediateAction: true },
        { text: 'Via aérea/choque crítico', nextStep: 'ana_internacao_via_aerea_choque', value: 'critico', critical: true, requiresImmediateAction: true }
      ]
    },
    ana_sem_criterios_observar: {
      id: 'ana_sem_criterios_observar',
      title: 'Sem Critérios de Anafilaxia no Momento',
      description: 'Observar e reavaliar se progressão de sintomas.',
      type: 'result',
      content: `
        <div class="bg-blue-50 p-3 rounded border-l-4 border-blue-500 text-sm">
          <p><strong>Conduta:</strong> manter observação clínica, revisar exposição, orientar retorno imediato se surgirem sintomas respiratórios, circulatórios, laríngeos ou gastrointestinais graves.</p>
        </div>
      `,
      options: []
    },
    ana_observacao_alta: {
      id: 'ana_observacao_alta',
      title: 'Observação em Emergência',
      description: 'Manter observação por no mínimo 4 horas; alguns casos exigem 6-24 horas.',
      type: 'result',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500">
            <p><strong>Conduta:</strong> observar por no mínimo 4 horas após resolução. Considerar 6-24 horas se reação grave, necessidade de múltiplas doses de adrenalina, asma, hipotensão ou difícil acesso ao retorno.</p>
          </div>
          <p>Na alta: orientar recidiva em 24-72 horas, evitar fator causal e encaminhar ao especialista.</p>
        </div>
      `,
      options: []
    },
    ana_repetir_adrenalina_internacao: {
      id: 'ana_repetir_adrenalina_internacao',
      title: 'Sem Resposta: Repetir Adrenalina IM',
      description: 'Repetir adrenalina IM e preparar internação/suporte avançado.',
      type: 'result',
      critical: true,
      timeSensitive: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-600">
            <p><strong>Conduta:</strong> repetir adrenalina IM, manter ABCDE, oxigênio alto fluxo, expansão volêmica e monitorização.</p>
          </div>
          <p>Considerar adrenalina EV em ambiente monitorizado, glucagon se uso de beta-bloqueador, e internação.</p>
        </div>
      `,
      options: []
    },
    ana_internacao_via_aerea_choque: {
      id: 'ana_internacao_via_aerea_choque',
      title: 'Anafilaxia Crítica: Via Aérea/Choque',
      description: 'Manejo avançado imediato e internação.',
      type: 'result',
      critical: true,
      requiresSpecialist: true,
      content: `
        <div class="bg-red-50 p-3 rounded border-l-4 border-red-600 text-sm">
          <p><strong>Conduta:</strong> acionar equipe de via aérea/suporte avançado, considerar intubação precoce em edema laríngeo, adrenalina EV em ambiente monitorizado se choque refratário, volume agressivo e internação.</p>
        </div>
      `,
      options: []
    }
  }
}

// Fluxograma de Lombalgia
export const lombalgiaFlowchart: EmergencyFlowchart = {
  id: 'lombalgia',
  name: 'Lombalgia',
  description: 'Estratificação de sinais de alarme, indicação de imagem e tratamento conservador da lombalgia aguda.',
  category: 'musculoskeletal',
  priority: 'medium',
  icon: 'activity',
  color: 'from-slate-600 to-zinc-800',
  initialStep: 'lomb_inicio',
  finalSteps: [
    'lomb_cauda_equina',
    'lomb_imagem_neoplasia',
    'lomb_imagem_infeccao',
    'lomb_radiografia_fratura',
    'lomb_conservador'
  ],
  steps: {
    lomb_inicio: {
      id: 'lomb_inicio',
      title: 'Lombalgia Aguda sem Trauma Evidente',
      description: 'Avaliar sinais de alarme para decidir imagem, internação ou tratamento conservador.',
      type: 'question',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-slate-50 p-3 rounded border-l-4 border-slate-500">
            <p><strong>Lombalgia aguda:</strong> dor lombar com duração inferior a 4 semanas. Na maioria dos casos não há causa específica identificável e há melhora com medidas conservadoras.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Imagem é necessária quando há sinais de alarme ou ausência de melhora após 4 a 6 semanas.</li>
            <li>Ressonância magnética é preferencial para suspeita de causas graves.</li>
            <li>Radiografia é indicada para suspeita de fratura, especialmente em idosos, mesmo sem trauma evidente.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Avaliar sinais de alarme', nextStep: 'lomb_red_flags', value: 'avaliar' }
      ]
    },
    lomb_red_flags: {
      id: 'lomb_red_flags',
      title: 'Indico ou não exame de imagem?',
      description: 'Cauda equina, neoplasia, infecção espinhal e risco de fratura vertebral.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-2 text-sm">
          <p><strong>Cauda equina:</strong> nova retenção/incontinência urinária, incontinência fecal ou anestesia em sela.</p>
          <p><strong>Red flags:</strong> neoplasia, infecção espinhal e risco de fratura de compressão mudam a conduta inicial.</p>
        </div>
      `,
      options: [
        { text: 'Aplicar triagem', nextStep: 'lomb_conservador', value: 'triagem' }
      ]
    },
    lomb_cauda_equina: {
      id: 'lomb_cauda_equina',
      title: 'Suspeita de Síndrome da Cauda Equina',
      description: 'Urgência neurológica.',
      type: 'result',
      group: 'Urgência',
      critical: true,
      requiresSpecialist: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-600">
            <p><strong>Conduta:</strong> internação hospitalar, ressonância magnética e avaliação de neurocirurgia de urgência.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Não atrasar avaliação especializada se houver retenção/incontinência urinária, incontinência fecal ou anestesia em sela.</li>
            <li>Monitorar força, sensibilidade, reflexos, dor e função esfincteriana.</li>
          </ul>
        </div>
      `,
      options: []
    },
    lomb_imagem_neoplasia: {
      id: 'lomb_imagem_neoplasia',
      title: 'Imagem Indicada - Suspeita de Neoplasia',
      description: 'Histórico de câncer atual/passado ou alta suspeita clínica.',
      type: 'result',
      group: 'Imagem',
      requiresSpecialist: true,
      content: `
        <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500 text-sm">
          <p><strong>Conduta:</strong> exame de imagem está indicado, preferindo ressonância magnética quando disponível; investigar neoplasia/metástase conforme quadro.</p>
        </div>
      `,
      options: []
    },
    lomb_imagem_infeccao: {
      id: 'lomb_imagem_infeccao',
      title: 'Imagem Indicada - Risco de Infecção Espinhal',
      description: 'Febre, imunossupressão, hemodiálise, drogas injetáveis, endocardite ou bacteremia.',
      type: 'result',
      group: 'Imagem',
      critical: true,
      requiresSpecialist: true,
      content: `
        <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500 text-sm">
          <p><strong>Conduta:</strong> exame de imagem está indicado, preferindo ressonância magnética. Investigar infecção espinhal e considerar avaliação hospitalar conforme gravidade.</p>
        </div>
      `,
      options: []
    },
    lomb_radiografia_fratura: {
      id: 'lomb_radiografia_fratura',
      title: 'Radiografia de Coluna Indicada',
      description: 'Risco de fratura vertebral de compressão.',
      type: 'result',
      group: 'Radiografia',
      content: `
        <div class="bg-yellow-50 p-3 rounded border-l-4 border-yellow-500 text-sm">
          <p><strong>Conduta:</strong> solicitar radiografia de coluna em suspeita de fratura, especialmente em idosos, osteoporose, uso crônico de corticosteroides ou trauma significativo.</p>
        </div>
      `,
      options: []
    },
    lomb_conservador: {
      id: 'lomb_conservador',
      title: 'Sem Necessidade Inicial de Imagem',
      description: 'Sem red flags para câncer, infecção, fratura ou lesões neurológicas graves.',
      type: 'result',
      group: 'Conservador',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500">
            <p><strong>Conduta:</strong> tratamento conservador por 4 a 6 semanas.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>AINEs e analgésicos comuns são primeira linha.</li>
            <li>Opioides fracos podem ser considerados em dor intensa ou refratária.</li>
            <li>Orientar repouso curto e retorno gradual às atividades assim que possível.</li>
            <li>Retornar se piora, déficit neurológico, febre alta ou alteração esfincteriana.</li>
          </ul>
        </div>
      `,
      options: []
    }
  }
}

// Fluxograma de Apendicite Aguda
export const appendicitisFlowchart: EmergencyFlowchart = {
  id: 'appendicitis',
  name: 'Apendicite Aguda',
  description: 'Manejo inicial, escore de Alvarado, estratificação de risco, imagem e conduta cirúrgica.',
  category: 'gastrointestinal',
  priority: 'high',
  icon: 'activity',
  color: 'from-rose-600 to-red-700',
  initialStep: 'apend_inicio',
  finalSteps: [
    'apend_cirurgia_emergencia',
    'apend_baixo_risco',
    'apend_moderado_risco',
    'apend_alto_risco'
  ],
  steps: {
    apend_inicio: {
      id: 'apend_inicio',
      title: 'Suspeita de Apendicite Aguda no PS',
      description: 'Dor abdominal periumbilical que migra para FID, associada a náuseas/vômitos, febre e anorexia.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-rose-50 p-3 rounded border-l-4 border-rose-500">
            <p><strong>Quadro típico:</strong> dor inicialmente periumbilical que evolui para dor intensa localizada em fossa ilíaca direita, associada a anorexia, náuseas/vômitos e febre.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li><strong>Blumberg:</strong> dor à descompressão súbita no ponto de McBurney.</li>
            <li><strong>Psoas:</strong> dor na hiperextensão passiva ou flexão ativa do MID em decúbito lateral esquerdo.</li>
            <li><strong>Obturador:</strong> dor hipogástrica à flexão e rotação interna do quadril.</li>
            <li>Em mulheres em idade reprodutiva, sempre solicitar beta-hCG e considerar diferenciais ginecológicos/urinários.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Iniciar medidas no pronto-socorro', nextStep: 'apend_medidas_iniciais', value: 'suspeita_apendicite' }
      ]
    },
    apend_medidas_iniciais: {
      id: 'apend_medidas_iniciais',
      title: 'Medidas Iniciais',
      description: 'Coleta de exames, dieta zero, ABCDE, hidratação e acesso venoso.',
      type: 'question',
      critical: true,
      content: `
        <div class="grid gap-3 md:grid-cols-2 text-sm">
          <div class="bg-sky-50 p-3 rounded border-l-4 border-sky-500">
            <p><strong>Exames iniciais:</strong> hemograma completo, PCR, EAS, função renal, beta-hCG em mulheres férteis e outros conforme contexto/investigação.</p>
          </div>
          <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500">
            <p><strong>Suporte:</strong> dieta zero até definição, estabilização clínica ABCDE, hidratação adequada e acesso venoso.</p>
          </div>
          <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500 md:col-span-2">
            <p>A hidratação venosa e analgesia devem ser realizadas antes do diagnóstico definitivo e antes da avaliação da cirurgia geral, mantendo jejum até definição.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'Instabilidade ou sinais de gravidade', nextStep: 'apend_cirurgia_emergencia', value: 'instavel', critical: true, requiresImmediateAction: true },
        { text: 'Paciente estável - aplicar Alvarado', nextStep: 'apend_alvarado', value: 'estavel' }
      ]
    },
    apend_alvarado: {
      id: 'apend_alvarado',
      title: 'Escore de Alvarado',
      description: 'Baixo risco 0-3, moderado 4-6, alto 7-10 pontos.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-2 text-sm">
          <p><strong>Sintomas:</strong> dor migratória, anorexia, náuseas/vômitos.</p>
          <p><strong>Sinais:</strong> defesa em FID, dor à descompressão e febre.</p>
          <p><strong>Laboratório:</strong> leucocitose e desvio à esquerda.</p>
        </div>
      `,
      options: [
        { text: 'Aplicar escore', nextStep: 'apend_baixo_risco', value: 'alvarado' }
      ]
    },
    apend_cirurgia_emergencia: {
      id: 'apend_cirurgia_emergencia',
      title: 'Cirurgia de Emergência',
      description: 'Instabilidade ou sinais de gravidade.',
      type: 'result',
      group: 'Emergência',
      critical: true,
      requiresSpecialist: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-600">
            <p><strong>Conduta:</strong> acionar cirurgia geral imediatamente para exploração cirúrgica e apendicectomia.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Manter dieta zero, acesso venoso, hidratação e analgesia.</li>
            <li>Iniciar antibioticoterapia venosa.</li>
            <li>Avaliar sepse, peritonite, perfuração, abscesso e necessidade de suporte intensivo.</li>
          </ul>
        </div>
      `,
      options: []
    },
    apend_baixo_risco: {
      id: 'apend_baixo_risco',
      title: 'Baixo Risco - Alvarado 0 a 3',
      description: 'Probabilidade baixa de apendicite.',
      type: 'result',
      group: 'Baixo risco',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500">
            <p><strong>Conduta:</strong> tratamento extra-hospitalar se estável, prescrever sintomáticos e orientar sinais de alarme/retorno.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Considerar diagnósticos alternativos; probabilidade de apendicite é baixa.</li>
            <li>Retorno imediato se piora da dor, febre, vômitos persistentes, queda do estado geral ou sinais peritoneais.</li>
            <li>Reavaliar se persistir dúvida diagnóstica.</li>
          </ul>
        </div>
      `,
      options: []
    },
    apend_moderado_risco: {
      id: 'apend_moderado_risco',
      title: 'Risco Moderado - Alvarado 4 a 6',
      description: 'Solicitar imagem e decidir conforme achados.',
      type: 'result',
      group: 'Risco moderado',
      critical: true,
      requiresSpecialist: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500">
            <p><strong>Conduta:</strong> exame de imagem, preferencialmente TC de abdome e pelve com contraste; USG em gestantes e crianças.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Se imagem normal e paciente estável, considerar alta com orientações.</li>
            <li>Se apendicite, acionar cirurgia geral e seguir conduta cirúrgica.</li>
            <li>USG normal não exclui apendicite quando suspeita clínica persiste.</li>
          </ul>
        </div>
      `,
      options: []
    },
    apend_alto_risco: {
      id: 'apend_alto_risco',
      title: 'Alto Risco - Alvarado 7 a 10',
      description: 'Alta probabilidade de apendicite.',
      type: 'result',
      group: 'Alto risco',
      critical: true,
      requiresSpecialist: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-600">
            <p><strong>Conduta:</strong> exame de imagem para confirmar, quando disponível, ou encaminhar diretamente para conduta cirúrgica conforme avaliação.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Se apendicite, acionar cirurgia geral e iniciar antibioticoterapia venosa.</li>
            <li>Apendicectomia, preferencialmente laparoscópica, é o padrão-ouro, especialmente em apendicite complicada.</li>
            <li>Avaliar perfuração, abscesso, peritonite, sepse e necessidade de suporte intensivo.</li>
          </ul>
        </div>
      `,
      options: []
    }
  }
}

// Fluxograma de Colecistite Aguda
export const cholecystitisFlowchart: EmergencyFlowchart = {
  id: 'cholecystitis',
  name: 'Colecistite Aguda',
  description: 'Manejo inicial, critérios de gravidade Tokyo 2018, indicação de colecistectomia precoce e antibioticoterapia.',
  category: 'gastrointestinal',
  priority: 'high',
  icon: 'activity',
  color: 'from-lime-600 to-emerald-700',
  initialStep: 'cole_inicio',
  finalSteps: [
    'cole_leve',
    'cole_moderada',
    'cole_grave'
  ],
  steps: {
    cole_inicio: {
      id: 'cole_inicio',
      title: 'Suspeita de Colecistite Aguda no PS',
      description: 'Dor em hipocôndrio direito associada a náuseas/vômitos, febre e anorexia.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-lime-50 p-3 rounded border-l-4 border-lime-500">
            <p><strong>Quadro típico:</strong> dor abdominal em hipocôndrio direito, geralmente associada a náuseas/vômitos, febre e anorexia.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Solicitar USG abdominal para avaliar cálculo impactado, espessamento da parede vesicular e sinais inflamatórios.</li>
            <li><strong>Murphy ultrassonográfico:</strong> dor quando a sonda comprime a parede abdominal no ponto da vesícula; associado a cálculos, tem alta positividade diagnóstica.</li>
            <li>Manter acesso venoso, dieta zero, hidratação, analgesia e avaliação cirúrgica.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Iniciar medidas no pronto-socorro', nextStep: 'cole_medidas_iniciais', value: 'suspeita_colecistite' }
      ]
    },
    cole_medidas_iniciais: {
      id: 'cole_medidas_iniciais',
      title: 'Medidas Iniciais',
      description: 'Coleta de exames, dieta zero, ABCDE, hidratação e acesso venoso.',
      type: 'question',
      critical: true,
      content: `
        <div class="grid gap-3 md:grid-cols-2 text-sm">
          <div class="bg-sky-50 p-3 rounded border-l-4 border-sky-500">
            <p><strong>Exames iniciais:</strong> hemograma completo, PCR, EAS, função renal, beta-hCG se aplicável, TGO/TGP, FA/GGT, bilirrubina total e frações, amilase/lipase e coagulograma.</p>
          </div>
          <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500">
            <p><strong>Suporte:</strong> dieta zero até definição, estabilização clínica ABCDE, hidratação adequada e acesso venoso.</p>
          </div>
          <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500 md:col-span-2">
            <p>Se houver instabilidade ou sinais de gravidade, priorizar suporte intensivo, antibióticos e drenagem percutânea e/ou colecistectomia.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'Aplicar critérios de gravidade Tokyo 2018', nextStep: 'cole_tokyo_gravidade', value: 'medidas_iniciais' }
      ]
    },
    cole_tokyo_gravidade: {
      id: 'cole_tokyo_gravidade',
      title: 'Classificação de Gravidade Tokyo 2018',
      description: 'Tokyo I leve, Tokyo II moderada e Tokyo III grave por disfunção orgânica.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-2 text-sm">
          <p><strong>Tokyo I:</strong> sem critérios para quadro moderado ou grave.</p>
          <p><strong>Tokyo II:</strong> leucocitose importante, massa dolorosa em HD, duração > 72h ou inflamação local importante.</p>
          <p><strong>Tokyo III:</strong> disfunção cardiovascular, neurológica, respiratória, renal, hepática ou hematológica.</p>
        </div>
      `,
      options: [
        { text: 'Aplicar classificação', nextStep: 'cole_leve', value: 'classificar' }
      ]
    },
    cole_leve: {
      id: 'cole_leve',
      title: 'Colecistite Aguda Leve - Tokyo I',
      description: 'Sem critérios de moderada ou grave.',
      type: 'result',
      group: 'Tokyo I',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-lime-50 p-3 rounded border-l-4 border-lime-500">
            <p><strong>Conduta:</strong> colecistectomia laparoscópica precoce, idealmente até 72 horas.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Hidratação EV.</li>
            <li>Analgesia adequada.</li>
            <li>Antibióticos.</li>
            <li>Internação e avaliação da cirurgia geral.</li>
          </ul>
        </div>
      `,
      options: []
    },
    cole_moderada: {
      id: 'cole_moderada',
      title: 'Colecistite Aguda Moderada - Tokyo II',
      description: 'Pelo menos um critério moderado.',
      type: 'result',
      group: 'Tokyo II',
      critical: true,
      requiresSpecialist: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500">
            <p><strong>Conduta:</strong> colecistectomia laparoscópica precoce quando factível.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Em alto risco cirúrgico, considerar drenagem percutânea da vesícula biliar como ponte para cirurgia ou tratamento definitivo.</li>
            <li>Hidratação EV, analgesia adequada e antibióticos.</li>
            <li>Internação e avaliação da cirurgia geral.</li>
          </ul>
        </div>
      `,
      options: []
    },
    cole_grave: {
      id: 'cole_grave',
      title: 'Colecistite Aguda Grave - Tokyo III',
      description: 'Disfunção orgânica ou instabilidade clínica.',
      type: 'result',
      group: 'Tokyo III',
      critical: true,
      requiresSpecialist: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-600">
            <p><strong>Conduta:</strong> suporte intensivo, controle da disfunção orgânica, antibióticos e drenagem percutânea e/ou colecistectomia.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Estabilização clínica deve preceder procedimento definitivo quando necessário.</li>
            <li>Acionar cirurgia geral e considerar UTI conforme disfunções.</li>
            <li>Escolher antibiótico conforme perfil de suscetibilidade, culturas, função renal e discussão com CCIH.</li>
          </ul>
        </div>
      `,
      options: []
    }
  }
}

// Fluxograma de Colangite / Coledocolitíase
export const cholangitisFlowchart: EmergencyFlowchart = {
  id: 'cholangitis',
  name: 'Colangite / Coledocolitíase',
  description: 'Diagnóstico de colangite por critérios de Tokyo 2018, estratificação Tokyo I/II/III e abordagem da coledocolitíase aguda.',
  category: 'gastrointestinal',
  priority: 'high',
  icon: 'activity',
  color: 'from-emerald-600 to-teal-700',
  initialStep: 'colangite_inicio',
  finalSteps: [
    'colangite_sem_criterios',
    'coledocolitiase_sem_colangite',
    'colangite_leve',
    'colangite_moderada',
    'colangite_grave'
  ],
  steps: {
    colangite_inicio: {
      id: 'colangite_inicio',
      title: 'Suspeita de Colangite / Coledocolitíase no PS',
      description: 'Dor em hipocôndrio direito, icterícia, febre ou sinais de obstrução biliar.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500">
            <p><strong>Colangite aguda:</strong> infecção do trato biliar geralmente secundária à obstrução, sendo coledocolitíase a causa mais frequente.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li><strong>Tríade de Charcot:</strong> febre, dor abdominal e icterícia.</li>
            <li><strong>Pêntade de Reynolds:</strong> tríade + hipotensão e alteração do estado mental.</li>
            <li><strong>Coledocolitíase:</strong> dor em hipocôndrio direito, icterícia, colúria, acolia fecal e prurido; febre sugere colangite associada.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Há suspeita de colangite aguda', nextStep: 'colangite_medidas_iniciais', value: 'suspeita_colangite', critical: true },
        { text: 'Quadro sugere coledocolitíase sem febre/sepse', nextStep: 'coledocolitiase_sem_colangite', value: 'coledocolitiase' }
      ]
    },
    colangite_medidas_iniciais: {
      id: 'colangite_medidas_iniciais',
      title: 'Medidas Iniciais',
      description: 'Coleta de exames, dieta zero, ABCDE, hidratação e antibiótico precoce.',
      type: 'question',
      critical: true,
      content: `
        <div class="grid gap-3 md:grid-cols-2 text-sm">
          <div class="bg-sky-50 p-3 rounded border-l-4 border-sky-500">
            <p><strong>Exames iniciais:</strong> hemograma completo, hemoculturas, EAS, PCR, função renal, beta-hCG se aplicável, TGO/TGP, FA/GGT, bilirrubina total e frações, amilase/lipase, coagulograma e albumina.</p>
          </div>
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-500">
            <p><strong>Suporte imediato:</strong> dieta zero até definição, estabilização ABCDE, hidratação adequada e antibiótico precoce de amplo espectro.</p>
          </div>
          <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500 md:col-span-2">
            <p>A estabilização clínica com ressuscitação volêmica e antibioticoterapia deve preceder a intervenção endoscópica quando necessária.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'Aplicar critérios diagnósticos de Tokyo 2018', nextStep: 'colangite_tokyo_diagnostico', value: 'medidas_iniciais' }
      ]
    },
    colangite_tokyo_diagnostico: {
      id: 'colangite_tokyo_diagnostico',
      title: 'Critérios Diagnósticos de Tokyo 2018',
      description: 'Caso suspeito = A + B ou C. Caso confirmado = A + B + C.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-2 text-sm">
          <p><strong>A - Inflamação sistêmica:</strong> febre/calafrios ou leucócitos/PCR compatíveis.</p>
          <p><strong>B - Colestase:</strong> icterícia/bilirrubina >= 2 mg/dL ou enzimas hepáticas/colestáticas elevadas.</p>
          <p><strong>C - Imagem:</strong> dilatação de via biliar ou evidência de cálculo, estenose, stent ou outra etiologia.</p>
        </div>
      `,
      options: [
        { text: 'Classificar gravidade', nextStep: 'colangite_tokyo_gravidade', value: 'diagnostico_tokyo' }
      ]
    },
    colangite_tokyo_gravidade: {
      id: 'colangite_tokyo_gravidade',
      title: 'Classificação de Gravidade Tokyo 2018',
      description: 'Tokyo I leve, Tokyo II moderada, Tokyo III grave por disfunção orgânica.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-2 text-sm">
          <p><strong>Tokyo I:</strong> sem critérios de moderada ou grave.</p>
          <p><strong>Tokyo II:</strong> pelo menos um critério moderado.</p>
          <p><strong>Tokyo III:</strong> pelo menos uma disfunção orgânica.</p>
        </div>
      `,
      options: [
        { text: 'Aplicar classificação', nextStep: 'colangite_leve', value: 'classificar' }
      ]
    },
    colangite_leve: {
      id: 'colangite_leve',
      title: 'Colangite Aguda Leve - Tokyo I',
      description: 'Sem critérios de moderada ou grave.',
      type: 'result',
      group: 'Tokyo I',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500">
            <p><strong>Conduta:</strong> antibióticos e suporte clínico.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Drenagem biliar se não houver resposta clínica adequada em até 48 horas.</li>
            <li>Avaliar colecistectomia durante a internação se colelitíase associada.</li>
            <li>Escalonar/descalonar antibiótico conforme culturas e microbiologia local.</li>
          </ul>
        </div>
      `,
      options: []
    },
    colangite_moderada: {
      id: 'colangite_moderada',
      title: 'Colangite Aguda Moderada - Tokyo II',
      description: 'Pelo menos um critério moderado.',
      type: 'result',
      group: 'Tokyo II',
      critical: true,
      requiresSpecialist: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500">
            <p><strong>Conduta:</strong> iniciar antibióticos e suporte clínico.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Drenagem biliar precoce, preferencialmente em 24-48 horas.</li>
            <li>Associada a menor mortalidade e menor tempo de internação.</li>
            <li>Avaliar colecistectomia na internação se colelitíase associada.</li>
            <li>Internação e/ou transferência para avaliação da cirurgia geral/endoscopia.</li>
          </ul>
        </div>
      `,
      options: []
    },
    colangite_grave: {
      id: 'colangite_grave',
      title: 'Colangite Aguda Grave - Tokyo III',
      description: 'Disfunção orgânica presente.',
      type: 'result',
      group: 'Tokyo III',
      critical: true,
      requiresSpecialist: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-600">
            <p><strong>Conduta:</strong> antibióticos, suporte intensivo em CTI, estabilização hemodinâmica e ventilatória.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Drenagem biliar urgente, idealmente em 12-24 horas.</li>
            <li>Priorizar em presença de disfunção orgânica.</li>
            <li>Avaliar colecistectomia na internação se colelitíase associada.</li>
            <li>Considerar CPRE como via preferencial; drenagem percutânea/cirurgia se via endoscópica indisponível ou impossível.</li>
          </ul>
        </div>
      `,
      options: []
    },
    coledocolitiase_sem_colangite: {
      id: 'coledocolitiase_sem_colangite',
      title: 'Coledocolitíase Aguda sem Colangite Evidente',
      description: 'Obstrução biliar por cálculo sem critérios infecciosos suficientes.',
      type: 'result',
      group: 'Coledocolitíase',
      requiresSpecialist: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
            <p><strong>Conduta:</strong> internação hospitalar, hidratação venosa, analgesia, sintomáticos e contato com cirurgia geral/endoscopia.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>USG abdominal é o exame inicial recomendado.</li>
            <li>TC com contraste pode ser opção se USG não disponível ou inconclusivo.</li>
            <li>CPRM/colangiorressonância é o exame não invasivo mais sensível e específico, quando disponível.</li>
            <li>Tratamento definitivo: remoção dos cálculos, preferencialmente por CPRE.</li>
            <li>Antibioticoterapia se suspeita de colangite associada.</li>
          </ul>
        </div>
      `,
      options: []
    },
    colangite_sem_criterios: {
      id: 'colangite_sem_criterios',
      title: 'Critérios Insuficientes para Colangite',
      description: 'Reavaliar diagnóstico diferencial e investigar outras causas de dor abdominal/icterícia.',
      type: 'result',
      content: `
        <div class="bg-slate-50 p-3 rounded border-l-4 border-slate-400 text-sm">
          <p><strong>Conduta:</strong> manter reavaliação clínica, completar exames laboratoriais e imagem, e retornar ao fluxo se surgirem inflamação sistêmica, colestase ou achados de obstrução biliar.</p>
        </div>
      `,
      options: []
    }
  }
}

// Fluxograma de Pancreatite Aguda
export const pancreatitisFlowchart: EmergencyFlowchart = {
  id: 'pancreatitis',
  name: 'Pancreatite Aguda',
  description: 'Diagnóstico, coleta inicial, pesquisa etiológica, BISAP, Marshall/Atlanta 2012 e manejo hospitalar da pancreatite aguda.',
  category: 'gastrointestinal',
  priority: 'high',
  icon: 'activity',
  color: 'from-orange-600 to-red-700',
  initialStep: 'pan_inicio',
  finalSteps: [
    'pan_sem_diagnostico',
    'pan_leve',
    'pan_moderada',
    'pan_grave',
    'pan_uti'
  ],
  steps: {
    pan_inicio: {
      id: 'pan_inicio',
      title: 'Suspeita de Pancreatite Aguda no PS',
      description: 'Dor em abdome superior, intensa, frequentemente irradiada para dorso em barra.',
      type: 'question',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-orange-50 p-3 rounded border-l-4 border-orange-500">
            <p><strong>Quadro típico:</strong> dor abdominal superior constante, forte, em barra, associada a náuseas e vômitos.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Pancreatite biliar: dor bem localizada de início súbito.</li>
            <li>Pancreatite alcoólica/metabólica: dor mal localizada de início gradual.</li>
            <li>Exame físico varia com gravidade: distensão, sinais de SIRS, peritonite ou alteração de consciência sugerem gravidade.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Checar critérios diagnósticos', nextStep: 'pan_diagnostico', value: 'iniciar' }
      ]
    },
    pan_diagnostico: {
      id: 'pan_diagnostico',
      title: 'Critérios Diagnósticos',
      description: 'O diagnóstico exige 2 de 3 critérios: dor típica, enzimas > 3x LSN ou imagem compatível.',
      type: 'question',
      content: `
        <div class="bg-blue-50 p-3 rounded border-l-4 border-blue-500 text-sm">
          <p><strong>Critérios:</strong> 1) dor abdominal típica; 2) lipase ou amilase acima de 3 vezes o limite superior; 3) achados de imagem compatíveis.</p>
        </div>
      `,
      options: [
        { text: 'Dois ou mais critérios presentes', nextStep: 'pan_medidas_iniciais', value: 'diagnostico_confirmado' },
        { text: 'Menos de dois critérios', nextStep: 'pan_sem_diagnostico', value: 'sem_diagnostico' }
      ]
    },
    pan_medidas_iniciais: {
      id: 'pan_medidas_iniciais',
      title: 'Medidas Iniciais no PS',
      description: 'Coleta de exames, dieta zero, estabilização ABCDE, hidratação e etiologia.',
      type: 'question',
      critical: true,
      content: `
        <div class="grid gap-3 md:grid-cols-2 text-sm">
          <div class="bg-sky-50 p-3 rounded border-l-4 border-sky-500">
            <p><strong>Coletar exames iniciais:</strong> hemograma, PCR, gasometria/lactato, amilase/lipase, TGO/TGP, FA/GGT, ureia/creatinina, eletrólitos, EAS, USG e triglicérides.</p>
          </div>
          <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500">
            <p><strong>Suporte:</strong> dieta zero até definição, ABCDE, hidratação adequada guiada por metas e analgesia precoce.</p>
          </div>
          <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500 md:col-span-2">
            <p><strong>Etiologia:</strong> pesquisar alcoolismo, colelitíase, CPRE recente, hipertrigliceridemia, fármacos e hipercalcemia.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'Aplicar BISAP à beira-leito', nextStep: 'pan_bisap', value: 'medidas_iniciais' }
      ]
    },
    pan_bisap: {
      id: 'pan_bisap',
      title: 'BISAP - Identificação Precoce de Risco',
      description: 'Aplicável nas primeiras 24 horas, à beira-leito.',
      type: 'question',
      content: `
        <div class="bg-orange-50 p-3 rounded border-l-4 border-orange-500 text-sm">
          <p>Cada item pontua 1. BISAP &gt;= 3 sugere alta mortalidade e necessidade de vigilância intensiva.</p>
        </div>
      `,
      options: [
        { text: 'Classificar por Atlanta/Marshall', nextStep: 'pan_marshall_atlanta', value: 'bisap' }
      ]
    },
    pan_marshall_atlanta: {
      id: 'pan_marshall_atlanta',
      title: 'Marshall Modificado e Atlanta 2012',
      description: 'Disfunção orgânica se Marshall >= 2 em cardiovascular, respiratório ou renal.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-2 text-sm">
          <p><strong>Atlanta 2012:</strong> leve sem disfunção orgânica/complicações; moderadamente grave com disfunção transitória ou complicações; grave com disfunção sustentada por mais de 48h.</p>
          <p><strong>Marshall:</strong> 2 ou mais pontos definem falência orgânica.</p>
        </div>
      `,
      options: [
        { text: 'Aplicar classificação', nextStep: 'pan_leve', value: 'classificar' }
      ]
    },
    pan_leve: {
      id: 'pan_leve',
      title: 'Pancreatite Aguda Leve',
      description: 'Sem disfunção orgânica e sem complicações locais/sistêmicas.',
      type: 'result',
      group: 'Leve',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-yellow-50 p-3 rounded border-l-4 border-yellow-500">
            <p><strong>Manejo:</strong> hospitalar em enfermaria.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Jejum inicial e progressão para dieta oral assim que possível.</li>
            <li>Reposição volêmica guiada por metas.</li>
            <li>Correção de distúrbios hidroeletrolíticos.</li>
            <li>Analgesia adequada.</li>
            <li>Avaliação da cirurgia geral.</li>
          </ul>
        </div>
      `,
      options: []
    },
    pan_moderada: {
      id: 'pan_moderada',
      title: 'Pancreatite Aguda Moderadamente Grave',
      description: 'Disfunção orgânica transitória ou complicações locais/sistêmicas.',
      type: 'result',
      group: 'Moderadamente grave',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-orange-50 p-3 rounded border-l-4 border-orange-500">
            <p><strong>Manejo:</strong> hospitalar em enfermaria com vigilância estreita; considerar terapia intensiva conforme evolução.</p>
          </div>
          <p>O manejo inicial é semelhante ao da forma grave nas primeiras 48 horas: jejum inicial, hidratação guiada por metas, analgesia, correção hidroeletrolítica e avaliação da cirurgia geral.</p>
          <p><strong>Imagem:</strong> considerar TC com contraste após 72 horas do início dos sintomas, ou antes se dúvida diagnóstica/complicação.</p>
        </div>
      `,
      options: []
    },
    pan_grave: {
      id: 'pan_grave',
      title: 'Pancreatite Aguda Grave',
      description: 'Disfunção orgânica sustentada por mais de 48 horas.',
      type: 'result',
      group: 'Grave',
      critical: true,
      requiresSpecialist: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-600">
            <p><strong>Manejo:</strong> terapia intensiva ou unidade de alta vigilância, com suporte orgânico conforme necessidade.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Reposição volêmica guiada por metas, preferir Ringer Lactato.</li>
            <li>Analgesia otimizada e antiemético.</li>
            <li>Antibiótico somente se evidência de infecção/necrose infectada.</li>
            <li>Considerar TC com contraste após 72 horas.</li>
            <li>Considerar CPRE se colangite associada ou obstrução biliar.</li>
          </ul>
        </div>
      `,
      options: []
    },
    pan_uti: {
      id: 'pan_uti',
      title: 'Critérios de UTI Presentes',
      description: 'Instabilidade fisiológica com necessidade de terapia intensiva.',
      type: 'result',
      group: 'UTI',
      critical: true,
      requiresSpecialist: true,
      content: `
        <div class="bg-red-50 p-3 rounded border-l-4 border-red-600 text-sm">
          <p><strong>Conduta:</strong> acionar UTI/suporte avançado, monitorização contínua, metas hemodinâmicas, suporte respiratório/renal conforme necessidade e investigação de complicações.</p>
        </div>
      `,
      options: []
    },
    pan_sem_diagnostico: {
      id: 'pan_sem_diagnostico',
      title: 'Critérios Insuficientes para Pancreatite Aguda',
      description: 'Reavaliar diagnóstico diferencial e repetir exames se evolução compatível.',
      type: 'result',
      content: `
        <div class="bg-blue-50 p-3 rounded border-l-4 border-blue-500 text-sm">
          <p><strong>Conduta:</strong> investigar diagnósticos diferenciais de dor abdominal, manter reavaliação clínica e repetir enzimas/imagem se persistir suspeita.</p>
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
  influenza: influenzaFlowchart,
  pneumonia: pneumoniaFlowchart,
  sinusite: sinusitisFlowchart,
  lombalgia: lombalgiaFlowchart,
  anafilaxia: anaphylaxisFlowchart,
  appendicitis: appendicitisFlowchart,
  cholecystitis: cholecystitisFlowchart,
  cholangitis: cholangitisFlowchart,
  pancreatitis: pancreatitisFlowchart,
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
  { id: 'influenza', name: 'Influenza / Síndrome Gripal', category: 'infectious', implemented: true },
  { id: 'ivas', name: 'Infecção de vias aéreas superiores (Gripe/Resfriado)', category: 'infectious', implemented: false },
  { id: 'itu', name: 'ITU', category: 'infectious', implemented: false },
  { id: 'meningite', name: 'Meningite', category: 'infectious', implemented: false },
  { id: 'pneumonia', name: 'Pneumonia', category: 'infectious', implemented: true },
  { id: 'sifilis', name: 'Sífilis', category: 'infectious', implemented: false },
  { id: 'uretrite', name: 'Uretrite', category: 'infectious', implemented: false },

  // Musculoesqueléticos
  { id: 'artralgia', name: 'Artralgia', category: 'musculoskeletal', implemented: false },
  { id: 'lombalgia', name: 'Lombalgia', category: 'musculoskeletal', implemented: true },
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
  { id: 'appendicitis', name: 'Apendicite Aguda', category: 'gastrointestinal', implemented: true },
  { id: 'cholecystitis', name: 'Colecistite Aguda', category: 'gastrointestinal', implemented: true },
  { id: 'colelitiase', name: 'Colelitíase', category: 'gastrointestinal', implemented: false },
  { id: 'cholangitis', name: 'Colangite / Coledocolitíase', category: 'gastrointestinal', implemented: true },
  { id: 'diarreia', name: 'Diarreia', category: 'gastrointestinal', implemented: true },
  { id: 'disfagia', name: 'Disfagia', category: 'gastrointestinal', implemented: false },
  { id: 'doenca_hemorroidaria', name: 'Doença hemorroidária', category: 'gastrointestinal', implemented: false },
  { id: 'dor_abdominal', name: 'Dor abdominal', category: 'gastrointestinal', implemented: false },
  { id: 'epigastralgia', name: 'Epigastralgia', category: 'gastrointestinal', implemented: false },
  { id: 'hemorragia_digestiva_alta', name: 'Hemorragia Digestiva Alta', category: 'gastrointestinal', implemented: false },
  { id: 'pancreatitis', name: 'Pancreatite Aguda', category: 'gastrointestinal', implemented: true },
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
  { id: 'sinusite', name: 'Rinossinusites Viral, Alérgica e Bacteriana', category: 'otorhinolaryngological', implemented: true },

  // Metabólicos
  { id: 'rabdomiolise', name: 'Rabdomiólise', category: 'metabolic', implemented: false },

  // Alérgicos/Imunológicos
  { id: 'anafilaxia', name: 'Anafilaxia', category: 'allergic', implemented: true },
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
