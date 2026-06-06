const gearForm = document.getElementById("gearForm");

gearForm.addEventListener("submit", function(e){

    e.preventDefault();

    let score = 0;

    const currentMouse =
        document.getElementById("currentMouse").value;

    if(currentMouse === "Maya X"){
        score += 30;
    }

    localStorage.setItem("score", score);

    window.location.href =
        "result.html";

});