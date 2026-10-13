import {pickupConfig} from '../shared/pickup.js';
// No database or provider dependency until operational approval and migration review.
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method==='GET')return res.status(200).json(pickupConfig);
 return res.status(403).json({code:'PICKUP_NOT_APPROVED',error:'Pickup reservations and payment are not approved. An email enquiry is not a reservation.'});
}
