/*!
     exemplo de como criar um componente knockout
    ko.bindingHandlers.yourBindingName = {
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            // This will be called when the binding is first applied to an element
            // Set up any initial state, event handlers, etc. here
        },
        update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            // This will be called once when the binding is first applied to an element,
            // and again whenever any observables/computeds that are accessed change
            // Update the DOM element based on the supplied values here.
        }
    };
*/
ko.bindingHandlers.autocomplete =
{
    init: function (element, valueAccessor, allBindings)
    {
        var value = valueAccessor();
        var urlSource = allBindings.get('source');
        var render    = allBindings.get('render');
        var onselect = allBindings.get('onselect');

        //  atribuindo automaticamente um loading para sinalizar o carregamento
        $(element).parent().append("<img class='loading-gif-ui-autocomplete'src='~/Images/giphy.gif' style='display:none;width: 15px;position: relative;float: right;top: -25px;left: -15px;'>");

        $(element).autocomplete({
            source: function (request, response) {
                $(element).parent().find('img.loading-gif-ui-autocomplete').show();
                $.post(urlSource, { 'term': request.term })
                    .done(function (data)
                    {
                        // por problemas de exibição nos modais. trazer o z-indez da lista para frente sempre
                        $(".ui-autocomplete").css('z-index', '999999');
                        var dados = JSON.parse(data);
                        // para customizar a renderização dos dados como concatenação de id - nome fazer um callback que receba os dados e formate em array
                        if (render != null)
                        {
                            response(render(dados));
                        }
                        // senão trazer os dados formatados em array direto do service
                        else
                        {
                            response(dados);
                        }
                    }).fail(function (error) {
                        console.log('Um erro ocorreu no componente de autocomplete.');
                        console.log(error);
                    }).always(function () {
                        $(element).parent().find('img.loading-gif-ui-autocomplete').hide();
                    });
            },
            minlength: 3,
            select: function (event, ui) {
                // sempre que selecionado o valor do input recebe a string no observable... para fazer uma pos exexução setar o callback onselect
                valueAccessor()(ui.item.value);
                if (onselect != null) {
                    onselect(event, ui);
                }
            }
        });
        ko.utils.registerEventHandler(element, 'focusout', function ()
        {
            var observable = valueAccessor();
            observable($(element).val());
        });

    },
    update: function (element, valueAccessor)
    {
        var value = ko.utils.unwrapObservable(valueAccessor());
        $(element).val(value);
    }
};

ko.bindingHandlers.masked = {
    init: function(element, valueAccessor, allBindings){
        var pattern = allBindings.get('pattern');
        $(element).mask(pattern);
        ko.utils.registerEventHandler(element, 'focusout', function() {
            var observable = valueAccessor();
            observable($(element).val());
        });

    },
    update: function(element, valueAccessor){
         var value = ko.utils.unwrapObservable(valueAccessor());
        $(element).val(value);
    }
};

/*
        font: http://stackoverflow.com/questions/15775608/using-nicedit-with-knockout
        And how to use it:

        <textarea id="area1" data-bind="nicedit: title" style="width: 640px"></textarea>
        ... where in my example "title" is your bound property of course.

        There are two "limitations":

        The textarea must have a DOM "id" attribute otherwise it crashes.
        With IE (at least, version 8) the DOMNodeInserted and DOMNodeRemoved 
        are not fired, which means that you have to type something after 
        modifying the style of your text for it to be properly updated in 
        your observable object.
    */
ko.bindingHandlers.nicedit = {
    init: function(element, valueAccessor) {
        var value = valueAccessor();
        var area = new nicEditor({fullPanel : true}).panelInstance(element.id, {hasPanel : true});
        $(element).text(ko.utils.unwrapObservable(value)); 

        // function for updating the right element whenever something changes
        var textAreaContentElement = $($(element).prev()[0].childNodes[0]);
        var areachangefc = function() {
            value(textAreaContentElement.html());
        };

        // Make sure we update on both a text change, and when some HTML has been added/removed
        // (like for example a text being set to "bold")
        $(element).prev().keyup(areachangefc);
        $(element).prev().bind('DOMNodeInserted DOMNodeRemoved', areachangefc);
    },
    update: function(element, valueAccessor) {
        var value = valueAccessor();
        var textAreaContentElement = $($(element).prev()[0].childNodes[0]);
        textAreaContentElement.html(value());
    }
};


/*
    necessita da dependencia maskmoney pra funcionar
    font: 
*/
ko.bindingHandlers.decimal102 = {
    init: function(element, valueAccessor, allBindingsAccessor) {
        if ($(element).is(':input'))
        {   
            $(element).maskMoney({thousands:'', decimal:',', mask:'99999999,99', allowZero: true, defaultZero: true});
            ko.utils.registerEventHandler(element, 'focusout', function() {
                var observable = valueAccessor();
                observable($(element).val());
            });
        }
        else
        {
            // tratamento caso passar um valor direto sem ser do tipo ko.obaervable.
            if (typeof valueAccessor() == 'string' || typeof valueAccessor() == 'number')
                $(element).text(valueAccessor().replace(".", ","));
            else
                $(element).text(valueAccessor()().replace(".", ","));
        }
    }, 
    update: function (element, valueAccessor, allBindingsAccessor) {
        var value = 0;
        var tamanho = parseInt(allBindingsAccessor().tamanho) || {};
        // tratamento caso passar um valor direto sem ser do tipo ko.obaervable.
        if (typeof valueAccessor() == 'string' || typeof valueAccessor() == 'number')
            valueAccessor = valueAccessor();
        else
            valueAccessor = valueAccessor()();
        
        if(valueAccessor !== null && valueAccessor.length > tamanho)
        {
            value = parseInt(valueAccessor.replace(/\D/g,'').substr(0,tamanho-1));
            $(element).val(value).focus();  
        }
        else
        {
            value = ko.utils.unwrapObservable(valueAccessor);
            
            if (value)
                $(element).val(value.replace('\.', ','));
            else
                $(element).val(value);
        }
    }
};

ko.bindingHandlers.numerico = {
    init: function(element, valueAccessor, allBindingsAccessor) {
        if ($(element).is(':input'))
        {
            $(element).maskMoney(
            {
                thousands:'', 
                decimal:',',
                precision:'0', 
                mask:'99999999,99',
                allowZero:true
            });
            ko.utils.registerEventHandler(element, 'focusout', function() {
                var observable = valueAccessor();
                observable($(element).val());
            });
        }
        else
        {
            // tratamento caso passar um valor direto sem ser do tipo ko.obaervable.
            if (typeof valueAccessor() == 'string' || typeof valueAccessor() == 'number')
                $(element).text(valueAccessor());
            else
                $(element).text(valueAccessor()());
        }
    }, 
    update: function (element, valueAccessor, allBindingsAccessor) {
        var value = 0;
        var tamanho = parseInt(allBindingsAccessor().tamanho) || {};
        // tratamento caso passar um valor direto sem ser do tipo ko.obaervable.
        if (typeof valueAccessor() == 'string' || typeof valueAccessor() == 'number')
            valueAccessor = valueAccessor();
        else
            valueAccessor = valueAccessor()();
        
        if(valueAccessor !== null && valueAccessor.length > tamanho)
        {
            // globalMsgVm.erros(['O tamanho máximo do input é :'+ (tamanho -1)]);
            value = parseInt(valueAccessor.replace(/\D/g,'').substr(0,tamanho));
            // value = value.replace(".",",");
            $(element).val(value).focus();  
        }
        else
        {
            value = ko.utils.unwrapObservable(valueAccessor);
            
            if (value)
                $(element).val(value);
            else
                $(element).val(value);
        }
    }
};

ko.bindingHandlers.maxLength = {
    update: function(element, valueAccessor, allBindings){
        if(allBindings().value()){
            allBindings()
              .value(allBindings().value().substr(0, valueAccessor()));
        }
    }
};

ko.bindingHandlers.dateTimePicker = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        //initialize datepicker with some optional options
        var options = allBindingsAccessor().dateTimePickerOptions || {};
        $(element).datetimepicker(options);

        //when a user changes the date, update the view model
        ko.utils.registerEventHandler(element, "dp.change", function (event) {
            var value = valueAccessor();
            if (ko.isObservable(value)) {
                if (event.date != null && !(event.date instanceof Date)) {
                    value(event.date.toDate());
                } else {
                    value(event.date);
                }
            }
        });

        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            var picker = $(element).data("DateTimePicker");
            if (picker) {
                picker.destroy();
            }
        });
    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {

        var picker = $(element).data("DateTimePicker");
        //when the view model is updated, update the widget
        if (picker) {
            var koDate = ko.utils.unwrapObservable(valueAccessor());

            //in case return from server datetime i am get in this form for example /Date(93989393)/ then fomat this
            koDate = (typeof (koDate) !== 'object') ? new Date(parseFloat(koDate.replace(/[^0-9]/g, ''))) : koDate;

            picker.date(koDate);
        }
    }
};

ko.bindingHandlers.sortable = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        // This will be called when the binding is first applied to an element
        // Set up any initial state, event handlers, etc. here
        var 
            list = valueAccessor(),
            defaultAction = function(){},
            actionActivate   = allBindings.get('activate')   || defaultAction,
            actionBeforeStop = allBindings.get('beforeStop') || defaultAction,
            actionChange     = allBindings.get('change')     || defaultAction,
            actionCreate     = allBindings.get('create')     || defaultAction,
            actionDeactivate = allBindings.get('deactivate') || defaultAction,
            actionOut        = allBindings.get('out')        || defaultAction,
            actionOver       = allBindings.get('over')       || defaultAction,
            actionReceive    = allBindings.get('receive')    || defaultAction,
            actionRemove     = allBindings.get('remove')     || defaultAction,
            actionSort       = allBindings.get('sort')       || defaultAction,
            actionStart      = allBindings.get('start')      || defaultAction,
            actionStop       = allBindings.get('stop')       || defaultAction
            //update           = allBindings.get('update')     || defaultAction,
        ;
        $(element).sortable(
        {
            containment: 'parent',
            placeholder: 'placeholder',
            update: function (event, ui)
            {
                var item = ko.dataFor(ui.item[0]),
                    newIndex = ko.utils.arrayIndexOf(ui.item.parent().children(), ui.item[0]);
                if (newIndex >= list().length) newIndex = list().length - 1;
                if (newIndex < 0) newIndex = 0;
        
                ui.item.remove();
                list.remove(item);
                list.splice(newIndex, 0, item);
            },
            activate: function( event, ui )
            {
                actionActivate(event, ui);
            },
            beforeStop: function( event, ui )
            {
                actionBeforeStop(event, ui);
            },
            change: function( event, ui )
            {
                actionChange(event, ui);
            },
            create: function( event, ui )
            {
                actionCreate(event, ui);
            },
            deactivate: function( event, ui )
            {
                actionDeactivate(event, ui);
            },
            out: function( event, ui )
            {
                actionOut(event, ui);
            },
            over: function( event, ui )
            {
                actionOver(event, ui);
            },
            receive: function( event, ui )
            {
                actionReceive(event, ui);
            },
            remove: function( event, ui )
            {
                actionRemove(event, ui);
            },
            sort: function( event, ui )
            {
                actionSort(event, ui);
            },
            start: function( event, ui )
            {
                actionStart(event, ui);
            },
            stop: function( event, ui )
            {
                actionStop(event, ui);
            }
        });
    },
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        // This will be called once when the binding is first applied to an element,
        // and again whenever any observables/computeds that are accessed change
        // Update the DOM element based on the supplied values here.
    }
};

ko.bindingHandlers.filereader = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        // This will be called when the binding is first applied to an element
        // Set up any initial state, event handlers, etc. here
        var 
            checker    = $(element)[0], 
            value      = valueAccessor(),
            fileResult = allBindings.get('result');

        ko.utils.registerEventHandler(element, 'change',function()
        {
            if(checker.files && checker.files[0])
            {
                var FR = new FileReader();
                FR.onload = function(e)
                {
                    fileResult(e.target.result);
                    value(checker.files[0]);
                }
                FR.readAsDataURL(checker.files[0]);
            }
        });


    }
};
