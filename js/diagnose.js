const form = document.getElementById("gearForm");

form.addEventListener("submit", function(e) {
    e.preventDefault();

    const currentMouse = document.getElementById("currentMouse");
    const grip = document.getElementById("grip");
    const usedMice = Array.from(
        form.querySelectorAll('input[name="usedMice"]:checked'),
        checkbox => checkbox.value
    );

    if (!currentMouse) {
        alert("currentMouse が見つかりません");
        return;
    }

    localStorage.setItem("currentMouse", currentMouse.value);
    localStorage.setItem("grip", grip.value);
    localStorage.setItem("usedMice", JSON.stringify(usedMice));

    window.location.href = "result.html?v=20261027-mouse-result-details";
});

const mouseList = document.getElementById("mouseList");
const usedMouseList = document.getElementById("usedMouseList");
const keyboardList = document.getElementById("currentKeyboard");
const mousepadList = document.getElementById("currentMousepad");

function addSelectOptions(select, items) {
    items.forEach(item => {
        const alreadyExists = Array.from(select.options)
            .some(option => option.value === item.name);
        if (alreadyExists) {
            return;
        }

        const option = document.createElement("option");
        option.value = item.name;
        option.textContent = item.name;
        select.appendChild(option);
    });
}

Promise.all([
    fetch("../data/mice.json?v=20261027-mouse-result-details").then(res => res.json()),
    fetch("../data/keyboards.json").then(res => res.json()),
    fetch("../data/mousepads.json?v=20261027-mousepads-10").then(res => res.json())
]).then(([mice, keyboards, mousepads]) => {

    mice.forEach(mouse => {
        const option = document.createElement("option");
        option.value = mouse.name;
        mouseList.appendChild(option);

        const label = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "usedMice";
        checkbox.value = mouse.name;
        label.append(checkbox, " " + mouse.name);
        usedMouseList.appendChild(label);
    });

    addSelectOptions(keyboardList, keyboards);
    addSelectOptions(mousepadList, mousepads);

});
