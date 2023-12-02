const https = require('https');
const accessToken = require('./config.js');

function updateContact(contactId, updatedContactData) {
    const options = {
        hostname: 'ko5hmar.amocrm.ru',
        path: `/api/v4/contacts/${contactId}`,
        method: 'PATCH',
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
            console.log('Ответ на запрос обновления контакта:', data);
        });
    });

    req.on('error', (error) => {
        console.error('Error:', error);
    });

    req.write(JSON.stringify(updatedContactData));
    req.end();
}

module.exports = updateContact;