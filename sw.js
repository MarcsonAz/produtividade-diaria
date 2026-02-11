/**
 * Service Worker para cache offline
 * Permite que a aplicação funcione mesmo sem conexão
 */

const CACHE_NAME = 'produtividade-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles/main.css',
    '/styles/tasks.css',
    '/styles/timer.css',
    '/js/utils.js',
    '/js/storage.js',
    '/js/tasks.js',
    '/js/timer.js',
    '/js/app.js'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
    console.log('[SW] Instalando Service Worker...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Cache aberto, adicionando arquivos...');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('[SW] Todos os arquivos foram cacheados');
                return self.skipWaiting();
            })
    );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
    console.log('[SW] Ativando Service Worker...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[SW] Service Worker ativado');
            return self.clients.claim();
        })
    );
});

// Interceptação de requisições (estratégia Cache First)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Retorna do cache se disponível
                if (response) {
                    console.log('[SW] Servindo do cache:', event.request.url);
                    return response;
                }
                
                // Caso contrário, busca da rede
                console.log('[SW] Buscando da rede:', event.request.url);
                return fetch(event.request)
                    .then((response) => {
                        // Verifica se a resposta é válida
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clona a resposta
                        const responseToCache = response.clone();
                        
                        // Adiciona ao cache
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // Se falhar, pode retornar uma página offline personalizada
                        console.log('[SW] Falha ao buscar da rede');
                    });
            })
    );
});

// Listener para mensagens do cliente
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        return caches.delete(cacheName);
                    })
                );
            })
        );
    }
});
