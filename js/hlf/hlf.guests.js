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
            $chc = [], // child containers
            $chiw = [], // child input wraps
            $chi = [], // child inputs
            $chh = [], // child hints
            controls = {};
        config = _.defaults(config || {}, {
            gaEvent: [], // category & event to send to ga, ex: ['formTop'], ['noFuckingDates']
            adultsMax: 4,
            adultsMin: 1,
            adults: 2, // adults value
            children: [], // children age
            childrenMax: 3,
            childMaxAge: 17,
            adultsTitle: 'Adults',
            childrenTitle: 'Children',
            childHint: 'Check da age!',
            summary: function(adults, children) {
                return (adults + children.length);
            },
            tplContainer: _.template('<div class="hlf-guests hlf-state--closed" hlf-role="guests"><a href="#" class="hlf-guests-i" tabindex="<%= tabIndex %>" hlf-role="summary"></a><div class="hlf-guests-dd" hlf-role="controls"><div class="hlf-guests-adults"><div class="hlf-guests-adults-title"><%= adultsTitle %></div><div class="hlf-guests-adults-controls"><a href="#" hlf-role="adults-decrement">-</a><div class="hlf-guests-adults-val" hlf-role="adults-val"></div><a href="#" hlf-role="adults-increment">+</a></div></div><div class="hlf-guests-children"><div class="hlf-guests-children-title"><%= childrenTitle %></div><div class="hlf-guests-children-controls"><a href="#" hlf-role="children-decrement">-</a><div class="hlf-guests-children-val" hlf-role="children-val"></div><a href="#" hlf-role="children-increment">+</a></div><ul class="hlf-guests-children-list" hlf-role="children-list"></ul></div></div></div>'),
            tplChild: _.template('<li class="hlf-guests-children-item" hlf-role="child-container" hlf-name="<%= key %>"><div class="hlf-input" hlf-role="input-wrap"><input type="text" hlf-role="input" value="<%= age %>" /><div class="hint" hlf-role="hint"><%= hint %></div></div></li>')
        });

        /**
         * Returns (if possible) this control value as string to use in URL
         * @returns {string|null}
         */
        function getParams() {
            var str = 'adults=' + config.adults;
            if(config.children.length) {
                str += '&children=' + config.children.join(',');
            }
            return str;
        }

        function validate() {
            // validate each field
            var r = _.map(config.children, function(age, key) {
                var ok = !(age === null || parseInt(age) < 0 || parseInt(age) > config.childMaxAge);
                if(ok) {
                    $chiw[key].removeClass('hlf-state--error');
                }
                return ok;
            });
            // show hint of first error
            _.each(r, function(ok, key) {
                if(!ok) {
                    $chi[key].focus();
                    $chiw[key].addClass('hlf-state--error');
                    return false;
                }
            });
            // count error results
            return !_.filter(r, function(ok) {
                return !ok;
            }).length;
        }

        function summaryClick() {
            $g.hasClass('hlf-state--closed') ? guestsOpen() : guestsClose();
        }

        function guestsClose() {
            $g.addClass('hlf-state--closed');
            $g.removeClass('hlf-state--focus');
        }

        function guestsOpen() {
            hlf.ga.event(config.gaEvent);
            $g.removeClass('hlf-state--closed');
            $g.addClass('hlf-state--focus');
        }

        /**
         * Draws control in DOM
         * @param name string [hlf-name] container param
         * @param $f DOM element like context, usually it's <form/> or <div/>
         * @param c list of all form controls
         */
        function draw(name, $f, c) {
            controls = c || {};
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
            _.each(config.children, function(v, key) {
                drawChild(key);
            });
            update();

            $doc.on('click', function(ev) {
                if(!$(ev.target).closest('[hlf-role=guests]').length) {
                    guestsClose();
                }
                ev.stopPropagation();
            });

            $s.on('click', summaryClick);

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
                $chiw.pop();
                $chi.pop();
                $chh.pop();
                update();
                return false;
            });

        }

        function drawChild(key) {

            $cl.append(config.tplChild({
                key: key,
                age: config.children[key],
                hint: config.childHint
            }));

            $chc[key] = hlf.getEl($cl, 'child-container', key);
            $chiw[key] = hlf.getEl($chc[key], 'input-wrap');
            $chi[key] = hlf.getEl($chc[key], 'input');
            $chh[key] = hlf.getEl($chc[key], 'hint');

            $chi[key].on('focus', function() {
                $chiw[key].addClass('hlf-state--focus');
                $chiw[key].removeClass('hlf-state--error');
            });

            $chi[key].on('blur', function() {
                $chiw[key].removeClass('hlf-state--focus');
            });

            $chi[key].on('keyup', function() {
                var val = $chi[key].val().trim();
                if(!val.length || !_.isFinite(val)) {
                    config.children[key] = null;
                } else {
                    config.children[key] = parseInt(val);
                }
            });

            $chi[key].on('keydown', function(e) {
                $chiw[key].removeClass('hlf-state--error');
            });

            $chh[key].on('click', function() {
                $chiw[key].removeClass('hlf-state--error');
            });

            if(config.children[key] == null) {
                $chi[key].focus();
            }

        }

        function update() {
            $s.html(config.summary(config.adults, config.children));
            $av.html(config.adults);
            $cv.html(config.children.length);

            config.children.length
                ? $cl.removeClass('hlf-state--empty')
                : $cl.addClass('hlf-state--empty');

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
         * Returns control config object
         * @returns {*}
         */
        function getConfig() {
            return config;
        }

        return {
            draw: draw,
            getParams: getParams,
            getConfig: getConfig,
            validate: validate
        };

    };
})(jQuery, _, hlf);