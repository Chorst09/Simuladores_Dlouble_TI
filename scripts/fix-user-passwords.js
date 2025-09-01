const bcrypt = require('bcryptjs');

async function generateCorrectHashes() {
    const users = [
        { email: 'admin@nextn.com.br', password: 'admin123' },
        { email: 'diretor@nextn.com.br', password: 'diretor123' },
        { email: 'vendedor@nextn.com.br', password: 'vendedor123' }
    ];
    
    console.log('Gerando hashes corretos...\n');
    
    for (const user of users) {
        const hash = await bcrypt.hash(user.password, 10);
        console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = '${user.email}';`);
    }
}

generateCorrectHashes();