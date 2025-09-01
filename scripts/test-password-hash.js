const bcrypt = require('bcryptjs');

async function testPassword() {
    const password = 'admin123';
    const hashFromDB = '$2b$12$mgoQjPLSQt28NKhpJWxN.OFPflLo28PMZIy/x9CUnoNtmCif2N.6C';
    
    console.log('Testando senha:', password);
    console.log('Hash do banco:', hashFromDB);
    
    try {
        const isValid = await bcrypt.compare(password, hashFromDB);
        console.log('Senha válida:', isValid);
        
        // Gerar novo hash para comparação
        const newHash = await bcrypt.hash(password, 12);
        console.log('Novo hash gerado:', newHash);
        
        const isNewHashValid = await bcrypt.compare(password, newHash);
        console.log('Novo hash válido:', isNewHashValid);
        
    } catch (error) {
        console.error('Erro ao testar senha:', error);
    }
}

testPassword();