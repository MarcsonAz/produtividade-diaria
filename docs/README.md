# 📋 Produtividade Diária

Aplicação web simples para gerenciar tarefas e cronometrar atividades, desenvolvida como projeto de aprendizado para deploy no Google Cloud Platform (GCP).

## 🎯 Funcionalidades

- ✅ **Lista de Tarefas**: Adicione, complete e remova tarefas do seu dia
- ⏱️ **Cronômetro**: Controle o tempo das suas atividades com precisão de milissegundos
- 📊 **Voltas**: Registre múltiplas voltas e compare tempos
- 💾 **Armazenamento Local**: Dados salvos automaticamente no navegador
- 🔄 **Cache Offline**: Funciona mesmo sem conexão (via Service Worker)
- 📱 **Responsivo**: Funciona em desktop, tablet e mobile

## 📁 Estrutura do Projeto

```
produtividade-diaria/
├── index.html              # Página principal
├── sw.js                   # Service Worker para cache
├── styles/
│   ├── main.css           # Estilos principais e variáveis
│   ├── tasks.css          # Estilos da lista de tarefas
│   └── timer.css          # Estilos do cronômetro
├── js/
│   ├── app.js             # Inicialização da aplicação
│   ├── utils.js           # Funções utilitárias
│   ├── storage.js         # Gerenciamento de localStorage
│   ├── tasks.js           # Lógica de tarefas
│   └── timer.js           # Lógica do cronômetro
├── .gitignore             # Arquivos ignorados pelo Git
└── README.md              # Este arquivo
```

## 🚀 Deploy no Google Cloud Platform (GCP)

### Opção 1: Google Cloud Storage (Recomendado para sites estáticos)

Esta é a opção **mais simples e barata** para hospedar sites estáticos.

#### Passo 1: Criar conta no GCP

1. Acesse [cloud.google.com](https://cloud.google.com)
2. Clique em "Começar gratuitamente" (free trial de $300)
3. Complete o cadastro com seus dados e cartão de crédito
4. Aceite os termos de serviço

#### Passo 2: Criar um projeto

1. Acesse o [Console do GCP](https://console.cloud.google.com)
2. Clique no seletor de projetos (topo da página)
3. Clique em "Novo Projeto"
4. Nome do projeto: `produtividade-diaria` (ou outro de sua escolha)
5. Clique em "Criar"

#### Passo 3: Instalar o Google Cloud SDK

**Windows:**
1. Baixe o instalador: [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
2. Execute o instalador
3. Siga as instruções na tela

**macOS:**
```bash
brew install --cask google-cloud-sdk
```

**Linux:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

#### Passo 4: Configurar o SDK

```bash
# Inicializar o gcloud
gcloud init

# Fazer login
gcloud auth login

# Definir o projeto
gcloud config set project produtividade-diaria

# Verificar configuração
gcloud config list
```

#### Passo 5: Criar bucket no Cloud Storage

```bash
# Criar bucket (nome deve ser único globalmente)
gsutil mb -p produtividade-diaria -c STANDARD -l US gs://meu-site-produtividade/

# Tornar o bucket público
gsutil iam ch allUsers:objectViewer gs://meu-site-produtividade/
```

**IMPORTANTE**: Substitua `meu-site-produtividade` por um nome único!

#### Passo 6: Configurar o bucket para hospedagem web

```bash
# Definir página principal e de erro
gsutil web set -m index.html -e index.html gs://meu-site-produtividade/
```

#### Passo 7: Fazer upload dos arquivos

```bash
# Navegar até a pasta do projeto
cd /caminho/para/produtividade-diaria

# Fazer upload de todos os arquivos
gsutil -m cp -r * gs://meu-site-produtividade/

# Ou fazer upload seletivo
gsutil cp index.html gs://meu-site-produtividade/
gsutil cp sw.js gs://meu-site-produtividade/
gsutil -m cp -r styles gs://meu-site-produtividade/
gsutil -m cp -r js gs://meu-site-produtividade/
```

#### Passo 8: Configurar cache (opcional mas recomendado)

```bash
# Configurar cache de 1 hora para HTML
gsutil setmeta -h "Cache-Control:public, max-age=3600" gs://meu-site-produtividade/*.html

# Configurar cache de 1 dia para CSS e JS
gsutil setmeta -h "Cache-Control:public, max-age=86400" gs://meu-site-produtividade/styles/*
gsutil setmeta -h "Cache-Control:public, max-age=86400" gs://meu-site-produtividade/js/*
```

#### Passo 9: Acessar o site

Seu site estará disponível em:
```
https://storage.googleapis.com/meu-site-produtividade/index.html
```

---

### Opção 2: Firebase Hosting (Alternativa mais amigável)

Firebase é uma plataforma do Google mais simples para iniciantes.

#### Passo 1: Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

#### Passo 2: Fazer login no Firebase

```bash
firebase login
```

#### Passo 3: Inicializar o projeto

```bash
# Na pasta do projeto
cd /caminho/para/produtividade-diaria

firebase init hosting
```

Selecione as opções:
- Use existing project ou Create new project
- Public directory: `.` (diretório atual)
- Configure as single-page app: `No`
- Set up automatic builds: `No`

#### Passo 4: Deploy

```bash
firebase deploy
```

Seu site estará em: `https://seu-projeto.web.app`

---

## 🔗 Conectar com GitHub

### Passo 1: Criar repositório no GitHub

1. Acesse [github.com](https://github.com)
2. Clique em "New repository"
3. Nome: `produtividade-diaria`
4. Deixe como público ou privado
5. NÃO inicialize com README (já temos um)
6. Clique em "Create repository"

### Passo 2: Configurar Git local

```bash
# Inicializar repositório Git
git init

# Adicionar todos os arquivos
git add .

# Fazer o primeiro commit
git commit -m "Initial commit: aplicação de produtividade"

# Adicionar o repositório remoto
git remote add origin https://github.com/seu-usuario/produtividade-diaria.git

# Enviar para o GitHub
git branch -M main
git push -u origin main
```

### Passo 3: Deploy automático com GitHub Actions (opcional)

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GCS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Cloud SDK
      uses: google-github-actions/setup-gcloud@v0
      with:
        project_id: ${{ secrets.GCP_PROJECT_ID }}
        service_account_key: ${{ secrets.GCP_SA_KEY }}
    
    - name: Upload to GCS
      run: |
        gsutil -m rsync -r -d . gs://meu-site-produtividade/
```

Configure os secrets no GitHub:
- `GCP_PROJECT_ID`: ID do seu projeto
- `GCP_SA_KEY`: Chave JSON da service account

---

## 💡 Dicas Importantes

### Performance

1. **Minificação**: Para produção, minifique CSS e JS
   ```bash
   # Instalar minificadores
   npm install -g clean-css-cli uglify-js
   
   # Minificar CSS
   cleancss -o styles/main.min.css styles/main.css
   
   # Minificar JS
   uglifyjs js/app.js -o js/app.min.js
   ```

2. **Compressão**: Habilite compressão gzip no servidor
   ```bash
   # Para Cloud Storage, upload com compressão
   gsutil -m -h "Content-Encoding:gzip" cp arquivo.js.gz gs://bucket/
   ```

### Segurança

1. **HTTPS**: Cloud Storage e Firebase já fornecem HTTPS automaticamente
2. **CORS**: Configure CORS se necessário
   ```bash
   gsutil cors set cors.json gs://meu-site-produtividade/
   ```

### Custos

- **Cloud Storage**: ~$0.026/GB por mês + transferência
- **Firebase**: 10GB armazenamento e 360MB/dia grátis
- Para site estático pequeno: **praticamente gratuito**

### Monitoramento

1. Ative o Cloud Monitoring no GCP
2. Configure alertas de uso
3. Monitore erros no Console do GCP

---

## 🛠️ Desenvolvimento Local

```bash
# Servir localmente (requer Python)
python -m http.server 8000

# Ou com Node.js
npx http-server -p 8000

# Acessar em: http://localhost:8000
```

---

## 📝 Atualizações

Para atualizar o site após alterações:

```bash
# Commit das alterações
git add .
git commit -m "Descrição das mudanças"
git push

# Upload para GCS
gsutil -m rsync -r . gs://meu-site-produtividade/

# Ou com Firebase
firebase deploy
```

---

## 🎓 Recursos de Aprendizado

- [Documentação GCP](https://cloud.google.com/docs)
- [Cloud Storage - Hosting](https://cloud.google.com/storage/docs/hosting-static-website)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Service Workers](https://developers.google.com/web/fundamentals/primers/service-workers)
- [Progressive Web Apps](https://web.dev/progressive-web-apps/)

---

## 📄 Licença

Este projeto é de código aberto para fins educacionais.

---

## 🤝 Contribuindo

Sinta-se livre para fazer fork, melhorar e enviar pull requests!

---

**Desenvolvido como projeto de aprendizado para GCP** 🚀
