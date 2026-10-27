const currentMouseName = localStorage.getItem("currentMouse");
const grip = localStorage.getItem("grip") || "Claw";
let usedMouseNames = [];

try {
    usedMouseNames = JSON.parse(localStorage.getItem("usedMice") || "[]");
    if (!Array.isArray(usedMouseNames)) {
        usedMouseNames = [];
    }
} catch {
    usedMouseNames = [];
}

const recommendations = document.getElementById("recommendations");
const usedMouseSummary = document.getElementById("usedMouseSummary");

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

document.getElementById("competitiveBar").style.width = competitive + "%";
document.getElementById("controlBar").style.width = control + "%";
document.getElementById("speedBar").style.width = speed + "%";

if (usedMouseSummary) {
    usedMouseSummary.textContent = usedMouseNames.length
        ? "使用履歴の形状・寸法も参考にし、チェックしたマウスはおすすめから除外しています: " + usedMouseNames.join("、")
        : "過去に使ったマウスは選択されていません。";
}

/* ------------------
   おすすめ計算
------------------- */

fetch("../data/mice.json")
.then(response => {
    if (!response.ok) {
        throw new Error("JSONの読み込み失敗");
    }
    return response.json();
})
.then(data => {
    const current = data.find(mouse => mouse.name === currentMouseName);

    if (!current) {
        recommendations.textContent = "診断対象のマウスが見つかりません。診断画面からマウスを選び直してください。";
        return;
    }

    const usedMouseSet = new Set(usedMouseNames);
    const historyMice = data.filter(mouse => usedMouseSet.has(mouse.name));
    const profileMice = Array.from(
        new Map([current, ...historyMice].map(mouse => [mouse.name, mouse])).values()
    );
    const average = key => profileMice.reduce(
        (sum, mouse) => sum + Number(mouse[key]),
        0
    ) / profileMice.length;

    const profile = {
        weight: average("weight"),
        width: average("width"),
        height: average("height")
    };

    const profileShapeRatio = shape => profileMice.filter(
        mouse => mouse.shape === shape
    ).length / profileMice.length;

    const results = [];

    data.forEach(mouse => {
        if (mouse.name === currentMouseName || usedMouseSet.has(mouse.name)) {
            return;
        }

        let match = 0;

        if (
            mouse.grip &&
            mouse.grip.map(value => value.toLowerCase()).includes(grip.toLowerCase())
        ) {
            match += 50;
        }

        match += Math.max(0, 20 - Math.abs(mouse.weight - profile.weight));
        match += Math.max(0, 15 - Math.abs(mouse.width - profile.width));
        match += Math.max(0, 10 - Math.abs(mouse.height - profile.height));
        match += Math.round(profileShapeRatio(mouse.shape) * 5);
        match = Math.min(match, 100);

        results.push({
            ...mouse,
            match: Math.round(match)
        });
    });

    results.sort((a, b) => b.match - a.match);
    recommendations.textContent = "";

    if (results.length === 0) {
        recommendations.textContent = "未使用のおすすめ候補がありません。使用履歴の選択を減らしてください。";
        return;
    }

    results.slice(0, 5).forEach((mouse, index) => {
        const link = document.createElement("a");
        link.href = mouse.link;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.className = "gear-link";

        const card = document.createElement("div");
        card.className = "gear-card" + (index === 0 ? " best-match" : "");

        if (mouse.image) {
            const image = document.createElement("img");
            image.className = "gear-image";
            image.src = mouse.image;
            image.alt = mouse.name;
            card.appendChild(image);
        }

        const name = document.createElement("h3");
        name.textContent = mouse.name;
        card.appendChild(name);

        const match = document.createElement("p");
        match.className = "match";
        match.textContent = "Match : " + mouse.match + "%";
        card.appendChild(match);

        const weight = document.createElement("p");
        weight.textContent = "Weight : " + mouse.weight + "g";
        card.appendChild(weight);

        link.appendChild(card);
        recommendations.appendChild(link);
    });
})
.catch(error => {
    console.error(error);
    recommendations.textContent = "おすすめデータの読み込みに失敗しました。";
});
