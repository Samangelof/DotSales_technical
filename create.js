const https = require('https');
const updateContact = require('./update.js');
const accessToken = require('./config.js');
const createDeal = require('./createDeal.js')

// -----------------------------------------------------------------------
// Данные для создания контакта
function contactData(name, firstName, lastName, email, phone) {
    return [
        {
            name: name,
            first_name: firstName,
            last_name: lastName,
            custom_fields_values: [
                {
                    field_id: 184677,
                    field_name: "Телефон",
                    field_code: "PHONE",
                    field_type: "multitext",
                    values: [
                        {
                            "value": phone,
                            "enum_id": 100375,
                            "enum_code": "WORK"
                        }
                    ]
                },
                {
                    field_id: 184679,
                    field_name: "Email",
                    field_code: "EMAIL",
                    field_type: "multitext",
                    values: [
                        {
                            "value": email,
                            "enum_id": 100387,
                            "enum_code": "WORK"
                        }
                    ]
                }
            ],
        }
    ];
};

// -----------------------------------------------------------------------
// Создание контакта
function createContact(contactData) {
    const options = {
        hostname: 'ko5hmar.amocrm.ru',
        path: '/api/v4/contacts',
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
            console.log('Ответ на запрос создания контакта:', data);
        });
    });

    req.on('error', (error) => {
        console.error('Error:', error);
    });

    req.write(JSON.stringify(contactData));
    req.end();
}



// -----------------------------------------------------------------------
// Функция для поиска контакта по почте или по номеру телефона
function findContactByEmailOrPhone(email, phone, contacts) {
    const foundContacts = contacts.filter(contact => {
        const customFields = contact.custom_fields_values;

        if (customFields && Array.isArray(customFields)) {
            const emailField = customFields.find(field => field.field_code === 'EMAIL');
            const phoneField = customFields.find(field => field.field_code === 'PHONE');

            const contactEmail = emailField ? emailField.values[0].value : null;
            const contactPhone = phoneField ? phoneField.values[0].value : null;

            return (email && contactEmail === email) || (phone && contactPhone === phone);
        }

        return false;
    });

    return foundContacts;
}


// -----------------------------------------------------------------------
// 
function getAllContactsAndFind(name, email, phone) {
    const options = {
        hostname: 'ko5hmar.amocrm.ru',
        path: '/api/v4/contacts',
        method: 'GET',
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
            try {
                let contacts = [];

                // Проверяем, есть ли данные для обработки
                if (data.trim() !== '') {
                    const { _embedded } = JSON.parse(data);
                    contacts = _embedded ? _embedded.contacts : [];
                    // Поиск контакта
                    const foundContacts = findContactByEmailOrPhone(email, phone, contacts);
                    // Если найден обновляет его
                    if (foundContacts.length > 0) {
                        console.log('Контакт найден, обновление...');

                        // Первый найденный контакт по id 
                        const contactIdToUpdate = foundContacts[0].id;
                        // Обновленные данные для контакта
                        const updatedContactData = contactData(
                            name,
                            'update_firstName',
                            'update_lastName',
                            email, phone);

                        updateContact(contactIdToUpdate, updatedContactData);


                    } // Если не найден обновляет контакт и создает сделку
                    else if (foundContacts.length === 0) {
                        console.log('Контакт не найден, создание нового контакта...');

                        const newContactData = contactData(name, 'first', 'name', email, phone);
                        createContact(newContactData);
                        createDeal('Новая сделка', 100);
                    }
                }
                else {
                    console.log('Контактов нет, создание нового контакта...');
                    const newContactData = contactData(name, 'first', 'name', email, phone);
                    createContact(newContactData);
                    console.log('[[[2]]]');
                    createDeal('One deal', 1000);
                }


            } catch (error) {
                console.error('Error:', error);
            }
        });
    });

    req.on('error', (error) => {
        console.error('Error:', error);
    });
    req.end();
};

module.exports = getAllContactsAndFind;