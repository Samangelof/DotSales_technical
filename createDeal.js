const https = require('https');
const accessToken= require('./config.js');


function dealData(nameDeal, price) {
    return [
        {
            name: nameDeal,
            price: price,
        },
    ];
};

function createDeal(dealData) {
    const options = {
        hostname: 'ko5hmar.amocrm.ru',
        path: '/api/v4/leads',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        }
    };

    const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log('Ответ на запрос создания сделки:', data);
        });
    });

    req.on('error', (error) => {
        console.error('Error:', error);
    });

    req.write(JSON.stringify(dealData));
    req.end();
}
createDeal('Новая сделка', 1000);
module.exports = createDeal;
