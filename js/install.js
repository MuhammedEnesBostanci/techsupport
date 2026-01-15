// PWA Kurulum ve Güncelleme Yönetimi

class InstallationManager {
    constructor() {
        this.deferredPrompt = null;
        this.installButton = document.getElementById('installBtn');
        this.init();
    }

    init() {
        // Kurulum istemi dinleyicisini ayarla
        window.addEventListener('beforeinstallprompt', (e) => {
            this.handleBeforeInstallPrompt(e);
        });

        // Uygulama kuruldu dinleyicisi
        window.addEventListener('appinstalled', () => {
            this.handleAppInstalled();
        });

        // Service Worker güncellemelerini dinle
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                this.notifyUpdate();
            });

            // Güncellemeleri kontrol et
            setInterval(() => {
                this.checkForUpdates();
            }, 60000); // Her dakika kontrol et
        }

        // İlk kurulum kontrolü
        this.checkInstallationStatus();
    }

    handleBeforeInstallPrompt(e) {
        // Varsayılan kurulum istemini engelle
        e.preventDefault();
        
        // İstemi sakla
        this.deferredPrompt = e;

        // Kurulum butonunu göster
        if (this.installButton) {
            this.installButton.style.display = 'flex';
            this.installButton.addEventListener('click', () => {
                this.promptInstall();
            });
        }

        console.log('PWA Kurulum İstemi Hazır');
    }

    promptInstall() {
        if (!this.deferredPrompt) {
            return;
        }

        // Kurulum istemini göster
        this.deferredPrompt.prompt();

        // Kullanıcı yanıtını bekle
        this.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('Kullanıcı PWA kurulumunu kabul etti');
                this.trackInstall();
            } else {
                console.log('Kullanıcı PWA kurulumunu reddetti');
            }

            this.deferredPrompt = null;
            if (this.installButton) {
                this.installButton.style.display = 'none';
            }
        });
    }

    handleAppInstalled() {
        console.log('PWA Başarıyla Kuruldu');
        
        // Kurulum bilgisini sakla
        localStorage.setItem('pwaInstalled', 'true');
        localStorage.setItem('installDate', new Date().toISOString());

        // Kurulum butonunu gizle
        if (this.installButton) {
            this.installButton.style.display = 'none';
        }

        // Başarı mesajı göster
        this.showNotification('✅ Tech Support Hub başarıyla kuruldu!', 'success');
    }

    checkInstallationStatus() {
        // Kurulum durumunu kontrol et
        const isInstalled = localStorage.getItem('pwaInstalled') === 'true';
        const installDate = localStorage.getItem('installDate');

        if (isInstalled && installDate) {
            const installed = new Date(installDate);
            const now = new Date();
            const days = Math.floor((now - installed) / (1000 * 60 * 60 * 24));

            console.log(`PWA ${days} gün önce kuruldu`);

            // Kurulu uygulamayı özelleştir
            this.customizeInstalledApp();
        }
    }

    customizeInstalledApp() {
        // Kurulu uygulama için özel stilleri uygula
        if (window.navigator.standalone === true) {
            document.body.classList.add('standalone-mode');
        }
    }

    checkForUpdates() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready
                .then((registration) => {
                    registration.update();
                })
                .catch(err => {
                    console.warn('Service Worker update kontrolü başarısız:', err);
                });
        }
    }

    notifyUpdate() {
        console.log('Uygulama Güncellemesi Tespit Edildi');
        this.showNotification('Uygulama güncelleme mevcut! Sayfayı yenileyin.', 'info', {
            action: 'Yenile',
            callback: () => window.location.reload()
        });
    }

    trackInstall() {
        // Google Analytics gibi servis için kurulum olayını kaydet
        if (typeof gtag !== 'undefined') {
            gtag('event', 'app_install');
        }
    }

    showNotification(message, type = 'info', options = {}) {
        // Bildirim göster
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <p>${message}</p>
                ${options.action ? `<button class="notification-action">${options.action}</button>` : ''}
            </div>
        `;

        document.body.appendChild(notification);

        if (options.action && options.callback) {
            notification.querySelector('.notification-action').addEventListener('click', options.callback);
        }

        // 5 saniye sonra kaldır
        setTimeout(() => {
            notification.classList.add('notification-hide');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // Çevrimdışı modu kontrol et
    static isOffline() {
        return !navigator.onLine;
    }

    // Cihazın özelliklerini kontrol et
    static getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            standalone: window.navigator.standalone || false,
            platform: navigator.platform,
            online: navigator.onLine,
            storage: navigator.storage,
            webworker: typeof Worker !== 'undefined',
            indexeddb: typeof indexedDB !== 'undefined',
            serviceworker: 'serviceWorker' in navigator
        };
    }
}

// Uygulama başladığında yöneticisini başlat
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.installManager = new InstallationManager();
    } catch (error) {
        console.warn('InstallationManager başlatılamadı:', error);
    }
});

// Çevrimdışı/Çevrimiçi durum değişikliklerini dinle
window.addEventListener('online', () => {
    console.log('İnternet bağlantısı yeniden oluşturuldu');
    if (window.installManager) {
        window.installManager.showNotification('Bağlantı Geri Yüklendi ✅', 'success');
    }
});

window.addEventListener('offline', () => {
    console.log('İnternet bağlantısı kesildi');
    if (window.installManager) {
        window.installManager.showNotification('İnternet Bağlantısı Kesildi ⚠️', 'warning');
    }
});
