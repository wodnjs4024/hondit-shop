// Operations have NOT approved dates, locations or billing. Do not infer readiness.
export const pickupConfig=Object.freeze({fulfillment:'jeju_pickup',sku:'diffuser-350g',referenceCurrency:'KRW',unitAmount:18000,min:1,max:3,operationsApproved:false,reservationsEnabled:false,paymentEnabled:false,billingCurrency:null,billingUnitAmount:null,dates:[],timeSlots:[],locations:[]});
export function pickupAmount(quantity){if(!Number.isInteger(quantity)||quantity<1||quantity>3)throw Error('Pickup quantity must be 1–3');return quantity*18000;}
export function transitionPickup(record,action,context={}){
 const next={...record,history:[...(record.history||[])]};let status;
 if(action==='approve'&&record.status==='requested'){if(!context.operationsApproved||!context.location||!context.time)throw Error('Approved operations, location and time required');status='approved';next.location=context.location;next.time=context.time;}
 else if(action==='request_payment'&&record.status==='approved'){if(!context.billingCurrency||!Number.isInteger(context.billingAmount)||context.billingAmount<=0||!context.staffApproved)throw Error('Approved billing required');status='awaiting_payment';next.billingCurrency=context.billingCurrency;next.billingAmount=context.billingAmount;}
 else if(action==='confirm_payment'&&record.status==='awaiting_payment'){if(!context.verified||!context.staffApproved)throw Error('Verified payment required');status='payment_confirmed';}
 else if(action==='schedule'&&record.status==='payment_confirmed'){if(!context.staffApproved)throw Error('Staff confirmation required');status='scheduled';}
 else if(action==='deliver'&&record.status==='scheduled'){if(!context.staffApproved||!context.now||!Number.isFinite(Date.parse(context.now)))throw Error('Staff confirmation and delivery timestamp required');status='delivered';next.deliveredAt=context.now;}
 else if(action==='reschedule'&&['approved','awaiting_payment','payment_confirmed','scheduled'].includes(record.status)){status='change_requested';next.previousStatus=record.status;}
 else if(action==='reconfirm'&&['change_requested','no_show'].includes(record.status)){if(!context.staffApproved||!context.location||!context.time)throw Error('Staff scheduling confirmation required');status=['payment_confirmed','scheduled','no_show'].includes(record.previousStatus||record.status)?'payment_confirmed':'approved';next.location=context.location;next.time=context.time;}
 else if(action==='no_show'&&record.status==='scheduled'){if(!context.staffApproved)throw Error('Staff confirmation required');status='no_show';}
 else if(action==='cancel'&&['requested','approved','awaiting_payment','payment_confirmed','scheduled','change_requested','no_show'].includes(record.status)){status=['payment_confirmed','scheduled','no_show'].includes(record.status)||['payment_confirmed','scheduled','no_show'].includes(record.previousStatus)?'refund_pending':'cancelled';}
 else if(action==='refund'&&record.status==='refund_pending'){if(!context.verified||!context.staffApproved)throw Error('Refund evidence required');status='refunded';}
 else throw Error('Invalid pickup transition');
 next.status=status;next.history.push({from:record.status,to:status,at:context.now||null,action});return next;
}
