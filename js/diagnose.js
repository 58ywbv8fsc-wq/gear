const form =
document.getElementById("gearForm");

form.addEventListener(
    "submit",
    function(e){

        e.preventDefault();

        let score = 0;

        const grip =
        document.getElementById("grip").value;

        const currentMouse =
        document.getElementById(
            "currentMouse"
        ).value;

        if(currentMouse.toLowerCase().includes("maya x")){
            score += 30;
        }


        localStorage.setItem(
            "currentMouse",
            currentMouse
        );
        localStorage.setItem(
            "grip",
            grip
        );


        window.location.href =
        "result.html";

    }
    
);
const mouseList = document.getElementById("mouseList");

fetch("data/mice.json")
.then(res => res.json())
.then(mice => {

    mice.forEach(mouse => {

        const option = document.createElement("option");

        option.value = mouse.name;

        mouseList.appendChild(option);

    });

});
