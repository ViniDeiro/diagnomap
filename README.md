# Siga o Fluxo - Sistema de Apoio à Decisão Médica

## 🩺 Sobre o Projeto

O **Siga o Fluxo** é um sistema web moderno e responsivo desenvolvido para auxiliar profissionais de saúde na classificação de risco e manejo de pacientes em emergências médicas. O sistema implementa fluxogramas interativos baseados nos protocolos oficiais do Ministério da Saúde, incluindo dengue, IAM, AVC, sepse e muitos outros.

### ✨ Características Principais

- **Interface Gamificada**: Design moderno com elementos interativos e animações suaves
- **Protocolo Oficial**: Baseado nas diretrizes do Ministério da Saúde de 2024
- **Responsivo**: Funciona perfeitamente em dispositivos móveis e desktop
- **Intuitivo**: Navegação simples e clara para uso em ambiente hospitalar
- **Completo**: Implementa múltiplos fluxogramas de emergência com classificação de risco
- **Escalável**: Arquitetura modular para adicionar novos protocolos facilmente

## 🚀 Tecnologias Utilizadas

- **Framework**: Next.js 14 com App Router
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Animações**: Framer Motion
- **Ícones**: Lucide React
- **Utilitários**: clsx para classes condicionais

## 📋 Funcionalidades

### Protocolos de Emergência Disponíveis

#### 🩺 **Dengue** (Implementado)
- Classificação de risco A, B, C e D
- Protocolo completo do Ministério da Saúde 2024
- Cálculos automáticos de hidratação

#### ❤️ **Infarto Agudo do Miocárdio (IAM)**
- Protocolo STEMI e NSTEMI
- Tempo porta-balão ≤ 90 minutos
- Medicações essenciais (AAS, Clopidogrel, Heparina)

#### 🧠 **Acidente Vascular Cerebral (AVC)**
- Avaliação FAST
- Janela terapêutica para TPA
- Protocolo de trombólise

#### 🦠 **Sepse Grave**
- Bundle de 1 hora
- Antibioticoterapia de amplo espectro
- Monitorização intensiva

### Classificação de Risco por Grupos (Dengue)

#### 🟦 Grupo A - Baixo Risco
- Dengue sem sinais de alarme
- Sem sangramento espontâneo
- Sem risco social ou comorbidades
- **Conduta**: Hidratação oral e acompanhamento ambulatorial

#### 🟩 Grupo B - Risco Intermediário
- Dengue sem sinais de alarme
- Com sangramento espontâneo, risco social ou comorbidades
- **Conduta**: Observação hospitalar com exames complementares

#### 🟨 Grupo C - Alto Risco
- Sinais de alarme presentes
- Sinais vitais estáveis
- **Conduta**: Internação com reposição volêmica

#### 🟥 Grupo D - Risco Crítico
- Dengue grave
- Choque ou sangramento grave
- **Conduta**: UTI com suporte avançado

### Funcionalidades do Sistema

- ✅ **Múltiplos Fluxogramas**: Protocolos para diferentes emergências
- ✅ **Seletor Inteligente**: Busca e filtros por categoria
- ✅ **Fluxograma Interativo**: Navegação passo a passo
- ✅ **Barra de Progresso**: Acompanhamento visual do processo
- ✅ **Histórico de Navegação**: Botão voltar para revisar decisões
- ✅ **Dosagem Automática**: Cálculos de hidratação por idade
- ✅ **Critérios de Alta**: Avaliação completa para liberação
- ✅ **Protocolos de Emergência**: Manejo de choque e sangramento
- ✅ **Indicadores Visuais**: Criticidade, tempo sensível, especialista

## 🛠️ Instalação e Uso

### Pré-requisitos

- Node.js 18.17 ou superior
- npm ou yarn

### Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd siga-o-fluxo
```

2. **Instale as dependências**
```bash
npm install
```

3. **Execute o servidor de desenvolvimento**
```bash
npm run dev
```

4. **Acesse o sistema**
```
http://localhost:3000
```

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar servidor de produção
npm run start

# Linting
npm run lint
```

## 📱 Como Usar

### Seleção de Protocolo

1. **Dashboard**: Acesse o sistema e clique em "Emergências"
2. **Busca**: Use a barra de busca ou filtros por categoria
3. **Seleção**: Escolha o protocolo apropriado para o caso
4. **Início**: O fluxograma será carregado automaticamente

### Navegação do Fluxograma

1. **Início**: Confirme que o paciente apresenta sintomas compatíveis
2. **Avaliação**: Responda às perguntas do protocolo
3. **Classificação**: O sistema direcionará para o grupo de risco apropriado
4. **Conduta**: Siga as orientações específicas para cada grupo
5. **Reavaliação**: Use os critérios de reavaliação conforme necessário
6. **Alta**: Aplique os critérios de alta quando apropriado

### Funcionalidades Especiais

- **Botão Voltar**: Permite revisar decisões anteriores
- **Reiniciar**: Inicia um novo caso a qualquer momento
- **Progresso Visual**: Acompanhe onde está no fluxograma
- **Informações Detalhadas**: Cada etapa contém orientações específicas
- **Indicadores Visuais**: 
  - 🔴 **CRÍTICO**: Ações que requerem atenção imediata
  - ⏰ **TEMPO**: Decisões sensíveis ao tempo
  - 👨‍⚕️ **ESPECIALISTA**: Requer consulta especializada

## 🏥 Grupos de Classificação

### Grupo A (Azul) - Ambulatorial
- **Paciente**: Sem sinais de alarme, sem comorbidades
- **Local**: Ambulatório
- **Hidratação**: Oral (60ml/kg/dia para adultos)
- **Exames**: A critério médico

### Grupo B (Verde) - Observação
- **Paciente**: Sem sinais de alarme, com fatores de risco
- **Local**: Leito de observação
- **Hidratação**: Oral + venosa se necessário
- **Exames**: Hemograma obrigatório

### Grupo C (Amarelo) - Internação
- **Paciente**: Com sinais de alarme, estável
- **Local**: Enfermaria
- **Hidratação**: Venosa (10ml/kg em 10 min)
- **Exames**: Hemograma + albumina + transaminases

### Grupo D (Vermelho) - UTI
- **Paciente**: Dengue grave, choque
- **Local**: UTI
- **Hidratação**: Venosa (20ml/kg em 20 min)
- **Exames**: Completos + investigação de sangramento

## ⚠️ Avisos Importantes

- **Não substitui avaliação médica**: O sistema é uma ferramenta de apoio
- **Sempre notificar**: Casos suspeitos devem ser notificados
- **Protocolo local**: Seguir também as diretrizes da instituição
- **Atualização**: Manter-se atualizado com novos protocolos
- **Emergência**: Em caso de dúvida, procurar supervisor

## 🔧 Desenvolvimento

### Estrutura do Projeto

```
siga-o-fluxo/
├── src/
│   ├── app/
│   │   ├── globals.css        # Estilos globais
│   │   ├── layout.tsx         # Layout principal
│   │   └── page.tsx           # Página inicial
│   ├── components/
│   │   ├── EmergencyFlowchart.tsx    # Componente genérico
│   │   ├── EmergencySelector.tsx     # Seletor de protocolos
│   │   ├── DengueFlowchart.tsx       # Componente específico dengue
│   │   ├── Header.tsx                # Cabeçalho
│   │   ├── Footer.tsx                # Rodapé
│   │   └── LoadingScreen.tsx         # Tela de carregamento
│   ├── data/
│   │   └── emergencyFlowcharts.ts    # Repositório de fluxogramas
│   └── types/
│       ├── patient.ts                # Tipos de paciente
│       └── emergency.ts              # Tipos de emergência
├── public/                     # Arquivos estáticos
├── package.json               # Dependências
└── README.md                  # Este arquivo
```

### Personalizações

O sistema pode ser facilmente personalizado:

- **Cores**: Modifique as classes do Tailwind CSS
- **Textos**: Edite as strings nos componentes
- **Fluxograma**: Adicione ou modifique etapas no objeto `steps`
- **Animações**: Ajuste as configurações do Framer Motion
- **Novos Protocolos**: Adicione fluxogramas em `emergencyFlowcharts.ts`

### Adicionando Novos Protocolos

Para adicionar um novo protocolo:

1. **Defina o tipo** em `types/emergency.ts`
2. **Crie o fluxograma** em `data/emergencyFlowcharts.ts`
3. **Adicione à categoria** apropriada
4. **Teste** a navegação e funcionalidades

## 📊 Protocolos Base

Este sistema implementa fielmente os fluxogramas oficiais do Ministério da Saúde:

### Referências

- **Dengue**: Protocolo de Classificação de Risco e Manejo 2024
- **IAM**: Diretrizes de Manejo do Infarto Agudo do Miocárdio
- **AVC**: Protocolo de AVC Isquêmico Agudo
- **Sepse**: Surviving Sepsis Campaign Guidelines
- Ministério da Saúde - Protocolos de Emergência
- Diretrizes para Diagnóstico e Tratamento
- Manual de Manejo Clínico

## 🤝 Contribuições

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Implemente as mudanças
4. Teste thoroughly
5. Abra um Pull Request

## 📝 Licença

Este projeto foi desenvolvido para uso em ambiente hospitalar e educacional. Sempre consulte as diretrizes locais e protocolos institucionais.

## 📞 Suporte

Em caso de dúvidas técnicas ou sugestões de melhorias, entre em contato com a equipe de desenvolvimento.

---

**Versão**: 1.0.0  
**Última Atualização**: Novembro 2024  
**Compatibilidade**: Protocolo MS 2024

⚕️ **Desenvolvido com ❤️ para profissionais de saúde**
