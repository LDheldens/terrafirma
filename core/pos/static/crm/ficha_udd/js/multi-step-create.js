
// step
const toggleContent = (li, elementToActivateIds) => {
    // elements all gray
    [...document.getElementById('multi-step').children].map(li => {
        li.classList.add('text-gray-500');
        li.classList.remove('text-blue-600');
        // span
        const span = li.firstElementChild;
        span.classList.remove('border-blue-600');
        span.classList.add('border-gray-500');
    });

    // current element to blue
    li.classList.remove('text-gray-500');
    li.classList.add('text-blue-600');
    const span = li.firstElementChild;
    span.classList.remove('border-gray-500');
    span.classList.add('border-blue-600');

    const allElementIds = ['part1', 'part2', 'part3', 'part4', 'part5', 'part6', 'part7', 'part8', 'part9'];
    const elementsToDeactivateIds = allElementIds.filter(el => !elementToActivateIds.includes(el));
    //disable elements            
    for (const id of elementsToDeactivateIds) {
        document.getElementById(id).classList.add('hidden');
    }
    //enable elements
    for (const id of elementToActivateIds) {
        document.getElementById(id).classList.remove('hidden');
    }
};
const stepInit = () => {
    const liElements = document.getElementById('multi-step').getElementsByTagName('li');
    // step and content
    const condition = {
        0: ['part1', 'part2'],
        1: ['part3', 'part4'],
        2: ['part5', 'part6','part7', 'part8', 'part9'],
        // 3: [],
    };
    // add listener click element li
    for (let [index, liElement] of Object.entries(liElements)) {
        const elementsToActivate = condition[index];
        liElement.addEventListener('click', () => toggleContent(liElement, elementsToActivate));
    }
    // activate step 1
    toggleContent(liElements[0], ['part1', 'part2']);
}
stepInit();

// btnNext.addEventListener('click', () => {
//     const steps = document.getElementById('multi-step').children;
//     const total = steps.length
//     const currStep = [...steps].find(li => li.innerHTML.includes('blue'));
// });
// btnPrev.addEventListener('click', () => {
    
// });