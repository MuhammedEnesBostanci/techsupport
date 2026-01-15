// ==========================================
// STACK EXCHANGE API - Yazılım Destek Hub
// ==========================================

class StackExchangeAPI {
    constructor() {
        this.baseURL = 'https://api.stackexchange.com/2.3';
        this.site = 'stackoverflow';
        this.pageSize = 12;
        this.currentPage = 1;
        this.cache = {};
    }

    /**
     * Stack Exchange'den soruları çek
     * @param {Object} options - İstek parametreleri
     * @returns {Promise<Array>} Sorular dizisi
     */
    async getQuestions(options = {}) {
        const {
            tagged = 'javascript',
            sort = 'newest',
            order = 'desc',
            page = 1,
            pagesize = this.pageSize
        } = options;

        const params = new URLSearchParams({
            site: this.site,
            tagged: tagged,
            sort: sort,
            order: order,
            page: page,
            pagesize: pagesize,
            filter: 'default' // Temel bilgileri getir
        });

        const url = `${this.baseURL}/questions?${params}`;

        try {
            console.log('API çağrılıyor:', url);
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`API Hatası: ${response.status}`);
            }

            const data = await response.json();

            if (data.error_id) {
                throw new Error(`Stack Exchange Hatası: ${data.error_message}`);
            }

            // Veriyi dönüştür ve iyileştir
            const questions = data.items.map(q => ({
                id: q.question_id,
                title: decodeHTML(q.title),
                tags: q.tags,
                score: q.score,
                answers: q.answer_count,
                views: q.view_count,
                created: new Date(q.creation_date * 1000),
                link: q.link,
                owner: {
                    name: q.owner.display_name,
                    reputation: q.owner.reputation,
                    avatar: q.owner.profile_image
                },
                excerpt: q.excerpt ? decodeHTML(q.excerpt) : 'Konu özeti yok'
            }));

            console.log(`✅ ${questions.length} soru yüklendi`);
            return questions;

        } catch (error) {
            console.error('❌ Soru yükleme hatası:', error);
            return [];
        }
    }

    /**
     * Belirli bir soruyu detaylı getir (cevaplarla birlikte)
     * @param {number} questionId - Soru ID'si
     * @returns {Promise<Object>} Soru detayları
     */
    async getQuestionDetail(questionId) {
        const params = new URLSearchParams({
            site: this.site,
            filter: 'default'
        });

        const url = `${this.baseURL}/questions/${questionId}?${params}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.error_id) {
                throw new Error(data.error_message);
            }

            const question = data.items[0];

            return {
                id: question.question_id,
                title: decodeHTML(question.title),
                body: question.body,
                tags: question.tags,
                score: question.score,
                views: question.view_count,
                answers: question.answer_count,
                created: new Date(question.creation_date * 1000),
                link: question.link,
                owner: {
                    name: question.owner.display_name,
                    reputation: question.owner.reputation,
                    avatar: question.owner.profile_image
                }
            };

        } catch (error) {
            console.error('❌ Detay yükleme hatası:', error);
            return null;
        }
    }

    /**
     * Soruları tage göre filtrele
     * @param {string} tag - Etiket (örn: 'javascript', 'python')
     * @param {number} page - Sayfa numarası
     * @returns {Promise<Array>} Filtrelenmiş sorular
     */
    async getQuestionsByTag(tag, page = 1) {
        return this.getQuestions({
            tagged: tag,
            sort: 'newest',
            page: page
        });
    }

    /**
     * Soruları ara
     * @param {string} q - Arama terimi
     * @param {number} page - Sayfa numarası
     * @returns {Promise<Array>} Arama sonuçları
     */
    async searchQuestions(q, page = 1) {
        const params = new URLSearchParams({
            site: this.site,
            intitle: q,
            sort: 'relevance',
            order: 'desc',
            page: page,
            pagesize: this.pageSize,
            filter: 'default'
        });

        const url = `${this.baseURL}/search/advanced?${params}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            return data.items.map(q => ({
                id: q.question_id,
                title: decodeHTML(q.title),
                tags: q.tags,
                score: q.score,
                answers: q.answer_count,
                views: q.view_count,
                created: new Date(q.creation_date * 1000),
                link: q.link,
                owner: {
                    name: q.owner.display_name,
                    reputation: q.owner.reputation
                }
            }));

        } catch (error) {
            console.error('❌ Arama hatası:', error);
            return [];
        }
    }

    /**
     * Popüler etiketleri getir
     * @returns {Promise<Array>} Etiket listesi
     */
    async getPopularTags() {
        const params = new URLSearchParams({
            site: this.site,
            sort: 'popular',
            pagesize: 20,
            filter: 'default'
        });

        const url = `${this.baseURL}/tags?${params}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            return data.items.map(tag => ({
                name: tag.name,
                count: tag.count,
                hassynonyms: tag.has_synonyms
            })).slice(0, 15); // İlk 15 etiketi dön

        } catch (error) {
            console.error('❌ Etiket yükleme hatası:', error);
            return [];
        }
    }

    /**
     * Belirli bir kullanıcının sorularını getir
     * @param {string} username - Kullanıcı adı
     * @returns {Promise<Array>} Kullanıcının soruları
     */
    async getUserQuestions(username) {
        const params = new URLSearchParams({
            site: this.site,
            inname: username,
            sort: 'newest'
        });

        const url = `${this.baseURL}/users?${params}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.items.length === 0) {
                console.warn('Kullanıcı bulunamadı');
                return [];
            }

            const userId = data.items[0].user_id;
            const questionsURL = `${this.baseURL}/users/${userId}/questions?site=${this.site}&sort=newest&pagesize=10`;
            
            const questionsResponse = await fetch(questionsURL);
            const questionsData = await questionsResponse.json();

            return questionsData.items.map(q => ({
                id: q.question_id,
                title: decodeHTML(q.title),
                score: q.score,
                answers: q.answer_count,
                views: q.view_count,
                link: q.link
            }));

        } catch (error) {
            console.error('❌ Kullanıcı sorgusu hatası:', error);
            return [];
        }
    }

    /**
     * Belirli bir sorunun cevaplarını getir
     * @param {number} questionId - Soru ID'si
     * @returns {Promise<Array>} Cevaplar
     */
    async getAnswers(questionId) {
        const params = new URLSearchParams({
            site: this.site,
            sort: 'votes',
            pagesize: 10,
            filter: 'default'
        });

        const url = `${this.baseURL}/questions/${questionId}/answers?${params}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            return data.items.map(a => ({
                id: a.answer_id,
                score: a.score,
                isAccepted: a.is_accepted,
                created: new Date(a.creation_date * 1000),
                body: a.body,
                owner: {
                    name: a.owner.display_name,
                    reputation: a.owner.reputation,
                    avatar: a.owner.profile_image
                },
                link: `https://stackoverflow.com/a/${a.answer_id}`
            }));

        } catch (error) {
            console.error('❌ Cevap yükleme hatası:', error);
            return [];
        }
    }
}

// ==========================================
// UI YÖNETİCİ
// ==========================================

class UIManager {
    constructor(apiManager) {
        this.api = apiManager;
        this.currentQuestions = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialQuestions();
    }

    setupEventListeners() {
        // Arama formu
        const searchForm = document.getElementById('searchForm');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const query = document.getElementById('searchInput').value;
                this.searchQuestions(query);
            });
        }

        // Etiket filtreleri
        const tagButtons = document.querySelectorAll('.tag-filter');
        tagButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tag = btn.dataset.tag;
                this.filterByTag(tag);
            });
        });

        // Sayfalandırma
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        if (prevBtn) prevBtn.addEventListener('click', () => this.previousPage());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextPage());
    }

    /**
     * İlk soruları yükle
     */
    async loadInitialQuestions() {
        console.log('📌 İlk sorular yükleniyor...');
        this.showLoading(true);

        const questions = await this.api.getQuestions({
            tagged: 'javascript',
            sort: 'newest'
        });

        this.currentQuestions = questions;
        this.renderQuestions(questions);
        this.showLoading(false);

        // Popüler etiketleri yükle
        this.loadPopularTags();
    }

    /**
     * Soruları HTML'de render et
     */
    renderQuestions(questions) {
        const container = document.getElementById('questionsContainer');
        if (!container) return;

        if (questions.length === 0) {
            container.innerHTML = '<p class="no-results">Soru bulunamadı 😔</p>';
            return;
        }

        container.innerHTML = questions.map(q => `
            <div class="question-card" onclick="window.location.href='detail.html?id=${q.id}'">
                <div class="question-header">
                    <h3 class="question-title">${q.title}</h3>
                </div>
                
                <p class="question-excerpt">${q.excerpt}</p>
                
                <div class="question-meta">
                    <span class="meta-item">
                        <strong>${q.score}</strong> Puan
                    </span>
                    <span class="meta-item">
                        <strong>${q.answers}</strong> Cevap
                    </span>
                    <span class="meta-item">
                        <strong>${q.views}</strong> Görüntülenme
                    </span>
                </div>

                <div class="question-tags">
                    ${q.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>

                <div class="question-footer">
                    <img src="${q.owner.avatar}" alt="${q.owner.name}" class="avatar">
                    <div class="owner-info">
                        <p class="owner-name">${q.owner.name}</p>
                        <p class="owner-reputation">${q.owner.reputation} Rep</p>
                    </div>
                    <span class="question-date">${this.formatDate(q.created)}</span>
                </div>
            </div>
        `).join('');
    }

    /**
     * Etiket ile filtrele
     */
    async filterByTag(tag) {
        console.log(`🏷️ Filtreleyen: ${tag}`);
        this.showLoading(true);

        const questions = await this.api.getQuestionsByTag(tag);
        this.currentQuestions = questions;
        this.renderQuestions(questions);
        this.showLoading(false);
    }

    /**
     * Soruları ara
     */
    async searchQuestions(query) {
        if (!query.trim()) return;

        console.log(`🔍 Aranıyor: ${query}`);
        this.showLoading(true);

        const questions = await this.api.searchQuestions(query);
        this.currentQuestions = questions;
        this.renderQuestions(questions);
        this.showLoading(false);
    }

    /**
     * Popüler etiketleri yükle
     */
    async loadPopularTags() {
        const container = document.getElementById('popularTags');
        if (!container) return;

        const tags = await this.api.getPopularTags();
        
        container.innerHTML = tags.map(tag => `
            <button class="tag-button tag-filter" data-tag="${tag.name}">
                ${tag.name}
                <span class="tag-count">${tag.count}</span>
            </button>
        `).join('');

        // Event listener'ları yeniden kur
        document.querySelectorAll('.tag-filter').forEach(btn => {
            btn.addEventListener('click', () => {
                const tag = btn.dataset.tag;
                this.filterByTag(tag);
            });
        });
    }

    /**
     * Yükleme göstergesi
     */
    showLoading(show) {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = show ? 'flex' : 'none';
        }
    }

    /**
     * Tarihi formatla
     */
    formatDate(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) return `${minutes}m`;
        if (hours < 24) return `${hours}h`;
        if (days < 7) return `${days}d`;
        
        return date.toLocaleDateString('tr-TR');
    }

    /**
     * Sayfa değiştir
     */
    nextPage() {
        this.api.currentPage++;
        this.loadInitialQuestions();
    }

    previousPage() {
        if (this.api.currentPage > 1) {
            this.api.currentPage--;
            this.loadInitialQuestions();
        }
    }
}

// ==========================================
// DETAY SAYFASI
// ==========================================

class DetailPageManager {
    constructor(apiManager) {
        this.api = apiManager;
        this.loadQuestionDetail();
    }

    /**
     * Soru detayını yükle
     */
    async loadQuestionDetail() {
        const params = new URLSearchParams(window.location.search);
        const questionId = params.get('id');

        if (!questionId) {
            console.error('Soru ID bulunamadı');
            return;
        }

        console.log(`📖 Soru ${questionId} yükleniyor...`);

        const question = await this.api.getQuestionDetail(questionId);
        const answers = await this.api.getAnswers(questionId);

        if (question) {
            this.renderDetail(question, answers);
        }
    }

    /**
     * Detay sayfasını render et
     */
    renderDetail(question, answers) {
        const container = document.getElementById('detailContainer');
        if (!container) return;

        const sortedAnswers = answers.sort((a, b) => {
            if (a.isAccepted) return -1;
            if (b.isAccepted) return 1;
            return b.score - a.score;
        });

        container.innerHTML = `
            <div class="detail-header">
                <h1>${question.title}</h1>
                <div class="detail-meta">
                    <span>${question.score} Puan</span>
                    <span>${question.views} Görüntülenme</span>
                    <span>${question.created.toLocaleDateString('tr-TR')}</span>
                </div>
            </div>

            <div class="question-detail-body">
                ${question.body}
            </div>

            <div class="question-tags">
                ${question.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>

            <div class="detail-owner">
                <img src="${question.owner.avatar}" alt="${question.owner.name}">
                <div>
                    <p>${question.owner.name}</p>
                    <p>${question.owner.reputation} İtibar Puanı</p>
                </div>
            </div>

            <div class="answers-section">
                <h2>${sortedAnswers.length} Cevap</h2>
                ${sortedAnswers.map(a => `
                    <div class="answer-card ${a.isAccepted ? 'accepted' : ''}">
                        ${a.isAccepted ? '<span class="accepted-badge">✓ Kabul Edildi</span>' : ''}
                        <div class="answer-score">${a.score}</div>
                        <div class="answer-body">${a.body}</div>
                        <div class="answer-footer">
                            <img src="${a.owner.avatar}" alt="${a.owner.name}">
                            <div>
                                <p>${a.owner.name}</p>
                                <p>${a.owner.reputation} Rep</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="detail-footer">
                <a href="${question.link}" target="_blank" class="btn btn-primary">
                    Stack Overflow'da Açı →
                </a>
            </div>
        `;
    }
}

// ==========================================
// HTML DECODE
// ==========================================

function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

// ==========================================
// BAŞLATMA
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // API ve UI Manager'ı başlat
    const api = new StackExchangeAPI();
    
    // Eğer ana sayfasında isek
    if (document.getElementById('questionsContainer')) {
        window.uiManager = new UIManager(api);
    }
    
    // Eğer detay sayfasında isek
    if (document.getElementById('detailContainer')) {
        window.detailManager = new DetailPageManager(api);
    }

    // Service Worker kaydet
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(reg => console.log('✅ Service Worker kayıtlı'))
            .catch(err => console.log('❌ Service Worker hatası:', err));
    }

    // Dark Mode / Light Mode Sistemi
    initializeThemeSystem();
});

// ==========================================
// DARK MODE / LIGHT MODE YÖNETIMI
// ==========================================
function initializeThemeSystem() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    // Theme toggle butonunu oluştur
    createThemeToggleButton();

    // System dark mode tercihini kontrol et
    if (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
    }
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Toggle butonunu güncelle
    const toggleBtn = document.querySelector('.theme-toggle');
    if (toggleBtn) {
        toggleBtn.textContent = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
    }
}

function createThemeToggleButton() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    // Eğer button zaten varsa, oluşturma
    if (document.querySelector('.theme-toggle')) return;

    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.textContent = currentTheme === 'dark' ? '☀️ Light' : '🌙 Dark';

    btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = current === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });

    nav.appendChild(btn);
}

// Theme geçişini dinle (sistem ayarlarına göre)
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
    }
});

// Global erişim
window.stackExchangeAPI = null;
// ==========================================
// PWA SERVICE WORKER KAYDI
// ==========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then((registration) => {
                console.log('Service Worker başarıyla kaydedildi:', registration);
                
                // Update kontrolü
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('Yeni service worker sürümü mevcut!');
                            showUpdateNotification();
                        }
                    });
                });
            })
            .catch((error) => {
                console.log('Service Worker kaydı başarısız:', error);
            });
    });

    // Kullanıcıya güncelleme hakkında bilgi ver
    function showUpdateNotification() {
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, var(--primary-green) 0%, #059669 100%);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            font-weight: 500;
        `;
        message.textContent = '✨ Yeni sürüm mevcut. Sayfa yenilenecektir...';
        document.body.appendChild(message);
        
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }
}

// ==========================================
// PWA INSTALL PROMPT
// ==========================================
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Install butonunu göster
    const installBtn = document.querySelector('[data-install-btn]');
    if (installBtn) {
        installBtn.style.display = 'block';
    }
});

// Install butonu tıklaması
function triggerInstall() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('PWA başarıyla kuruldu');
            }
            deferredPrompt = null;
        });
    }
}