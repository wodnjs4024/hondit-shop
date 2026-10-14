export function checkoutDisplayState({preview=false,configuration='loading',enabled=false,clientId='',sdkReady=false,sdkFailed=false}){
 if(preview)return 'preview';
 if(configuration==='loading')return 'loading';
 if(configuration==='failed'||sdkFailed)return 'failed';
 if(!enabled)return 'closed';
 if(!clientId)return 'failed';
 return sdkReady?'ready':'loading';
}
