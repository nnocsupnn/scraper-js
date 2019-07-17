class PlayerFinder {

    constructor (con) {
        this.con = con;
    }

    _player(name, team_id, event_id) {
        let surname;
        let initial;
        let name_clean = [];
        let sql;

        return new Promise((resolve, reject) => {
            if (name == null) resolve(null) // player is not defined
            if (typeof name == 'string') {
                name = name.replace(/\r?\n|\r/g, ' ').replace(/^\s/g, '')
                name_clean = name.split(" ")
            }
            
            // Get participant id based on name or surname 'LIKE'
            if (name_clean.length <= 1) {
                surname = name_clean[0]
                sql = `SELECT * FROM participant WHERE name LIKE '%${surname}%' LIMIT 1`;
            } else {
                surname = name_clean[0]
                initial = name_clean[1].replace(/[.]$/g, '')
                sql = `SELECT * FROM participant WHERE name LIKE '${initial}%' LIMIT 1`;
            }
            
            // Always resolve default name if name is not in the database
            this.con.query(sql, (err, result) => {
                if (err) resolve(name)
                if (result.length == 0) {
                    sql = `SELECT * FROM flashscore_alias WHERE fs_alias = '${name}' AND event_id = ${event_id}`
                    this.con.query(sql, (err, res) => {
                        if (err) resolve(name)
                        if (res.length == 0) {
                            sql = `INSERT INTO flashscore_alias (participantFK, event_id, team_id, fs_alias, participant_type) VALUES (0, ${event_id}, ${team_id}, '${name}', 'athlete')`
                            this.con.query(sql, (err, res) => {
                            if (err) console.log('Error:' + err)
                                console.log('NO_RESULT_FROM_DB')
                            })
                            
                            resolve(name)
                        } else {
                            resolve(res[0].participantFK)
                        }
                    })

                } else {
                    result.map(player => {
                        sql = `SELECT * FROM flashscore_alias WHERE fs_alias = '${name}' AND event_id = ${event_id}`
                        this.con.query(sql, (err, fsResult) => {
                            if (err) resolve(name)
                            if (fsResult.length == 0) {
                                sql = `INSERT INTO flashscore_alias (participantFK, event_id, team_id, fs_alias, participant_type) VALUES (0, ${event_id}, ${team_id}, '${name}', 'athlete')`
                                
                                this.con.query(sql, (err, res) => {
                                    if (err) console.log('Error:' + err)
                                    console.log('ADDED_TO_FLASHSCORE_ALIAS')
                                })

                                resolve(name)
                            } else {
                                resolve(fsResult[0].participantFK)
                            }
                        })
                    })
                }
            })
        })
    }
}

module.exports = PlayerFinder