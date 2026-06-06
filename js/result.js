const currentMouse =
localStorage.getItem("currentMouse");

const grip =
localStorage.getItem("grip");

const recommendations =
document.getElementById(
    "recommendations"
);

/* ------------------
   プレイヤー傾向バー
------------------- */

let competitive = 90;
let control = 80;
let speed = 85;

if (grip === "Palm") {

    competitive = 75;
    control = 95;
    speed = 60;

}

if (grip === "Fingertip") {

    competitive = 85;
    control = 65;
    speed = 95;

}

document.getElementById(
    "competitiveBar"
).style.width =
competitive + "%";

document.getElementById(
    "controlBar"
).style.width =
control + "%";

document.getElementById(
    "speedBar"
).style.width =
speed + "%";

/* ------------------
   おすすめ計算
------------------- */

fetch("../data/mice.json")

.then(response => {

    if (!response.ok) {

        throw new Error(
            "JSONの読み込み失敗"
        );

    }

    return response.json();

})

.then(data => {

    const current =
    data.find(
        mouse =>
        mouse.name === currentMouse
    );

    let results = [];

    data.forEach(mouse => {

        if (
            mouse.name === currentMouse
        ) {
            return;
        }

        let match = 0;

        /* Grip一致 */

        if (

            mouse.grip &&
            mouse.grip
                .map(g =>
                    g.toLowerCase()
                )
                .includes(
                    grip.toLowerCase()
                )

        ) {

            match += 50;

        }

        /* 重量の近さ */

        const weightDiff =
        Math.abs(
            mouse.weight -
            current.weight
        );

        match += Math.max(
            0,
            20 - weightDiff
        );

        /* 幅の近さ */

        const widthDiff =
        Math.abs(
            mouse.width -
            current.width
        );

        match += Math.max(
            0,
            15 - widthDiff
        );

        /* 高さの近さ */

        const heightDiff =
        Math.abs(
            mouse.height -
            current.height
        );

        match += Math.max(
            0,
            10 - heightDiff
        );

        /* 最大100に制限 */

        match = Math.min(
            match,
            100
        );

        results.push({

            ...mouse,
            match: Math.round(match)

        });

    });

    results.sort(
        (a, b) =>
        b.match - a.match
    );

    recommendations.innerHTML = "";

    results
        .slice(0, 5)
        .forEach(mouse => {

        recommendations.innerHTML += `
        <div class="gear-card">

            <img
             class="gear-image"
             src="${mouse.image}"
             alt="${mouse.name}"
            >

            <h3>${mouse.name}</h3>

            <p class="match">
              Match : ${mouse.match}%
            </p>

            <p>
              Weight : ${mouse.weight}g
            </p>

        </div>


        `;

    });

})

.catch(error => {

    console.error(error);

    recommendations.innerHTML =

    `
    <p>
        おすすめデータの
        読み込みに失敗しました
    </p>
    `;

});