----------------------------------------------------------------------
--
-- Copyright (c) 2012 Clement Farabet
-- 
-- Permission is hereby granted, free of charge, to any person obtaining
-- a copy of this software and associated documentation files (the
-- "Software"), to deal in the Software without restriction, including
-- without limitation the rights to use, copy, modify, merge, publish,
-- distribute, sublicense, and/or sell copies of the Software, and to
-- permit persons to whom the Software is furnished to do so, subject to
-- the following conditions:
-- 
-- The above copyright notice and this permission notice shall be
-- included in all copies or substantial portions of the Software.
-- 
-- THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
-- EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
-- MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
-- NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
-- LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
-- OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
-- WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-- 
----------------------------------------------------------------------
-- description:
--     webterm - A JS frontend for Torch.
--               This package provides all sorts of functions that
--               are useful in the web terminal. It shouldn't be loaded
--               in a regular torch environment.
----------------------------------------------------------------------

require 'os'
require 'io'
require 'sys'
require 'xlua'
require 'paths'

webterm = {}

----------------------------------------------------------------------
-- Dependencies
----------------------------------------------------------------------
if not sys.execute('which node'):find('node') then
   print('<webterm> could not find node: webterm requires node.js')
   print('  + please install:')
   print('     - node.js (http://nodejs.org/)')
   print('     - node package: express')
   print('     - node package: stripcolorcodes')
   print('     - node package: ejs')
   print('  + once node.js is installed, extra packages can be installed')
   print('    easily with npm:')
   print('     - npm install express stripcolorcodes ejs')
   os.exit()
end

----------------------------------------------------------------------
-- Server Root
----------------------------------------------------------------------
webterm.root = torch.packageLuaPath('webterm')

----------------------------------------------------------------------
-- Server
----------------------------------------------------------------------
function webterm.server(port)
   local currentpath = paths.cwd()
   port = port or '8080'
   if sys.OS == 'macos' then
      os.execute('sleep 1 && open http://localhost:' .. port .. '/ &')
   end
   os.execute('cd ' .. webterm.root .. '; '
              .. 'node server.js ' .. port .. ' ' .. currentpath)
end

----------------------------------------------------------------------
-- Run Server (only if in bare environment)
----------------------------------------------------------------------
if not _kernel_ then
   webterm.server()
end

----------------------------------------------------------------------
-- General Inliner
----------------------------------------------------------------------
function webterm.show(data,id)
   if torch.typename(data) and torch.typename(data):find('torch.*Tensor') and (data:dim() == 2 or data:dim() == 3) then
      local file = os.tmpname() .. '.jpg'
      local fullpath = webterm.root..file
      os.execute('mkdir -p ' .. paths.dirname(fullpath))
      image.save(fullpath, data)
      data = file
   elseif type(data) == 'string' then
      -- all good, is an image
   else
      print('<webterm> cannot inline this kind of data')
      return nil
   end
   if not id then
      id = ''
      for i = 1,10 do id=id..tostring(torch.random()) end
      print('<img src="'..data..'" id="'..id..'" />')
   else
      webterm.js('$("#'..id..'").attr("src", "'..data..'");')
   end
   return id
end

----------------------------------------------------------------------
-- Plot Inliner
----------------------------------------------------------------------
function webterm.plot(...)
   local file = os.tmpname() .. '.jpg'
   local fullpath = webterm.root..file
   os.execute('mkdir -p ' .. paths.dirname(fullpath))
   gnuplot.pngfigure(fullpath)
   gnuplot._plot(...)
   gnuplot.plotflush()
   while not paths.filep(fullpath) do
      sys.sleep(0.1)
   end
   webterm.show(file)
end
gnuplot._plot = gnuplot.plot
gnuplot.plot = webterm.plot

----------------------------------------------------------------------
-- Image Inliner
----------------------------------------------------------------------
function webterm.display(...)
      -- usage
   local _, input, zoom, min, max, legend, w, ox, oy, scaleeach, gui, offscreen, padding, symm, nrow, saturate = dok.unpack(
      {...},
      'image.display',
      'displays a single image, with optional saturation/zoom',
      {arg='image', type='torch.Tensor | table', help='image (HxW or KxHxW or Kx3xHxW or list)', req=true},
      {arg='zoom', type='number', help='display zoom', default=1},
      {arg='min', type='number', help='lower-bound for range'},
      {arg='max', type='number', help='upper-bound for range'},
      {arg='legend', type='string', help='legend', default='image.display'},
      {arg='win', type='qt window', help='window descriptor'},
      {arg='x', type='number', help='x offset (only if win is given)', default=0},
      {arg='y', type='number', help='y offset (only if win is given)', default=0},
      {arg='scaleeach', type='boolean', help='individual scaling for list of images', default=false},
      {arg='gui', type='boolean', help='if on, user can zoom in/out (turn off for faster display)',
       default=true},
      {arg='offscreen', type='boolean', help='offscreen rendering (to generate images)',
       default=false},
      {arg='padding', type='number', help='number of padding pixels between images', default=0},
      {arg='symmetric',type='boolean',help='if on, images will be displayed using a symmetric dynamic range, useful for drawing filters', default=false},
      {arg='nrow',type='number',help='number of images per row', default=6},
      {arg='saturate', type='boolean', help='saturate (useful when min/max are lower than actual min/max', default=true}
   )
   offscreen = true
   local win = image._display(input, zoom, min, max, legend, nil, ox, oy, scaleeach, gui, offscreen, padding, symm, nrow, saturate)
   local img = win:image():toTensor()
   local w = webterm.show(img,w)
   return w
end
image._display = image.display
image.display = webterm.display

----------------------------------------------------------------------
-- Xlua Progress bar is dangerous in the term, overload it
----------------------------------------------------------------------
function webterm.progress(start,size)
   if math.fmod(start-1,math.floor(size/25)) == 0 or start==size then
      io.write('==> ' .. start .. '/' .. size)
   end
end
xlua.progress = webterm.progress

----------------------------------------------------------------------
-- Reset Kernel (just exit, it'll restart by iteself)
----------------------------------------------------------------------
function webterm.reset()
   os.exit()
end

----------------------------------------------------------------------
-- Completion
----------------------------------------------------------------------
function webterm.complete(input)
   local m = nil
   local delims = {'%[','%]','%{','%}','%(','%)',',','=',''}
   for _,delim in ipairs(delims) do
      local nm = input:gfind(delim..'(.-)$')()
      m = m or nm
      if nm and #nm < #m then
         m = nm
      end
   end
   if not m or m == '' then
      return
   end
   m = m:gfind('%s*(.*)%s*')()
   local namespaces = {}
   local symbol = m
   local tbl = _G
   local namespace = ''
   while true do
      namespace = m:gfind('(.-)%.')()
      if not namespace then break end
      if type(tbl) ~= 'table' then return end
      tbl = tbl[namespace]
      table.insert(namespaces, namespace)
      m = m:gfind('.-%.(.*)')()
      if not m or m == '' then break end
   end
   namespace = namespaces[#namespaces] or ''
   if type(tbl) == 'table' then
      local s = ''
      for k in pairs(tbl) do
         if namespace ~= '' then
            k = namespace .. '.' .. k
         end
         if k:find('^'..symbol) then
            s = s .. '<a target="_blank" href="http://www.torch.ch/?do=search&id='.. k .. '">'
                  .. k .. '</a><br />'
         end
      end
      io.write('<script>$(\'.completion\').html(\''..s..'\');</script>')
   end
end

----------------------------------------------------------------------
-- Execute some javascript
----------------------------------------------------------------------
function webterm.js(cmd)
   if not cmd then
      print('please provide some javascript to interpret: js("cmd")')
      return
   end
   print('<script>' .. cmd .. '</script>')
end
