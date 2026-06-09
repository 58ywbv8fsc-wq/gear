const form = document.getElementById("beginnerForm");
const resultsDiv = document.getElementById("results");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const handSize = document.getElementById("handSize").value;
    const fps = document.getElementById("fps").value;
    const budget = Number(
        document.getElementById("budget").value
    );

    const response = await fetch("../data/mice.json");
    const mice = await response.json();

    let results = [];

    mice.forEach(mouse => {

        let score = 0;

        if (
            mouse.handSize &&
            mouse.handSize.includes(handSize)
        ) {
            score += 50;
        }

        if (
            fps === "yes" &&
            mouse.weight <= 65
        ) {
            score += 20;
        }

        if (
            mouse.price &&
            mouse.price <= budget
        ) {
            score += 20;
        }

        results.push({
            ...mouse,
            score
        });

    });

    results.sort(
        (a, b) => b.score - a.score
    );

    const top3 = results.slice(0, 3);

    resultsDiv.innerHTML = `
        <h2>おすすめマウス</h2>

        ${top3.map(mouse => `
            <div class="mouse-card">
                <img src="${mouse.image}" alt="${mouse.name}">
                <h3>${mouse.name}</h3>
                <p>${mouse.weight}g</p>
            </div>
        `).join("")}
    `;

});