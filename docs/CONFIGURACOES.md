# ⚙️ Configurações Adicionais e Troubleshooting

## 🔧 Configurações Importantes

### 1. Domínio Personalizado

Para usar seu próprio domínio (ex: `produtividade.meusite.com`):

**Cloud Storage:**
```bash
# Verificar domínio
gcloud domains verify meusite.com

# Criar bucket com nome do domínio
gsutil mb gs://produtividade.meusite.com

# Configurar DNS (adicione registro CNAME)
# Nome: produtividade
# Valor: c.storage.googleapis.com
```

**Firebase:**
```bash
firebase hosting:site:create meusite
firebase target:apply hosting meusite meusite
firebase deploy --only hosting:meusite
```

### 2. HTTPS e SSL

- **Cloud Storage**: HTTPS automático via `storage.googleapis.com`
- **Domínio customizado**: Use Cloud Load Balancer + SSL certificate
- **Firebase**: HTTPS automático e gratuito

### 3. CDN (Content Delivery Network)

Ative Cloud CDN para melhorar velocidade globalmente:

```bash
# Criar Load Balancer com CDN
gcloud compute backend-buckets create meu-backend-bucket \
    --gcs-bucket-name=meu-site-produtividade \
    --enable-cdn
```

Custo adicional: ~$0.02/GB de cache

### 4. Headers de Segurança

Adicione headers importantes para segurança:

```bash
# Via gsutil (para Cloud Storage)
gsutil setmeta \
  -h "Content-Security-Policy: default-src 'self' 'unsafe-inline'" \
  -h "X-Content-Type-Options: nosniff" \
  -h "X-Frame-Options: DENY" \
  -h "Referrer-Policy: strict-origin-when-cross-origin" \
  gs://meu-site-produtividade/index.html
```

### 5. Monitoramento e Analytics

**Google Analytics:**
Adicione no `<head>` do index.html:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Cloud Monitoring:**
```bash
# Criar alerta de alto uso
gcloud alpha monitoring policies create \
    --notification-channels=CHANNEL_ID \
    --display-name="Alto uso do site" \
    --condition-threshold-value=1000 \
    --condition-threshold-duration=300s
```

### 6. Backup Automático

Configure backup automático dos dados:

**Versionamento do bucket:**
```bash
gsutil versioning set on gs://meu-site-produtividade/
```

**Lifecycle para limpeza:**
Crie `lifecycle.json`:
```json
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {
          "age": 365,
          "isLive": false
        }
      }
    ]
  }
}
```

Aplique:
```bash
gsutil lifecycle set lifecycle.json gs://meu-site-produtividade/
```

---

## 🐛 Troubleshooting

### Problema: Site não carrega

**Possíveis causas:**
1. Bucket não está público
   ```bash
   gsutil iam ch allUsers:objectViewer gs://meu-site-produtividade/
   ```

2. Arquivo index.html não foi configurado
   ```bash
   gsutil web set -m index.html gs://meu-site-produtividade/
   ```

3. Caminho incorreto
   - Verifique: `https://storage.googleapis.com/SEU-BUCKET/index.html`

### Problema: Service Worker não funciona

**Soluções:**
1. Verifique se está usando HTTPS (obrigatório)
2. Limpe o cache do navegador (Ctrl + Shift + Delete)
3. Desregistre o SW no DevTools:
   - F12 → Application → Service Workers → Unregister

### Problema: localStorage não salva dados

**Soluções:**
1. Verifique modo anônimo/privado do navegador
2. Verifique se cookies estão bloqueados
3. Teste em outro navegador
4. Veja o console (F12) para erros

### Problema: CSS/JS não carrega

**Soluções:**
1. Verifique caminhos relativos vs absolutos
2. Limpe cache do bucket:
   ```bash
   gsutil -m setmeta -h "Cache-Control:no-cache" gs://meu-site-produtividade/**
   ```

3. Verifique MIME types:
   ```bash
   gsutil setmeta -h "Content-Type:text/css" gs://meu-site-produtividade/styles/*.css
   gsutil setmeta -h "Content-Type:application/javascript" gs://meu-site-produtividade/js/*.js
   ```

### Problema: "Permission Denied" no gsutil

**Soluções:**
1. Re-autentique:
   ```bash
   gcloud auth login
   ```

2. Verifique permissões do projeto:
   ```bash
   gcloud projects get-iam-policy produtividade-diaria
   ```

3. Adicione papel de Storage Admin:
   ```bash
   gcloud projects add-iam-policy-binding produtividade-diaria \
       --member="user:seu-email@gmail.com" \
       --role="roles/storage.admin"
   ```

### Problema: Quota excedida

**Soluções:**
1. Verifique uso atual:
   ```bash
   gcloud compute project-info describe --project=produtividade-diaria
   ```

2. Aumente quotas no Console do GCP:
   - IAM & Admin → Quotas

3. Otimize arquivos (minificação, compressão)

### Problema: Deploy falha

**Firebase:**
```bash
# Limpe cache e tente novamente
firebase use --clear
firebase use --add
firebase deploy --debug
```

**Cloud Storage:**
```bash
# Verifique conectividade
gsutil ls

# Force re-upload
gsutil -m rsync -r -d . gs://meu-site-produtividade/
```

---

## 📊 Otimização de Performance

### 1. Minificação

**CSS:**
```bash
npm install -g clean-css-cli
cleancss -o styles/main.min.css styles/main.css styles/tasks.css styles/timer.css
```

**JavaScript:**
```bash
npm install -g terser
terser js/app.js js/utils.js js/storage.js js/tasks.js js/timer.js -o js/bundle.min.js
```

### 2. Compressão Gzip

```bash
# Comprimir arquivos
gzip -9 -k -f styles/main.css
gzip -9 -k -f js/app.js

# Upload com encoding correto
gsutil -h "Content-Encoding:gzip" -h "Content-Type:text/css" \
  cp styles/main.css.gz gs://meu-site-produtividade/styles/main.css

gsutil -h "Content-Encoding:gzip" -h "Content-Type:application/javascript" \
  cp js/app.js.gz gs://meu-site-produtividade/js/app.js
```

### 3. Lazy Loading

Para imagens futuras, adicione:
```html
<img src="imagem.jpg" loading="lazy" alt="Descrição">
```

### 4. Preload de recursos críticos

```html
<link rel="preload" href="styles/main.css" as="style">
<link rel="preload" href="js/app.js" as="script">
```

---

## 🔒 Segurança Adicional

### 1. Content Security Policy (CSP)

No index.html, adicione:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline';">
```

### 2. Proteção contra Clickjacking

```html
<meta http-equiv="X-Frame-Options" content="DENY">
```

### 3. HTTPS estrito

```html
<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
```

---

## 💰 Estimativa de Custos

Para um site simples com ~100MB e 1000 visualizações/mês:

**Cloud Storage:**
- Armazenamento: $0.026/GB/mês = ~$0.003
- Transferência: Primeiros 1GB grátis = $0.00
- **Total: < $0.01/mês** ✅

**Firebase Hosting:**
- Até 10GB armazenamento: Grátis
- Até 360MB/dia transferência: Grátis
- **Total: $0.00/mês** ✅✅

**App Engine:**
- Instâncias: ~$50/mês (sempre ligado)
- **Não recomendado para site estático** ❌

---

## 🎯 Próximos Passos

1. **PWA**: Transformar em Progressive Web App
   - Adicione manifest.json
   - Configure ícones
   - Melhore o Service Worker

2. **CI/CD**: Automatize deploys
   - GitHub Actions
   - Cloud Build

3. **Testes**: Adicione testes automatizados
   - Jest para JS
   - Lighthouse para performance

4. **Acessibilidade**: Melhore a11y
   - Testes com WAVE
   - Aria labels
   - Contraste de cores

---

## 📞 Suporte

- [Documentação GCP](https://cloud.google.com/docs)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/google-cloud-platform)
- [Community Forum](https://www.googlecloudcommunity.com/)
- [Status do GCP](https://status.cloud.google.com/)

---

**Boa sorte com seu projeto! 🚀**
