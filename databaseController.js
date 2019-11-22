const mysql = require('mysql');
const config = require('./config');

module.exports = {

    connection: {},

    initialize: () => {

        this.connection = mysql.createConnection({
          host: "localhost",
          user: "root",
          password: "fh2Kh8",
        });
        
        this.connection.connect(err => {
          if (err) throw err;
        });

        this.connection.query("CREATE DATABASE IF NOT EXISTS " + config.database.databaseName + ";", 
        (err, result) => {
            if (err) throw err;
        });

        this.connection.query("USE " + config.database.databaseName + ";");

        this.connection.query("CREATE TABLE IF NOT EXISTS adresses( id INT NOT NULL AUTO_INCREMENT, adress TINYTEXT NOT NULL, PRIMARY KEY (id));", 
        (err, result) => {
            if (err) throw err;
        });

        this.connection.query("CREATE TABLE IF NOT EXISTS transactions( adress_id INT unsigned NOT NULL, confirmations_number INT unsigned NOT NULL DEFAULT 0, btc_out BIGINT unsigned NOT NULL DEFAULT 0, tx_index TEXT NOT NULL, id INT NOT NULL AUTO_INCREMENT, PRIMARY KEY (id));", 
        (err, result) => {
            if (err) throw err;
        });        
    },

    addAdress: (adress) => {
        return new Promise((resolve, reject) => {
            this.connection.query("INSERT INTO adresses (adress) VALUES ('" + adress + "')", (err, result) => {
                if(err) reject(err);
                resolve(result);
            });
        });
    },
    
    checkIfAddressAlreadyAdded: (adress) => {
        return new Promise((resolve, reject) => {
            this.connection.query("SELECT * FROM adresses WHERE adress = '" + adress + "' LIMIT 1", (err, result) => {
                if(err) reject(err);
                resolve(result);
            });
        });
    },

    deleteAdress: (adressId) => {
        return new Promise((resolve, reject) => {
            this.connection.query("DELETE FROM adresses WHERE id =" + adressId, (err, result) => {
                if(err) reject(err);
                resolve(result);
            });
        });
    },

    adressData: (id) => {
        return new Promise((resolve, reject) => {
            this.connection.query("SELECT * FROM adresses WHERE id ='" + id + "';", (err, result) => {
                if(err) reject(err);
                resolve(result[0]);
            });
        });
    },
    
    allAdressesData: () => {
        return new Promise((resolve, reject) => {
            this.connection.query("SELECT * FROM adresses;", (err, result) => {
                if(err) reject(err);
                const adressesToReturn = result.map(el => {
                    return {id: el.id, adress: el.adress};
                });
                resolve(adressesToReturn);
            });
        });
    },

    checkIfTransactionAlreadyAdded: (adress) => {
        return new Promise((resolve, reject) => {
            this.connection.query("SELECT * FROM transactions WHERE tx_index = '" + adress + "' LIMIT 1", (err, result) => {
                if(err) reject(err);
                resolve(result);
            });
        });
    },

    setConfirmationsNumberInTransaction: (value, address) => {
        return new Promise((resolve, reject) => {
        this.connection.query("UPDATE transactions SET confirmations_number = " + value + " WHERE tx_index = '" + address + "';", (err, result) => {
            if(err) reject(err);
            resolve(result);
        });
    });
    },

    addTransaction: (adress_id, confirmations_number, btc_out, tx_index) => {
        return new Promise((resolve, reject) => {
        this.connection.query("INSERT INTO transactions (adress_id, confirmations_number, btc_out, tx_index) VALUES ('" + adress_id +"', '" + confirmations_number + "', '" + btc_out +"', '" + tx_index + "')", (err, result) => {
            if(err) reject(err);
            resolve(result);
        });
    });
    },

    allTransactionsOfAddress: (address) => {
        return new Promise((resolve, reject) => {
            console.log(address);
            this.connection.query("SELECT * FROM transactions WHERE adress_id = '" + address + "';", (err, result) => {
                if(err) reject(err);
                const transactionsToReturn = result.map(el => {
                    return {
                        id: el.id,
                        confirmationsNumber: el.confirmations_number, 
                        btcOut: el.btc_out,
                        txIndex: el.tx_index
                    };
                });
                resolve(transactionsToReturn);
            });
        });
    },

}