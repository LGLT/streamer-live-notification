const notificationsHandler = [];
let actualStreamerPage = '';

function getStreamers() {
  return new Promise(resolve => {
    chrome.storage.local.get(['streamers'], function(result) {
      resolve(result.streamers || []);
    });
  });
}


function checkStreamerStatus() {
  const extensionServer = 'https://streamer-live-notification-server.onrender.com/twitch-app-auth';
  fetch(extensionServer) 
    .then(extensionServerResponse => extensionServerResponse.json())
    .then( authData => {
      getStreamers().then(streamers => {
        for (let i = 0; i < streamers.length; i++) {
          const streamer = streamers[i];
          const twitchAPIUrl = `https://api.twitch.tv/helix/streams?user_login=${streamer.name}`;
          const headers = {
            'Client-ID': 'zx08m72z3tj0ql8piccly7rkgum367',
            'Authorization': `Bearer ${authData.access_token}`,
          };
          
          let notificationRegister = notificationsHandler.find( (notif) => notif.name === streamer.name );
          if( !notificationRegister ) {
            notificationsHandler.push({
              name: streamer.name,
              state: 'offline', 
            })
            notificationRegister = Array.isArray(notificationsHandler.slice(-1)) ? notificationsHandler.slice(-1)[0] : notificationsHandler.slice(-1);
          }
    
          fetch(twitchAPIUrl, {headers: headers})
          .then(response => response.json())
          .then(data => {
            if (data.data.length > 0 && notificationRegister.state == 'offline') {
              chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icon128.png',
                title: 'Streamer Live Notification',
                message: `${streamer.name} is live now on 'twitch.tv/${streamer.name}'`,
                buttons: [
                  { title: 'Open on Twitch' },
                ],
              }, function(notificationId) {
                notificationRegister.id = notificationId;
              });
    
              notificationRegister.state = 'online';
              streamers[i].state = 'online';
              chrome.storage.local.set({ streamers });
            }
          })
          .catch(error => {
            notificationRegister.state = 'offline'
            streamers[i].state = 'offline';
            chrome.storage.local.set({ streamers });
          });
    
          if(notificationRegister.state === 'online' && streamers[i].state === 'offline') {
            streamers[i].state = 'online'
            chrome.storage.local.set({ streamers });
          }
        }
    })
    .catch(err => console.log(err))
  });
}


chrome.tabs.onUpdated.addListener((tabId, change, tab) => {
  if (tab.active && change.url) {
      if(change.url.startsWith("https://www.twitch.tv/")){
        actualStreamerPage = tab.url;
      }
      else actualStreamerPage = '';
      chrome.storage.local.set({ actualStreamerPage });
  }
});

// Ejecuta la función checkStreamerStatus cada cierto tiempo.
setInterval(checkStreamerStatus, 300000);
