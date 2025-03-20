window.addEventListener("load", setup);

let streak = 0;
let threeSeasons = false;
let fiveSeasons = false;
let season = 1;
let champs = [];
let team;
let otherTeams = [];
let allTeams = [];
let week = 0;
let fullSchedule = [];
let seasonOver = true;
const positionOrder = {
    'GK': 1,
    'DEF': 2,
    'MID': 3,
    'FW': 4
};
let overall85 = false;
let overall88 = false;
let careerWins = 0;
let careerLosses = 0;
let careerDraws = 0;
let careerTrophies = 0;

const allAchievments = [
    "1. Play your first season!",
    "2. Play 5 Seasons",
    "3. Win your First Trophy!",
    "4.Play 10 Seasons",
    "5. Play 20 Seasons",
    "6. Win 5 Trophies!",
    "7. Play 50 Seasons!",
    "8. Win 10 Trophies!",
    "9. Create an 85 Overall Team",
    "10. Create an 88 Overall Team",
    "11. Win 20 Trophies!",
    "12. Play 100 Seasons",
    "13. Win 3 Trophies in a Row",
    "14. Win 5 Trophies in a Row"
];

async function setup() {
    createDOM();
    await createEventListners();
    document.getElementById("greatSeason").style.visibility = "hidden";
    currentTeams_div.style.visibility = "hidden";
    pastChamp_div.style.visibility = "hidden";
    results_div.style.visibility = "hidden";
   
}

//create all the DOM for the JS
function createDOM() {
    select_button_reference = document.getElementById("submitButton");
    coach_name_input = document.getElementById("coachName");
    current_team_ul = document.getElementById("currentTeam");
    usr_team_ul = document.getElementById("usrTeam");
    simulate = document.getElementById("simulate");
    selector1 = document.getElementById("teams");
    selector2 = document.getElementById("name");
    results_ul = document.getElementById("results");
    playerList = document.getElementById("players-container");
    choosePlayers = document.getElementById("choosePlayers");
    currentTeams_div = document.getElementById("curTeams");
    pastChamp_div = document.getElementById("pastChampions");
    season_h2 = document.getElementById("season");
    past_ul = document.getElementById("past");
    weekGamesh4 = document.getElementById("weekGames");
    allGames_ul = document.getElementById("allGames");
    past_ul = document.getElementById("past");
    results_div = document.getElementById("results_tab");
    achievment_ul = document.getElementById("achievments");
    careerStats_ul = document.getElementById("careerStats");
    table = document.getElementById("table");
}

//create all event listeners 
async function createEventListners() {
    select_button_reference.addEventListener("click", await teamSetup);
    simulate.addEventListener("click", simulateWeek);
    choosePlayers.addEventListener("click", await swapPlayers);

}

//class player which has all player types
class Player {
    constructor(position, name, pace, shooting, dribbling, passing, defense, physicality) {
        this.position = position;
        this.name = name;
        this.pace = pace;
        this.shooting = shooting;
        this.dribbling = dribbling;
        this.passing = passing;
        this.defense = defense;
        this.physicality = physicality;
        if (this.position == "FW") {
            this.overall = Math.round((pace + pace + shooting + shooting + dribbling + dribbling + passing + physicality) / 8);
        } else if (this.position == "DEF") {
            this.overall = Math.round((pace + dribbling + defense + defense + defense + physicality + physicality) / 7);
        } else if (this.position == "MID") {
            this.overall = Math.round((pace + pace + shooting + dribbling + dribbling + passing + passing + passing + defense + physicality + physicality) / 11);
        } else {
            this.overall = Math.round((pace + shooting + dribbling + defense + physicality) / 5);
        }
        this.seasonsRemaining = 4;
    }
    displayStats() {
        return `${this.position}: ${this.name}: ${this.overall} Overall`;
    }
}

//class team which has all team types
class Team {
    constructor(players, coachName, teamName, wins, draws, losses) {
        this.players = players;
        this.coachName = coachName;
        this.teamName = teamName;
        this.wins = wins;
        this.draws = draws;
        this.losses = losses;
        let totalOverall = 0;
        for (let i = 0; i < this.players.length; i++) {
            totalOverall += this.players[i].overall;
        }
        this.teamOverall = Math.round(totalOverall / this.players.length);
        this.points = (wins * 3) + draws;
        this.goalDifferential = 0;
        this.trophies = 0;
    }
    displayTeamOverall() {
        return `Team Overall: ${this.teamOverall}`
    }
    displayRecord() {
        return `Points: ${getPoints(this.wins, this.draws)}, Goal Differential: ${this.goalDifferential}`;
    }
}

//go through the other teams and swap their players for the highest overall
async function otherTeamSwap() {
    for (let team of otherTeams) {
        let newPlayers = [];
        newPlayers.push(await makeRandomPlayer());
        newPlayers.push(await makeRandomPlayer());

        let sortedNewPlayers = newPlayers.sort((a, b) => {
            return positionOrder[a.position] - positionOrder[b.position];
        });

        if (team.players.length < 6) {
            console.error(`Team ${team.name} does not have enough players!`);
            continue; // Skip this team if it has less than 6 players
        }

        team.players.sort((a, b) => {
            return positionOrder[a.position] - positionOrder[b.position];
        });

        for (let player of sortedNewPlayers) {
            let gk = team.players[0];
            let def1 = team.players[1];
            let def2 = team.players[2];
            let mid1 = team.players[3];
            let mid2 = team.players[4];
            let fw = team.players[5];

            if (player.position == "GK" && gk.overall <= player.overall) {
                team.players[0] = player;
            } else if (player.position == "DEF") {
                if (def1.overall <= def2.overall && def1.overall <= player.overall) {
                    team.players[1] = player;
                } else if (def2.overall <= player.overall) {
                    team.players[2] = player;
                }
            } else if (player.position == "MID") {
                if (mid1.overall <= mid2.overall && mid1.overall <= player.overall) {
                    team.players[3] = player;
                } else if (mid2.overall <= player.overall) {
                    team.players[4] = player;
                }
            } else if (player.position == "FW" && fw.overall <= player.overall) {
                team.players[5] = player;
            }
        }
    }
}

//function that runs the otherTeams Swap
async function swapPlayers() {
    let swapPlayers = getSelectedPlayers();
    if (swapPlayers.length === 0) {
        return; 
    }
    console.log(swapPlayers);

    team.players = swapPlayers;
    await otherTeamSwap();

    calculateOverall(team);

    document.getElementById("greatSeason").style.visibility = "hidden";
    pastChamp_div.style.visibility = "visible";
    season_h2.innerHTML =  `Season ${season}`;
    past_ul.innerHTML = "";
    achievment_ul.innerHTML = "";
    careerStats_ul.innerHTML = "";
    showCareerStats();
    for(let i = 0; i < allAchievments.length; i++) {
        if(i === 0) {
            const li = document.createElement('li');
            li.textContent = allAchievments[i];
            li.style.fontWeight = "bold";
            achievment_ul.appendChild(li);
        } else if(i === 1) {
            if(season > 4) {
                const li = document.createElement('li');
                li.textContent = allAchievments[i];
                li.style.fontWeight = "bold";
                achievment_ul.appendChild(li);
            } else {
                const li = document.createElement('li');
                li.textContent = allAchievments[i];
                achievment_ul.appendChild(li);
            }
        } else if(i === 2) {
            if(team.trophies > 0) {
                const li = document.createElement('li');
                li.textContent = allAchievments[i];
                li.style.fontWeight = "bold";
                achievment_ul.appendChild(li);
            } else {
                const li = document.createElement('li');
                li.textContent = allAchievments[i];
                achievment_ul.appendChild(li);
            }
        } else if(i === 3) {
            if(season > 9) {
                const li = document.createElement('li');
                li.textContent = allAchievments[i];
                li.style.fontWeight = "bold";
                 achievment_ul.appendChild(li);
            } else {
                const li = document.createElement('li');
                li.textContent = allAchievments[i];
                achievment_ul.appendChild(li);
            }
        } else if(i === 4) {
            if(season > 19) {
                const li = document.createElement('li');
                li.textContent = allAchievments[i];
                li.style.fontWeight = "bold";
                achievment_ul.appendChild(li);
            } else {
                const li = document.createElement('li');
                li.textContent = allAchievments[i];
                achievment_ul.appendChild(li);
            }
        }  else if(i === 5) {
            if(team.trophies > 4) {
                const li = document.createElement('li');
                li.textContent = allAchievments[i];
                li.style.fontWeight = "bold";
                achievment_ul.appendChild(li);
            } else {
                const li = document.createElement('li');
                li.textContent = allAchievments[i];
                achievment_ul.appendChild(li);
            }
        } else if(i === 6) {
            if(season > 49) {
                const li = document.createElement('li');
                li.textContent = allAchievments[i];
                li.style.fontWeight = "bold";
                achievment_ul.appendChild(li);
            } else {
                const li = document.createElement('li');
                li.textContent = allAchievments[i];
                achievment_ul.appendChild(li);
            }
        } else if(i === 7) {
            if(team.trophies > 9) {
                const li = document.createElement('li');
                li.textContent = allAchievments[i];
                li.style.fontWeight = "bold";
                achievment_ul.appendChild(li);
            } else {
                const li = document.createElement('li');
                li.textContent = allAchievments[i];
                achievment_ul.appendChild(li);
            }
        } else if(i === 8) {
            if(overall85) {
                const li = document.createElement('li');
                li.textContent = allAchievments[i];
                li.style.fontWeight = "bold";
                achievment_ul.appendChild(li);
            } else {
                const li = document.createElement('li');
                li.textContent = allAchievments[i];
                achievment_ul.appendChild(li);
            }
        } else if(i === 9) {
            if(overall88) {
                const li = document.createElement('li');
                li.textContent = allAchievments[i];
                li.style.fontWeight = "bold";
                achievment_ul.appendChild(li);
            } else {
                const li = document.createElement('li');
                li.textContent = allAchievments[i];
                achievment_ul.appendChild(li);
            }
        } else if(i === 10) {
            if(team.trophies > 19) {
                const li = document.createElement('li');
                li.textContent = allAchievments[i];
                li.style.fontWeight = "bold";
                achievment_ul.appendChild(li);
            } else {
                const li = document.createElement('li');
                li.textContent = allAchievments[i];
                achievment_ul.appendChild(li);
            }
        } else if(i === 11) {
            if(season > 99) {
                const li = document.createElement('li');
                li.textContent = allAchievments[i];
                li.style.fontWeight = "bold";
                achievment_ul.appendChild(li);
            } else {
                const li = document.createElement('li');
                li.textContent = allAchievments[i];
                achievment_ul.appendChild(li);
            }
        } else if(i === 12) {
            if(threeSeasons) {
                const li = document.createElement('li');
                li.textContent = allAchievments[i];
                li.style.fontWeight = "bold";
                achievment_ul.appendChild(li);
            } else {
                const li = document.createElement('li');
                li.textContent = allAchievments[i];
                achievment_ul.appendChild(li);
            }
        } else if(i === 13) {
            if(fiveSeasons) {
                const li = document.createElement('li');
                li.textContent = allAchievments[i];
                li.style.fontWeight = "bold";
                achievment_ul.appendChild(li);
            } else {
                const li = document.createElement('li');
                li.textContent = allAchievments[i];
                achievment_ul.appendChild(li);
            }
        }
    }
    let year = 1;
    for(let i = 0; i < champs.length; i++) {
        const li = document.createElement('li');
        li.textContent = `Season ${year}: ${champs[i]}`;
        past_ul.appendChild(li);
        year++;
    }
    simulateWeek();
}

function showCareerStats() {
    const li = document.createElement('li');
    li.textContent = `Manager Name: ${team.coachName}`;
    careerStats_ul.appendChild(li);

    const li2 = document.createElement('li');
    li2.textContent = `Career Record: ${careerWins}-${careerDraws}-${careerLosses}`;
    careerStats_ul.appendChild(li2);
    const li3 = document.createElement('li');
    li3.textContent = `Career Trophies: ${careerTrophies}`;
    careerStats_ul.appendChild(li3);
}

//gets all of the selected players and adds them to the team
function getSelectedPlayers() {
    const selectedPlayers = [];
    const checkboxes = document.querySelectorAll('input[name="player_choice"]:checked');

    if (checkboxes.length !== 6) {
        alert("Please choose 6 players! (1 GK | 2 DEF | 2 MID | 1 FW)");
        return [];
    }

    checkboxes.forEach((checkbox) => {
        const parsedData = checkbox.value.split('/');
        let existingPlayer = team.players.find(p => p.name === parsedData[0]);

        if (existingPlayer) {
            existingPlayer.position = parsedData[1];
            existingPlayer.pace = parseInt(parsedData[2], 10);
            existingPlayer.shooting = parseInt(parsedData[3], 10);
            existingPlayer.dribbling = parseInt(parsedData[4], 10);
            existingPlayer.passing = parseInt(parsedData[5], 10);
            existingPlayer.defense = parseInt(parsedData[6], 10);
            existingPlayer.physicality = parseInt(parsedData[7], 10);
            calculatePlayerOverall(existingPlayer);
            selectedPlayers.push(existingPlayer);
        } else {
            let newPlayer = new Player(
                parsedData[1], parsedData[0], parseInt(parsedData[2], 10),
                parseInt(parsedData[3], 10), parseInt(parsedData[4], 10),
                parseInt(parsedData[5], 10), parseInt(parsedData[6], 10),
                parseInt(parsedData[7], 10)
            );
            selectedPlayers.push(newPlayer);
        }
    });


    return selectedPlayers;
}

//calculate the player overall based on the metricks
function calculatePlayerOverall(player) {
    if (player.position == "FW") {
        player.overall = Math.round((player.pace + player.pace + player.shooting + player.shooting + player.dribbling + player.dribbling + player.passing + player.physicality) / 8);
    } else if (player.position == "DEF") {
        player.overall = Math.round((player.pace + player.dribbling + player.defense + player.defense + player.defense + player.physicality + player.physicality) / 7);
    } else if (player.position == "MID") {
        player.overall = Math.round((player.pace + player.pace + player.shooting + player.dribbling + player.dribbling + player.passing + player.passing + player.passing + player.defense + player.physicality + player.physicality) / 11);
    } else {
        player.overall = Math.round((player.pace + player.shooting + player.dribbling + player.defense + player.physicality) / 5);
    }
}

//calculate the overall of the team
function calculateOverall(curTeam) {
    let totalOverall = 0;
    for (let i = 0; i < curTeam.players.length; i++) {
        totalOverall += curTeam.players[i].overall;
    }
    curTeam.teamOverall = Math.round(totalOverall / curTeam.players.length)
    if(team.teamName == curTeam.teamName && curTeam.teamOverall >= 85) {
        overall85 = true;
    } 
    if(team.teamName == curTeam.teamName && curTeam.teamOverall >= 88) {
        overall88 = true;
    } 
}

// calculate the points
function getPoints(wins, draws) {
    return (wins * 3) + draws;
}

//reset the season
async function resetSeason() {
    week = 0;
    season++;
    createSchedule(allTeams);
    champs.push(getChampion());
    for (let curTeam of allTeams) {
        curTeam.wins = 0;
        curTeam.draws = 0;
        curTeam.losses = 0;
        curTeam.points = 0;
        curTeam.goalDifferential = 0;
        await resetPlayers(curTeam);
    }
}

//reset the players on all teams
async function resetPlayers(curTeam) {
    let newPlayers = [];

    for (let i = curTeam.players.length - 1; i >= 0; i--) {
        curTeam.players[i].seasonsRemaining--;

        if (curTeam.players[i].seasonsRemaining === 0) {

            let newName = await getRandomName();
            let newPlayer;

            if (curTeam.players[i].position == "GK") {
                newPlayer = new Player("GK", newName, getRandomNumber(), getRandomNumber(), getRandomNumber(), getRandomNumber(), getRandomNumberBET(), getRandomNumberBET());
            } else if (curTeam.players[i].position == "DEF") {
                newPlayer = new Player("DEF", newName, getRandomNumber(), getRandomNumberWOR(), getRandomNumber(), getRandomNumber(), getRandomNumberBET(), getRandomNumberBET());
            } else if (curTeam.players[i].position == "MID") {
                newPlayer = new Player("MID", newName, getRandomNumber(), getRandomNumber(), getRandomNumber(), getRandomNumberBET(), getRandomNumber(), getRandomNumber());
            } else if (curTeam.players[i].position == "FW") {
                newPlayer = new Player("FW", newName, getRandomNumber(), getRandomNumberBET(), getRandomNumberBET(), getRandomNumber(), getRandomNumberWOR(), getRandomNumber());
            }

            curTeam.players.splice(i, 1);
            newPlayers.push(newPlayer);
        }
    }


    curTeam.players.push(...newPlayers);

    while (curTeam.players.length < 6) {
        let newName = await getRandomName();
        let randomPosition = ["GK", "DEF", "MID", "FW"][Math.floor(Math.random() * 4)];
        let newPlayer = new Player(randomPosition, newName, getRandomNumber(), getRandomNumber(), getRandomNumber(), getRandomNumber(), getRandomNumber(), getRandomNumber());
        curTeam.players.push(newPlayer);
    }

    calculateOverall(curTeam);
}

//get the champion of the last season 
function getChampion() {
    allTeams.forEach(cur => {
        cur.points = getPoints(cur.wins, cur.draws);
    })
    allTeams.sort((a, b) => {
        if (b.points !== a.points) {
            return b.points - a.points;
        }
        return b.goalDifferential - a.goalDifferential;
    });

    return allTeams[0].teamName;
}

//simulate the week using the simulate game
async function simulateWeek() {
    document.getElementById("greatSeason").style.visibility = "hidden";
    document.getElementById("simulate").style.visibility = "visible";
    if (week >= fullSchedule.length) {
        allGames_ul.innerHTML = "";
        console.log("Season is over!");
        results_ul.innerHTML = "";
        const li = document.createElement('li');
        li.textContent = `Season Over!`;
        li.style.fontWeight = "bold";
        results_ul.appendChild(li);
        displayFinalTable();
        await resetSeason();
        document.getElementById("simulate").style.visibility = "hidden";
        document.getElementById("greatSeason").style.visibility = "visible";
        current_team_ul.style.visibility = "visible";
        weekGamesh4.innerHTML = "";
        playerList.innerHTML = "";
        await displayPlayers();

        return;
    }
    current_team_ul.style.visibility = "hidden";
    current_team_ul.innerHTML = "";
    usr_team_ul.innerHTML = "";
    allGames_ul.innerHTML = "";
    results_ul.innerHTML = "";
    weekGamesh4.innerHTML = "";
    table.innerHTML = "";
    if(week+1 > 0) {
        weekGamesh4.innerHTML = `Week ${week+1} results`
    }
    fullSchedule[week].forEach(match => {
        simulateGame(match[0], match[1]);
    });
    displayTeamStats();
    displayTable();
    week++;
}

//display the final table of the seaosn
function displayFinalTable() {
    allTeams.forEach(cur => {
        cur.points = getPoints(cur.wins, cur.draws);
    })
    table.deleteRow(0);
    let row = table.insertRow(0);
    let finalTable = row.insertCell(0);
    finalTable.innerHTML = `<strong>Final Table</strong>`;
    finalTable.style.fontSize = "30px";
 
    let i = 1;
    allTeams.sort((a, b) => {
        if (b.points !== a.points) {
            return b.points - a.points;
        }
        return b.goalDifferential - a.goalDifferential;
    }).forEach(curTeam => {
        if (i == 1) {
            curTeam.trophies++;
            if(curTeam.teamName == team.teamName) {
                streak++;
                careerTrophies++;
                if(streak === 3) {
                    threeSeasons = true;
                } else if(streak === 5) {
                    fiveSeasons = true;
                }
            } else {
                streak = 0;
            }
        }
        i++;
    })
}

//display the current table
function displayTable() {
    allTeams.forEach(cur => {
        cur.points = getPoints(cur.wins, cur.draws);
    })
    let row1 = table.insertRow(-1);
    let titleCell = row1.insertCell(0);

    
    titleCell.innerHTML = `<strong>Current Table</strong>`;

    titleCell.style.fontSize = "24px";


    let row = table.insertRow(-1);
    let clubCell = row.insertCell(0);
    let pointsCell = row.insertCell(1);
    let differentialCell = row.insertCell(2);
    
    clubCell.innerHTML = `<strong>Club</strong>`;
    pointsCell.innerHTML = `<strong>Points</strong>`;
    differentialCell.innerHTML = `<strong>Goal Differential</strong>`;
    
    clubCell.style.fontSize = "18px";
    pointsCell.style.fontSize = "18px";
    differentialCell.style.fontSize = "18px";
    let i = 1;
    allTeams.sort((a, b) => {
        if (b.points !== a.points) {
            return b.points - a.points;
        }
        return b.goalDifferential - a.goalDifferential;
    }).forEach(curTeam => {
        if (curTeam.teamName == team.teamName) {
            let row = table.insertRow(-1);
            row.insertCell(0).innerHTML = `<strong>${i}. ${curTeam.teamName}</strong>`;
            row.insertCell(1).innerHTML = `<strong>${curTeam.points}</strong>`;
            row.insertCell(2).innerHTML = `<strong>${curTeam.goalDifferential}</strong>`;
        } else {
            let row = table.insertRow(-1);
            row.insertCell(0).textContent = `${i}. ${curTeam.teamName}`;
            row.insertCell(1).textContent = curTeam.points;
            row.insertCell(2).textContent = curTeam.goalDifferential;
        }
        i++;
    })
}

//display the current week results
function displayResults(team1, team1Score, team2, team2Score) {
    if (team1 == team.teamName || team2 == team.teamName) {
        const li = document.createElement('li');
        li.textContent = `${team1}: ${team1Score} -- ${team2}: ${team2Score}`;
        li.style.fontWeight = "bold";
        allGames_ul.appendChild(li);
    } else {
        const li = document.createElement('li');
        li.textContent = `${team1}: ${team1Score} -- ${team2}: ${team2Score}`;
        allGames_ul.appendChild(li);
    }

}

//create the schedule
function createSchedule(teams) {
    let numTeams = teams.length;
    if (numTeams % 2 !== 0) {
        teams.push(null);
        numTeams++;
    }

    let schedule = [];

    for (let week = 0; week < numTeams - 1; week++) {
        let weekMatchups = [];

        for (let i = 0; i < numTeams / 2; i++) {
            let team1 = teams[i];
            let team2 = teams[numTeams - 1 - i];

            if (team1 !== null && team2 !== null) {
                weekMatchups.push([team1, team2]);
            }
        }
        schedule.push(weekMatchups);
        teams.splice(1, 0, teams.pop());
    }

    let secondRound = schedule.map(week =>
        week.map(([team1, team2]) => [team2, team1])
    );

    return [...schedule, ...secondRound];
}

//simulate the game
function simulateGame(team1, team2) {
    let isTeam1 = false;
    let isTeam2 = false;
    if(team1.teamName == team.teamName) {
        isTeam1 = true;
    } else if(team2.teamName == team.teamName) {
        isTeam2 = true;
    }

    if (team1.teamOverall > team2.teamOverall) {
        let team1Average = 0;
        let team2Average = 0;
        let overallDifference = team1.teamOverall - team2.teamOverall;
        let team1Score = 0;
        let team2Score = 0;
        if(overallDifference > 4) {
            for (let i = 0; i < 3; i++) {
                team1Average += Math.floor(Math.random() * (5 - 0 + 1)) + 0;
                team2Average += Math.floor(Math.random() * (2 - 0 + 1)) + 0;
            }
            if ((Math.floor(Math.random() * (6 - 0 + 1)) + 0) == 0) {
                team1Average = 0;
            }
            if ((Math.floor(Math.random() * (3 - 0 + 1)) + 0) == 0) {
                team2Average = 0;
            }
            team1Score = Math.round(team1Average / 3);
            team2Score = Math.round(team2Average / 3);
        } else {
            for (let i = 0; i < 3; i++) {
                team1Average += Math.floor(Math.random() * (5 - 0 + 1)) + 0;
                team2Average += Math.floor(Math.random() * (3 - 0 + 1)) + 0;
            }
            if ((Math.floor(Math.random() * (5 - 0 + 1)) + 0) == 0) {
                team1Average = 0;
            }
            if ((Math.floor(Math.random() * (3 - 0 + 1)) + 0) == 0) {
                team2Average = 0;
            }
            team1Score = Math.round(team1Average / 3);
            team2Score = Math.round(team2Average / 3);
        }

        let differential = Math.abs(team1Score - team2Score);


        if (team1Score == team2Score) {
            if(isTeam1) {
                careerDraws++;
            }
            if(isTeam2) {
                careerDraws++;
            }
            team1.draws++;
            team2.draws++;
        } else if (team1Score > team2Score) {
            if(isTeam1) {
                careerWins++;
            }
            if(isTeam2) {
                careerLosses++;
            }
            team1.wins++;
            team1.goalDifferential += differential;
            team2.goalDifferential -= differential;
            team2.losses++;
        } else if (team1Score < team2Score) {
            if(isTeam1) {
                careerLosses++;
            }
            if(isTeam2) {
                careerWins++;
            }
            team1.losses++;
            team1.goalDifferential -= differential;
            team2.goalDifferential += differential;
            team2.wins++;
        }

        displayResults(team1.teamName, team1Score, team2.teamName, team2Score);

    } else if (team1.teamOverall < team2.teamOverall) {
        let team1Average = 0;
        let team2Average = 0;
        let overallDifference = team2.teamOverall - team1.teamOverall;
        let team1Score = 0;
        let team2Score = 0;
        if(overallDifference > 4) {
            for (let i = 0; i < 3; i++) {
                team1Average += Math.floor(Math.random() * (2 - 0 + 1)) + 0;
                team2Average += Math.floor(Math.random() * (5 - 0 + 1)) + 0;
            }
            if ((Math.floor(Math.random() * (3 - 0 + 1)) + 0) == 0) {
                team1Average = 0;
            }
            if ((Math.floor(Math.random() * (6 - 0 + 1)) + 0) == 0) {
                team2Average = 0;
            }
            team1Score = Math.round(team1Average / 3);
            team2Score = Math.round(team2Average / 3);
        } else {
            for (let i = 0; i < 3; i++) {
                team1Average += Math.floor(Math.random() * (3 - 0 + 1)) + 0;
                team2Average += Math.floor(Math.random() * (5 - 0 + 1)) + 0;
            }
            if ((Math.floor(Math.random() * (3 - 0 + 1)) + 0) == 0) {
                team1Average = 0;
            }
            if ((Math.floor(Math.random() * (5 - 0 + 1)) + 0) == 0) {
                team2Average = 0;
            }
            team1Score = Math.round(team1Average / 3);
            team2Score = Math.round(team2Average / 3);
        }

        let differential = Math.abs(team1Score - team2Score);

        if (team1Score == team2Score) {
            if(isTeam1) {
                careerDraws++;
            }
            if(isTeam2) {
                careerDraws++;
            }
            team1.draws++;
            team2.draws++;
        } else if (team1Score > team2Score) {
            if(isTeam1) {
                careerWins++;
            }
            if(isTeam2) {
                careerLosses++;
            }
            team1.wins++;
            team1.goalDifferential += differential;
            team2.goalDifferential -= differential;
            team2.losses++;
        } else if (team1Score < team2Score) {
            if(isTeam1) {
                careerLosses++;
            }
            if(isTeam2) {
                careerWins++;
            }
            team1.losses++;
            team1.goalDifferential -= differential;
            team2.goalDifferential += differential;
            team2.wins++;
        }
        displayResults(team1.teamName, team1Score, team2.teamName, team2Score);
    } else if (team2.teamOverall == team1.teamOverall) {
        let team1Average = 0;
        let team2Average = 0;
        for (let i = 0; i < 3; i++) {
            team1Average += Math.floor(Math.random() * (3 - 0 + 1)) + 0;
            team2Average += Math.floor(Math.random() * (3 - 0 + 1)) + 0;
        }
        if ((Math.floor(Math.random() * (4 - 0 + 1)) + 0) == 0) {
            team1Average = 0;
        }
        if ((Math.floor(Math.random() * (4 - 0 + 1)) + 0) == 0) {
            team2Average = 0;
        }
        let team1Score = Math.round(team1Average / 3);
        let team2Score = Math.round(team2Average / 3);

        let differential = Math.abs(team1Score - team2Score);

        if (team1Score == team2Score) {
            if(isTeam1) {
                careerDraws++;
            }
            if(isTeam2) {
                careerDraws++;
            }
            team1.draws++;
            team2.draws++;
        } else if (team1Score > team2Score) {
            if(isTeam1) {
                careerWins++;
            }
            if(isTeam2) {
                careerLosses++;
            }
            team1.wins++;
            team1.goalDifferential += differential;
            team2.goalDifferential -= differential;
            team2.losses++;
        } else if (team1Score < team2Score) {
            if(isTeam1) {
                careerLosses++;
            }
            if(isTeam2) {
                careerWins++;
            }
            team1.losses++;
            team1.goalDifferential -= differential;
            team2.goalDifferential += differential;
            team2.wins++;
        }
        displayResults(team1.teamName, team1Score, team2.teamName, team2Score);
    }
}

//display all of the team stats
function displayTeamStats() {
    allTeams.forEach(cur => {
        cur.points = getPoints(cur.wins, cur.draws);
    })
    allTeams.sort((a, b) => {
        if (b.points !== a.points) {
            return b.points - a.points;
        }
        return b.goalDifferential - a.goalDifferential;
    }).forEach(curTeam => {
        if (curTeam.teamName == team.teamName) {
            const li = document.createElement('li');
            li.textContent = `Team Name: ${curTeam.teamName.charAt(0).toUpperCase() + curTeam.teamName.slice(1)}`;
            usr_team_ul.appendChild(li);

            if (curTeam.trophies != 0) {
                const li2 = document.createElement('li');
                li2.textContent = `Trophies: ${curTeam.trophies}`;
                usr_team_ul.appendChild(li2);
            }

            const li3 = document.createElement('li');
            li3.textContent = curTeam.displayRecord();
            usr_team_ul.appendChild(li3);

            const li6 = document.createElement('li');
            li6.textContent = `Record: ${curTeam.wins}-${curTeam.draws}-${curTeam.losses}`;
            usr_team_ul.appendChild(li6);

            const li4 = document.createElement('li');
            li4.textContent = curTeam.displayTeamOverall();
            usr_team_ul.appendChild(li4)

            curTeam.players.forEach(player => {
                const li = document.createElement('li');
                li.textContent = player.displayStats();
                usr_team_ul.appendChild(li);
            });

            const li5 = document.createElement('li');
            li5.textContent = '--------------------------------------';
            usr_team_ul.appendChild(li5);

            usr_team_ul.childNodes.forEach(li => {
                li.style.fontWeight = "bold";
            });
        } else {
            const li = document.createElement('li');
            li.textContent = `Team Name: ${curTeam.teamName.charAt(0).toUpperCase() + curTeam.teamName.slice(1)}`;
            current_team_ul.appendChild(li);


            if (curTeam.trophies != 0) {
                const li2 = document.createElement('li');
                li2.textContent = `Trophies: ${curTeam.trophies}`;
                current_team_ul.appendChild(li2);
            }


            const li3 = document.createElement('li');
            li3.textContent = curTeam.displayRecord();
            current_team_ul.appendChild(li3);

            const li4 = document.createElement('li');
            li4.textContent = curTeam.displayTeamOverall();
            current_team_ul.appendChild(li4)

            const li5 = document.createElement('li');
            li5.textContent = '--------------------------------------';
            current_team_ul.appendChild(li5);
        }

    });

}

async function displayPlayers() {
    let newPlayers = [];
    team.players.forEach(player => {
        newPlayers.push(player);
    })

    while (newPlayers.length < 10) {
        newPlayers.push(await makeRandomPlayer());
    }



    console.log(newPlayers);

    newPlayers.sort((a, b) => {
        return positionOrder[a.position] - positionOrder[b.position];
    }).forEach((player) => {
        const label = document.createElement("label");
        label.innerHTML = `
            <input type="checkbox" name="player_choice" value='${player.name}/${player.position}/${player.pace}/${player.shooting}/${player.dribbling}/${player.passing}/${player.defense}/${player.physicality}'> 
            ${player.name} (${player.position}) ${player.overall} Overall -- ${player.seasonsRemaining} seasons`;
        playerList.appendChild(label);
        playerList.appendChild(document.createElement("br"));
    });
}

// create current players team
async function teamSetup() {
    const selectedTeam = document.querySelector('input[name="team_choice"]:checked');
    document.getElementById("teams").style.visibility = "hidden";
    results_div.style.visibility = "visible";
    if (selectedTeam) {
        let randomName = await getRandomName();
        let randomName2 = await getRandomName();
        let randomName3 = await getRandomName();
        let randomName4 = await getRandomName();
        let randomName5 = await getRandomName();
        let randomName6 = await getRandomName();
        let newPlayer = new Player("GK", randomName, getRandomNumber(), getRandomNumber(), getRandomNumber(), getRandomNumber(), getRandomNumberBET(), getRandomNumberBET());
        let newPlayer2 = new Player("DEF", randomName2, getRandomNumber(), getRandomNumberWOR(), getRandomNumber(), getRandomNumber(), getRandomNumberBET(), getRandomNumberBET());
        let newPlayer3 = new Player("DEF", randomName3, getRandomNumber(), getRandomNumberWOR(), getRandomNumber(), getRandomNumber(), getRandomNumberBET(), getRandomNumberBET());
        let newPlayer4 = new Player("MID", randomName4, getRandomNumber(), getRandomNumber(), getRandomNumber(), getRandomNumberBET(), getRandomNumber(), getRandomNumber());
        let newPlayer5 = new Player("MID", randomName5, getRandomNumber(), getRandomNumber(), getRandomNumber(), getRandomNumberBET(), getRandomNumber(), getRandomNumber());
        let newPlayer6 = new Player("FW", randomName6, getRandomNumber(), getRandomNumberBET(), getRandomNumberBET(), getRandomNumber(), getRandomNumberWOR(), getRandomNumber());
        let players = [];
        players.push(newPlayer);
        players.push(newPlayer2);
        players.push(newPlayer3);
        players.push(newPlayer4);
        players.push(newPlayer5);
        players.push(newPlayer6);
        team = new Team(players, coach_name_input.value, selectedTeam.value, 0, 0, 0);
        await otherTeamsSetup();
        allTeams.push(team);
        currentTeams_div.style.visibility = "visible";
        displayTeamStats()




        selector1.innerHTML = ``;
        selector2.innerHTML = ``;
        select_button_reference.remove();

        fullSchedule = createSchedule(allTeams);

        return team;
    }
    return null;
}

// create all of the other rival teams
async function otherTeamsSetup() {
    const selectedTeam = document.querySelector('input[name="team_choice"]:checked');
    let all_teams = ["Liverpool", "Manchester United", "Barcelona", "Real Madrid", "Arsenal", "Bayern", "PSG", "Inter Milan", "Tottenham", "Inter Miami", "AC Milan", "Manchester City", "Aston Villa", "Athletico Madrid", "Chelsea", "Dortmund", "Juventus", "Roma", "Napoli", "Porto"];

    for (const curTeam of all_teams) {
        if (selectedTeam && curTeam !== selectedTeam.value) {
            let randomName = await getRandomName();
            let randomName2 = await getRandomName();
            let randomName3 = await getRandomName();
            let randomName4 = await getRandomName();
            let randomName5 = await getRandomName();
            let randomName6 = await getRandomName();

            let newPlayer = new Player("GK", randomName, getRandomNumber(), getRandomNumber(), getRandomNumber(), getRandomNumber(), getRandomNumberBET(), getRandomNumberBET());
            let newPlayer2 = new Player("DEF", randomName2, getRandomNumber(), getRandomNumberWOR(), getRandomNumber(), getRandomNumber(), getRandomNumberBET(), getRandomNumberBET());
            let newPlayer3 = new Player("DEF", randomName3, getRandomNumber(), getRandomNumberWOR(), getRandomNumber(), getRandomNumber(), getRandomNumberBET(), getRandomNumberBET());
            let newPlayer4 = new Player("MID", randomName4, getRandomNumber(), getRandomNumber(), getRandomNumber(), getRandomNumberBET(), getRandomNumber(), getRandomNumber());
            let newPlayer5 = new Player("MID", randomName5, getRandomNumber(), getRandomNumber(), getRandomNumber(), getRandomNumberBET(), getRandomNumber(), getRandomNumber());
            let newPlayer6 = new Player("FW", randomName6, getRandomNumber(), getRandomNumberBET(), getRandomNumberBET(), getRandomNumber(), getRandomNumberWOR(), getRandomNumber());

            let players = [newPlayer, newPlayer2, newPlayer3, newPlayer4, newPlayer5, newPlayer6];


            let newTeam = new Team(players, await getRandomName(), curTeam, 0, 0, 0);
            otherTeams.push(newTeam);
            allTeams.push(newTeam);
        }
    }

}

//make a random player
async function makeRandomPlayer() {
    let positions = ["GK", "DEF", "MID", "FW"];
    let randomPositon = positions[Math.floor(Math.random() * 4)];
    let randomName = await getRandomName();
    let newPlayer;
    if (randomPositon == "GK") {
        newPlayer = new Player(randomPositon, randomName, getRandomNumber(), getRandomNumber(), getRandomNumber(), getRandomNumber(), getRandomNumberBET(), getRandomNumberBET());
    } else if (randomPositon == "DEF") {
        newPlayer = new Player(randomPositon, randomName, getRandomNumber(), getRandomNumberWOR(), getRandomNumber(), getRandomNumber(), getRandomNumberBET(), getRandomNumberBET());
    } else if (randomPositon == "MID") {
        newPlayer = new Player(randomPositon, randomName, getRandomNumber(), getRandomNumber(), getRandomNumber(), getRandomNumberBET(), getRandomNumber(), getRandomNumber());
    } else if (randomPositon == "FW") {
        newPlayer = new Player(randomPositon, randomName, getRandomNumber(), getRandomNumberBET(), getRandomNumberBET(), getRandomNumber(), getRandomNumberWOR(), getRandomNumber());
    } else {
        newPlayer = new Player(randomPositon, randomName, getRandomNumber(), getRandomNumber(), getRandomNumber(), getRandomNumber(), getRandomNumber(), getRandomNumber());
    }

    return newPlayer;
}

//get a random number 99-50 for the player stats
function getRandomNumber() {
    return Math.floor(Math.random() * (99 - 50 + 1)) + 50;
}

//get a better number for players stats from 99-70
function getRandomNumberBET() {
    return Math.floor(Math.random() * (99 - 65 + 1)) + 65;
}

//get a worse nymber for players overall
function getRandomNumberWOR() {
    return Math.floor(Math.random() * (85 - 50 + 1)) + 50;
}

//create a random name from the first and last name files
async function getRandomName() {
    let firstNames = await readFirstNamesDataFile();
    let lastNames = await readLastNamesDataFile();
    const randomFirstIndex = Math.floor(Math.random() * firstNames.length);
    const randomLastIndex = Math.floor(Math.random() * lastNames.length);
    let firstName = firstNames[randomFirstIndex];
    let lastName = lastNames[randomLastIndex];

    return firstName + " " + lastName;
}
//read in all first names
async function readFirstNamesDataFile() {
    return await fetch("./resources/firstNames.txt")
        .then(response => {
            return response.text();
        })
        .then(data => {
            return data.replaceAll("\t", "").split(/\r?\n/).filter(name => name.trim() !== '');
        })
}

//read in all last names
async function readLastNamesDataFile() {
    return await fetch("./resources/lastNames.txt")
        .then(response => {
            return response.text();
        })
        .then(data => {
            return data.replaceAll("\t", "").split(/\r?\n/).filter(name => name.trim() !== '');
        })
}
