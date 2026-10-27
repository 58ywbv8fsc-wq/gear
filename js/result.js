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
const mouseProfileSummary = document.getElementById("mouseProfileSummary");
const scoreText = document.getElementById("scoreText");
const playerType = document.getElementById("playerType");

const gripLabels = {
    claw: "Claw",
    palm: "Palm",
    fingertip: "Fingertip"
};
const shapeLabels = {
    symmetrical: "左右対称",
    ergonomic: "右手エルゴ"
};
const sizeLabels = {
    small: "小型",
    medium: "中型",
    large: "大型"
};
const humpLabels = {
    rear: "後部寄り",
    center: "中央寄り",
    front: "前方寄り"
};

function formatNumber(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
        return "未登録";
    }
    return Number.isInteger(number) ? String(number) : String(Math.round(number * 10) / 10);
}

function getMostCommon(items, key) {
    const counts = new Map();
    items.forEach(item => {
        const value = item[key];
        if (value) {
            counts.set(value, (counts.get(value) || 0) + 1);
        }
    });

    return Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "";
}

function getRatio(items, key, value) {
    if (!value || items.length === 0) {
        return 0;
    }
    return items.filter(item => item[key] === value).length / items.length;
}

function dimensionPoints(value, target, tolerance, points) {
    const candidate = Number(value);
    if (!Number.isFinite(candidate) || !Number.isFinite(target)) {
        return 0;
    }
    return Math.max(0, points * (1 - Math.abs(candidate - target) / tolerance));
}

/* ------------------
   プレイヤー傾向バー
------------------- */

let competitive = 90;
let control = 80;
let speed = 85;

if (grip.toLowerCase() === "palm") {
    competitive = 75;
    control = 95;
    speed = 60;
}

if (grip.toLowerCase() === "fingertip") {
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

fetch("../data/mice.json?v=20261027-mouse-result-details")
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

    const average = key => {
        const values = profileMice
            .map(mouse => Number(mouse[key]))
            .filter(Number.isFinite);
        return values.length
            ? values.reduce((sum, value) => sum + value, 0) / values.length
            : NaN;
    };

    const profile = {
        weight: average("weight"),
        length: average("length"),
        width: average("width"),
        height: average("height")
    };

    const preferredShape = getMostCommon(profileMice, "shape");
    const preferredSize = getMostCommon(profileMice, "size");
    const preferredHump = getMostCommon(profileMice, "hump");
    const preferredGrip = gripLabels[grip.toLowerCase()] || grip;

    if (scoreText) {
        scoreText.textContent = "マウスの使用履歴を加味したプロフィール";
    }

    if (playerType) {
        playerType.textContent = [
            preferredGrip,
            sizeLabels[preferredSize] || preferredSize,
            shapeLabels[preferredShape] || preferredShape,
            humpLabels[preferredHump] || preferredHump
        ].filter(Boolean).join("・");
    }

    if (mouseProfileSummary) {
        const currentDimensions = [
            formatNumber(current.length),
            formatNumber(current.width),
            formatNumber(current.height)
        ].join(" × ");
        const profileDimensions = [
            formatNumber(profile.length),
            formatNumber(profile.width),
            formatNumber(profile.height)
        ].join(" × ");

        const historyText = historyMice.length
            ? " / 過去の使用履歴: " + historyMice.map(mouse => mouse.name).join("、")
            : "";

        mouseProfileSummary.textContent =
            "基準マウス: " + current.name +
            "（" + formatNumber(current.weight) + "g・" + currentDimensions + "mm）" +
            historyText +
            "。診断プロフィール平均: " + formatNumber(profile.weight) + "g・" +
            profileDimensions + "mm。";
    }

    const results = [];

    data.forEach(mouse => {
        if (mouse.name === currentMouseName || usedMouseSet.has(mouse.name)) {
            return;
        }

        const supportsGrip = Array.isArray(mouse.grip) &&
            mouse.grip.some(value => String(value).toLowerCase() === grip.toLowerCase());

        let match = supportsGrip ? 35 : 0;
        match += dimensionPoints(mouse.weight, profile.weight, 35, 20);
        match += dimensionPoints(mouse.length, profile.length, 25, 12);
        match += dimensionPoints(mouse.width, profile.width, 18, 12);
        match += dimensionPoints(mouse.height, profile.height, 15, 8);
        match += Math.round(getRatio(profileMice, "shape", mouse.shape) * 5);
        match += Math.round(getRatio(profileMice, "size", mouse.size) * 4);
        match += Math.round(getRatio(profileMice, "hump", mouse.hump) * 4);
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

        const details = document.createElement("div");
        details.className = "gear-specs";

        const dimensions = [
            formatNumber(mouse.length),
            formatNumber(mouse.width),
            formatNumber(mouse.height)
        ].join(" × ");

        [
            "重量: " + formatNumber(mouse.weight) + "g",
            "寸法: " + dimensions + "mm",
            "形状: " + (shapeLabels[mouse.shape] || mouse.shape || "未登録") +
                " / " + (sizeLabels[mouse.size] || mouse.size || "未登録") +
                " / ハンプ" + (humpLabels[mouse.hump] || mouse.hump || "未登録"),
            "持ち方: " + (Array.isArray(mouse.grip)
                ? mouse.grip.map(value => gripLabels[String(value).toLowerCase()] || value).join("・")
                : "未登録")
        ].forEach(text => {
            const line = document.createElement("p");
            line.textContent = text;
            details.appendChild(line);
        });

        card.appendChild(details);
        link.appendChild(card);
        recommendations.appendChild(link);
    });
})
.catch(error => {
    console.error(error);
    recommendations.textContent = "おすすめデータの読み込みに失敗しました。";
});
