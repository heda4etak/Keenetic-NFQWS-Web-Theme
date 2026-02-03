export function applyVersion(UI) {
    Object.assign(UI.prototype, {
        initBaseState() {
            const theme = localStorage.getItem('theme') || 'dark';
            localStorage.setItem('theme', theme);
            document.documentElement.dataset.theme = theme;

            const lang = localStorage.getItem('lang') || 'en';
            document.documentElement.lang = lang;

            document.body.classList.remove('disabled');
            if (localStorage.getItem('hasSession') === 'true') {
                document.body.classList.add('authenticated');
            }
        },

        initVersion() {
            const element = this.dom.version;

            const value = () => {
                const match = element?.textContent?.match(/^v([0-9]+)\.([0-9]+)\.([0-9]+)$/);
                return match ? [match[1], match[2], match[3]] : null;
            };

            const checkUpdate = async () => {
                if (!value()) {
                    return;
                }

                const latest = await this.getLatestVersion();
                if (!latest) {
                    return;
                }

                const updateAvailable = this.compareVersions(value(), latest);
                if (updateAvailable && element) {
                    const link = document.createElement('a');
                    const tag = `v${latest[0]}.${latest[1]}.${latest[2]}`;
                    link.textContent = `(${tag})`;
                    link.href = `https://github.com/Anonym-tsk/nfqws-keenetic/releases/tag/${tag}`;
                    link.target = '_blank';
                    link.rel = 'noopener';
                    element.appendChild(link);
                }
            };

            this.version = {
                get value() {
                    return value();
                },
                checkUpdate,
            };

            this.updateVersionFromBackend();
            return this.version;
        },

        async updateVersionFromBackend() {
            if (!this.dom.version) return;
            try {
                const response = await this.postData({ cmd: 'getversion' });
                if (response && response.status === 0 && response.version) {
                    this.dom.version.textContent = `v${response.version}`;
                    await this.version?.checkUpdate?.();
                } else {
                    this.dom.version.textContent = 'vunknown';
                }
            } catch (error) {
                this.dom.version.textContent = 'vunknown';
            }
        },

        async getLatestVersion() {
            if (typeof window !== 'undefined' && window.MOCK_UPDATE_VERSION) {
                const match = String(window.MOCK_UPDATE_VERSION).match(/^([0-9]+)\.([0-9]+)\.([0-9]+)$/);
                if (match) {
                    return [match[1], match[2], match[3]];
                }
            }
            try {
                const response = await fetch('https://api.github.com/repos/Anonym-tsk/nfqws-keenetic/releases/latest');
                const data = await response.json();
                const tag = data.tag_name;
                const match = tag.match(/^v([0-9]+)\.([0-9]+)\.([0-9]+)$/);
                return [match[1], match[2], match[3]];
            } catch (e) {
                return null;
            }
        },

        compareVersions(current, latest) {
            const v1 = latest[0] - current[0];
            const v2 = latest[1] - current[1];
            const v3 = latest[2] - current[2];
            if (v1) return v1 > 0;
            if (v2) return v2 > 0;
            if (v3) return v3 > 0;
            return false;
        },
    });
}
