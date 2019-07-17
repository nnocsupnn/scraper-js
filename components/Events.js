const Finder = require('./PlayerFinder');

class Events {

    constructor (con) {
        this.con = con
        this.incidents = {
            "icon-box substitution-in": 1,
            "icon-box soccer-ball": 3,
            "soccer-ball-penalty": 4,
            "penalty-missed": 5,
            "soccer-ball-own": 6,
            "icon-box y-card": 8,
            "icon-box yr-card": 9,
            "icon-box r-card": 10,
            "(Penalty)": 11,
            "(Penalty missed)": 12
        };

        this.finder = new Finder(this.con);
        this._player = this.finder._player;
    }

    getEvents(element, key, event_id, team_id) {
        return new Promise((resolve, reject) => {
            let data = [];
            let minutes = element[key].textContent.replace(/\W/g, '')
            // Goals, Assists
            if ((element[key].className == "time-box" || element[key].className == "time-box-wide") && element[parseInt(key) + 1].className == "icon-box soccer-ball") {
                let incident = this.incidents[element[parseInt(key) + 1].className]
                let player1 = null
                let player2 = null

                if (element[parseInt(key) + 2].className === "participant-name" && element[parseInt(key) + 2].nextSibling.className != null) {
                    player1 = element[parseInt(key) + 2].textContent.replace(/[()\t]/g, '')
                }

                if (element[parseInt(key) + 2].nextSibling.className === "assist note-name" && element[parseInt(key) + 2].nextSibling.className != null) {
                    player2 = element[parseInt(key) + 2].nextSibling.textContent.replace(/[()\t]/g, '')
                }

                if (element[parseInt(key) + 2].textContent === "(Penalty)" && element[parseInt(key) + 2].nextSibling.className != null) {
                    player1 = element[parseInt(key) + 3].textContent.replace(/[()\t]/g, '')
                }

                this._events(player1, player2, team_id, event_id, minutes, incident)
                .then(data => resolve(data))
                .catch(err => console.log(err))
            }

            // Yellow Card
            if ((element[key].className == "time-box" || element[key].className == "time-box-wide") && element[parseInt(key) + 1].className == "icon-box y-card") {
                let incident = this.incidents[element[parseInt(key) + 1].className]
                let player1 = null
                let player2 = 0

                if (element[parseInt(key) + 2].className == "participant-name") {
                    player1 = element[parseInt(key) + 2].textContent.replace(/[()\t]/g, '')
                }

                this._events(player1, player2, team_id, event_id, minutes, incident)
                .then(data => resolve(data))
                .catch(err => console.log(err))
            }

            // Red Card
            if ((element[key].className == "time-box" || element[key].className == "time-box-wide") && element[parseInt(key) + 1].className == "icon-box r-card") {
                let incident = this.incidents[element[parseInt(key) + 1].className]
                let player1 = null
                let player2 = 0

                if (element[parseInt(key) + 2].className == "participant-name") {
                    player1 = element[parseInt(key) + 2].textContent.replace(/[()\t]/g, '')
                }

                this._events(player1, player2, team_id, event_id, minutes, incident)
                .then(data => resolve(data))
                .catch(err => console.log(err))
            }

            // SubIn and SubOut
            if ((element[key].className == "time-box" || element[key].className == "time-box-wide") && element[parseInt(key) + 1].className == "icon-box substitution-in") {
                let incident = this.incidents[element[parseInt(key) + 1].className]
                let player1 = element[parseInt(key) + 2].textContent.replace(/[()\t]/g, '')
                let player2 = element[parseInt(key) + 3].textContent.replace(/[()\t]/g, '')

                this._events(player1, player2, team_id, event_id, minutes, incident)
                .then(data => resolve(data))
                .catch(err => console.log(err))
            }

            // Yellow Red Card
            if ((element[key].className == "time-box" || element[key].className == "time-box-wide") && element[parseInt(key) + 1].className == "icon-box yr-card") {
                if (element[parseInt(key) + 2].textContent.search(/^\W/g) >= 0) {
                    let incident = this.incidents[element[parseInt(key) + 1].className]
                    let player1 = element[parseInt(key) + 3].textContent.replace(/[()\t]/g, '')
                    let player2 = null

                    this._events(player1, player2, team_id, event_id, minutes, incident)
                    .then(data => resolve(data))
                    .catch(err => console.log(err))
                } else {
                    let incident = this.incidents[element[parseInt(key) + 1].className]
                    let player1 = element[parseInt(key) + 2].textContent.replace(/[()\t]/g, '')
                    let player2 = null

                    this._events(player1, player2, team_id, event_id, minutes, incident)
                    .then(data => resolve(data))
                    .catch(err => console.log(err))
                }
            }
        });
    }

    _events(player1, player2, team_id, event_id, minutes, incident) {
        return new Promise((resolve, reject) => {
            let data = []
            this._player(player1, team_id, event_id).then(id1 => {
                data = {
                    event_id,
                    minutes: (minutes.length > 2) ? parseInt(minutes.substring(0, minutes.length - 1)) : parseInt(minutes),
                    match_incident: incident,
                    player1: id1,
                    player2,
                    club_id: team_id
                }
                if (player2 == null) {
                    data.player2 = player2
                    resolve(data)
                } else {
                    this._player(player2, team_id, event_id).then(id2 => {
                        data.player2 = id2
                        resolve(data)
                    }).catch(err => reject(err))
                }
            }).catch(err => reject(err))
        })
    }
}

module.exports = Events