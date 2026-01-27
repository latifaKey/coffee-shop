(async ()=>{
  const fetch = globalThis.fetch || require('node-fetch');
  const session = { userId: 'admin-dev', name: 'Admin Dev', email: 'admin@barizta.com', role: 'admin', timestamp: Date.now() };
  const token = Buffer.from(JSON.stringify(session)).toString('base64');
  const body = { name: 'API Product (script)', description: 'Created by POST script', price: 22000, category: 'Kopi', image: '/images/menu/coffee.jpg', isAvailable: true };
  try{
    const res = await fetch('http://localhost:3000/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Cookie': `auth_token=${token}` }, body: JSON.stringify(body) });
    console.log('status', res.status);
    const text = await res.text();
    console.log('body', text);
  } catch(e){
    console.error('request error', e);
  }
})();
