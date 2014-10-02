;(function ($, _, context) {
    'use strict';

    function hui () {
        // ...
    }

    hui.getTpl = _.memoize(function (id) {
        var obj = $('#' + id);
        if(!obj.length) {
            console.log('there is no hui.tpl \'' + id + '\' in dom');
            return '';
        }
        return _.template(obj.html());
    });

    hui.getEl = function($c, role, name) {
        var selector = '[hui-role="' + role + '"]';
        if(name) {
            selector += '[hui-name="' + name +'"]';
        }
        return $c.find(selector);
    };

    context.hui = hui;

})(jQuery, _, window);