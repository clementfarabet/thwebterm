
// load libs
var util = require("util"),  
    http = require("http"),  
    url = require("url"),  
    path = require("path"),
    express = require('express'),
    fs = require("fs"),
    child = require('child_process'),
    stream = require('stream'),
    stripcolors = require('stripcolorcodes');

// shortcuts
var print = console.log;

// helpers
function text2html(txt) {
    txt = stripcolors(txt);
    var html = txt.replace(/\n/g,'<br />');
    return html;
}

// configure Torch
var torch = {
    tmp : '/tmp/',
    user : 't7',
    port : process.argv[2] || 8080,
    cwd : process.argv[3] || '.',
    instances : {},
    newinstance : function(user) {
        // fork new instance:
        var torchexe = child.spawn(__dirname+'/thkernel',[],{cwd:torch.cwd});

        // configure Torch's stdout to store all the output:
        var stdout = [], stdoutidx = 0;
        torchexe.stdout.setEncoding('utf8');
        torchexe.stdout.on('data', function(d) {
            stdout.push(d);
        });

        // create a read function, which pulls data from this stack:
        torchexe.stdout.read = function() {
            var dump = '';
            for (var i=stdoutidx; i<stdout.length; i++) {
                dump = dump + stdout[i];
                stdoutidx += 1;
            }
            return dump;
        }

        // when torch terminates, disconnect instance:
        torchexe.on('exit', function (code) {
            torch.instances[user] = null;
            print('<=.=> Torch instance terminated for [' + user + ']')
        });

        // register new instance:
        torch.instances[user] = torchexe;

        // started
        print('=><= Torch instance started for [' + user + ']')
    }
};

// setup server
var app = express.createServer(
    express.bodyParser(),
    express.methodOverride(),
    express.cookieParser(),
    express.session({ secret: 'esoognom' }),
    express.static(__dirname + '/')
);

// configure template engine
app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
});
app.configure('production', function(){
    app.use(express.errorHandler());
});

// main get
app.get('/', function(req, res) {
    // just render html
    res.render('index', { title: 'Express' });
});

// main post
app.post('/', function(req, res) {
    // process request
    var msg = req.body.msg;
    var cmd = req.body.cmd;
    var input = req.body.input;
    var args = req.query;

    // get username
    var user = torch.user;
    if (args.user) {
        user = args.user;
    }

    // starting a new session for this user:
    if (!torch.instances[user] || torch.instances[user] == null) {
        // start new kernel
        torch.newinstance(user)
    }

    // what's the message?
    if (msg == 'get_user') {

        // send user
        res.send({msg:msg, user:'['+user+']', uid:'-1'});

        // run request?
        if (args.run) {
            // run job
            print('==> running app: ' + args.run);
            torch.instances[user].stdin.write('run "' + args.run + '"\n');
        }

    } else if (msg == 'replay_history') {

        // ready to go
        res.send({msg:'ready'});

    } else if (msg == 'poll') {

        // when polled, send stuff if available, else send null
        var read = '';
        if (torch.instances[user]) {
            read = torch.instances[user].stdout.read();
            read = text2html(read);
        }
        if (read == '') {
            res.send({msg:'null'});
        } else {
            res.send({msg:'eval_result', user:'['+user+']', output:read});
        }

    } else if (msg == 'eval') {

        // evaluate command
        print('==> evaluating command: ' + cmd);
        torch.instances[user].stdin.write(cmd + '\n');

        // sending results
        res.send({msg:'eval_input', user:'['+user+']', output:''});

    } else if (msg == 'completion') {

        // completion request
        var completion = 'complete[====['+input+']====]\n'
        torch.instances[user].stdin.write(completion);
        res.send({msg:'null'});

    } else if (msg == 'kill') {

        // completion request
        print('<=.=> sending interupt to pid: ' + torch.instances[user].pid);
        var kill = child.exec('kill',['-2',torch.instances[user].pid]);

        // when kill done, resume client;
        kill.on('exit', function (code) {
            res.send({msg:'null'});
        });

    }
});

// upload requests
app.post('/upload', function(req, res, next){
    // receiving file(s)
    var files;
    if (req.files.fileToUpload) {
        files = [req.files.fileToUpload];
    } else {
        files = req.files.filesToUpload;
        if (!files[0].path) {
            files = files[0];
        }
    }
    var dir = req.body.destDirectory;
    fs.mkdir(path.join(torch.cwd,'uploads',dir), '0777',
        function() {
            for (i in files) {
                var image = files[i];
                var ext = '.jpg';
                if (image.filename.match('\.png$') || image.filename.match('\.PNG$')) {
                    ext = '.png';
                }
                var dest = path.join(torch.cwd,'uploads',dir,path.basename(image.path)+ext);
                print('received file, saving to: ' + dest);
                fs.rename(image.path, dest,
                    function(idx) {
                        return function (code) {
                            if (idx == files.length-1) {
                                res.send('Upload completed, transmitted ' + (files.length) + ' files');
                            }
                        };
                    }(i)
                );
            };
        }
    );
});

// serving  
app.listen(torch.port);
print("==> Torch server listening on port " + torch.port);
print("==> Open http://localhost:" + torch.port + "/ in your browser!");
