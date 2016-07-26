/**
 * Created by Admin on 7/25/2016.
 */

var mongoose = require('mongoose');

    // we're connected!

    var shopSchema = new mongoose.Schema({},{
        strict:false
    });
    shopSchema.set('collection', 'clcShopDetail'); // only added to prevent from automatically making plural etc..clcShopDetails because mongoose auto make plural if not

    var clcShopDetail = mongoose.model('clcShopDetail', shopSchema);

// make this available to our users in our Node applications
    module.exports = clcShopDetail;











