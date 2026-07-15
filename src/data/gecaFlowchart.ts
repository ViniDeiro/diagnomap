import type { EmergencyFlowchart } from '@/types/emergency'

const referenceNote = `
  <div class="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
    Base clínica: Ministério da Saúde — Manejo do paciente com diarreia (Planos A, B e C); critérios complementares de investigação e segurança antimicrobiana alinhados à diretriz IDSA para diarreia infecciosa.
  </div>
`

export const gecaFlowchart: EmergencyFlowchart = {
  id: 'geca',
  name: 'Gastroenterite Aguda (GECA)',
  description: 'Avaliação completa da diarreia aguda, classificação da desidratação, Planos A/B/C, investigação seletiva e manejo seguro.',
  category: 'gastrointestinal',
  priority: 'high',
  icon: 'activity',
  color: 'from-amber-500 to-orange-600',
  initialStep: 'geca_inicio',
  finalSteps: [
    'geca_nao_compativel',
    'geca_alta_plano_a',
    'geca_internacao_observacao',
    'geca_transferencia_emergencia',
    'geca_investigacao_persistente',
    'geca_suspeita_stec_shu'
  ],
  steps: {
    geca_inicio: {
      id: 'geca_inicio',
      title: 'Suspeita de Gastroenterite Aguda',
      description: 'Paciente com diarreia aguda, associada ou não a náuseas, vômitos, febre ou dor abdominal.',
      type: 'question',
      content: `
        <div class="space-y-3 text-sm">
          <div class="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4">
            <p class="font-bold text-amber-950">Definição operacional</p>
            <p class="mt-1 text-amber-900">Três ou mais evacuações amolecidas ou líquidas em 24 horas, ou aumento relevante da frequência/fluidez em relação ao hábito, com duração inferior a 14 dias.</p>
          </div>
          <div class="rounded-lg border border-red-200 bg-red-50 p-3 text-red-900">
            <strong>Antes do fluxo:</strong> dor abdominal localizada intensa, defesa/rigidez, distensão importante, hematêmese, choque ou alteração neurológica exigem avaliação imediata e consideração de diagnóstico alternativo/complicação.
          </div>
          ${referenceNote}
        </div>
      `,
      options: [
        { text: 'Confirmar quadro diarreico e iniciar avaliação', nextStep: 'geca_anamnese_dirigida', value: 'quadro_compativel' },
        { text: 'Quadro não compatível com GECA', nextStep: 'geca_nao_compativel', value: 'nao_compativel' }
      ]
    },
    geca_nao_compativel: {
      id: 'geca_nao_compativel',
      title: 'GECA Não Confirmada',
      description: 'O quadro não preenche a definição clínica ou há hipótese alternativa predominante.',
      type: 'result',
      content: `
        <div class="rounded-lg border-l-4 border-slate-500 bg-slate-50 p-4 text-sm text-slate-800">
          <p class="font-bold">Reavaliar o diagnóstico diferencial</p>
          <p class="mt-1">Considerar abdome agudo, apendicite, obstrução, isquemia, doença inflamatória intestinal, intoxicação, efeito medicamentoso, endocrinopatia, infecção extraintestinal ou outra causa conforme história e exame.</p>
        </div>
      `,
      options: []
    },
    geca_anamnese_dirigida: {
      id: 'geca_anamnese_dirigida',
      title: 'Anamnese e Exame Físico Direcionados',
      description: 'Caracterizar o episódio, o risco epidemiológico e o estado de hidratação.',
      type: 'action',
      content: `
        <div class="grid gap-3 text-sm md:grid-cols-2">
          <div class="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p class="font-bold text-amber-950">História da doença atual</p>
            <ul class="mt-2 list-disc space-y-1 pl-5 text-amber-900">
              <li>Início e duração; número e volume aproximado das evacuações.</li>
              <li>Fezes aquosas ou pequeno volume; sangue, muco, melena ou pus.</li>
              <li>Febre, vômitos, sede, diurese, dor abdominal, tenesmo e tolerância oral.</li>
              <li>Alimento/água suspeitos, viagem, creche, contato doente, surto ou exposição ocupacional.</li>
              <li>Antibiótico ou internação recente; medicamentos que podem causar diarreia.</li>
              <li>Gestação, extremos de idade, imunossupressão, comorbidades e fragilidade.</li>
            </ul>
          </div>
          <div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p class="font-bold text-blue-950">Exame físico obrigatório</p>
            <ul class="mt-2 list-disc space-y-1 pl-5 text-blue-900">
              <li>Peso, temperatura, FC, PA, FR, SpO₂ e glicemia quando indicada.</li>
              <li>Estado geral e mental; olhos, lágrimas, boca/língua e sede.</li>
              <li>Pulso, perfusão, enchimento capilar, extremidades e diurese.</li>
              <li>Prega cutânea; frequência/volume das perdas observadas.</li>
              <li>Abdome: localização da dor, ruídos, distensão, defesa, rigidez e sinais peritoneais.</li>
            </ul>
          </div>
        </div>
      `,
      options: [
        { text: 'Registrar duração e padrão das fezes', nextStep: 'geca_perfil_diarreia', value: 'avaliacao_realizada' }
      ]
    },
    geca_perfil_diarreia: {
      id: 'geca_perfil_diarreia',
      title: 'Duração e Padrão da Diarreia',
      description: 'Distinguir diarreia aquosa, inflamatória/disentérica e persistente.',
      type: 'question',
      content: `
        <div class="space-y-3 text-sm">
          <div class="rounded-lg border-l-4 border-cyan-500 bg-cyan-50 p-3 text-cyan-950">
            <strong>Aquosa/não inflamatória:</strong> fezes líquidas, usualmente volumosas, sem sangue ou muco; febre ausente ou baixa, podendo haver cólicas, náuseas e vômitos.
          </div>
          <div class="rounded-lg border-l-4 border-red-500 bg-red-50 p-3 text-red-950">
            <strong>Inflamatória/disenteria:</strong> sangue e/ou muco, geralmente menor volume, febre mais alta, dor, cólica ou tenesmo. Exige avaliação de gravidade e etiologia invasiva.
          </div>
          <div class="rounded-lg border-l-4 border-violet-500 bg-violet-50 p-3 text-violet-950">
            <strong>Persistente:</strong> duração igual ou superior a 14 dias. Sai do escopo de GECA simples e requer investigação dirigida, sem deixar de tratar a desidratação primeiro.
          </div>
        </div>
      `,
      options: [
        { text: 'Aguda aquosa, sem sangue ou muco', nextStep: 'geca_sinais_alarme', value: 'aguda_aquosa' },
        { text: 'Aguda com sangue e/ou muco', nextStep: 'geca_sinais_alarme', value: 'aguda_inflamatoria_disenteria', critical: true },
        { text: 'Persistente (14 dias ou mais)', nextStep: 'geca_sinais_alarme', value: 'persistente_14_dias' }
      ]
    },
    geca_sinais_alarme: {
      id: 'geca_sinais_alarme',
      title: 'Há Sinal de Alarme Imediato?',
      description: 'Reconhecer instabilidade, abdome agudo, sepse ou incapacidade de hidratação oral.',
      type: 'question',
      critical: true,
      content: `
        <div class="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-950">
          <p class="font-bold">Considere sinal de alarme se houver qualquer um:</p>
          <ul class="mt-2 list-disc space-y-1 pl-5">
            <li>Hipotensão, choque, perfusão ruim, extremidades frias ou pulso fraco/ausente.</li>
            <li>Letargia, rebaixamento, síncope ou incapacidade de beber.</li>
            <li>Vômitos incoercíveis com falha da hidratação oral.</li>
            <li>Dor abdominal intensa/localizada, defesa, rigidez, distensão ou sinais peritoneais.</li>
            <li>Febre alta persistente, toxemia, suspeita de sepse ou sangramento importante.</li>
            <li>Oligúria/anúria, suspeita de injúria renal, distúrbio eletrolítico ou desidratação grave.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Sim — estabilização e Plano C', nextStep: 'geca_plano_c', value: 'com_sinal_alarme', critical: true, requiresImmediateAction: true },
        { text: 'Não — classificar hidratação', nextStep: 'geca_classificacao_hidratacao', value: 'sem_sinal_alarme' }
      ]
    },
    geca_classificacao_hidratacao: {
      id: 'geca_classificacao_hidratacao',
      title: 'Classificação do Estado de Hidratação',
      description: 'Escolher o pior cenário quando houver dúvida entre as categorias.',
      type: 'question',
      content: `
        <div class="space-y-3 text-sm">
          <div class="rounded-lg border-l-4 border-green-500 bg-green-50 p-3 text-green-950">
            <strong>Plano A — sem desidratação:</strong> ativo/alerta, olhos normais, sem sede, mucosa úmida, prega desaparece imediatamente, pulso cheio.
          </div>
          <div class="rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-3 text-yellow-950">
            <strong>Plano B — com desidratação:</strong> dois ou mais sinais como irritação/inquietude, olhos fundos, sede intensa, lágrimas ausentes, boca seca, prega lenta ou perda ponderal de até 10%.
          </div>
          <div class="rounded-lg border-l-4 border-red-600 bg-red-50 p-3 text-red-950">
            <strong>Plano C — desidratação grave:</strong> dois ou mais sinais, com ao menos um grave: letargia/coma/hipotonia, incapacidade de beber ou pulso fraco/ausente; também prega muito lenta (&gt;2 s), boca muito seca ou perda ponderal &gt;10%.
          </div>
          <p class="font-semibold text-slate-700">Na dúvida, adote o plano correspondente ao pior cenário.</p>
        </div>
      `,
      options: [
        { text: 'Sem desidratação — Plano A', nextStep: 'geca_plano_a', value: 'plano_a_sem_desidratacao' },
        { text: 'Com desidratação — Plano B', nextStep: 'geca_plano_b', value: 'plano_b_com_desidratacao' },
        { text: 'Desidratação grave — Plano C', nextStep: 'geca_plano_c', value: 'plano_c_desidratacao_grave', critical: true, requiresImmediateAction: true }
      ]
    },
    geca_plano_a: {
      id: 'geca_plano_a',
      title: 'Plano A — Prevenir Desidratação no Domicílio',
      description: 'Reposição após perdas, alimentação mantida e educação para sinais de alerta.',
      type: 'action',
      content: `
        <div class="space-y-3 text-sm">
          <div class="rounded-lg border-l-4 border-green-600 bg-green-50 p-4 text-green-950">
            <p class="font-bold">SRO e líquidos após cada evacuação/vômito</p>
            <ul class="mt-2 list-disc space-y-1 pl-5">
              <li>&lt;1 ano: 50–100 mL.</li>
              <li>1–10 anos: 100–200 mL.</li>
              <li>&gt;10 anos e adultos: quanto aceitar, em pequenas quantidades e maior frequência.</li>
              <li>Manter alimentação habitual e aleitamento. Evitar refrigerantes e bebidas muito açucaradas.</li>
            </ul>
          </div>
          <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-950">
            <strong>Zinco em menores de 5 anos:</strong> até 6 meses, 10 mg/dia; acima de 6 meses, 20 mg/dia, por 10–14 dias.
          </div>
        </div>
      `,
      options: [
        { text: 'Avaliar necessidade de exames e tratamento específico', nextStep: 'geca_indicacao_exames', value: 'plano_a_iniciado' }
      ]
    },
    geca_plano_b: {
      id: 'geca_plano_b',
      title: 'Plano B — Reidratação Oral Supervisionada',
      description: 'Realizar no serviço de saúde e manter observação até desaparecerem os sinais de desidratação.',
      type: 'action',
      timeSensitive: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4 text-yellow-950">
            <p class="font-bold">SRO: 50–100 mL/kg (média 75 mL/kg) em 4–6 horas</p>
            <ul class="mt-2 list-disc space-y-1 pl-5">
              <li>Oferecer pequenos volumes repetidos e aumentar conforme aceitação e sede.</li>
              <li>Manter aleitamento; demais alimentos podem aguardar a reidratação inicial.</li>
              <li>Repor perdas contínuas e reavaliar repetidamente estado mental, sede, pulso, perfusão, diurese e prega.</li>
            </ul>
          </div>
          <div class="rounded-lg border border-blue-200 bg-blue-50 p-3 text-blue-950">
            <strong>Vômitos persistentes impedindo SRO:</strong> considerar dose única de ondansetrona — 6 meses–2 anos: 2 mg; &gt;2–10 anos até 30 kg: 4 mg; &gt;10 anos ou &gt;30 kg/adultos: 8 mg. Avaliar contraindicações e risco de QT prolongado.
          </div>
        </div>
      `,
      options: [
        { text: 'Reavaliar após TRO supervisionada', nextStep: 'geca_reavaliacao_plano_b', value: 'tro_supervisionada' }
      ]
    },
    geca_reavaliacao_plano_b: {
      id: 'geca_reavaliacao_plano_b',
      title: 'Reavaliação do Plano B',
      description: 'Definir resposta após reidratação oral supervisionada.',
      type: 'question',
      content: `
        <div class="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-950">
          <ul class="list-disc space-y-1 pl-5">
            <li>Se desapareceram os sinais de desidratação: migrar para Plano A.</li>
            <li>Se continua desidratado: considerar gastróclise e manter supervisão.</li>
            <li>Se evoluiu para desidratação grave/choque: iniciar Plano C imediatamente.</li>
            <li>Sem melhora após 6 horas: encaminhar para hospital de referência.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Reidratado — seguir Plano A', nextStep: 'geca_plano_a', value: 'reidratado_plano_a' },
        { text: 'Permanece desidratado / falha da TRO', nextStep: 'geca_falha_plano_b', value: 'falha_plano_b', critical: true },
        { text: 'Piorou para desidratação grave', nextStep: 'geca_plano_c', value: 'evoluiu_plano_c', critical: true, requiresImmediateAction: true }
      ]
    },
    geca_falha_plano_b: {
      id: 'geca_falha_plano_b',
      title: 'Falha do Plano B',
      description: 'Desidratação persistente, intolerância oral ou ausência de melhora em até 6 horas.',
      type: 'question',
      critical: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="rounded-lg border-l-4 border-orange-500 bg-orange-50 p-4 text-orange-950">
            <p><strong>Se não há desidratação grave:</strong> considerar SRO por sonda nasogástrica (gastróclise), monitorização e reavaliação frequente.</p>
          </div>
          <div class="rounded-lg border-l-4 border-red-600 bg-red-50 p-4 text-red-950">
            <p><strong>Encaminhar/internar:</strong> ausência de melhora após 6 horas, impossibilidade de gastróclise, perdas muito volumosas, distúrbios metabólicos, comorbidade relevante ou seguimento inseguro.</p>
          </div>
        </div>
      `,
      options: [
        { text: 'Tentar gastróclise e reavaliar', nextStep: 'geca_reavaliacao_plano_b', value: 'gastroclise' },
        { text: 'Encaminhar para internação', nextStep: 'geca_internacao_observacao', value: 'internacao_falha_tro', critical: true }
      ]
    },
    geca_plano_c: {
      id: 'geca_plano_c',
      title: 'Plano C — Desidratação Grave',
      description: 'Acesso venoso, expansão com cristaloide isotônico, monitorização e transferência rápida.',
      type: 'action',
      critical: true,
      timeSensitive: true,
      content: `
        <div class="space-y-3 text-sm">
          <div class="rounded-lg border-l-4 border-red-700 bg-red-50 p-4 text-red-950">
            <p class="font-bold">Iniciar imediatamente — sem aguardar transferência</p>
            <ul class="mt-2 list-disc space-y-1 pl-5">
              <li>ABCDE, monitorização, glicemia, dois acessos venosos quando possível e balanço hídrico.</li>
              <li>SF 0,9% ou Ringer Lactato; colher exames sem atrasar a expansão.</li>
              <li>&lt;1 ano: 30 mL/kg em 1 h, depois 70 mL/kg em 5 h.</li>
              <li>≥1 ano: 30 mL/kg em 30 min, depois 70 mL/kg em 2 h 30 min.</li>
              <li>RN ou &lt;5 anos com cardiopatia grave: iniciar 10 mL/kg e reavaliar, evitando sobrecarga.</li>
              <li>Se choque persistir, reavaliar diagnóstico, perdas, acesso e necessidade de repetir expansão conforme resposta/protocolo.</li>
            </ul>
          </div>
          <div class="rounded-lg border border-blue-200 bg-blue-50 p-3 text-blue-950">
            Iniciar SRO em pequenos volumes quando puder beber, geralmente 2–3 horas após o início da via EV. Não suspender EV até manter hidratação por via oral.
          </div>
          ${referenceNote}
        </div>
      `,
      options: [
        { text: 'Reavaliar após expansão inicial', nextStep: 'geca_reavaliacao_plano_c', value: 'expansao_iniciada', critical: true }
      ]
    },
    geca_reavaliacao_plano_c: {
      id: 'geca_reavaliacao_plano_c',
      title: 'Reavaliação do Plano C',
      description: 'Reclassificar hidratação, perfusão e necessidade de suporte avançado.',
      type: 'question',
      critical: true,
      content: `
        <div class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-950">
          <p class="font-bold">Reavaliar continuamente</p>
          <ul class="mt-2 list-disc space-y-1 pl-5">
            <li>Estado mental, FC, PA, perfusão, enchimento capilar, diurese e ausculta pulmonar.</li>
            <li>Sódio, potássio, função renal, glicemia, gasometria/lactato e balanço das perdas conforme gravidade.</li>
            <li>Observar por pelo menos 6 horas; manter no serviço até hidratação completa e tolerância oral.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Melhora hemodinâmica — manter hospital/observação', nextStep: 'geca_internacao_observacao', value: 'melhora_apos_plano_c', critical: true },
        { text: 'Choque ou instabilidade persistente — transferência imediata', nextStep: 'geca_transferencia_emergencia', value: 'instabilidade_persistente', critical: true, requiresImmediateAction: true }
      ]
    },
    geca_indicacao_exames: {
      id: 'geca_indicacao_exames',
      title: 'Há Indicação de Exames Complementares?',
      description: 'Exames não são de rotina na GECA não complicada.',
      type: 'question',
      content: `
        <div class="space-y-3 text-sm">
          <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-950">
            <strong>Sem indicação rotineira:</strong> diarreia aquosa aguda, sem gravidade, em paciente hidratado e imunocompetente.
          </div>
          <div class="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-950">
            <p class="font-bold">Considere exames se houver:</p>
            <ul class="mt-1 list-disc space-y-1 pl-5">
              <li>Febre persistente, sangue/muco, dor intensa, sepse ou desidratação grave.</li>
              <li>Imunossupressão, HIV avançado, transplante, oncologia ou outra condição de alto risco.</li>
              <li>Idade ≥70 anos com fragilidade/comorbidades relevantes.</li>
              <li>Diarreia ≥14 dias, perda ponderal, falha terapêutica ou surto.</li>
              <li>Antibiótico/internação recente, suspeita de C. difficile, cólera ou STEC.</li>
            </ul>
          </div>
        </div>
      `,
      options: [
        { text: 'Sim — selecionar investigação dirigida', nextStep: 'geca_exames_dirigidos', value: 'exames_indicados' },
        { text: 'Não — seguir avaliação terapêutica', nextStep: 'geca_diarreia_persistente', value: 'sem_exames' }
      ]
    },
    geca_exames_dirigidos: {
      id: 'geca_exames_dirigidos',
      title: 'Investigação Dirigida',
      description: 'Selecionar exames conforme gravidade, padrão clínico e risco epidemiológico.',
      type: 'action',
      content: `
        <div class="grid gap-3 text-sm md:grid-cols-2">
          <div class="rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-950">
            <p class="font-bold">Sistêmicos</p>
            <ul class="mt-2 list-disc space-y-1 pl-5">
              <li>Hemograma; ureia/creatinina; Na, K, Mg; glicemia.</li>
              <li>PCR conforme contexto; gasometria e lactato se grave/choque.</li>
              <li>Hemoculturas se sepse, suspeita de febre entérica, bacteremia ou imunossupressão.</li>
            </ul>
          </div>
          <div class="rounded-lg border border-violet-200 bg-violet-50 p-4 text-violet-950">
            <p class="font-bold">Fezes</p>
            <ul class="mt-2 list-disc space-y-1 pl-5">
              <li>Coprocultura/painel molecular em disenteria febril, doença grave, surto ou alto risco.</li>
              <li>Pesquisa de toxina Shiga/STEC quando sangue, dor intensa ou suspeita epidemiológica.</li>
              <li>C. difficile se diarreia após antibiótico ou associada à assistência.</li>
              <li>Parasitológico/testes específicos em duração ≥14 dias, viagem ou imunossupressão.</li>
              <li>Vibrio se fezes em “água de arroz”, água salobra/mariscos ou área endêmica.</li>
            </ul>
          </div>
          <div class="rounded-lg border border-red-200 bg-red-50 p-3 text-red-950 md:col-span-2">
            Imagem abdominal não é rotina: reservar para dor focal intensa, sinais peritoneais, distensão/megacólon, perfuração, isquemia ou diagnóstico alternativo.
          </div>
        </div>
      `,
      options: [
        { text: 'Prosseguir após definir exames', nextStep: 'geca_diarreia_persistente', value: 'investigacao_definida' }
      ]
    },
    geca_diarreia_persistente: {
      id: 'geca_diarreia_persistente',
      title: 'Diarreia com 14 Dias ou Mais?',
      description: 'Separar GECA autolimitada de diarreia persistente que requer investigação etiológica.',
      type: 'question',
      content: `
        <div class="rounded-lg border border-violet-200 bg-violet-50 p-4 text-sm text-violet-950">
          <p class="font-bold">Se persistente, considerar:</p>
          <ul class="mt-2 list-disc space-y-1 pl-5">
            <li>Giardia, Entamoeba, Cryptosporidium e outros parasitas conforme exposição/imunidade.</li>
            <li>C. difficile, doença inflamatória intestinal, doença celíaca, efeito medicamentoso e causas não infecciosas.</li>
            <li>Menor de 6 meses ou qualquer desidratação: reidratar e encaminhar para avaliação hospitalar.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Sim — investigação de diarreia persistente', nextStep: 'geca_investigacao_persistente', value: 'persistente' },
        { text: 'Não — avaliar antibiótico', nextStep: 'geca_indicacao_antibiotico', value: 'aguda' }
      ]
    },
    geca_investigacao_persistente: {
      id: 'geca_investigacao_persistente',
      title: 'Investigação de Diarreia Persistente',
      description: 'Encaminhar para investigação etiológica e tratamento específico; não prescrever antiparasitário empírico indiscriminadamente.',
      type: 'result',
      content: `
        <div class="space-y-3 text-sm">
          <div class="rounded-lg border-l-4 border-violet-600 bg-violet-50 p-4 text-violet-950">
            <p class="font-bold">Conduta</p>
            <ul class="mt-2 list-disc space-y-1 pl-5">
              <li>Garantir hidratação e suporte nutricional.</li>
              <li>Solicitar investigação orientada por exposição, imunidade e padrão das fezes.</li>
              <li>Tratar agente identificado; revisar fármacos e causas inflamatórias/malabsortivas.</li>
              <li>Encaminhar/internar se menor de 6 meses, desidratação, perda ponderal, imunossupressão ou comprometimento sistêmico.</li>
            </ul>
          </div>
        </div>
      `,
      options: []
    },
    geca_indicacao_antibiotico: {
      id: 'geca_indicacao_antibiotico',
      title: 'Há Indicação de Antibiótico Empírico?',
      description: 'Antibiótico não é rotina e pode ser prejudicial em quadros virais ou por STEC.',
      type: 'question',
      content: `
        <div class="space-y-3 text-sm">
          <div class="rounded-lg border-l-4 border-green-600 bg-green-50 p-3 text-green-950">
            <strong>Não indicar:</strong> diarreia aquosa aguda não complicada, sem comprometimento sistêmico.
          </div>
          <div class="rounded-lg border-l-4 border-red-600 bg-red-50 p-3 text-red-950">
            <strong>Considerar após avaliação médica:</strong> disenteria com comprometimento do estado geral, febre alta persistente, dor/tenesmo ou comprometimento sistêmico; cólera com desidratação grave; sepse/febre entérica; imunossupressão relevante conforme quadro.
          </div>
          <div class="rounded-lg border border-amber-300 bg-amber-50 p-3 font-semibold text-amber-950">
            Antes de prescrever em diarreia sanguinolenta, excluir suspeita de STEC/SHU.
          </div>
        </div>
      `,
      options: [
        { text: 'Sim — há critério clínico', nextStep: 'geca_triagem_stec', value: 'antibiotico_indicado' },
        { text: 'Não — tratamento de suporte', nextStep: 'geca_suporte_sintomatico', value: 'antibiotico_nao_indicado' }
      ]
    },
    geca_triagem_stec: {
      id: 'geca_triagem_stec',
      title: 'Suspeita de STEC ou Síndrome Hemolítico-Urêmica?',
      description: 'Evitar antibiótico e antiperistáltico quando houver suspeita de toxina Shiga.',
      type: 'question',
      critical: true,
      content: `
        <div class="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-950">
          <p class="font-bold">Suspeitar diante de:</p>
          <ul class="mt-2 list-disc space-y-1 pl-5">
            <li>Diarreia sanguinolenta com dor abdominal intensa e febre ausente/baixa.</li>
            <li>Surto ou exposição a carne malpassada, leite não pasteurizado, vegetais/água contaminados.</li>
            <li>Palidez, petéquias, fadiga, oligúria, edema, hipertensão ou alteração neurológica.</li>
            <li>Anemia/fragmentação, plaquetopenia ou injúria renal.</li>
          </ul>
        </div>
      `,
      options: [
        { text: 'Sim — não iniciar antibiótico empírico', nextStep: 'geca_suspeita_stec_shu', value: 'suspeita_stec_shu', critical: true },
        { text: 'Não — escolher esquema dirigido', nextStep: 'geca_antibioticos', value: 'sem_suspeita_stec' }
      ]
    },
    geca_suspeita_stec_shu: {
      id: 'geca_suspeita_stec_shu',
      title: 'Suspeita de STEC / SHU',
      description: 'Bloquear antibiótico empírico e antiperistáltico; investigar e monitorar complicações.',
      type: 'result',
      critical: true,
      content: `
        <div class="rounded-lg border-l-4 border-red-700 bg-red-50 p-4 text-sm text-red-950">
          <p class="font-bold">Conduta de segurança</p>
          <ul class="mt-2 list-disc space-y-1 pl-5">
            <li>Não usar antibiótico empírico nem loperamida/antiperistáltico.</li>
            <li>Solicitar fezes para toxina Shiga/STEC e cultura/painel conforme disponibilidade.</li>
            <li>Hemograma com plaquetas e esfregaço, ureia/creatinina, eletrólitos, LDH, bilirrubinas, haptoglobina e urina conforme suspeita de SHU.</li>
            <li>Hidratar cuidadosamente, monitorar diurese, PA e balanço; discutir internação e avaliação especializada.</li>
          </ul>
        </div>
      `,
      options: []
    },
    geca_antibioticos: {
      id: 'geca_antibioticos',
      title: 'Antibioticoterapia em Cenário Selecionado',
      description: 'Escolher conforme idade, peso, gestação, gravidade, epidemiologia, cultura e resistência local.',
      type: 'action',
      content: `
        <div class="space-y-3 text-sm">
          <div class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-950">
            <p class="font-bold">Disenteria com comprometimento clínico — referência MS</p>
            <ul class="mt-2 list-disc space-y-1 pl-5">
              <li>3 meses–10 anos e ≤30 kg, sem imunodeficiência: azitromicina 10 mg/kg VO no dia 1, depois 5 mg/kg/dia por 4 dias.</li>
              <li>Alternativa pediátrica: ceftriaxona 50 mg/kg IM 1x/dia por 3–5 dias.</li>
              <li>&gt;10 anos ou &gt;30 kg e adultos: ciprofloxacino 500 mg VO 12/12 h por 3 dias; alternativa ceftriaxona conforme avaliação clínica/protocolo.</li>
              <li>&lt;3 meses, imunodeficiência, desnutrição grave ou quadro sistêmico: iniciar manejo e referenciar/hospitalizar; ceftriaxona 50–100 mg/kg/dia conforme protocolo.</li>
            </ul>
          </div>
          <div class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-950">
            <strong>Segurança:</strong> confirmar alergias, função renal/hepática, QT, interações, gestação e resistência local. Evitar fluoroquinolona na gestação; escolher alternativa obstétrica segura. Colher cultura antes quando possível, sem atrasar tratamento de sepse.
          </div>
          <div class="rounded-lg border border-slate-200 bg-slate-50 p-3 text-slate-700">
            Cólera, febre entérica, C. difficile e parasitoses exigem esquemas próprios e não devem ser tratados como GECA inespecífica.
          </div>
        </div>
      `,
      options: [
        { text: 'Registrar tratamento e seguir suporte', nextStep: 'geca_suporte_sintomatico', value: 'antibiotico_definido' }
      ]
    },
    geca_suporte_sintomatico: {
      id: 'geca_suporte_sintomatico',
      title: 'Suporte, Sintomáticos e Prevenção',
      description: 'Hidratação e alimentação são o eixo do tratamento.',
      type: 'action',
      content: `
        <div class="grid gap-3 text-sm md:grid-cols-2">
          <div class="rounded-lg border border-green-200 bg-green-50 p-4 text-green-950">
            <p class="font-bold">Fazer</p>
            <ul class="mt-2 list-disc space-y-1 pl-5">
              <li>SRO e reposição de perdas conforme Plano A/B.</li>
              <li>Manter dieta habitual e aleitamento; fracionar refeições.</li>
              <li>Antitérmico/analgésico conforme indicação e contraindicações.</li>
              <li>Ondansetrona apenas se vômito persistente impedir TRO.</li>
              <li>Higiene das mãos, água segura e cuidado com alimentos.</li>
            </ul>
          </div>
          <div class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-950">
            <p class="font-bold">Evitar</p>
            <ul class="mt-2 list-disc space-y-1 pl-5">
              <li>Antibiótico ou antiparasitário empírico sem indicação.</li>
              <li>Antidiarreicos de rotina; nunca usar se sangue/muco, febre, colite ou suspeita de STEC.</li>
              <li>Refrigerantes, soluções caseiras hiperosmolares e bebidas energéticas.</li>
              <li>Jejum prolongado ou suspensão desnecessária do aleitamento.</li>
            </ul>
          </div>
        </div>
      `,
      options: [
        { text: 'Avaliar destino e segurança da alta', nextStep: 'geca_destino', value: 'suporte_definido' }
      ]
    },
    geca_destino: {
      id: 'geca_destino',
      title: 'Destino Assistencial',
      description: 'Alta somente após estabilidade, hidratação e tolerância oral.',
      type: 'question',
      content: `
        <div class="space-y-3 text-sm">
          <div class="rounded-lg border-l-4 border-green-600 bg-green-50 p-3 text-green-950">
            <strong>Alta:</strong> hidratado, estável, tolera SRO/alimentação, sem abdome agudo, sem disfunção orgânica e com cuidador/retorno seguros.
          </div>
          <div class="rounded-lg border-l-4 border-red-600 bg-red-50 p-3 text-red-950">
            <strong>Observar/internar:</strong> falha da TRO, necessidade EV, perdas intensas, distúrbio eletrolítico/renal, dor importante, sepse, alto risco, imunossupressão, fragilidade ou seguimento inseguro.
          </div>
        </div>
      `,
      options: [
        { text: 'Seguro para alta — Plano A', nextStep: 'geca_alta_plano_a', value: 'alta_segura' },
        { text: 'Necessita observação ou internação', nextStep: 'geca_internacao_observacao', value: 'internacao_observacao', critical: true }
      ]
    },
    geca_alta_plano_a: {
      id: 'geca_alta_plano_a',
      title: 'Alta — Plano A e Orientações',
      description: 'Paciente estável, hidratado e apto ao manejo domiciliar.',
      type: 'result',
      content: `
        <div class="space-y-3 text-sm">
          <div class="rounded-lg border-l-4 border-green-600 bg-green-50 p-4 text-green-950">
            <p class="font-bold">Plano domiciliar</p>
            <ul class="mt-2 list-disc space-y-1 pl-5">
              <li>SRO/líquidos após cada perda, alimentação habitual e aleitamento.</li>
              <li>Usar somente medicamentos prescritos e respeitar duração/doses.</li>
              <li>Reavaliar em até 48 horas se não houver melhora.</li>
            </ul>
          </div>
          <div class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-950">
            <p class="font-bold">Retorno imediato se:</p>
            <p class="mt-1">piora ou aumento do volume/frequência, vômitos repetidos, sangue nas fezes, muita sede, recusa alimentar, diminuição da diurese, prostração, síncope, febre alta persistente, dor abdominal intensa/localizada ou incapacidade de beber.</p>
          </div>
        </div>
      `,
      options: []
    },
    geca_internacao_observacao: {
      id: 'geca_internacao_observacao',
      title: 'Observação / Internação Hospitalar',
      description: 'Manter monitorização, reposição, investigação e reavaliação até estabilidade e tolerância oral.',
      type: 'result',
      critical: true,
      content: `
        <div class="rounded-lg border-l-4 border-orange-600 bg-orange-50 p-4 text-sm text-orange-950">
          <p class="font-bold">Plano hospitalar</p>
          <ul class="mt-2 list-disc space-y-1 pl-5">
            <li>Monitorar sinais vitais, perfusão, diurese, balanço, peso e perdas.</li>
            <li>Corrigir água/eletrólitos conforme reavaliação clínica e laboratorial.</li>
            <li>Introduzir SRO e dieta assim que toleradas.</li>
            <li>Tratar etiologia específica quando confirmada e revisar necessidade de isolamento/notificação.</li>
            <li>Alta apenas quando completamente hidratado e mantendo ingestão oral.</li>
          </ul>
        </div>
      `,
      options: []
    },
    geca_transferencia_emergencia: {
      id: 'geca_transferencia_emergencia',
      title: 'Transferência Imediata para Emergência / UTI',
      description: 'Instabilidade persistente ou necessidade de suporte acima da capacidade local.',
      type: 'result',
      critical: true,
      timeSensitive: true,
      content: `
        <div class="rounded-lg border-l-4 border-red-700 bg-red-50 p-4 text-sm text-red-950">
          <p class="font-bold">Não atrasar estabilização pela transferência</p>
          <ul class="mt-2 list-disc space-y-1 pl-5">
            <li>Manter ABCDE, oxigênio se indicado, acesso, cristaloide, glicemia e monitorização.</li>
            <li>Documentar peso, perdas, sinais vitais, resposta aos bolus, volume infundido e exames.</li>
            <li>Acionar transporte medicalizado e comunicar previamente a unidade receptora.</li>
            <li>Manter reavaliações seriadas até a transferência formal do cuidado.</li>
          </ul>
        </div>
      `,
      options: []
    }
  }
}
