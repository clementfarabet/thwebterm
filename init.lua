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
--     torchjs - a JS frontend for Torch.
----------------------------------------------------------------------

require 'os'
require 'io'
require 'sys'
require 'paths'

torchjs = {}

----------------------------------------------------------------------
-- File/Line
----------------------------------------------------------------------
local function getenv(exec)
   local dbg = debug.getinfo(3 + (exec or 0))
   local source_path = dbg.source:gsub('@','')
   local source_line = dbg.currentline
   return source_path,source_line
end

----------------------------------------------------------------------
-- Server
----------------------------------------------------------------------
function torchjs.server(port)
   local serverpath = paths.dirname(getenv(),nil)
   local currentpath = paths.cwd()
   port = port or '8080'
   if sys.OS == 'macos' then
      os.execute('sleep 1 && open http://localhost:' .. port .. '/ &')
   end
   os.execute('cd ' .. serverpath .. '; '
              .. 'node server.js ' .. port .. ' ' .. currentpath)
end

----------------------------------------------------------------------
-- Run!
----------------------------------------------------------------------
torchjs.server()
