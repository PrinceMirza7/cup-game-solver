const colors = [
    'Red', 'Green', 'Blue', 'Yellow', 'Orange', 'Purple', 'Cyan', 'Magenta',
    'Lime', 'Pink', 'Teal', 'Brown', 'Gray', 'LightBlue', 'Black', 'White'
];

let numCups = 5;
let hiddenCups = Array.from({ length: numCups }, (_, i) => ({
    number: i + 1,
    color: colors[i]
}));
let possibleSolutions = generatePermutations(hiddenCups.map(cup => cup.number));

let changeColorMode = false;
let firstSelection = null;

document.addEventListener("DOMContentLoaded", () => {
    createCupButtons();
    createColorPicker();
    newGame();
});

function generatePermutations(array) {
    if (array.length === 0) return [[]];
    const [first, ...rest] = array;
    const perms = generatePermutations(rest);
    const result = [];
    for (const perm of perms) {
        for (let i = 0; i <= perm.length; i++) {
            result.push([...perm.slice(0, i), first, ...perm.slice(i)]);
        }
    }
    return result;
}

function createCupButtons() {
    const container = document.getElementById('cup-buttons');
    container.innerHTML = '';
    hiddenCups.forEach((cup, i) => {
        const button = document.createElement('button');
        button.textContent = cup.number;
        button.style.backgroundColor = cup.color;
        button.style.color = 'white'; // Ensure text is readable
        button.onclick = () => {
            if (changeColorMode) {
                enterColorSelectionMode(i);
            } else {
                selectCup(i);
            }
        };
        container.appendChild(button);
    });
}

function createColorPicker() {
    const colorPicker = document.getElementById('color-picker');
    colorPicker.innerHTML = '';
    colors.forEach((color) => {
        const button = document.createElement('button');
        button.textContent = color;
        button.style.backgroundColor = color;
        button.style.color = 'white'; // Ensure text is readable
        button.onclick = () => {
            if (selectedCupIndex !== null) {
                hiddenCups[selectedCupIndex].color = color;
                createCupButtons();
                // Stay in color change mode until the user presses "Cancel"
            }
        };
        colorPicker.appendChild(button);
    });

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.onclick = () => toggleColorChangeMode(false);
    colorPicker.appendChild(cancelButton);
}

let selectedCupIndex = null;

function enterColorSelectionMode(index) {
    selectedCupIndex = index;
    // User can select multiple cups for color change, mode remains active
}

function toggleColorChangeMode(enabled) {
    changeColorMode = enabled;
    document.getElementById('color-picker').style.display = enabled ? 'block' : 'none';
}

function selectCup(index) {
    const buttons = document.querySelectorAll('#cup-buttons button');
    if (firstSelection === null) {
        firstSelection = index;
        buttons[index].style.border = '2px solid black'; // Highlight selected cup
    } else {
        // Swap the cups
        [hiddenCups[firstSelection], hiddenCups[index]] = [hiddenCups[index], hiddenCups[firstSelection]];
        firstSelection = null;
        updateCupButtons();
    }
}

function updateCupButtons() {
    const buttons = document.querySelectorAll('#cup-buttons button');
    hiddenCups.forEach((cup, i) => {
        buttons[i].textContent = cup.number;
        buttons[i].style.backgroundColor = cup.color;
        buttons[i].style.border = ''; // Remove highlight
    });
}

function processInput() {
    const correctCount = parseInt(document.getElementById('correct-count').value, 10);
    if (isNaN(correctCount)) {
        document.getElementById('result').textContent = "Error: Invalid input format for correct count.";
        return;
    }

    possibleSolutions = possibleSolutions.filter(perm => getCorrectCount(hiddenCups.map(cup => cup.number), perm) === correctCount);

    if (possibleSolutions.length === 1) {
        const correctArrangement = possibleSolutions[0];
        document.getElementById('result').textContent = `Correct arrangement found: ${correctArrangement}`;
        arrangeCups(correctArrangement); // Arrange the cups in the correct order
    } else if (possibleSolutions.length === 0) {
        document.getElementById('result').textContent = "No matching arrangement found.";
    } else {
        document.getElementById('result').textContent = `Multiple possible arrangements (${possibleSolutions.length}). Provide more feedback.`;
    }
}

function getCorrectCount(arrangement, perm) {
    return arrangement.reduce((count, cup, i) => count + (cup === perm[i] ? 1 : 0), 0);
}

function newGame() {
    hiddenCups = Array.from({ length: numCups }, (_, i) => ({
        number: i + 1,
        color: colors[i % colors.length] // Use modulo to wrap around the color array
    }));
    shuffleArray(hiddenCups);
    hiddenCups.sort((a, b) => a.number - b.number); // Sort cups in ascending order
    possibleSolutions = generatePermutations(hiddenCups.map(cup => cup.number));
    createCupButtons();
}

function arrangeCups(solution) {
    // Reorder hiddenCups based on the solution
    hiddenCups.sort((a, b) => solution.indexOf(a.number) - solution.indexOf(b.number));
    updateCupButtons();
}

function addCup() {
    numCups++;
    hiddenCups.push({
        number: numCups,
        color: colors[numCups % colors.length] // Use modulo to wrap around the color array
    });
    hiddenCups.sort((a, b) => a.number - b.number); // Sort cups in ascending order
    possibleSolutions = generatePermutations(hiddenCups.map(cup => cup.number));
    newGame();
}

function removeCup() {
    if (numCups > 1) {
        numCups--;
        hiddenCups.pop();
        hiddenCups.sort((a, b) => a.number - b.number); // Sort cups in ascending order
        possibleSolutions = generatePermutations(hiddenCups.map(cup => cup.number));
        newGame();
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Event listener for the "Change Color" button
document.getElementById('change-color-button').onclick = () => {
    toggleColorChangeMode(true);
};
