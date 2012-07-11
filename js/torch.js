/********************************************************************
 * Torch7 Web-based terminal.
 * (note: a lot of this code has been borrowed from the 
 *  Julia web terminal, thanks a lot to these guys!)
 ********************************************************************/

// Global variables: cells
layout = {
    col_left : null,
    col_right : null,
    terminal : null,
    terminalform : null
}

/********************************************************************
 * Layout
 ********************************************************************/

// set the outer height of an element or group of elements
function set_outer_height(selector, height) {
    $(selector).height(1);
    $(selector).height(height+1-$(selector).outerHeight(true));
}

// this function makes all of the columns the same height
function set_column_heights() {
    // determine the new height of the columns
    var new_columns_height = Math.max(350, $(window).height());

    // set the height of all the columns to the height of the window
    set_outer_height("#left-column", new_columns_height);
    set_outer_height("#right-column", new_columns_height);

    // make the terminal take up the full height of the right column
    set_outer_height("#terminal-form", new_columns_height);
}

// this function creates the layout
function create_layout() {
    // add left cell
    layout.col_left = create_cell({
        parent : 'body',
        id : 'left-column'
    })
    $(layout.col_left.id).html(
    ' \
        <h1>torch7 ></h1> \
        <ul> \
            <li><a href="http://www.torch.ch" target="_blank">Torch7 Home Page</a></li> \
            <li><a href="http://www.torch.ch/manual/index" target="_blank">Documentation</a></li> \
            <li><a href="https://github.com/andresy/torch" target="_blank">Github</a></li> \
            <li><a href="https://github.com/andresy/torch/issues" target="_blank">Issues</a></li> \
            <li><a href="http://groups.google.com/group/torch7" target="_blank">Google Group</a></li> \
        </ul> \
        <h2>Tutorials</h2> \
        <ul> \
            <li><a href="http://code.cogbits.com/tutorials/0_getstarted/README.html" target="_blank">Getting Started</a></li> \
            <li><a href="http://code.cogbits.com/tutorials/1_supervised/README.html" target="_blank">Supervised Learning</a></li> \
            <li><a href="http://code.cogbits.com/tutorials/2_unsupervised/README.html" target="_blank">Unsupervised Learning</a></li> \
        </ul> \
        <h2>Color Scheme</h2> \
        <select id="color-scheme-picker"> </select> \
        <h2>Quick Reference</h2> \
        <p>For help, try one of these:</p> \
          <code>help()</code></br> \
          <code>help(func)</code></br> \
          <code>?func</code></br> \
          <code>who()</code></br> \
        <p>Visualization:</p> \
          <code>display(image)</code></br> \
          <code>plot(vector)</code></br> \
          <code>hist(vector)</code></br> \
    '
    )

    // add right cell
    layout.col_right = create_cell({
        parent : 'body',
        id : 'right-column'
    })
    $(layout.col_right.id).html(
    ' \
        <form id="terminal-form"> \
            <div id="terminal"><span class="color-scheme-message">&lt;initializing&gt;<br /><br /></span></div> \
            <div> \
                <div id="prompt"><span class="color-scheme-prompt">t7&gt;&nbsp;</span></div> \
                <textarea id="terminal-input" spellcheck="false" rows="1" cols="20" disabled="disabled" /></textarea> \
            </div> \
        </form> \
    '
    )

    // create cell to encapsulate terminal
    layout.terminalform = {
        class: "",
        content: "",
        css: {},
        id: "#terminal-form"
    }
    layout.terminal = {
        class: "",
        content: "",
        css: {},
        id: "#terminal"
    }

    // resize columns
    set_column_heights();
}

// adjust the heights of the columns when the page loads or is resized
$(document).ready(create_layout);
$(window).resize(set_column_heights);

/********************************************************************
 * Terminal
 ********************************************************************/
(function() {

/********************************************************************
 * Color Schemes
 ********************************************************************/

// array of color schemes
var color_schemes = [
    ["Dark", {
        background_color: "#000000",
        text_color: "#dddddd",
        message_color: "#0000aa",
        error_color: "#ff0000",
        prompt_color: "#00bb00",
        plot_grid_color: "#333333",
        plot_axis_color: "#666666",
        plot_text_color: "#dddddd",
        plot_line_color: "#4d87c7",
        plot_rect_color: "#4d87c7",
        plot_rect_stroke_width: "0",
        plot_rect_stroke_color: "#FFFFFF",
    }],
    ["Light", {
        background_color: "#ffffff",
        text_color: "#444444",
        message_color: "#0000aa",
        error_color: "#ff0000",
        prompt_color: "#00aa00",
        plot_grid_color: "#dadada",
        plot_axis_color: "#aaaaaa",
        plot_text_color: "#444444",
        plot_line_color: "#4d87b7",
        plot_rect_color: "#4d87c7",
        plot_rect_stroke_width: "0",
        plot_rect_stroke_color: "#FFFFFF",
    }],
];

// the current color scheme
var current_color_scheme = 1;

// Fetch items out of local storage if they exist
if (Modernizr.localstorage) {
    if (localStorage.getItem("current_color_scheme")) {
        current_color_scheme = localStorage.getItem("current_color_scheme");
    }
}

// apply a particular color scheme -- call this every time the terminal content changes
function apply_color_scheme() {
    $("form#terminal-form").css("background-color", color_schemes[current_color_scheme][1].background_color);
    $("div#terminal").css("color", color_schemes[current_color_scheme][1].text_color);
    $("textarea#terminal-input").css("color", color_schemes[current_color_scheme][1].text_color);
    $("span.color-scheme-message").css("color", color_schemes[current_color_scheme][1].message_color);
    $("span.color-scheme-error").css("color", color_schemes[current_color_scheme][1].error_color);
    $("span.color-scheme-prompt").css("color", color_schemes[current_color_scheme][1].prompt_color);
    $("svg .hrule line, svg .vrule line").css("stroke", color_schemes[current_color_scheme][1].plot_grid_color);
    $("svg .hrule2 line, svg .vrule2 line").css("stroke", color_schemes[current_color_scheme][1].plot_axis_color);
    $("svg text").css("fill", color_schemes[current_color_scheme][1].plot_text_color);
    $("svg .line").css("stroke", color_schemes[current_color_scheme][1].plot_line_color);
    $("svg .rect").css("fill", color_schemes[current_color_scheme][1].plot_rect_color);
    $("svg .rect").css("stroke", color_schemes[current_color_scheme][1].plot_rect_stroke_width);
    
    if (Modernizr.localstorage) {
        localStorage.setItem("current_color_scheme", current_color_scheme);
    }
}

// when the DOM loads
$(document).ready(function() {
    // add the color scheme options to the picker
    var options_str = "";
    for (var i in color_schemes)
        options_str += "<option " + (current_color_scheme === i ? "selected" : "") + ">"+color_schemes[i][0]+"</option>";
    $("select#color-scheme-picker").html(options_str);

    // add a hook to the change event of the color picker
    $("select#color-scheme-picker").change(function() {
        // determine which color scheme was selected
        var scheme_name = $("select#color-scheme-picker option:selected").html();
        for (var i in color_schemes) {
            if (color_schemes[i][0] == scheme_name) {
                current_color_scheme = i;
                break;
            }
        }

        // apply the color scheme
        apply_color_scheme();
    });

    // apply the current color scheme
    apply_color_scheme();
});

/********************************************************************
 * Network
 ********************************************************************/

// input messages (to Torch)
var MSG_INPUT_NULL              = 'null';
var MSG_INPUT_START             = 'start';
var MSG_INPUT_POLL              = 'poll';
var MSG_INPUT_EVAL              = 'eval';
var MSG_INPUT_REPLAY_HISTORY    = 'replay_history';
var MSG_INPUT_GET_USER          = 'get_user';
var MSG_INPUT_COMPLETION        = 'completion';

// output messages (to the browser)
var MSG_OUTPUT_NULL             = 'null';
var MSG_OUTPUT_WELCOME          = 'welcome';
var MSG_OUTPUT_READY            = 'ready';
var MSG_OUTPUT_MESSAGE          = 'message';
var MSG_OUTPUT_OTHER            = 'other';
var MSG_OUTPUT_EVAL_INPUT       = 'eval_input';
var MSG_OUTPUT_FATAL_ERROR      = 'fatal_error';
var MSG_OUTPUT_EVAL_INCOMPLETE  = 'eval_incomplete';
var MSG_OUTPUT_EVAL_RESULT      = 'eval_result';
var MSG_OUTPUT_EVAL_ERROR       = 'eval_error';
var MSG_OUTPUT_PLOT             = 'plot';
var MSG_OUTPUT_GET_USER         = 'get_user';

/********************************************************************
 * Implementation
 ********************************************************************/

// the user name
var user_name = "t7";

// the user id
var user_id = "";

// indent string
var indent_str = "    ";

// how long we delay in ms before polling the server again
var poll_interval = 100;

// keep track of whether we are waiting for a message (and don't send more if we are)
var waiting_for_response = false;

// a queue of messages to be sent to the server
var outbox_queue = [];

// a queue of messages from the server to be processed
var inbox_queue = [];

// keep track of whether new terminal data will appear on a new line
var new_line = true;

// keep track of whether we have received a fatal message
var dead = false;

// keep track of terminal history
var input_history = [];
var input_history_current = [""];
var input_history_id = 0;
var input_history_size = 1000;

// Fetch items out of local storage if they exist
if (Modernizr.localstorage) {
    if (localStorage.getItem("input_history")) {
        input_history = JSON.parse(localStorage.getItem("input_history"));
        input_history_id = input_history.length - 1;
    }
    
    if (localStorage.getItem("input_history_current")) {
        input_history_current = JSON.parse(localStorage.getItem("input_history_current"));
    }
}

// reset the width of the terminal input
function set_input_width() {
    // resize the input box (the -1 is for Internet Explorer)
    $("#terminal-input").width($("#terminal").width()-$("#prompt").width()-1);
}

// set the width of the terminal
function set_terminal_width() {
    // set the width of the terminal
    var new_terminal_width = Math.max($(window).width()-229, 200);
    $("div#right-column").width(new_terminal_width);

    // resize the page container as well
    $("div#main").width($("div#left-column").outerWidth(true)+$("div#right-column").outerWidth(true));

    // reset the width of the terminal input
    set_input_width();
}

// set the width of the terminal when the window is resized
$(window).resize(set_terminal_width);

// jQuery extensions
jQuery.fn.extend({
    // insert some text into a textarea at the cursor position
    insert_at_caret: function(str) {
        // apply this function to all elements that match the selector
        return this.each(function(i) {
            // if text is selected, then just replace it
            if (document.selection) {
                // replace the selection with str
                this.focus();
                sel = document.selection.createRange();
                sel.text = str;
                this.focus();
            } else if (this.selectionStart || this.selectionStart == "0") {
                // replace the selection with str
                var start_pos = this.selectionStart;
                var end_pos = this.selectionEnd;
                var scroll_top = this.scrollTop;
                this.value = this.value.substring(0, start_pos)+str+this.value.substring(end_pos, this.value.length);
                this.focus();
                this.selectionStart = start_pos+str.length;
                this.selectionEnd = start_pos+str.length;
                this.scrollTop = scroll_top;
            } else {
                // just add str to the end
                this.value += str;
                this.focus();
            }
        })
    },

    // remove the character in a textarea before the cursor position or de-indent
    backspace_at_caret: function(meta) {
        // apply this function to all elements that match the selector
        return this.each(function(i) {
            // if text is selected, then just delete it
            if (document.selection) {
                this.focus();
                sel = document.selection.createRange();
                sel.text = "";
                this.focus();
            } else if (this.selectionStart || this.selectionStart == "0") {
                // get the selection
                var start_pos = this.selectionStart;
                var end_pos = this.selectionEnd;
                var scroll_top = this.scrollTop;

                // check if nothing is selected
                if (start_pos == end_pos) {
                    // only backspace if we aren't at the beginning
                    if (start_pos > 0) {
                        // check if we are far enough that we might want to de-indent
                        if ((start_pos > indent_str.length-1)
                            // check if there is indentation right before the cursor
                            && (this.value.substring(start_pos-indent_str.length, start_pos) == indent_str)) {
                                // delete the indentation
                                this.value = this.value.substring(0, start_pos-indent_str.length)+this.value.substring(end_pos, this.value.length);
                                this.selectionStart = start_pos-indent_str.length;
                                this.selectionEnd = start_pos-indent_str.length;
                        } else {
                            if (meta) {
                                // delete the whole word before the cursor
                                var m = this.value.substring(0,start_pos).match(/[a-zA-Z0-9_]*$/)[0]
                                if (m.length > 0) {
                                    this.value = this.value.substring(0, start_pos-m.length)+this.value.substring(end_pos, this.value.length);
                                    this.selectionStart = start_pos-m.length;
                                    this.selectionEnd = start_pos-m.length;
                                } else {
                                    // delete whole set of special chars
                                    var m = this.value.substring(0,start_pos).match(/[\ \=\,\.\-\+\*\/\(\)]*$/)[0]
                                    if (m.length > 0) {
                                        this.value = this.value.substring(0, start_pos-m.length)+this.value.substring(end_pos, this.value.length);
                                        this.selectionStart = start_pos-m.length;
                                        this.selectionEnd = start_pos-m.length;
                                    }
                                }
                            } else {
                                // just delete the character before the cursor
                                this.value = this.value.substring(0, start_pos-1)+this.value.substring(end_pos, this.value.length);
                                this.selectionStart = start_pos-1;
                                this.selectionEnd = start_pos-1;
                            }
                        }
                    }
                } else {
                    // just delete the selection
                    this.value = this.value.substring(0, start_pos)+this.value.substring(end_pos, this.value.length);
                    this.selectionStart = start_pos;
                    this.selectionEnd = start_pos;
                }

                // focus the element and scroll it appropriately
                this.focus();
                this.scrollTop = scroll_top;
            }
        })
    },

    // insert a newline in a textarea at the cursor position and auto-indent
    newline_at_caret: function() {
        // apply this function to all elements that match the selector
        return this.each(function(i) {
            // determine the indentation for this line
            var indent = "";
            if (this.selectionStart || this.selectionStart == "0") {
                // determine the start of the indentation
                var start_pos = this.selectionStart;
                while (start_pos > 0) {
                    if (this.value[start_pos-1] == "\n")
                        break;
                    start_pos -= 1;
                }

                // determine the end of the indentation
                var end_pos = start_pos;
                while (end_pos < this.value.length) {
                    if (this.value[end_pos] != " ")
                        break;
                    end_pos += 1;
                }

                // get the indentation
                indent = this.value.substring(start_pos, end_pos);
            }

            // insert a newline and auto-indent
            $(this).insert_at_caret("\n"+indent);
        })
    },
});

// escape html
function escape_html(str) {
    // escape ampersands, angle brackets, tabs, and newlines
    return str.replace(/\t/g, "    ").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br />");
}

// indent and escape html
function indent_and_escape_html(str) {
    // indent newlines to line up with the end of the torch prompt
    return escape_html(str.replace(/\n/g, "\n       "));
}

// add html to the terminal (preserving whitespace)
function add_to_terminal(data) {
    // preserve whitespace with non-breaking spaces
    var new_data = "";
    var tag_depth = 0;
    for (var i = 0; i < data.length; i += 1) {
        if (data[i] == "<")
            tag_depth += 1;
        if (data[i] == ">")
            tag_depth -= 1;
        if (tag_depth == 0 && i < data.length-1) {
            if (data[i] == " " && data[i+1] == " ")
                new_data += "&nbsp;";
            else
                new_data += data[i];
        } else {
            new_data += data[i];
        }
    }

    // update the html
    $("#terminal").append(new_data);

    // apply the color scheme to the new content
    apply_color_scheme();

    // reset the size of the input box
    set_input_width();

    // scroll to the new data
    $("#terminal-form").prop("scrollTop", $("#terminal-form").prop("scrollHeight"));

    // determine whether the last thing added was a newline
    if (new_data.length >= 6)
        new_line = (new_data.substr(new_data.length-6, 6) == "<br />");
    else
        new_line = false;
}

// the first request
function init_session() {
    // send a start message
    outbox_queue.push({msg:MSG_INPUT_GET_USER});
    outbox_queue.push({msg:MSG_INPUT_REPLAY_HISTORY});
    process_outbox();
    setInterval(poll,poll_interval);
}

// poll
function poll() {
    outbox_queue.push({msg:MSG_INPUT_POLL});
    process_outbox();
}

// send the messages in the outbox
function process_outbox() {
    // don't make new requests if we're waiting for old ones
    if (!waiting_for_response) {
        // don't send a request if there are no messages
        if (outbox_queue.length > 0) {
            // don't send any more requests while we're waiting for this one
            waiting_for_response = true;

            // send the messages
            for (var i in outbox_queue) {
                ajax(outbox_queue[i], callback)
            }
        }

        // we sent all the messages at once so clear the outbox
        outbox_queue = [];
    }
}

// an array of message handlers
var message_handlers = [];

message_handlers[MSG_OUTPUT_NULL] = function(msg) {}; // do nothing

message_handlers[MSG_OUTPUT_READY] = function(msg) {
    // remove the initializing message
    $("#terminal").html("");

    // enable input
    $("#prompt").show();
    $("#terminal-input").removeAttr("disabled");
    $("#terminal-input").show();
    $("#terminal-input").focus();

    // reset the size of the input box
    set_input_width();
};

message_handlers[MSG_OUTPUT_MESSAGE] = function(msg) {
    // print the message
    add_to_terminal("<span class=\"color-scheme-message\">"+escape_html(msg.output)+"</span><br /><br />");
};

message_handlers[MSG_OUTPUT_OTHER] = function(msg) {
    // just print the output
    add_to_terminal(escape_html(msg.output));
};

message_handlers[MSG_OUTPUT_FATAL_ERROR] = function(msg) {
    // print the error message
    add_to_terminal("<span class=\"color-scheme-error\">"+escape_html(msg.output)+"</span><br /><br />");

    // stop processing new messages
    dead = true;
    inbox_queue = [];
    outbox_queue = [];
};

message_handlers[MSG_OUTPUT_EVAL_INPUT] = function(msg) {
    // get the input from form
    var input = $("#terminal-input").val();

    // input history
    if (input.replace(/^\s+|\s+$/g, '') != "")
        input_history.push(input);
    if (input_history.length > input_history_size)
        input_history = input_history.slice(input_history.length-input_history_size);
    input_history_current = input_history.slice(0);
    input_history_current.push("");
    input_history_id = input_history_current.length-1;

    // Save the changed values to localstorage
    if (Modernizr.localstorage) {
        localStorage.setItem("input_history", JSON.stringify(input_history));
        localStorage.setItem("input_history_current", JSON.stringify(input_history_current));
    }

    // clear the input field (it is disabled at this point)
    $("#terminal-input").val("");

    // hide the prompt until the result comes in
    $("#prompt").hide();

    // add the prompt and the input to the log
    add_to_terminal("<span class=\"color-scheme-prompt\">"+indent_and_escape_html(msg.user)
        +"&gt;&nbsp;</span>"+indent_and_escape_html(input)+"<br />");

    // print out result
    message_handlers[MSG_OUTPUT_EVAL_RESULT](msg)
}

message_handlers[MSG_OUTPUT_EVAL_INCOMPLETE] = function(msg) {
    // re-enable the input field
    $("#terminal-input").removeAttr("disabled");

    // focus the input field
    $("#terminal-input").focus();

    // add a newline for the user
    $("#terminal-input").newline_at_caret();
};

message_handlers[MSG_OUTPUT_EVAL_ERROR] = function(msg) {
    // print the error message
    add_to_terminal("<span class=\"color-scheme-error\">"+msg.output+"</span><br /><br />");

    // show the prompt
    $("#prompt").show();

    // re-enable the input field
    $("#terminal-input").removeAttr("disabled");

    // focus the input field
    $("#terminal-input").focus();
};

message_handlers[MSG_OUTPUT_EVAL_RESULT] = function(msg) {
    // print the result
    if ($.trim(msg.output) == "")
        add_to_terminal("<br />");
    else
        add_to_terminal(msg.output+"<br />");

    // show the prompt
    $("#prompt").show();

    // re-enable the input field
    $("#terminal-input").removeAttr("disabled");

    // focus the input field
    $("#terminal-input").focus();
};

message_handlers[MSG_OUTPUT_GET_USER] = function(msg) {
    // set the user name
    user_name = indent_and_escape_html(msg.user);
    user_id = indent_and_escape_html(msg.uid);
    $("#prompt").html("<span class=\"color-scheme-prompt\">"+user_name+"&gt;&nbsp;</span>");
    apply_color_scheme();
}

message_handlers[MSG_OUTPUT_PLOT] = function(msg) {
    // store input
    message_handlers[MSG_OUTPUT_EVAL_INPUT](msg)

    // plot
    var plottype = msg.plot.type
    var plot = {
        "file":   msg.plot.file,
        "x_data": eval(msg.plot.x_data),
        "y_data": eval(msg.plot.y_data),
        "x_min":  eval(msg.plot.x_min),
        "x_max":  eval(msg.plot.x_max),
        "y_min":  eval(msg.plot.y_min),
        "y_max":  eval(msg.plot.y_max)
    }
    var plotter = plotters[plottype];

    // fixed dims
    plot.w = 450;
    plot.h = 275;
    plot.p = 40;

    // plot
    if (typeof plotter == "function")
        plotter(plot);
    
    // newline
    add_to_terminal("<br />");

    // print out result
    message_handlers[MSG_OUTPUT_EVAL_RESULT](msg)
};

// process the messages in the inbox
function process_inbox() {
    // iterate through the messages
    for (var id in inbox_queue) {
        var req = inbox_queue[id]
        var type = req.msg
        var handler = message_handlers[type]
        if (typeof handler == "function")
            handler(req);
        if (dead)
            break;
    }

    // we handled all the messages so clear the inbox
    inbox_queue = [];
}

// called when the server has responded
function callback(data, textStatus, jqXHR) {
    // if we are dead, don't keep polling the server
    if (dead) return;

    // parse error?
    if (textStatus == 'parsererror') {
        console.log('could not parse: ')
        console.log(data.responseText)
        return
    }

    // allow sending new messages
    waiting_for_response = false;

    // add the messages to the inbox
    inbox_queue = inbox_queue.concat(data);

    // process the inbox
    process_inbox();

    // send any new messages
    process_outbox();
}

// called on page load
$(document).ready(function() {
    // apply the autoresize plugin to the textarea
    $("#terminal-input").autoResize({ animate: false, maxHeight: 1000, onAfterResize: function() {
        setTimeout(function() { $("#terminal-form").prop("scrollTop", $("#terminal-form").prop("scrollHeight")); }, 100);
        set_input_width();
    } });

    // clear the textarea in case the browser decides to pre-populate it
    $("#terminal-input").val("");

    // set the width of the terminal
    set_terminal_width();

    // record the cursor position when the user clicks anywhere
    var mouse_x, mouse_y;
    $(window).mousedown(function(evt) {
        mouse_x = evt.pageX;
        mouse_y = evt.pageY;
    });

    // focus the terminal input when the user clicks on the terminal (but not drags)
    $("#terminal-form").click(function(evt) {
        if ((mouse_x-evt.pageX)*(mouse_x-evt.pageX)+(mouse_y == evt.pageY)*(mouse_y == evt.pageY) < 4)
            $("#terminal-input").focus();
    });

    // key up
    $("#terminal-input").keyup(function(evt) {
        if (!$("#terminal-input").attr("disabled")) {
            // whatever the key, we complete the current command:
            outbox_queue.push({msg:MSG_INPUT_COMPLETION, input:$("#terminal-input").val()});
            process_outbox();
        }
    });

    // hook keyboard events for the input field
    $("#terminal-input").keydown(function(evt) {
        // determine which key was pressed
        switch (evt.keyCode) {
            case 8:
                // user pressed the backspace key -- make sure the terminal input was enabled
                if (!$("#terminal-input").attr("disabled")) {
                    // backspace
                    $("#terminal-input").backspace_at_caret(evt.altKey);
                    $("#terminal-form").prop("scrollTop", $("#terminal-form").prop("scrollHeight"));
                }
                return false;

            case 9:
                // user pressed the tab key -- make sure the terminal input was enabled
                if (!$("#terminal-input").attr("disabled")) {
                    // indent
                    $("#terminal-input").insert_at_caret(indent_str);
                    $("#terminal-form").prop("scrollTop", $("#terminal-form").prop("scrollHeight"));
                }
                return false;

            case 38:
                // user pressed the up key -- make sure the terminal input was enabled
                if (!$("#terminal-input").attr("disabled")) {
                    // terminal input history
                    input_history_current[input_history_id] = $("#terminal-input").val();
                    input_history_id -= 1;
                    if (input_history_id < 0)
                        input_history_id = 0;
                        
                    // Save values to localstorage    
                    if (Modernizr.localstorage) {
                        localStorage.setItem("input_history_current", JSON.stringify(input_history_current));
                    }
                    
                    $("#terminal-input").val(input_history_current[input_history_id]);
                    $("#terminal-form").prop("scrollTop", $("#terminal-form").prop("scrollHeight"));
                }
                return false;

            case 40:
                // user pressed the down key -- make sure the terminal input was enabled
                if (!$("#terminal-input").attr("disabled")) {
                    // terminal input history
                    input_history_current[input_history_id] = $("#terminal-input").val();
                    input_history_id += 1;
                    if (input_history_id > input_history_current.length-1)
                        input_history_id = input_history_current.length-1;
                        
                    // Save values to localstorage    
                    if (Modernizr.localstorage) {
                        localStorage.setItem("input_history_current", JSON.stringify(input_history_current));
                    }
                    
                    $("#terminal-input").val(input_history_current[input_history_id]);
                    $("#terminal-form").prop("scrollTop", $("#terminal-form").prop("scrollHeight"));
                }
                return false;

            case 13:
                // user pressed the enter key -- make sure the terminal input was enabled
                if (!$("#terminal-input").attr("disabled")) {
                    // disable the terminal input
                    $("#terminal-input").attr("disabled", "disabled");

                    // get the input
                    var input = $("#terminal-input").val();

                    // send the input to the server via AJAX
                    outbox_queue.push({msg:MSG_INPUT_EVAL, user:user_name, uid:user_id, cmd:input});
                    process_outbox();
                }

                // prevent the form from actually submitting
                return false;
                
            case 67:
                // C key pressed
                if (evt.ctrlKey) {
                    // ctrl-c to cancel a command
                    
                    add_to_terminal("<span class=\"color-scheme-error\">Process Killed<span><br /><br />");
                    
                    // show the prompt
                    $("#prompt").show();

                    // re-enable the input field
                    $("#terminal-input").removeAttr("disabled");

                    // focus the input field
                    $("#terminal-input").focus();
                    
                    waiting_for_message = false;
                }
        }
    });

    // scroll to the input field
    $("#terminal-form").prop("scrollTop", $("#terminal-form").prop("scrollHeight"));

    // start polling the server
    init_session();
});

})();
