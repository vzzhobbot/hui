;(function ($, _, hlf) {
    'use strict';
    hlf.guests = function (config) {

        var $c = null, // container
            $doc = null, // document
            $g = null, // guests container
            $s = null, // summary
            $cc = null, // controls container
            $av = null, // adults value
            $ai = null, // adults increment control
            $ad = null, // adults decrement control
            $cv = null, // children value
            $ci = null, // children increment control
            $cd = null, // children decrement control
            $cl = null, // children list
            $clt = '', // children list title
            $chc = [], // child containers
            $chi = [], // child age increment control
            $chd = [], // child age decrement control
            $cha = [], // child age value

            controls = {};

        config = _.defaults(config || {}, {

            adults: 2, // adults default value
            adultsMax: 4,
            adultsMin: 1,
            children: [], // children age
            childrenMax: 3,
            childMaxAge: 17,
            childDefaultAge: 7,
            summary: function(adults, children) {
                return (adults + children.length);
            },

            adultsTitle: 'Adults',
            childrenTitle: 'Children',
            childAge: 'Age',
            childHint: 'Check da age!',
            childrenListTitle: 'It is children list',
            childValSep: false,

            titlesPosInside: false, // are titles inside 'val' container or not
            decControlContent: '&minus;',
            incControlContent: '&plus;',
            decControlContentChld: '&minus;',
            incControlContentChld: '&plus;',

            goalOpen: {},

            tplContainer: hlf.getTpl('guests.container'),
            tplChild: hlf.getTpl('guests.child')

        });

        /**
         * Returns (if possible) this control value as string to use in URL
         * @returns {object}
         */
        function getParams() {
            var r = {
                'adults': config.adults
            };
            if(config.children.length) {
                r['children'] = config.children.join(',');
            }
            return r;
        }


        function summaryClick() {
            $g.hasClass('hlf-state--closed') ? guestsOpen() : guestsClose();
            return false;
        }

        function guestsClose() {
            $g.addClass('hlf-state--closed');
            $g.removeClass('hlf-state--focus');
            $c.removeClass('hlf-state--focus');
        }

        function guestsOpen() {
            hlf.goal(config.goalOpen);
            $g.removeClass('hlf-state--closed');
            $g.addClass('hlf-state--focus');
            $c.addClass('hlf-state--focus');
        }

        function drawChild(key) {
            if (config.children[key]===null) {
                config.children[key] = config.childDefaultAge;
            }
            $cl.append(config.tplChild({
                key: key,
                age: config.children[key],
                title: config.childAge,
                hint: config.childHint,
                childValSep: config.childValSep,
                decControlContent: config.decControlContent,
                incControlContent: config.incControlContent,
                decControlContentChld: config.decControlContentChld,
                incControlContentChld: config.incControlContentChld

            }));

            $chc[key] = hlf.getEl($cl, 'child-container', key);
            $chi[key] = hlf.getEl($chc[key], 'child-age-increment');
            $cha[key] = hlf.getEl($chc[key], 'child-age');
            $chd[key] = hlf.getEl($chc[key], 'child-age-decrement');

            $chi[key].on('click', {operation: 1}, newAge);
            $chd[key].on('click', {operation: -1}, newAge);

            function newAge(e){
                var newValue;
                newValue = config.children[key] + e.data.operation;
                if ( newValue>config.childMaxAge || newValue<0){
                    return false
                }
                config.children[key] = newValue;
                $cha[key][0].textContent = newValue;
                return false;
            }
        }

        function update() {
            $s.html(config.summary(config.adults, config.children));
            $av.html(config.adults);
            $cv.html(config.children.length);

            if (config.children.length){
                $cl.removeClass('hlf-state--empty')
                $clt.removeClass('hlf-state--disabled');
            } else {
                $cl.addClass('hlf-state--empty');
                $clt.addClass('hlf-state--disabled');
            }

            config.children.length == config.childrenMax
                ? $ci.addClass('hlf-state--disabled')
                : $ci.removeClass('hlf-state--disabled');

            !config.children.length
                ? $cd.addClass('hlf-state--disabled')
                : $cd.removeClass('hlf-state--disabled');

            config.adults == config.adultsMax
                ? $ai.addClass('hlf-state--disabled')
                : $ai.removeClass('hlf-state--disabled');

            config.adults == config.adultsMin
                ? $ad.addClass('hlf-state--disabled')
                : $ad.removeClass('hlf-state--disabled');

        }

        /**
         * Draw in DOM
         * @param name string [hlf-name] container param
         * @param $f DOM element like context, usually it's <form/> or <div/>
         * @param c list of all form controls
         * @param ti tabIndex value
         */
        return function (name, $f, c, ti) {

            controls = c || {};
            config.tabIndex = ti || 0;

            $doc = $(document);
            $c = hlf.getContainer($f, 'guests', name);
            $c.html(config.tplContainer(config));
            $g = hlf.getEl($c, 'guests');
            $s = hlf.getEl($c, 'summary');
            $cc = hlf.getEl($c, 'controls');
            $av = hlf.getEl($c, 'adults-val');
            $ad = hlf.getEl($c, 'adults-decrement');
            $ai = hlf.getEl($c, 'adults-increment');
            $cv = hlf.getEl($c, 'children-val');
            $cd = hlf.getEl($c, 'children-decrement');
            $ci = hlf.getEl($c, 'children-increment');
            $cl = hlf.getEl($c, 'children-list');
            $clt = hlf.getEl($c, 'children-list-title');
            config.className&&$g.addClass(config.className);
            _.each(config.children, function(v, key) {
                drawChild(key);
            });
            update();

            $doc.on('click', function(ev) { // todo check if this own block (multi controls problem)
                if(!$(ev.target).closest('[hlf-role=guests]').length) {
                    guestsClose();
                }
                ev.stopPropagation();
            });

            $s.on('click', summaryClick);

            $s.on('keydown', function(e) {
                switch(e.keyCode) {
                    case 38:
                        guestsClose();
                        break;
                    case 40:
                        guestsOpen();
                        break;
                    default: break;
                }
            });

            $s.on('focus', function() {
                $s.addClass('hlf-state--focus');
                $c.addClass('hlf-state--focus');
            });

            $s.on('blur', function() {
                $s.removeClass('hlf-state--focus');
                $c.removeClass('hlf-state--focus');
            });

            $ai.on('click', function() {
                if(config.adults == config.adultsMax) {
                    return false;
                }
                config.adults++;
                update();
                return false;
            });

            $ad.on('click', function() {
                if(config.adults == config.adultsMin) {
                    return false;
                }
                config.adults--;
                update();
                return false;
            });

            $ci.on('click', function() {
                if(config.children.length == config.childrenMax) {
                    return false;
                }
                config.children.push(null);
                drawChild(config.children.length - 1);
                update();
                return false;
            });

            $cd.on('click', function() {
                if(config.children.length == 0) {
                    return false;
                }
                $chc[config.children.length - 1].remove();
                config.children.pop();
                $chc.pop();
                $chi.pop();
                update();
                return false;
            });

            return {
                config: config,
                getParams: getParams,
            };

        };

    };
})(jQuery, _, hlf);