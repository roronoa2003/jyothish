const fs=require('node:fs/promises'),path=require('node:path');
class ConversationStore{
 constructor(root){this.folder=path.join(root,'conversations');this.queue=Promise.resolve()}
 file(id){if(typeof id!=='string'||!/^[a-zA-Z0-9-]{1,80}$/.test(id))throw Error('Invalid conversation profile.');return path.join(this.folder,id+'.json')}
 async list(id){try{const rows=JSON.parse(await fs.readFile(this.file(id),'utf8'));if(!Array.isArray(rows))throw Error('Conversation could not be read.');return rows}catch(e){if(e.code==='ENOENT')return [];throw e}}
 save(id,messages){const file=this.file(id);if(!Array.isArray(messages)||messages.length>200||messages.some(m=>typeof m.question!=='string'||m.question.length>2000||typeof m.answer!=='string'||m.answer.length>20000)||JSON.stringify(messages).length>5000000)throw Error('Invalid conversation.');const result=this.queue.then(async()=>{await fs.mkdir(this.folder,{recursive:true,mode:0o700});await fs.writeFile(file+'.tmp',JSON.stringify(messages),{mode:0o600});await fs.rename(file+'.tmp',file);return {saved:true}});this.queue=result.catch(()=>{});return result}
}
module.exports={ConversationStore};
