const fs = require('fs');
const openpgp = require('openpgp');

async function encryptFileWithGPGKey(filePath, publicKeyPath, outputFilePath) {
  try {
    // Read the file data
    const fileData = fs.readFileSync(filePath);

    // Load the GPG public key
    const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

    // Parse the GPG public key
    const publicKeyObj = (await openpgp.key.readArmored(publicKey)).keys;

    // Encrypt the file data with the GPG public key
    const { message } = await openpgp.encrypt({
      message: openpgp.message.fromBinary(fileData),
      publicKeys: publicKeyObj,
    });

    if (!message) {
      throw new Error('Encryption failed. No encrypted message returned.');
    }

    // Convert the message to a string
    const ciphertextString = message.packets.write();

    // Write the encrypted data to the output file
    fs.writeFileSync(outputFilePath, ciphertextString);

    console.log('File encrypted successfully!');
  } catch (error) {
    console.error('Error encrypting file:', error);
  }
}

// Usage
const filePath = 'sample.txt';
const publicKeyPath = 'publickey.asc';
const outputFilePath = 'encrypteddata.pgp';

encryptFileWithGPGKey(filePath, publicKeyPath, outputFilePath);