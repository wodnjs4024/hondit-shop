// Cache the SDK per configuration. Quantity changes must never bootstrap it twice.
export type PayPalButtonsInstance={render:(target:string|HTMLElement)=>Promise<void>;close?:()=>Promise<void>};
export type PayPalSdk={Buttons:(options:any)=>PayPalButtonsInstance};
const sdkLoads=new Map<string,Promise<PayPalSdk>>();
export function loadPayPalSdk(clientId:string,currency:string):Promise<PayPalSdk> {
 const key=JSON.stringify([clientId,currency]);
 const existing=sdkLoads.get(key);if(existing)return existing;
 const namespace=`honditPayPalSdk${sdkLoads.size}`;
 const promise=new Promise<PayPalSdk>((resolve,reject)=>{
  const script=document.createElement('script');
  script.id=`paypal-sdk-${currency.toLowerCase()}-${sdkLoads.size}`;
  script.setAttribute('data-namespace',namespace);
  script.src=`https://www.paypal.com/sdk/js?${new URLSearchParams({'client-id':clientId,currency,intent:'capture',components:'buttons'})}`;
  const timer=window.setTimeout(()=>reject(new Error('Payment SDK timed out')),20000);
  script.onload=()=>{
   window.clearTimeout(timer);
   const sdk=(window as unknown as Record<string,PayPalSdk>)[namespace];
   if(typeof sdk?.Buttons!=='function'){reject(new Error('Payment buttons unavailable'));return;}
   resolve(sdk);
  };
  script.onerror=()=>{window.clearTimeout(timer);reject(new Error('Payment SDK failed to load'));};
  document.body.appendChild(script);
 });
 sdkLoads.set(key,promise);return promise;
}
