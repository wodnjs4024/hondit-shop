import {publicRetryContext} from '../../../shared/order-retry.js';
import {json,supabase} from '../../_utils.js';
import {verifyOrderAccess} from '../../_order-access.js';
export default async function handler(req,res){
 res.setHeader('Cache-Control','private, no-store');res.setHeader('Vary','X-Order-Access-Token');res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='GET')return json(res,405,{error:'Method not allowed'});
 const orderNumber=String(req.query?.orderNumber||'');
 const token=req.headers?.['x-order-access-token'];
 // Verify the capability before querying whether the order exists.
 if(!/^HD-[A-Z0-9-]{5,50}$/.test(orderNumber)||!verifyOrderAccess(token,orderNumber))return json(res,403,{error:'Open the receipt in the browser used for checkout, or contact HONDIT with your order reference.'});
 try{
  const fields='id,order_number,payment_status,order_status,created_at,total_units,total_packs,total_sgd,currency,country_code';
  const rows=await supabase(`/orders?order_number=eq.${encodeURIComponent(orderNumber)}&select=${fields},internal_note`);
  if(!rows.length)return json(res,404,{error:'Order not found'});
  const items=await supabase(`/order_items?order_id=eq.${encodeURIComponent(rows[0].id)}&select=product_slug,product_name_snapshot,volume_snapshot,pack_count,total_units,line_total_sgd`);
  // Explicit projection also protects against accidental future select expansion.
  const order=Object.fromEntries(fields.split(',').filter(k=>k!=='id').map(k=>[k,rows[0][k]]));
  order.retry_context=publicRetryContext(rows[0].internal_note);
  const itemFields=['product_slug','product_name_snapshot','volume_snapshot','pack_count','total_units','line_total_sgd'];
  return json(res,200,{order:{...order,items:items.map(item=>Object.fromEntries(itemFields.map(k=>[k,item[k]])))}});
 }catch{return json(res,500,{error:'Could not load order. Contact HONDIT with your order reference.'});}
}
