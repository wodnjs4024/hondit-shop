// Capability never goes in a URL, analytics payload, or localStorage.
const memory=new Map<string,string>();
export function rememberOrderAccess(order:string,token:string){
 if(!token)return;memory.set(order,token);
 try{sessionStorage.setItem('hondit_order_access:'+order,token);}catch{}
}
export function readOrderAccess(order:string){
 try{return memory.get(order)||sessionStorage.getItem('hondit_order_access:'+order)||'';}catch{return memory.get(order)||'';}
}
