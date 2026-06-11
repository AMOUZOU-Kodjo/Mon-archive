import bcrypt from 'bcrypt';

const password = 'Phipsipy2001@archive'; // ← à changer
const salt = await bcrypt.genSalt(12);
const hash = await bcrypt.hash(password, salt);
console.log('ADMIN_PASSWORD_HASH=' + hash);