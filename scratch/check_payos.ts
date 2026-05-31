import { PayOS } from '@payos/node';

const payos = new PayOS({
  clientId: '4a116cfd-d679-420d-90dd-1423b592d696',
  apiKey: 'e5ab4647-e5b8-4ffd-85c9-211108a9f622',
  checksumKey: '68cb36a1bd92a264f9e85dd2556b00076d1a0f5a70b2927ef3350c3dab1f85a1'
});

console.log(Object.keys(payos));
