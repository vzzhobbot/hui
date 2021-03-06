;(function ($, _, hlf) {
    'use strict';

    hlf.ac = function (config) {

        var $c = null, // container
            $iw = null, // input wrap
            $i = null, // input
            $h = null, // hint
            $l = null, // loader
            $sc = null, // samples container
            $sl = null, // samples links
            $cl = null, //close button
            controls = {},
            goalUseInputSent = false; // flag means event 'use' sent (prevent multisent)

        config = _.defaults(config || {}, {

            url: (location.protocol == 'file:' ? 'http:' : '') + '//yasen.hotellook.com/autocomplete',
            name: 'destination', // getParams() param name in case
                                 // you select nothing in autocomplete
            className: '',
            text: '', // default input value
            type: '', // default type
            id: 0, // default id
            limit: 5, // limit for items each category
            locale: 'en-US',
            latinLocationFullName: '',
            mobileMode: hlf.config.mobileMode,
            autoFocus: false, // auto focus if field is empty
            needLocationPhotos: false,
            locationPhotoSize: '240x75',
            onlyLocations: false,

            placeholder: 'Type something....',
            hint: 'panic!', // this control always required, its hint text
            translateCategory: function(t) {
                return t;
            },
            translateHotelsCount: function(n) {
                return n + ' hotels';
            },

            goalUseInput: {}, // {ga: 'la-la-la.bla-bla', yam: 'sdasds', as: 'something'}
            goalAcSelect: {},
            goalUseSamples: {},
            goalUseClear: {},

            onSelect: function() {}, // select from autocomplete
            onSelectShowCalendar: null,
            onReset: function() {}, // fires when you type something in autocomplete
                                    // and type & id values resets
            avgPricesUrl: (location.protocol == 'file:' ? 'http:' : '') + '//yasen.hotellook.com/minprices/location_calendar/{id}.json?currency=USD&adults=2',
            avgPricesCalendars: [], // names if controls
            avgPricesFormatter: function(v) {
                return '' + Math.round(v);
            },
            avgPricesFormatterLegend: function(v) {
                return '' + Math.round(v);
            },


            samplesText: 'For example: {list}',
            samplesList: [], // e.g.:
                             // [
                             //     {id: 15542, type: 'location', text: 'Paris, France', sample: 'Paris'},
                             //     {id: 15298, type: 'location', text: 'Marseille, France', sample: 'Marseille'}
                             // ]

            tplInput: hlf.getTpl('ac.input'),
            tplSamples: hlf.getTpl('ac.samples'),
            tplSamplesLink: hlf.getTpl('ac.samplesLink')

        });

        selectAutocomplete = !(config.term && config.term.length > 0);

        function avgPricesRequest (id) {
            if(config.avgPricesCalendars.length) {
                _.each(config.avgPricesCalendars, function(name) {
                    if(!_.isUndefined(controls[name])) {
                        controls[name].resetDetails();
                    }
                });
                $.ajax({
                    dataType: 'jsonp',
                    type: 'get',
                    cache: true,
                    url: config.avgPricesUrl.replace('{id}', id),
                    success: avgPricesRequestSuccess
                });
            }
        }

        function avgPricesRequestSuccess(data) {
            if(_.size(data)) {
                var first = null;
                _.each(config.avgPricesCalendars, function(name) {
                    if(!first) {
                        controls[name].setDetails({
                            dates: data.dates,
                            points: [ // price points for legend
                                data.points.cheap,
                                data.points.regular,
                                data.points.expensive
                            ],
                            formatter: config.avgPricesFormatter,
                            formatterLegend: config.avgPricesFormatterLegend
                        });
                        controls[name].refresh();
                        first = controls[name];
                    } else {
                        controls[name].setDetails(_.clone(first.getDetails(), true));
                        controls[name].refresh();
                    }
                });
            }
        }

        /**
         * Get params string
         * @returns {object}
         */
        function getParams() {
            var r = {};
            switch(true) {
                case !!(config.id && config.type):
                    r[config.type + 'Id'] = config.id;
                    break;
                case !!config.text:
                    r[config.name] = config.text;
                    break;
                default: break;
            }
            return r;
        }

        function source(request, response) {
            $iw.addClass('hlf-state--loading');
            $.ajax({
                dataType: 'jsonp',
                type: 'get',
                url: config.url,
                data: {
                    lang: config.locale,
                    limit: config.limit,
                    term: request.term
                },
                success: function(data) {
                    var cities = _.map(data.cities, function(item) {
                        return {
                            id: item.id,
                            category: config.translateCategory('Locations'),
                            type: 'location',
                            value: item.fullname,
                            text: item.city,
                            latinLocationFullName: item.latinFullName,
                            clar: item.clar || '',
                            comment: config.translateHotelsCount(item.hotelsCount),
                            photo: config.needLocationPhotos ? 'https://photo.hotellook.com/static/cities/' + config.locationPhotoSize + '/' + item.id + '.auto' : false
                        }
                    });
                    if (!config.onlyLocations) {
                        var hotels = _.map(data.hotels, function (item) {
                            return {
                                id: item.id,
                                category: config.translateCategory('Hotels'),
                                type: 'hotel',
                                latinLocationFullName: item.latinLocationFullName,
                                value: item.name + ', ' + item.city + ', ' + item.country,
                                text: item.name,
                                clar: item.city + ', ' + item.country
                            }
                        });
                        response(_.union(cities, hotels));
                    } else {
                        response(_.union(cities));
                    }
                    $iw.removeClass('hlf-state--loading');
                },
                error: function() {
                    $iw.removeClass('hlf-state--loading');
                }
            });
        }

        function setValue(id, type, title) {
            config.id = id;
            config.type = !type ? 'location' : type;
            if (title) {
                config.text = title;
                $i.val(title);
            }
        }

        function onReset() {
            _.each(config.avgPricesCalendars, function(name) {
                controls[name].resetDetails();
            });
            config.onReset();
        }

        function select(type, id, text, locationName) {
            $iw.removeClass('hlf-state--error');
            config.type = type;
            config.id = id;
            if (locationName) {
                config.latinLocationFullName = locationName;
            }
            if(text) {
                $i.val(text);
                config.text = text;
            }
            avgPricesRequest(id);
            config.onSelect(type, id);
            if(config.onSelectShowCalendar) {
                if(!controls[config.onSelectShowCalendar].getStamp() && !config.mobileMode) {
                    controls[config.onSelectShowCalendar].show();
                }
            }
        }

        function validate() {
            if(_.size(getParams())) {
                return true;
            }
            if (!config.mobileMode) {
              $i.focus();
            }
            $iw.addClass('hlf-state--error');
            return false;
        }

        return function(name, $f, c, ti) {
            if(config.id) {
                avgPricesRequest(config.id);
            }

            controls = c || {};
            config.tabIndex = ti || 0;

            $c = hlf.getContainer($f, 'ac', name);
            $c.html(config.tplInput(config));
            $iw = hlf.getEl($c, 'input-wrap');
            $i = hlf.getEl($c, 'input');
            $h = hlf.getEl($c, 'hint');
            $l = hlf.getEl($c, 'loader');
            $cl = hlf.getEl($c, 'close'); //close button
            config.className&&$iw.addClass(config.className);

            if (_.size(getParams())) {
                $iw.addClass('hlf-state--no-empty');
            };

            $i.reachAutocomplete({
                source: source,
                select: function(ev, data) {
                    select(data.item.type, data.item.id, data.item.value, data.item.latinLocationFullName);
                    hlf.goal(config.goalAcSelect, data.item);
                    hlf.goal(config.goalAcSelectType, data.item.type);
                },
                open: function(event, ui) {
                    //hack for touch events on iOS
                    if (config.mobileMode) {
                      $('.ui-autocomplete').off('menufocus hover mouseover mouseenter');
                    }
                },
                minLength: 3,
                create: function (e, ui) {
                  if (config.term) {
                    var $input = $(this);
                    $input.val(config.term);
                    $input.reachAutocomplete("search", config.term);
                  }
                }
            });

            $i.on('keyup', function() {
                config.text = $i.val();
                if (!(_.size(getParams())) && $iw.hasClass('hlf-state--no-empty')) {
                    $iw.removeClass('hlf-state--no-empty');
                };

            });

            $i.on('keydown', function(e) {
                // ignore enter & tab key
                if(e.keyCode !== 13 && e.keyCode !== 9) {
                    config.type = '';
                    config.id = 0;
                    onReset();
                }
                if(!goalUseInputSent) {
                    hlf.goal(config.goalUseInput);
                    goalUseInputSent = true;
                }
                $iw.removeClass('hlf-state--error');
                if ($i[0].value!='') {
                    $iw.addClass('hlf-state--no-empty');
                };
            });

            $i.on('focus', function() {
                if (selectAutocomplete) {
                  $(this).select();
                }
                $c.addClass('hlf-state--focus');
                $iw.addClass('hlf-state--focus');
                $iw.removeClass('hlf-state--error');
                goalUseInputSent = false;
                selectAutocomplete = true;
            });

            $i.on('blur', function() {
                $c.removeClass('hlf-state--focus');
                $iw.removeClass('hlf-state--focus');
            });

            $h.on('click', function() {
                $iw.removeClass('hlf-state--error');
            });

            $cl.on('click', function(){
                $i[0].value='';
                $iw.removeClass('hlf-state--no-empty');
                config.type = '';
                config.id = 0;
                onReset();
                config.text='';
                $i.focus();
                hlf.goal(config.goalUseClear);
            });

            if(config.autoFocus && !config.text.length && !device.mobile()) {
                $i.focus();
            }

            if(config.samplesList.length) {

                var links = _.map(config.samplesList, function(i) {
                    return config.tplSamplesLink(i);
                });
                var samples = config.tplSamples(
                    _.defaults({
                        samplesText: config.samplesText.replace('{list}', links.join(', '))
                    }, config)
                );
                $c.append(samples);
                $sc = hlf.getEl($c, 'samples');
                $sl = hlf.getEl($sc, 'samples-link');

                $sl.on('click', function() {
                    var $this = $(this);
                    select($this.data('type'), $this.data('id'), $this.data('text'), $this.data('latinlocationfullname'));
                    hlf.goal(config.goalUseSamples);
                    $iw.addClass('hlf-state--no-empty');
                    return false;
                });

            }

            return {
                config: config,
                select: select,
                getParams: getParams,
                setValue: setValue,
                validate: validate,
                input: $i
            };

        };

    };

    /**
     * Extension for jQuery.ui.autocomplete
     */
    $.widget('custom.reachAutocomplete', $.ui.autocomplete, {
        _create: function() {
            this._super();
            this.widget().menu('option', 'items', '> :not(.ui-autocomplete-category)');
        },
        _renderMenu: function( ul, items ) {
            ul.addClass('hlf-ac');
            var that = this,
                currentCategory = "";
            $.each( items, function( index, item ) {
                var li;
                if ( item.category != currentCategory ) {
                    ul.append( "<li class='ui-autocomplete-category'>" + item.category + "</li>" );
                    currentCategory = item.category;
                }
                li = that._renderItemData( ul, item );
                if ( item.category ) {
                    li.attr( "aria-label", item.category + " : " + item.label );
                }
            });
        },
        _renderItem: function (ul, item) {
            var label = '';
            if (item.photo)
                label += '<img src="' + item.photo + '" class="ui-menu-item-img" />';
            label += '<span class="ui-menu-item-text">' + item.text + (item.clar ? ', <span class="ui-menu-item-clar">' + item.clar + '</span>' : '') + '</span>';
            if (item.comment)
                label += '<span class="ui-menu-item-comment">' + item.comment + '</span>';
            return $("<li>")
                .append($("<a>").html(label))
                .appendTo(ul);
        }
    });

})(jQuery, _, hlf);
