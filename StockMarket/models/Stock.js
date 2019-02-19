const mongoose = require('mongoose');
const Stockshcmea = mongoose.Schema({
     name: String,
     rates: [{
            value: Number,
            date: {type: Date, default: Date.now}
        }]
    });

const Stocks = module.exports = mongoose.model("Stocks", Stockshcmea);