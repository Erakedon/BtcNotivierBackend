module.exports = (app, database) => {

    app.get('/test', (req, res) => {
        res.send("succes! ;D");
    });

    app.post('/add_adress', async (req, res) => {
        let addressIsValid = true;
        if(req.body.adress.length !== 34) {
            res.sendStatus(400);
            addressIsValid = false;
        }

        await database.checkIfAddressAlreadyAdded(req.body.adress)
        .then(  response => {
            if(response.length > 0) {
                res.sendStatus(400);
                addressIsValid = false;
            }
        }, 
        err => {
            res.sendStatus(400);
        });

        if(addressIsValid)
            database.addAdress(req.body.adress)
            .then(  () => {
                res.sendStatus(200)
            }, 
            err => {
                res.sendStatus(400);
            });
    });

    app.get('/adress/:id', (req, res) => {
        const adressData = JSON.stringify(database.adressData(req.params.id));
        res.send(adressData);
    });

    app.delete('/adress/:id', (req, res) => {
        database.deleteAdress(req.params.id)
        .then(  () => {res.sendStatus(200)}, 
                err => {res.send(err)});
    });
    
    app.get('/all_adresses', async (req, res) => {
        let data = await database.allAdressesData()
        res.send(JSON.stringify(data));
    });
        
    app.get('/all_transactions_of_address/:id', async (req, res) => {
        let transactions = await database.allTransactionsOfAddress(req.params.id);
        let addressData = await database.adressData(req.params.id);
        let dataToSend = {
            id: addressData.id,
            address: addressData.adress,
            transactions: transactions
        }
        res.send(JSON.stringify(dataToSend));
    });

}