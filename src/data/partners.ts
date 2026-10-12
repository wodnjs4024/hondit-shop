export type ApprovedPartner={slug:string;name:string;productSlugs:string[];purchaseLocation:string};
// Publish only after partner approval; no inventory or consumer price is inferred.
export {approvedPartners} from '../../shared/partners.js';
import {approvedPartners} from '../../shared/partners.js';
export function partnerGuide(slug:string){
 const approved=approvedPartners.find(p=>p.slug===slug);
 if(approved)return {...approved,demo:false};
 const previewDemo=import.meta.env.DEV || (import.meta.env.VITE_VERCEL_ENV==='preview' && import.meta.env.VITE_PARTNER_DEMO==='1');
 if(previewDemo&&slug==='demo')return {slug:'demo',name:'HONDIT',productSlugs:['diffuser-350g'],purchaseLocation:'',demo:true};
 return null;
}
