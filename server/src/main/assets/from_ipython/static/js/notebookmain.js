//----------------------------------------------------------------------------
//  Copyright (C) 2008-2011  The IPython Development Team
//
//  Distributed under the terms of the BSD License.  The full license is in
//  the file COPYING, distributed as part of this software.
//----------------------------------------------------------------------------

//============================================================================
// On document ready
//============================================================================


$(document).ready(function () {

    IPython.init_mathjax();

    IPython.read_only = $('body').data('readOnly') === 'True';
    $('div#main_app').addClass('border-box-sizing ui-widget');
    $('div#notebook_panel').addClass('border-box-sizing ui-widget');
    // The header's bottom border is provided by the menu bar so we remove it.
    $('div#header').css('border-bottom-style','none');

    IPython.page = new IPython.Page();
    IPython.markdown_converter = new Markdown.Converter();
    IPython.layout_manager = new IPython.LayoutManager();
    IPython.pager = new IPython.Pager('div#pager', 'div#pager_splitter');
    IPython.quick_help = new IPython.QuickHelp('span#quick_help_area');
    IPython.login_widget = new IPython.LoginWidget('span#login_widget');
    IPython.notebook = new IPython.Notebook('div#notebook');
    IPython.save_widget = new IPython.SaveWidget('span#save_widget');
    IPython.menubar = new IPython.MenuBar('#ribbon')
    IPython.keybindings = new IPython.KeyBindings(IPython.notebook, IPython.layout_manager)
    IPython.toolbar = new IPython.ToolBar('#toolbar')
    IPython.notification_widget = new IPython.NotificationWidget('#notification')

    IPython.layout_manager.do_resize();

    if(IPython.read_only){
        // hide various elements from read-only view
        $('div#pager').remove();
        $('div#pager_splitter').remove();

        // set the notebook name field as not modifiable
        $('#notebook_name').attr('disabled','disabled')
    }

    IPython.page.show();

    IPython.layout_manager.do_resize();
    $([IPython.events]).on('notebook_loaded.Notebook', function () {
        IPython.layout_manager.do_resize();
        IPython.save_widget.update_url();
    })

    var body = $('body');
    var idCounter = 1
    var genId = function (name) {
        idCounter++
        return name + idCounter
    }

    var initDeps = function () {
        $.ajax($('body').data('baseProjectUrl') + 'notebooks', {
            processData : false,
            cache : false,
            type : "GET",
            dataType : "json",
            success : function (data, status, xhr) {
                var deps = $('#dependencies')

                for (var i = 0; i < data.length; i++) {
                    if (data[i].name == IPython.notebook.metadata.name) continue

                    var id = genId("dependency")
                    var cb = $('<input />', {type: 'checkbox', name: 'dep', id: id})
                        .data("name", data[i].name)
                        .prop("checked", IPython.notebook.has_dep(data[i].name))
                    var label = $("<label />", {'for': id}).addClass('dep-label').text(data[i].name)

                    $("<li>")
                        .append(cb)
                        .append(label)
                        .appendTo(deps)

                    cb.click(function () {
                        if ($(this).prop("checked")) {
                            IPython.notebook.add_dep($(this).data("name"))
                        } else {
                            IPython.notebook.remove_dep($(this).data("name"))
                        }
                    })
                }
            },
            error : $.proxy(IPython.notebook.load_notebook_error, IPython.notebook)
        });
    }

    var initSettings = function() {
        if (IPython.notebook.metadata.run_automatically) {
            setTimeout(function() {IPython.notebook.execute_all_cells()}, 200)
            $("#auto_run_check").prop("checked", true)
        }

        if (IPython.notebook.metadata.show_input_by_default) {
            IPython.notebook.all_cell_visibility(true, true)
            $("#auto_all_check").prop("checked", true)
        }

        $("#auto_run_check").click(function () {
            IPython.notebook.metadata.run_automatically = $(this).prop("checked")
            IPython.notebook.set_dirty()
        })

        $("#auto_all_check").click(function () {
            IPython.notebook.metadata.show_input_by_default = $(this).prop("checked")
            IPython.notebook.set_dirty()
        })
    }

    IPython.notebook.load_notebook(body.data('notebookName'), body.data('notebookId'), function () {
        initDeps()
        initSettings()
    });
});

