const fs = require('fs');
const v_readline = require('readline');
let v_rl = v_readline.createInterface( {
    input: process.stdin,
    output: process.stdout
});

console.log('Hello Welt');

v_rl.setPrompt('Token: ');
v_rl.prompt();
v_rl.on('line', (p_input) => {
    let tokeJson = {
        token: p_input,
    }

    fs.writeFile('./token.json', JSON.stringify(tokeJson), () => {
        console.log('token set');
    })
});