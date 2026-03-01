const mod = (n, m) => ((n % m) + m) % m;
const isLetter = (c) => c.match(/[a-z]/i);
const isUpper = (c) => c === c.toUpperCase();

// 1. Vigenere Cipher
export function vigenere(text, key, mode = 'encrypt') {
    let result = '';
    let j = 0;
    key = key.toUpperCase().replace(/[^A-Z]/g, '');
    if (!key) key = 'K'; 
    
    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        if (isLetter(char)) {
            let shift = key.charCodeAt(j % key.length) - 65;
            if (mode === 'decrypt') shift = (26 - shift) % 26;
            
            let base = isUpper(char) ? 65 : 97;
            result += String.fromCharCode(mod(char.charCodeAt(0) - base + shift, 26) + base);
            j++;
        } else {
            result += char;
        }
    }
    return result;
}

// 2. Affine Cipher
export function affine(text, a, b, mode = 'encrypt') {
    let aInt = parseInt(a) || 5;
    let bInt = parseInt(b) || 8;
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    if (gcd(aInt, 26) !== 1) {
        return "ERROR: Nilai a harus koprima dengan 26! (Gunakan: 1,3,5,7,9,11,15,17,19,21,23,25)";
    }
    
    let aInv = 0;
    for (let x = 1; x < 26; x++) {
        if ((aInt * x) % 26 === 1) {
            aInv = x;
            break;
        }
    }
    
    let result = '';
    for (let char of text) {
        if (isLetter(char)) {
            let base = isUpper(char) ? 65 : 97;
            let x = char.charCodeAt(0) - base;
            let resX = (mode === 'encrypt') 
                ? mod(aInt * x + bInt, 26) 
                : mod(aInv * (x - bInt), 26);
            result += String.fromCharCode(resX + base);
        } else {
            result += char;
        }
    }
    return result;
}

// 3. Playfair Cipher
export function playfair(text, key, mode = 'encrypt') {
    const alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ"; 
    key = key.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
    if (!key) key = 'KEY';
    
    let matrix = [];
    let used = new Set();
    
    for (let char of key) {
        if (!used.has(char)) {
            matrix.push(char);
            used.add(char);
        }
    }
    
    for (let char of alphabet) {
        if (!used.has(char)) {
            matrix.push(char);
        }
    }
    
    const getPos = (char) => {
        const idx = matrix.indexOf(char);
        return [Math.floor(idx / 5), idx % 5];
    };
    
    let cleanText = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
    let pairs = [];
    
    for (let i = 0; i < cleanText.length; i += 2) {
        let a = cleanText[i];
        let b = cleanText[i + 1] || 'X';
        if (a === b) {
            pairs.push([a, 'X']);
            i--;
        } else {
            pairs.push([a, b]);
        }
    }
    
    let result = '';
    
    for (let [a, b] of pairs) {
        let [row1, col1] = getPos(a);
        let [row2, col2] = getPos(b);
        let newA, newB;
        
        if (row1 === row2) {
            if (mode === 'encrypt') {
                newA = matrix[row1 * 5 + (col1 + 1) % 5];
                newB = matrix[row2 * 5 + (col2 + 1) % 5];
            } else {
                newA = matrix[row1 * 5 + mod(col1 - 1, 5)];
                newB = matrix[row2 * 5 + mod(col2 - 1, 5)];
            }
        } else if (col1 === col2) {
            if (mode === 'encrypt') {
                newA = matrix[((row1 + 1) % 5) * 5 + col1];
                newB = matrix[((row2 + 1) % 5) * 5 + col2];
            } else {
                newA = matrix[mod(row1 - 1, 5) * 5 + col1];
                newB = matrix[mod(row2 - 1, 5) * 5 + col2];
            }
        } else {
            newA = matrix[row1 * 5 + col2];
            newB = matrix[row2 * 5 + col1];
        }
        
        result += newA + newB;
    }
    
    return result;
}

// 4. Hill Cipher 
export function hill(text, matrix, size, mode = 'encrypt') {
    if (!Array.isArray(matrix) || matrix.length !== size * size) {
        return `ERROR: Matrix must contain ${size * size} numbers for ${size}×${size} matrix`;
    }
    
    let targetMatrix = [...matrix].map(x => parseInt(x) || 0);
    
    if (mode === 'decrypt') {
        const det = calculateDeterminant(targetMatrix, size);
        const detMod = mod(det, 26);
        
        if (detMod === 0) {
            return "ERROR: Matrix determinant is 0 (not invertible)";
        }
        let detInv = 0;
        for (let x = 1; x < 26; x++) {
            if ((detMod * x) % 26 === 1) { 
                detInv = x; 
                break; 
            }
        }
        
        if (detInv === 0) {
            return "ERROR: Determinant has no inverse mod 26";
        }
        targetMatrix = calculateInverseMatrix(targetMatrix, size, detInv);
    }

    let result = '';
    let buffer = [];

    for (let i = 0; i < text.length; i++) {
        if (isLetter(text[i])) {
            buffer.push(text[i]);
        }
    }
    while (buffer.length % size !== 0) {
        buffer.push('X');
    }
    let lettersOutput = [];
    for (let i = 0; i < buffer.length; i += size) {
        let block = [];
        for (let j = 0; j < size; j++) {
            let char = buffer[i + j];
            block.push(char.toUpperCase().charCodeAt(0) - 65);
        }
        
        let resultBlock = [];
        for (let row = 0; row < size; row++) {
            let sum = 0;
            for (let col = 0; col < size; col++) {
                sum += targetMatrix[row * size + col] * block[col];
            }
            resultBlock.push(mod(sum, 26));
        }
        
        for (let j = 0; j < size; j++) {
            let originalChar = buffer[i + j];
            let newChar = String.fromCharCode(resultBlock[j] + (isUpper(originalChar) ? 65 : 97));
            lettersOutput.push(newChar);
        }
    }

    let letterPtr = 0;
    for (let i = 0; i < text.length; i++) {
        if (isLetter(text[i])) {
            result += lettersOutput[letterPtr++];
        } else {
            result += text[i];
        }
    }
    
    return result;
}

function calculateDeterminant(matrix, size) {
    if (size === 1) return matrix[0];
    
    if (size === 2) {
        return matrix[0] * matrix[3] - matrix[1] * matrix[2];
    }
    
    let det = 0;
    for (let col = 0; col < size; col++) {
        let sign = (col % 2 === 0) ? 1 : -1;
        let subMatrix = getSubMatrix(matrix, 0, col, size);
        det += sign * matrix[col] * calculateDeterminant(subMatrix, size - 1);
    }
    return det;
}

function getSubMatrix(matrix, excludeRow, excludeCol, size) {
    let subMatrix = [];
    for (let i = 0; i < size; i++) {
        if (i === excludeRow) continue;
        for (let j = 0; j < size; j++) {
            if (j === excludeCol) continue;
            subMatrix.push(matrix[i * size + j]);
        }
    }
    return subMatrix;
}

function getCofactorMatrix(matrix, size) {
    let cofactor = [];
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            let sign = ((row + col) % 2 === 0) ? 1 : -1;
            let subMatrix = getSubMatrix(matrix, row, col, size);
            let minor = calculateDeterminant(subMatrix, size - 1);
            cofactor.push(sign * minor);
        }
    }
    return cofactor;
}

function transposeMatrix(matrix, size) {
    let transposed = [];
    for (let col = 0; col < size; col++) {
        for (let row = 0; row < size; row++) {
            transposed.push(matrix[row * size + col]);
        }
    }
    return transposed;
}

function calculateInverseMatrix(matrix, size, detInv) {
    if (size === 2) {
        return [
            mod(matrix[3] * detInv, 26),
            mod(-matrix[1] * detInv, 26),
            mod(-matrix[2] * detInv, 26),
            mod(matrix[0] * detInv, 26)
        ];
    }
    
    let cofactor = getCofactorMatrix(matrix, size);
    let adjugate = transposeMatrix(cofactor, size);
    let inverse = [];
    for (let i = 0; i < adjugate.length; i++) {
        inverse.push(mod(adjugate[i] * detInv, 26));
    }
    
    return inverse;
}

// 5. Enigma Cipher 
export function enigma(text, rotorSetting, mode = 'encrypt') {
    let setting = rotorSetting.toUpperCase().replace(/[^A-Z]/g, '');
    if (!setting || setting.length === 0) setting = 'AAA';
    let rotor1 = (setting.charCodeAt(0) - 65) % 26;
    let rotor2 = (setting.charCodeAt(1 % setting.length) - 65) % 26;
    let rotor3 = (setting.charCodeAt(2 % setting.length) - 65) % 26;
    
    let result = '';
    
    for (let char of text) {
        if (isLetter(char)) {
            let base = isUpper(char) ? 65 : 97;
            let x = char.charCodeAt(0) - base;
            
            if (mode === 'encrypt') {
                x = mod(x + rotor1, 26);
                x = mod(x + rotor2, 26);
                x = mod(x + rotor3, 26);
            } else {
                x = mod(x - rotor3, 26);
                x = mod(x - rotor2, 26);
                x = mod(x - rotor1, 26);
            }
            
            result += String.fromCharCode(x + base);
            
            rotor1 = (rotor1 + 1) % 26;
            if (rotor1 === 0) {
                rotor2 = (rotor2 + 1) % 26;
                if (rotor2 === 0) {
                    rotor3 = (rotor3 + 1) % 26;
                }
            }
        } else {
            result += char;
        }
    }
    return result;
}
