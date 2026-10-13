const path=require('node:path');
function assetPath(url,root){const u=new URL(url);if(u.protocol!=='jyothish:'||u.hostname!=='app')throw Error('Unknown app origin.');let pathname=decodeURIComponent(u.pathname);if(pathname.includes('\0')||pathname.includes('\\')||pathname.split('/').includes('..'))throw Error('Invalid resource path.');const target=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(target!==root&&!target.startsWith(root+path.sep))throw Error('Invalid resource path.');return target}
module.exports={assetPath};
