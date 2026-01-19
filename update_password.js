const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const usersFilePath = path.join(__dirname, 'users.json');
const targetEmail = 'kibsb81@gmail.com';
const newPassword = 'Eltigre811005*.*';

async function updatePassword() {
    try {
        console.log(`Reading users from ${usersFilePath}...`);
        const usersRaw = fs.readFileSync(usersFilePath, 'utf8');
        const users = JSON.parse(usersRaw);

        const userIndex = users.findIndex(u => u.email === targetEmail);

        if (userIndex === -1) {
            console.error(`User with email ${targetEmail} not found.`);
            process.exit(1);
        }

        console.log(`Found user: ${users[userIndex].username} (ID: ${users[userIndex].id})`);
        console.log('Generating new password hash...');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        users[userIndex].password = hashedPassword;

        console.log('Writing updated users.json...');
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
        console.log('Password updated successfully.');

    } catch (error) {
        console.error('Error updating password:', error);
        process.exit(1);
    }
}

updatePassword();
