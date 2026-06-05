
const score = Number(
    localStorage.getItem("score")
);

const grip =
localStorage.getItem("grip");

const scoreText =
document.getElementById("scoreText");

const playerType =
document.getElementById("playerType");

const recommendations =
document.getElementById(
    "recommendations"
);

/* ------------------
   スコア表示
------------------- */

scoreText.innerText =
`Score : ${score}`;

if (score >= 30) {

    playerType.innerText =
    "Competitive Claw";

} else {

    playerType.innerText =
    "Casual Player";

}

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
   マウスおすすめ
------------------- */

fetch("/data/mice.json")

.then(response => {

    if (!response.ok) {

        throw new Error(
            "JSONの読み込み失敗"
        );

    }

    return response.json();

})

.then(data => {

    let results = [];

    data.forEach(mouse => {

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

        /* 軽量マウス */

        if (mouse.weight < 60) {

            match += 20;

        }

        /* スコア反映 */

        if (
            score >= 30 &&
            mouse.weight < 55
        ) {

            match += 15;

        }

        /* 超軽量ボーナス */

        if (mouse.weight < 50) {

            match += 10;

        }

        /* 最大100に制限 */

        match = Math.min(
            match,
            100
        );

        results.push({

            ...mouse,
            match: match

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

            <h3>
                ${mouse.name}
            </h3>

            <p class="match">
                Match :
                ${mouse.match}%
            </p>

            <p>
                Weight :
                ${mouse.weight}g
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