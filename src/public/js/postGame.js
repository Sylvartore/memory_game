submit = () => {
    const player_name = document.getElementById("playername").value
    if (!player_name.trim()) alert("Please enter a player name")
    else location.replace("/leaderboard?playername=" + player_name)
}

restart = () => {
    location.replace("/")
}