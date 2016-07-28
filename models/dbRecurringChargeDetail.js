var mongoose = require('mongoose');

    // we're connected!

    var recurringChargeSchema = new mongoose.Schema({},{
        strict:false
    });
    recurringChargeSchema.set('collection', 'clcRecurringChargeDetail'); // only added to prevent from automatically making plural etc..clcShopDetails because mongoose auto make plural if not

    var clcRecurringChargeDetail = mongoose.model('clcRecurringChargeDetail', recurringChargeSchema);

// make this available to our users in our Node applications
    module.exports = clcRecurringChargeDetail;
