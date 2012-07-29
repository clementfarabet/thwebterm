/********************************************************************
 * ajax()
 * small abstraction over the Jquery ajax method
 ********************************************************************/
function ajax(msg,callback) {
    $.ajax( {
        url: location.href,
        type: 'post',
        data: msg,
        dataType: 'json',
        success: callback,
        error: callback
    });
};

/********************************************************************
 * Cell()
 * A class to represent a visual cell.
 ********************************************************************/
function Cell(params) {
    // get params
    var parent = params.parent;
    var cell = params.cell;
    var id = params.id;
    if (cell) {id = cell.id.replace('#','')};
    if (!id) {_cell_id_++; id = 'Cell_'+_cell_id_;};
    var clss = params.clss || '';
    var content = params.content || '';
    var css = params.css || {};

    // store params
    if (!parent || parent == 'body') {
        this.parent = {
            id : 'body',
            parent : 'html'
        };
    } else {
        this.parent = parent;
    }
    this.id = '#'+id;
    this.class = clss || '';
    this.css = css || {};
    this.content = content || '';

    // methods
    this.show = function(t) {
        $(this.id).fadeIn(t);
    }
    this.hide = function(t) {
        $(this.id).fadeOut(t);
    }

    // create new cell
    $(this.parent.id).append('<div class="'+clss+'" id="'+id+'">'+content+'</div>');

    // update css
    $(this.id).css(css);
}
_cell_id_ = 0;

/********************************************************************
 * create_cell()
 * this function creates a generic div
 ********************************************************************/
function create_cell(params) {
    return new Cell(params);
}

/********************************************************************
 * create_cell_on_a_grid()
 * this function creates a generic div, magnetized on a grid
 ********************************************************************/
function create_cell_on_a_grid(params) {
    // get positionning params
    var position = params.position || {};
    var grid = params.grid || {};
    var y = position.y; if (y==null) y = 0;
    var x = position.x; if (x==null) x = 0;
    var nrows = grid.rows; if (nrows==null) nrows = 1;
    var ncols = grid.cols; if (ncols==null) ncols = 1;
    var vspace = grid.vspace; if (vspace==null) vspace = 4;
    var hspace = grid.hspace; if (hspace==null) hspace = 4;
    var height = position.h; if (height==null) height = 1;
    var width = position.w; if (width==null) width = 1;

    // compute offsets
    var widthpadded = 100/ncols;
    var heightpadded = 100/nrows;
    var widthunpadded = widthpadded - hspace / width;
    var heightunpadded = heightpadded - vspace / height;
    var left = x * (widthpadded) + hspace/2;
    var top = y * (heightpadded) + vspace/2;
    var width = width * widthunpadded;
    var height = height * heightunpadded;

    // position new cell
    if ((100-(left+width)) < 0.1) {
        pos = {position: 'absolute',
               width:''+width+'%', height:''+height+'%',
               right:'0', top:''+top+'%'};
    } else {
        pos = {position: 'absolute',
               width:''+width+'%', height:''+height+'%',
               left:''+left+'%', top:''+top+'%'};
    }

    // set CSS
    for (var k in pos) {
        params.css[k] = pos[k];
    }

    // create new cell
    var cell = create_cell(params);

    // return new cell
    return cell;
}

/********************************************************************
 * create_cell_in_a_list()
 * this function creates a generic div, appended to a list
 ********************************************************************/
function create_cell_in_a_list(params) {
    // get positionning params
    var position = params.position || {};
    var grid = params.grid || {};
    var vspace = grid.vspace; if (vspace==null) vspace = 4;
    var hspace = grid.hspace; if (hspace==null) hspace = 4;
    var height = position.h; if (height==null) height = 100;
    var y = position.y; if (y==null) y = 0;

    // compute offsets
    var width = 100 - hspace;

    // position new cell
    var pos = {position: 'relative',
           width:''+width+'%', height:''+height+'px', 
           'margin-left':''+hspace/2+'%', 'margin-right':''+hspace/2+'%',
           'margin-top':''+vspace/2+'px', 'margin-bottom':''+vspace/2+'px'};
    for (var k in pos) {
        params.css[k] = pos[k];
    }

    // force parent to be scrollable:
    if (params.parent) {
        $(params.parent.id).css({'overflow-y':'auto'});
    }

    // create new cell
    var cell = create_cell(params);

    // return new cell
    return cell;
}

/********************************************************************
 * create_cell_fixed_ratio()
 * this function creates a generic div, with a fixed ratio
 ********************************************************************/
function create_cell_fixed_ratio(params) {
    // params
    var parent = params.parent || error('please provide parent');
    var position = params.position || {};
    var ratio = position.ratio || 1;
    var max = position.max || 100;

    // autoresize
    var resize = function() {

        // parent
        var pheight = $(parent.id).height();
        var pwidth = $(parent.id).width();
        var pratio = pwidth / pheight;

        // check limiting dimension
        var h = 0;
        var w = 0;
        if (pratio > ratio) {
            // height is the limit
            h = pheight*max/100;
            w = h*ratio;
        } else {
            // width is the limit
            w = pwidth*max/100;
            h = w/ratio;
        }

        // padding
        var mh = (pheight-h)/2;
        var mw = (pwidth-w)/2;

        // position new cell
        var css = {};
        var pos = {position: 'relative',
                   'width':''+w+'px', 'height':''+h+'px',
                   'margin-top':''+mh+'px',
                   'margin-left':''+mw+'px',
                   'margin-bottom':''+mh+'px',
                   'margin-right':''+mw+'px',};
        for (var k in pos) {
            css[k] = pos[k];
        };
        for (var k in params.css) {
            css[k] = params.css[k];
        };

        // change CSS
        $(cell.id).css(css);

    }

    // create new cell
    var cell = create_cell(params);
    
    // force resize
    resize();
    $(window).resize(resize);

    // return new cell
    return cell;
}

/********************************************************************
 * add_text_to_cell()
 * this function appends content to a cell
 ********************************************************************/
function add_text_to_cell(params) {
    // get params
    var cell = params.cell;
    var id = params.id; if (!id) {_cell_id_++; id = 'Cell_'+_cell_id_;};
    var clss = params.clss || '';
    var content = params.text || console.log('error: please provide text');
    var css = params.css || {};

    // position new cell
    var pos = {position: 'relative'};
    for (var k in css) {
        pos[k] = css[k];
    }

    // add content
    $(cell.id).append(
        '<div style="display:table; width:100%; height:100%"> \
            <div style="display:table-cell;" id="' + id + '" class="'+clss+'"> \
                <div> ' + content + ' </div> \
            </div> \
        </div>'
    );

    // set style
    $('#'+id).css(pos);

    // return container
    return {id:'#'+id};
}

/********************************************************************
 * add_image_to_cell()
 * this function appends content to a cell
 ********************************************************************/
function add_image_to_cell(params) {
    // get params
    var cell = params.cell;
    var id = params.id; if (!id) {_cell_id_++; id = 'Cell_'+_cell_id_;};
    var clss = params.clss || '';
    var priority = params.priority;
    var image = params.image || console.log('error: please provide image');
    var css = params.css || {};

    // position new cell
    var pos = {position: 'relative', display:'block', 
           'margin-left': 'auto', 'margin-right': 'auto',
           'max-height': '70%', 'max-width': '70%'};
    for (var k in css) {
        pos[k] = css[k];
    }

    if (priority) {
        // add empty image
        $(cell.id).append(
            '<div style="display:table; width:100%; height:100%"> \
                <div style="display:table-cell;vertical-align:middle"> \
                    <img class="'+clss+'" id="' + id + '" /> \
                </div> \
            </div>'
        );

        // queue image with priority
        image_queue.push_image({priority: priority, dest: id, src: image});

    } else {
        // add content
        $(cell.id).append(
            '<div style="display:table; width:100%; height:100%"> \
                <div style="display:table-cell;vertical-align:middle"> \
                    <img class="'+clss+'" id="' + id + '" src="'+ image + '"/> \
                </div> \
            </div>'
        );
    };

    // set style
    $('#'+id).css(pos);

    // return container
    return {id:'#'+id};
}
