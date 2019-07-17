const fs = require('fs');
const jsdom = require('jsdom');
const Events = require('./Events');

const {
    JSDOM
} = jsdom;

class Parser {

    constructor(db) {
        this.data = []
        this.con = db
        
        this.events = new Events(this.con)
    }
    
    // Parse html file into events
    match_details(path, event_id) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, (err, html) => {
                if (err) reject('Unable to read file.');
                // Dom Instance
                const htmlDom = new JSDOM(html);

                // Get all dom child from events
                let detailMS = htmlDom.window.document.querySelector(".detailMS").children;
                for (let i = 0; i < detailMS.length; i++) {
                    const child = detailMS[i].children;
                    let side = (detailMS[i].className.search('home') >= 0) ? 1 : 2;
                    for (let z = 0; z < child.length; z++) {
                        let team_id = null
                        
                        let sql = `SELECT * FROM event_participants WHERE eventFK = ${event_id} AND number = ${side};`;

                        this.con.query(sql, (err, team) => {
                            if (err) reject('Event not yet get.')
                            team_id = team[0].participantFK;

                            this.events.getEvents(child, z, event_id, team_id)
                            .then(event => {
                                this.insertEvent(event)
                                this.data.push(event)
                                resolve(this.data)
                            })
                            .catch(err => reject(err));
                        })
                    }
                }
            });
        });
    }

    // Debug function
    debug(vars) {
        console.dir(vars);
        process.exit(0);
    }

    _sql(sqlString) {
        this.con.query(sqlString, (err, result) => {
            if (err) console.log(`Error: ${err}`)
            console.log('Inserted..')
        })
    }

    insertEvent (event)  {
        let insertData = true
        for (let i in event) {
            if (typeof event[i] == 'string' || event[i] == null) {
                insertData = false
                break
            }
        }
        
        console.log(event);

        if (insertData) {
            let sql = `INSERT INTO post_match_details (event_id, minutes, match_incident, player1, player2, club_id, last_update, history) VALUES (${event.event_id},${event.minutes},${event.match_incident},${event.player1},${event.player2},${event.club_id}, CURRENT_TIMESTAMP(), 'no')`;
            this._sql(sql);
        } 
    }
}

module.exports = Parser;