let expect_input = false;

document.addEventListener("DOMContentLoaded", () => {
  // newGameRound();
});

renderPanel = async () => new Promise((res, rej) => {
  fetch("/info").then(data => data.json()).then(info => {
    const panel = document.querySelector("#panel");
    panel.style.display = "none";
    panel.innerHTML = "";
    panel.style.transform = "";

    for (let i = 0; i < info.rows; i++) {
      const row = panel.appendChild(document.createElement("div"));
      for (let j = 0; j < info.cols; j++) {
        const squre = row.appendChild(document.createElement("div"));
        squre.setAttribute("class", "squre");
        squre.setAttribute("id", i * info.cols + j);
        squre.addEventListener("click", onClick, false);
        squre
          .appendChild(document.createElement("div"))
          .setAttribute("class", "front");
        squre
          .appendChild(document.createElement("div"))
          .setAttribute("class", "back");
      }
    }
    setTimeout(() => {
      panel.style.display = "block";
      res()
    }, 100);
  });
});

newGameRound = () => {
  expect_input = false;
  renderPanel().then(() => {
    fetch("/newRound").then(data => data.json()).then(answers => {
      for (i of answers) {
        console.log(i)
        const squre = document.getElementById(i);
        setTimeout(() => {
          new Audio("/sound/flip.mp3").play()
          squre.querySelector(".back").style.background = "dodgerblue";
          squre.style.transform = "rotateX(180deg)";
          setTimeout(() => {
            new Audio("/sound/flip.mp3").play()
            squre.style.transform = "";
          }, 1000);
        }, 1000);
      }
      setTimeout(() => {
        const panel = document.getElementById("panel");
        if (panel.style.transform) panel.style.transform = "";
        else panel.style.transform = "rotate(90deg)";
        expect_input = true;
      }, 3000);
    })
  })
};

onClick = event => {
  if (!expect_input) return;
  const parent = event.target.parentNode;
  if (!parent.id || parent.style.transform === "rotateX(180deg)") return;
  new Audio("/sound/flip.mp3").play()
  parent.style.transform = "rotateX(180deg)";
  fetch("/click?id=" + parent.id).then(data => data.json()).then(data => {
    document.getElementById("score").innerText = "Score: " + data.score;
    document.getElementById("tiles").innerText = "Tiles: " + data.tiles;
    document.getElementById("trial").innerText = "Trial: " + data.trial;
    if (data.terminated) {
      new Audio("/sound/game_over.mp3").play()
      expect_input = false;
      setTimeout(() => {
        location.replace("/summary")
      }, 1500);
    }
    if (data.newGameRound) {
      expect_input = false;
      if (data.error == 0) {
        new Audio("/sound/wow.mp3").play()
        newGameRound()
      } else {
        for (e of document.getElementsByClassName("squre")) {
          if (e.querySelector(".back").style.background == "dodgerblue" &&
            e.style.transform != "rotateX(180deg)") {
            const squre = e;
            setTimeout(() => {
              console.log(squre)
              new Audio("/sound/flip.mp3").play()
              squre.style.transform = "rotateX(180deg)";
            }, 1000);
          }
        }
        setTimeout(() => newGameRound(), 3000);
      }
    }
  })
};

terminate = () => {
  if (confirm("Are you sure to terminate the game?")) {
    location.replace("/summary")
  }
}