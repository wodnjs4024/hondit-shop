export default function handler(req,res){res.setHeader('Cache-Control','no-store');res.status(404).json({error:'QR link not registered',home:'/'});}
