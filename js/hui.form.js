;(function ($, _, hui) {
    'use strict';

    hui.form = function (n, controls) {

        var $f = $('[hui-form="' + n +'"]');

        _.each(controls, function(control, name) {
            var config = control.getConfig();
            _.each(config, function(value, key) {
                if(_.isFunction(value)) {
                    config[key] = _.partialRight(value, controls);
                }
            });
            control.draw(name, $f, controls);
            // todo set control tab index
        });

        $f.on('submit', function() {
            var result = true;
            _.each(controls, function(control) {
                if(control.validate && _.isFunction(control.validate)) {
                    result = control.validate();
                }
                return result;
            });
            if(result) {
                // todo change to real thing
                $('#url').text($f.attr('action') + '/?' + _.filter(_.map(controls, function(i) {
                    return _.isFunction(i.getParams) ? i.getParams() : null;
                }), function(i) {return i}).join('&'));
                return false;
            }
            return result;
        });

    }

})(jQuery, _, hui);