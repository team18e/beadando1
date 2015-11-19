var Waterline = require('waterline');
var moment = require('moment');

module.exports = Waterline.Collection.extend({
    identity: 'teendo',
    migrate: 'safe',
    connection: 'disk',
    attributes: {
        mit: {
            type: 'string',
            required: true
        },
        mikor: {
			type: 'date',
			defaultsTo: function () { return (new Date(year, month, day)).toLocaleString(); }
		},		
		ki: {
			type: 'string',
			required: true
		},
		surgos: {
			type: 'boolean',
			enum: ['true', 'false'],
			defaultsTo: false
		},
        user: {
            model: 'user'
        },
        getLocalDate: function () {
        	var datum = new Date(this.datum);
        	console.log(this.datum);
        	console.log(datum);
        	console.log(datum.toLocaleDateString().replace(' ', ''));
        	return datum.toLocaleDateString().replace(' ', '');
        }
    }
});