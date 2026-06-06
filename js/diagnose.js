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

        if(currentMouse === "Maya X"){
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