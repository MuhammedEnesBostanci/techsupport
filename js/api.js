// ==========================================
// STACK EXCHANGE API WRAPPER
// ==========================================

const API_BASE = 'https://api.stackexchange.com/2.3';
const SITE = 'stackoverflow';

// Cache sistemi
const cache = {
    questions: {},
    tags: {},
    answers: {}
};

/**
 * Soruları Stack Exchange API'dan çek
 * @param {string} tag - Etiket adı
 * @param {number} pagesize - Sayfa boyutu
 * @returns {Object} API sonucu
 */
async function getQuestions(tag = 'javascript', pagesize = 100) {
    // Cache kontrol et
    const cacheKey = `${tag}_${pagesize}`;
    if (cache.questions[cacheKey]) {
        return {
            success: true,
            data: cache.questions[cacheKey],
            fromCache: true
        };
    }

    const url = `${API_BASE}/questions?order=desc&sort=activity&site=${SITE}&tagged=${tag}&pagesize=${pagesize}&filter=default`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // API hata kontrolü
        if (data.error_id) {
            console.warn('API Uyarısı:', data.error_message);
            return getExampleQuestions(tag, pagesize);
        }
        
        // Cache'le
        cache.questions[cacheKey] = data.items;
        
        return {
            success: true,
            data: data.items,
            fromCache: false
        };
    } catch (error) {
        console.error('API çağrısı başarısız, örnek veriye geçiliyor:', error);
        return {
            success: true,
            data: getExampleQuestions(tag, pagesize).data,
            fromCache: false,
            isExample: true
        };
    }
}

// Soru detayını çek
async function getQuestionDetail(questionId) {
    const url = `${API_BASE}/questions/${questionId}?order=desc&sort=activity&site=${SITE}&filter=withbody`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
            console.warn('API\'den soru bulunamadı, örnek veriye geçiliyor:', questionId);
            return getExampleQuestionDetail(questionId);
        }
        
        return {
            success: true,
            data: data.items[0],
            fromCache: false
        };
    } catch (error) {
        console.error('API çağrısı başarısız, örnek veriye geçiliyor:', error);
        return getExampleQuestionDetail(questionId);
    }
}

// Cevapları çek
async function getAnswers(questionId) {
    const cacheKey = `answers_${questionId}`;
    if (cache.answers[cacheKey]) {
        return {
            success: true,
            data: cache.answers[cacheKey],
            fromCache: true
        };
    }

    const url = `${API_BASE}/questions/${questionId}/answers?order=desc&sort=votes&site=${SITE}&filter=withbody&pagesize=20`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (!data.items) {
            return { success: true, data: [] };
        }
        
        cache.answers[cacheKey] = data.items;
        
        return {
            success: true,
            data: data.items
        };
    } catch (error) {
        console.error('Cevap yükleme hatası:', error);
        return { success: true, data: [] };
    }
}

// Popüler tagları çek
async function getPopularTags() {
    if (cache.tags.popular) {
        return {
            success: true,
            data: cache.tags.popular
        };
    }

    const url = `${API_BASE}/tags?order=desc&sort=popular&site=${SITE}&pagesize=15`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (!data.items) {
            throw new Error('No tags returned');
        }
        
        cache.tags.popular = data.items;
        
        return {
            success: true,
            data: data.items
        };
    } catch (error) {
        console.error('Popüler taglar alınamadı, örnek veriler gösteriliyor:', error);
        return {
            success: true,
            data: [
                { name: 'javascript', count: 2500000 },
                { name: 'python', count: 1800000 },
                { name: 'java', count: 1600000 },
                { name: 'react', count: 950000 },
                { name: 'node.js', count: 850000 },
                { name: 'typescript', count: 720000 },
                { name: 'angular', count: 680000 },
                { name: 'vue.js', count: 520000 },
                { name: 'php', count: 1200000 },
                { name: 'c#', count: 1100000 }
            ]
        };
    }
}

// Soruları ara
async function searchQuestions(q) {
    const url = `${API_BASE}/search/advanced?title=${encodeURIComponent(q)}&sort=relevance&order=desc&site=${SITE}&pagesize=20`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        return {
            success: true,
            data: data.items || []
        };
    } catch (error) {
        console.error('Arama hatası:', error);
        return { success: false, data: [] };
    }
}

// ==========================================
// ÖRNEK VERİ (FALLBACK)
// ==========================================

function getExampleQuestions(tag, limit) {
    const examples = {
        javascript: [
            {
                question_id: 9887622,
                title: 'async/await nedir ve nasıl çalışır?',
                tags: ['javascript', 'async-await', 'promises'],
                score: 523,
                answer_count: 8,
                view_count: 12540,
                creation_date: Math.floor(Date.now() / 1000) - 86400 * 5,
                owner: {
                    display_name: 'Ahmet Yılmaz',
                    reputation: 8250,
                    profile_image: 'https://www.gravatar.com/avatar/a1b2c3?d=identicon'
                },
                excerpt: 'JavaScript\'de async/await kullanarak nasıl asenkron işlem yapabileceğimi öğrenmek istiyorum.'
            },
            {
                question_id: 52883734,
                title: 'React hooks nedir ve ne zaman kullanmalıyız?',
                tags: ['javascript', 'reactjs', 'hooks'],
                score: 418,
                answer_count: 5,
                view_count: 9870,
                creation_date: Math.floor(Date.now() / 1000) - 86400 * 3,
                owner: {
                    display_name: 'Fatih Akpınar',
                    reputation: 6120,
                    profile_image: 'https://www.gravatar.com/avatar/b2c3d4?d=identicon'
                },
                excerpt: 'Class components yerine React hooks kullanmanın avantajları nelerdir?'
            },
            {
                question_id: 40590141,
                title: 'Node.js ile basit bir REST API nasıl oluşturulur?',
                tags: ['javascript', 'node.js', 'api', 'rest'],
                score: 342,
                answer_count: 12,
                view_count: 15230,
                creation_date: Math.floor(Date.now() / 1000) - 86400 * 7,
                owner: {
                    display_name: 'Zeynep Kaya',
                    reputation: 5890,
                    profile_image: 'https://www.gravatar.com/avatar/c3d4e5?d=identicon'
                },
                excerpt: 'Express.js kullanarak basit bir CRUD API oluşturma adımlarını öğrenmek istiyorum.'
            },
            {
                question_id: 806107,
                title: 'var, let, const arasındaki fark nedir?',
                tags: ['javascript', 'scope', 'variables'],
                score: 621,
                answer_count: 4,
                view_count: 28450,
                creation_date: Math.floor(Date.now() / 1000) - 86400 * 10,
                owner: {
                    display_name: 'Mustafa Özdemir',
                    reputation: 7650,
                    profile_image: 'https://www.gravatar.com/avatar/d4e5f6?d=identicon'
                },
                excerpt: 'JavaScript\'de var, let ve const arasındaki temel farklar nelerdir?'
            }
        ],
        python: [
            {
                question_id: 21008421,
                title: 'Python list comprehension nasıl çalışır?',
                tags: ['python', 'list', 'comprehension'],
                score: 445,
                answer_count: 6,
                view_count: 11200,
                creation_date: Math.floor(Date.now() / 1000) - 86400 * 4,
                owner: {
                    display_name: 'Emre Şahin',
                    reputation: 5420,
                    profile_image: 'https://www.gravatar.com/avatar/e5f6g7?d=identicon'
                },
                excerpt: 'Python\'da list comprehension kullanarak nasıl daha temiz kod yazabilirim?'
            },
            {
                question_id: 16851332,
                title: 'Django ve Flask hangisini seçmeliyim?',
                tags: ['python', 'django', 'flask', 'web-frameworks'],
                score: 367,
                answer_count: 9,
                view_count: 18750,
                creation_date: Math.floor(Date.now() / 1000) - 86400 * 6,
                owner: {
                    display_name: 'Ayşe Demir',
                    reputation: 6780,
                    profile_image: 'https://www.gravatar.com/avatar/f6g7h8?d=identicon'
                },
                excerpt: 'Web uygulaması geliştirirken Django veya Flask\'ı seçmek konusunda rehberlik istiyorum.'
            }
        ],
        react: [
            {
                question_id: 48329629,
                title: 'React state yönetimi için Redux gerekli mi?',
                tags: ['react', 'redux', 'state-management'],
                score: 512,
                answer_count: 7,
                view_count: 13400,
                creation_date: Math.floor(Date.now() / 1000) - 86400 * 2,
                owner: {
                    display_name: 'Cem Kılıç',
                    reputation: 7120,
                    profile_image: 'https://www.gravatar.com/avatar/g7h8i9?d=identicon'
                },
                excerpt: 'Tüm React uygulamaları Redux kullanmalı mı yoksa başka alternatifler var mı?'
            }
        ]
    };;

    const questions = examples[tag] || examples.javascript;
    return {
        success: true,
        data: questions.slice(0, limit),
        isExample: true
    };
}

/**
 * Örnek soru detayı getir
 */
function getExampleQuestionDetail(questionId) {
    const allQuestions = [
        {
            question_id: 9887622,
            title: 'async/await nedir ve nasıl çalışır?',
            tags: ['javascript', 'async-await', 'promises'],
            score: 523,
            answer_count: 8,
            view_count: 12540,
            creation_date: Math.floor(Date.now() / 1000) - 86400 * 5,
            last_activity_date: Math.floor(Date.now() / 1000) - 3600,
            owner: {
                display_name: 'Ahmet Yılmaz',
                reputation: 8250,
                profile_image: 'https://www.gravatar.com/avatar/a1b2c3?d=identicon',
                link: 'https://stackoverflow.com/users/1'
            },
            link: 'https://stackoverflow.com/questions/9887622',
            body: '<p>JavaScript\'de <code>async/await</code> kullanarak asenkron işlemler nasıl yapılır?</p><p>Promise chain yerine daha temiz kod yazmak istiyorum.</p>'
        },
        {
            question_id: 52883734,
            title: 'React hooks nedir ve ne zaman kullanmalıyız?',
            tags: ['javascript', 'reactjs', 'hooks'],
            score: 418,
            answer_count: 5,
            view_count: 9870,
            creation_date: Math.floor(Date.now() / 1000) - 86400 * 3,
            last_activity_date: Math.floor(Date.now() / 1000) - 7200,
            owner: {
                display_name: 'Fatih Akpınar',
                reputation: 6120,
                profile_image: 'https://www.gravatar.com/avatar/b2c3d4?d=identicon',
                link: 'https://stackoverflow.com/users/2'
            },
            link: 'https://stackoverflow.com/questions/52883734',
            body: '<p>React 16.8\'den itibaren hooks tanıtıldı. Class components yerine hooks kullanmanın avantajları nelerdir?</p>'
        },
        {
            question_id: 40590141,
            title: 'Node.js ile basit bir REST API nasıl oluşturulur?',
            tags: ['javascript', 'node.js', 'api', 'rest'],
            score: 342,
            answer_count: 12,
            view_count: 15230,
            creation_date: Math.floor(Date.now() / 1000) - 86400 * 7,
            last_activity_date: Math.floor(Date.now() / 1000) - 10800,
            owner: {
                display_name: 'Zeynep Kaya',
                reputation: 5890,
                profile_image: 'https://www.gravatar.com/avatar/c3d4e5?d=identicon',
                link: 'https://stackoverflow.com/users/3'
            },
            link: 'https://stackoverflow.com/questions/40590141',
            body: '<p>Express.js ile basit bir CRUD API oluşturmayı adım adım öğrenmek istiyorum. Nasıl başlamalıyım?</p>'
        }
    ];

    const question = allQuestions.find(q => q.question_id == questionId) || allQuestions[0];
    
    return {
        success: true,
        data: question,
        fromCache: true,
        isExample: true
    };
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * HTML entity'leri decode et
 */
function decodeHTML(html) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = html;
    return textarea.value;
}

/**
 * Tarihi formatla (relative time)
 */
function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    const months = Math.floor(diff / (86400000 * 30));

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 30) return `${days}d`;
    if (months < 12) return `${months}ay`;

    return date.toLocaleDateString('tr-TR');
}

/**
 * Reputation puanını formatla
 */
function formatReputation(rep) {
    if (rep >= 1000000) return (rep / 1000000).toFixed(1) + 'M';
    if (rep >= 1000) return (rep / 1000).toFixed(1) + 'K';
    return rep.toString();
}

/**
 * View sayısını formatla
 */
function formatViews(views) {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
    return views.toString();
}