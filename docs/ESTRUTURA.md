# Estrutura do Projeto - Produtividade Diária

```
produtividade-diaria/
│
├── 📄 index.html              # Página principal da aplicação
├── 🔧 sw.js                   # Service Worker para cache offline
│
├── 📁 styles/                 # Arquivos de estilos CSS
│   ├── main.css              # Estilos base, variáveis CSS, layout
│   ├── tasks.css             # Estilos específicos da lista de tarefas
│   └── timer.css             # Estilos específicos do cronômetro
│
├── 📁 js/                     # Arquivos JavaScript
│   ├── app.js                # Inicialização da aplicação
│   ├── utils.js              # Funções utilitárias (formatação, sanitização)
│   ├── storage.js            # Gerenciamento de localStorage
│   ├── tasks.js              # Lógica da lista de tarefas
│   └── timer.js              # Lógica do cronômetro
│
├── 📁 docs/                   # Documentação
│   ├── README.md             # Documentação principal e guia de deploy
│   └── CONFIGURACOES.md      # Configurações avançadas e troubleshooting
│
└── 📁 config/                 # Arquivos de configuração
    ├── .gitignore            # Arquivos ignorados pelo Git
    ├── app.yaml              # Configuração para App Engine (opcional)
    └── cors.json             # Configuração CORS para Cloud Storage

```

## 📝 Descrição dos Arquivos

### Arquivos Principais

- **index.html**: Estrutura HTML da aplicação com duas colunas (tarefas e cronômetro)
- **sw.js**: Service Worker que permite funcionamento offline via cache

### Estilos (styles/)

- **main.css**: Estilos globais, variáveis CSS, reset, layout responsivo
- **tasks.css**: Estilos da coluna de tarefas, checkbox customizado, animações
- **timer.css**: Estilos do cronômetro, display de tempo, voltas registradas

### JavaScript (js/)

- **app.js**: Inicializa a aplicação, gerencia eventos globais, atalhos
- **utils.js**: Funções auxiliares (formatação de tempo, data, sanitização)
- **storage.js**: Abstração do localStorage com cache e versionamento
- **tasks.js**: Gerenciador de tarefas (adicionar, remover, completar)
- **timer.js**: Gerenciador do cronômetro (start, pause, reset, voltas)

### Documentação (docs/)

- **README.md**: Guia completo de instalação e deploy no GCP
- **CONFIGURACOES.md**: Configurações avançadas, otimizações, troubleshooting

### Configuração (config/)

- **.gitignore**: Lista de arquivos/pastas ignorados pelo Git
- **app.yaml**: Configuração para deploy no Google App Engine
- **cors.json**: Configuração CORS para Cloud Storage

## 🎯 Características Técnicas

### Frontend
- HTML5 semântico
- CSS3 com variáveis customizadas
- JavaScript vanilla (ES6+)
- Responsivo (mobile-first)

### Armazenamento
- LocalStorage para persistência
- Service Worker para cache offline
- Versionamento de dados

### Funcionalidades
- Lista de tarefas CRUD completo
- Cronômetro com precisão de milissegundos
- Registro de voltas com comparação
- Salvamento automático
- Atalhos de teclado

### Otimizações
- Cache inteligente
- Lazy evaluation
- Debounce em eventos
- Minificação pronta (via build)

## 🚀 Para Começar

1. Clone ou baixe todos os arquivos mantendo a estrutura
2. Siga o README.md para deploy no GCP
3. Consulte CONFIGURACOES.md para otimizações

## 📦 Pronto para Deploy

Todos os arquivos estão prontos para:
- ✅ Upload no Cloud Storage
- ✅ Deploy no Firebase Hosting
- ✅ Deploy no App Engine
- ✅ Versionamento no GitHub
