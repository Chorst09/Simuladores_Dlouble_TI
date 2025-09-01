const bcrypt = require('bcryptjs');

async function testDirectorPassword() {
    const password = 'diretor123';
    const hashFromDB = '$2a$10$8K7gF5h2J9qL3mN4pR6sT.vW8xY1zA2bC3dE4fG5hI6jK7lM8nO9P';
    
    console.log('Testando senha do diretor:', password);
    console.log('Hash do banco:', hashFromDB);
    
    try {
        const isValid = await bcrypt.compare(password, hashFromDB);
        console.log('Senha válida:', isValid);
        
        if (!isValid) {
            // Gerar novo hash correto
            const correctHash = await bcrypt.hash(password, 10);
            console.log('Hash correto seria:', correctHash);
        }
        
    } catch (error) {
        console.error('Erro ao testar senha:', error);
    }
}

testDirectorPassword();