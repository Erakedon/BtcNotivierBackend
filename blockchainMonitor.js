const axios = require('axios');

module.exports = async (app, database) => {

    let newestBlockBeforeSearch = (await axios.get("https://blockchain.info/q/getblockcount")).data;
    searchNewBlocks();

    async function searchNewBlocks() {
        const currentBlockHeight = (await axios.get("https://blockchain.info/q/getblockcount")).data;

        const numberOfBlocksToCheck = currentBlockHeight - newestBlockBeforeSearch;
        let blocksToCheck = [];

        if(numberOfBlocksToCheck > 0) {
            const latestBlockHash = (await axios.get("https://blockchain.info/latestblock")).data.hash;
            blocksToCheck.push((await axios.get("https://blockchain.info/rawblock/" + latestBlockHash)).data);

            for (let i = 1; i < numberOfBlocksToCheck; i++) {
                blocksToCheck.push((await axios.get("https://blockchain.info/rawblock/" + blocksToCheck[i - 1].prev_block)).data);
            }            
            
            blocksToCheck.forEach(block => {
                analizeBlock(block);
            });
            
            newestBlockBeforeSearch = currentBlockHeight;
        }

        //Getting the average time betwen blocks in seconds,
        //multiply it by 1000 to change vale to miliseconds,
        //and divide it by 2 to optimize requests time
        const timeoutBeforeNextSearch = (await axios.get("https://blockchain.info/q/interval")).data * 1000 / 2;
        setTimeout(searchNewBlocks, timeoutBeforeNextSearch);
    }

    async function analizeBlock(block) {
        const adressesToMonitor = await database.allAdressesData();

        for (let i = 1; i < block.tx.length; i++) {
            let adress = block.tx[i].inputs[0].prev.addr;
            let transactionWeAreLookingFor = false;
            let monitoredAddressId;

            adressesToMonitor.forEach(monitoredAdress => {
                if(adress === monitoredAdress.adress) {
                    transactionWeAreLookingFor = true;
                    monitoredAddressId = monitoredAdress.id;
                }
            });

            if(!transactionWeAreLookingFor) continue;
            let btcOutValue = 0; 
            let txHash = block.tx[i].hash;

            block.tx[i].out.forEach(out => {
                btcOutValue += out.value;
            });

            if(transactionWeAreLookingFor) {
                const existingTransactions = await database.checkIfTransactionAlreadyAdded(txHash);
                if(existingTransactions.length > 0) {
                    database.setConfirmationsNumberInTransaction(
                        existingTransactions[0].confirmations_number + 1, 
                        existingTransactions[0].tx_index);
                } else {
                    database.addTransaction(monitoredAddressId, 1, btcOutValue, txHash);
                }
            }
        }
    }

}