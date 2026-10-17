import {createHmac,timingSafeEqual} from 'node:crypto';
const TTL=30*24*60*60;
function secret(){const value=process.env.ORDER_LOOKUP_SECRET||process.env.PAYPAL_CLIENT_SECRET;if(!value)throw Error('Order access is not configured');return value;}
function signature(payload){return createHmac('sha256',secret()).update('hondit-order-lookup-v1:'+payload).digest('base64url');}
export function issueOrderAccess(orderNumber,now=Date.now()){
 const payload=Buffer.from(JSON.stringify({order:orderNumber,exp:Math.floor(now/1000)+TTL})).toString('base64url');
 return payload+'.'+signature(payload);
}
export function verifyOrderAccess(token,orderNumber,now=Date.now()){
 try{
  if(typeof token!=='string'||token.length>1024)return false;
  const parts=token.split('.');if(parts.length!==2)return false;
  const [payload,sig]=parts,expected=Buffer.from(signature(payload)),actual=Buffer.from(sig);
  if(actual.length!==expected.length||!timingSafeEqual(actual,expected))return false;
  const data=JSON.parse(Buffer.from(payload,'base64url').toString());
  return data.order===orderNumber&&Number.isSafeInteger(data.exp)&&data.exp>Math.floor(now/1000)&&data.exp<=Math.floor(now/1000)+TTL;
 }catch{return false;}
}
