const textbox = document.getElementById('textbox');

const DISPLAY_LINES = 4;
const GRACE_MS = 60;
const english200 = [
    "the","of","to","and","a","in","is","it","you","that",
    "he","was","for","on","are","with","as","I","his","they",
    "be","at","one","have","this","from","or","had","by","hot",
    "but","some","what","there","we","can","out","other","were","all",
    "your","when","up","use","word","how","said","an","each","she",
    "which","do","their","time","if","will","way","about","many","then",
    "them","would","write","like","so","these","her","long","make","thing",
    "see","him","two","has","look","more","day","could","go","come",
    "did","my","sound","no","most","number","who","over","know","water",
    "than","call","first","people","may","down","side","been","now","find",
    "any","new","work","part","take","get","place","made","live","where",
    "after","back","little","only","round","man","year","came","show","every",
    "good","me","give","our","under","name","very","through","just","form",
    "much","great","think","say","help","low","line","before","turn","cause",
    "same","mean","differ","move","right","boy","old","too","does","tell",
    "sentence","set","three","want","air","well","also","play","small","end",
    "put","home","read","hand","port","large","spell","add","even","land",
    "here","must","big","high","such","follow","act","why","ask","men",
    "change","went","light","kind","off","need","house","picture","try","us",
    "again","animal","point","mother","world","near","build","self","earth","father"
];

let handle = null;
function bufferInput(input) {
    if (handle) {
        clearTimeout(handle);
        handle = null;
        if (input)
            typeout(input);
        return;
    }
    if (!input)
        return;

    handle = setTimeout(() => {
        typeout(input);
        handle = null;
    }, GRACE_MS);
}

const timestamps = [];
const typed = [[]];
let word_pos = 0;
let letter_pos = 0;
function typeout(input) {
    //console.log(input);
    /*if (input == '_')
        input = ' ';
    textbox.innerHTML += input;
    */
    const word = test[word_pos]
    const correct = word.children[letter_pos];

    if (correct)
        console.log(correct);

    if (input == '_') {
        const tempWord = [];
        typed.push(tempWord);
        word_pos++;
    }
    else {
        typed[word_pos].push(input);
        letter_pos++;
        if (!correct) {
            const letterElement = document.createElement("letter");
            const content = document.createTextNode(input);
            letterElement.classList.add('incorrect');
            letterElement.appendChild(content);
            word.appendChild(letterElement);
        }
        else if (input != correct.innerHTML) {
            correct.classList.add('incorrect');
        }
        else if (input == correct.innerHTML) {
            console.log(hello);
            correct.classList.add('correct')
        }
    }
}

const test = []
const TEST_LENGTH = 100;
function generateTest() {
    word_pos = 0;
    letter_pos = 0;
    let h = 0;
    for (let i = 0; i < TEST_LENGTH; i++) {
        const word = english200[Math.floor(Math.random()*english200.length)];
        const wordElement = document.createElement("div");
        word.split('').forEach(letter => {
            const letterElement = document.createElement("letter");
            const content = document.createTextNode(letter);
            letterElement.appendChild(content);
            wordElement.appendChild(letterElement);
        });
        test.push(wordElement)
        textbox.appendChild(wordElement);
        h = Math.max(wordElement.offsetHeight, h)
    }

    console.log(h);

    const gap = parseInt(getComputedStyle(textbox).rowGap);
    textbox.style.maxHeight = `${(h + gap)*DISPLAY_LINES}px`;
}
generateTest();