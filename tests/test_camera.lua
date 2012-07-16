
require 'camera'

s = image.Camera{}

for i = 1,100 do
   i = s:forward()
   w1 = image.display{win=w1, image=i, legend='An image: $X$ <br />'}
   w2 = image.display{win=w2, image=(i*-1+1):sqrt(), legend='A modified image: $(1-X)^{0.5}$ <br />'}
   collectgarbage()
end

s:stop()
