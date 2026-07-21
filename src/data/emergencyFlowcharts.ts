import { EmergencyFlowchart } from '@/types/emergency'
import { gecaFlowchart } from './gecaFlowchart'

export { gecaFlowchart } from './gecaFlowchart'

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
  initialStep: 'avc_ativacao',
  finalSteps: ['avc_aguardo_uti'],
  steps: {
    avc_ativacao: {
      id: 'avc_ativacao', title: 'Ativação do protocolo de AVC', description: 'Registrar déficits, último momento bem e medidas paralelas.', type: 'question', critical: true, timeSensitive: true,
      options: [{ text: 'Verificar glicemia', nextStep: 'avc_glicemia', value: 'ativado', critical: true }]
    },
    avc_glicemia: {
      id: 'avc_glicemia', title: 'Verificação glicêmica', description: 'Identificar e corrigir hipoglicemia antes de reinterpretar o déficit.', type: 'question', critical: true,
      options: [{ text: 'Aplicar triagem neurológica', nextStep: 'avc_triagem', value: 'glicemia_revisada' }]
    },
    avc_triagem: {
      id: 'avc_triagem', title: 'Triagem neurológica rápida', description: 'Registrar face, braço e fala sem excluir apresentações atípicas.', type: 'question', critical: true,
      options: [{ text: 'Quantificar gravidade', nextStep: 'avc_nihss', value: 'triagem_registrada' }]
    },
    avc_nihss: {
      id: 'avc_nihss', title: 'NIHSS, funcionalidade e peso', description: 'Definir gravidade, caráter incapacitante e condição funcional prévia.', type: 'question', critical: true,
      options: [{ text: 'Organizar exames', nextStep: 'avc_exames', value: 'gravidade_registrada' }]
    },
    avc_exames: {
      id: 'avc_exames', title: 'Exames iniciais', description: 'Executar imagem e exames paralelos sem atrasar reperfusão.', type: 'question', critical: true,
      options: [{ text: 'Interpretar imagem', nextStep: 'avc_imagem', value: 'exames_registrados' }]
    },
    avc_imagem: {
      id: 'avc_imagem', title: 'Imagem cerebral inicial', description: 'Separar hemorragia de provável isquemia.', type: 'question', critical: true,
      options: [
        { text: 'Hemorragia presente', nextStep: 'avc_hemorragico_destino', value: 'hemorragia', critical: true },
        { text: 'Sem hemorragia', nextStep: 'avc_janela', value: 'sem_hemorragia' }
      ]
    },
    avc_janela: {
      id: 'avc_janela', title: 'Janela terapêutica', description: 'Classificar pelo último momento conhecido sem déficit.', type: 'question', critical: true, timeSensitive: true,
      options: [
        { text: 'Até 4,5 horas', nextStep: 'avc_trombolise_seguranca', value: 'ate_45h', critical: true },
        { text: '4,5 a 9 horas ou horário desconhecido', nextStep: 'avc_imagem_avancada', value: 'janela_estendida' },
        { text: '9 a 24 horas', nextStep: 'avc_vaso', value: '9_24h' },
        { text: 'Mais de 24 horas', nextStep: 'avc_cuidados_sem_reperfusao', value: 'mais_24h' }
      ]
    },
    avc_imagem_avancada: {
      id: 'avc_imagem_avancada', title: 'Imagem avançada', description: 'Avaliar tecido viável em janela estendida ou wake-up stroke.', type: 'question', critical: true,
      options: [
        { text: 'Padrão favorável', nextStep: 'avc_trombolise_seguranca', value: 'mismatch', critical: true },
        { text: 'Sem seleção para trombólise IV', nextStep: 'avc_vaso', value: 'sem_mismatch' }
      ]
    },
    avc_trombolise_seguranca: {
      id: 'avc_trombolise_seguranca', title: 'Segurança da trombólise', description: 'Revisar contraindicações, pressão e incapacidade funcional.', type: 'question', critical: true,
      options: [
        { text: 'Elegível para trombólise IV', nextStep: 'avc_trombolitico', value: 'elegivel', critical: true },
        { text: 'Não elegível para trombólise IV', nextStep: 'avc_vaso', value: 'contraindicada' }
      ]
    },
    avc_trombolitico: {
      id: 'avc_trombolitico', title: 'Trombólise intravenosa', description: 'Selecionar medicamento e calcular dose por peso.', type: 'medication', critical: true, timeSensitive: true,
      options: [{ text: 'Iniciar vigilância', nextStep: 'avc_pos_trombolise', value: 'trombolise_realizada', critical: true }]
    },
    avc_pos_trombolise: {
      id: 'avc_pos_trombolise', title: 'Vigilância pós-trombólise', description: 'Monitorar neurologia, pressão e intercorrências.', type: 'question', critical: true,
      options: [
        { text: 'Possível complicação', nextStep: 'avc_complicacao_trombolise', value: 'complicacao', critical: true },
        { text: 'Sem complicação', nextStep: 'avc_vaso', value: 'estavel' }
      ]
    },
    avc_complicacao_trombolise: {
      id: 'avc_complicacao_trombolise', title: 'Complicação após trombólise', description: 'Interromper infusão quando aplicável e investigar hemorragia ou via aérea.', type: 'result', critical: true,
      options: [{ text: 'Solicitar cuidado intensivo', nextStep: 'avc_aguardo_uti', value: 'uti', critical: true }]
    },
    avc_vaso: {
      id: 'avc_vaso', title: 'Território vascular', description: 'Identificar oclusão e território na angioimagem.', type: 'question', critical: true,
      options: [
        { text: 'Oclusão potencialmente tratável', nextStep: 'avc_trombectomia_criterios', value: 'oclusao_tratavel', critical: true },
        { text: 'Sem oclusão tratável', nextStep: 'avc_cuidados_sem_reperfusao', value: 'sem_ogv' }
      ]
    },
    avc_trombectomia_criterios: {
      id: 'avc_trombectomia_criterios', title: 'Critérios de trombectomia', description: 'Integrar território, tempo, ASPECTS, Rankin e NIHSS.', type: 'question', critical: true, requiresSpecialist: true,
      options: [
        { text: 'Indicação sustentada', nextStep: 'avc_desfecho_trombectomia', value: 'indicada', critical: true },
        { text: 'Sem indicação pelo caminho atual', nextStep: 'avc_cuidados_sem_reperfusao', value: 'nao_indicada' }
      ]
    },
    avc_desfecho_trombectomia: {
      id: 'avc_desfecho_trombectomia', title: 'Trombectomia indicada', description: 'Acionar neurointervenção ou transferência imediata.', type: 'result', critical: true, requiresSpecialist: true, timeSensitive: true,
      options: [{ text: 'Solicitar cuidado intensivo', nextStep: 'avc_aguardo_uti', value: 'uti', critical: true }]
    },
    avc_cuidados_sem_reperfusao: {
      id: 'avc_cuidados_sem_reperfusao', title: 'Cuidados clínicos e prevenção secundária', description: 'Aplicar suporte e prevenção de complicações conforme reperfusão realizada.', type: 'result',
      options: [{ text: 'Solicitar cuidado intensivo', nextStep: 'avc_aguardo_uti', value: 'uti', critical: true }]
    },
    avc_hemorragico_destino: {
      id: 'avc_hemorragico_destino', title: 'Hemorragia intracraniana', description: 'Migrar imediatamente para protocolo neurocrítico específico.', type: 'result', critical: true, requiresSpecialist: true,
      options: [{ text: 'Solicitar cuidado intensivo', nextStep: 'avc_aguardo_uti', value: 'uti', critical: true }]
    },
    avc_aguardo_uti: {
      id: 'avc_aguardo_uti', title: 'Aguardando UTI ou unidade neurocrítica', description: 'Manter vigilância ativa e transferência monitorizada após confirmação do AVC.', type: 'result', critical: true, requiresSpecialist: true, options: []
    },
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
                <source src="/videos/avc-simulado-legenda.mp4" type="video/mp4" />
                Seu navegador não suporta vídeo HTML5.
              </video>
              <p class="text-xs text-slate-500 mt-2">Arquivo esperado: <strong>/public/videos/avc-simulado-legenda.mp4</strong></p>
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
            <p><strong>Leve:</strong> conversa sem pausas relevantes, permanece confortável em repouso, SatO2 ≥ 94% e PFE/VEF1 acima de 70% do previsto ou melhor pessoal.</p>
          </div>
          <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500">
            <p><strong>Moderada:</strong> fala entrecortada, prefere ficar sentado, maior esforço ventilatório, SatO2 entre 92% e 94% ou PFE/VEF1 entre 50% e 70%.</p>
          </div>
          <div class="bg-orange-50 p-3 rounded border-l-4 border-orange-500">
            <p><strong>Grave:</strong> qualquer um entre incapacidade de falar ou deitar, FR &gt; 30, uso marcante de musculatura acessória, SatO2 &lt; 92%, tórax pouco ventilado ou PFE/VEF1 &lt; 50%.</p>
          </div>
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-600">
            <p><strong>Risco de vida:</strong> exaustão, confusão/sonolência, hipotensão, bradipneia, cianose, tórax silencioso.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'Leve', nextStep: 'asma_tratamento_1h_leve', value: 'leve' },
        { text: 'Moderada', nextStep: 'asma_tratamento_1h_leve_moderada', value: 'moderada' },
        { text: 'Grave', nextStep: 'asma_tratamento_1h_grave_vida', value: 'grave', critical: true },
        { text: 'Risco de vida', nextStep: 'asma_tratamento_1h_grave_vida', value: 'risco_vida', critical: true }
      ]
    },
    asma_tratamento_1h_leve: {
      id: 'asma_tratamento_1h_leve',
      title: 'Tratamento Inicial da Crise Leve',
      description: 'Broncodilatação inalatória e reavaliação em curto intervalo.',
      type: 'question',
      content: `
        <div class="space-y-2 text-sm">
          <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500">
            <p>Iniciar broncodilatador inalatório. Quando o serviço utiliza estratégia com formoterol associado a corticoide inalatório, ela pode ser aplicada conforme o plano terapêutico vigente.</p>
          </div>
          <p>Reavaliar sintomas, oximetria e medida de fluxo após a sequência inicial, sem esperar uma hora se houver piora.</p>
        </div>
      `,
      options: [
        { text: 'Iniciar broncodilatação inalatória', nextStep: 'asma_saba_leve_moderada', value: 'leve_broncodilatador' }
      ]
    },
    asma_tratamento_1h_leve_moderada: {
      id: 'asma_tratamento_1h_leve_moderada',
      title: 'Tratamento Inicial da Crise Moderada',
      description: 'Broncodilatador de curta duração, anticolinérgico e corticoide sistêmico precoce.',
      type: 'question',
      content: `
        <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500 text-sm">
          <p>Associar broncodilatador de curta duração ao ipratrópio e iniciar corticoide sistêmico, com reavaliações durante a primeira hora.</p>
        </div>
      `,
      options: [
        { text: 'Iniciar tratamento combinado', nextStep: 'asma_nebulizacao_grave_vida', value: 'moderada_combinada' }
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
            <p><strong>Ofertar O2 quando SatO2 estiver abaixo de 92%.</strong> Titular para 93-95% no adulto.</p>
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
        { text: 'Checar anafilaxia e iniciar suporte', nextStep: 'asma_checar_anafilaxia', value: 'grave_suporte', critical: true }
      ]
    },
    asma_checar_anafilaxia: {
      id: 'asma_checar_anafilaxia',
      title: 'Há Sinais de Anafilaxia Associada?',
      description: 'Broncoespasmo após exposição pode fazer parte de reação sistêmica e muda a prioridade do tratamento.',
      type: 'question',
      critical: true,
      content: `
        <div class="rounded border-l-4 border-red-600 bg-red-50 p-3 text-sm">
          <p>Procure início abrupto após possível desencadeante, edema de língua/laringe, urticária difusa, hipotensão, síncope ou sintomas intensos em mais de um sistema.</p>
        </div>
      `,
      options: [
        { text: 'Sim, anafilaxia provável', nextStep: 'asma_adrenalina_anafilaxia', value: 'anafilaxia_associada', critical: true, requiresImmediateAction: true },
        { text: 'Não há padrão de anafilaxia', nextStep: 'asma_o2_grave_vida', value: 'sem_anafilaxia' }
      ]
    },
    asma_adrenalina_anafilaxia: {
      id: 'asma_adrenalina_anafilaxia',
      title: 'Priorizar Adrenalina IM',
      description: 'Tratar a anafilaxia sem abandonar o suporte respiratório da crise asmática.',
      type: 'medication',
      critical: true,
      timeSensitive: true,
      content: `
        <div class="rounded border-l-4 border-red-700 bg-red-50 p-3 text-sm">
          <p>Aplicar adrenalina intramuscular na coxa conforme idade/peso e protocolo de anafilaxia. Acionar ajuda, monitorizar e seguir simultaneamente com oxigênio e broncodilatação.</p>
        </div>
      `,
      options: [
        { text: 'Continuar suporte da crise asmática', nextStep: 'asma_o2_grave_vida', value: 'adrenalina_iniciada', critical: true }
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
        { text: 'Avaliar indicação de magnésio', nextStep: 'asma_considerar_magnesio', value: 'cort_grave_ok', critical: true }
      ]
    },
    asma_considerar_magnesio: {
      id: 'asma_considerar_magnesio',
      title: 'Magnésio EV é Necessário?',
      description: 'Reservar o adjuvante para crise grave com resposta insuficiente ao tratamento inalatório inicial.',
      type: 'question',
      content: `
        <div class="rounded border border-amber-200 bg-amber-50 p-3 text-sm">
          <p>Considere magnésio quando persistirem obstrução intensa, hipoxemia ou sinais de gravidade após broncodilatação combinada. Não use de rotina em crises leves.</p>
        </div>
      `,
      options: [
        { text: 'Sim, administrar magnésio EV', nextStep: 'asma_magnesio_grave_vida', value: 'magnesio_indicado', critical: true },
        { text: 'Não, seguir para reavaliação', nextStep: 'asma_reavaliacao_1h', value: 'magnesio_nao_indicado' }
      ]
    },
    asma_magnesio_grave_vida: {
      id: 'asma_magnesio_grave_vida',
      title: 'Magnésio EV',
      description: 'Adjuvante na crise grave.',
      type: 'question',
      content: `
        <div class="space-y-3 bg-red-50 p-3 rounded border-l-4 border-red-600 text-sm">
          <p><strong>Sulfato de magnésio:</strong> 2 g EV, dose única, infundidos em 20–30 minutos.</p>
          <div class="rounded-lg border border-red-200 bg-white p-3">
            <p><strong>Se MgSO4 a 10% (100 mg/mL):</strong> aspirar 20 mL (2 g) e adicionar 80 mL de SF 0,9%, obtendo volume final de 100 mL.</p>
            <p class="mt-2"><strong>Se MgSO4 a 50% (500 mg/mL):</strong> aspirar 4 mL (2 g) e adicionar 96 mL de SF 0,9%, obtendo volume final de 100 mL.</p>
          </div>
          <p><strong>Segurança:</strong> confirmar apresentação da ampola, monitorizar pressão e frequência cardíaca e revisar função renal/risco de toxicidade.</p>
        </div>
      `,
      options: [
        { text: 'Reavaliar resposta clínica', nextStep: 'asma_reavaliacao_1h', value: 'mg_grave_ok', critical: true }
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
            <p><strong>Resposta marcada:</strong> pouco ou nenhum sintoma, sem broncodilatador na última hora, SatO2 acima de 92% e PFE/VEF1 acima de 70%.</p>
            <p><strong>Resposta parcial:</strong> ainda há dispneia, necessidade frequente de broncodilatador, SatO2 abaixo de 92% ou PFE/VEF1 entre 50% e 70%.</p>
            <p><strong>Piora:</strong> intensificação do esforço respiratório, queda da oximetria, alteração de consciência ou PFE/VEF1 abaixo de 50%.</p>
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
        { text: 'Resposta marcada (PFE > 70% e estabilidade)', nextStep: 'asma_resposta_boa', value: 'melhora' },
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
            <p><strong>Prioridades:</strong> manter SABA em dose intensiva, ipratrópio, corticoide sistêmico, oxigênio titulado e magnésio EV quando indicado.</p>
            <p>Aminofilina, heliox e ventilação não invasiva não compõem uma sequência automática de resgate. O foco é reconhecer rapidamente a necessidade de UTI e de via aérea avançada.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'Otimizar terapia e avaliar UTI', nextStep: 'asma_resgate_magnesio', value: 'resgate' },
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
        { text: 'Reavaliar necessidade de UTI', nextStep: 'asma_decisao_uti', value: 'magnesio_ok' }
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
          <p><strong>Prescrição literal sugerida para adulto:</strong> Prednisona 40 mg VO pela manhã por 5–7 dias. Para resgate, preferir esquema contendo corticoide inalatório; quando for utilizado SABA, Salbutamol 100 mcg: inalar 1–2 jatos com espaçador a cada 4–6 horas se falta de ar, conforme plano individual.</p>
          <p class="mt-2"><strong>Antes da alta:</strong> revisar alergias, contraindicações, tratamento de manutenção e técnica do dispositivo. Ajustar a receita para idade, gestação e comorbidades.</p>
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
            <p><strong>Critérios de alta:</strong> sintomas mínimos, sem necessidade de resgate na última hora, SatO2 &gt; 92% em ar ambiente, PFE/VEF1 &gt; 70%, medicação disponível, técnica revisada e retorno seguro.</p>
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
          <button type="button" data-asthma-copy-discharge="true" class="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 font-bold text-white hover:bg-slate-800">Copiar prescrição de alta</button>
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
  finalSteps: ['tvp_excluida', 'seguimento_ambulatorial', 'anticoagulacao_iniciada', 'encaminhamento_urgente', 'tvp_urgencia_vascular_concluida', 'tvp_internacao_uti', 'tvp_internacao_investigacao_clinica', 'tvp_internacao_investigar_tep'],
  steps: {
    start: {
      id: 'start',
      title: 'Suspeita Clínica de TVP',
      description: 'Paciente com dor/edema unilateral de membro inferior.',
      type: 'question',
      options: [
        { text: 'Iniciar avaliação específica da TVP', nextStep: 'avaliacao_clinica', value: 'avaliacao_especifica' }
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
        { text: 'Wells até 2 pontos: avaliar uso do D-dímero', nextStep: 'd_dimero_elegibilidade', value: 'wells_up_to_2' },
        { text: 'Wells acima de 2 pontos: solicitar Doppler', nextStep: 'moderada_probabilidade', value: 'wells_above_2', critical: true }
      ]
    },
    pocus_antes_d_dimero: {
      id: 'pocus_antes_d_dimero',
      title: 'POCUS vascular: visão geral antes do D-dímero',
      description: 'Revisar a técnica compressiva e o papel do exame antes de registrar o resultado do D-dímero.',
      type: 'action',
      content: `
        <div class="space-y-4 text-sm">
          <div class="rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-cyan-950">
            <div class="flex items-center gap-2">
              <p class="font-extrabold">POCUS compressivo de 3 / 4 pontos</p>
              <button type="button" data-tvp-pocus-points-image="true" class="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cyan-400 bg-white text-xs font-extrabold text-cyan-800 transition-colors hover:bg-cyan-100" title="Ver imagem do POCUS de 3 / 4 pontos" aria-label="Ver imagem do POCUS de 3 / 4 pontos">i</button>
            </div>
            <p class="mt-2">O exame à beira-leito avalia a compressibilidade venosa em três janelas: veia femoral comum/junção safeno-femoral, bifurcação femoral e veia poplítea até a trifurcação.</p>
          </div>
          <div class="grid gap-3 md:grid-cols-3">
            <div class="rounded-xl border border-slate-200 bg-white p-3"><strong>1. Região inguinal</strong><p class="mt-1">Veia femoral comum e junção safeno-femoral.</p></div>
            <div class="rounded-xl border border-slate-200 bg-white p-3"><strong>2. Bifurcação femoral</strong><p class="mt-1">Origem da femoral profunda e início da veia femoral.</p></div>
            <div class="rounded-xl border border-slate-200 bg-white p-3"><strong>3. Região poplítea</strong><p class="mt-1">Veia poplítea até sua trifurcação.</p></div>
          </div>
          <div class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
            <p><strong>Interpretação:</strong> veia que colaba completamente é considerada compressível; ausência de colabamento sugere TVP.</p>
            <p class="mt-2">Na baixa probabilidade clínica, registrar o POCUS antes do D-dímero ajuda a documentar as janelas avaliadas. Se não houver achado positivo crítico, o D-dímero permanece a etapa diagnóstica seguinte.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'POCUS disponível: registrar resultado', nextStep: 'pocus_resultado_pre_d_dimero', value: 'pocus_revisado' },
        { text: 'POCUS não disponível: seguir para D-dímero', nextStep: 'baixa_probabilidade', value: 'pocus_indisponivel' }
      ]
    },
    pocus_resultado_pre_d_dimero: {
      id: 'pocus_resultado_pre_d_dimero',
      title: 'Resultado do POCUS vascular: compressão de 3 pontos',
      description: 'Registrar o resultado após avaliar veia femoral comum/junção safeno-femoral, bifurcação femoral e veia poplítea até a trifurcação.',
      type: 'question',
      critical: true,
      options: [
        { text: 'POCUS positivo: veia não compressível', nextStep: 'checar_contra_anticoagulacao', value: 'us_positive', critical: true },
        { text: 'POCUS negativo: compressibilidade preservada', nextStep: 'baixa_probabilidade', value: 'us_negative' },
        { text: 'POCUS inconclusivo ou tecnicamente limitado', nextStep: 'baixa_probabilidade', value: 'us_inconclusive' },
        { text: 'POCUS não disponível', nextStep: 'baixa_probabilidade', value: 'us_unavailable' }
      ]
    },
    d_dimero_elegibilidade: {
      id: 'd_dimero_elegibilidade',
      title: 'O D-dímero é adequado para esta decisão?',
      description: 'Antes de solicitar o exame, verificar situações que reduzem sua utilidade para excluir TVP.',
      type: 'question',
      content: `
        <div class="space-y-4 text-sm">
          <div class="rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-950">
            <p><strong>Use o D-dímero para exclusão</strong> quando a probabilidade clínica for baixa ou intermediária e não houver condição capaz de elevar o resultado de forma inespecífica.</p>
          </div>
          <div class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
            <p class="font-bold">Prefira Doppler venoso diretamente quando houver:</p>
            <ul class="mt-2 grid list-disc gap-x-6 gap-y-1 pl-5 md:grid-cols-2">
              <li>Neoplasia ativa.</li>
              <li>Cirurgia ou ferida recente.</li>
              <li>Trauma, hematoma ou queimadura extensa.</li>
              <li>Gestação ou puerpério.</li>
              <li>Doença renal ou hepática relevante.</li>
              <li>Inflamação, infecção ou necrose tecidual importante.</li>
              <li>Internação ou imobilização prolongada.</li>
              <li>Outra condição conhecida por elevar o exame sem trombose.</li>
            </ul>
          </div>
        </div>
      `,
      options: [
        { text: 'D-dímero aplicável: solicitar e registrar resultado', nextStep: 'baixa_probabilidade', value: 'ddimer_appropriate' },
        { text: 'D-dímero pouco útil neste contexto: solicitar Doppler diretamente', nextStep: 'solicitar_doppler_venoso', value: 'ddimer_limited', critical: true }
      ]
    },
    baixa_probabilidade: {
      id: 'baixa_probabilidade',
      title: 'Registrar resultado do D-dímero',
      description: 'Aplicar o ponto de corte apropriado e decidir se a ultrassonografia é necessária.',
      type: 'question',
      content: `
        <div class="space-y-3 text-sm">
          <div class="rounded-xl border-l-4 border-l-green-700 border border-green-200 bg-green-50 p-4 text-green-950">
            <p><strong>Resultado abaixo do corte:</strong> permite afastar TVP neste ramo clínico.</p>
            <p class="mt-1"><strong>Resultado igual ou acima do corte:</strong> solicitar ultrassonografia Doppler venosa do membro sintomático.</p>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <div class="rounded-xl border border-slate-200 bg-white p-4">
              <p class="font-bold text-slate-900">Menor de 50 anos</p>
              <p class="mt-1 text-slate-700">Utilizar o limite definido pelo método do laboratório, frequentemente 500 ng/mL em unidades FEU.</p>
            </div>
            <div class="rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-950">
              <p class="font-bold">A partir de 50 anos</p>
              <p class="mt-1">Quando validado pelo método local, considerar corte ajustado pela idade: idade × 10 ng/mL FEU.</p>
            </div>
          </div>
        </div>
      `,
      options: [
        { text: 'D-dímero negativo', nextStep: 'tvp_excluida', value: 'ddimer_negative' },
        { text: 'D-dímero positivo: solicitar Doppler venoso', nextStep: 'solicitar_doppler_venoso', value: 'ddimer_positive' }
      ]
    },
    tvp_d_dimero_alerta: {
      id: 'tvp_d_dimero_alerta',
      title: 'D-dímero obrigatório - TVP com sinal de alerta',
      description: 'Registrar o D-dímero sem liberar caminhos de alta ou exclusão ambulatorial.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-950">
            <p><strong>Investigação mantida:</strong> registrar o resultado do D-dímero após o POCUS.</p>
          </div>
          <div class="rounded-xl border-l-4 border-l-red-700 border border-red-200 bg-red-50 p-4 text-red-950">
            <p><strong>Ramo ambulatorial bloqueado:</strong> como existe sinal de alerta, resultado negativo ou positivo não permite alta nem exclusão da TVP neste fluxo.</p>
            <p class="mt-2">Após o registro, prosseguir obrigatoriamente para o manejo de flegmasia/ameaça ao membro.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'D-dímero negativo', nextStep: 'tvp_urgencia_vascular_imediata', value: 'ddimer_negative_alert', critical: true },
        { text: 'D-dímero positivo', nextStep: 'tvp_urgencia_vascular_imediata', value: 'ddimer_positive_alert', critical: true }
      ]
    },
    moderada_probabilidade: {
      id: 'moderada_probabilidade',
      title: 'Moderada/Alta Probabilidade',
      description: 'Solicitar ultrassonografia Doppler venosa sem etapa prévia de D-dímero.',
      type: 'action',
      critical: true,
      content: `
        <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500 text-sm">
          <p><strong>Conduta direta:</strong> solicitar ultrassonografia Doppler venosa do membro inferior. Se o resultado for negativo e a suspeita clínica persistir, repetir a ultrassonografia em 5–7 dias.</p>
        </div>
      `,
      options: [
        { text: 'Solicitar Doppler venoso', nextStep: 'solicitar_doppler_venoso', value: 'direct_doppler', critical: true }
      ]
    },
    solicitar_doppler_venoso: {
      id: 'solicitar_doppler_venoso',
      title: 'Solicitar USG Doppler venoso do membro acometido',
      description: 'Confirmar ou afastar TVP com ultrassonografia vascular formal.',
      type: 'action',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="rounded-xl border-l-4 border-l-blue-700 border border-blue-200 bg-blue-50 p-4 text-blue-950">
            <p><strong>Exame solicitado:</strong> ultrassonografia com Doppler venoso do membro inferior sintomático, com avaliação do sistema venoso profundo.</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-800">
            <p><strong>Informar ao serviço de imagem:</strong> membro e segmento acometidos, início dos sintomas, escore de Wells, resultado do D-dímero quando realizado e presença de sinais de gravidade.</p>
          </div>
          <div class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
            <p>Se houver ameaça ao membro, suspeita de flegmasia ou instabilidade, não aguardar o fluxo ambulatorial: acionar avaliação vascular urgente.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'Exame solicitado — registrar resultado', nextStep: 'us_compressiva', value: 'doppler_solicitado', critical: true }
      ]
    },
    us_compressiva: {
      id: 'us_compressiva',
      title: 'Resultado do Doppler venoso de membro inferior',
      description: 'Registrar o laudo da ultrassonografia vascular formal.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-950">
            <p class="font-bold">Registre o laudo do Doppler venoso formal</p>
            <p class="mt-1">Considere compressibilidade, presença de trombo, segmento acometido e limitações técnicas descritas pelo examinador.</p>
          </div>
          <div class="grid gap-3 sm:grid-cols-3">
            <div class="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-950"><strong>Positivo</strong><p class="mt-1">A próxima tela solicitará a localização proximal ou distal.</p></div>
            <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-950"><strong>Negativo</strong><p class="mt-1">Programar repetição quando a estratégia utilizar ultrassonografia seriada.</p></div>
            <div class="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-950"><strong>Limitado</strong><p class="mt-1">Não considerar a investigação encerrada.</p></div>
          </div>
        </div>
      `,
      options: [
        { text: 'Doppler positivo: trombose identificada', description: 'Registrar agora se o trombo é proximal ou distal.', nextStep: 'classificar_extensao_tvp', value: 'us_positive', critical: true },
        { text: 'Doppler negativo: sem trombose demonstrada', description: 'Seguir para ultrassonografia seriada em aproximadamente uma semana.', nextStep: 'repetir_us', value: 'us_negative' },
        { text: 'Doppler inconclusivo ou tecnicamente limitado', description: 'Manter investigação e repetir/complementar o exame.', nextStep: 'repetir_us', value: 'us_inconclusive' }
      ]
    },
    classificar_extensao_tvp: {
      id: 'classificar_extensao_tvp',
      title: 'Onde está localizada a TVP confirmada?',
      description: 'A localização define risco, necessidade de internação e segurança do manejo ambulatorial.',
      type: 'question',
      critical: true,
      content: `
        <div class="grid gap-4 md:grid-cols-2 text-sm">
          <div class="rounded-2xl border-2 border-red-200 bg-red-50 p-5 text-red-950">
            <p class="text-base font-extrabold">TVP proximal</p>
            <p class="mt-2">Envolve veia poplítea, femoral ou ilíaca. Apresenta maior risco embólico e deve seguir para anticoagulação com avaliação hospitalar.</p>
          </div>
          <div class="rounded-2xl border-2 border-blue-200 bg-blue-50 p-5 text-blue-950">
            <p class="text-base font-extrabold">TVP distal</p>
            <p class="mt-2">Restrita às veias abaixo da poplítea. O manejo ambulatorial depende de critérios objetivos de estabilidade e segurança.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'TVP proximal — poplítea, femoral ou ilíaca', nextStep: 'tvp_proximal_confirmada', value: 'proximal', critical: true },
        { text: 'TVP distal — veias abaixo da poplítea', nextStep: 'criterios_ambulatoriais_tvp_distal', value: 'distal' }
      ]
    },
    tvp_proximal_confirmada: {
      id: 'tvp_proximal_confirmada',
      title: 'TVP proximal: internação e anticoagulação',
      description: 'Manter o paciente em ambiente hospitalar e avaliar segurança para anticoagular.',
      type: 'action',
      critical: true,
      content: `
        <div class="rounded-2xl border-l-4 border-l-red-700 border border-red-200 bg-red-50 p-5 text-sm text-red-950">
          <p class="font-extrabold">Não encaminhar diretamente para alta por este ramo.</p>
          <p class="mt-2">Documentar o segmento proximal acometido, iniciar anticoagulação quando não houver impedimento e manter avaliação hospitalar, com acionamento vascular conforme extensão e gravidade.</p>
        </div>
      `,
      options: [
        { text: 'Checar contraindicações e preparar anticoagulação hospitalar', nextStep: 'checar_contra_anticoagulacao', value: 'proximal_inpatient', critical: true }
      ]
    },
    criterios_ambulatoriais_tvp_distal: {
      id: 'criterios_ambulatoriais_tvp_distal',
      title: 'TVP distal: é seguro tratar fora do hospital?',
      description: 'Confirmar todos os critérios antes de liberar o ramo ambulatorial.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <p class="font-semibold text-slate-900">O tratamento ambulatorial exige que todos os itens abaixo estejam presentes:</p>
          <div class="grid gap-3 md:grid-cols-2">
            <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950"><strong>Estabilidade clínica</strong><p class="mt-1">Sinais vitais estáveis e ausência de repercussão cardiopulmonar.</p></div>
            <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950"><strong>Baixo risco hemorrágico</strong><p class="mt-1">Sem sangramento ativo ou contraindicação relevante.</p></div>
            <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950"><strong>Função renal adequada</strong><p class="mt-1">Compatível com o anticoagulante e a dose escolhidos.</p></div>
            <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950"><strong>Uso seguro e retorno garantido</strong><p class="mt-1">Compreensão, acesso à medicação, suporte e possibilidade de reavaliação.</p></div>
          </div>
        </div>
      `,
      options: [
        { text: 'Todos os critérios estão presentes', nextStep: 'checar_contra_anticoagulacao', value: 'outpatient_eligible' },
        { text: 'Um ou mais critérios não estão presentes', nextStep: 'tvp_aguarda_avaliacao_vascular', value: 'outpatient_not_safe', critical: true }
      ]
    },
    us_negativa_conduta: {
      id: 'us_negativa_conduta',
      title: 'Doppler negativo ou inconclusivo — reavaliação',
      description: 'Decisão baseada na persistência da suspeita clínica.',
      type: 'question',
      content: `
        <div class="bg-slate-50 p-3 rounded border border-slate-200 text-sm">
          <p>Um Doppler inicial negativo pode não encerrar a investigação quando a suspeita clínica permanece relevante.</p>
          <p>Se persistirem sinais ou dúvida diagnóstica, repetir a ultrassonografia em 5–7 dias conforme disponibilidade e protocolo.</p>
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
        { text: 'Solicitar avaliação da Cirurgia Vascular', nextStep: 'tvp_aguarda_avaliacao_vascular', value: 'inpatient', critical: true }
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
        { text: 'Paciente anticoagulado e encaminhado para avaliação da Cirurgia Vascular', nextStep: 'tvp_aguarda_avaliacao_vascular', value: 'inpatient', critical: true }
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
    tvp_aguarda_avaliacao_vascular: {
      id: 'tvp_aguarda_avaliacao_vascular',
      title: 'Cuidados enquanto aguarda a Cirurgia Vascular',
      description: 'Manter o paciente internado ou em observação monitorizada até a equipe vascular assumir o caso.',
      type: 'action',
      critical: true,
      timeSensitive: true,
      content: `
        <div class="space-y-4 text-sm leading-relaxed">
          <div class="rounded-lg border-l-4 border-red-700 bg-red-100 p-4 text-red-950">
            <h4 class="font-bold">TVP com necessidade de avaliação vascular prioritária</h4>
            <p class="mt-1">O encaminhamento não encerra a responsabilidade assistencial da equipe de emergência. Manter cuidado, vigilância e tratamento compatíveis com a gravidade até transferência formal do caso.</p>
            <p class="mt-2 font-semibold">Solicitar avaliação da Cirurgia Vascular e manter o paciente preferencialmente monitorizado, com pressão arterial, frequência cardíaca e saturação acompanhadas de forma seriada.</p>
          </div>

          <div class="rounded-lg border border-rose-300 bg-rose-50 p-4 text-rose-950">
            <h5 class="font-bold">Anticoagulação plena</h5>
            <p class="mt-1">Na ausência de contraindicação absoluta, manter anticoagulação plena conforme o esquema iniciado no fluxo e reavaliar continuamente risco hemorrágico, função renal, hemograma e plaquetas.</p>
            <p class="mt-2">Se houver contraindicação absoluta ou sangramento ativo, não iniciar ou suspender temporariamente a anticoagulação e acionar a Cirurgia Vascular para estratégia alternativa.</p>
          </div>

          <div class="grid gap-3 md:grid-cols-2">
            <div class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-950">
              <h5 class="font-bold">Se contraindicação absoluta à anticoagulação</h5>
              <ul class="mt-2 list-disc space-y-1 pl-5">
                <li>Confirmar e documentar que a contraindicação é realmente absoluta.</li>
                <li>Não iniciar anticoagulação enquanto persistir o risco hemorrágico impeditivo.</li>
                <li>Acionar imediatamente a Cirurgia Vascular.</li>
                <li>Avaliar filtro de veia cava temporário/recuperável em TVP proximal confirmada.</li>
              </ul>
            </div>
            <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
              <h5 class="font-bold">Se anticoagulação já foi iniciada</h5>
              <ul class="mt-2 list-disc space-y-1 pl-5">
                <li>Manter o esquema prescrito, salvo sangramento, deterioração ou nova contraindicação.</li>
                <li>Registrar medicamento, dose e horário da primeira administração.</li>
                <li>Reavaliar função renal, hemograma, plaquetas e risco hemorrágico.</li>
                <li>Discutir ajustes com a equipe vascular quando necessário.</li>
              </ul>
            </div>
          </div>

          <div class="rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-950">
            <h5 class="font-bold">Internação, monitorização e reavaliação seriada</h5>
            <ul class="mt-2 grid list-disc gap-x-6 gap-y-1 pl-5 md:grid-cols-2">
              <li>Pressão arterial e frequência cardíaca.</li>
              <li>Frequência respiratória e SpO₂.</li>
              <li>Dor e necessidade de analgesia.</li>
              <li>Progressão do edema e assimetria.</li>
              <li>Coloração e temperatura do membro.</li>
              <li>Pulsos, enchimento capilar e perfusão distal.</li>
              <li>Sensibilidade e força muscular.</li>
              <li>Vigilância clínica para sangramento.</li>
            </ul>
          </div>

          <div class="grid gap-3 md:grid-cols-2">
            <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h5 class="font-bold text-slate-950">Suporte clínico</h5>
              <ul class="mt-2 list-disc space-y-1 pl-5">
                <li>Elevar o membro acometido cerca de 15–30° acima do nível do coração.</li>
                <li>Oferecer analgesia com dipirona, paracetamol ou opioide conforme intensidade.</li>
                <li>Evitar AINE quando houver risco hemorrágico relevante.</li>
                <li>Manter acesso venoso e exames pertinentes conforme gravidade.</li>
              </ul>
            </div>
            <div class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950">
              <h5 class="font-bold">Não realizar nesta fase</h5>
              <ul class="mt-2 list-disc space-y-1 pl-5">
                <li>Não massagear nem manipular excessivamente o membro.</li>
                <li>Evitar fisioterapia ativa e deambulação precoce sem liberação.</li>
                <li>Não aplicar compressão agressiva.</li>
                <li>Adiar meia elástica em edema importante, TVP extensa, flegmasia ou dor intensa.</li>
              </ul>
            </div>
          </div>

          <div class="rounded-lg border border-orange-300 bg-orange-50 p-4 text-orange-950">
            <h5 class="font-bold">Vigilância para embolia pulmonar</h5>
            <p class="mt-1">Investigar imediatamente se surgirem dispneia, dor torácica, dessaturação, taquicardia, síncope ou hipotensão.</p>
          </div>

          <div class="rounded-lg border border-red-300 bg-red-50 p-4 text-red-950">
            <h5 class="font-bold">Flegmasia ou ameaça ao membro</h5>
            <p class="mt-1">Cianose, dor intensa progressiva, edema maciço, déficit sensitivo/motor, redução de pulsos ou piora da perfusão configuram emergência vascular. Priorizar intervenção imediata, considerando trombólise dirigida, trombectomia e avaliação de fasciotomia quando houver síndrome compartimental.</p>
          </div>
        </div>
      `,
      options: [
        {
          text: 'Cirurgia Vascular assumiu o caso',
          description: 'Confirmar a transferência formal da responsabilidade assistencial e gerar o encaminhamento.',
          nextStep: 'encaminhamento_urgente',
          value: 'vascular_assumiu_caso',
          critical: true
        }
      ]
    },
    encaminhamento_urgente: {
      id: 'encaminhamento_urgente',
      title: 'Encaminhamento para avaliação da Cirurgia Vascular',
      description: 'Encaminhar para avaliação especializada conforme cenário clínico.',
      type: 'result',
      critical: true,
      content: '',
      options: []
    },
    tvp_urgencia_vascular_imediata: {
      id: 'tvp_urgencia_vascular_imediata',
      title: 'Sinal de alerta em TVP - manejo imediato',
      description: 'Estabilização, investigação de gravidade e avaliação vascular presencial sem atraso.',
      type: 'action',
      critical: true,
      timeSensitive: true,
      content: `
        <div class="space-y-4 text-sm">
          <div class="rounded-xl border border-red-300 bg-red-100 p-4 text-red-950">
            <h4 class="font-bold text-red-950">SINAL DE ALERTA + INTERNAÇÃO IMEDIATA</h4>
            <p class="mt-2">O achado selecionado indica possível TVP extensa ou grave, ameaça ao membro ou TEP associado. A interpretação deve ser correlacionada com a avaliação clínica e vascular.</p>
            <p class="mt-2 font-semibold">Interromper o fluxo ambulatorial, iniciar estabilização e acionar presencialmente a Cirurgia Vascular. Não postergar a avaliação para o dia seguinte.</p>
          </div>

          <div class="rounded-xl border border-slate-200 bg-white p-4">
            <h5 class="font-bold text-slate-950">ABCDE e monitorização contínua</h5>
            <p class="mt-2">Realizar ABCDE como primeira etapa e instalar monitorização cardíaca contínua, ECG, pressão arterial seriada, frequência respiratória e oximetria.</p>
            <p class="mt-2">Obter <strong>dois acessos venosos calibrosos</strong>, idealmente 18G ou maior. Considerar acesso central se necessário conforme instabilidade, suporte e estratégia terapêutica.</p>
          </div>

          <div class="grid gap-4 lg:grid-cols-2">
            <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <h5 class="font-bold text-blue-950">Exames imediatos</h5>
              <ul class="mt-2 list-disc space-y-1 pl-5 text-blue-950">
                <li>Hemograma completo.</li>
                <li>Coagulograma, TP, TTPA e fibrinogênio.</li>
                <li>Função renal e eletrólitos.</li>
                <li>Lactato e gasometria.</li>
                <li>CK para avaliação de lesão muscular/rabdomiólise.</li>
              </ul>
            </div>
            <div class="rounded-xl border border-violet-200 bg-violet-50 p-4">
              <h5 class="font-bold text-violet-950">Imagem urgente</h5>
              <p class="mt-2"><strong>Ultrassom Doppler urgente:</strong> confirmar extensão da TVP e comprometimento iliofemoral.</p>
              <p class="mt-2">Se Doppler indisponível ou insuficiente, considerar angio-TC venosa ou TC contrastada conforme estabilidade e protocolo institucional.</p>
            </div>
          </div>

          <div class="rounded-xl border border-rose-200 bg-rose-50 p-4">
            <h5 class="font-bold text-rose-950">Anticoagulação imediata</h5>
            <p class="mt-2">Na ausência de contraindicações, preferir <strong>heparina não fracionada IV</strong> nos casos graves por ser reversível e facilitar trombólise ou cirurgia.</p>
            <div class="mt-3 rounded-lg border border-rose-200 bg-white p-3 text-center font-semibold text-rose-950">
              Bolus 80 UI/kg → infusão 18 UI/kg/h, com ajuste pelo TTPA e protocolo institucional.
            </div>
          </div>

          <div class="grid gap-4 lg:grid-cols-3">
            <div class="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
              <h5 class="font-bold text-cyan-950">Hidratação</h5>
              <p class="mt-2">Considerar SF 0,9% 250-500 mL e reavaliar. Objetivos: evitar hemoconcentração, preservar função renal e reduzir risco de lesão renal por rabdomiólise.</p>
              <p class="mt-2">Evitar excesso em insuficiência cardíaca, doença renal crônica ou hipoxemia.</p>
            </div>
            <div class="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h5 class="font-bold text-amber-950">Analgesia</h5>
              <p class="mt-2">Tratar conforme intensidade da dor, com opções como dipirona, tramadol ou morfina, considerando contraindicações e monitorização.</p>
            </div>
            <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <h5 class="font-bold text-emerald-950">Posicionamento</h5>
              <p class="mt-2">Manter o membro elevado em 30-45 graus, acima do nível do coração, para favorecer retorno venoso e reduzir edema.</p>
            </div>
          </div>

          <div class="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <h5 class="font-bold text-orange-950">Não realizar</h5>
            <ul class="mt-2 list-disc space-y-1 pl-5 text-orange-950">
              <li>Massagem do membro.</li>
              <li>Compressão agressiva.</li>
              <li>Deambulação precoce antes da avaliação especializada.</li>
            </ul>
          </div>

          <div class="rounded-xl border border-purple-200 bg-purple-50 p-4">
            <h5 class="font-bold text-purple-950">Tratamento invasivo</h5>
            <ul class="mt-2 list-disc space-y-1 pl-5 text-purple-950">
              <li><strong>Trombólise dirigida por cateter:</strong> considerar em paciente jovem, baixo risco hemorrágico e TVP iliofemoral extensa.</li>
              <li><strong>Trombectomia mecânica:</strong> considerar quando houver ameaça ao membro ou Flegmasia Cerulea Dolens.</li>
              <li><strong>Fasciotomia:</strong> avaliar se houver síndrome compartimental associada.</li>
            </ul>
          </div>

          <div class="rounded-xl border border-red-300 bg-red-50 p-4">
            <h5 class="font-bold text-red-950">Critérios para UTI</h5>
            <p class="mt-2">Considerar internação em UTI diante de instabilidade hemodinâmica, TEP associado, dor refratária, necessidade de heparina IV com monitorização intensiva, trombólise, síndrome compartimental, Flegmasia Cerulea Dolens, lactato elevado ou disfunção renal.</p>
          </div>

          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h5 class="font-bold text-slate-950">Sequência assistencial</h5>
            <p class="mt-2">ABCDE → monitorização e acessos → exames laboratoriais → Doppler urgente → heparina IV → elevação, analgesia e hidratação → avaliação vascular imediata → trombólise/trombectomia se ameaça ao membro.</p>
            <p class="mt-2">Se houver suspeita concomitante de TEP, conduzir a investigação em paralelo conforme estabilidade clínica.</p>
          </div>
        </div>
      `,
      options: [
        {
          text: 'Confirmar manejo e seguir para cuidados enquanto aguarda a Cirurgia Vascular',
          description: 'Registra a estabilização, a anticoagulação e o acionamento imediato da Cirurgia Vascular, mantendo o paciente monitorizado até a equipe especializada assumir o caso.',
          nextStep: 'tvp_aguarda_avaliacao_vascular',
          value: 'protocolo_flegmasia_aplicado',
          critical: true,
          requiresImmediateAction: true
        }
      ]
    },
    tvp_internacao_uti: {
      id: 'tvp_internacao_uti',
      title: 'Internação em UTI - TVP com sinais de alerta',
      description: 'TVP grave com ramo ambulatorial bloqueado e indicação de cuidado intensivo.',
      type: 'result',
      critical: true,
      content: `
        <div class="space-y-3">
          <div class="rounded-xl border-l-4 border-l-red-800 border border-red-300 bg-red-100 p-4 text-red-950">
            <h4 class="font-bold">INTERNAÇÃO EM UTI</h4>
            <p class="mt-2">Sinal de alerta identificado no checklist clínico. O paciente deve permanecer internado, monitorizado e sob avaliação imediata da Cirurgia Vascular.</p>
            <p class="mt-2 font-semibold">Não liberar para alta ou seguimento ambulatorial por este ramo.</p>
          </div>
        </div>
      `,
      options: []
    },
    tvp_urgencia_vascular_concluida: {
      id: 'tvp_urgencia_vascular_concluida',
      title: 'Manejo da urgência vascular confirmado',
      description: 'Manejo do sinal de alerta em TVP aplicado e avaliação vascular acionada.',
      type: 'result',
      critical: true,
      content: '',
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

const influenzaViralPanelContent = `
  <div class="space-y-4 text-sm">
    <div class="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
      <h4 class="font-bold text-cyan-950">Investigação laboratorial do paciente hospitalizado com SRAG</h4>
      <p class="mt-2">Todo paciente hospitalizado por SRAG deve ter coleta precoce de amostra respiratória para investigação laboratorial, preferencialmente logo na admissão, sem atrasar o início do tratamento.</p>
      <p class="mt-2 font-semibold">A coleta para RT-PCR ou painel viral multiplex não deve atrasar oseltamivir, oxigenoterapia, antibioticoterapia quando indicada ou demais medidas terapêuticas.</p>
    </div>

    <div class="grid gap-4 lg:grid-cols-3">
      <div class="rounded-xl border border-slate-200 bg-white p-4">
        <h5 class="font-bold text-slate-950">Exames obrigatórios na admissão</h5>
        <ul class="mt-2 list-disc space-y-1 pl-5">
          <li>Amostra respiratória para RT-PCR.</li>
          <li>Swab nasofaríngeo preferencial.</li>
          <li>Swab orofaríngeo quando indicado pelo método.</li>
          <li>Aspirado de nasofaringe em situações selecionadas.</li>
          <li>Em intubados: secreção traqueal ou lavado broncoalveolar conforme indicação clínica.</li>
        </ul>
      </div>

      <div class="rounded-xl border border-violet-200 bg-violet-50 p-4">
        <h5 class="font-bold text-violet-950">Painel viral quando disponível</h5>
        <p class="mt-2">O conteúdo varia conforme a plataforma do laboratório.</p>
        <ul class="mt-2 list-disc space-y-1 pl-5">
          <li>Influenza A, H1N1, H3N2 e Influenza B.</li>
          <li>COVID-19.</li>
          <li>Vírus sincicial respiratório.</li>
          <li>Metapneumovírus humano.</li>
          <li>Parainfluenza 1-4.</li>
          <li>Adenovírus, rinovírus/enterovírus e coronavírus sazonais quando incluídos.</li>
          <li>Alguns painéis incluem Mycoplasma pneumoniae, Chlamydia pneumoniae e Bordetella pertussis.</li>
        </ul>
      </div>

      <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <h5 class="font-bold text-emerald-950">Conforme gravidade e suspeitas associadas</h5>
        <ul class="mt-2 list-disc space-y-1 pl-5">
          <li>Hemoculturas antes do antibiótico, se não atrasar o tratamento.</li>
          <li>Cultura de escarro quando houver amostra adequada.</li>
          <li>Aspirado traqueal ou lavado broncoalveolar nos pacientes intubados quando indicado.</li>
          <li>Hemograma, função renal, eletrólitos, função hepática, gasometria, lactato e marcadores inflamatórios.</li>
          <li>Radiografia de tórax e, quando necessário, tomografia ou ultrassom pulmonar.</li>
        </ul>
        <button type="button" data-influenza-request-exams="true" class="mt-4 inline-flex items-center justify-center rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800">
          Solicitar exames
        </button>
      </div>
    </div>

    <div class="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <h5 class="font-bold text-amber-950">Mensagem prática</h5>
      <p class="mt-2">Todo paciente hospitalizado com SRAG deve ter coleta precoce de amostra respiratória para RT-PCR, ou painel viral multiplex quando disponível. A investigação etiológica organiza o cuidado e a vigilância, mas não pode atrasar o início do oseltamivir nem as medidas de suporte indicadas.</p>
    </div>
  </div>
`

const influenzaBoardingCareContent = `
  <div class="space-y-4 text-sm">
    <div class="rounded-xl border border-sky-200 bg-sky-50 p-4">
      <h4 class="font-bold text-sky-950">Cuidados enquanto aguarda leito - Boarding do paciente com SRAG/Influenza</h4>
      <p class="mt-2">Enquanto aguarda um leito, o paciente já deve receber todos os cuidados compatíveis com o nível de complexidade de destino. A ausência de vaga não pode significar atraso no tratamento nem redução da intensidade da monitorização.</p>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <div class="rounded-xl border border-slate-200 bg-white p-4">
        <h5 class="font-bold text-slate-950">Reavaliação frequente</h5>
        <p class="mt-2">Registrar sinais vitais completos, frequência respiratória, saturação, escala de consciência, PA, FC, temperatura, diurese, dor e esforço respiratório.</p>
        <p class="mt-2"><strong>Periodicidade:</strong> paciente grave a cada 1 hora ou contínua se instável; paciente moderado a cada 2-4 horas conforme estabilidade.</p>
      </div>

      <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <h5 class="font-bold text-blue-950">Monitorização e oxigenoterapia</h5>
        <p class="mt-2">Manter monitor cardíaco, oximetria contínua, pressão arterial seriada, controle de débito urinário quando indicado e balanço hídrico.</p>
        <p class="mt-2">Reavaliar continuamente se o suporte atual é suficiente e escalonar cateter nasal, máscara, máscara com reservatório, cânula nasal de alto fluxo, VNI ou intubação quando indicado.</p>
      </div>

      <div class="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
        <h5 class="font-bold text-cyan-950">Antiviral e antibiótico</h5>
        <p class="mt-2">Iniciar oseltamivir imediatamente quando houver suspeita de influenza grave, sem aguardar confirmação laboratorial, registrando o horário da primeira dose.</p>
        <p class="mt-2">Reavaliar possibilidade de pneumonia bacteriana associada; colher culturas antes quando possível e iniciar antibiótico precocemente sem atrasar pacientes sépticos.</p>
      </div>

      <div class="rounded-xl border border-violet-200 bg-violet-50 p-4">
        <h5 class="font-bold text-violet-950">Exames seriados e hidratação</h5>
        <p class="mt-2">Conforme gravidade, acompanhar hemograma, função renal, eletrólitos, gasometria, lactato, PCR, procalcitonina quando disponível e imagem pulmonar para reavaliação.</p>
        <p class="mt-2">Evitar excesso de volume pelo risco de SDRA; reavaliar perfusão frequentemente e adotar estratégia conservadora após estabilização hemodinâmica.</p>
      </div>

      <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <h5 class="font-bold text-emerald-950">Profilaxias, nutrição e isolamento</h5>
        <ul class="mt-2 list-disc space-y-1 pl-5">
          <li>Tromboprofilaxia se não houver contraindicação.</li>
          <li>Prevenção de úlcera de estresse quando indicada.</li>
          <li>Mudança de decúbito e prevenção de lesão por pressão.</li>
          <li>Suporte nutricional se não conseguir alimentar-se.</li>
          <li>Precaução para gotículas, aerossóis em procedimentos geradores, higiene de mãos e uso correto de EPIs.</li>
        </ul>
      </div>

      <!-- influenza-ward-icu-reassessment-slot -->
    </div>

    <div class="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <h5 class="font-bold text-amber-950">Checklist assistencial e comunicação</h5>
      <p class="mt-2">Manter cabeceira elevada 30-45 graus, higiene oral, aspiração quando necessária, controle glicêmico, controle térmico, balanço hídrico e registro de intercorrências.</p>
      <p class="mt-2">Registrar motivo da internação, indicação de UTI ou enfermaria, pendência de vaga, plano terapêutico, critérios de piora e quando acionar imediatamente a equipe médica.</p>
    </div>
  </div>
`

const influenzaWardDeteriorationPreventionContent = `
  <div class="rounded-xl border border-red-300 bg-red-50 p-4 text-red-950">
    <div class="flex items-center justify-between gap-3">
      <h5 class="font-bold">Reavaliação para UTI</h5>
      <span class="rounded-full bg-red-700 px-2.5 py-1 text-xs font-bold text-white">UTI</span>
    </div>
    <p class="mt-2">A cada reavaliação, perguntar se o paciente está respirando mais rápido, precisando de mais oxigênio, ficando sonolento, hipotenso, com lactato em elevação, diurese em queda, gasometria piorando ou trabalho respiratório aumentando.</p>
    <p class="mt-2 font-semibold">Se qualquer resposta for sim, reclassificar imediatamente, acionar a equipe responsável e avaliar transferência para UTI.</p>
  </div>
`

const influenzaWardBoardingCareContent = influenzaBoardingCareContent.replace(
  '<!-- influenza-ward-icu-reassessment-slot -->',
  influenzaWardDeteriorationPreventionContent
)

const influenzaICUBoardingCareContent = influenzaBoardingCareContent.replace(
  '<!-- influenza-ward-icu-reassessment-slot -->',
  ''
)

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
    'influenza_ambulatorial_sintomaticos_concluido',
    'influenza_ambulatorial_oseltamivir_concluido',
    'influenza_internacao_enfermaria',
    'influenza_uti_protocolo_concluido'
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
            <p><strong>Síndrome gripal:</strong> deve ser considerada frente a um paciente com sintomas característicos e sem outro diagnóstico definido. Paciente apresentando <strong>febre</strong> (inclusive se somente relatada), com <strong>tosse</strong> ou <strong>dor de garganta</strong>, juntamente com pelo menos um dos demais sintomas: <strong>artralgia</strong>, <strong>cefaleia</strong> ou <strong>mialgia</strong>.</p>
          </div>
          <div class="rounded-xl border border-red-200 bg-red-50 p-4">
            <p class="font-semibold text-red-800">Notificação e cuidados iniciais importantes</p>
            <ul class="list-disc pl-5 mt-2 space-y-1 text-red-900">
              <li>Considerar isolamento por gotículas e máscara cirúrgica para o paciente.</li>
              <li>Priorizar influenza A(H1N1)pdm09, A(H3N2) e influenza B/Victoria como agentes de maior relevância clínica e epidemiológica no fluxo.</li>
              <li>Oseltamivir deve ser priorizado em pacientes hospitalizados ou com fatores de risco para complicações.</li>
            </ul>
          </div>
          <details class="rounded-xl border border-slate-200 bg-white p-4">
            <summary class="cursor-pointer font-semibold text-slate-800">Ver pontos que não podem passar despercebidos</summary>
            <div class="mt-3 space-y-2 text-slate-700">
              <p>A influenza acomete vias aéreas superiores e inferiores e pode evoluir com <strong>síndrome respiratória aguda grave (SRAG)</strong>.</p>
              <p>No Brasil, os vírus influenza com maior relevância clínica e epidemiológica hoje são principalmente os do tipo A, especialmente <strong>Influenza A(H1N1)pdm09</strong> e <strong>Influenza A(H3N2)</strong>. Em menor grau, mas ainda importante, entram os vírus influenza B, sobretudo da linhagem Victoria.</p>
              <p>Os surtos variam bastante ano a ano. Nas últimas temporadas brasileiras, A(H1N1)pdm09 e A(H3N2) alternaram protagonismo. O H3N2 costuma causar ondas fortes em idosos e maior pressão hospitalar; o H1N1 frequentemente tem impacto importante em adultos mais jovens, obesos, gestantes e pacientes com comorbidades.</p>
              <p>Apesar da incubação clássica de 1 a 4 dias, muitos pacientes iniciam sintomas de forma abrupta cerca de 48 horas após exposição significativa.</p>
              <p>No Brasil, a sazonalidade varia por região: Sul e Sudeste têm pico mais clássico entre outono e inverno; Norte e Nordeste podem ter circulação mais prolongada e associada ao período chuvoso.</p>
              <p>Desde a pandemia de COVID, a sazonalidade do influenza ficou mais irregular, com surtos fora do inverno em vários anos, inclusive epidemias importantes de H3N2 em dezembro/janeiro.</p>
              <p>Do ponto de vista de gravidade em UTI, H1N1 chama atenção por <strong>SDRA viral primária</strong>; H3N2 por descompensação de fragilidade prévia e coinfecção bacteriana; influenza B geralmente é mais brando, mas pode causar miocardite e encefalite, especialmente em jovens.</p>
              <p>Febre alta abrupta, mialgia intensa, cefaleia, tosse seca, linfopenia e pró-calcitonina baixa inicialmente mantêm forte suspeita clínica de influenza A, especialmente H1N1.</p>
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
        { text: 'Avaliação inicial / Sinais Vitais / Exame Físico', nextStep: 'influenza_exame_fisico', value: 'iniciar_exame_fisico' }
      ]
    },
    influenza_exame_fisico: {
      id: 'influenza_exame_fisico',
      title: 'Sinais Vitais e Exame Físico',
      description: 'Registrar sinais vitais completos e achados clínicos antes da classificação de gravidade.',
      type: 'action',
      content: '',
      options: []
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
              <li>SpO2 &lt;95% (ar ambiente)</li>
              <li>Desconforto / Insuficiência respiratória</li>
              <li>Dispneia</li>
              <li>Exacerbação de doenças pré-existentes</li>
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
              <li>Saturação &lt;90% apesar de oxigênio suplementar</li>
              <li>FR &gt;30 irpm persistente</li>
              <li>Uso de musculatura acessória</li>
              <li>Alteração do nível de consciência</li>
              <li>Hipotensão ou lactato elevado</li>
              <li>Necessidade de ventilação não invasiva ou cânula nasal de alto fluxo</li>
              <li>Choque ou falência orgânica</li>
            </ul>
          </div>
        </div>
      `,
      options: []
    },
    influenza_ambulatorial_sintomaticos: {
      id: 'influenza_ambulatorial_sintomaticos',
      title: 'Conduta ambulatorial - tratamento sintomático',
      description: 'Prescrição sintomática, orientações e critérios de retorno antes da alta.',
      type: 'action',
      generatesPrescription: true,
      content: `
        <div class="space-y-4 text-sm">
          <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <h4 class="font-bold text-emerald-950">Manejo ambulatorial da síndrome gripal sem sinais de gravidade</h4>
            <p class="mt-2"><strong>Conduta:</strong> prescrever sintomáticos, orientar hidratação, repouso relativo e vigilância clínica. Neste cenário não há indicação imediata de antiviral pelo checklist atual, salvo julgamento clínico individual.</p>
          </div>
          <div class="grid gap-4 lg:grid-cols-2">
            <div class="rounded-xl border border-slate-200 bg-white p-4">
              <h5 class="font-bold text-slate-950">Medicações sintomáticas esperadas</h5>
              <ul class="mt-2 list-disc space-y-1 pl-5">
                <li>Antitérmico/analgésico se febre, mialgia ou cefaleia.</li>
                <li>Lavagem nasal com soro fisiológico e medidas para congestão nasal.</li>
                <li>Antiemético se náuseas ou vômitos.</li>
                <li>Mucolítico/sintomático respiratório conforme avaliação clínica.</li>
              </ul>
            </div>
            <div class="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h5 class="font-bold text-amber-950">Orientações de retorno</h5>
              <p class="mt-2">Retornar imediatamente se dispneia, desconforto respiratório, saturação baixa, confusão, sonolência excessiva, desidratação, vômitos persistentes, hipotensão, febre persistente por mais de 3 dias, piora da febre ou piora do estado geral.</p>
            </div>
          </div>
          <div class="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
            <h5 class="font-bold text-cyan-950">Orientações respiratórias</h5>
            <p class="mt-2">Usar máscara enquanto sintomático, cobrir boca e nariz ao tossir/espirrar, higienizar as mãos, evitar contato próximo com pessoas vulneráveis e manter ambientes ventilados.</p>
          </div>
        </div>
      `,
      options: []
    },
    influenza_ambulatorial_oseltamivir: {
      id: 'influenza_ambulatorial_oseltamivir',
      title: 'Conduta ambulatorial com oseltamivir',
      description: 'Antiviral, sintomáticos, orientações e critérios de retorno antes da alta.',
      type: 'action',
      generatesPrescription: true,
      content: `
        <div class="space-y-4 text-sm">
          <div class="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <h4 class="font-bold text-amber-950">Manejo ambulatorial com antiviral</h4>
            <p class="mt-2"><strong>Conduta:</strong> prescrever oseltamivir, sintomáticos, hidratação e retorno em 48 horas ou antes se houver piora clínica/sinais de gravidade.</p>
            <p class="mt-2">Fatores de risco ou sinais de piora clínica justificam início do antiviral mesmo sem SRAG, desde que não haja critério atual de internação.</p>
          </div>
          <div class="grid gap-4 lg:grid-cols-2">
            <div class="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
              <h5 class="font-bold text-cyan-950">Antiviral e sintomáticos</h5>
              <ul class="mt-2 list-disc space-y-1 pl-5">
                <li>Oseltamivir conforme idade, peso e função renal.</li>
                <li>Antitérmico/analgésico se febre, mialgia ou cefaleia.</li>
                <li>Antiemético se náuseas ou vômitos.</li>
                <li>Lavagem nasal, medidas respiratórias e hidratação.</li>
              </ul>
            </div>
            <div class="rounded-xl border border-red-200 bg-red-50 p-4">
              <h5 class="font-bold text-red-950">Critérios de retorno imediato</h5>
              <p class="mt-2">Dispneia, desconforto respiratório, saturação baixa, confusão, sonolência excessiva, desidratação, vômitos persistentes, hipotensão, febre persistente ou piora do estado geral.</p>
            </div>
          </div>
          <div class="rounded-xl border border-sky-200 bg-sky-50 p-4">
            <p class="font-semibold text-sky-950">Quando solicitar exame de imagem?</p>
            <p class="mt-2">Não solicitar radiografia de rotina para toda síndrome gripal. Solicitar RX de tórax quando houver suspeita de acometimento pulmonar ou complicação: dispneia, taquipneia, saturação &lt;95%, dor torácica, ausculta pulmonar alterada, febre persistente, piora após melhora inicial, imunossupressão com sintomas respiratórios mais intensos ou necessidade de internação.</p>
            <p class="mt-2">Considerar TC se RX inconclusivo com forte suspeita clínica, hipoxemia desproporcional, suspeita de complicações, imunossupressão, caso grave/internado ou suspeita de tromboembolismo pulmonar.</p>
          </div>
        </div>
      `,
      options: []
    },
    influenza_ambulatorial_sintomaticos_concluido: {
      id: 'influenza_ambulatorial_sintomaticos_concluido',
      title: 'Manejo ambulatorial concluído',
      description: 'Prescrição sintomática e orientações registradas.',
      type: 'result',
      generatesPrescription: true,
      content: '',
      options: []
    },
    influenza_ambulatorial_oseltamivir_concluido: {
      id: 'influenza_ambulatorial_oseltamivir_concluido',
      title: 'Manejo ambulatorial com oseltamivir concluído',
      description: 'Antiviral, sintomáticos e orientações registrados.',
      type: 'result',
      generatesPrescription: true,
      content: '',
      options: []
    },
    influenza_painel_viral_enfermaria: {
      id: 'influenza_painel_viral_enfermaria',
      title: 'Coleta respiratória e painel viral',
      description: 'Investigação etiológica obrigatória do paciente hospitalizado por SRAG antes da enfermaria.',
      type: 'action',
      critical: true,
      content: influenzaViralPanelContent,
      options: [
        {
          text: 'Confirmar coleta e seguir para cuidados enquanto aguarda leito',
          description: 'Registra a coleta respiratória sem atrasar o tratamento.',
          nextStep: 'influenza_boarding_enfermaria',
          value: 'painel_viral_enfermaria_coletado',
          critical: true
        }
      ]
    },
    influenza_boarding_enfermaria: {
      id: 'influenza_boarding_enfermaria',
      title: 'Cuidados enquanto aguarda leito',
      description: 'Boarding do paciente com SRAG aguardando enfermaria.',
      type: 'action',
      critical: true,
      content: influenzaWardBoardingCareContent,
      options: [
        {
          text: 'Confirmar cuidados e seguir para internação em enfermaria',
          description: 'Registra reavaliação, monitorização e tratamento enquanto aguarda leito.',
          nextStep: 'influenza_internacao_enfermaria',
          value: 'boarding_enfermaria_aplicado',
          critical: true
        }
      ]
    },
    influenza_internacao_enfermaria: {
      id: 'influenza_internacao_enfermaria',
      title: 'Internação em enfermaria',
      description: 'Paciente com SRAG sem critério imediato de UTI.',
      type: 'result',
      critical: true,
      content: `
        <div class="space-y-4 text-sm">
          <div class="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <h4 class="font-bold text-orange-950">PROTOCOLO DE INTERNAÇÃO – SÍNDROME GRIPAL / SRAG (ENFERMARIA)</h4>
            <p class="mt-2"><strong>Internar em enfermaria</strong> paciente com síndrome gripal/SRAG que apresente critério de internação, mas sem necessidade imediata de terapia intensiva.</p>
            <p class="mt-2"><strong>Conduta inicial para admissão:</strong> iniciar oseltamivir, monitorizar sinais vitais e saturação, manter isolamento por gotículas, solicitar exames laboratoriais iniciais, solicitar imagem de tórax conforme critérios, instituir oxigenoterapia se necessário, hidratar conforme estado clínico, tratar sintomas e reavaliar de forma seriada a necessidade de escalonamento para UTI.</p>
            <p class="mt-2"><strong>Antibiótico não é rotina:</strong> reservar para suspeita de pneumonia bacteriana associada, coinfecção, aspiração ou infecção hospitalar conforme contexto clínico e protocolo institucional.</p>
          </div>

          <div class="grid gap-4 lg:grid-cols-2">
            <div class="rounded-xl border border-slate-200 bg-white p-4">
              <h5 class="font-bold text-slate-950">Critérios de internação</h5>
              <ul class="mt-2 list-disc space-y-1 pl-5 text-slate-800">
                <li>Saturação de O2 &lt;95% em ar ambiente.</li>
                <li>Dispneia moderada ou taquipneia persistente.</li>
                <li>Necessidade de oxigenoterapia.</li>
                <li>Desidratação ou incapacidade de alimentação adequada.</li>
                <li>Descompensação de doença de base.</li>
                <li>Idosos frágeis ou imunossuprimidos.</li>
                <li>Pneumonia viral ou bacteriana suspeita.</li>
                <li>Critério clínico médico.</li>
              </ul>
            </div>
            <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <h5 class="font-bold text-emerald-950">Ausência de critérios de UTI</h5>
              <ul class="mt-2 list-disc space-y-1 pl-5 text-emerald-900">
                <li>Sem necessidade de ventilação mecânica.</li>
                <li>Sem choque.</li>
                <li>Sem vasopressores.</li>
                <li>Sem insuficiência respiratória grave.</li>
              </ul>
            </div>
          </div>

          <div class="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
            <h5 class="font-bold text-cyan-950">Antiviral</h5>
            <p class="mt-2"><strong>Oseltamivir 75 mg VO 12/12 horas por 5 dias</strong> em adultos. Iniciar preferencialmente nas primeiras 48 horas, porém manter indicação em pacientes hospitalizados independentemente do tempo de sintomas.</p>
            <p class="mt-2">Considerar prolongamento em imunossuprimidos, casos graves ou persistência de replicação viral. Ajustar dose conforme função renal.</p>
          </div>

          <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <h5 class="font-bold text-blue-950">Oxigenoterapia</h5>
            <ul class="mt-2 list-disc space-y-1 pl-5 text-blue-950">
              <li>Meta de saturação: ≥92% na maioria dos pacientes.</li>
              <li>Meta 88-92% em retenção crônica de CO2, como DPOC grave.</li>
              <li>Iniciar com cateter nasal 1 a 5 L/min.</li>
              <li>Escalonar para máscara simples 5 a 10 L/min, máscara não reinalante 10 a 15 L/min ou cânula nasal de alto fluxo se disponível.</li>
              <li>Avaliar UTI se houver necessidade crescente de oxigênio, FiO2 elevada, desconforto respiratório importante ou relação SpO2/FiO2 progressivamente reduzida.</li>
            </ul>
          </div>

          <div class="rounded-xl border border-slate-200 bg-white p-4">
            <h5 class="font-bold text-slate-950">Exames laboratoriais iniciais</h5>
            <p class="mt-2">Solicitar hemograma completo, ureia, creatinina, sódio, potássio, TGO, TGP, PCR e glicemia.</p>
            <p class="mt-2">Solicitar gasometria arterial ou venosa se hipoxemia, lactato se suspeita de sepse e coagulograma em casos moderados/graves.</p>
            <p class="mt-2">Conforme disponibilidade: teste para Influenza, RT-PCR viral ou painel viral respiratório.</p>
          </div>

          <div class="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <h5 class="font-bold text-amber-950">Exames de imagem</h5>
            <p class="mt-2"><strong>Radiografia de tórax:</strong> solicitar se dispneia, saturação &lt;95%, ausculta pulmonar alterada, febre persistente, suspeita de pneumonia ou necessidade de internação.</p>
            <p class="mt-2"><strong>Tomografia de tórax:</strong> considerar se RX inconclusivo, hipoxemia desproporcional aos achados do RX, suspeita de complicações, imunossupressão, piora clínica sem causa evidente ou suspeita de tromboembolismo pulmonar.</p>
          </div>

          <div class="rounded-xl border border-red-200 bg-red-50 p-4">
            <h5 class="font-bold text-red-950">Antibioticoterapia</h5>
            <p class="mt-2">Não utilizar antibióticos rotineiramente em todos os pacientes com Influenza. Iniciar quando houver suspeita de pneumonia bacteriana associada.</p>
            <p class="mt-2"><strong>Achados sugestivos:</strong> consolidação lobar, escarro purulento, leucocitose importante, procalcitonina elevada quando disponível, piora após melhora inicial ou infiltrado focal ao RX.</p>
            <ul class="mt-2 list-disc space-y-1 pl-5 text-red-950">
              <li>Pneumonia comunitária sem gravidade: ceftriaxona 2 g IV/dia + azitromicina 500 mg/dia.</li>
              <li>Maior risco ou doença grave: ceftriaxona 2 g IV/dia + azitromicina 500 mg/dia.</li>
              <li>Suspeita de aspiração: ampicilina/sulbactam.</li>
              <li>Suspeita de infecção hospitalar: seguir protocolo institucional de pneumonia hospitalar.</li>
            </ul>
          </div>

          <div class="rounded-xl border border-rose-200 bg-rose-50 p-4">
            <h5 class="font-bold text-rose-950">Critérios para avaliação da UTI</h5>
            <p class="mt-2">Solicitar avaliação intensiva se saturação &lt;90% apesar de oxigênio suplementar, FR &gt;30 irpm persistente, uso de musculatura acessória, alteração do nível de consciência, hipotensão, lactato elevado, necessidade de ventilação não invasiva, necessidade de alto fluxo, choque ou falência orgânica.</p>
          </div>

          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p><strong>Medidas gerais:</strong> manter isolamento por gotículas, máscara cirúrgica quando houver transporte/contato, hidratação venosa conforme necessidade, sintomáticos, monitorização de sinais vitais e reavaliação seriada da necessidade de escalonamento para terapia intensiva.</p>
          </div>
        </div>
      `,
      options: []
    },
    influenza_painel_viral_uti: {
      id: 'influenza_painel_viral_uti',
      title: 'Coleta respiratória e painel viral',
      description: 'Investigação etiológica obrigatória do paciente hospitalizado por SRAG antes da UTI.',
      type: 'action',
      critical: true,
      content: influenzaViralPanelContent,
      options: [
        {
          text: 'Confirmar coleta e seguir para cuidados enquanto aguarda UTI',
          description: 'Registra a coleta respiratória sem atrasar estabilização e antiviral.',
          nextStep: 'influenza_boarding_uti',
          value: 'painel_viral_uti_coletado',
          critical: true,
          requiresImmediateAction: true
        }
      ]
    },
    influenza_boarding_uti: {
      id: 'influenza_boarding_uti',
      title: 'Cuidados enquanto aguarda leito',
      description: 'Boarding do paciente com SRAG grave aguardando UTI.',
      type: 'action',
      critical: true,
      content: influenzaICUBoardingCareContent,
      options: [
        {
          text: 'Confirmar cuidados e seguir para protocolo de UTI',
          description: 'Registra monitorização intensiva e prevenção de deterioração enquanto aguarda leito.',
          nextStep: 'influenza_internacao_uti',
          value: 'boarding_uti_aplicado',
          critical: true,
          requiresImmediateAction: true
        }
      ]
    },
    influenza_internacao_uti: {
      id: 'influenza_internacao_uti',
      title: 'SRAG grave aguardando leito de UTI',
      description: 'Estabilização e monitorização contínua no pronto-socorro até a transferência.',
      type: 'action',
      critical: true,
      content: `
        <div class="space-y-4 text-sm">
          <div class="rounded-xl border border-red-200 bg-red-50 p-4">
            <h4 class="font-bold text-red-950">PROTOCOLO DE MANEJO DA SRAG GRAVE NO PRONTO-SOCORRO AGUARDANDO LEITO DE UTI</h4>
            <p class="mt-2"><strong>Objetivo:</strong> garantir assistência adequada durante o período entre a indicação de terapia intensiva e a transferência efetiva para a UTI.</p>
            <p class="mt-2 font-semibold text-red-950">A solicitação de vaga não substitui as medidas de estabilização e monitorização contínua.</p>
          </div>

          <div class="rounded-xl border border-slate-200 bg-white p-4">
            <h5 class="font-bold text-slate-950">Medidas imediatas e monitorização</h5>
            <p class="mt-2">Instalar imediatamente monitor cardíaco contínuo, oximetria contínua, frequência respiratória seriada, pressão arterial não invasiva seriada, controle rigoroso de temperatura e controle de diurese quando indicado.</p>
            <p class="mt-2"><strong>Registro:</strong> sinais vitais pelo menos a cada 1 hora ou em intervalo menor conforme gravidade clínica.</p>
          </div>

          <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <h5 class="font-bold text-blue-950">Oxigenoterapia e suporte respiratório</h5>
            <p class="mt-2"><strong>Metas:</strong> SpO2 ≥92% na maioria dos pacientes; 88-92% em retenção crônica de CO2.</p>
            <ul class="mt-2 list-disc space-y-1 pl-5 text-blue-950">
              <li>Cateter nasal: 1 a 5 L/min.</li>
              <li>Máscara simples: 5 a 10 L/min.</li>
              <li>Máscara não reinalante: 10 a 15 L/min.</li>
              <li>Cânula nasal de alto fluxo se necessidade crescente de oxigênio, hipoxemia persistente ou desconforto respiratório moderado.</li>
              <li>Ventilação não invasiva principalmente em DPOC exacerbado, edema agudo pulmonar ou casos selecionados sob monitorização rigorosa.</li>
            </ul>
          </div>

          <div class="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
            <h5 class="font-bold text-cyan-950">Antiviral</h5>
            <p class="mt-2"><strong>Oseltamivir 75 mg VO ou por sonda a cada 12 horas por 5 dias</strong> em adultos, com ajuste conforme função renal.</p>
            <p class="mt-2">Iniciar o mais precocemente possível e não aguardar resultado laboratorial. Considerar prolongamento em casos críticos, imunossuprimidos ou persistência de replicação viral.</p>
          </div>

          <div class="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <h5 class="font-bold text-amber-950">Antibioticoterapia</h5>
            <p class="mt-2">Não utilizar antibiótico apenas pela presença de Influenza. Iniciar cobertura para pneumonia bacteriana quando houver consolidação pulmonar, infiltrado focal, escarro purulento, leucocitose importante, piora após melhora inicial ou suspeita clínica de coinfecção.</p>
            <p class="mt-2"><strong>Esquema inicial sugerido:</strong> ceftriaxona 2 g IV ao dia + azitromicina 500 mg IV ou VO ao dia. Avaliar ampliação conforme perfil epidemiológico e risco de infecção hospitalar.</p>
          </div>

          <div class="grid gap-4 lg:grid-cols-2">
            <div class="rounded-xl border border-slate-200 bg-white p-4">
              <h5 class="font-bold text-slate-950">Exames laboratoriais na admissão</h5>
              <p class="mt-2">Hemograma completo, ureia, creatinina, sódio, potássio, magnésio, TGO, TGP, bilirrubinas, PCR, gasometria arterial, lactato, coagulograma e glicemia.</p>
              <p class="mt-2">Troponina se indicada. Considerar hemoculturas antes dos antibióticos, pesquisa para Influenza, RT-PCR viral e painel respiratório.</p>
            </div>
            <div class="rounded-xl border border-violet-200 bg-violet-50 p-4">
              <h5 class="font-bold text-violet-950">Exames de imagem</h5>
              <p class="mt-2"><strong>Radiografia de tórax:</strong> solicitar para todo paciente com SRAG internado ou com indicação de UTI, pesquisando pneumonia, consolidações, derrame pleural e progressão radiológica.</p>
              <p class="mt-2"><strong>Tomografia de tórax:</strong> considerar se RX inconclusivo, hipoxemia desproporcional, suspeita de complicações, imunossupressão, piora sem explicação ou suspeita de tromboembolismo pulmonar.</p>
            </div>
          </div>

          <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <h5 class="font-bold text-emerald-950">Hidratação</h5>
            <p class="mt-2">Avaliar individualmente e evitar hidratação excessiva. Preferir estratégia conservadora em hipoxemia, pneumonia extensa, SDRA ou disfunção cardíaca.</p>
            <p class="mt-2">Reavaliar frequentemente perfusão periférica, diurese, lactato e sinais de congestão pulmonar.</p>
          </div>

          <div class="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <h5 class="font-bold text-orange-950">Critérios de deterioração clínica</h5>
            <p class="mt-2">Comunicar imediatamente a equipe médica e reavaliar suporte avançado se houver SpO2 &lt;90% apesar de oxigênio, aumento progressivo da necessidade de O2, FR &gt;30 irpm, uso de musculatura acessória, tiragem importante, alteração do nível de consciência, sonolência ou agitação, hipotensão, choque, oligúria, lactato crescente, piora gasométrica ou hipercapnia progressiva.</p>
          </div>

          <div class="rounded-xl border border-rose-300 bg-rose-100 p-4">
            <h5 class="font-bold text-rose-950">Critérios de intervenção imediata</h5>
            <p class="mt-2">Avaliar prontamente intubação orotraqueal diante de falência respiratória iminente, exaustão respiratória, hipoxemia refratária, rebaixamento do nível de consciência, instabilidade hemodinâmica ou incapacidade de proteger as vias aéreas.</p>
            <p class="mt-2 font-semibold">Manter contato contínuo com a equipe da UTI até a transferência definitiva.</p>
          </div>
        </div>
      `,
      options: [
        {
          text: 'Confirmar manejo e seguir para finalização',
          description: 'Registra a aplicação do protocolo enquanto o paciente aguarda a transferência para a UTI.',
          nextStep: 'influenza_uti_protocolo_concluido',
          value: 'protocolo_srag_uti_aplicado',
          critical: true
        }
      ]
    },
    influenza_uti_protocolo_concluido: {
      id: 'influenza_uti_protocolo_concluido',
      title: 'Protocolo de SRAG grave concluído',
      description: 'Manejo no pronto-socorro confirmado enquanto aguarda leito de UTI.',
      type: 'result',
      critical: true,
      content: '',
      options: []
    }
  }
}

const pacWaitingAdmissionCareContent = `
  <div class="space-y-4 text-sm">
    <div class="rounded-xl border border-sky-200 bg-sky-50 p-4">
      <h4 class="font-bold text-sky-950">Cuidados do Paciente com PAC enquanto Aguarda Internação</h4>
      <p class="mt-2">Após definida a necessidade de internação, o paciente deve permanecer em monitorização e receber tratamento precoce enquanto aguarda disponibilidade de leito.</p>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <div class="rounded-xl border border-slate-200 bg-white p-4">
        <h5 class="font-bold text-slate-950">Monitorização contínua</h5>
        <ul class="mt-2 list-disc space-y-1 pl-5">
          <li>Pressão arterial, frequência cardíaca e frequência respiratória.</li>
          <li>Saturação periférica de oxigênio (SpO2) e temperatura.</li>
          <li>Nível de consciência e reavaliação clínica periódica.</li>
          <li>Reavaliar a cada 30 minutos a 1 hora, ou antes se houver piora.</li>
        </ul>
      </div>

      <div class="rounded-xl border border-rose-200 bg-rose-50 p-4">
        <h5 class="font-bold text-rose-950">Antibioticoterapia precoce</h5>
        <p class="mt-2">Administrar o antibiótico empírico o mais precocemente possível, preferencialmente nas primeiras horas após o diagnóstico.</p>
        <p class="mt-2">Não aguardar resultado de culturas quando houver indicação clínica de tratamento imediato. Sugestão de coleta de culturas para investigação de agente etiológico.</p>
      </div>

      <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <h5 class="font-bold text-blue-950">Oxigenoterapia titulada</h5>
        <p class="mt-2">Manter SpO2 entre 92-96% na maioria dos pacientes.</p>
        <p class="mt-2">Em DPOC ou retenção crônica de CO2, manter SpO2 entre 88-92%.</p>
        <p class="mt-2">Ajustar dispositivo conforme necessidade: cateter nasal, máscara, Venturi ou cânula nasal de alto fluxo, se indicada.</p>
      </div>

      <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <h5 class="font-bold text-emerald-950">Hidratação e controle de sintomas</h5>
        <ul class="mt-2 list-disc space-y-1 pl-5">
          <li>Corrigir desidratação quando presente.</li>
          <li>Evitar sobrecarga hídrica, especialmente em idosos, insuficiência cardíaca ou doença renal.</li>
          <li>Monitorar balanço hídrico.</li>
          <li>Usar antitérmicos, analgesia, tratamento da dispneia e broncodilatadores apenas se houver broncoespasmo associado.</li>
        </ul>
      </div>

      <div class="rounded-xl border border-violet-200 bg-violet-50 p-4">
        <h5 class="font-bold text-violet-950">Profilaxias</h5>
        <p class="mt-2">Se não houver contraindicações, instituir profilaxia para tromboembolismo venoso.</p>
        <p class="mt-2">Prevenir lesão por pressão em pacientes restritos ao leito e estimular mobilização precoce sempre que possível.</p>
      </div>

      <div class="rounded-xl border border-orange-200 bg-orange-50 p-4">
        <h5 class="font-bold text-orange-950">Reavaliação e critérios para escalonamento</h5>
        <p class="mt-2">Monitorar necessidade crescente de oxigênio, frequência respiratória, fadiga respiratória, instabilidade hemodinâmica, alteração do nível de consciência, sepse ou choque séptico.</p>
        <p class="mt-2"><strong>Reavaliar UTI imediatamente se:</strong> hipoxemia refratária, aumento progressivo do trabalho respiratório, necessidade de ventilação não invasiva ou invasiva, hipotensão persistente, lactato elevado, disfunção de órgãos ou rebaixamento do nível de consciência.</p>
      </div>
    </div>

    <div class="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <h5 class="font-bold text-amber-950">Mensagem prática para o protocolo</h5>
      <p class="mt-2">O paciente internado no pronto-socorro deve permanecer monitorizado, receber antibioticoterapia precoce, oxigenoterapia titulada, suporte clínico e reavaliações frequentes até a transferência para a enfermaria ou UTI, conforme evolução clínica.</p>
    </div>
  </div>
`

const pacWaitingICUCareContent = pacWaitingAdmissionCareContent.replace(`
      <div class="rounded-xl border border-orange-200 bg-orange-50 p-4">
        <h5 class="font-bold text-orange-950">Reavaliação e critérios para escalonamento</h5>
        <p class="mt-2">Monitorar necessidade crescente de oxigênio, frequência respiratória, fadiga respiratória, instabilidade hemodinâmica, alteração do nível de consciência, sepse ou choque séptico.</p>
        <p class="mt-2"><strong>Reavaliar UTI imediatamente se:</strong> hipoxemia refratária, aumento progressivo do trabalho respiratório, necessidade de ventilação não invasiva ou invasiva, hipotensão persistente, lactato elevado, disfunção de órgãos ou rebaixamento do nível de consciência.</p>
      </div>
`, '')

// Fluxograma de Tromboembolismo Pulmonar (TEP)
export const tepFlowchart: EmergencyFlowchart = {
  id: 'tep',
  name: 'Tromboembolismo Pulmonar (TEP)',
  description: 'Avaliação diagnóstica, estratificação de risco e tratamento do tromboembolismo pulmonar agudo.',
  category: 'respiratory',
  priority: 'high',
  icon: 'lungs',
  color: 'blue',
  initialStep: 'tep_inicio',
  finalSteps: ['tep_excluido', 'tep_alta', 'tep_internacao', 'tep_uti'],
  steps: {
    tep_inicio: {
      id: 'tep_inicio', title: 'Suspeita de tromboembolismo pulmonar',
      description: 'Inicie pela avaliação clínica estruturada. Hipoxemia com radiografia de tórax sem alteração não exclui TEP.',
      type: 'question',
      content: `<div class="space-y-3 text-sm"><p>Considere TEP diante de dispneia súbita, dor torácica pleurítica, taquicardia, hipoxemia, hemoptise, síncope ou sinais de TVP.</p><div class="rounded-lg border border-blue-200 bg-blue-50 p-3"><strong>Fatores de risco:</strong> idade avançada, cirurgia ou imobilização recente, neoplasia, estrogênios, obesidade, TEV prévio, trombofilia, gravidez e puerpério.</div></div>`,
      options: [{ text: 'Iniciar avaliação', nextStep: 'tep_exame_fisico', value: 'suspeita_tep' }]
    },
    tep_exame_fisico: {
      id: 'tep_exame_fisico', title: 'Sinais vitais e exame físico',
      description: 'Registre estabilidade hemodinâmica, repercussão respiratória e sinais de TVP ou disfunção de ventrículo direito.', type: 'action'
    },
    tep_instabilidade: {
      id: 'tep_instabilidade', title: 'Há instabilidade hemodinâmica?',
      description: 'Considere hipotensão persistente, choque, parada cardiorrespiratória ou falência cardiopulmonar iminente.', type: 'question', critical: true,
      options: [
        { text: 'Sim — paciente instável', description: 'PAS < 90 mmHg, queda ≥ 40 mmHg por > 15 min, choque/PCR ou hipoperfusão sem outra causa.', nextStep: 'tep_instavel_conduta', value: 'instavel', critical: true, requiresImmediateAction: true },
        { text: 'Não — paciente estável', nextStep: 'tep_wells', value: 'estavel' }
      ]
    },
    tep_instavel_conduta: {
      id: 'tep_instavel_conduta', title: 'TEP de alto risco — estabilização imediata',
      description: 'Não atrasar suporte e avaliação para reperfusão.', type: 'action', critical: true,
      content: `<div class="space-y-3 text-sm"><div class="rounded-lg border border-red-300 bg-red-50 p-4"><strong>ABCDE, monitorização contínua e UTI.</strong> Oxigênio; evitar sedação e intubação precipitadas. Se necessária, usar estratégia hemodinamicamente protetora.</div><ul class="list-disc space-y-1 pl-5"><li>Cristaloide em bolus cauteloso de até 500 mL se hipotensão; evitar sobrecarga.</li><li>Norepinefrina como vasopressor de escolha; considerar dobutamina se baixo débito com pressão adequada.</li><li>Se Angio-TC for inviável pela instabilidade, realizar ecocardiografia/POCUS à beira-leito e US venosa.</li><li>Na alta suspeita sem contraindicação, iniciar anticoagulação parenteral e avaliar reperfusão emergencial.</li></ul></div>`,
      options: [{ text: 'Prosseguir para reperfusão/contraindicações', nextStep: 'tep_trombolise_contra', value: 'alto_risco' }]
    },
    tep_wells: { id: 'tep_wells', title: 'Escore de Wells para TEP', description: 'Marque os critérios presentes; o escore direcionará a investigação.', type: 'question' },
    tep_perc: { id: 'tep_perc', title: 'Regra PERC', description: 'Aplicável somente quando a probabilidade clínica é baixa. Todos os oito critérios devem ser negativos para encerrar a investigação.', type: 'question' },
    tep_years: { id: 'tep_years', title: 'Critérios YEARS e D-dímero', description: 'Informe os critérios e o D-dímero para aplicar o ponto de corte apropriado.', type: 'question' },
    tep_angio_tc: {
      id: 'tep_angio_tc', title: 'Angiotomografia de tórax', description: 'Solicitar Angio-TC de artérias pulmonares.', type: 'question',
      content: `<div class="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">Se houver contraindicação a contraste ou impossibilidade técnica, considerar cintilografia V/Q conforme disponibilidade. Em instabilidade que impeça transporte, usar ecocardiografia/POCUS e US venosa para decisão emergencial contextualizada.</div>`,
      options: [
        { text: 'TEP confirmado', nextStep: 'tep_spesi', value: 'angio_positiva', critical: true },
        { text: 'TEP não demonstrado', nextStep: 'tep_excluido', value: 'angio_negativa' },
        { text: 'Exame inconclusivo ou inviável', nextStep: 'tep_exame_alternativo', value: 'angio_inconclusiva' }
      ]
    },
    tep_exame_alternativo: {
      id: 'tep_exame_alternativo', title: 'Investigação complementar', description: 'Escolha o exame alternativo conforme estabilidade e disponibilidade.', type: 'question',
      options: [
        { text: 'TEP sustentado por exame alternativo', description: 'Cintilografia V/Q de alta probabilidade, TVP proximal ou repercussão direita compatível no contexto de alta suspeita.', nextStep: 'tep_spesi', value: 'confirmado_alternativo' },
        { text: 'TEP excluído após investigação complementar', nextStep: 'tep_excluido', value: 'excluido_alternativo' },
        { text: 'Persistem dúvida e risco clínico', nextStep: 'tep_internacao', value: 'investigacao_hospitalar' }
      ]
    },
    tep_spesi: { id: 'tep_spesi', title: 'sPESI e repercussão cardiopulmonar', description: 'Estratifique mortalidade, biomarcadores e função do ventrículo direito.', type: 'question' },
    tep_categoria: { id: 'tep_categoria', title: 'Categoria de risco A–E', description: 'Classificação integrada por clínica, hemodinâmica, biomarcadores e ventrículo direito.', type: 'question' },
    tep_tratamento: {
      id: 'tep_tratamento', title: 'Tratamento conforme categoria de risco', description: 'A conduta deve considerar risco de deterioração, sangramento, função renal e acesso ao sistema de saúde.', type: 'question',
      options: [
        { text: 'Categoria A/B — tratamento ambulatorial elegível', nextStep: 'tep_alta', value: 'categoria_ab' },
        { text: 'Categoria C — internação e anticoagulação', nextStep: 'tep_internacao', value: 'categoria_c' },
        { text: 'Categoria D/E — reperfusão e UTI', nextStep: 'tep_trombolise_contra', value: 'categoria_de', critical: true, requiresImmediateAction: true }
      ]
    },
    tep_trombolise_contra: { id: 'tep_trombolise_contra', title: 'Segurança para trombólise', description: 'Revise contraindicações absolutas e relativas antes da reperfusão sistêmica.', type: 'question', critical: true },
    tep_reperfusao: {
      id: 'tep_reperfusao', title: 'Estratégia de reperfusão', description: 'Selecionar a estratégia em equipe e sem atrasos evitáveis.', type: 'question', critical: true,
      options: [
        { text: 'Trombólise sistêmica', description: 'Alteplase 100 mg EV em 2 h; em PCR/iminência, protocolo de bolus conforme rotina institucional.', nextStep: 'tep_uti', value: 'trombolise_sistemica', critical: true },
        { text: 'Terapia dirigida por cateter / trombectomia', description: 'Preferir quando trombólise for contraindicada, falhar ou houver indicação da equipe especializada.', nextStep: 'tep_uti', value: 'terapia_cateter', critical: true },
        { text: 'Embolectomia cirúrgica', description: 'Alternativa em contraindicação/falha de trombólise ou anatomia/contexto favorável.', nextStep: 'tep_uti', value: 'embolectomia', critical: true }
      ]
    },
    tep_excluido: {
      id: 'tep_excluido', title: 'TEP excluído', description: 'A estratégia diagnóstica aplicada não sustenta tromboembolismo pulmonar agudo.', type: 'result',
      content: `<div class="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm"><strong>Buscar diagnósticos diferenciais</strong> e orientar retorno imediato se houver piora da dispneia, dor torácica, síncope, hemoptise ou hipoxemia.</div>`
    },
    tep_alta: {
      id: 'tep_alta', title: 'Tratamento ambulatorial', description: 'TEP de baixo risco, paciente estável e com seguimento seguro.', type: 'result',
      content: `<div class="space-y-3 text-sm"><p><strong>Anticoagulação oral:</strong> selecionar conforme função renal, interações, risco hemorrágico, gestação e acesso. Opções usuais incluem rivaroxabana ou apixabana desde o início; dabigatrana/edoxabana após heparina; varfarina com ponte até INR terapêutico.</p><p>Planejar no mínimo 3 meses, reavaliar causa provocada/não provocada e duração estendida. Entregar sinais de alarme e retorno precoce.</p></div>`
    },
    tep_internacao: {
      id: 'tep_internacao', title: 'Internação hospitalar', description: 'Monitorização e anticoagulação para risco intermediário ou investigação não concluída.', type: 'result',
      content: `<div class="space-y-3 text-sm"><p><strong>Anticoagulação plena:</strong> HBPM é preferencial na maioria dos estáveis; HNF é útil quando há instabilidade, alto risco de sangramento, insuficiência renal grave ou possibilidade de procedimento/reperfusão.</p><p>Monitorar sinais de deterioração, troponina/BNP, função do VD, hemograma, função renal e sangramento. Reavaliar necessidade de terapia de resgate.</p></div>`
    },
    tep_uti: {
      id: 'tep_uti', title: 'UTI e manejo do TEP de alto risco', description: 'Choque/PCR ou falência cardiopulmonar iminente.', type: 'result', critical: true,
      content: `<div class="rounded-lg border border-red-300 bg-red-50 p-4 text-sm"><strong>Manter suporte hemodinâmico e respiratório, anticoagulação quando segura, estratégia de reperfusão definida e vigilância intensiva para sangramento e falência de VD.</strong></div>`
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
    'pac_destino_ambulatorial',
    'pac_destino_enfermaria',
    'pac_uti_protocolo_concluido',
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
            <p><strong>Prestar atenção:</strong> quadros de febre persistente, paciente apresentando expectoração, taquicardia (FC &gt; 100 bpm), presença de estertores na ausculta pulmonar, diminuição de sons pulmonares, sudorese noturna, mialgia e aumento de frequência respiratória (acima de 25 irpm).</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li><strong>Idosos:</strong> frequentemente podem ter apresentações atípicas, com sintomas frustros ou pouco exuberantes, como mal estar, fraqueza, rebaixamento do nível de consciência ou diminuição da cognição.</li>
            <li><strong>Imagem no PS:</strong> usar POCUS pulmonar <button type="button" data-pac-pocus-image="true" class="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-teal-300 bg-white text-xs font-black text-teal-700 align-middle hover:bg-teal-100" title="Ver imagem de POCUS pulmonar">i</button> quando disponível para avaliação à beira-leito; solicitar <strong>RX de tórax</strong> <button type="button" data-pac-rx-info="true" class="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-sky-300 bg-white text-xs font-black text-sky-700 align-middle hover:bg-sky-100" title="Ver orientação sobre RX de tórax">i</button> <button type="button" data-pac-rx-image="true" class="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-emerald-300 bg-white text-xs font-black text-emerald-700 align-middle hover:bg-emerald-100" title="Ver imagem de RX de tórax">i</button> conforme disponibilidade, dúvida diagnóstica, extensão da doença, derrame pleural, necessidade de documentação ou internação; reservar <strong>TC de tórax</strong> <button type="button" data-pac-ct-info="true" class="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-violet-300 bg-white text-xs font-black text-violet-700 align-middle hover:bg-violet-100" title="Ver orientação sobre TC de tórax">i</button> <button type="button" data-pac-ct-image="true" class="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-emerald-300 bg-white text-xs font-black text-emerald-700 align-middle hover:bg-emerald-100" title="Ver imagem de TC de tórax">i</button> para dúvida diagnóstica, falha terapêutica, complicações ou diagnósticos alternativos.</li>
            <li><strong>Sequência institucional:</strong> confirmar suspeita de PAC, aplicar CRB-65 na triagem, CURB-65 após exames, ATS/IDSA para destino, DRIP para antibiótico e SMART-COP para risco de deterioração.</li>
          </ul>
          <details data-pac-pocus-details="true" class="rounded-xl border border-sky-200 bg-sky-50 p-4">
            <summary class="cursor-pointer font-semibold text-sky-950">POCUS pulmonar na suspeita de PAC <button type="button" data-pac-pocus-image="true" class="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-teal-300 bg-white text-xs font-black text-teal-700 align-middle hover:bg-teal-100" title="Ver imagem de POCUS pulmonar">i</button></summary>
            <div class="mt-4 space-y-4 text-slate-800">
              <div class="rounded-lg border border-sky-200 bg-white p-3">
                <h5 class="font-bold text-sky-950">Objetivo</h5>
                <p class="mt-1">Identificar rapidamente consolidações pulmonares, broncogramas aéreos, padrão intersticial focal e derrames pleurais associados à pneumonia, sem exposição à radiação e à beira-leito.</p>
              </div>
              <div class="rounded-lg border border-slate-200 bg-white p-3">
                <h5 class="font-bold text-slate-950">Preparo e equipamento</h5>
                <p class="mt-1"><strong>Posição:</strong> sentado ou semi-Fowler 30-45 graus sempre que possível; decúbito dorsal se restrito ao leito. Avaliar regiões posteriores aumenta a sensibilidade, principalmente em pneumonias basais.</p>
                <p class="mt-1"><strong>Transdutor:</strong> convexo 2-5 MHz para avaliação global; linear 7-12 MHz pode ser usado para linha pleural e pequenas consolidações subpleurais.</p>
              </div>
              <div class="rounded-lg border border-slate-200 bg-white p-3">
                <h5 class="font-bold text-slate-950">Técnica</h5>
                <p class="mt-1"><strong>Varredura em 12 zonas:</strong> anterior superior/inferior, lateral superior/inferior e posterior superior/inferior em ambos os hemitóraces.</p>
                <p class="mt-1"><strong>Transdutor:</strong> longitudinal, marcador cefálico, visualizando duas costelas, sombras acústicas e linha pleural entre elas, formando o Bat Sign.</p>
              </div>
              <div class="rounded-lg border border-emerald-200 bg-white p-3">
                <h5 class="font-bold text-emerald-950">Achados a pesquisar</h5>
                <ul class="mt-2 list-disc pl-5 space-y-1">
                  <li><strong>Deslizamento pleural:</strong> normalmente presente.</li>
                  <li><strong>Linhas A:</strong> horizontais, paralelas à pleura, sugerem pulmão aerado.</li>
                  <li><strong>Linhas B:</strong> na pneumonia tendem a ser focais, assimétricas e adjacentes à consolidação.</li>
                  <li><strong>Consolidação subpleural:</strong> achado principal, com aspecto de pulmão hepatizado.</li>
                  <li><strong>Broncograma aéreo dinâmico:</strong> focos hiperecogênicos móveis dentro da consolidação durante a respiração, sugestivo de pneumonia bacteriana.</li>
                  <li><strong>Derrame pleural:</strong> avaliar recessos costofrênicos; derrame septado pode sugerir complicação/empiema.</li>
                </ul>
              </div>
              <div class="rounded-lg border border-cyan-200 bg-cyan-50 p-3">
                <h5 class="font-bold text-cyan-950">Interpretação pelo BLUE Protocol <button type="button" data-pac-blue-image="true" class="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-cyan-300 bg-white text-xs font-black text-cyan-700 align-middle hover:bg-cyan-100" title="Ver imagem do Protocolo BLUE">i</button> <button type="button" data-pac-blue-algorithm-image="true" class="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-blue-300 bg-white text-xs font-black text-blue-700 align-middle hover:bg-blue-100" title="Ver algoritmo do Protocolo BLUE">i</button></h5>
                <p class="mt-1"><strong>Objetivo:</strong> protocolo ultrassonográfico à beira-leito para investigar insuficiência respiratória aguda e diferenciar pneumonia, edema pulmonar cardiogênico, DPOC/asma, TEP e pneumotórax.</p>
                <p class="mt-2"><strong>Componentes principais:</strong> deslizamento pleural, linhas A e linhas B.</p>
                <p class="mt-2"><strong>Pontos de avaliação:</strong> BLUE point superior, BLUE point inferior e PLAPS point bilateral, com pesquisa posterolateral de consolidação, pneumonia e derrame pleural.</p>
                <div class="mt-3 grid gap-2 md:grid-cols-2">
                  <div class="rounded-lg border border-slate-200 bg-white p-3">
                    <p class="font-bold text-slate-950">Perfil A</p>
                    <p class="mt-1">Lung sliding presente, linhas A predominantes e ausência de linhas B. Sugere DPOC/asma; se associado à TVP, pensar em TEP.</p>
                  </div>
                  <div class="rounded-lg border border-red-200 bg-white p-3">
                    <p class="font-bold text-red-950">Perfil A + TVP</p>
                    <p class="mt-1">Perfil A com ultrassom venoso positivo para trombose. Diagnóstico provável: tromboembolismo pulmonar.</p>
                  </div>
                  <div class="rounded-lg border border-blue-200 bg-white p-3">
                    <p class="font-bold text-blue-950">Perfil B</p>
                    <p class="mt-1">Lung sliding presente com linhas B difusas bilaterais. Diagnóstico provável: edema agudo de pulmão cardiogênico.</p>
                  </div>
                  <div class="rounded-lg border border-amber-200 bg-white p-3">
                    <p class="font-bold text-amber-950">Perfil B'</p>
                    <p class="mt-1">Linhas B com lung sliding abolido. Diagnóstico provável: pneumonia.</p>
                  </div>
                  <div class="rounded-lg border border-emerald-200 bg-white p-3">
                    <p class="font-bold text-emerald-950">Perfil C</p>
                    <p class="mt-1">Consolidação pulmonar anterior, hepatização pulmonar e/ou broncograma aéreo. Diagnóstico provável: pneumonia.</p>
                  </div>
                  <div class="rounded-lg border border-emerald-200 bg-white p-3">
                    <p class="font-bold text-emerald-950">Perfil A/B</p>
                    <p class="mt-1">Pulmão normal de um lado e linhas B do outro. Diagnóstico provável: pneumonia unilateral.</p>
                  </div>
                  <div class="rounded-lg border border-emerald-200 bg-white p-3">
                    <p class="font-bold text-emerald-950">Perfil PLAPS</p>
                    <p class="mt-1">Consolidação posterior e/ou derrame pleural no ponto posterolateral. Diagnóstico provável: pneumonia, especialmente basal.</p>
                  </div>
                  <div class="rounded-lg border border-slate-300 bg-white p-3">
                    <p class="font-bold text-slate-950">Perfil A'</p>
                    <p class="mt-1">Ausência de lung sliding com linhas A predominantes. Procurar lung point; se presente, sugere pneumotórax.</p>
                  </div>
                </div>
                <div class="mt-3 rounded-lg border border-cyan-200 bg-white p-3">
                  <p class="font-bold text-cyan-950">Fluxo simplificado do BLUE</p>
                  <p class="mt-1">Insuficiência respiratória → avaliar lung sliding. Se ausente, perfil A' e procurar lung point. Se presente, avaliar linhas B difusas bilaterais; se presentes, perfil B/edema pulmonar. Se não, procurar consolidação ou PLAPS positivo; se presentes, pneumonia. Se perfil A persistente, pesquisar TVP: se positiva, TEP; se negativa, DPOC/asma.</p>
                </div>
                <div class="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
                  <p><strong>Na PAC, valorizar:</strong> Perfil C, Perfil A/B, Perfil B' e PLAPS positivo, principalmente quando associados a broncograma aéreo dinâmico e quadro clínico compatível.</p>
                </div>
              </div>
              <div class="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
                <h5 class="font-bold text-indigo-950">Ultrassom Pulmonar (LUS - Lung Ultrasound) <button type="button" data-pac-lus-image="true" class="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-indigo-300 bg-white text-xs font-black text-indigo-700 align-middle hover:bg-indigo-100" title="Ver imagem de LUS">i</button></h5>
                <p class="mt-1">O LUS é uma ferramenta diagnóstica rápida, não invasiva, livre de radiação ionizante e de alta acurácia para avaliação de pacientes com suspeita de PAC. Consolidou-se como método complementar ao exame físico e à radiografia de tórax, especialmente na emergência, UTI e enfermaria.</p>
                <p class="mt-2">Seu princípio baseia-se na análise da interface pleural e dos artefatos ultrassonográficos produzidos pela interação entre o ar pulmonar e as estruturas adjacentes. A perda de aeração por processo infeccioso pode gerar padrões característicos, como consolidações pulmonares, broncogramas aéreos dinâmicos, linhas B focais ou difusas, irregularidades pleurais e derrames pleurais.</p>
                <div class="mt-3 grid gap-3 md:grid-cols-2">
                  <div class="rounded-lg border border-indigo-200 bg-white p-3">
                    <p class="font-bold text-indigo-950">LUS Score</p>
                    <p class="mt-1">Permite estimar a extensão do comprometimento pulmonar dividindo o tórax em regiões padronizadas e classificando cada área conforme o grau de perda de aeração. A soma dos escores auxilia no acompanhamento evolutivo, resposta ao tratamento, necessidade de suporte ventilatório e estratificação prognóstica.</p>
                  </div>
                  <div class="rounded-lg border border-emerald-200 bg-white p-3">
                    <p class="font-bold text-emerald-950">Vantagens</p>
                    <ul class="mt-1 list-disc pl-5 space-y-1">
                      <li>Realização à beira-leito.</li>
                      <li>Repetição seriada sem radiação.</li>
                      <li>Alta sensibilidade para consolidações subpleurais e pequenos derrames pleurais.</li>
                      <li>Integração rápida a protocolos como BLUE e RUSH.</li>
                    </ul>
                  </div>
                </div>
                <div class="mt-3 rounded-lg border border-amber-200 bg-white p-3">
                  <p class="font-bold text-amber-950">Limitações e interpretação</p>
                  <p class="mt-1">Lesões profundas que não alcançam a superfície pleural podem não ser detectadas, e a acurácia depende da técnica de aquisição e da experiência do examinador. Os achados devem ser interpretados com história clínica, exame físico, exames laboratoriais e métodos convencionais, especialmente RX ou TC de tórax quando indicados.</p>
                </div>
                <div class="mt-3 rounded-lg border border-slate-200 bg-white p-3">
                  <p class="font-bold text-slate-950">Mensagem prática</p>
                  <p class="mt-1">As principais diretrizes reconhecem o LUS como ferramenta valiosa na insuficiência respiratória aguda e na pneumonia, especialmente em pacientes críticos, quando o RX tem limitações diagnósticas ou quando se deseja monitorar a evolução do comprometimento pulmonar.</p>
                </div>
              </div>
              <div class="rounded-lg border border-amber-200 bg-white p-3">
                <h5 class="font-bold text-amber-950">Interpretação</h5>
                <p class="mt-1"><strong>POCUS positivo:</strong> consolidação subpleural associada a broncograma aéreo dinâmico, linhas B focais adjacentes e/ou derrame pleural aumenta fortemente a probabilidade de PAC.</p>
                <p class="mt-1"><strong>POCUS negativo:</strong> predomínio de linhas A, sem consolidação e sem derrame reduz a probabilidade de pneumonia, devendo ser correlacionado com febre, tosse, dispneia, hipoxemia e marcadores inflamatórios.</p>
              </div>
              <div class="rounded-lg border border-violet-200 bg-white p-3">
                <h5 class="font-bold text-violet-950">Laudo padronizado sugerido</h5>
                <p class="mt-1">POCUS pulmonar realizado em 12 zonas pulmonares. Identificada consolidação subpleural em __________ medindo aproximadamente ___ cm, associada à presença de broncograma aéreo dinâmico e linhas B focais adjacentes. Derrame pleural: ausente / laminar / moderado / septado. Achados ultrassonográficos compatíveis com pneumonia. Correlacionar com dados clínicos e laboratoriais.</p>
              </div>
            </div>
          </details>
          <div class="rounded-xl border border-slate-200 bg-white p-4">
            <h4 class="font-bold text-slate-950">Fluxo lógico do protocolo</h4>
            <div class="mt-3 grid gap-3 md:grid-cols-2">
              <div class="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p class="font-semibold text-blue-950">1. Triagem inicial</p>
                <p class="mt-1 text-blue-900"><strong>CRB-65:</strong> pode ir para casa ou precisa avaliação hospitalar?</p>
              </div>
              <div class="rounded-lg border border-cyan-200 bg-cyan-50 p-3">
                <p class="font-semibold text-cyan-950">2. Solicitação de exames</p>
                <p class="mt-1 text-cyan-900"><strong>Checklist:</strong> básicos, gravidade/comorbidades, microbiologia e pacientes selecionados.</p>
              </div>
              <div class="rounded-lg border border-cyan-200 bg-cyan-50 p-3">
                <p class="font-semibold text-cyan-950">3. Após exames iniciais</p>
                <p class="mt-1 text-cyan-900"><strong>CURB-65:</strong> qual o risco inicial de mortalidade e internação?</p>
              </div>
              <div class="rounded-lg border border-rose-200 bg-rose-50 p-3">
                <p class="font-semibold text-rose-950">4. Definir destino</p>
                <p class="mt-1 text-rose-900"><strong>ATS/IDSA:</strong> enfermaria, unidade intermediária ou UTI?</p>
              </div>
              <div class="rounded-lg border border-orange-200 bg-orange-50 p-3">
                <p class="font-semibold text-orange-950">5. Definir antibiótico</p>
                <p class="mt-1 text-orange-900"><strong>DRIP:</strong> precisa cobrir MRSA/Pseudomonas/germes resistentes?</p>
              </div>
              <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <p class="font-semibold text-emerald-950">6. Risco de piora</p>
                <p class="mt-1 text-emerald-900"><strong>SMART-COP:</strong> vai precisar de ventilação mecânica ou vasopressor?</p>
              </div>
              <div class="rounded-lg border border-violet-200 bg-violet-50 p-3">
                <p class="font-semibold text-violet-950">Complementares</p>
                <p class="mt-1 text-violet-900"><strong>PSI/PORT, SCAP, SIPF, SOAR, SOFA e SAPS 3:</strong> prognóstico, auditoria, pesquisa e UTI.</p>
              </div>
            </div>
          </div>
          <details class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <summary class="cursor-pointer font-semibold text-slate-900">Ver resumo dos escores de PAC</summary>
            <div class="mt-4 space-y-4 text-slate-800">
              <div class="rounded-lg border border-cyan-200 bg-white p-3">
                <h5 class="font-bold text-cyan-950">CURB-65</h5>
                <p class="mt-1">Critérios: confusão mental nova, ureia &gt;7 mmol/L ou BUN &gt;20 mg/dL, FR ≥30 irpm, PAS &lt;90 mmHg ou PAD ≤60 mmHg, idade ≥65 anos. Cada critério vale 1 ponto; máximo 5.</p>
                <p class="mt-1"><strong>Interpretação:</strong> 0-1 baixo risco/tratamento ambulatorial; 2 risco moderado/considerar internação; ≥3 risco elevado/avaliar internação hospitalar ou UTI; 4-5 risco muito elevado/forte indicação de internação e avaliação em UTI.</p>
              </div>
              <div class="rounded-lg border border-blue-200 bg-white p-3">
                <h5 class="font-bold text-blue-950">CRB-65</h5>
                <p class="mt-1">Versão sem laboratório: confusão mental nova, FR ≥30 irpm, PAS &lt;90 mmHg ou PAD ≤60 mmHg, idade ≥65 anos. Cada critério vale 1 ponto; máximo 4.</p>
                <p class="mt-1"><strong>Interpretação:</strong> 0 baixo risco; 1-2 considerar avaliação hospitalar; ≥3 alto risco com internação recomendada.</p>
              </div>
              <div class="rounded-lg border border-red-200 bg-white p-3">
                <h5 class="font-bold text-red-950">Critérios ATS/IDSA para PAC grave</h5>
                <p class="mt-1"><strong>Critérios maiores:</strong> ventilação mecânica invasiva ou choque séptico com necessidade de vasopressor. A presença de 1 critério maior define PAC grave.</p>
                <p class="mt-1"><strong>Critérios menores:</strong> FR ≥30, PaO2/FiO2 ≤250, infiltrado multilobar, confusão/desorientação, BUN ≥20 mg/dL, leucopenia &lt;4.000/mm3, plaquetopenia &lt;100.000/mm3, hipotermia &lt;36°C e hipotensão necessitando reposição volêmica agressiva. Três ou mais critérios menores definem PAC grave e indicam forte consideração de UTI.</p>
              </div>
              <div class="rounded-lg border border-orange-200 bg-white p-3">
                <h5 class="font-bold text-orange-950">SMART-COP</h5>
                <p class="mt-1">Prediz necessidade de ventilação mecânica, vasopressor ou terapia intensiva. Componentes: PAS &lt;90, comprometimento multilobar, albumina &lt;3,5 g/dL, FR elevada (≥25/min se &lt;50 anos ou ≥30/min se ≥50 anos), FC ≥125 bpm, confusão aguda, hipoxemia significativa para idade e pH arterial &lt;7,35.</p>
                <p class="mt-1"><strong>Interpretação:</strong> 0-2 baixo risco; 3-4 moderado; 5-6 alto; ≥7 muito alto.</p>
              </div>
              <div class="rounded-lg border border-emerald-200 bg-white p-3">
                <h5 class="font-bold text-emerald-950">Outros escores relacionados</h5>
                <p class="mt-1"><strong>PSI/PORT:</strong> principal score de mortalidade, com cerca de 20 variáveis, classes I a V e foco em necessidade de internação.</p>
                <p class="mt-1"><strong>SCAP:</strong> prevê ventilação mecânica, choque séptico e mortalidade hospitalar.</p>
                <p class="mt-1"><strong>SIPF:</strong> combina Shock Index (FC/PAS) e PaO2/FiO2 para mortalidade e necessidade de UTI.</p>
                <p class="mt-1"><strong>SOAR:</strong> saturação, orientação, idade e frequência respiratória; útil especialmente em idosos.</p>
              </div>
              <div class="rounded-lg border border-violet-200 bg-white p-3">
                <h5 class="font-bold text-violet-950">DRIP Score - Drug Resistance in Pneumonia</h5>
                <p class="mt-1">Não mede gravidade; estima risco de patógenos resistentes. <strong>Fatores maiores (2 pontos):</strong> antibiótico nos últimos 60 dias, instituição de longa permanência, alimentação por sonda, colonização prévia por germe resistente ou infecção prévia por germe resistente.</p>
                <p class="mt-1"><strong>Fatores menores (1 ponto):</strong> hospitalização recente, doença pulmonar crônica, dependência funcional, uso de bloqueadores de ácido gástrico e feridas crônicas.</p>
                <p class="mt-1"><strong>Interpretação:</strong> &lt;4 baixo risco de resistência; ≥4 considerar cobertura para germes multirresistentes, como MRSA/Pseudomonas, conforme contexto clínico, epidemiologia local e critérios ATS/IDSA atuais.</p>
              </div>
            </div>
          </details>
        </div>
      `,
      options: [
        { text: 'Avaliação inicial / Sinais Vitais / Exame Físico', nextStep: 'pac_exame_fisico', value: 'iniciar_exame_fisico' }
      ]
    },
    pac_exame_fisico: {
      id: 'pac_exame_fisico',
      title: 'Exame Físico Direcionado',
      description: 'Registrar os achados clínicos antes da aplicação dos escores de gravidade.',
      type: 'action',
      content: '',
      options: []
    },
    pac_crb65_triagem: {
      id: 'pac_crb65_triagem',
      title: 'Etapa 1 - CRB-65',
      description: 'Primeiro score de triagem para decidir baixo risco versus avaliação hospitalar.',
      type: 'question',
      content: `
        <div class="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
          <p><strong>Objetivo:</strong> identificar rapidamente pacientes de baixo ou alto risco ainda na triagem.</p>
          <p class="mt-2"><strong>Pergunta:</strong> esse paciente pode ser tratado ambulatorialmente ou precisa avaliação hospitalar?</p>
        </div>
      `,
      options: []
    },
    pac_solicitacao_exames: {
      id: 'pac_solicitacao_exames',
      title: 'Etapa 2 - Solicitação de Exames',
      description: 'Checklist de exames laboratoriais e microbiológicos antes do CURB-65.',
      type: 'question',
      content: `
        <div class="rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-950">
          <p><strong>Objetivo:</strong> registrar os exames solicitados antes do CURB-65, separando exames básicos, exames conforme gravidade/comorbidade, investigação microbiológica e testes para pacientes selecionados.</p>
          <p class="mt-2"><strong>Pacote inicial mais usado no PS:</strong> hemograma completo, ureia, creatinina, sódio, potássio, glicemia e PCR. Acrescentar lactato se houver suspeita de sepse/gravidade e gasometria arterial se hipoxemia ou desconforto respiratório.</p>
        </div>
      `,
      options: []
    },
    pac_resultados_exames: {
      id: 'pac_resultados_exames',
      title: 'Resultados dos Exames Iniciais',
      description: 'Registrar resultados dos exames básicos e daqueles solicitados conforme gravidade ou necessidade clínica.',
      type: 'question',
      content: `
        <div class="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-950">
          <p><strong>Objetivo:</strong> registrar os resultados disponíveis antes do CURB-65 e aproveitar automaticamente ureia, pressão arterial, frequência respiratória, estado mental e idade na pontuação.</p>
          <p class="mt-2">Resultados ainda pendentes podem permanecer em branco. O escore deverá ser revisado e confirmado pelo médico na etapa seguinte.</p>
        </div>
      `,
      options: []
    },
    pac_curb65_protocolo: {
      id: 'pac_curb65_protocolo',
      title: 'Etapa 3 - CURB-65',
      description: 'Aplicar após exames iniciais, acrescentando ureia/BUN ao CRB-65.',
      type: 'question',
      content: `
        <div class="rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-950">
          <p><strong>Objetivo:</strong> estratificação inicial de gravidade após laboratório.</p>
          <p class="mt-2"><strong>Pergunta:</strong> qual o risco inicial de mortalidade e necessidade de internação?</p>
        </div>
      `,
      options: []
    },
    pac_ats_idsa_gravidade: {
      id: 'pac_ats_idsa_gravidade',
      title: 'Etapa 3 - ATS/IDSA para PAC Grave',
      description: 'Definir necessidade de terapia intensiva.',
      type: 'question',
      critical: true,
      content: `
        <div class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-950">
          <p><strong>Objetivo:</strong> determinar se há PAC grave e necessidade de UTI.</p>
          <p class="mt-2"><strong>Pergunta:</strong> esse paciente precisa de terapia intensiva?</p>
          <p class="mt-2"><strong>Destino automático:</strong> 2 critérios menores indicam enfermaria; 3 ou mais critérios menores, ou qualquer critério maior, indicam UTI.</p>
        </div>
      `,
      options: []
    },
    pac_destino_protocolo: {
      id: 'pac_destino_protocolo',
      title: 'Etapa 3b - Definir Destino',
      description: 'Escolher destino assistencial após CRB-65, CURB-65 e ATS/IDSA.',
      type: 'question',
      content: `
        <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
          <p><strong>Defina o destino clínico:</strong> ambulatório, enfermaria/unidade intermediária ou UTI. Use o resultado dos escores como apoio, mas preserve julgamento clínico, comorbidades, hipoxemia e capacidade de seguimento.</p>
        </div>
      `,
      options: [
        { text: 'Ambulatório', nextStep: 'pac_conduta_ambulatorial', value: 'ambulatorio' },
        { text: 'Enfermaria / unidade intermediária', nextStep: 'pac_drip_enfermaria', value: 'enfermaria', critical: true },
        { text: 'UTI', nextStep: 'pac_drip_uti', value: 'uti', critical: true }
      ]
    },
    pac_drip_enfermaria: {
      id: 'pac_drip_enfermaria',
      title: 'Etapa 4 - DRIP Score',
      description: 'Aplicar após decidir internação em enfermaria/unidade intermediária.',
      type: 'question',
      content: `
        <div class="rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-950">
          <p><strong>Objetivo:</strong> estimar risco de patógenos resistentes para ajustar antibiótico empírico.</p>
          <p class="mt-2"><strong>Pergunta:</strong> preciso ampliar cobertura para MRSA ou Pseudomonas?</p>
        </div>
      `,
      options: []
    },
    pac_drip_uti: {
      id: 'pac_drip_uti',
      title: 'Etapa 4 - DRIP Score',
      description: 'Aplicar após decidir UTI.',
      type: 'question',
      critical: true,
      content: `
        <div class="rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-950">
          <p><strong>Objetivo:</strong> estimar risco de patógenos resistentes para ajustar antibiótico empírico na admissão hospitalar/UTI.</p>
          <p class="mt-2"><strong>Pergunta:</strong> preciso ampliar cobertura para MRSA ou Pseudomonas?</p>
        </div>
      `,
      options: []
    },
    pac_smartcop_enfermaria: {
      id: 'pac_smartcop_enfermaria',
      title: 'Etapa 5 - SMART-COP',
      description: 'Risco de ventilação mecânica, vasopressor e suporte intensivo.',
      type: 'question',
      content: `
        <div class="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-950">
          <p><strong>Objetivo:</strong> prever deterioração respiratória/hemodinâmica.</p>
          <p class="mt-2"><strong>Pergunta:</strong> esse paciente ainda não está em choque ou intubado, mas vai piorar?</p>
        </div>
      `,
      options: []
    },
    pac_smartcop_uti: {
      id: 'pac_smartcop_uti',
      title: 'Etapa 5 - SMART-COP',
      description: 'Risco de ventilação mecânica, vasopressor e suporte intensivo.',
      type: 'question',
      critical: true,
      content: `
        <div class="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-950">
          <p><strong>Objetivo:</strong> documentar risco de ventilação mecânica, vasopressor e suporte intensivo.</p>
          <p class="mt-2"><strong>Na UTI:</strong> usar como apoio de gravidade e monitorização, junto de SOFA/SAPS 3 conforme rotina institucional.</p>
        </div>
      `,
      options: []
    },
    pac_conduta_ambulatorial: {
      id: 'pac_conduta_ambulatorial',
      title: 'Conduta Ambulatorial da PAC',
      description: 'Definir antibioticoterapia, receita e orientações de retorno antes da alta ambulatorial.',
      type: 'question',
      content: `
        <div class="space-y-3 text-sm">
          <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p><strong>Antes da alta:</strong> definir esquema antibiótico, gerar receita, orientar sinais de piora e garantir possibilidade de retorno/reavaliação.</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-white p-4">
            <p><strong>Previamente hígido, sem comorbidades e sem antibiótico recente:</strong> amoxicilina VO como primeira opção conforme protocolo local.</p>
            <p class="mt-2"><strong>Com comorbidades ou uso recente de antibiótico:</strong> beta-lactâmico associado a macrolídeo, por exemplo amoxicilina/clavulanato + azitromicina, ajustando a alergias, função renal, perfil epidemiológico e julgamento clínico.</p>
          </div>
          <div class="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p><strong>Orientar retorno imediato se:</strong> piora da dispneia, queda de saturação, confusão, hipotensão, febre persistente, vômitos/intolerância oral, prostração importante, dor torácica, cianose, síncope ou ausência de melhora clínica.</p>
            <p class="mt-2"><strong>Reavaliação:</strong> preferencialmente em 48 a 72 horas, ou antes se houver piora.</p>
          </div>
        </div>
      `,
      options: []
    },
    pac_destino_ambulatorial: {
      id: 'pac_destino_ambulatorial',
      title: 'Destino - Ambulatório',
      description: 'Tratamento ambulatorial quando baixo risco e sem limitadores.',
      type: 'result',
      group: 'Ambulatório',
      content: `
        <div class="space-y-3 text-sm">
          <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p><strong>Destino:</strong> tratamento ambulatorial se baixo risco, sem instabilidade, sem hipoxemia relevante, sem limitador social/via oral e com capacidade de retorno.</p>
          </div>
          <p><strong>Antibioticoterapia:</strong> definir conforme comorbidades, uso recente de antibiótico, alergias e protocolo institucional.</p>
        </div>
      `,
      options: []
    },
    pac_cuidados_aguarda_enfermaria: {
      id: 'pac_cuidados_aguarda_enfermaria',
      title: 'Cuidados iniciais enquanto aguarda leito',
      description: 'Monitorização, antibioticoterapia precoce, oxigenoterapia e reavaliação até transferência para enfermaria.',
      type: 'action',
      group: 'Enfermaria',
      content: pacWaitingAdmissionCareContent,
      options: [
        {
          text: 'Confirmar cuidados e seguir para enfermaria',
          description: 'Registra o cuidado no pronto-socorro enquanto aguarda leito de enfermaria.',
          nextStep: 'pac_destino_enfermaria',
          value: 'cuidados_aguarda_enfermaria_aplicados',
          critical: true
        }
      ]
    },
    pac_destino_enfermaria: {
      id: 'pac_destino_enfermaria',
      title: 'Destino - Enfermaria',
      description: 'Internação em enfermaria/unidade intermediária.',
      type: 'result',
      group: 'Enfermaria',
      content: `
        <div class="space-y-3 text-sm">
          <div class="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
            <p><strong>Destino:</strong> internação em enfermaria ou unidade intermediária, com monitorização clínica, oxigenoterapia conforme necessidade e reavaliação seriada.</p>
          </div>
          <p>A antibioticoterapia deve seguir o resultado do DRIP, fatores ATS/IDSA, culturas prévias e epidemiologia local.</p>
        </div>
      `,
      options: []
    },
    pac_cuidados_aguarda_uti: {
      id: 'pac_cuidados_aguarda_uti',
      title: 'Cuidados iniciais enquanto aguarda leito',
      description: 'Monitorização, antibioticoterapia precoce, oxigenoterapia e reavaliação até transferência para UTI.',
      type: 'action',
      critical: true,
      group: 'UTI',
      content: pacWaitingICUCareContent,
      options: [
        {
          text: 'Confirmar cuidados e seguir para protocolo de UTI',
          description: 'Registra o cuidado no pronto-socorro antes do protocolo específico de PAC grave.',
          nextStep: 'pac_destino_uti',
          value: 'cuidados_aguarda_uti_aplicados',
          critical: true,
          requiresImmediateAction: true
        }
      ]
    },
    pac_destino_uti: {
      id: 'pac_destino_uti',
      title: 'PAC grave aguardando leito de UTI',
      description: 'Estabilização e tratamento contínuos no pronto-socorro até a transferência.',
      type: 'action',
      critical: true,
      group: 'UTI',
      content: `
        <div class="space-y-4 text-sm">
          <div class="rounded-xl border border-red-300 bg-red-100 p-4">
            <h4 class="font-bold text-red-950">PROTOCOLO DE PAC GRAVE NO PRONTO-SOCORRO AGUARDANDO LEITO DE UTI</h4>
            <p class="mt-2">A indicação e a solicitação da vaga de UTI não encerram o atendimento. Manter estabilização, tratamento antimicrobiano e monitorização contínua até a transferência efetiva.</p>
          </div>

          <div class="rounded-xl border border-slate-200 bg-white p-4">
            <h5 class="font-bold text-slate-950">Monitorização e acessos</h5>
            <p class="mt-2">Manter monitor cardíaco, oximetria contínua, pressão arterial e frequência respiratória seriadas, controle de temperatura, nível de consciência, perfusão periférica e diurese.</p>
            <p class="mt-2">Garantir acesso venoso adequado. Considerar acesso arterial ou central conforme instabilidade, necessidade de vasopressor, gasometrias seriadas e protocolo institucional.</p>
          </div>

          <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <h5 class="font-bold text-blue-950">Oxigenação e suporte ventilatório</h5>
            <ul class="mt-2 list-disc space-y-1 pl-5 text-blue-950">
              <li>Ofertar oxigênio para corrigir hipoxemia, com alvo individualizado; em retenção crônica de CO2, manter faixa de 88-92%.</li>
              <li>Escalonar cateter nasal, máscara, cânula nasal de alto fluxo ou ventilação não invasiva conforme necessidade e etiologia.</li>
              <li>Reavaliar frequentemente trabalho respiratório, gasometria, relação PaO2/FiO2 ou SpO2/FiO2 e sinais de fadiga.</li>
              <li>Avaliar intubação diante de hipoxemia refratária, falência respiratória iminente, exaustão, rebaixamento do sensório, instabilidade hemodinâmica ou incapacidade de proteger vias aéreas.</li>
            </ul>
          </div>

          <div class="rounded-xl border border-rose-200 bg-rose-50 p-4">
            <h5 class="font-bold text-rose-950">Antibioticoterapia precoce</h5>
            <p class="mt-2">Iniciar tratamento empírico sem atraso após culturas quando a coleta for viável e não postergar a primeira dose.</p>
            <p class="mt-2">Definir o esquema conforme resultado do DRIP, culturas prévias, internações, antibiótico recente, epidemiologia local e fatores ATS/IDSA. Descalonar após resultados microbiológicos e evolução clínica.</p>
          </div>

          <div class="grid gap-4 lg:grid-cols-2">
            <div class="rounded-xl border border-violet-200 bg-violet-50 p-4">
              <h5 class="font-bold text-violet-950">Exames e microbiologia</h5>
              <p class="mt-2">Revisar hemograma, função renal, eletrólitos, função hepática, glicemia, PCR, gasometria arterial e lactato. Solicitar coagulograma e troponina conforme contexto.</p>
              <p class="mt-2">Em PAC grave, considerar hemoculturas, cultura de secreção respiratória e testes virais antes do antibiótico quando possível, sem atrasar tratamento.</p>
            </div>
            <div class="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h5 class="font-bold text-amber-950">Imagem e complicações</h5>
              <p class="mt-2">Revisar radiografia e/ou POCUS pulmonar, pesquisando consolidação multilobar, derrame pleural e congestão.</p>
              <p class="mt-2">Considerar TC de tórax se imagem inicial inconclusiva, hipoxemia desproporcional, suspeita de empiema, abscesso, necrose, obstrução, tromboembolismo pulmonar ou outro diagnóstico alternativo.</p>
            </div>
          </div>

          <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <h5 class="font-bold text-emerald-950">Hemodinâmica e sepse</h5>
            <p class="mt-2">Se houver sepse ou choque, medir e acompanhar lactato, coletar culturas, administrar cristaloide de forma individualizada e reavaliar responsividade, perfusão, congestão e diurese.</p>
            <p class="mt-2">Na hipotensão persistente após reposição adequada, iniciar vasopressor conforme protocolo, geralmente noradrenalina, visando perfusão e pressão arterial média adequadas.</p>
          </div>

          <div class="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <h5 class="font-bold text-orange-950">Reavaliação enquanto aguarda a UTI</h5>
            <p class="mt-2">Reavaliar a cada 30 minutos a 1 hora os sinais vitais, necessidade de oxigênio, estado mental, perfusão, lactato, diurese e disfunções orgânicas, ou imediatamente se houver piora. Documentar intercorrências e comunicar qualquer deterioração à equipe da UTI.</p>
            <p class="mt-2">Aplicar SOFA no contexto de sepse/disfunção orgânica e SAPS 3 após admissão na UTI, conforme rotina institucional.</p>
          </div>
        </div>
      `,
      options: [
        {
          text: 'Confirmar estabilização e manejo enquanto aguarda UTI',
          description: 'Registra a continuidade do cuidado no pronto-socorro antes da conclusão.',
          nextStep: 'pac_uti_protocolo_concluido',
          value: 'protocolo_pac_uti_aplicado',
          critical: true,
          requiresImmediateAction: true
        }
      ]
    },
    pac_uti_protocolo_concluido: {
      id: 'pac_uti_protocolo_concluido',
      title: 'Manejo da PAC grave confirmado',
      description: 'Estabilização mantida no pronto-socorro enquanto aguarda transferência para UTI.',
      type: 'result',
      critical: true,
      group: 'UTI',
      content: '',
      options: []
    },
    pac_sepse_insuficiencia: {
      id: 'pac_sepse_insuficiencia',
      title: 'Sinais de Sepse ou Insuficiência Respiratória Aguda?',
      description: 'Identificar necessidade de estabilização clínica imediata.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-2 text-sm">
          <p><strong>Critérios de interrupção do fluxograma:</strong> pacientes que se apresentam com sepse, sinais de má perfusão e choque, insuficiência respiratória ou falência pulmonar, hipóxia significativa (SpO2 &lt;90% em ar ambiente, PaO2 &lt;60 mmHg, PaO2/FiO2 &lt;250).</p>
          <p>Se qualquer critério estiver presente, interrompa a aplicação do escore e priorize estabilização clínica imediata.</p>
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
            <p><strong>Prioridade inicial:</strong> estabilização clínica do paciente, avaliação da gravidade para decisão do local mais adequado de internação hospitalar e verificação do histórico clínico/fatores de risco para cobertura de Pseudomonas.</p>
          </div>
          <div class="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
            <p><strong>Atendimento inicial:</strong> monitorização cardíaca + PANI, suplementação de O2 conforme severidade da hipoxemia (CNO2, Venturi, não reinalante ou VNI), acesso venoso periférico, avaliação da necessidade de coleta de culturas, marcadores de inflamação (lactato, PCR), hemoculturas e secreção traqueal quando indicado.</p>
            <p class="mt-2">Avaliar necessidade de suporte ventilatório invasivo ou hemodinâmico com drogas vasoativas. A antibioticoterapia deve ser iniciada de forma precoce, pois a precocidade da administração é fundamental para melhor desfecho.</p>
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

// Fluxograma de Faringoamigdalites
export const faringoamigdaliteFlowchart: EmergencyFlowchart = {
  id: 'faringoamigdalite',
  name: 'Faringoamigdalites',
  description: 'Estratificação pelo Escore de Centor Modificado para evitar antibiótico desnecessário e identificar provável etiologia bacteriana.',
  category: 'otorhinolaryngological',
  priority: 'medium',
  icon: 'stethoscope',
  color: 'from-sky-600 to-blue-700',
  initialStep: 'faringo_inicio',
  finalSteps: [
    'faringo_internacao_avaliacao',
    'faringo_alta_sintomatica',
    'faringo_considerar_antibiotico',
    'faringo_bacteriana_antibiotico'
  ],
  steps: {
    faringo_inicio: {
      id: 'faringo_inicio',
      title: 'Faringoamigdalite - Avaliação Inicial',
      description: 'Paciente com dor de garganta, febre, odinofagia, faringalgia ou otalgia reflexa.',
      type: 'question',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-sky-50 p-3 rounded border-l-4 border-sky-500">
            <p><strong>Quadro clássico:</strong> febre, queda do estado geral, prostração/inapetência, queimação faríngea, faringalgia, odinofagia e otalgia reflexa.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>A maioria dos quadros é viral.</li>
            <li>Em crianças e adolescentes de 5 a 15 anos, faringite estreptocócica pode representar parcela relevante dos casos.</li>
            <li>Coriza, conjuntivite e tosse sugerem etiologia viral.</li>
            <li>Secreção purulenta em tonsilas palatinas não confirma necessariamente infecção bacteriana.</li>
            <li>Prescrever ou não antibiótico deve ser guiado pelo Escore de Centor Modificado.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Iniciar avaliação', nextStep: 'faringo_complicacoes', value: 'iniciar' }
      ]
    },
    faringo_complicacoes: {
      id: 'faringo_complicacoes',
      title: 'Há Complicação Supurativa ou Toxemia?',
      description: 'Pesquisar abscesso, toxemia, dificuldade respiratória ou incapacidade de hidratação oral.',
      type: 'question',
      critical: true,
      content: `
        <div class="bg-red-50 p-3 rounded border-l-4 border-red-600 text-sm">
          <p><strong>Internar/avaliar urgência</strong> se houver complicações supurativas, como abscesso retrofaríngeo ou tonsilar, ou toxemia significativa por provável infecção bacteriana.</p>
        </div>
      `,
      options: [
        { text: 'Sim - internar/avaliar urgência', nextStep: 'faringo_internacao_avaliacao', value: 'complicacao', critical: true, requiresImmediateAction: true },
        { text: 'Não - avaliar etiologia viral', nextStep: 'faringo_sinais_virais', value: 'sem_complicacao' }
      ]
    },
    faringo_sinais_virais: {
      id: 'faringo_sinais_virais',
      title: 'Há Sinais Concomitantes de Etiologia Viral?',
      description: 'Coriza, conjuntivite e tosse reduzem a probabilidade de faringoamigdalite bacteriana.',
      type: 'question',
      content: `
        <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500 text-sm">
          <p><strong>Sugere viral:</strong> presença concomitante de coriza, conjuntivite e tosse. Nesses casos, priorizar tratamento sintomático e evitar antibiótico.</p>
        </div>
      `,
      options: [
        { text: 'Sim - quadro sugere viral', nextStep: 'faringo_alta_sintomatica', value: 'viral' },
        { text: 'Não - calcular Centor Modificado', nextStep: 'faringo_centor', value: 'avaliar_centor' }
      ]
    },
    faringo_centor: {
      id: 'faringo_centor',
      title: 'Escore de Centor Modificado',
      description: 'Some os critérios e escolha a faixa de pontuação.',
      type: 'question',
      content: `
        <div class="space-y-3 text-sm">
          <div class="overflow-hidden rounded-lg border border-slate-300">
            <table class="w-full text-left">
              <thead class="bg-sky-100 text-slate-900">
                <tr>
                  <th class="px-3 py-2 font-bold">Critério</th>
                  <th class="px-3 py-2 font-bold">Pontuação</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                <tr><td class="px-3 py-2">Febre &gt; 38°C</td><td class="px-3 py-2">+1</td></tr>
                <tr><td class="px-3 py-2">Adenopatia cervical anterior</td><td class="px-3 py-2">+1</td></tr>
                <tr><td class="px-3 py-2">Exsudato ou edema amigdaliano</td><td class="px-3 py-2">+1</td></tr>
                <tr><td class="px-3 py-2">Ausência de tosse</td><td class="px-3 py-2">+1</td></tr>
                <tr><td class="px-3 py-2">Idade entre 3 e 14 anos</td><td class="px-3 py-2">+1</td></tr>
                <tr><td class="px-3 py-2">Idade entre 15 e 44 anos</td><td class="px-3 py-2">0</td></tr>
                <tr><td class="px-3 py-2">Idade &gt; 45 anos</td><td class="px-3 py-2">-1</td></tr>
              </tbody>
            </table>
          </div>
          <p><strong>Interpretação:</strong> ≤ 1 ponto: não prescrever antibiótico; 2 a 3 pontos: considerar antibiótico se sinais e sintomas sugerirem infecção bacteriana; ≥ 4 pontos: prescrever antibiótico.</p>
        </div>
      `,
      options: [
        { text: '≤ 1 ponto', nextStep: 'faringo_alta_sintomatica', value: 'centor_0_1' },
        { text: 'Entre 2 e 3 pontos', nextStep: 'faringo_sugestivo_bacteriano', value: 'centor_2_3' },
        { text: '≥ 4 pontos', nextStep: 'faringo_bacteriana_antibiotico', value: 'centor_4_mais' }
      ]
    },
    faringo_sugestivo_bacteriano: {
      id: 'faringo_sugestivo_bacteriano',
      title: 'Centor 2-3: Há Sinais Sugestivos de Infecção Bacteriana?',
      description: 'Decidir se o paciente intermediário deve receber antibiótico.',
      type: 'question',
      content: `
        <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500 text-sm">
          <p>Com 2 a 3 pontos, considerar antibiótico quando o conjunto clínico for sugestivo de infecção bacteriana, especialmente febre, odinofagia importante, adenopatia anterior dolorosa, exsudato/edema amigdaliano e ausência de sintomas virais.</p>
        </div>
      `,
      options: [
        { text: 'Sim - considerar antibiótico', nextStep: 'faringo_considerar_antibiotico', value: 'bacteriana_sugestiva' },
        { text: 'Não - sintomáticos e orientação', nextStep: 'faringo_alta_sintomatica', value: 'sem_sugestao_bacteriana' }
      ]
    },
    faringo_alta_sintomatica: {
      id: 'faringo_alta_sintomatica',
      title: 'Alta com Tratamento Sintomático',
      description: 'Baixa probabilidade bacteriana ou quadro viral.',
      type: 'result',
      group: 'Sintomático',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500">
            <p><strong>Conduta:</strong> não prescrever antibiótico. Tratamento sintomático e medidas não farmacológicas.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Gargarejo com água morna e sal e chás podem aliviar sintomas.</li>
            <li>Repouso e hidratação adequada.</li>
            <li>Retornar se febre persistente apesar das medicações, dificuldade de falar, inchaço intenso no pescoço ou queda intensa do estado geral.</li>
          </ul>
        </div>
      `,
      options: []
    },
    faringo_considerar_antibiotico: {
      id: 'faringo_considerar_antibiotico',
      title: 'Considerar Antibiótico',
      description: 'Centor 2-3 com sinais sugestivos de infecção bacteriana.',
      type: 'result',
      group: 'Considerar ATB',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500">
            <p><strong>Conduta:</strong> considerar antibiótico associado a sintomáticos, conforme avaliação clínica e perfil do paciente.</p>
          </div>
          <p><strong>Opções:</strong> penicilina G benzatina IM dose única, amoxicilina por 10 dias ou penicilina V por 10 dias. Se alergia a penicilina, considerar azitromicina, cefalexina ou cefuroxima conforme risco individual.</p>
        </div>
      `,
      options: []
    },
    faringo_bacteriana_antibiotico: {
      id: 'faringo_bacteriana_antibiotico',
      title: 'Provável Faringoamigdalite Bacteriana',
      description: 'Centor Modificado ≥ 4 pontos.',
      type: 'result',
      group: 'Bacteriana',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
            <p><strong>Conduta:</strong> prescrever antibiótico e sintomáticos.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Penicilina G benzatina 1.200.000 UI IM em dose única.</li>
            <li>Amoxicilina 500 mg VO de 8/8 horas por 10 dias.</li>
            <li>Penicilina V 500 mg VO de 8/8 horas por 10 dias.</li>
            <li>Se alergia: azitromicina, cefalexina ou cefuroxima conforme perfil clínico.</li>
          </ul>
        </div>
      `,
      options: []
    },
    faringo_internacao_avaliacao: {
      id: 'faringo_internacao_avaliacao',
      title: 'Internação/Avaliação Urgente',
      description: 'Complicação supurativa ou toxemia significativa.',
      type: 'result',
      critical: true,
      content: `
        <div class="bg-red-50 p-3 rounded border-l-4 border-red-600 text-sm">
          <p><strong>Conduta:</strong> internar para antibioticoterapia parenteral, suporte clínico e avaliação cirúrgica quando houver suspeita de abscesso ou outra complicação supurativa.</p>
        </div>
      `,
      options: []
    }
  }
}

// Fluxograma de Epistaxe no Pronto Socorro
export const epistaxeFlowchart: EmergencyFlowchart = {
  id: 'epistaxe',
  name: 'Epistaxe',
  description: 'Abordagem inicial da epistaxe no pronto-socorro, com estabilização, compressão, vasoconstrictor, tamponamento e critérios de internação.',
  category: 'otorhinolaryngological',
  priority: 'medium',
  icon: 'droplets',
  color: 'from-yellow-500 to-red-600',
  initialStep: 'epistaxe_inicio',
  finalSteps: [
    'epistaxe_observacao_alta',
    'epistaxe_internacao_otorrino',
    'epistaxe_cirurgia_endoscopica'
  ],
  steps: {
    epistaxe_inicio: {
      id: 'epistaxe_inicio',
      title: 'Paciente com Epistaxe no Pronto Socorro',
      description: 'Sangramento proveniente da cavidade nasal, geralmente anterior, mas podendo ser posterior e grave.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-yellow-50 p-3 rounded border-l-4 border-yellow-500">
            <p><strong>Essencial:</strong> iniciar com proteção de via aérea e estabilidade hemodinâmica. A epistaxe anterior corresponde a 90-95% dos casos; a posterior é menos frequente, mas mais grave.</p>
          </div>
          <div class="grid gap-3 md:grid-cols-2">
            <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p class="font-bold text-slate-900">Anamnese direcionada</p>
              <ul class="mt-2 list-disc pl-5 space-y-1">
                <li>Hipertensão prévia</li>
                <li>Corpo estranho</li>
                <li>Quadros prévios</li>
                <li>Rinite ou sinusite</li>
                <li>Uso de cocaína</li>
                <li>Uso de anticoagulantes</li>
              </ul>
            </div>
            <div class="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p class="font-bold text-blue-950">Posicionamento</p>
              <p class="mt-2">Manter paciente sentado, com flexão cervical anterior. Evitar deitar ou inclinar a cabeça para trás.</p>
            </div>
          </div>
          <p>Quando possível, identificar local e causa do sangramento com rinoscopia nasal anterior.</p>
        </div>
      `,
      options: [
        { text: 'Paciente posicionado e ABC avaliado', nextStep: 'epistaxe_choque_instabilidade', value: 'abc_ok' }
      ]
    },
    epistaxe_choque_instabilidade: {
      id: 'epistaxe_choque_instabilidade',
      title: 'Há Sinais de Choque ou Instabilidade?',
      description: 'Avaliar hipotensão, taquicardia, rebaixamento, sangramento volumoso ou comprometimento de via aérea.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-600">
            <p><strong>Instabilidade:</strong> priorizar medidas de ressuscitação, controle de via aérea quando necessário e reversão de anticoagulação conforme contexto.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Monitorização contínua</li>
            <li>Dois acessos venosos calibrosos</li>
            <li>Cristaloides</li>
            <li>Considerar hemotransfusão</li>
            <li>Reversão de anticoagulação quando indicada</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Sim - iniciar ressuscitação', nextStep: 'epistaxe_ressuscitacao', value: 'instavel', critical: true, requiresImmediateAction: true },
        { text: 'Não - seguir controle local', nextStep: 'epistaxe_compressao_vasoconstrictor', value: 'estavel' }
      ]
    },
    epistaxe_ressuscitacao: {
      id: 'epistaxe_ressuscitacao',
      title: 'Medidas de Ressuscitação',
      description: 'Estabilizar antes e durante medidas locais de controle.',
      type: 'question',
      critical: true,
      content: `
        <div class="bg-red-50 p-3 rounded border-l-4 border-red-600 text-sm">
          <p><strong>Conduta imediata:</strong> monitorização, dois acessos venosos calibrosos, cristaloides, considerar hemotransfusão e reverter anticoagulação quando apropriado. Acionar otorrinolaringologia se sangramento volumoso, posterior ou falha de controle.</p>
        </div>
      `,
      options: [
        { text: 'Paciente estabilizado - controle local', nextStep: 'epistaxe_compressao_vasoconstrictor', value: 'estabilizado' },
        { text: 'Instabilidade persistente / via aérea ameaçada', nextStep: 'epistaxe_internacao_otorrino', value: 'instabilidade_persistente', critical: true, requiresImmediateAction: true }
      ]
    },
    epistaxe_compressao_vasoconstrictor: {
      id: 'epistaxe_compressao_vasoconstrictor',
      title: 'Compressão Digital + Vasoconstrictor Nasal',
      description: 'Primeira medida local: compressão no terço inferior do nariz por 5 a 10 minutos.',
      type: 'question',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500">
            <p><strong>Compressão digital:</strong> comprimir o terço inferior do nariz por 5 a 10 minutos. Gelo no dorso nasal pode auxiliar.</p>
          </div>
          <div class="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
            <p><strong>Lavagem + vasoconstrictor:</strong> soro fisiológico 0,9% gelado e vasoconstrictor tópico, como oximetazolina, adrenalina ou ácido tranexâmico tópico, conforme disponibilidade e protocolo local.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'Houve controle', nextStep: 'epistaxe_observacao_alta', value: 'controle' },
        { text: 'Não houve controle', nextStep: 'epistaxe_tamponamento_anterior', value: 'sem_controle' }
      ]
    },
    epistaxe_tamponamento_anterior: {
      id: 'epistaxe_tamponamento_anterior',
      title: 'Tamponamento Anterior e/ou Cauterização',
      description: 'Quando falha compressão/vasoconstrictor; cauterizar apenas se local visível, idealmente pelo otorrino.',
      type: 'question',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-yellow-50 p-3 rounded border-l-4 border-yellow-500">
            <p><strong>Cauterização:</strong> se local do sangramento estiver visível. Pode ser química ou elétrica, idealmente pelo otorrinolaringologista.</p>
          </div>
          <div class="rounded-lg border border-slate-300 bg-slate-50 p-3">
            <p class="font-bold">Tamponamento nasal anterior</p>
            <ul class="mt-2 list-disc pl-5 space-y-1">
              <li>Método com dedo de luva/gaze estéril dobrada ou dispositivo comercial conforme disponibilidade.</li>
              <li>Lubrificar e inserir com cuidado, respeitando limites anatômicos.</li>
              <li>Fixar externamente para permitir remoção posterior.</li>
              <li>Reavaliar orofaringe, pois persistência de sangramento posterior torna o tamponamento anterior inviável.</li>
              <li>Tempo habitual de permanência: cerca de 48 horas, com reavaliação para retirada.</li>
            </ul>
          </div>
        </div>
      `,
      options: [
        { text: 'Houve controle', nextStep: 'epistaxe_observacao_alta', value: 'controle' },
        { text: 'Não houve controle / suspeita posterior', nextStep: 'epistaxe_tamponamento_posterior', value: 'sem_controle', critical: true }
      ]
    },
    epistaxe_tamponamento_posterior: {
      id: 'epistaxe_tamponamento_posterior',
      title: 'Tamponamento Posterior',
      description: 'Gaze ou sonda Foley; preferencialmente com otorrino e geralmente com internação.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-600">
            <p><strong>Epistaxe posterior:</strong> geralmente precisa de internação e avaliação de otorrinolaringologista.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Tamponamento posterior com gaze ou sonda Foley, preferencialmente por profissional experiente.</li>
            <li>Frequentemente feito em dupla.</li>
            <li>Costuma permanecer por cerca de 48 horas.</li>
            <li>Associar tamponamento anterior.</li>
            <li>Considerar antibioticoterapia conforme protocolo local para reduzir risco de infecção.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Houve controle', nextStep: 'epistaxe_internacao_otorrino', value: 'controle', critical: true },
        { text: 'Não houve controle', nextStep: 'epistaxe_cirurgia_endoscopica', value: 'sem_controle', critical: true, requiresImmediateAction: true }
      ]
    },
    epistaxe_observacao_alta: {
      id: 'epistaxe_observacao_alta',
      title: 'Observação e Alta',
      description: 'Controle obtido, paciente estável e sem critérios de internação imediata.',
      type: 'result',
      group: 'Alta',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500">
            <p><strong>Conduta:</strong> observação no pronto-socorro e alta se mantiver controle do sangramento e estabilidade clínica.</p>
          </div>
          <div class="bg-yellow-50 p-3 rounded border-l-4 border-yellow-500">
            <p class="font-bold">Orientações pós-alta</p>
            <ul class="mt-2 list-disc pl-5 space-y-1">
              <li>Evitar manipulação interna da cavidade nasal nos próximos dias.</li>
              <li>Evitar medicações nasais não prescritas pelo médico.</li>
              <li>Evitar atividades físicas muito intensas.</li>
              <li>Evitar banhos muito quentes e saunas.</li>
              <li>Retornar se sangramento recorrente, volumoso, tontura, fraqueza, palidez, dispneia ou piora clínica.</li>
            </ul>
          </div>
          <p>Epistaxes anteriores podem ter alta com tampão se sangramento estiver controlado, com reavaliação em 48 horas para retirada.</p>
        </div>
      `,
      options: []
    },
    epistaxe_internacao_otorrino: {
      id: 'epistaxe_internacao_otorrino',
      title: 'Internação e Avaliação do Otorrinolaringologista',
      description: 'Indicado em epistaxe posterior, instabilidade, falha de controle ou necessidade de tamponamento posterior.',
      type: 'result',
      critical: true,
      requiresSpecialist: true,
      group: 'Internação',
      content: `
        <div class="bg-red-50 p-3 rounded border-l-4 border-red-600 text-sm">
          <p><strong>Conduta:</strong> internar e solicitar avaliação de otorrinolaringologia. Monitorar sangramento, via aérea, hemodinâmica, necessidade transfusional e reversão de anticoagulação quando aplicável.</p>
        </div>
      `,
      options: []
    },
    epistaxe_cirurgia_endoscopica: {
      id: 'epistaxe_cirurgia_endoscopica',
      title: 'Cirurgia e/ou Terapia Endoscópica',
      description: 'Falha de tamponamento posterior ou sangramento persistente importante.',
      type: 'result',
      critical: true,
      requiresSpecialist: true,
      group: 'Falha de controle',
      content: `
        <div class="bg-red-50 p-3 rounded border-l-4 border-red-600 text-sm">
          <p><strong>Conduta:</strong> acionar otorrinolaringologia para controle cirúrgico/endoscópico. Manter ressuscitação, monitorização, controle de via aérea e suporte transfusional conforme necessidade.</p>
        </div>
      `,
      options: []
    }
  }
}

// Fluxograma de Monoartrites Agudas
export const monoartriteFlowchart: EmergencyFlowchart = {
  id: 'monoartrite',
  name: 'Monoartrites Agudas',
  description: 'Abordagem da monoartrite aguda no pronto-socorro com prioridade para artrocentese, exclusão de artrite séptica e estratificação de gota pelo Escore de Janssens.',
  category: 'musculoskeletal',
  priority: 'high',
  icon: 'activity',
  color: 'from-slate-600 to-zinc-700',
  initialStep: 'mono_inicio',
  finalSteps: [
    'mono_gota_tratamento',
    'mono_artrite_septica_internacao',
    'mono_inconclusivo_investigar',
    'mono_outro_diagnostico'
  ],
  steps: {
    mono_inicio: {
      id: 'mono_inicio',
      title: 'Monoartrite Aguda na Emergência',
      description: 'Paciente com dor, calor, edema ou limitação em uma articulação.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-600">
            <p><strong>Atenção imediata:</strong> a principal preocupação no pronto-socorro é artrite séptica. O quadro pode cursar com dor intensa, calor local, edema, limitação dos movimentos, febre e calafrios, mas febre pode não estar presente.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Idealmente, todo paciente com monoartrite aguda deve realizar artrocentese.</li>
            <li>Gota geralmente tem dor intensa, noturna, com pico nas primeiras 12 horas e pode acometer a 1ª metatarsofalangeana.</li>
            <li>Artrite séptica gonocócica pode se manifestar como tríade de tenossinovite, poliartralgias e dermatite, ou como artrite purulenta isolada.</li>
            <li>Ácido úrico tem pouca utilidade imediata isoladamente; cristais no líquido sinovial confirmam gota.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Iniciar abordagem', nextStep: 'mono_artrocentese_disponivel', value: 'iniciar' }
      ]
    },
    mono_artrocentese_disponivel: {
      id: 'mono_artrocentese_disponivel',
      title: 'Artrocentese Disponível?',
      description: 'A artrocentese é o caminho ideal para monoartrite aguda.',
      type: 'question',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500">
            <p><strong>Cenário ideal:</strong> a artrocentese deve ser realizada em todo paciente com monoartrite aguda, quando tecnicamente viável e disponível.</p>
          </div>
          <p>Se houver limitação técnica ou de recurso, use o Escore de Janssens como apoio, mantendo suspeita ativa para artrite séptica.</p>
        </div>
      `,
      options: [
        { text: 'Sim - realizar artrocentese', nextStep: 'mono_resultado_liquido', value: 'artrocentese_sim' },
        { text: 'Não - usar Escore de Janssens', nextStep: 'mono_janssens', value: 'artrocentese_nao' }
      ]
    },
    mono_resultado_liquido: {
      id: 'mono_resultado_liquido',
      title: 'Interpretação do Líquido Sinovial',
      description: 'Classifique o líquido sinovial para orientar conduta.',
      type: 'question',
      content: `
        <div class="space-y-3 text-sm">
          <div class="overflow-hidden rounded-lg border border-slate-300">
            <table class="w-full text-left">
              <thead class="bg-slate-200 text-slate-900">
                <tr>
                  <th class="px-3 py-2 font-bold">Característica</th>
                  <th class="px-3 py-2 font-bold">Normal</th>
                  <th class="px-3 py-2 font-bold">Não inflamatório</th>
                  <th class="px-3 py-2 font-bold">Gota</th>
                  <th class="px-3 py-2 font-bold">Artrite séptica</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                <tr><td class="px-3 py-2">Aparência</td><td class="px-3 py-2">Transparente</td><td class="px-3 py-2">Transparente</td><td class="px-3 py-2">Translúcido</td><td class="px-3 py-2">Opaco</td></tr>
                <tr><td class="px-3 py-2">Coloração</td><td class="px-3 py-2">Clara</td><td class="px-3 py-2">Amarelada</td><td class="px-3 py-2">Amarelada</td><td class="px-3 py-2">Amarelada</td></tr>
                <tr><td class="px-3 py-2">Viscosidade</td><td class="px-3 py-2">Alta</td><td class="px-3 py-2">Alta</td><td class="px-3 py-2">Baixa</td><td class="px-3 py-2">Variável</td></tr>
                <tr><td class="px-3 py-2">Leucócitos</td><td class="px-3 py-2">&lt; 200/mm³</td><td class="px-3 py-2">0 a 200/mm³</td><td class="px-3 py-2">2.000 a 50.000/mm³</td><td class="px-3 py-2">&gt; 50.000/mm³</td></tr>
                <tr><td class="px-3 py-2">PMN</td><td class="px-3 py-2">&lt; 25%</td><td class="px-3 py-2">25 a 50%</td><td class="px-3 py-2">&gt; 50%</td><td class="px-3 py-2">&gt; 75%</td></tr>
                <tr><td class="px-3 py-2">Cultura</td><td class="px-3 py-2">Negativa</td><td class="px-3 py-2">Negativa</td><td class="px-3 py-2">Negativa</td><td class="px-3 py-2">Positiva</td></tr>
                <tr><td class="px-3 py-2">Cristais</td><td class="px-3 py-2">Negativa</td><td class="px-3 py-2">Negativa</td><td class="px-3 py-2">Positiva</td><td class="px-3 py-2">Negativa</td></tr>
              </tbody>
            </table>
          </div>
          <p><strong>Conduta:</strong> interpretar e tratar conforme análise. Todo paciente com artrite séptica deve ser internado.</p>
        </div>
      `,
      options: [
        { text: 'Cristais positivos / compatível com gota', nextStep: 'mono_gota_tratamento', value: 'gota' },
        { text: 'Cultura positiva, líquido opaco ou forte suspeita séptica', nextStep: 'mono_artrite_septica_internacao', value: 'septica', critical: true, requiresImmediateAction: true },
        { text: 'Não inflamatório ou outro diagnóstico', nextStep: 'mono_outro_diagnostico', value: 'outro' }
      ]
    },
    mono_janssens: {
      id: 'mono_janssens',
      title: 'Escore de Janssens',
      description: 'Escore preditivo de gota quando artrocentese não está disponível.',
      type: 'question',
      content: `
        <div class="space-y-3 text-sm">
          <div class="overflow-hidden rounded-lg border border-slate-300">
            <table class="w-full text-left">
              <thead class="bg-slate-200 text-slate-900">
                <tr><th class="px-3 py-2 font-bold">Dado clínico</th><th class="px-3 py-2 font-bold">Pontuação</th></tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                <tr><td class="px-3 py-2">Homem</td><td class="px-3 py-2">+2</td></tr>
                <tr><td class="px-3 py-2">Artrite prévia relatada pelo paciente</td><td class="px-3 py-2">+2</td></tr>
                <tr><td class="px-3 py-2">Início agudo, máxima intensidade em 24h</td><td class="px-3 py-2">+0,5</td></tr>
                <tr><td class="px-3 py-2">Vermelhidão da articulação</td><td class="px-3 py-2">+1</td></tr>
                <tr><td class="px-3 py-2">Acometimento da 1ª metatarsofalangeana</td><td class="px-3 py-2">+2,5</td></tr>
                <tr><td class="px-3 py-2">Ácido úrico &gt; 5,88 mg/dL</td><td class="px-3 py-2">+3,5</td></tr>
                <tr><td class="px-3 py-2">Hipertensão, angina, IAM, ICC, doença cerebrovascular ou DAP</td><td class="px-3 py-2">+1,5</td></tr>
              </tbody>
            </table>
          </div>
          <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500">
            <p><strong>Interpretação:</strong> ≥ 8 sugere gota; 5 a 7 é inconclusivo; ≤ 4 torna gota improvável e exige considerar diagnósticos diferenciais, principalmente artrite séptica.</p>
          </div>
        </div>
      `,
      options: [
        { text: '≤ 4 pontos', nextStep: 'mono_artrite_septica_internacao', value: 'janssens_4_menos', critical: true, requiresImmediateAction: true },
        { text: '5 a 7 pontos', nextStep: 'mono_inconclusivo_investigar', value: 'janssens_5_7' },
        { text: '≥ 8 pontos', nextStep: 'mono_gota_tratamento', value: 'janssens_8_mais' }
      ]
    },
    mono_gota_tratamento: {
      id: 'mono_gota_tratamento',
      title: 'Considerar Como Gota',
      description: 'Escore de Janssens ≥ 8 ou cristais compatíveis no líquido sinovial.',
      type: 'result',
      group: 'Gota',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500">
            <p><strong>Conduta:</strong> iniciar tratamento de gota, mantendo artrocentese se disponível ou se houver suspeita forte de artrite séptica.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>AINEs são primeira linha: cetorolaco, tenoxicam ou cetoprofeno.</li>
            <li>Se contraindicação a AINE, considerar prednisona 40 mg VO.</li>
            <li>Colchicina 0,5 mg: fazer 1 mg, seguido de 0,5 mg após 1 hora, total de 1,5 mg no primeiro dia.</li>
          </ul>
        </div>
      `,
      options: []
    },
    mono_artrite_septica_internacao: {
      id: 'mono_artrite_septica_internacao',
      title: 'Considerar Artrite Séptica',
      description: 'Internação, artrocentese e antibiótico EV empiricamente.',
      type: 'result',
      critical: true,
      group: 'Artrite séptica',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-600">
            <p><strong>Conduta:</strong> internar para realizar artrocentese, colher líquido sinovial para análise e iniciar antibiótico EV empiricamente após coleta, quando possível.</p>
          </div>
          <p><strong>Tratamento mínimo:</strong> internação obrigatória nos casos de artrite séptica, com antibioticoterapia e reavaliação conforme culturas.</p>
        </div>
      `,
      options: []
    },
    mono_inconclusivo_investigar: {
      id: 'mono_inconclusivo_investigar',
      title: 'Diagnóstico Inconclusivo',
      description: 'Janssens 5 a 7: decisão baseada em outros exames e julgamento clínico.',
      type: 'result',
      group: 'Inconclusivo',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500">
            <p><strong>Conduta:</strong> diagnóstico incerto. Considerar imagem, exames complementares e artrocentese assim que possível.</p>
          </div>
          <p>Se houver febre, calafrios, toxemia, imunossupressão, prótese articular, bacteremia suspeita ou limitação intensa, conduzir como possível artrite séptica.</p>
        </div>
      `,
      options: []
    },
    mono_outro_diagnostico: {
      id: 'mono_outro_diagnostico',
      title: 'Outro Diagnóstico / Líquido Não Inflamatório',
      description: 'Resultado não compatível com gota nem artrite séptica.',
      type: 'result',
      content: `
        <div class="bg-slate-50 p-3 rounded border-l-4 border-slate-500 text-sm">
          <p><strong>Conduta:</strong> investigar diagnósticos diferenciais conforme história, exame físico, trauma, imagem e exames laboratoriais. Reavaliar se houver piora clínica.</p>
        </div>
      `,
      options: []
    }
  }
}

// Fluxograma de Crise de Ansiedade / Ataque de Pânico
export const ansiedadeFlowchart: EmergencyFlowchart = {
  id: 'crise_ansiedade',
  name: 'Crise de Ansiedade / Ataque de Pânico',
  description: 'Abordagem sistematizada do ataque de pânico no pronto-socorro, com exclusão inicial de causas orgânicas e manejo escalonado.',
  category: 'psychiatric',
  priority: 'medium',
  icon: 'brain',
  color: 'from-blue-600 to-indigo-700',
  initialStep: 'ansiedade_inicio',
  finalSteps: [
    'ansiedade_causa_organica',
    'ansiedade_alta_orientada',
    'ansiedade_avaliacao_psiquiatrica'
  ],
  steps: {
    ansiedade_inicio: {
      id: 'ansiedade_inicio',
      title: 'Crise de Ansiedade na Emergência',
      description: 'Episódio súbito de medo ou desconforto intenso com sintomas físicos e/ou cognitivos.',
      type: 'question',
      content: `
        <div class="space-y-4 text-sm">
          <div class="rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-950">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p class="font-extrabold">Ataque de pânico no pronto-socorro</p>
                <p class="mt-1">Episódio súbito e abrupto de medo ou desconforto intenso, acompanhado de sintomas físicos e/ou cognitivos.</p>
              </div>
              <button type="button" data-ansiedade-guide="true" class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-blue-400 bg-white text-sm font-extrabold text-blue-800 transition-colors hover:bg-blue-100" title="Ver guia rápido de crise de ansiedade" aria-label="Ver guia rápido de crise de ansiedade">i</button>
            </div>
          </div>
          <div class="grid gap-3 lg:grid-cols-2">
            <div class="rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-cyan-950">
              <p class="font-bold">Sintomas frequentes</p>
              <ul class="mt-2 list-disc space-y-1 pl-5">
                <li>Taquicardia, sudorese, tremores, náuseas, sensação de asfixia ou aperto torácico.</li>
                <li>Tontura, formigamentos, parestesias, calafrios ou ondas de calor.</li>
                <li>Medo de morrer, medo de perder o controle, despersonalização ou desrealização.</li>
              </ul>
            </div>
            <div class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
              <p class="font-bold">Ponto-chave</p>
              <p class="mt-2">A crise costuma ser autolimitada, mas o diagnóstico é clínico e de segurança: primeiro exclua causas orgânicas que simulam ansiedade.</p>
            </div>
          </div>
        </div>
      `,
      options: [
        { text: 'Iniciar abordagem', nextStep: 'ansiedade_excluir_organico', value: 'iniciar' }
      ]
    },
    ansiedade_excluir_organico: {
      id: 'ansiedade_excluir_organico',
      title: 'Excluir causa orgânica e risco imediato',
      description: 'Antes de concluir ansiedade, pesquisar diagnósticos potencialmente graves.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-4 text-sm">
          <div class="rounded-xl border border-red-200 bg-red-50 p-4 text-red-950">
            <p><strong>Não atribuir automaticamente à ansiedade:</strong> excluir rapidamente causas orgânicas que podem simular crise de pânico.</p>
          </div>
          <div class="grid gap-3 md:grid-cols-2">
            <div class="rounded-xl border border-slate-200 bg-white p-4">
              <p class="font-bold text-slate-950">Sinais que mudam a rota</p>
              <p class="mt-2 text-slate-800">Selecione abaixo todos os sinais presentes. A avaliação de ansiedade não será interrompida; ao final, o resumo exibirá os protocolos relacionados disponíveis.</p>
            </div>
            <div class="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-indigo-950">
              <p class="font-bold">Avaliação mínima sugerida conforme quadro</p>
              <ul class="mt-2 list-disc space-y-1 pl-5">
                <li>Sinais vitais, oximetria e glicemia capilar quando indicado.</li>
                <li>ECG se dor torácica, palpitações, síncope ou taquicardia persistente.</li>
                <li>Exame neurológico direcionado se queixas sensitivas/motoras ou alteração de fala.</li>
                <li>Investigar uso de estimulantes, álcool, drogas, abstinência e medicações.</li>
              </ul>
            </div>
          </div>
        </div>
      `,
      options: [
        { text: 'Há suspeita de causa orgânica', nextStep: 'ansiedade_causa_organica', value: 'organico', critical: true, requiresImmediateAction: true },
        { text: 'Sem sinais de causa orgânica após avaliação', nextStep: 'ansiedade_abordagem_nao_medicamentosa', value: 'sem_organico' }
      ]
    },
    ansiedade_abordagem_nao_medicamentosa: {
      id: 'ansiedade_abordagem_nao_medicamentosa',
      title: '1ª Linha: Abordagem Não Medicamentosa',
      description: 'Acolhimento, validação e respiração diafragmática.',
      type: 'question',
      content: `
        <div class="space-y-4 text-sm">
          <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
            <p class="font-bold">Acolhimento e psicoeducação</p>
            <p class="mt-1">Explique que, após exclusão de sinais de causa orgânica grave, os sintomas são reais, comuns e geralmente transitórios. Evite confrontar o paciente; valide o desconforto e reduza estímulos do ambiente.</p>
          </div>
          <div class="grid gap-3 md:grid-cols-2">
            <div class="rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-cyan-950">
              <p class="font-bold">Respiração diafragmática</p>
              <p class="mt-2">Orientar inspiração nasal lenta usando o abdome, pausa breve e expiração prolongada. Repetir por alguns minutos, com voz calma e instruções curtas.</p>
            </div>
            <div class="rounded-xl border border-violet-200 bg-violet-50 p-4 text-violet-950">
              <p class="font-bold">Aterramento</p>
              <p class="mt-2">Estimular o paciente a nomear objetos do ambiente, sentir os pés no chão e reconhecer que a crise tende a reduzir gradualmente.</p>
            </div>
          </div>
          <p class="rounded-xl border border-slate-200 bg-white p-4 text-slate-800">Reavaliar após a intervenção. Se houver melhora sustentada, orientar alta segura; se persistirem sofrimento intenso, hiperventilação importante, recorrência ou incapacidade de controle, considerar abordagem medicamentosa.</p>
        </div>
      `,
      options: [
        { text: 'Melhorou com abordagem não medicamentosa', nextStep: 'ansiedade_alta_orientada', value: 'melhorou' },
        { text: 'Sintomas persistentes / sofrimento importante', nextStep: 'ansiedade_medicamentosa', value: 'persistente' }
      ]
    },
    ansiedade_medicamentosa: {
      id: 'ansiedade_medicamentosa',
      title: '2ª Linha: Abordagem Medicamentosa',
      description: 'Benzodiazepínico em dose baixa e reavaliação.',
      type: 'question',
      group: 'Medicamentosa',
      content: `
        <div class="space-y-4 text-sm">
          <div class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
            <p class="font-bold">Usar quando sintomas persistem apesar da abordagem inicial</p>
            <p class="mt-1">Considerar benzodiazepínico em dose baixa, com reavaliação de resposta clínica, nível de sedação, oximetria e segurança respiratória.</p>
          </div>
          <div class="overflow-x-auto rounded-xl border border-slate-300 bg-white">
            <table class="w-full min-w-[720px] text-left">
              <thead class="bg-blue-100 text-slate-950">
                <tr><th class="px-3 py-2 font-bold">Opção</th><th class="px-3 py-2 font-bold">Dose prática</th><th class="px-3 py-2 font-bold">Observação</th></tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                <tr><td class="px-3 py-2 font-bold">Clonazepam comprimido</td><td class="px-3 py-2">0,25 a 0,5 mg VO</td><td class="px-3 py-2">Reavaliar antes de repetir dose.</td></tr>
                <tr><td class="px-3 py-2 font-bold">Clonazepam solução 2 mg/mL</td><td class="px-3 py-2">5 a 10 gotas VO</td><td class="px-3 py-2">Útil quando há dificuldade com comprimido.</td></tr>
                <tr><td class="px-3 py-2 font-bold">Diazepam</td><td class="px-3 py-2">5 mg VO</td><td class="px-3 py-2">Maior risco de sedação em idosos/frágeis.</td></tr>
                <tr><td class="px-3 py-2 font-bold">Alprazolam</td><td class="px-3 py-2">0,25 a 0,5 mg VO</td><td class="px-3 py-2">Evitar uso continuado sem seguimento.</td></tr>
              </tbody>
            </table>
          </div>
          <div class="rounded-xl border border-red-200 bg-red-50 p-4 text-red-950">
            <p><strong>Evitar benzodiazepínico</strong> em intoxicação por álcool/outros depressores, sedação excessiva, hipoxemia, risco respiratório, apneia do sono descompensada, gestação sem avaliação individualizada ou contraindicação clínica.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'Seguir para avaliação psicológica/psiquiátrica', nextStep: 'ansiedade_avaliacao_psiquiatrica', value: 'avaliacao_saude_mental' }
      ]
    },
    ansiedade_alta_orientada: {
      id: 'ansiedade_alta_orientada',
      title: 'Alta Orientada',
      description: 'Melhora clínica após acolhimento e respiração diafragmática.',
      type: 'result',
      group: 'Alta',
      content: `
        <div class="space-y-3 text-sm">
          <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
            <p><strong>Conduta:</strong> alta com orientações, sinais de retorno e encaminhamento ambulatorial quando indicado.</p>
          </div>
          <ul class="list-disc space-y-1 pl-5">
            <li>Reforçar que causas orgânicas graves foram avaliadas conforme quadro clínico.</li>
            <li>Ensinar respiração diafragmática e estratégias de aterramento.</li>
            <li>Orientar retorno se dor torácica, dispneia, síncope, déficit neurológico, confusão, ideação suicida ou piora importante.</li>
          </ul>
        </div>
      `,
      options: []
    },
    ansiedade_avaliacao_psiquiatrica: {
      id: 'ansiedade_avaliacao_psiquiatrica',
      title: 'Avaliação Psicológica / Psiquiátrica',
      description: 'Solicitar avaliação quando disponível no pronto-socorro ou seguimento ambulatorial.',
      type: 'result',
      group: 'Saúde mental',
      content: `
        <div class="space-y-3 text-sm">
          <div class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-950">
            <p><strong>Conduta:</strong> se serviço disponível no pronto-socorro, solicitar avaliação psicológica/psiquiátrica. Programar seguimento ambulatorial conforme caso, recorrência, sofrimento funcional, risco psicossocial ou ideação suicida.</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-white p-4 text-slate-800">
            <p>Se houver ideação suicida, risco de auto/heteroagressão, psicose, intoxicação grave ou incapacidade de autocuidado, manter observação protegida e avaliação especializada urgente.</p>
          </div>
        </div>
      `,
      options: []
    },
    ansiedade_causa_organica: {
      id: 'ansiedade_causa_organica',
      title: 'Investigar Causa Orgânica',
      description: 'Sinais de alerta exigem investigação direcionada antes de tratar como ansiedade.',
      type: 'result',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="rounded-xl border border-red-200 bg-red-50 p-4 text-red-950">
            <p><strong>Conduta:</strong> conduzir investigação conforme suspeita clínica: ECG/troponina se dor torácica, monitorização e ECG se taquiarritmia, avaliação neurológica se sinais focais, oximetria/gasometria/broncoespasmo se dispneia, além de glicemia e causas tóxico-metabólicas quando indicado.</p>
          </div>
          <div class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
            <p>O diagnóstico de crise de ansiedade/ataque de pânico deve ser retomado somente após estabilização e exclusão razoável da causa orgânica suspeita.</p>
          </div>
        </div>
      `,
      options: []
    }
  }
}

// Fluxograma de Síndrome Vertiginosa Aguda
export const sindromeVertiginosaFlowchart: EmergencyFlowchart = {
  id: 'sindrome_vertiginosa',
  name: 'Síndrome Vertiginosa Aguda',
  description: 'Abordagem da vertigem/tontura no pronto-socorro com foco em diferenciar AVC de fossa posterior de causas periféricas como neurite vestibular e VPPB.',
  category: 'neurological',
  priority: 'high',
  icon: 'brain',
  color: 'from-blue-700 to-cyan-700',
  initialStep: 'vertigem_inicio',
  finalSteps: [
    'vertigem_central_investigar',
    'vertigem_neurite_vestibular',
    'vertigem_vppb_hipotensao',
    'vertigem_recorrente_outros',
    'vertigem_nao_vertiginosa',
    'vertigem_hints_nao_aplicavel'
  ],
  steps: {
    vertigem_inicio: {
      id: 'vertigem_inicio',
      title: 'Paciente com Síndrome Vertiginosa Aguda',
      description: 'Paciente com queixa de vertigem ou tontura na emergência.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-blue-50 p-3 rounded border-l-4 border-blue-600">
            <p><strong>Desafio diagnóstico:</strong> a síndrome vertiginosa aguda pode ter origem periférica, como neurite vestibular ou VPPB, ou central, como AVC de fossa posterior.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>A TC de crânio tem papel limitado na abordagem da tontura e pode dar falsa segurança.</li>
            <li>A principal causa central é AVC isquêmico; a principal causa periférica de síndrome vestibular aguda é neurite vestibular.</li>
            <li>O HINTS deve ser aplicado apenas em pacientes com tontura contínua associada a nistagmo.</li>
            <li>Queixas de tontura não vertiginosa podem ser sistêmicas, cardiovasculares, neurológicas ou medicamentosas.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Iniciar abordagem', nextStep: 'vertigem_e_realmente_aguda', value: 'iniciar' }
      ]
    },
    vertigem_e_realmente_aguda: {
      id: 'vertigem_e_realmente_aguda',
      title: 'É Realmente uma Vertigem Aguda?',
      description: 'Separar vertigem de desequilíbrio, pré-síncope e tontura inespecífica.',
      type: 'question',
      content: `
        <div class="grid gap-3 text-sm md:grid-cols-2">
          <div class="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p class="font-bold text-blue-950">Vertigem</p>
            <p>Tontura rotatória, ambiente girando, associada a instabilidade, náuseas e vômitos. Ocorre mesmo em repouso.</p>
          </div>
          <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p class="font-bold text-slate-950">Não vertiginosa</p>
            <p>Desequilíbrio, pré-síncope, quase desmaio ou mal-estar vago podem apontar para causas neurológicas, sistêmicas, cardiovasculares ou medicamentosas.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'Vertigem verdadeira', nextStep: 'vertigem_episodio_unico_prolongado', value: 'vertigem' },
        { text: 'Tontura não vertiginosa / pré-síncope / desequilíbrio isolado', nextStep: 'vertigem_nao_vertiginosa', value: 'nao_vertiginosa' }
      ]
    },
    vertigem_episodio_unico_prolongado: {
      id: 'vertigem_episodio_unico_prolongado',
      title: 'Episódio Único e Prolongado?',
      description: 'Síndrome vestibular aguda pode durar dias a semanas.',
      type: 'question',
      content: `
        <div class="bg-cyan-50 p-3 rounded border-l-4 border-cyan-500 text-sm">
          <p><strong>Vertigem aguda contínua:</strong> episódio único, prolongado, com sintomas persistentes por horas a dias. Este é o cenário em que o HINTS pode ajudar se houver nistagmo.</p>
        </div>
      `,
      options: [
        { text: 'Sim - episódio único/prolongado', nextStep: 'vertigem_sinal_focal', value: 'unico_prolongado' },
        { text: 'Não - episódios breves/recorrentes', nextStep: 'vertigem_fator_desencadeante', value: 'recorrente' }
      ]
    },
    vertigem_fator_desencadeante: {
      id: 'vertigem_fator_desencadeante',
      title: 'Há Fator Desencadeante?',
      description: 'Posição, sons altos ou Valsalva favorecem causas episódicas específicas.',
      type: 'question',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500">
            <p><strong>Desencadeantes típicos:</strong> mudança de posição da cabeça, levantar-se, sons altos ou manobra de Valsalva.</p>
          </div>
          <p>Vertigem posicional com duração de segundos até no máximo 1 minuto sugere VPPB. Pré-síncope ao levantar sugere hipotensão postural.</p>
        </div>
      `,
      options: [
        { text: 'Sim - posição/sons/Valsalva/postura', nextStep: 'vertigem_vppb_hipotensao', value: 'desencadeada' },
        { text: 'Não - recorrente sem gatilho claro', nextStep: 'vertigem_recorrente_outros', value: 'sem_gatilho' }
      ]
    },
    vertigem_sinal_focal: {
      id: 'vertigem_sinal_focal',
      title: 'Algum Outro Sinal Neurológico Focal?',
      description: 'Buscar ataxia, diplopia, disartria, disfagia, déficit motor/sensitivo ou cefaleia intensa.',
      type: 'question',
      critical: true,
      content: `
        <div class="bg-red-50 p-3 rounded border-l-4 border-red-600 text-sm">
          <p><strong>Sinais centrais:</strong> déficit neurológico focal, ataxia importante, incapacidade de marcha, diplopia, disartria, disfagia, fraqueza, alteração sensitiva ou cefaleia intensa apontam para investigação de AVC de fossa posterior.</p>
        </div>
      `,
      options: [
        { text: 'Sim - investigar causa central', nextStep: 'vertigem_central_investigar', value: 'focal', critical: true, requiresImmediateAction: true },
        { text: 'Não - avaliar nistagmo', nextStep: 'vertigem_nistagmo_exame', value: 'sem_focal' }
      ]
    },
    vertigem_nistagmo_exame: {
      id: 'vertigem_nistagmo_exame',
      title: 'Paciente com Nistagmo ao Exame?',
      description: 'O HINTS só deve ser aplicado se houver nistagmo em vertigem contínua.',
      type: 'question',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500">
            <p><strong>Regra prática:</strong> o paciente deve apresentar sintomas contínuos e nistagmo ao exame para o HINTS poder ser aplicado.</p>
          </div>
          <p>Se não há nistagmo detectável, realize avaliação cuidadosa do equilíbrio e da marcha; o HINTS não é aplicável nesse cenário.</p>
        </div>
      `,
      options: [
        { text: 'Sim - aplicar HINTS', nextStep: 'vertigem_hints', value: 'nistagmo' },
        { text: 'Não - HINTS não aplicável', nextStep: 'vertigem_hints_nao_aplicavel', value: 'sem_nistagmo' }
      ]
    },
    vertigem_hints: {
      id: 'vertigem_hints',
      title: 'Aplicar HINTS',
      description: 'Head impulse, nystagmus e test of skew.',
      type: 'question',
      content: `
        <div class="space-y-4 text-sm">
          <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p class="font-bold text-blue-950">Espaço reservado para imagens/vídeo do HINTS</p>
            <p>Depois, inserir aqui as figuras do Head Impulse, Nystagmus e Test of Skew ou um vídeo demonstrativo.</p>
          </div>
          <div class="grid gap-3 md:grid-cols-3">
            <div class="rounded-lg border border-slate-200 bg-white p-3">
              <p class="font-bold">Head impulse</p>
              <p>VOR normal/preservado em paciente sintomático é sinal central. Sacada corretiva sugere causa periférica.</p>
            </div>
            <div class="rounded-lg border border-slate-200 bg-white p-3">
              <p class="font-bold">Nistagmo</p>
              <p>Nistagmo que muda de direção conforme olhar sugere causa central.</p>
            </div>
            <div class="rounded-lg border border-slate-200 bg-white p-3">
              <p class="font-bold">Test of skew</p>
              <p>Desvio vertical ou diagonal ao cobrir/descobrir os olhos sugere causa central.</p>
            </div>
          </div>
        </div>
      `,
      options: [
        { text: 'HINTS central: VOR normal e/ou nistagmo muda direção e/ou skew presente', nextStep: 'vertigem_central_investigar', value: 'hints_central', critical: true, requiresImmediateAction: true },
        { text: 'HINTS benigno/periférico', nextStep: 'vertigem_neurite_vestibular', value: 'hints_periferico' }
      ]
    },
    vertigem_neurite_vestibular: {
      id: 'vertigem_neurite_vestibular',
      title: 'Neurite Vestibular',
      description: 'Síndrome vertiginosa aguda periférica após exclusão de causa central.',
      type: 'result',
      group: 'Neurite vestibular',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500">
            <p><strong>Diagnóstico:</strong> clínico, após exclusão do principal diagnóstico diferencial: AVC de fossa posterior.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Quadro pode durar dias, com náuseas, vômitos, oscilopsia e desequilíbrio.</li>
            <li>Sintomas auditivos, como perda de audição ou zumbido, não são comuns.</li>
            <li>Tratamento: reabilitação vestibular, sintomáticos apenas nos 3 primeiros dias e corticoide sem comprovação forte.</li>
          </ul>
        </div>
      `,
      options: []
    },
    vertigem_vppb_hipotensao: {
      id: 'vertigem_vppb_hipotensao',
      title: 'VPPB / Hipotensão Postural',
      description: 'Vertigem desencadeada por posição ou sintomas posturais.',
      type: 'result',
      group: 'VPPB / postural',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500">
            <p><strong>VPPB:</strong> vertigem desencadeada por mudanças de posição da cabeça, duração de segundos até no máximo 1 minuto e sem outros sintomas neurológicos.</p>
          </div>
          <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p class="font-bold text-blue-950">Espaço reservado para imagens/vídeos das manobras</p>
            <p>Depois, inserir aqui as imagens ou vídeo da manobra de Epley e da manobra de Semont.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Confirmar VPPB com nistagmo após manobra provocadora, como Dix-Hallpike.</li>
            <li>Tratamento padrão-ouro: manobras de reposicionamento canalicular, como Epley ou Semont.</li>
            <li>Se sintomas forem de pré-síncope ao levantar, investigar hipotensão postural e causas cardiovasculares/sistêmicas.</li>
          </ul>
        </div>
      `,
      options: []
    },
    vertigem_recorrente_outros: {
      id: 'vertigem_recorrente_outros',
      title: 'Vertigem Recorrente Sem Gatilho Claro',
      description: 'Considerar migrânea vestibular, doença de Ménière e outras causas.',
      type: 'result',
      group: 'Recorrente',
      content: `
        <div class="bg-cyan-50 p-3 rounded border-l-4 border-cyan-500 text-sm">
          <p><strong>Conduta:</strong> considerar migrânea vestibular, doença de Ménière e outras etiologias recorrentes. Avaliar sintomas auditivos, cefaleia migranosa, duração das crises, gatilhos e necessidade de seguimento com otorrinolaringologia/neurologia.</p>
        </div>
      `,
      options: []
    },
    vertigem_nao_vertiginosa: {
      id: 'vertigem_nao_vertiginosa',
      title: 'Tontura Não Vertiginosa',
      description: 'Investigar causas neurológicas, sistêmicas, cardiovasculares ou medicamentosas.',
      type: 'result',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-slate-50 p-3 rounded border-l-4 border-slate-500">
            <p><strong>Conduta:</strong> não conduzir como HINTS. Investigar causas conforme quadro clínico.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Neurológicas: ataxia, parkinsonismo.</li>
            <li>Sistêmicas: medicações, desidratação, anemia, distúrbios hidroeletrolíticos, disfunção renal ou hepática.</li>
            <li>Cardiovasculares: hipotensão postural, arritmias.</li>
          </ul>
        </div>
      `,
      options: []
    },
    vertigem_hints_nao_aplicavel: {
      id: 'vertigem_hints_nao_aplicavel',
      title: 'HINTS Não Aplicável',
      description: 'Sem nistagmo detectável no exame físico.',
      type: 'result',
      content: `
        <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500 text-sm">
          <p><strong>Conduta:</strong> realizar avaliação cuidadosa do equilíbrio e da marcha. Se houver incapacidade de marcha, ataxia importante ou qualquer sinal neurológico, investigar causa central. Se não houver alerta, direcionar investigação conforme duração, gatilhos, sintomas auditivos e causas sistêmicas.</p>
        </div>
      `,
      options: []
    },
    vertigem_central_investigar: {
      id: 'vertigem_central_investigar',
      title: 'Investigar Causa Central / AVC de Fossa Posterior',
      description: 'HINTS central, sinais focais ou alta suspeita clínica.',
      type: 'result',
      critical: true,
      content: `
        <div class="bg-red-50 p-3 rounded border-l-4 border-red-600 text-sm">
          <p><strong>Conduta:</strong> tratar como possível AVC de fossa posterior. Acionar protocolo neurológico conforme serviço, avaliar janela terapêutica, monitorização, neuroimagem adequada e internação/observação. Não usar TC normal como exclusão segura quando a suspeita clínica permanece alta.</p>
        </div>
      `,
      options: []
    }
  }
}

// Fluxograma de Cefaleias no Pronto Socorro
export const cefaleiaFlowchart: EmergencyFlowchart = {
  id: 'cefaleia',
  name: 'Cefaleias',
  description: 'Triagem de cefaleia no pronto-socorro com identificação de sinais de alarme, investigação de causas secundárias e manejo de cefaleias primárias.',
  category: 'neurological',
  priority: 'high',
  icon: 'brain',
  color: 'from-blue-700 to-indigo-800',
  initialStep: 'cefaleia_inicio',
  finalSteps: [
    'cefaleia_secundaria_investigar',
    'cefaleia_secundaria_tratar_causa',
    'cefaleia_hsa_puncao',
    'cefaleia_tensional',
    'cefaleia_migranea',
    'cefaleia_salvas'
  ],
  steps: {
    cefaleia_inicio: {
      id: 'cefaleia_inicio',
      title: 'Paciente com Cefaleia no Pronto-Socorro',
      description: 'Cefaleia pode representar doença primária benigna ou condição secundária potencialmente letal.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-blue-50 p-3 rounded border-l-4 border-blue-600">
            <p><strong>Essencial:</strong> cefaleia é queixa comum no pronto atendimento e pode se originar de doenças graves, potencialmente letais, ou de doenças crônicas sem risco de letalidade.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>HSA por rompimento aneurismático e trombose venosa cerebral podem se apresentar com cefaleia como primeiro ou único sintoma.</li>
            <li>História e exame físico são fundamentais para levantar suspeita de cefaleia secundária.</li>
            <li>As cefaleias primárias mais comuns são enxaqueca, cefaleia tipo tensão e cefaleias trigêmino-autonômicas, como cefaleia em salvas.</li>
            <li>Intensidade da dor e resposta ao sintomático são maus preditores de causas secundárias.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Iniciar avaliação', nextStep: 'cefaleia_sinais_alarme', value: 'iniciar' }
      ]
    },
    cefaleia_sinais_alarme: {
      id: 'cefaleia_sinais_alarme',
      title: 'Presença de Sinais de Alarme?',
      description: 'Identificar sinais que indicam investigação de causa secundária.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-600">
            <p><strong>Sinais de alarme:</strong> thunderclap/trovoada, cefaleia nova e forte, idade &gt; 50 anos, trauma craniano recente, febre, imunocomprometimento, papiledema, irritação meníngea, gravidez/pós-parto &lt; 6 semanas, anticoagulantes/corticoides, drogas ilícitas, intoxicação exógena ou novo déficit neurológico.</p>
          </div>
          <p>A presença de qualquer sinal de alarme deve direcionar investigação de cefaleia secundária.</p>
        </div>
      `,
      options: [
        { text: 'Sim - investigar causa secundária', nextStep: 'cefaleia_secundaria_investigar', value: 'alarme', critical: true, requiresImmediateAction: true },
        { text: 'Não - avaliar sinais verdes/cefaleia primária', nextStep: 'cefaleia_sinais_verdes', value: 'sem_alarme' }
      ]
    },
    cefaleia_sinais_verdes: {
      id: 'cefaleia_sinais_verdes',
      title: 'Sinais Verdes para Cefaleia Primária',
      description: 'Ajudam a reforçar probabilidade pré-teste de cefaleia primária quando não há alarme.',
      type: 'question',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500">
            <p><strong>Sinais verdes:</strong> dor recorrente desde a infância, dias livres de dor entre crises, crises semelhantes próximas ao período menstrual, história familiar com mesmo fenótipo, cefaleia iniciou ou terminou há mais de uma semana.</p>
          </div>
          <p>A ausência de sinais de alarme associada à presença de sinais verdes reforça a probabilidade de cefaleia primária, sem necessidade de investigação complementar imediata.</p>
        </div>
      `,
      options: [
        { text: 'Fenótipo primário provável', nextStep: 'cefaleia_classificar_primaria', value: 'primaria' },
        { text: 'Dúvida diagnóstica / sem sinais verdes claros', nextStep: 'cefaleia_classificar_primaria', value: 'duvida_sem_alarme' }
      ]
    },
    cefaleia_classificar_primaria: {
      id: 'cefaleia_classificar_primaria',
      title: 'Classificar Cefaleia Primária',
      description: 'Diferenciar cefaleia tensional, migrânea e cefaleia em salvas.',
      type: 'question',
      content: `
        <div class="grid gap-3 text-sm lg:grid-cols-3">
          <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <p class="font-bold text-emerald-950">Tensional</p>
            <ul class="list-disc pl-5">
              <li>Leve a moderada</li>
              <li>Bilateral ou holocraniana</li>
              <li>Não pulsátil</li>
              <li>Sem sintomas associados</li>
              <li>Não piora com esforço</li>
            </ul>
          </div>
          <div class="rounded-lg border border-rose-200 bg-rose-50 p-3">
            <p class="font-bold text-rose-950">Migrânea</p>
            <ul class="list-disc pl-5">
              <li>Dor unilateral, pulsátil, moderada a forte</li>
              <li>Foto/fonofobia</li>
              <li>Náuseas e vômitos</li>
              <li>Piora com esforço</li>
            </ul>
          </div>
          <div class="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p class="font-bold text-amber-950">Cefaleia em salvas</p>
            <ul class="list-disc pl-5">
              <li>Homens, 30-50 anos</li>
              <li>Intensa, unilateral, periorbitária/temporal</li>
              <li>15 a 180 minutos</li>
              <li>Hiperemia conjuntival, lacrimejamento, ptose, congestão nasal ou rubor facial</li>
            </ul>
          </div>
        </div>
      `,
      options: [
        { text: 'Cefaleia tensional', nextStep: 'cefaleia_tensional', value: 'tensional' },
        { text: 'Cefaleia migrânea', nextStep: 'cefaleia_migranea', value: 'migranea' },
        { text: 'Cefaleia em salvas', nextStep: 'cefaleia_salvas', value: 'salvas' },
        { text: 'Não parece primária / reavaliar investigação', nextStep: 'cefaleia_secundaria_investigar', value: 'reavaliar_secundaria', critical: true }
      ]
    },
    cefaleia_secundaria_investigar: {
      id: 'cefaleia_secundaria_investigar',
      title: 'Investigar Causas Secundárias',
      description: 'Primeiro exame: TC de crânio sem contraste.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-600">
            <p><strong>Conduta inicial:</strong> solicitar TC de crânio sem contraste. Considerar angio-TC de crânio se suspeita de etiologia vascular, como dissecção, aneurisma roto, malformação arteriovenosa ou trombose venosa cerebral.</p>
          </div>
          <p>Causas possíveis: HSA, AVC hemorrágico/isquêmico, trombose venosa cerebral, hematoma subdural/extradural, neoplasia intracraniana, meningite/encefalite/abscesso, vasculite de SNC e síndrome de vasoconstrição cerebral reversível.</p>
        </div>
      `,
      options: [
        { text: 'Exames com alterações', nextStep: 'cefaleia_secundaria_tratar_causa', value: 'alterado', critical: true, requiresImmediateAction: true },
        { text: 'Exames sem alterações, mas alta suspeita de HSA', nextStep: 'cefaleia_hsa_puncao', value: 'hsa_suspeita', critical: true, requiresImmediateAction: true },
        { text: 'Exames sem alterações e baixa suspeita secundária', nextStep: 'cefaleia_classificar_primaria', value: 'sem_alteracao' }
      ]
    },
    cefaleia_secundaria_tratar_causa: {
      id: 'cefaleia_secundaria_tratar_causa',
      title: 'Tratamento Conforme Causa Específica',
      description: 'Exames alterados ou diagnóstico secundário provável.',
      type: 'result',
      critical: true,
      content: `
        <div class="bg-red-50 p-3 rounded border-l-4 border-red-600 text-sm">
          <p><strong>Conduta:</strong> tratar de acordo com a causa específica e acionar especialidade/protocolo apropriado. Considerar neurologia/neurocirurgia/infectologia conforme suspeita, monitorização e internação.</p>
        </div>
      `,
      options: []
    },
    cefaleia_hsa_puncao: {
      id: 'cefaleia_hsa_puncao',
      title: 'Alta Suspeita de HSA',
      description: 'Considerar punção liquórica quando exames iniciais não excluem HSA.',
      type: 'result',
      critical: true,
      content: `
        <div class="bg-red-50 p-3 rounded border-l-4 border-red-600 text-sm">
          <p><strong>Conduta:</strong> considerar punção liquórica e investigação complementar conforme protocolo local, principalmente em cefaleia thunderclap com alta suspeita de HSA e imagem inicial sem confirmação.</p>
        </div>
      `,
      options: []
    },
    cefaleia_tensional: {
      id: 'cefaleia_tensional',
      title: 'Cefaleia Tensional',
      description: 'Cefaleia primária de leve a moderada intensidade, bilateral/holocraniana e sem sintomas associados.',
      type: 'result',
      group: 'Tensional',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500">
            <p><strong>Tratamento:</strong> analgésicos comuns e AINEs. Não usar opioide.</p>
          </div>
          <p>Orientar sono regular, redução de estresse, evitar álcool/drogas e retorno se surgirem sinais de alarme.</p>
        </div>
      `,
      options: []
    },
    cefaleia_migranea: {
      id: 'cefaleia_migranea',
      title: 'Cefaleia Migrânea',
      description: 'Enxaqueca com dor moderada/forte, pulsátil, associada a foto/fonofobia e náuseas/vômitos.',
      type: 'result',
      group: 'Migrânea',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-rose-50 p-3 rounded border-l-4 border-rose-500">
            <p><strong>Tratamento:</strong> 1ª linha com triptanos e AINEs; 2ª linha com corticoide, metoclopramida, valproato ou clorpromazina conforme contexto. Não usar opioide.</p>
          </div>
          <p>Em todos os casos, deixar paciente em repouso sob penumbra, em ambiente tranquilo e silencioso quando possível.</p>
        </div>
      `,
      options: []
    },
    cefaleia_salvas: {
      id: 'cefaleia_salvas',
      title: 'Cefaleia em Salvas',
      description: 'Dor intensa unilateral periorbitária/temporal com sintomas autonômicos.',
      type: 'result',
      group: 'Salvas',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500">
            <p><strong>Tratamento:</strong> oxigênio em máscara não reinalante 8 a 15 L/min por 15 minutos como primeira linha; triptano intranasal/subcutâneo quando disponível.</p>
          </div>
          <p>Avaliar encaminhamento para seguimento especializado e profilaxia se crises recorrentes.</p>
        </div>
      `,
      options: []
    }
  }
}

// Fluxograma de Agitação Psicomotora no Pronto Socorro
export const agitacaoPsicomotoraFlowchart: EmergencyFlowchart = {
  id: 'agitacao_psicomotora',
  name: 'Agitação Psicomotora',
  description: 'Classificação de gravidade, segurança da equipe/paciente, investigação etiológica e linhas de tratamento da agitação psicomotora no pronto-socorro.',
  category: 'psychiatric',
  priority: 'high',
  icon: 'brain',
  color: 'from-blue-700 to-slate-800',
  initialStep: 'agitacao_inicio',
  finalSteps: [
    'agitacao_causa_clinica_investigar',
    'agitacao_leve_nao_farmacologico',
    'agitacao_moderada_medicacao_oral',
    'agitacao_grave_contencao_quimica'
  ],
  steps: {
    agitacao_inicio: {
      id: 'agitacao_inicio',
      title: 'Paciente com Agitação Psicomotora',
      description: 'Agitação não é diagnóstico, é sintoma de patologia clínica, psiquiátrica, toxicológica ou traumática.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-blue-50 p-3 rounded border-l-4 border-blue-600">
            <p><strong>Essencial:</strong> agitação não é diagnóstico. É sintoma de uma patologia clínica, psiquiátrica, toxicológica ou traumática.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Primeiro estabeleça segurança do paciente, da equipe e do ambiente.</li>
            <li>Imediatamente após segurança, realize diagnóstico etiológico.</li>
            <li>Sempre considere origem clínica, especialmente delirium, hipoglicemia, hipóxia, intoxicação, sepse, hipertireoidismo e TCE.</li>
            <li>Exames complementares são indicados quando a agitação decorre de condição médica não psiquiátrica ou quando houver dúvida clínica.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Iniciar classificação', nextStep: 'agitacao_classificar_gravidade', value: 'iniciar' }
      ]
    },
    agitacao_classificar_gravidade: {
      id: 'agitacao_classificar_gravidade',
      title: 'Classificar Gravidade da Agitação',
      description: 'Definir risco imediato e capacidade de colaboração.',
      type: 'question',
      critical: true,
      content: `
        <div class="grid gap-3 text-sm md:grid-cols-3">
          <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <p class="font-bold text-emerald-950">Leve</p>
            <p>Capaz de conversar e colaborar com propostas terapêuticas.</p>
          </div>
          <div class="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p class="font-bold text-amber-950">Moderada</p>
            <p>Disruptivo, porém sem perigo iminente à equipe e a si mesmo.</p>
          </div>
          <div class="rounded-lg border border-red-200 bg-red-50 p-3">
            <p class="font-bold text-red-950">Grave</p>
            <p>Paciente combativo, com perigo à equipe e a si mesmo.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'Leve - conversa e colabora', nextStep: 'agitacao_4hs', value: 'leve' },
        { text: 'Moderada - disruptivo sem perigo iminente', nextStep: 'agitacao_4hs', value: 'moderada' },
        { text: 'Grave - combativo / risco imediato', nextStep: 'agitacao_grave_seguranca', value: 'grave', critical: true, requiresImmediateAction: true }
      ]
    },
    agitacao_4hs: {
      id: 'agitacao_4hs',
      title: 'Investigar 4 Hs Emergenciais',
      description: 'Hipóxia, hipoglicemia, hipertermia e hipovolemia podem cursar com agitação.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-600">
            <p><strong>Antes de rotular como psiquiátrico:</strong> investigar e tratar hipóxia, hipoglicemia, hipertermia e hipovolemia.</p>
          </div>
          <div class="overflow-hidden rounded-lg border border-slate-300">
            <table class="w-full text-left">
              <thead class="bg-blue-100 text-slate-900">
                <tr><th class="px-3 py-2 font-bold">Categoria</th><th class="px-3 py-2 font-bold">Principais causas</th></tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                <tr><td class="px-3 py-2 font-bold">Clínicas</td><td class="px-3 py-2">Delirium; distúrbios metabólicos; hipertireoidismo; meningite, encefalite e sepse.</td></tr>
                <tr><td class="px-3 py-2 font-bold">Toxicológicas</td><td class="px-3 py-2">Síndrome de abstinência; intoxicação por álcool e drogas ilícitas.</td></tr>
                <tr><td class="px-3 py-2 font-bold">Psiquiátricas</td><td class="px-3 py-2">Bipolaridade, esquizofrenia, transtornos de personalidade e dissociativos.</td></tr>
                <tr><td class="px-3 py-2 font-bold">Traumáticas</td><td class="px-3 py-2">TCE.</td></tr>
                <tr><td class="px-3 py-2 font-bold">Iatrogênicas</td><td class="px-3 py-2">Longo tempo de espera e percepção de tratamento ineficaz.</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      `,
      options: [
        { text: 'Suspeita de condição clínica/toxicológica/traumática', nextStep: 'agitacao_causa_clinica_investigar', value: 'clinica', critical: true },
        { text: 'Sem emergência clínica aparente - agitação leve', nextStep: 'agitacao_leve_nao_farmacologico', value: 'leve' },
        { text: 'Sem emergência clínica aparente - agitação moderada', nextStep: 'agitacao_moderada_abordagem', value: 'moderada' }
      ]
    },
    agitacao_moderada_abordagem: {
      id: 'agitacao_moderada_abordagem',
      title: '1ª Linha: Abordagem Não Medicamentosa',
      description: 'Desescalonamento verbal e ambiente seguro.',
      type: 'question',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500">
            <p><strong>Abordagem não medicamentosa:</strong> respeitar espaço individual, observar linguagem corporal, usar linguagem clara e tom calmo, evitar movimentos bruscos e comentários provocativos.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Identificar causas da agressividade.</li>
            <li>Ouvir atentamente e evitar discordar.</li>
            <li>Estabelecer regras e limites claros.</li>
            <li>Demonstrar preocupação com bem-estar, oferecendo água, comida ou cobertor quando apropriado.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Melhorou / colaborou', nextStep: 'agitacao_leve_nao_farmacologico', value: 'melhorou' },
        { text: 'Persistente - considerar medicação VO', nextStep: 'agitacao_moderada_medicacao_oral', value: 'medicacao_oral' }
      ]
    },
    agitacao_grave_seguranca: {
      id: 'agitacao_grave_seguranca',
      title: 'Agitação Grave: Segurança e Contenção',
      description: 'Paciente combativo com risco imediato.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-600">
            <p><strong>Prioridade:</strong> proteger paciente e equipe. Usar contenção física apenas se necessária e pelo menor tempo possível, como ponte até a contenção química.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Idealmente, cinco profissionais: quatro imobilizam membros e um estabiliza a cabeça.</li>
            <li>Avisar o paciente sobre o procedimento.</li>
            <li>Usar faixas adequadas, sem comprometer vasos ou nervos.</li>
            <li>Manter em posição dorsal com cabeceira elevada.</li>
            <li>Monitorar sinais vitais a cada 15-30 minutos e reavaliação psiquiátrica pelo menos a cada 30 minutos.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Seguir para contenção química', nextStep: 'agitacao_grave_contencao_quimica', value: 'contencao_quimica', critical: true, requiresImmediateAction: true }
      ]
    },
    agitacao_leve_nao_farmacologico: {
      id: 'agitacao_leve_nao_farmacologico',
      title: 'Agitação Leve: Manejo Não Farmacológico',
      description: 'Paciente colabora com propostas terapêuticas.',
      type: 'result',
      group: 'Leve',
      content: `
        <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500 text-sm">
          <p><strong>Conduta:</strong> manter abordagem verbal, ambiente calmo, investigação etiológica conforme clínica e reavaliação seriada. Evitar contenção desnecessária.</p>
        </div>
      `,
      options: []
    },
    agitacao_moderada_medicacao_oral: {
      id: 'agitacao_moderada_medicacao_oral',
      title: 'Agitação Moderada: Medicação VO',
      description: 'Via oral é preferencial quando o paciente aceita colaborar.',
      type: 'result',
      group: 'Moderada',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500">
            <p><strong>3ª linha, se necessário:</strong> contenção química. Via oral é preferencial quando o paciente aceita.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Diazepam 5 mg ou 10 mg VO; máximo 20 mg/dia.</li>
            <li>Clonazepam 0,25 mg, 0,5 mg ou 2 mg VO; máximo diário 4 a 6 mg/dia.</li>
          </ul>
        </div>
      `,
      options: []
    },
    agitacao_grave_contencao_quimica: {
      id: 'agitacao_grave_contencao_quimica',
      title: 'Agitação Grave: Contenção Química',
      description: 'Medicação IM/EV com monitorização e atenção para depressão respiratória.',
      type: 'result',
      critical: true,
      group: 'Grave',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-600">
            <p><strong>Conduta:</strong> contenção química com monitorização de sinais vitais, segurança de via aérea e reavaliação frequente.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Haloperidol 5 mg/mL: 1 mL IM a cada 30 minutos até dose máxima de 30 mg/dia.</li>
            <li>Prometazina 50 mg/2 mL: 2 mL IM.</li>
            <li>Midazolam 5 mg/mL: 5 mL IM ou EV em bolus lento, com atenção para depressão respiratória.</li>
            <li>Diazepam 10 mg/2 mL: 10 mg EV em bolus lento.</li>
          </ul>
          <div class="bg-yellow-50 p-3 rounded border-l-4 border-yellow-500">
            <p><strong>Álcool:</strong> se suspeita ou confirmação de abuso/intoxicação por álcool, não usar prometazina e benzodiazepínicos; prefira haloperidol.</p>
          </div>
        </div>
      `,
      options: []
    },
    agitacao_causa_clinica_investigar: {
      id: 'agitacao_causa_clinica_investigar',
      title: 'Investigar Causa Clínica / Toxicológica / Traumática',
      description: 'Exames complementares conforme quadro clínico.',
      type: 'result',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-blue-50 p-3 rounded border-l-4 border-blue-600">
            <p><strong>Exames sugeridos conforme clínica:</strong> glicemia, eletrólitos, rastreio infeccioso, ureia/creatinina, função tireoidiana, ECG, toxicológico e neuroimagem quando indicado.</p>
          </div>
          <p>Tratar imediatamente hipóxia, hipoglicemia, hipertermia e hipovolemia. Considerar delirium, sepse, intoxicação/abstinência, TCE e outras causas clínicas antes de atribuir à etiologia psiquiátrica.</p>
        </div>
      `,
      options: []
    }
  }
}

// Fluxograma de Profilaxia Pós-Exposição (PEP) ao HIV no pronto-socorro
export const pepHivFlowchart: EmergencyFlowchart = {
  id: 'pep_hiv',
  name: 'Profilaxia Pós-Exposição (PEP) ao HIV',
  description: 'Decisão de indicação de PEP ao HIV após exposição, com janela de 72 horas, avaliação da pessoa exposta e status da pessoa fonte.',
  category: 'infectious',
  priority: 'high',
  icon: 'shield',
  color: 'from-cyan-600 to-blue-800',
  initialStep: 'pep_inicio',
  finalSteps: [
    'pep_sem_material_risco',
    'pep_sem_exposicao_risco',
    'pep_fora_janela',
    'pep_exposta_hiv_positivo',
    'pep_iniciar',
    'pep_nao_indicada_fonte_sem_risco'
  ],
  steps: {
    pep_inicio: {
      id: 'pep_inicio',
      title: 'Situação de Exposição ao HIV',
      description: 'A primeira abordagem após exposição de risco ao HIV é uma urgência médica.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-4 text-sm">
          <div class="rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-cyan-950">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div class="min-w-0">
                <p class="font-extrabold">PEP ao HIV é urgência médica</p>
                <p class="mt-1">Iniciar o mais precocemente possível, no máximo até 72 horas após a exposição.</p>
              </div>
              <button type="button" data-pep-hiv-guide="true" class="inline-flex h-8 w-8 shrink-0 self-end items-center justify-center rounded-full border border-cyan-400 bg-white font-sans text-sm font-extrabold leading-none text-cyan-800 transition-colors hover:bg-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 sm:self-start" title="Ver informações rápidas sobre PEP ao HIV" aria-label="Ver informações rápidas sobre PEP ao HIV">i</button>
            </div>
          </div>
          <div class="grid gap-3 md:grid-cols-2">
            <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
              <p class="font-bold">Não pode deixar passar</p>
              <ul class="mt-2 list-disc space-y-1 pl-5">
                <li>Avaliar material biológico, tipo de exposição e janela de 72 horas.</li>
                <li>Testar a pessoa exposta antes da decisão sempre que possível.</li>
                <li>Considerar ISTs, hepatites virais, contracepção de emergência e violência sexual quando aplicável.</li>
              </ul>
            </div>
            <div class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
              <p class="font-bold">Situações em que PEP não deve ser banalizada</p>
              <ul class="mt-2 list-disc space-y-1 pl-5">
                <li>Uso correto de preservativo durante todo o ato sexual.</li>
                <li>Exposição crônica/repetida ao mesmo agressor: individualizar e avaliar seguimento especializado.</li>
                <li>Sexo oral exclusivo: indicação controversa, avaliar caso a caso.</li>
              </ul>
            </div>
          </div>
        </div>
      `,
      options: [
        { text: 'Iniciar avaliação da exposição', nextStep: 'pep_material_risco', value: 'iniciar' }
      ]
    },
    pep_material_risco: {
      id: 'pep_material_risco',
      title: 'Material biológico com risco?',
      description: 'Sangue, sêmen, fluidos vaginais, líquidos de serosas, líquido amniótico ou líquor.',
      type: 'question',
      critical: true,
      content: `
        <div class="grid gap-3 text-sm md:grid-cols-2">
          <div class="rounded-xl border border-red-200 bg-red-50 p-4 text-red-950">
          <p class="font-bold">Materiais biológicos com risco</p>
          <ul class="mt-2 list-disc space-y-1 pl-5">
            <li>Sangue</li>
            <li>Sêmen</li>
            <li>Fluidos vaginais</li>
            <li>Líquidos de serosas: peritoneal, pleural ou pericárdico</li>
            <li>Líquido amniótico</li>
            <li>Líquor</li>
          </ul>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-800">
            <p class="font-bold text-slate-950">Em geral, sem risco para HIV</p>
            <p class="mt-2">Saliva, suor, lágrima, urina, fezes, vômitos ou secreções nasais sem sangue visível não indicam PEP por HIV.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'Sim - houve material com risco', nextStep: 'pep_tipo_exposicao', value: 'material_risco' },
        { text: 'Não - sem material de risco', nextStep: 'pep_sem_material_risco', value: 'sem_material' }
      ]
    },
    pep_tipo_exposicao: {
      id: 'pep_tipo_exposicao',
      title: 'Tipo de exposição com risco?',
      description: 'Percutânea, mucosa, sexual desprotegida, pele não íntegra ou mordedura com sangue.',
      type: 'question',
      critical: true,
      content: `
        <div class="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-950">
          <p class="font-bold">Tipos de exposição com risco</p>
          <ul class="mt-2 list-disc space-y-1 pl-5">
            <li>Percutânea</li>
            <li>Membranas mucosas</li>
            <li>Exposição sexual desprotegida vaginal, anal ou oral com contexto de risco</li>
            <li>Cutânea em pele não íntegra</li>
            <li>Mordedura com presença de sangue</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Sim - exposição com risco', nextStep: 'pep_janela_72h', value: 'risco' },
        { text: 'Não - exposição sem risco', nextStep: 'pep_sem_exposicao_risco', value: 'sem_risco' }
      ]
    },
    pep_janela_72h: {
      id: 'pep_janela_72h',
      title: 'Atendimento em até 72 horas?',
      description: 'A PEP deve ser iniciada no máximo até 72 horas após a exposição.',
      type: 'question',
      critical: true,
      timeSensitive: true,
      content: `
        <div class="bg-yellow-50 p-3 rounded border-l-4 border-yellow-500 text-sm">
          <p><strong>Janela de oportunidade:</strong> após 72 horas, não há benefício comprovado para iniciar PEP. Manter acompanhamento sorológico da pessoa exposta quando indicado.</p>
        </div>
      `,
      options: [
        { text: 'Sim - até 72 horas', nextStep: 'pep_exposta_hiv', value: 'ate_72h', critical: true },
        { text: 'Não - mais de 72 horas', nextStep: 'pep_fora_janela', value: 'fora_72h' }
      ]
    },
    pep_exposta_hiv: {
      id: 'pep_exposta_hiv',
      title: 'Pessoa exposta: HIV positivo ou reagente?',
      description: 'Testagem da pessoa exposta antes de decidir PEP.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-blue-50 p-3 rounded border-l-4 border-blue-600">
            <p><strong>Teste da pessoa exposta:</strong> se HIV positivo ou reagente, PEP não está indicada. Encaminhar para acompanhamento clínico especializado.</p>
          </div>
          <p>Se teste não reagente, seguir avaliação da pessoa fonte.</p>
        </div>
      `,
      options: [
        { text: 'Sim - positivo/reagente', nextStep: 'pep_exposta_hiv_positivo', value: 'exposta_positivo', critical: true },
        { text: 'Não - negativo/não reagente', nextStep: 'pep_fonte_hiv', value: 'exposta_negativo' }
      ]
    },
    pep_fonte_hiv: {
      id: 'pep_fonte_hiv',
      title: 'Pessoa fonte: HIV positivo, reagente ou desconhecido?',
      description: 'Fonte positiva, reagente ou desconhecida indica iniciar PEP.',
      type: 'question',
      critical: true,
      content: `
        <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500 text-sm">
          <p><strong>Indicar PEP:</strong> fonte com HIV positivo, teste reagente ou status desconhecido no contexto de exposição de risco dentro da janela de 72 horas.</p>
        </div>
      `,
      options: [
        { text: 'Sim - positiva/reagente/desconhecida', nextStep: 'pep_iniciar', value: 'fonte_indica', critical: true, requiresImmediateAction: true },
        { text: 'Não - fonte HIV negativa', nextStep: 'pep_fonte_risco_30d', value: 'fonte_negativa' }
      ]
    },
    pep_fonte_risco_30d: {
      id: 'pep_fonte_risco_30d',
      title: 'Pessoa fonte teve exposição de risco nos últimos 30 dias?',
      description: 'Risco recente pode representar janela imunológica.',
      type: 'question',
      critical: true,
      content: `
        <div class="bg-yellow-50 p-3 rounded border-l-4 border-yellow-500 text-sm">
          <p><strong>Janela imunológica:</strong> se a fonte teve exposição de risco nos últimos 30 dias, iniciar PEP e encaminhar para acompanhamento sorológico.</p>
        </div>
      `,
      options: [
        { text: 'Sim - risco nos últimos 30 dias', nextStep: 'pep_iniciar', value: 'risco_30d', critical: true, requiresImmediateAction: true },
        { text: 'Não - sem risco recente', nextStep: 'pep_nao_indicada_fonte_sem_risco', value: 'sem_risco_30d' }
      ]
    },
    pep_iniciar: {
      id: 'pep_iniciar',
      title: 'Iniciar PEP',
      description: 'Iniciar PEP e encaminhar para acompanhamento sorológico.',
      type: 'result',
      critical: true,
      group: 'PEP indicada',
      content: `
        <div class="space-y-4 text-sm">
          <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div class="min-w-0">
                <p class="font-extrabold">Conduta: iniciar PEP imediatamente</p>
                <p class="mt-1">Prescrever por 28 dias e garantir acompanhamento sorológico.</p>
              </div>
            </div>
          </div>
          <div class="overflow-x-auto rounded-xl border border-slate-300 bg-white">
            <table class="w-full min-w-[760px] text-left">
              <thead class="bg-yellow-100 text-slate-950">
                <tr><th class="px-3 py-2 font-bold">Situação</th><th class="px-3 py-2 font-bold">Esquema</th><th class="px-3 py-2 font-bold">Posologia</th></tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                <tr><td class="px-3 py-2 font-bold">Preferencial</td><td class="px-3 py-2">Tenofovir/lamivudina + Dolutegravir</td><td class="px-3 py-2">TDF/3TC 300/300 mg 1 cp VO 1x/dia + DTG 50 mg 1 cp VO 1x/dia, por 28 dias.</td></tr>
                <tr><td class="px-3 py-2 font-bold">Sem tenofovir</td><td class="px-3 py-2">Zidovudina/lamivudina + Dolutegravir</td><td class="px-3 py-2">AZT/3TC 300/150 mg 12/12h + DTG 50 mg 1x/dia, por 28 dias.</td></tr>
                <tr><td class="px-3 py-2 font-bold">Sem dolutegravir</td><td class="px-3 py-2">Tenofovir/lamivudina + Darunavir/ritonavir</td><td class="px-3 py-2">TDF/3TC 1x/dia + DRV 800 mg + RTV 100 mg 1x/dia, por 28 dias.</td></tr>
              </tbody>
            </table>
          </div>
          <div class="rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-cyan-950">
            <p><strong>Seguimento:</strong> repetir testagem para HIV em 30 dias, procurar infectologista para seguimento, avaliar outras ISTs/hepatites e orientar retorno se toxicidade grave, rash extenso, icterícia ou vômitos persistentes.</p>
          </div>
        </div>
      `,
      options: []
    },
    pep_sem_material_risco: {
      id: 'pep_sem_material_risco',
      title: 'PEP não indicada',
      description: 'Não houve exposição a material biológico com risco de transmissão do HIV.',
      type: 'result',
      content: `
        <div class="bg-red-50 p-3 rounded border-l-4 border-red-500 text-sm">
          <p><strong>Conduta:</strong> PEP não está indicada. Acompanhamento sorológico não é necessário para HIV por esta exposição.</p>
        </div>
      `,
      options: []
    },
    pep_sem_exposicao_risco: {
      id: 'pep_sem_exposicao_risco',
      title: 'PEP não indicada',
      description: 'Não houve tipo de exposição com risco de transmissão do HIV.',
      type: 'result',
      content: `
        <div class="bg-red-50 p-3 rounded border-l-4 border-red-500 text-sm">
          <p><strong>Conduta:</strong> PEP não está indicada. Acompanhamento sorológico não é necessário para HIV por esta exposição.</p>
        </div>
      `,
      options: []
    },
    pep_fora_janela: {
      id: 'pep_fora_janela',
      title: 'PEP não indicada: fora da janela',
      description: 'Atendimento após 72 horas da exposição.',
      type: 'result',
      content: `
        <div class="bg-red-50 p-3 rounded border-l-4 border-red-500 text-sm">
          <p><strong>Conduta:</strong> PEP não está indicada após 72 horas. Manter acompanhamento sorológico da pessoa exposta.</p>
        </div>
      `,
      options: []
    },
    pep_exposta_hiv_positivo: {
      id: 'pep_exposta_hiv_positivo',
      title: 'Pessoa exposta com HIV positivo/reagente',
      description: 'PEP não indicada; encaminhar para cuidado especializado.',
      type: 'result',
      critical: true,
      content: `
        <div class="bg-red-50 p-3 rounded border-l-4 border-red-500 text-sm">
          <p><strong>Conduta:</strong> PEP não está indicada. Encaminhar para acompanhamento clínico especializado.</p>
        </div>
      `,
      options: []
    },
    pep_nao_indicada_fonte_sem_risco: {
      id: 'pep_nao_indicada_fonte_sem_risco',
      title: 'PEP não indicada',
      description: 'Pessoa fonte HIV negativa e sem exposição de risco recente.',
      type: 'result',
      content: `
        <div class="bg-red-50 p-3 rounded border-l-4 border-red-500 text-sm">
          <p><strong>Conduta:</strong> PEP não está indicada. Acompanhamento sorológico não é necessário para HIV por esta exposição.</p>
        </div>
      `,
      options: []
    }
  }
}

// Fluxograma de atendimento de emergência para Anafilaxia (WAO 2020 / RCUK 2021)
export const anaphylaxisFlowchart: EmergencyFlowchart = {
  id: 'anafilaxia',
  name: 'Anafilaxia',
  description: 'Reconhecimento por sistemas, adrenalina IM sem demora, suporte ABCDE, reavaliação seriada e destino orientado pelo risco.',
  category: 'allergic',
  priority: 'high',
  icon: 'zap',
  color: 'from-red-600 to-rose-800',
  initialStep: 'ana_inicio',
  finalSteps: [
    'ana_sem_criterios_observar',
    'ana_observacao_alta',
    'ana_observacao_prolongada',
    'ana_internacao_via_aerea_choque'
  ],
  steps: {
    ana_inicio: {
      id: 'ana_inicio',
      title: 'Suspeita de Anafilaxia',
      description: 'Reação sistêmica de instalação rápida: reconhecer o padrão clínico enquanto a equipe inicia as medidas de segurança.',
      type: 'question',
      critical: true,
      timeSensitive: true,
      content: `
        <div class="rounded border-l-4 border-red-600 bg-red-50 p-3 text-sm">
          <p><strong>Segurança:</strong> não espere exames nem o aparecimento de urticária para tratar uma anafilaxia provável.</p>
        </div>
      `,
      options: [
        { text: 'Iniciar preparação ABCDE e avaliar critérios', nextStep: 'ana_preparo_imediato', value: 'avaliar' }
      ]
    },
    ana_preparo_imediato: {
      id: 'ana_preparo_imediato',
      title: 'Preparação Simultânea ao Diagnóstico',
      description: 'Organizar equipe e suporte sem atrasar a primeira dose de adrenalina quando houver alta suspeita.',
      type: 'question',
      critical: true,
      timeSensitive: true,
      content: `
        <div class="rounded border-l-4 border-blue-600 bg-blue-50 p-3 text-sm">
          <p><strong>Trabalho em paralelo:</strong> checklist, avaliação diagnóstica e preparo da adrenalina devem avançar simultaneamente.</p>
        </div>
      `,
      options: [
        { text: 'Classificar pelos critérios clínicos atuais', nextStep: 'ana_criterios_wao', value: 'preparo_iniciado' }
      ]
    },
    ana_criterios_wao: {
      id: 'ana_criterios_wao',
      title: 'Critérios Clínicos WAO 2020',
      description: 'Definir se há anafilaxia provável e iniciar adrenalina IM.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <p>O diagnóstico é provável quando <strong>um dos dois padrões</strong> apresentados abaixo está presente. A ausência de manifestações cutâneas não exclui o quadro.</p>
          <p>Se houver comprometimento respiratório ou circulatório após contato com desencadeante conhecido/provável, trate enquanto confirma os demais dados.</p>
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
      description: 'Aplicar na face anterolateral da coxa e registrar o horário. Reavaliar A/B/C em 5 minutos.',
      type: 'medication',
      critical: true,
      timeSensitive: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-yellow-50 p-3 rounded border-l-4 border-yellow-500">
            <p><strong>Apresentação:</strong> adrenalina 1:1000 = 1 mg/mL.</p>
            <p><strong>Local:</strong> intramuscular no vasto lateral da coxa.</p>
          </div>
          <p>Após a dose, manter suporte ABCDE e tratar as manifestações dominantes. Nenhum adjuvante deve atrasar a adrenalina.</p>
        </div>
      `,
      options: [
        { text: 'Selecionar tratamento adjunto após adrenalina', nextStep: 'ana_tratamento_adjunto', value: 'adrenalina_aplicada', critical: true }
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
          <p>O suporte complementar não substitui adrenalina IM. Priorize oxigênio quando indicado, cristalóide no choque e broncodilatador no broncoespasmo. Anti-histamínico serve apenas para sintomas cutâneos após estabilização; corticoide não é rotina.</p>
        </div>
      `,
      options: [
        { text: 'Reavaliar resposta em 5 minutos', nextStep: 'ana_reavaliacao_5_10', value: 'adjunto' }
      ]
    },
    ana_reavaliacao_5_10: {
      id: 'ana_reavaliacao_5_10',
      title: 'Reavaliação após a Primeira Dose',
      description: 'Avaliar resposta clínica depois de adrenalina IM e tratamento adjunto.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-2 text-sm">
          <p>Reexaminar via aérea, esforço respiratório, saturação, pressão/perfusão e estado mental. A melhora cutânea isolada não significa resolução de A/B/C.</p>
          <p>Se persistirem alterações respiratórias ou circulatórias, aplicar a segunda dose IM e intensificar o suporte.</p>
        </div>
      `,
      options: [
        { text: 'A/B/C normalizados e sintomas em regressão', nextStep: 'ana_estratificar_observacao', value: 'resposta' },
        { text: 'Sem resposta / piora', nextStep: 'ana_repetir_adrenalina_internacao', value: 'sem_resposta', critical: true, requiresImmediateAction: true },
        { text: 'Via aérea/choque crítico', nextStep: 'ana_via_aerea_avancada', value: 'critico', critical: true, requiresImmediateAction: true }
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
    ana_estratificar_observacao: {
      id: 'ana_estratificar_observacao',
      title: 'Definir Tempo de Observação após Resolução',
      description: 'Escolher a faixa de observação conforme intensidade, tratamento necessário e segurança do retorno.',
      type: 'question',
      content: `
        <div class="space-y-3 text-sm">
          <p>Conte o período a partir da resolução completa dos sintomas. A saída antecipada só é aceitável quando todos os critérios de baixo risco estão presentes.</p>
          <ul class="list-disc space-y-1 pl-5">
            <li><strong>Baixo risco:</strong> resposta rápida a uma dose, resolução total, supervisão segura e plano/autoinjetor disponível e compreendido.</li>
            <li><strong>Risco intermediário:</strong> duas doses IM ou antecedente de reação bifásica.</li>
            <li><strong>Alto risco:</strong> mais de duas doses, asma grave, comprometimento respiratório importante, absorção contínua do alérgeno ou acesso difícil ao atendimento.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Baixo risco — observar por pelo menos 4 h', nextStep: 'ana_observacao_alta', value: 'observacao_4h' },
        { text: 'Risco intermediário — observar por pelo menos 8 h', nextStep: 'ana_observacao_alta', value: 'observacao_8h' },
        { text: 'Alto risco — observar 12 h ou mais / internar', nextStep: 'ana_observacao_prolongada', value: 'observacao_12h', critical: true }
      ]
    },
    ana_observacao_alta: {
      id: 'ana_observacao_alta',
      title: 'Alta Segura após Observação',
      description: 'Liberar somente após resolução completa, estabilidade e orientação estruturada.',
      type: 'result',
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500"><p><strong>Antes da saída:</strong> revisar risco de recorrência, desencadeante provável, técnica do autoinjetor quando indicado, plano escrito e acesso ao retorno.</p></div>
          <p>Encaminhar para avaliação especializada e registrar as doses/horários de adrenalina administrados.</p>
        </div>
      `,
      options: []
    },
    ana_repetir_adrenalina_internacao: {
      id: 'ana_repetir_adrenalina_internacao',
      title: 'Segunda Dose de Adrenalina IM',
      description: 'Persistência de comprometimento A/B/C após 5 minutos: repetir a dose IM e chamar suporte avançado.',
      type: 'medication',
      critical: true,
      timeSensitive: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-600">
            <p><strong>Conduta:</strong> repetir adrenalina IM, manter ABCDE, oxigênio alto fluxo, expansão volêmica e monitorização.</p>
          </div>
          <p>Aplicar cristalóide rapidamente se choque e preparar via aérea difícil. Adrenalina intravenosa em bolus não faz parte do manejo rotineiro.</p>
        </div>
      `,
      options: [
        { text: 'Reavaliar A/B/C 5 minutos após a segunda dose', nextStep: 'ana_reavaliacao_segunda_dose', value: 'segunda_dose_aplicada', critical: true }
      ]
    },
    ana_reavaliacao_segunda_dose: {
      id: 'ana_reavaliacao_segunda_dose',
      title: 'Reavaliação após a Segunda Dose',
      description: 'Persistência de alterações respiratórias ou cardiovasculares após duas doses adequadas define anafilaxia refratária.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-2 text-sm">
          <p>Repetir avaliação de A/B/C, pressão, perfusão, consciência e resposta ao volume.</p>
          <p>Enquanto a infusão não estiver pronta, novas doses IM podem ser repetidas a cada 5 minutos conforme resposta e protocolo.</p>
        </div>
      `,
      options: [
        { text: 'A/B/C normalizados e melhora sustentada', nextStep: 'ana_estratificar_observacao', value: 'resposta_segunda_dose' },
        { text: 'Persistem sinais respiratórios ou circulatórios', nextStep: 'ana_via_aerea_avancada', value: 'anafilaxia_refrataria', critical: true, requiresImmediateAction: true }
      ]
    },
    ana_via_aerea_avancada: {
      id: 'ana_via_aerea_avancada',
      title: 'Via Aérea Avançada na Anafilaxia',
      description: 'Reconhecer edema progressivo, antecipar uma abordagem difícil e deixar o acesso frontal de emergência pronto antes da perda da oxigenação.',
      type: 'question',
      critical: true,
      timeSensitive: true,
      content: `
        <div class="rounded border-l-4 border-red-600 bg-red-50 p-3 text-sm">
          <p><strong>Prioridade:</strong> manter oxigenação e tratamento da anafilaxia enquanto a equipe mais experiente organiza o plano de via aérea. O POCUS é complementar e não deve atrasar adrenalina, ventilação ou acesso de emergência.</p>
        </div>
      `,
      options: [
        { text: 'Plano avançado iniciado — seguir cuidado crítico', nextStep: 'ana_internacao_via_aerea_choque', value: 'plano_via_aerea', critical: true },
        { text: 'CICO/obstrução completa — acesso frontal de emergência', nextStep: 'ana_internacao_via_aerea_choque', value: 'cico', critical: true, requiresImmediateAction: true }
      ]
    },
    ana_observacao_prolongada: {
      id: 'ana_observacao_prolongada',
      title: 'Observação Prolongada ou Internação',
      description: 'Alto risco de recorrência ou dificuldade de resposta exige vigilância por 12 horas ou mais.',
      type: 'result',
      critical: true,
      content: `
        <div class="bg-orange-50 p-3 rounded border-l-4 border-orange-500 text-sm">
          <p><strong>Conduta:</strong> manter ambiente monitorizado e individualizar internação quando houver reação grave, múltiplas doses, asma importante, absorção contínua do agente ou acesso inseguro ao retorno.</p>
        </div>
      `,
      options: []
    },
    ana_internacao_via_aerea_choque: {
      id: 'ana_internacao_via_aerea_choque',
      title: 'Anafilaxia Refratária / Ameaça à Vida',
      description: 'Alterações de A/B/C após duas doses IM adequadas: suporte avançado imediato e internação em ambiente crítico.',
      type: 'result',
      critical: true,
      requiresSpecialist: true,
      content: `
        <div class="bg-red-50 p-3 rounded border-l-4 border-red-600 text-sm">
          <p><strong>Conduta:</strong> acionar especialista em via aérea e equipe de cuidados críticos, manter doses IM a cada 5 minutos enquanto prepara infusão de adrenalina por bomba em linha exclusiva, com ECG, oximetria e pressão frequente. Administrar cristalóide rapidamente no choque e titular a infusão à menor dose eficaz.</p>
          <p class="mt-2"><strong>Segurança:</strong> infusão de adrenalina requer profissional experiente e ambiente monitorizado. Considerar glucagon quando houver uso de betabloqueador e resposta inadequada; outros vasopressores são decisão de suporte avançado.</p>
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
      description: 'Dor em hipocôndrio direito com duração superior a 6 horas, possivelmente irradiada para dorso ou ombro direito, podendo estar associada a náuseas/vômitos, febre e anorexia.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="bg-lime-50 p-3 rounded border-l-4 border-lime-500">
            <p><strong>Quadro típico:</strong> dor em hipocôndrio direito com duração superior a 6 horas, possivelmente irradiada para dorso ou ombro direito, podendo estar associada a náuseas/vômitos, febre e anorexia.</p>
          </div>
          <ul class="list-disc pl-5 space-y-1">
            <li>Solicitar USG abdominal.</li>
            <li>Solicitar exames laboratoriais.</li>
            <li>Medidas gerais iniciais: jejum, analgesia adequada, hidratação, acesso venoso, verificar sinais de instabilidade/gravidade.</li>
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
      description: 'ABCDE, monitorização, exames, imagem, suporte, analgesia, antiemético, antibiótico precoce e cirurgia geral.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="grid gap-3 md:grid-cols-2">
            <div class="bg-sky-50 p-3 rounded border-l-4 border-sky-500">
              <p><strong>Avaliação inicial:</strong> ABCDE, via aérea, respiração, SatO₂, FR, PA, FC, temperatura, Glasgow e avaliação da dor.</p>
            </div>
            <div class="bg-indigo-50 p-3 rounded border-l-4 border-indigo-500">
              <p><strong>Monitorização:</strong> monitor cardíaco, oximetria contínua, PA seriada e dois acessos venosos periféricos, preferencialmente 18G ou 20G.</p>
            </div>
          </div>
          <div class="grid gap-3 md:grid-cols-2">
            <div class="bg-cyan-50 p-3 rounded border-l-4 border-cyan-500">
              <p><strong>Exames laboratoriais:</strong> hemograma, PCR, função renal, eletrólitos, perfil hepático completo, coagulograma, amilase/lipase. Lactato, gasometria e hemoculturas se grave, febre, sepse ou suspeita de colangite.</p>
            </div>
            <div class="bg-violet-50 p-3 rounded border-l-4 border-violet-500">
              <p><strong>Imagem:</strong> solicitar USG abdominal. Se disponível, realizar POCUS para buscar cálculo, parede espessada, Murphy ultrassonográfico, líquido perivesicular e dilatação do colédoco.</p>
            </div>
          </div>
          <div class="grid gap-3 md:grid-cols-2">
            <div class="bg-emerald-50 p-3 rounded border-l-4 border-emerald-500">
              <p><strong>Suporte imediato:</strong> jejum absoluto, hidratação venosa com cristaloide, analgesia adequada e antiemético se náuseas/vômitos.</p>
            </div>
            <div class="bg-rose-50 p-3 rounded border-l-4 border-rose-500">
              <p><strong>Antibioticoterapia:</strong> se suspeita clínica moderada/alta, iniciar antes da confirmação por USG. Leve/moderada: ceftriaxona + metronidazol. Grave: piperacilina-tazobactam ou protocolo local.</p>
            </div>
          </div>
          <div class="bg-amber-50 p-3 rounded border-l-4 border-amber-500">
            <p><strong>Gravidade e acionamento:</strong> pesquisar hipotensão, vasopressor, disfunção renal, alteração neurológica, hipoxemia/taquipneia, icterícia, bilirrubina elevada ou colédoco dilatado. Acionar cirurgia geral para avaliação precoce.</p>
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
          <div class="bg-red-50 p-3 rounded border border-red-200">
            <p><strong>Avaliação de UTI:</strong> todo paciente com Colecistite Aguda Grau III (Tokyo Guidelines) ou com necessidade de suporte avançado de órgãos deve ser considerado elegível para avaliação e internação em Unidade de Terapia Intensiva.</p>
          </div>
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

// Fluxograma de Paralisia de Bell
export const paralisiaBellFlowchart: EmergencyFlowchart = {
  id: 'paralisia_bell',
  name: 'Paralisia de Bell',
  description: 'Avaliação de paralisia facial periférica aguda, critérios diagnósticos, diferenciais, red flags, House-Brackmann e tratamento inicial.',
  category: 'neurological',
  priority: 'medium',
  icon: 'brain',
  color: 'from-amber-500 to-orange-600',
  initialStep: 'bell_inicio',
  finalSteps: [
    'bell_criterios_nao_preenchidos',
    'bell_red_flags_investigar',
    'bell_prescricao_cuidados',
    'bell_encaminhamento_neuro',
    'bell_encaminhamento_otorrino',
    'bell_finalizado'
  ],
  steps: {
    bell_inicio: {
      id: 'bell_inicio',
      title: 'Paralisia de Bell',
      description: 'Neuropatia periférica aguda do nervo facial, geralmente unilateral e de instalação súbita.',
      type: 'question',
      content: `
        <div class="space-y-5 text-sm text-slate-900">
          <div class="space-y-3">
            <div class="flex items-start justify-between gap-4">
              <div class="space-y-3">
                <p>A <strong>paralisia de Bell</strong> é uma <strong>neuropatia periférica aguda do nervo facial (VII par craniano)</strong>. Caracteriza-se por <strong>instalação súbita de fraqueza ou paralisia unilateral</strong> dos músculos da expressão facial, sem causa identificável na avaliação inicial.</p>
                <p>É a forma mais comum de paralisia facial periférica idiopática. O quadro resulta de <strong>disfunção súbita do nervo facial ao longo do trajeto intratemporal</strong>, geralmente associada a processo inflamatório de provável origem viral.</p>
              </div>
              <details class="relative shrink-0">
                <summary class="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border border-blue-300 bg-blue-50 text-base font-extrabold text-blue-800 shadow-sm">
                  i
                </summary>
                <div class="absolute right-0 z-20 mt-2 w-[min(56rem,calc(100vw-4rem))] rounded-xl border border-blue-200 bg-white p-4 shadow-xl">
                  <p class="mb-2 font-bold text-blue-950">Nervo facial (VII par craniano)</p>
                  <img src="/paralisia%20de%20bell/facial%20nerve.png" alt="Trajeto do nervo facial" class="max-h-[72vh] w-full rounded-lg object-contain" />
                </div>
              </details>
            </div>
            <div class="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
              <p><strong>Diferencial essencial:</strong> a paralisia facial central decorre de lesão supranuclear, acima do núcleo do nervo facial, geralmente com preservação da musculatura frontal. A paralisia de Bell envolve <strong>toda a hemiface</strong>.</p>
            </div>
          </div>

        </div>
      `,
      options: [
        { text: 'Lado direito acometido', nextStep: 'bell_transicao_central_periferica', value: 'lado_direito' },
        { text: 'Lado esquerdo acometido', nextStep: 'bell_transicao_central_periferica', value: 'lado_esquerdo' }
      ]
    },
    bell_transicao_central_periferica: {
      id: 'bell_transicao_central_periferica',
      title: 'Diferenciar Paralisia Central',
      description: 'Diferenciar Paralisia de Bell de paralisia facial central antes dos critérios diagnósticos.',
      type: 'question',
      content: `
        <div class="rounded-2xl border border-yellow-200 bg-yellow-50 p-5 text-center text-sm leading-relaxed text-yellow-950 shadow-sm">
          <p class="text-lg font-extrabold">Paralisia de Bell vs Paralisia Facial Central</p>
          <p class="mt-3 text-base">A <strong>paralisia de Bell</strong> deve ser diferenciada da <strong>paralisia facial central</strong>. A paralisia facial central decorre de <strong>lesão supranuclear</strong>, acima do núcleo do nervo facial, geralmente com preservação da musculatura frontal.</p>
          <p class="mt-3 text-base">Já a <strong>paralisia de Bell</strong> resulta de <strong>lesão periférica do nervo facial</strong>, envolvendo <strong>toda a hemiface</strong>, e caracteriza-se por inflamação restrita ao próprio nervo facial, sem acometimento de outras estruturas do sistema nervoso central.</p>
        </div>
      `,
      options: [
        { text: 'Realizar exame físico direcionado', nextStep: 'bell_exame_fisico', value: 'seguir_exame_fisico' }
      ]
    },
    bell_exame_fisico: {
      id: 'bell_exame_fisico',
      title: 'Avaliação Inicial / Exame Físico',
      description: 'Exame motor do VII par craniano e rastreio neurológico antes dos critérios diagnósticos.',
      type: 'question',
      content: `
        <div class="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
          <p><strong>Objetivos:</strong> confirmar o padrão de paralisia facial periférica e pesquisar achados que indiquem AVC, Ramsay Hunt, lesão estrutural ou outra neuropatia.</p>
        </div>
      `,
      options: [
        { text: 'Salvar exame físico e seguir para critérios obrigatórios', nextStep: 'bell_criterios_obrigatorios', value: 'exame_fisico_registrado' }
      ]
    },
    bell_criterios_obrigatorios: {
      id: 'bell_criterios_obrigatorios',
      title: 'Critérios Diagnósticos Obrigatórios',
      description: 'Todos os critérios devem estar presentes simultaneamente para confirmar suspeita clínica de Paralisia de Bell.',
      type: 'question',
      content: `
        <div class="space-y-4 text-sm">
          <div class="space-y-4">
            <p class="font-semibold">Para confirmar o diagnóstico de Paralisia de Bell, todos os critérios obrigatórios abaixo devem estar presentes simultaneamente.</p>
            <div class="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <ol class="list-decimal space-y-2 pl-5">
                <li><strong>Fraqueza ou paralisia facial periférica unilateral</strong>, envolvendo:
                  <ul class="mt-1 list-disc pl-5">
                    <li>fronte, com incapacidade de enrugar a testa;</li>
                    <li>fechamento ocular incompleto;</li>
                    <li>desvio da comissura labial.</li>
                  </ul>
                </li>
                <li><strong>Início agudo</strong>, com progressão até o pico em <strong>72 horas ou menos</strong>.</li>
                <li><strong>Ausência de causa identificável</strong> após avaliação clínica inicial.</li>
                <li><strong>Ausência de outros déficits neurológicos</strong> além do VII par craniano.</li>
              </ol>
            </div>
            <div class="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p class="font-bold">O VII par craniano faz 4 coisas:</p>
              <ol class="mt-2 list-decimal space-y-1 pl-5">
                <li><strong>Motor</strong>: músculos da expressão facial.</li>
                <li><strong>Sensorial especial</strong>: paladar dos 2/3 anteriores da língua.</li>
                <li><strong>Sensitivo</strong>: dor no ouvido, hiperacusia e sensação auditiva alterada podem ocorrer.</li>
                <li><strong>Autonômico</strong>: lágrimas e saliva.</li>
              </ol>
            </div>
          </div>
        </div>
      `,
      options: [
        { text: 'Critérios obrigatórios preenchidos', nextStep: 'bell_suporte_diagnostico', value: 'criterios_preenchidos' },
        { text: 'Critérios obrigatórios não preenchidos', nextStep: 'bell_criterios_nao_preenchidos', value: 'criterios_nao_preenchidos', critical: true }
      ]
    },
    bell_suporte_diagnostico: {
      id: 'bell_suporte_diagnostico',
      title: 'Critérios Diagnósticos de Suporte',
      description: 'Sinais não obrigatórios que reforçam a hipótese de Paralisia de Bell.',
      type: 'question',
      content: `
        <div class="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-950 shadow-sm">
          <p class="text-lg font-extrabold text-center">Critérios Diagnósticos de Suporte (não obrigatórios)</p>
          <p class="mt-4 font-semibold">A presença dos itens abaixo reforça o diagnóstico de Paralisia de Bell. Marque os sinais presentes.</p>
        </div>
      `,
      options: [
        { text: 'Critérios de suporte verificados, seguir fluxo', nextStep: 'bell_red_flags_ramsay', value: 'suporte_verificado' }
      ]
    },
    bell_criterios_nao_preenchidos: {
      id: 'bell_criterios_nao_preenchidos',
      title: 'Critérios Não Preenchidos',
      description: 'Não considerar Paralisia de Bell até prova em contrário.',
      type: 'result',
      critical: true,
      content: `
        <div class="space-y-4 text-sm text-red-950">
          <div class="rounded-lg border-l-4 border-red-600 bg-red-50 p-4">
            <p><strong>Se não preenche critérios de Paralisia de Bell, não é Bell até prova em contrário.</strong></p>
            <p class="mt-2">Investigar outras causas infecciosas, estruturais, centrais ou sistêmicas e solicitar exames conforme suspeita clínica.</p>
          </div>
          <div class="rounded-lg border border-red-200 bg-white p-4 leading-relaxed text-slate-800">
            <h4 class="font-extrabold text-red-950">Quando não for Bell</h4>
            <p class="mt-3">Quando a Paralisia de Bell é descartada após investigação adequada, o caso deixa de ser considerado uma paralisia facial idiopática e passa a exigir uma abordagem etiológica ativa. Nesse momento, o médico deve reorganizar o raciocínio clínico, partindo da premissa de que toda paralisia facial periférica não-Bell tem uma causa subjacente que precisa ser identificada. O primeiro passo é confirmar se o padrão realmente corresponde a uma paralisia periférica ou se há elementos que sugerem um componente central, como fronte poupada, paralisia bilateral ou outros déficits neurológicos associados. Essa distinção é fundamental porque define se a investigação deve se concentrar no tronco cerebral ou nas estruturas periféricas do nervo facial.</p>
            <p class="mt-3">Com o padrão periférico confirmado, o próximo movimento é interpretar cuidadosamente os elementos clínicos que já foram observados. A evolução progressiva por mais de 72 horas, a presença de dor intensa, vesículas, recorrência, bilateralidade, sintomas sistêmicos, acometimento de outros pares cranianos, hipoacusia, zumbido, vertigem ou história de trauma são pistas que afastam definitivamente o diagnóstico de Bell e direcionam para etiologias infecciosas, estruturais, centrais ou sistêmicas. Cada detalhe do exame físico e da anamnese passa a ter peso, pois é ele que orientará a escolha dos exames complementares.</p>
            <p class="mt-3">A partir daí, a investigação deve ser direcionada. Se houver dor intensa, vesículas ou imunossupressão, o foco recai sobre causas infecciosas como zoster, Lyme, HIV ou otites complicadas. Se o quadro for progressivo, recorrente ou acompanhado de sintomas otológicos, a hipótese estrutural ganha força, exigindo ressonância magnética de orelha interna, parótida e ângulo ponto-cerebelar. Quando há sinais neurológicos associados, a suspeita de lesão central deve ser priorizada, com ressonância magnética de encéfalo com ênfase em tronco cerebral. Já quadros bilaterais, recorrentes ou acompanhados de manifestações sistêmicas sugerem sarcoidose, síndrome de Guillain-Barré, Melkersson–Rosenthal ou outras doenças autoimunes, demandando exames laboratoriais, líquor ou eletroneuromiografia.</p>
            <p class="mt-3">A condução prática, portanto, envolve reavaliar clinicamente o paciente com foco em sinais de alerta, classificar o padrão da paralisia, identificar o grupo etiológico mais provável e solicitar exames direcionados, evitando painéis indiscriminados. Encaminhamentos para neurologia, otorrinolaringologia, infectologia ou reumatologia podem ser necessários conforme a hipótese predominante. Por fim, é essencial monitorar a evolução, pois algumas causas estruturais ou inflamatórias se revelam de forma progressiva e podem exigir reavaliação periódica.</p>
            <p class="mt-3">Em síntese, após descartar Paralisia de Bell, o médico deve abandonar a lógica do diagnóstico de exclusão e adotar uma postura investigativa ativa, sistemática e guiada por pistas clínicas. Esse é o ponto em que a conduta deixa de ser expectante e passa a ser verdadeiramente etiológica, garantindo segurança diagnóstica e terapêutica ao paciente.</p>
          </div>
        </div>
      `,
      options: []
    },
    bell_red_flags_ramsay: {
      id: 'bell_red_flags_ramsay',
      title: 'Red Flags (critérios de exclusão)',
      description: 'Descartar sinais que mudam investigação, urgência e encaminhamento.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-5 text-sm">
          <div class="grid gap-4 lg:grid-cols-2">
            <div class="rounded-lg border border-red-200 bg-red-50 p-4">
              <h4 class="font-extrabold text-red-950">Red flags</h4>
              <ul class="mt-2 list-disc space-y-1 pl-5">
                <li>Outros déficits neurológicos, alteração de consciência, ataxia, disartria ou hemiparesia.</li>
                <li>Início progressivo, recorrente, bilateral ou evolução fora do padrão esperado.</li>
                <li>Febre, imunossupressão, trauma, otite/mastoidite, massa parotídea ou suspeita de neoplasia.</li>
                <li>Dor intensa, erupções vesiculares, hipoacusia, zumbido ou vertigem importantes.</li>
              </ul>
              <img src="/paralisia%20de%20bell/red%20flag.png" alt="Sinais de alerta em Paralisia de Bell" class="mt-3 w-full rounded-lg object-contain" />
            </div>
            <div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h4 class="font-extrabold text-blue-950">Ramsay Hunt vs Bell</h4>
              <p class="mt-2">A síndrome de Ramsay Hunt é causada pela reativação do vírus varicela-zóster, afetando principalmente o VII par e, muitas vezes, o VIII par.</p>
              <ul class="mt-2 list-disc space-y-1 pl-5">
                <li><strong>Ramsay Hunt:</strong> dor otológica intensa, vesículas na orelha/conduto auditivo e sintomas cocleovestibulares.</li>
                <li><strong>Bell:</strong> paralisia facial periférica isolada, sem vesículas e sem comprometimento auditivo/vestibular típico.</li>
              </ul>
              <img src="/paralisia%20de%20bell/sinfrome%20de%20hamsay%20hunt%20x%20paralisia%20de%20bell.png" alt="Ramsay Hunt versus Paralisia de Bell" class="mt-3 w-full rounded-lg object-contain" />
            </div>
          </div>
        </div>
      `,
      options: [
        { text: 'Sem red flags e sem sinais de Ramsay Hunt', nextStep: 'bell_sem_exames', value: 'sem_red_flags' },
        { text: 'Há red flags ou suspeita de Ramsay Hunt', nextStep: 'bell_red_flags_investigar', value: 'red_flags', critical: true, requiresImmediateAction: true }
      ]
    },
    bell_red_flags_investigar: {
      id: 'bell_red_flags_investigar',
      title: 'Investigar Diagnósticos Alternativos',
      description: 'Solicitar exames e acionar especialidade conforme suspeita.',
      type: 'result',
      critical: true,
      requiresSpecialist: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="rounded-lg border-l-4 border-red-600 bg-red-50 p-4 text-red-950">
            <p><strong>Conduta:</strong> não tratar como Paralisia de Bell isolada. Investigar causas centrais, infecciosas, otológicas, estruturais ou sistêmicas conforme quadro.</p>
          </div>
          <ul class="list-disc pl-5">
            <li>Considerar neuroimagem se déficit neurológico, suspeita central, evolução atípica ou sinais focais.</li>
            <li>Considerar avaliação otorrinolaringológica se dor otológica intensa, vesículas, otite/mastoidite, hipoacusia ou vertigem.</li>
            <li>Na suspeita de Ramsay Hunt, iniciar abordagem direcionada e encaminhar para seguimento especializado.</li>
          </ul>
          <div class="rounded-lg border border-red-200 bg-white p-4 leading-relaxed text-slate-800">
            <h4 class="font-extrabold text-red-950">Quando não for Bell</h4>
            <p class="mt-3">Quando a Paralisia de Bell é descartada após investigação adequada, o caso deixa de ser considerado uma paralisia facial idiopática e passa a exigir uma abordagem etiológica ativa. Nesse momento, o médico deve reorganizar o raciocínio clínico, partindo da premissa de que toda paralisia facial periférica não-Bell tem uma causa subjacente que precisa ser identificada. O primeiro passo é confirmar se o padrão realmente corresponde a uma paralisia periférica ou se há elementos que sugerem um componente central, como fronte poupada, paralisia bilateral ou outros déficits neurológicos associados. Essa distinção é fundamental porque define se a investigação deve se concentrar no tronco cerebral ou nas estruturas periféricas do nervo facial.</p>
            <p class="mt-3">Com o padrão periférico confirmado, o próximo movimento é interpretar cuidadosamente os elementos clínicos que já foram observados. A evolução progressiva por mais de 72 horas, a presença de dor intensa, vesículas, recorrência, bilateralidade, sintomas sistêmicos, acometimento de outros pares cranianos, hipoacusia, zumbido, vertigem ou história de trauma são pistas que afastam definitivamente o diagnóstico de Bell e direcionam para etiologias infecciosas, estruturais, centrais ou sistêmicas. Cada detalhe do exame físico e da anamnese passa a ter peso, pois é ele que orientará a escolha dos exames complementares.</p>
            <p class="mt-3">A partir daí, a investigação deve ser direcionada. Se houver dor intensa, vesículas ou imunossupressão, o foco recai sobre causas infecciosas como zoster, Lyme, HIV ou otites complicadas. Se o quadro for progressivo, recorrente ou acompanhado de sintomas otológicos, a hipótese estrutural ganha força, exigindo ressonância magnética de orelha interna, parótida e ângulo ponto-cerebelar. Quando há sinais neurológicos associados, a suspeita de lesão central deve ser priorizada, com ressonância magnética de encéfalo com ênfase em tronco cerebral. Já quadros bilaterais, recorrentes ou acompanhados de manifestações sistêmicas sugerem sarcoidose, síndrome de Guillain-Barré, Melkersson–Rosenthal ou outras doenças autoimunes, demandando exames laboratoriais, líquor ou eletroneuromiografia.</p>
            <p class="mt-3">A condução prática, portanto, envolve reavaliar clinicamente o paciente com foco em sinais de alerta, classificar o padrão da paralisia, identificar o grupo etiológico mais provável e solicitar exames direcionados, evitando painéis indiscriminados. Encaminhamentos para neurologia, otorrinolaringologia, infectologia ou reumatologia podem ser necessários conforme a hipótese predominante. Por fim, é essencial monitorar a evolução, pois algumas causas estruturais ou inflamatórias se revelam de forma progressiva e podem exigir reavaliação periódica.</p>
            <p class="mt-3">Em síntese, após descartar Paralisia de Bell, o médico deve abandonar a lógica do diagnóstico de exclusão e adotar uma postura investigativa ativa, sistemática e guiada por pistas clínicas. Esse é o ponto em que a conduta deixa de ser expectante e passa a ser verdadeiramente etiológica, garantindo segurança diagnóstica e terapêutica ao paciente.</p>
          </div>
        </div>
      `,
      options: []
    },
    bell_sem_exames: {
      id: 'bell_sem_exames',
      title: 'Quadro Compatível com Paralisia de Bell',
      description: 'Periférico, unilateral, agudo e sem red flags.',
      type: 'question',
      content: `
        <div class="space-y-4 text-center text-sm">
          <p class="text-lg font-extrabold text-slate-950">Verificado quadro clínico compatível com Paralisia de Bell periférica, unilateral, aguda e sem red flags.</p>
          <img src="/paralisia%20de%20bell/nao%20necessario%20solicitar%20exames.png" alt="Não é necessário solicitar exames" class="mx-auto w-full max-w-xl rounded-lg object-contain" />
          <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-left text-emerald-950">
            <p><strong>Não é necessário solicitar exames</strong> quando o quadro é típico de Paralisia de Bell, sem sinais de alarme e sem déficits neurológicos adicionais.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'Avaliar grau pela escala de House-Brackmann', nextStep: 'bell_transicao_house_brackmann', value: 'avaliar_house' }
      ]
    },
    bell_transicao_house_brackmann: {
      id: 'bell_transicao_house_brackmann',
      title: 'Escala de House-Brackmann',
      description: 'Entender a escala antes de classificar o grau de disfunção facial.',
      type: 'question',
      content: `
        <div class="rounded-2xl border border-pink-200 bg-pink-50 p-5 text-center text-sm leading-relaxed text-pink-950 shadow-sm">
          <p class="text-lg font-extrabold">Escala de House-Brackmann</p>
          <p class="mt-3 text-base">A <strong>Escala de House-Brackmann</strong> é o sistema mais utilizado para classificar a gravidade da paralisia facial periférica, especialmente em casos como a Paralisia de Bell. Ela avalia a função motora da face, permitindo padronizar o grau de comprometimento e acompanhar a evolução clínica e resposta ao tratamento.</p>
          <p class="mt-5 text-base font-bold">Estrutura da Escala</p>
          <p class="mt-2 text-base">A escala é dividida em seis graus, do I ao VI, que vão desde a função facial normal até a paralisia completa, com critérios baseados na simetria em repouso, movimento voluntário e presença de sincinesias, que são movimentos involuntários associados.</p>
        </div>
      `,
      options: [
        { text: 'Seguir para classificação', nextStep: 'bell_house_brackmann', value: 'seguir_house' }
      ]
    },
    bell_house_brackmann: {
      id: 'bell_house_brackmann',
      title: 'Escala de House-Brackmann',
      description: 'Classificação da gravidade da disfunção motora facial.',
      type: 'question',
      content: `
        <div class="space-y-5 text-sm">
          <div class="rounded-lg border border-pink-200 bg-pink-50 p-4 text-center">
            <p>A <strong>Escala de House-Brackmann</strong> é o sistema mais utilizado para classificar a gravidade da paralisia facial periférica. Ela padroniza o grau de comprometimento e ajuda no acompanhamento da evolução clínica e resposta ao tratamento.</p>
          </div>
          <img src="/paralisia%20de%20bell/escala%20de%20house.png" alt="Escala de House-Brackmann" class="w-full rounded-lg object-contain" />
          <div class="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <h4 class="mb-2 font-extrabold">Selecione conforme a avaliação do paciente</h4>
            <ul class="list-disc space-y-2 pl-5">
              <li><strong>Grau I:</strong> normal.</li>
              <li><strong>Grau II:</strong> leve fraqueza facial; tônus e simetria normais em repouso; fechamento ocular completo sem esforço.</li>
              <li><strong>Grau III:</strong> disfunção moderada; fechamento ocular completo e boa movimentação da testa com esforço.</li>
              <li><strong>Grau IV:</strong> disfunção grave; fechamento ocular incompleto, ausência de movimento da testa, movimento assimétrico da boca e sincinesia.</li>
              <li><strong>Grau V:</strong> pouca ou nenhuma capacidade de sorrir, franzir a testa ou fazer expressões; fechamento ocular incompleto.</li>
              <li><strong>Grau VI:</strong> ausência de movimentos faciais.</li>
            </ul>
          </div>
        </div>
      `,
      options: [
        { text: 'Grau I', nextStep: 'bell_tratamento_clinico', value: 'house_i' },
        { text: 'Grau II', nextStep: 'bell_tratamento_clinico', value: 'house_ii' },
        { text: 'Grau III', nextStep: 'bell_tratamento_clinico', value: 'house_iii' },
        { text: 'Grau IV', nextStep: 'bell_tratamento_clinico', value: 'house_iv' },
        { text: 'Grau V', nextStep: 'bell_tratamento_clinico', value: 'house_v' },
        { text: 'Grau VI', nextStep: 'bell_tratamento_clinico', value: 'house_vi' }
      ]
    },
    bell_transicao_tratamento_precoce: {
      id: 'bell_transicao_tratamento_precoce',
      title: 'Tratamento Precoce',
      description: 'Orientação temporal antes da conduta terapêutica.',
      type: 'question',
      timeSensitive: true,
      content: `
        <div class="rounded-2xl border border-yellow-200 bg-yellow-50 p-5 text-sm leading-relaxed text-yellow-950 shadow-sm">
          <p class="text-lg font-extrabold">Antes do tratamento</p>
          <p class="mt-2 text-base font-semibold">O tratamento da Paralisia de Bell deve ser iniciado o mais precocemente possível, idealmente nas primeiras <strong>72 horas</strong> do início dos sintomas, para melhorar o prognóstico.</p>
        </div>
      `,
      options: [
        { text: 'Seguir para tratamento clínico', nextStep: 'bell_tratamento_clinico', value: 'seguir_tratamento' }
      ]
    },
    bell_tratamento_clinico: {
      id: 'bell_tratamento_clinico',
      title: 'Tratamento Clínico e Orientações',
      description: 'Iniciar tratamento precocemente, idealmente nas primeiras 72 horas.',
      type: 'question',
      timeSensitive: true,
      content: `
        <div class="grid gap-5 text-sm lg:grid-cols-[1fr_0.85fr] lg:items-start">
          <div class="space-y-4">
            <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <img src="/paralisia%20de%20bell/tratamento%20clinico.png" alt="Tratamento clínico da Paralisia de Bell" class="mx-auto max-h-72 w-full max-w-xl rounded-lg object-contain" />
            </div>
            <div class="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p><strong>O tratamento deve ser iniciado o mais precocemente possível</strong>, idealmente nas primeiras <strong>72 horas</strong> do início dos sintomas, para melhorar o prognóstico.</p>
            </div>
            <div class="space-y-3">
              <p><strong>Corticosteroides:</strong> são a base do tratamento, com evidência para redução de sequelas e melhora da recuperação.</p>
              <p><strong>Antivirais:</strong> benefício controverso, geralmente reservado para casos graves ou associado a corticosteroides em casos moderados a graves.</p>
              <p><strong>Cuidados locais:</strong> proteção ocular é fundamental devido ao lagoftalmo, com lubrificantes e, se necessário, oclusão ocular para evitar ceratite.</p>
              <p><strong>Encaminhamento:</strong> considerar neurologista ou otorrinolaringologista para avaliação detalhada e acompanhamento.</p>
            </div>
          </div>
          <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h4 class="font-extrabold text-slate-950">Tratamento farmacológico</h4>
            <ul class="mt-2 list-disc space-y-2 pl-5">
              <li><strong>Prednisona 60 mg VO ao dia</strong> por 7 a 10 dias; ou</li>
              <li><strong>Prednisolona 25 mg VO</strong>, 2 vezes ao dia, por 7 a 10 dias.</li>
              <li><strong>Aciclovir 400 mg VO</strong>, 5 vezes ao dia, por 10 dias quando indicado.</li>
            </ul>
            <h4 class="mt-4 font-extrabold text-slate-950">Cuidados oculares</h4>
            <ul class="mt-2 list-disc space-y-2 pl-5">
              <li>Lágrimas artificiais sem conservantes de 1/1 a 2/2 h durante o dia.</li>
              <li>Pomada lubrificante oftálmica à noite.</li>
              <li>Oclusão palpebral noturna com fita hipoalergênica.</li>
              <li>Óculos de proteção contra vento e poeira.</li>
              <li>Encaminhar ao oftalmologista se sinais de exposição ou lesão corneana.</li>
            </ul>
          </div>
        </div>
      `,
      options: [
        { text: 'Sugestão de prescrição e cuidados', nextStep: 'bell_prescricao_cuidados', value: 'prescricao' },
        { text: 'Sugestão de encaminhamento ao Neurologista', nextStep: 'bell_encaminhamento_neuro', value: 'encaminhar_neuro' },
        { text: 'Sugestão de encaminhamento ao Otorrinolaringologista', nextStep: 'bell_encaminhamento_otorrino', value: 'encaminhar_otorrino' },
        { text: 'Finalizar fluxograma', nextStep: 'bell_finalizado', value: 'finalizar' }
      ]
    },
    bell_prescricao_cuidados: {
      id: 'bell_prescricao_cuidados',
      title: 'Prescrição e Cuidados',
      description: 'Sugestão de tratamento clínico para Paralisia de Bell.',
      type: 'result',
      content: `
        <div class="space-y-4 text-sm">
          <div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h4 class="text-lg font-extrabold text-blue-950">Tratamento clínico - Paralisia de Bell</h4>
            <p class="mt-2 font-semibold">Tratamento farmacológico</p>
            <ul class="mt-2 list-disc space-y-1 pl-5">
              <li>Prednisona 60 mg VO por dia, por 7 a 10 dias; ou prednisolona 25 mg VO, duas vezes ao dia, por 7 a 10 dias.</li>
              <li>Considerar aciclovir 400 mg VO, 5 vezes ao dia, por 10 dias, especialmente em casos moderados a graves ou suspeita viral associada.</li>
            </ul>
            <p class="mt-3 font-semibold">Cuidados oculares</p>
            <ul class="mt-2 list-disc space-y-1 pl-5">
              <li>Lágrimas artificiais sem conservantes de 1/1 a 2/2 h durante o dia.</li>
              <li>Pomada lubrificante oftálmica à noite.</li>
              <li>Oclusão palpebral noturna com fita adesiva hipoalergênica.</li>
              <li>Óculos de proteção ao vento e poeira.</li>
              <li>Encaminhar ao oftalmologista se sinais de exposição ou lesão corneana.</li>
            </ul>
          </div>
          <p class="text-slate-600">Ajustar doses, contraindicações, comorbidades e alergias conforme avaliação clínica individual.</p>
        </div>
      `,
      options: []
    },
    bell_encaminhamento_neuro: {
      id: 'bell_encaminhamento_neuro',
      title: 'Encaminhamento ao Neurologista',
      description: 'Texto sugerido para encaminhamento especializado.',
      type: 'result',
      requiresSpecialist: true,
      content: `
        <div class="rounded-lg border border-slate-200 bg-white p-5 text-sm leading-relaxed shadow-sm">
          <h4 class="font-serif text-lg font-bold">Encaminhamento ao Neurologista</h4>
          <p class="mt-4">Encaminho o paciente portador de quadro clínico compatível com <strong>Paralisia de Bell</strong> para avaliação especializada em <strong>Neurologia</strong>. O paciente apresenta instalação súbita de paralisia facial periférica unilateral, já em tratamento inicial, porém necessita de seguimento neurológico para monitorar a evolução da função facial, orientar sobre a necessidade de exames complementares como eletroneuromiografia ou neuroimagem, excluir outras possíveis causas de paralisia facial periférica, definir condutas terapêuticas adicionais e avaliar a necessidade de reabilitação motora, além de prevenir potenciais sequelas funcionais e estéticas.</p>
          <p class="mt-4">O quadro teve início conforme registrado no atendimento, acometendo o lado selecionado no fluxo, com grau de comprometimento facial estimado pela escala de House-Brackmann. Foi iniciado tratamento com corticoide, antiviral quando indicado e orientações de cuidados com a proteção ocular.</p>
          <p class="mt-4">Solicito, portanto, avaliação e seguimento pelo Neurologista para continuidade do cuidado e definição da melhor conduta terapêutica.</p>
          <p class="mt-4">Atenciosamente,</p>
          <p class="mt-4 font-bold">Médico assistente</p>
        </div>
      `,
      options: []
    },
    bell_encaminhamento_otorrino: {
      id: 'bell_encaminhamento_otorrino',
      title: 'Encaminhamento à Otorrinolaringologia',
      description: 'Texto sugerido para encaminhamento especializado.',
      type: 'result',
      requiresSpecialist: true,
      content: `
        <div class="rounded-lg border border-slate-200 bg-white p-5 text-sm leading-relaxed shadow-sm">
          <h4 class="font-serif text-lg font-bold">Encaminhamento à especialidade de Otorrinolaringologia</h4>
          <p class="mt-4">Encaminho o paciente portador de quadro clínico compatível com <strong>Paralisia de Bell</strong> para avaliação especializada em <strong>Otorrinolaringologia</strong>. O paciente apresenta instalação súbita de paralisia facial periférica unilateral, já em tratamento inicial, porém necessita de avaliação otorrinolaringológica para investigação de possíveis causas otológicas da paralisia facial, avaliação da orelha média e mastoide, definição da necessidade de exames complementares além de acompanhamento da evolução funcional e orientação sobre terapias adjuvantes e prevenção de sequelas.</p>
          <p class="mt-4">O quadro teve início conforme registrado no atendimento, acometendo o lado selecionado no fluxo, com grau de comprometimento facial estimado pela escala de House-Brackmann, tendo sido iniciado tratamento com corticoide, antiviral quando indicado e orientações de proteção ocular.</p>
          <p class="mt-4">Solicito, portanto, avaliação e seguimento pelo Otorrinolaringologista para continuidade do cuidado, investigação de causas otológicas e definição da melhor conduta terapêutica.</p>
          <p class="mt-4">Atenciosamente,</p>
          <p class="mt-4 font-bold">Médico assistente</p>
        </div>
      `,
      options: []
    },
    bell_finalizado: {
      id: 'bell_finalizado',
      title: 'Fluxograma Finalizado',
      description: 'Orientações e tratamento inicial revisados.',
      type: 'result',
      content: `
        <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-center text-emerald-950">
          <p class="text-xl font-extrabold">Fluxograma finalizado</p>
          <p class="mt-2 text-sm">Registrar lado acometido, tempo de início, grau House-Brackmann, tratamento instituído, cuidados oculares e plano de seguimento.</p>
        </div>
      `,
      options: []
    }
  }
}

export const ituFlowchart: EmergencyFlowchart = {
  id: 'itu',
  name: 'Infecção do Trato Urinário (ITU)',
  description: 'Avaliação de cistite, pielonefrite, sepse urinária, critérios de internação e antibioticoterapia inicial.',
  category: 'infectious',
  priority: 'high',
  icon: 'droplets',
  color: 'from-cyan-700 to-blue-900',
  initialStep: 'itu_apresentacao',
  finalSteps: [
    'itu_cistite_fosfomicina',
    'itu_cistite_nitrofurantoina',
    'itu_cistite_cefuroxima',
    'itu_cistite_sulfametoxazol',
    'itu_bacteriuria_nao_tratar',
    'itu_ambulatorial_concluido',
    'itu_alta_hospitalar',
    'itu_sepse_encaminhada'
  ],
  steps: {
    itu_apresentacao: {
      id: 'itu_apresentacao',
      title: 'Avaliação inicial da suspeita de ITU',
      description: 'Diferenciar infecção urinária baixa, pielonefrite e bacteriúria assintomática.',
      type: 'question',
      content: `
        <div class="grid gap-3 md:grid-cols-3 text-sm">
          <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
            <h4 class="font-bold">Cistite / ITU baixa</h4>
            <p class="mt-2">Disúria, polaciúria, urgência urinária e dor suprapúbica, sem sinais sistêmicos ou dor lombar.</p>
          </div>
          <div class="rounded-xl border border-red-200 bg-red-50 p-4 text-red-950">
            <h4 class="font-bold">Pielonefrite</h4>
            <p class="mt-2">Febre, calafrios, dor lombar ou em flanco, punho-percussão lombar dolorosa, náuseas ou vômitos, com ou sem sintomas de cistite.</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-800">
            <h4 class="font-bold">Bacteriúria assintomática</h4>
            <p class="mt-2">Urocultura positiva sem sintomas urinários. Em geral não tratar, exceto grupos específicos.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'Sintomas compatíveis com cistite', nextStep: 'itu_cistite_complicadores', value: 'cistite' },
        { text: 'Sinais e sintomas de pielonefrite', nextStep: 'itu_pielo_sepse', value: 'pielonefrite', critical: true },
        { text: 'Bacteriúria sem sintomas urinários', nextStep: 'itu_bacteriuria_excecoes', value: 'bacteriuria_assintomatica' }
      ]
    },
    itu_bacteriuria_excecoes: {
      id: 'itu_bacteriuria_excecoes',
      title: 'Bacteriúria assintomática: há indicação de tratamento?',
      description: 'O tratamento indiscriminado aumenta eventos adversos e resistência antimicrobiana.',
      type: 'question',
      content: `
        <div class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <p><strong>Considerar tratamento/investigação direcionada somente em grupos específicos:</strong> gestação, procedimento urológico invasivo com trauma de mucosa e situações especiais definidas por infectologia/urologia, como alguns pacientes transplantados ou neutropênicos.</p>
        </div>
      `,
      options: [
        { text: 'Pertence a grupo com indicação específica', nextStep: 'itu_cistite_antibiotico', value: 'grupo_especial' },
        { text: 'Não pertence: não tratar', nextStep: 'itu_bacteriuria_nao_tratar', value: 'nao_tratar' }
      ]
    },
    itu_bacteriuria_nao_tratar: {
      id: 'itu_bacteriuria_nao_tratar',
      title: 'Bacteriúria assintomática: antibiótico não indicado',
      description: 'Evitar tratamento sem indicação clínica.',
      type: 'result',
      content: `<div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950"><strong>Conduta:</strong> não prescrever antibiótico. Investigar sintomas e diagnósticos diferenciais; orientar retorno se surgirem disúria, febre, dor lombar ou sinais sistêmicos.</div>`,
      options: []
    },
    itu_bacteriuria_grupo_especial: {
      id: 'itu_bacteriuria_grupo_especial',
      title: 'Bacteriúria em grupo especial',
      description: 'Tratamento guiado pela condição clínica e pela urocultura com TSA.',
      type: 'action',
      content: `<div class="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950"><strong>Conduta:</strong> coletar/revisar urocultura com antibiograma e seguir protocolo específico para gestação, procedimento urológico ou condição imunológica. Não extrapolar automaticamente os esquemas de cistite simples.</div>`,
      options: [
        { text: 'Seguir para seleção de antibioticoterapia', nextStep: 'itu_cistite_antibiotico', value: 'selecionar_antibiotico' }
      ]
    },
    itu_cistite_complicadores: {
      id: 'itu_cistite_complicadores',
      title: 'Cistite: excluir infecção alta ou complicada',
      description: 'Confirmar ausência de sinais sistêmicos e fatores que exigem avaliação adicional.',
      type: 'question',
      content: `
        <div class="space-y-3 text-sm">
          <div class="rounded-xl border border-red-200 bg-red-50 p-4 text-red-950"><strong>Não conduzir como cistite simples</strong> se houver febre/calafrios, dor lombar ou em flanco, vômitos persistentes, sepse, obstrução, gestação, imunossupressão relevante, transplante, insuficiência renal importante ou sexo masculino com suspeita de acometimento prostático.</div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">Na mulher adulta não gestante com sintomas típicos e sem complicadores, o diagnóstico pode ser clínico. Leucocitúria isolada não confirma ITU, e nitrito positivo sem sintomas não define infecção.</div>
        </div>
      `,
      options: [
        { text: 'Sem complicadores: cistite não complicada', nextStep: 'itu_cistite_antibiotico', value: 'nao_complicada' },
        { text: 'Há febre, dor lombar ou outro complicador', nextStep: 'itu_pielo_sepse', value: 'possivel_pielonefrite', critical: true }
      ]
    },
    itu_cistite_antibiotico: {
      id: 'itu_cistite_antibiotico',
      title: 'Antibioticoterapia da cistite não complicada',
      description: 'Escolher esquema conforme alergias, função renal, gestação, interações e resistência local.',
      type: 'question',
      content: `
        <div class="space-y-3 text-sm">
          <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950"><strong>Primeiras opções:</strong> fosfomicina ou nitrofurantoína. Não utilizar nenhuma delas para pielonefrite, pois não atingem concentração adequada no parênquima renal.</div>
          <div class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950"><strong>Atenção:</strong> sulfametoxazol-trimetoprim empírico depende do perfil local de sensibilidade e não deve ser escolhido quando houver resistência conhecida, uso recente ou contraindicação.</div>
        </div>
      `,
      options: [
        { text: 'Fosfomicina trometamol 3 g VO, dose única', nextStep: 'itu_cistite_fosfomicina', value: 'fosfomicina' },
        { text: 'Nitrofurantoína 100 mg VO 6/6h por 5 dias', nextStep: 'itu_cistite_nitrofurantoina', value: 'nitrofurantoina' },
        { text: 'Cefuroxima 250 mg VO 12/12h por 5 dias', nextStep: 'itu_cistite_cefuroxima', value: 'cefuroxima' },
        { text: 'Sulfametoxazol-trimetoprim 800/160 mg VO 12/12h por 3 dias', nextStep: 'itu_cistite_sulfametoxazol', value: 'sulfametoxazol_trimetoprim' }
      ]
    },
    itu_cistite_fosfomicina: {
      id: 'itu_cistite_fosfomicina', title: 'Cistite: prescrição e alta', description: 'Fosfomicina em dose única.', type: 'result', generatesPrescription: true,
      content: `<div class="space-y-3 text-sm"><div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4"><strong>Fosfomicina trometamol 3 g:</strong> dissolver 1 envelope em água e tomar VO em dose única.</div><div class="rounded-xl border border-slate-200 bg-white p-4"><strong>Sintomáticos:</strong> considerar fenazopiridina 200 mg VO 8/8h por no máximo 2 dias e dipirona 1 g ou paracetamol 500 mg VO 6/6h se dor/febre, conforme contraindicações.</div><p>Orientar hidratação habitual, não reter urina, completar o esquema prescrito e retornar se febre, dor lombar, vômitos, piora ou ausência de melhora em 48 horas.</p></div>`, options: []
    },
    itu_cistite_nitrofurantoina: {
      id: 'itu_cistite_nitrofurantoina', title: 'Cistite: prescrição e alta', description: 'Nitrofurantoína por 5 dias.', type: 'result', generatesPrescription: true,
      content: `<div class="space-y-3 text-sm"><div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4"><strong>Nitrofurantoína 100 mg:</strong> tomar 1 cápsula VO de 6/6 horas por 5 dias, conforme apresentação padronizada no serviço.</div><p>Não usar para pielonefrite. Revisar função renal, gestação próxima do termo, deficiência de G6PD, alergias e protocolo local. Retornar se febre, dor lombar, vômitos ou ausência de melhora em 48 horas.</p></div>`, options: []
    },
    itu_cistite_cefuroxima: {
      id: 'itu_cistite_cefuroxima', title: 'Cistite: prescrição e alta', description: 'Cefuroxima como alternativa.', type: 'result', generatesPrescription: true,
      content: `<div class="space-y-3 text-sm"><div class="rounded-xl border border-blue-200 bg-blue-50 p-4"><strong>Cefuroxima 250 mg:</strong> tomar 1 comprimido VO de 12/12 horas por 5 dias.</div><p>Ajustar à função renal, alergias e cultura quando disponível. Retornar se febre, dor lombar, vômitos ou ausência de melhora em 48 horas.</p></div>`, options: []
    },
    itu_cistite_sulfametoxazol: {
      id: 'itu_cistite_sulfametoxazol', title: 'Cistite: prescrição e alta', description: 'Sulfametoxazol-trimetoprim quando sensibilidade for provável.', type: 'result', generatesPrescription: true,
      content: `<div class="space-y-3 text-sm"><div class="rounded-xl border border-amber-200 bg-amber-50 p-4"><strong>Sulfametoxazol-trimetoprim 800/160 mg:</strong> tomar 1 comprimido VO de 12/12 horas por 3 dias.</div><p>Evitar quando a resistência local for elevada, houver uso recente, gestação, alergia a sulfa ou interação relevante. Ajustar à função renal.</p></div>`, options: []
    },
    itu_pielo_sepse: {
      id: 'itu_pielo_sepse', title: 'Pielonefrite: sinais clínicos de sepse?', description: 'Identificar instabilidade antes de prosseguir à investigação habitual.', type: 'question', critical: true,
      content: `<div class="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-950"><strong>Avaliar:</strong> hipotensão, alteração do nível de consciência, hipoperfusão, lactato elevado, oligúria, taquipneia, hipoxemia, choque ou disfunção orgânica. Não atrasar estabilização para completar o restante do fluxo.</div>`,
      options: [
        { text: 'Sim: suspeita de sepse/instabilidade', nextStep: 'itu_estabilizacao_sepse', value: 'sepse', critical: true, requiresImmediateAction: true },
        { text: 'Não: paciente estável', nextStep: 'itu_exames_pielonefrite', value: 'sem_sepse' }
      ]
    },
    itu_estabilizacao_sepse: {
      id: 'itu_estabilizacao_sepse', title: 'Estabilização clínica imediata', description: 'Seguir protocolo institucional de sepse e garantir controle do foco urinário.', type: 'action', critical: true, timeSensitive: true,
      content: `<div class="space-y-3 text-sm"><div class="rounded-xl border border-red-300 bg-red-100 p-4 text-red-950"><strong>Prioridade:</strong> monitorização contínua, acessos venosos, lactato, culturas quando não atrasarem, antibioticoterapia EV precoce, reposição volêmica individualizada e vasopressor se choque persistente.</div><div class="rounded-xl border border-amber-200 bg-amber-50 p-4"><strong>Controle do foco:</strong> pesquisar obstrução urinária, cálculo infectado, abscesso ou necessidade de drenagem; acionar urologia com urgência quando houver obstrução associada à infecção.</div></div>`,
      options: [{ text: 'Estabilização iniciada e internação solicitada', nextStep: 'itu_cuidados_aguarda_internacao', value: 'sepse_estabilizada', critical: true }]
    },
    itu_cuidados_aguarda_internacao: {
      id: 'itu_cuidados_aguarda_internacao',
      title: 'Cuidados enquanto aguarda internação',
      description: 'Manter o manejo da sepse urinária e o controle do foco até a transferência para unidade compatível com a gravidade.',
      type: 'action',
      critical: true,
      timeSensitive: true,
      content: `
        <div class="space-y-4 text-sm">
          <div class="rounded-xl border border-sky-200 bg-sky-50 p-4">
            <h4 class="font-bold text-sky-950">Cuidados do paciente com sepse urinária enquanto aguarda internação</h4>
            <p class="mt-2">Após iniciada a estabilização e solicitada a internação, o paciente deve permanecer monitorizado e receber tratamento contínuo enquanto aguarda disponibilidade de leito.</p>
          </div>

          <div class="grid gap-4 lg:grid-cols-2">
            <div class="rounded-xl border border-slate-200 bg-white p-4">
              <h5 class="font-bold text-slate-950">Monitorização e reavaliação contínuas</h5>
              <ul class="mt-2 list-disc space-y-1 pl-5">
                <li>Pressão arterial, frequência cardíaca, frequência respiratória, SpO2 e temperatura.</li>
                <li>Nível de consciência, perfusão periférica e sinais de disfunção orgânica.</li>
                <li>Balanço hídrico rigoroso e controle da diurese.</li>
                <li>Reavaliar a cada 30 minutos a 1 hora, ou imediatamente se houver piora.</li>
              </ul>
            </div>

            <div class="rounded-xl border border-rose-200 bg-rose-50 p-4">
              <h5 class="font-bold text-rose-950">Antibioticoterapia EV precoce</h5>
              <p class="mt-2">Administrar antimicrobiano empírico EV o mais precocemente possível, conforme gravidade, função renal, alergias e perfil local de resistência.</p>
              <p class="mt-2">Coletar culturas antes do antibiótico quando isso não atrasar o tratamento. Não aguardar os resultados para iniciar a terapia e ajustar ou descalonar conforme o TSA.</p>
            </div>

            <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <h5 class="font-bold text-emerald-950">Suporte hemodinâmico</h5>
              <ul class="mt-2 list-disc space-y-1 pl-5">
                <li>Dosar e acompanhar lactato conforme a evolução clínica.</li>
                <li>Realizar reposição com cristaloide de forma individualizada, com reavaliação de perfusão, responsividade e congestão.</li>
                <li>Se o choque persistir, iniciar vasopressor conforme protocolo institucional, preferencialmente norepinefrina.</li>
              </ul>
            </div>

            <div class="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h5 class="font-bold text-amber-950">Controle urgente do foco urinário</h5>
              <ul class="mt-2 list-disc space-y-1 pl-5">
                <li>Pesquisar obstrução urinária, cálculo infectado, pionefrose ou abscesso.</li>
                <li>Providenciar ultrassonografia ou tomografia conforme estabilidade e disponibilidade.</li>
                <li>Acionar urologia com urgência diante de obstrução associada à infecção e não atrasar drenagem quando indicada.</li>
              </ul>
            </div>

            <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <h5 class="font-bold text-blue-950">Culturas e acompanhamento laboratorial</h5>
              <ul class="mt-2 list-disc space-y-1 pl-5">
                <li>Urocultura com TSA e dois pares de hemoculturas, preferencialmente antes do antimicrobiano.</li>
                <li>Acompanhar hemograma, função renal, eletrólitos e gasometria conforme gravidade.</li>
                <li>Repetir lactato e demais exames de acordo com a resposta clínica.</li>
              </ul>
            </div>

            <div class="rounded-xl border border-violet-200 bg-violet-50 p-4">
              <h5 class="font-bold text-violet-950">Suporte clínico e prevenção de complicações</h5>
              <ul class="mt-2 list-disc space-y-1 pl-5">
                <li>Ofertar oxigênio se houver hipoxemia e escalar o suporte respiratório quando necessário.</li>
                <li>Controlar febre, dor, náuseas e glicemia, respeitando contraindicações.</li>
                <li>Instituir profilaxia para tromboembolismo venoso e prevenção de lesão por pressão quando indicadas.</li>
              </ul>
            </div>
          </div>

          <div class="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <h5 class="font-bold text-orange-950">Reavaliação e escalonamento</h5>
            <p class="mt-2">Na presença de hipotensão persistente, lactato crescente, oligúria, hipoxemia, alteração do nível de consciência ou nova disfunção orgânica, escalar imediatamente o suporte e reavaliar necessidade de UTI.</p>
          </div>

          <div class="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <h5 class="font-bold text-amber-950">Mensagem prática para o protocolo</h5>
            <p class="mt-2">Manter monitorização, antimicrobiano EV, suporte hemodinâmico, controle de diurese e investigação ou tratamento do foco urinário até a transferência efetiva.</p>
          </div>
        </div>
      `,
      options: [{ text: 'Cuidados mantidos: finalizar encaminhamento para internação', nextStep: 'itu_sepse_encaminhada', value: 'cuidados_sepse_urinaria_aplicados', critical: true, requiresImmediateAction: true }]
    },
    itu_sepse_encaminhada: {
      id: 'itu_sepse_encaminhada', title: 'Sepse urinária: manejo hospitalar', description: 'Paciente encaminhado para internação após início da estabilização.', type: 'result', critical: true,
      content: `<div class="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-950">Manter monitorização, antimicrobiano EV, reavaliação hemodinâmica, controle de diurese e investigação de obstrução até transferência efetiva para unidade compatível com a gravidade.</div>`, options: []
    },
    itu_exames_pielonefrite: {
      id: 'itu_exames_pielonefrite', title: 'Investigação inicial da pielonefrite', description: 'Coletar exames sem atrasar o antibiótico quando houver gravidade.', type: 'action', critical: true,
      content: `<div class="grid gap-3 md:grid-cols-2 text-sm"><div class="rounded-xl border border-blue-200 bg-blue-50 p-4"><h4 class="font-bold text-blue-950">Solicitar</h4><ul class="mt-2 list-disc space-y-1 pl-5"><li>EAS.</li><li>Urocultura com TSA, preferencialmente antes do antibiótico.</li><li>Hemograma.</li><li>Ureia, creatinina e eletrólitos.</li><li>Hemoculturas se internação, sepse ou quadro grave.</li></ul></div><div class="rounded-xl border border-violet-200 bg-violet-50 p-4"><h4 class="font-bold text-violet-950">Imagem quando indicada</h4><p class="mt-2">Considerar ultrassom ou TC diante de obstrução, cálculo, insuficiência renal, recorrência, imunossupressão, evolução desfavorável ou dúvida diagnóstica.</p></div></div>`,
      options: [{ text: 'Exames solicitados: avaliar necessidade de internação', nextStep: 'itu_criterios_internacao', value: 'exames_solicitados' }]
    },
    itu_criterios_internacao: {
      id: 'itu_criterios_internacao', title: 'Há indicação de internação?', description: 'Decisão clínica individual, sem escore único validado.', type: 'question', critical: true,
      content: `<div class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><ul class="grid list-disc gap-x-6 gap-y-1 pl-5 md:grid-cols-2"><li>Obstrução do trato urinário.</li><li>Sepse ou instabilidade.</li><li>Gestação.</li><li>Vulnerabilidade social.</li><li>Sintomas refratários ou intolerância oral.</li><li>Alto risco de organismo multirresistente.</li><li>Comorbidades significativas ou imunossupressão.</li><li>Falha do tratamento ambulatorial.</li></ul></div>`,
      options: [
        { text: 'Sim: tratamento hospitalar', nextStep: 'itu_antibiotico_hospitalar', value: 'internar', critical: true },
        { text: 'Não: tratamento ambulatorial', nextStep: 'itu_antibiotico_ambulatorial', value: 'ambulatorial' }
      ]
    },
    itu_antibiotico_ambulatorial: {
      id: 'itu_antibiotico_ambulatorial', title: 'Pielonefrite: tratamento ambulatorial', description: 'Selecionar esquema e programar reavaliação em 48–72 horas.', type: 'question', critical: true,
      content: `<div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950"><p>Considerar primeira dose de antibiótico parenteral no pronto-socorro quando indicado pela resistência local ou perfil clínico. Garantir tolerância oral, seguimento e acesso a retorno.</p><p class="mt-2"><strong>Não utilizar nitrofurantoína ou fosfomicina para pielonefrite.</strong></p></div>`,
      options: [
        { text: 'Ciprofloxacino 500 mg VO 12/12h por 7 dias', nextStep: 'itu_reavaliacao_ambulatorial', value: 'ciprofloxacino_vo' },
        { text: 'Levofloxacino 750 mg VO 1x/dia por 5 dias', nextStep: 'itu_reavaliacao_ambulatorial', value: 'levofloxacino_vo' },
        { text: 'Amoxicilina-clavulanato 875/125 mg VO 12/12h por 7 dias', nextStep: 'itu_reavaliacao_ambulatorial', value: 'amoxicilina_clavulanato_vo' }
      ]
    },
    itu_reavaliacao_ambulatorial: {
      id: 'itu_reavaliacao_ambulatorial', title: 'Reavaliação em 48–72 horas', description: 'Revisar resposta clínica e resultado da urocultura/TSA.', type: 'question',
      content: `<div class="rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-950"><p><strong>Verificar:</strong> febre, dor lombar, vômitos, hidratação, sinais vitais, tolerância oral e resultado da urocultura. Ajustar ou descalonar o antibiótico conforme TSA.</p></div>`,
      options: [
        { text: 'Melhora clínica: concluir tratamento ambulatorial', nextStep: 'itu_ambulatorial_concluido', value: 'melhora' },
        { text: 'Sem melhora ou piora: internar', nextStep: 'itu_antibiotico_hospitalar', value: 'falha_ambulatorial', critical: true }
      ]
    },
    itu_ambulatorial_concluido: {
      id: 'itu_ambulatorial_concluido', title: 'Tratamento ambulatorial mantido', description: 'Boa resposta clínica em 48–72 horas.', type: 'result',
      content: `<div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">Completar o antibiótico prescrito, revisar urocultura/TSA e ajustar se necessário. Não são necessários exames de controle rotineiros em paciente assintomático, salvo condição clínica específica.</div>`, options: []
    },
    itu_antibiotico_hospitalar: {
      id: 'itu_antibiotico_hospitalar', title: 'Pielonefrite: tratamento hospitalar', description: 'Internar, iniciar antibiótico empírico e guiar pelo TSA.', type: 'question', critical: true,
      content: `<div class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-950"><p>Manter internação, hidratação e sintomáticos conforme necessidade. Revisar culturas e função renal. Pesquisar obstrução/abscesso e solicitar avaliação urológica quando indicada.</p></div>`,
      options: [
        { text: 'Ceftriaxona 1 g EV 1x/dia', nextStep: 'itu_cuidados_aguarda_enfermaria', value: 'ceftriaxona_ev' },
        { text: 'Ciprofloxacino 400 mg EV 12/12h', nextStep: 'itu_cuidados_aguarda_enfermaria', value: 'ciprofloxacino_ev' },
        { text: 'Piperacilina-tazobactam 4,5 g EV 6/6h', nextStep: 'itu_cuidados_aguarda_enfermaria', value: 'piperacilina_tazobactam' },
        { text: 'Meropenem 1 g EV 8/8h para quadro grave/alto risco MDR', nextStep: 'itu_cuidados_aguarda_enfermaria', value: 'meropenem', critical: true }
      ]
    },
    itu_cuidados_aguarda_enfermaria: {
      id: 'itu_cuidados_aguarda_enfermaria',
      title: 'Cuidados enquanto aguarda leito de enfermaria',
      description: 'Manter antibioticoterapia, monitorização e suporte clínico até a transferência para a enfermaria.',
      type: 'action',
      critical: true,
      group: 'Enfermaria',
      content: `
        <div class="space-y-4 text-sm">
          <div class="rounded-xl border border-sky-200 bg-sky-50 p-4">
            <h4 class="font-bold text-sky-950">Cuidados do paciente com pielonefrite enquanto aguarda leito de enfermaria</h4>
            <p class="mt-2">Após definida a necessidade de internação e selecionado o antimicrobiano, o paciente deve permanecer em observação, receber o tratamento prescrito e ser reavaliado até a transferência efetiva.</p>
          </div>

          <div class="grid gap-4 lg:grid-cols-2">
            <div class="rounded-xl border border-slate-200 bg-white p-4">
              <h5 class="font-bold text-slate-950">Monitorização clínica</h5>
              <ul class="mt-2 list-disc space-y-1 pl-5">
                <li>Acompanhar pressão arterial, frequência cardíaca, frequência respiratória, SpO2 e temperatura.</li>
                <li>Reavaliar dor lombar, náuseas, vômitos, nível de consciência e perfusão periférica.</li>
                <li>Manter balanço hídrico e controle da diurese.</li>
                <li>Reavaliar periodicamente ou imediatamente se houver piora clínica.</li>
              </ul>
            </div>

            <div class="rounded-xl border border-rose-200 bg-rose-50 p-4">
              <h5 class="font-bold text-rose-950">Antibioticoterapia hospitalar</h5>
              <p class="mt-2">Administrar o antimicrobiano selecionado nos horários prescritos, sem atrasar o início do tratamento.</p>
              <p class="mt-2">Revisar urocultura, hemoculturas quando coletadas e TSA; ajustar ou descalonar o esquema conforme sensibilidade, resposta clínica e função renal.</p>
            </div>

            <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <h5 class="font-bold text-emerald-950">Hidratação e controle de sintomas</h5>
              <ul class="mt-2 list-disc space-y-1 pl-5">
                <li>Realizar hidratação individualizada conforme estado volêmico, função renal e comorbidades.</li>
                <li>Evitar sobrecarga hídrica e acompanhar creatinina e eletrólitos.</li>
                <li>Tratar febre, dor, náuseas e vômitos conforme necessidade e contraindicações.</li>
                <li>Manter alimentação e hidratação oral quando toleradas.</li>
              </ul>
            </div>

            <div class="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h5 class="font-bold text-amber-950">Pesquisa e controle de complicações</h5>
              <ul class="mt-2 list-disc space-y-1 pl-5">
                <li>Investigar obstrução, cálculo infectado ou abscesso diante de suspeita clínica ou evolução desfavorável.</li>
                <li>Solicitar ultrassonografia ou tomografia conforme indicação e disponibilidade.</li>
                <li>Acionar urologia com urgência se houver obstrução associada à infecção ou necessidade de drenagem.</li>
              </ul>
            </div>

            <div class="rounded-xl border border-violet-200 bg-violet-50 p-4">
              <h5 class="font-bold text-violet-950">Prevenção de complicações da internação</h5>
              <ul class="mt-2 list-disc space-y-1 pl-5">
                <li>Instituir profilaxia para tromboembolismo venoso quando indicada e sem contraindicação.</li>
                <li>Prevenir lesão por pressão e estimular mobilização segura quando possível.</li>
                <li>Revisar acessos, alergias, interações medicamentosas e necessidade de ajuste renal.</li>
              </ul>
            </div>

            <div class="rounded-xl border border-orange-200 bg-orange-50 p-4">
              <h5 class="font-bold text-orange-950">Vigilância para deterioração</h5>
              <p class="mt-2">Reavaliar imediatamente diante de hipotensão, taquipneia, hipoxemia, confusão, oligúria, piora da dor, febre persistente ou sinais de hipoperfusão.</p>
              <p class="mt-2 font-semibold">Se houver suspeita de sepse ou nova disfunção orgânica, iniciar protocolo de estabilização e reavaliar necessidade de unidade de maior complexidade.</p>
            </div>
          </div>

          <div class="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
            <h5 class="font-bold text-cyan-950">Mensagem prática para o protocolo</h5>
            <p class="mt-2">Manter o paciente monitorizado, com antibioticoterapia EV, hidratação individualizada, controle de sintomas e investigação de complicações até a admissão na enfermaria.</p>
          </div>
        </div>
      `,
      options: [
        {
          text: 'Confirmar cuidados e seguir para reavaliação hospitalar',
          description: 'Registra os cuidados mantidos enquanto aguarda leito de enfermaria.',
          nextStep: 'itu_criterios_alta',
          value: 'cuidados_aguarda_enfermaria_aplicados',
          critical: true
        }
      ]
    },
    itu_criterios_alta: {
      id: 'itu_criterios_alta', title: 'Critérios de alta hospitalar', description: 'Confirmar estabilidade antes da transição para tratamento oral.', type: 'question',
      content: `<div class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><ul class="list-disc space-y-1 pl-5"><li>Bom estado geral e sinais vitais estáveis.</li><li>Afebril há pelo menos 48 horas.</li><li>Capaz de hidratar-se e alimentar-se por via oral.</li><li>Possibilidade de antibiótico oral ambulatorial guiado pelo TSA.</li><li>Obstrução e complicações controladas ou afastadas.</li></ul></div>`,
      options: [
        { text: 'Critérios preenchidos: alta hospitalar', nextStep: 'itu_alta_hospitalar', value: 'alta' },
        { text: 'Critérios não preenchidos: manter internação', nextStep: 'itu_manutencao_hospitalar', value: 'manter_internacao', critical: true }
      ]
    },
    itu_manutencao_hospitalar: {
      id: 'itu_manutencao_hospitalar', title: 'Manter tratamento e monitorização hospitalar', description: 'Reavaliar resposta, culturas, função renal e complicações.', type: 'action', critical: true,
      content: `<div class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-950">Manter antibiótico EV ajustado à função renal e TSA, hidratação individualizada, controle de sintomas e sinais vitais. Se persistirem febre ou dor após 48–72 horas, investigar obstrução, abscesso, resistência, foco alternativo ou necessidade de intervenção urológica.</div>`,
      options: [{ text: 'Reavaliar critérios de alta', nextStep: 'itu_criterios_alta', value: 'reavaliar' }]
    },
    itu_alta_hospitalar: {
      id: 'itu_alta_hospitalar', title: 'Alta hospitalar segura', description: 'Transição para via oral e seguimento.', type: 'result',
      content: `<div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">Completar antibioticoterapia oral conforme urocultura/TSA, função renal e evolução clínica. Orientar retorno diante de febre, dor lombar, vômitos, redução da diurese, hipotensão, confusão ou piora geral.</div>`, options: []
    }
  }
}

// Fluxograma de profilaxia pós-exposição da raiva humana
export const atendimentoAntirrabicoFlowchart: EmergencyFlowchart = {
  id: 'atendimento_antirrabico',
  name: 'Mordedura',
  description: 'Avaliação da exposição, espécie animal, possibilidade de observação e indicação de vacina e soro antirrábico.',
  category: 'infectious',
  priority: 'high',
  icon: 'shield',
  color: 'from-blue-700 to-indigo-900',
  initialStep: 'raiva_cuidados_iniciais',
  finalSteps: ['raiva_sem_profilaxia', 'raiva_vacina', 'raiva_vacina_soro'],
  steps: {
    raiva_cuidados_iniciais: {
      id: 'raiva_cuidados_iniciais',
      title: 'Atendimento inicial da exposição',
      description: 'Realizar os cuidados locais imediatamente, antes de classificar a exposição.',
      type: 'action',
      content: `
        <div class="space-y-4 text-sm leading-relaxed">
          <div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p class="font-bold text-blue-950">Medidas obrigatórias</p>
            <ul class="mt-2 list-disc space-y-1 pl-5 text-blue-950">
              <li>Lavar imediatamente e de forma abundante o ferimento com água corrente e sabão.</li>
              <li>Evitar sutura; se indispensável, aproximar as bordas com pontos isolados após limpeza e infiltração do soro, quando indicado.</li>
              <li>Avaliar profilaxia do tétano e necessidade de antibioticoterapia conforme tipo de lesão.</li>
              <li>Registrar a exposição no SINAN e iniciar a profilaxia indicada o mais precocemente possível.</li>
            </ul>
          </div>
          <p class="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-950"><strong>Atenção:</strong> a decisão deve considerar espécie, tipo de contato, local e profundidade da lesão, condições do animal e tratamentos antirrábicos prévios.</p>
        </div>
      `,
      options: [
        { text: 'Cuidados iniciais realizados', nextStep: 'raiva_tipo_contato', value: 'cuidados_realizados' }
      ]
    },
    raiva_tipo_contato: {
      id: 'raiva_tipo_contato',
      title: 'Tipo de contato',
      description: 'Determine se houve exposição capaz de transmitir o vírus da raiva.',
      type: 'question',
      content: `
        <div class="grid gap-3 md:grid-cols-2 text-sm">
          <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <p class="font-bold text-emerald-950">Contato indireto</p>
            <p class="mt-1 text-emerald-900">Tocar ou alimentar animais; lambedura em pele íntegra; contato de pele íntegra com secreções ou excreções.</p>
          </div>
          <div class="rounded-lg border border-red-200 bg-red-50 p-4">
            <p class="font-bold text-red-950">Contato direto</p>
            <p class="mt-1 text-red-900">Mordedura, arranhadura, lambedura de pele lesada ou mucosa, ou contato de secreção com solução de continuidade.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'Contato indireto', nextStep: 'raiva_indireto_morcego', value: 'contato_indireto' },
        { text: 'Contato direto ou exposição duvidosa', nextStep: 'raiva_especie', value: 'contato_direto' }
      ]
    },
    raiva_indireto_morcego: {
      id: 'raiva_indireto_morcego',
      title: 'Contato indireto com morcego?',
      description: 'Contato com morcegos exige abordagem específica devido ao risco de exposição não percebida.',
      type: 'question',
      options: [
        { text: 'Sim, envolveu morcego', nextStep: 'raiva_vacina_soro', value: 'morcego' },
        { text: 'Não, envolveu outro animal', nextStep: 'raiva_sem_profilaxia', value: 'outro_animal' }
      ]
    },
    raiva_especie: {
      id: 'raiva_especie',
      title: 'Animal envolvido no acidente',
      description: 'Selecione a espécie ou o grupo epidemiológico do animal agressor.',
      type: 'question',
      options: [
        { text: 'Cão ou gato', description: 'Prosseguir conforme possibilidade de observação por 10 dias.', nextStep: 'raiva_cao_gato_observavel', value: 'cao_gato' },
        { text: 'Mamífero doméstico de interesse econômico', description: 'Bovinos, suínos, equídeos, caprinos ou ovinos.', nextStep: 'raiva_gravidade', value: 'mamifero_domestico' },
        { text: 'Animal silvestre', description: 'Morcego, raposa, macaco, sagui ou outro mamífero silvestre.', nextStep: 'raiva_vacina_soro', value: 'animal_silvestre' }
      ]
    },
    raiva_cao_gato_observavel: {
      id: 'raiva_cao_gato_observavel',
      title: 'Condição do cão ou gato',
      description: 'Avalie se o animal está sem sinais sugestivos de raiva e pode ser observado por 10 dias.',
      type: 'question',
      options: [
        { text: 'Passível de observação e sem sinais de raiva', nextStep: 'raiva_observacao_10_dias', value: 'observavel_sadio' },
        { text: 'Não observável ou com sinais sugestivos de raiva', nextStep: 'raiva_gravidade', value: 'nao_observavel_ou_suspeito', critical: true }
      ]
    },
    raiva_observacao_10_dias: {
      id: 'raiva_observacao_10_dias',
      title: 'Observação do animal por 10 dias',
      description: 'Manter lavagem local e acompanhar o animal durante todo o período.',
      type: 'question',
      content: `
        <div class="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
          <p>Orientar observação por <strong>10 dias</strong>, contados a partir da data da agressão. Se o animal desaparecer, morrer ou apresentar sinais neurológicos/sugestivos de raiva, reavaliar imediatamente e iniciar a profilaxia indicada.</p>
        </div>
      `,
      options: [
        { text: 'Animal permaneceu vivo e saudável por 10 dias', nextStep: 'raiva_sem_profilaxia', value: 'vivo_saudavel' },
        { text: 'Animal sumiu, morreu ou apresentou sinais de raiva', nextStep: 'raiva_gravidade', value: 'evolucao_suspeita', critical: true }
      ]
    },
    raiva_gravidade: {
      id: 'raiva_gravidade',
      title: 'Classificação do acidente',
      description: 'Classifique a exposição como leve ou grave conforme local, extensão e profundidade.',
      type: 'question',
      content: `
        <div class="grid gap-3 md:grid-cols-2 text-sm">
          <div class="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-950">
            <p class="font-bold">Acidente leve</p>
            <ul class="mt-2 list-disc space-y-1 pl-5">
              <li>Mordedura ou arranhadura superficial no tronco ou membros, exceto mãos e pés.</li>
              <li>Lambedura de lesões superficiais.</li>
            </ul>
          </div>
          <div class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-950">
            <p class="font-bold">Acidente grave</p>
            <ul class="mt-2 list-disc space-y-1 pl-5">
              <li>Lesão em mucosa, segmento cefálico, mãos ou pés.</li>
              <li>Lesões múltiplas, extensas, profundas ou puntiformes.</li>
              <li>Lambedura de mucosa ou de lesão profunda.</li>
            </ul>
          </div>
        </div>
      `,
      options: [
        { text: 'Acidente leve', nextStep: 'raiva_vacina', value: 'leve' },
        { text: 'Acidente grave', nextStep: 'raiva_vacina_soro', value: 'grave', critical: true }
      ]
    },
    raiva_sem_profilaxia: {
      id: 'raiva_sem_profilaxia',
      title: 'Profilaxia antirrábica não indicada',
      description: 'Encerrar a avaliação sem vacina ou soro antirrábico neste momento.',
      type: 'result',
      content: `
        <div class="space-y-3 text-sm">
          <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
            <p class="font-bold">Conduta</p>
            <p class="mt-1">Manter cuidados locais, profilaxia antitetânica quando indicada e registro da avaliação. Orientar retorno imediato se houver mudança na condição do animal ou nova informação epidemiológica.</p>
          </div>
        </div>
      `,
      options: []
    },
    raiva_vacina: {
      id: 'raiva_vacina',
      title: 'Profilaxia indicada: vacina antirrábica',
      description: 'Acidente leve com indicação de profilaxia pós-exposição.',
      type: 'result',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-950">
            <p class="font-bold">Esquema vacinal pós-exposição</p>
            <p class="mt-1">Aplicar vacina antirrábica nos dias <strong>0, 3, 7 e 14</strong>, por via intramuscular, conforme apresentação e protocolo do serviço.</p>
          </div>
          <ul class="list-disc space-y-1 pl-5">
            <li>Dia 0: primeira dose no atendimento.</li>
            <li>Agendar e registrar as doses dos dias 3, 7 e 14.</li>
            <li>Não aplicar na região glútea.</li>
            <li>Reavaliar esquema em imunossuprimidos e em pessoas previamente vacinadas.</li>
          </ul>
        </div>
      `,
      options: []
    },
    raiva_vacina_soro: {
      id: 'raiva_vacina_soro',
      title: 'Profilaxia indicada: vacina e soro antirrábico',
      description: 'Exposição grave, contato com morcego ou animal silvestre.',
      type: 'result',
      critical: true,
      content: `
        <div class="space-y-4 text-sm">
          <div class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-950">
            <p class="font-bold">Vacina antirrábica</p>
            <p class="mt-1">Aplicar nos dias <strong>0, 3, 7 e 14</strong>. Não aguardar confirmação laboratorial do animal para iniciar quando a profilaxia estiver indicada.</p>
          </div>
          <div class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950">
            <p class="font-bold">Soro ou imunoglobulina antirrábica</p>
            <ul class="mt-2 list-disc space-y-1 pl-5">
              <li><strong>SAR:</strong> 40 UI/kg.</li>
              <li><strong>IGHAR:</strong> 20 UI/kg.</li>
              <li>Infiltrar o máximo possível ao redor e no interior de todas as lesões; aplicar eventual volume restante por via IM, em local diferente da vacina.</li>
              <li>Preferencialmente no dia 0; se indisponível, pode ser administrado até o 7º dia após a primeira dose da vacina.</li>
            </ul>
          </div>
          <p class="rounded-lg border border-slate-200 bg-slate-50 p-3 text-slate-800"><strong>Conferir antes da aplicação:</strong> peso, tratamento antirrábico prévio, imunossupressão, disponibilidade do produto e protocolo institucional vigente.</p>
        </div>
      `,
      options: []
    }
  }
}

export const hypertensionFlowchart: EmergencyFlowchart = {
  id: 'hipertensao',
  name: 'Crise Hipertensiva',
  description: 'Classificação de elevação pressórica, pesquisa de lesão aguda e metas individualizadas',
  category: 'cardiovascular',
  priority: 'high',
  icon: 'heart',
  color: 'from-red-700 to-blue-700',
  initialStep: 'hipertensao_confirmacao',
  finalSteps: ['hipertensao_emergencia_plano', 'hipertensao_alta_sem_loa', 'hipertensao_cronica_alta'],
  steps: {
    hipertensao_confirmacao: { id: 'hipertensao_confirmacao', title: 'Confirmar pressão e sintomas', description: 'Repetir a aferição com técnica correta e registrar sintomas.', type: 'question', options: [{ text: 'Preenche ponto de entrada', nextStep: 'hipertensao_lesao_orgao', value: 'crise' }, { text: 'Fora do ponto de entrada', nextStep: 'hipertensao_cronica_alta', value: 'cronica' }] },
    hipertensao_lesao_orgao: { id: 'hipertensao_lesao_orgao', title: 'Pesquisar lesão aguda', description: 'Diferenciar emergência de elevação importante sem dano progressivo.', type: 'question', critical: true, options: [{ text: 'Lesão aguda presente', nextStep: 'hipertensao_emergencia_preparo', value: 'emergencia', critical: true }, { text: 'Sem lesão aguda', nextStep: 'hipertensao_observacao', value: 'sem_loa' }] },
    hipertensao_observacao: { id: 'hipertensao_observacao', title: 'Repouso e reavaliação', description: 'Observar em ambiente calmo e repetir pressão e sintomas.', type: 'action', options: [{ text: 'Reavaliar classificação', nextStep: 'hipertensao_classificacao_sem_loa', value: 'reavaliado' }] },
    hipertensao_classificacao_sem_loa: { id: 'hipertensao_classificacao_sem_loa', title: 'Elevação sem lesão ou pseudocrise', description: 'Identificar fator situacional e evitar redução brusca.', type: 'question', options: [{ text: 'Planejar alta segura', nextStep: 'hipertensao_alta_sem_loa', value: 'alta' }] },
    hipertensao_emergencia_preparo: { id: 'hipertensao_emergencia_preparo', title: 'Preparação da emergência', description: 'Monitorização, acessos, exames e CTI.', type: 'action', critical: true, timeSensitive: true, options: [{ text: 'Definir cenário', nextStep: 'hipertensao_emergencia_cenario', value: 'preparado', critical: true }] },
    hipertensao_emergencia_cenario: { id: 'hipertensao_emergencia_cenario', title: 'Lesão predominante', description: 'O órgão acometido determina meta e velocidade de redução.', type: 'question', critical: true, options: [{ text: 'Aplicar meta específica', nextStep: 'hipertensao_emergencia_plano', value: 'meta', critical: true }] },
    hipertensao_emergencia_plano: { id: 'hipertensao_emergencia_plano', title: 'Tratamento intravenoso e CTI', description: 'Titular terapia conforme o órgão-alvo e monitorar continuamente.', type: 'result', critical: true, requiresSpecialist: true, options: [] },
    hipertensao_alta_sem_loa: { id: 'hipertensao_alta_sem_loa', title: 'Alta sem lesão aguda', description: 'Ajuste gradual, tratamento da causa e reavaliação ambulatorial.', type: 'result', options: [] },
    hipertensao_cronica_alta: { id: 'hipertensao_cronica_alta', title: 'Hipertensão crônica descompensada', description: 'Revisar adesão e organizar seguimento sem redução agressiva.', type: 'result', options: [] }
  }
}

export const emergencyFlowcharts: Record<string, EmergencyFlowchart> = {
  iam: iamFlowchart,
  avc: avcFlowchart,
  hipertensao: hypertensionFlowchart,
  sepsis: sepsisFlowchart,
  dengue: dengueFlowchart,
  gasometria: gasometryFlowchart,
  asthma: asthmaFlowchart,
  diarreia: diarreiaFlowchart,
  geca: gecaFlowchart,
  spider_bite: spiderBiteFlowchart,
  tvp: tvpFlowchart,
  tep: tepFlowchart,
  dpoc_exacerbado: dpocFlowchart,
  influenza: influenzaFlowchart,
  pneumonia: pneumoniaFlowchart,
  sinusite: sinusitisFlowchart,
  faringoamigdalite: faringoamigdaliteFlowchart,
  epistaxe: epistaxeFlowchart,
  monoartrite: monoartriteFlowchart,
  crise_ansiedade: ansiedadeFlowchart,
  sindrome_vertiginosa: sindromeVertiginosaFlowchart,
  paralisia_bell: paralisiaBellFlowchart,
  cefaleia: cefaleiaFlowchart,
  agitacao_psicomotora: agitacaoPsicomotoraFlowchart,
  pep_hiv: pepHivFlowchart,
  lombalgia: lombalgiaFlowchart,
  anafilaxia: anaphylaxisFlowchart,
  appendicitis: appendicitisFlowchart,
  cholecystitis: cholecystitisFlowchart,
  cholangitis: cholangitisFlowchart,
  pancreatitis: pancreatitisFlowchart,
  itu: ituFlowchart,
  atendimento_antirrabico: atendimentoAntirrabicoFlowchart,
}

// Lista completa de todos os fluxogramas disponíveis
export const allFlowcharts = [
  // Ferramentas
  { id: 'gasometria', name: 'Gasometria', category: 'respiratory', implemented: true },

  // Hematológicos
  { id: 'anemia_hemolitica', name: 'Anemia hemolítica', category: 'hematological', implemented: false },

  // Infecciosos
  { id: 'arranhadura_gato', name: 'Arranhadura de gato', category: 'infectious', implemented: false },
  { id: 'atendimento_antirrabico', name: 'Mordedura', category: 'infectious', implemented: true },
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
  { id: 'itu', name: 'Infecção do Trato Urinário (ITU)', category: 'infectious', implemented: true },
  { id: 'meningite', name: 'Meningite', category: 'infectious', implemented: false },
  { id: 'pep_hiv', name: 'PEP ao HIV', category: 'infectious', implemented: true },
  { id: 'pneumonia', name: 'Pneumonia', category: 'infectious', implemented: true },
  { id: 'sifilis', name: 'Sífilis', category: 'infectious', implemented: false },
  { id: 'uretrite', name: 'Uretrite', category: 'infectious', implemented: false },

  // Musculoesqueléticos
  { id: 'artralgia', name: 'Artralgia', category: 'musculoskeletal', implemented: false },
  { id: 'lombalgia', name: 'Lombalgia', category: 'musculoskeletal', implemented: true },
  { id: 'mialgia', name: 'Mialgia', category: 'musculoskeletal', implemented: false },
  { id: 'monoartrite', name: 'Monoartrites Agudas', category: 'musculoskeletal', implemented: true },

  // Neurológicos
  { id: 'avc', name: 'AVC (Agudo)', category: 'neurological', implemented: true },
  { id: 'avc_hemorragico', name: 'AVC hemorrágico', category: 'neurological', implemented: false },
  { id: 'avci', name: 'AVCi', category: 'neurological', implemented: false },
  { id: 'cefaleia', name: 'Cefaleias', category: 'neurological', implemented: true },
  { id: 'crise_convulsiva', name: 'Crise convulsiva', category: 'neurological', implemented: false },
  { id: 'delirium', name: 'Delirium', category: 'neurological', implemented: false },
  { id: 'rebaixamento_consciencia', name: 'Rebaixamento do nível de consciência', category: 'neurological', implemented: false },
  { id: 'paralisia_bell', name: 'Paralisia de Bell', category: 'neurological', implemented: true },
  { id: 'sindrome_vertiginosa', name: 'Síndrome Vertiginosa Aguda', category: 'neurological', implemented: true },
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
  { id: 'tep', name: 'Tromboembolismo Pulmonar (TEP)', category: 'respiratory', implemented: true },
  { id: 'tosse', name: 'Tosse', category: 'respiratory', implemented: false },

  // Psiquiátricos
  { id: 'agitacao_psicomotora', name: 'Agitação Psicomotora', category: 'psychiatric', implemented: true },
  { id: 'crise_ansiedade', name: 'Crise de ansiedade', category: 'psychiatric', implemented: true },
  { id: 'surto_psicotico', name: 'Surto psicótico', category: 'psychiatric', implemented: false },

  // Cardiovasculares
  { id: 'derrame_pericardico', name: 'Derrame pericárdico', category: 'cardiovascular', implemented: false },
  { id: 'derrame_pleural', name: 'Derrame pleural', category: 'cardiovascular', implemented: false },
  { id: 'dor_toracica', name: 'Dor torácica', category: 'cardiovascular', implemented: false },
  { id: 'fibrilacao_atrial_estavel', name: 'Fibrilação atrial de alta resposta ventricular estável', category: 'cardiovascular', implemented: false },
  { id: 'fibrilacao_atrial_instavel', name: 'Fibrilação atrial de alta resposta ventricular instável', category: 'cardiovascular', implemented: false },
  { id: 'flutter_atrial', name: 'Flutter atrial', category: 'cardiovascular', implemented: false },
  { id: 'hipertensao', name: 'Hipertensão (Crise e Emergência Hipertensiva)', category: 'cardiovascular', implemented: true },
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
  { id: 'epistaxe', name: 'Epistaxe', category: 'otorhinolaryngological', implemented: true },
  { id: 'faringoamigdalite', name: 'Faringoamigdalites', category: 'otorhinolaryngological', implemented: true },
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
