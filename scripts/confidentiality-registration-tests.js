/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

const signup = read('src/app/signup/page.tsx')
const login = read('src/app/login/page.tsx')
const term = read('src/components/ConfidentialityTerm.tsx')
const termLib = read('src/lib/confidentialityTerm.ts')
const admin = read('src/components/AdminActivityPanel.tsx')
const schema = read('db/supabase/schema_confidentiality_agreements.sql')

assert.match(signup, /setPendingConfidentialitySigner\([\s\S]*name, crm: crmUf, email/, 'Cadastro deve abrir o termo antes de criar a conta')
const submitHandler = signup.slice(signup.indexOf('const handleSubmit'), signup.indexOf('const handleSignConfidentialityTerm'))
assert.doesNotMatch(submitHandler, /signUpDoctor|signInDoctor/, 'Envio inicial do formulário não pode criar a conta antes da assinatura')
assert.match(signup, /handleSignConfidentialityTerm[\s\S]*await signUpDoctor\(email, password/, 'A conta só deve ser criada pelo manipulador da assinatura')
assert.match(signup, /persistConfidentialityAgreement\(signed\.user\.id, doctor\.id, signature\)/, 'Cadastro deve persistir o PDF assinado')
assert.match(signup, /confidentiality_term:[\s\S]*agreementId:[\s\S]*pdfSha256:/, 'Metadados do usuário devem referenciar o documento e seu hash')
assert.match(signup, /signUpDoctor\(email, password, \{[\s\S]*pendingDocument: true/, 'Assinatura prévia deve acompanhar a criação da conta mesmo quando há confirmação de e-mail')
assert.match(login, /confidentialityTerm\.acceptedAt && !confidentialityTerm\.agreementId[\s\S]*setPendingConfidentialitySigner/, 'Login deve bloquear o acesso enquanto o PDF de uma assinatura pendente não for persistido')

assert.match(term, /normalizedSignature === normalizedExpectedName/, 'Assinatura deve corresponder ao nome completo')
assert.match(term, /disabled=\{!accepted \|\| !signatureMatches \|\| loading\}/, 'Cadastro deve permanecer bloqueado sem aceite e assinatura válida')
assert.match(term, /Declaro que li integralmente, compreendi e aceito/, 'Tela deve registrar concordância expressa')

assert.match(termLib, /buildConfidentialityTermPdf/, 'Serviço deve gerar o PDF final')
assert.match(termLib, /crypto\.subtle\.digest\('SHA-256'/, 'PDF deve possuir hash de integridade')
assert.match(termLib, /\.from\(CONFIDENTIALITY_BUCKET\)[\s\S]*\.upload\(pdfPath, pdf/, 'PDF deve ser enviado ao bucket privado')
assert.match(termLib, /\.from\('confidentiality_agreements'\)[\s\S]*\.insert/, 'Assinatura deve ser auditada em tabela própria')

assert.match(admin, /Termos de confidencialidade assinados/, 'Painel administrativo deve listar os termos')
assert.match(admin, /createConfidentialityPdfDownload/, 'Painel administrativo deve permitir baixar o PDF')

assert.match(schema, /'confidentiality-terms',[\s\S]*false,/, 'Bucket de documentos deve ser privado')
assert.match(schema, /confidentiality_agreements_select_own_or_admin/, 'Tabela deve permitir leitura apenas pelo titular ou administrador')
assert.match(schema, /confidentiality_terms_select_own_or_admin/, 'Storage deve permitir leitura apenas pelo titular ou administrador')

console.log('Confidentiality registration tests passed: signature gate, private PDF persistence, integrity metadata and admin download.')
