self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SYNC') {
    self._tasks = e.data.tasks;
    self._user = e.data.user;
    self._alarm = e.data.alarm;
  }
});

const PN = ['Bomdod', 'Quyosh', 'Peshin', 'Asr', 'Shom', 'Xufton'];
const PT = {
  1: ['06:32', '08:06', '13:00', '15:28', '17:58', '19:22'],
  2: ['06:10', '07:44', '12:59', '15:52', '18:19', '19:44'],
  3: ['05:28', '06:58', '12:55', '16:18', '18:58', '20:23'],
  4: ['04:42', '06:12', '12:47', '16:44', '19:36', '21:02'],
  5: ['04:02', '05:32', '12:42', '17:04', '20:07', '21:34'],
  6: ['03:42', '05:18', '12:43', '17:20', '20:32', '22:06'],
  7: ['03:58', '05:28', '12:48', '17:20', '20:31', '21:59'],
  8: ['04:33', '05:58', '12:47', '17:01', '20:01', '21:24'],
  9: ['05:08', '06:30', '12:39', '16:27', '19:10', '20:33'],
  10: ['05:44', '07:06', '12:33', '15:52', '18:16', '19:38'],
  11: ['06:22', '07:48', '12:36', '15:22', '17:46', '19:09'],
  12: ['06:42', '08:10', '12:50', '15:18', '17:40', '19:08'],
};

setInterval(() => {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const ds = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
  const ct = pad(now.getHours()) + ':' + pad(now.getMinutes());
  
  const tasks = self._tasks || [];
  const user = self._user || 'Foydalanuvchi';
  const alarm = self._alarm || {};

  if (!self._sent) self._sent = {};

  tasks.forEach(t => {
    if (t.date === ds && t.start === ct && !t.done) {
      const k = 't-' + t.id + '-' + ct;
      if (!self._sent[k]) {
        self._sent[k] = true;
        self.registration.showNotification('📋 Vazifa vaqti! Soat ' + ct, {
          body: user + ', hozir bajarish kerak: ' + t.text,
          requireInteraction: true,
          vibrate: [300, 100, 300]
        });
      }
    }
  });

  const ptimes = PT[now.getMonth() + 1] || [];
  ptimes.forEach((pt, idx) => {
    if (pt === ct) {
      const k = 'p-' + idx + '-' + ds;
      if (!self._sent[k]) {
        self._sent[k] = true;
        self.registration.showNotification('🕌 Namoz vaqti keldi!', {
          body: PN[idx] + ' namozi vaqti kirdi (' + pt + ').',
          requireInteraction: true,
          vibrate: [500, 200, 500]
        });
      }
    }
  });

  if (alarm.on && alarm.time === ct) {
    const k = 'a-' + ds;
    if (!self._sent[k]) {
      self._sent[k] = true;
      self.registration.showNotification('⏰ Kunlik eslatma!', {
        body: 'Kun boshlandi, rejalaringizni koʻrib chiqing.',
        requireInteraction: true
      });
    }
  }
}, 30000);