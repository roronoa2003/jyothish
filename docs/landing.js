// Clear the former chart app's worker so this route becomes the download page.
if('serviceWorker' in navigator)navigator.serviceWorker.getRegistrations().then(registrations=>Promise.all(registrations.filter(r=>r.scope===new URL('./',location.href).href).map(r=>r.unregister()))).catch(()=>{});
