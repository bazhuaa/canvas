function Dots(speed,alpha){
  this.canvas
  this.ctx

  this.x
  this.y
  this.r
  this.a=alpha&&alpha>0&&alpha<=1?alpha:.8

  this.speed=speed&&speed>0?speed:2
  this.sx
  this.sy

}
Dots.prototype.init=function(canvas,x,y){
  this.canvas=canvas
  this.ctx = this.canvas.getContext('2d')
  this.x=x*2||Math.random()*this.canvas.width//
  this.y=y*2||Math.random()*this.canvas.height//
  this.r=Math.random()*6

  // if(isMouseDot)this.isMouseDot=1
  this.sx=Math.random()*this.speed*2-this.speed
  this.sy=Math.random()*this.speed*2-this.speed

  this.ctx.beginPath()
  this.ctx.arc(this.x,this.y,this.r,0,Math.PI*2)
  this.ctx.fillStyle=`rgba(255,255,255,${this.a})`
  this.ctx.fill()
  this.ctx.closePath()
}
Dots.prototype.update=function(){
  this.x= this.x+this.sx
  this.y= this.y+this.sy

  if(this.x<0||this.x>this.canvas.width){
    this.init(this.canvas)
  }
  if(this.y<0||this.y>this.canvas.height){
    this.init(this.canvas)
  }
  this.ctx.beginPath()
  this.ctx.arc(this.x,this.y,this.r+0.5,0,Math.PI*2)
  this.ctx.fillStyle=`rgba(255,255,255,${this.a})`
  this.ctx.fill()
  this.ctx.closePath()
}
Dots.prototype.mouseDots=function(x,y){
  this.x = x*2;
  this.y = y*2;

  this.ctx.beginPath();
  this.ctx.arc(this.x, this.y, this.r , 0, 2*Math.PI);
  this.ctx.fillStyle = 'rgba(255,255,255,.8)';
  this.ctx.fill();
  this.ctx.closePath();
}
function Wonder(opt){

  var el = document.querySelector(opt.el),
    canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d'),
    partStyle = window.getComputedStyle(el,null),
    width = parseInt(partStyle.width),
    height = parseInt(partStyle.height),
    area = width * height,
    cssText = `width:${width}px;height:${height}px`;
  canvas.setAttribute('style',cssText)
  canvas.width = ''+(width*2)//
  canvas.height = ''+(height*2)//
  el.appendChild(canvas)

  var dotsArr=[],
    dotsNum = opt.dotsNum||parseInt(area/5000),
    maxDotsNum = dotsNum*2,
    overNum=0//,
    dotsDistance=opt.lineMaxLength||250;

  // 生成点
  for(var i=0;i<dotsNum;i++){
    var dot = new Dots(opt.speed,opt.dotsAlpha)
      dot.init(canvas)
    dotsArr.push(dot)
  }
  // 鼠标事件
  var clickWithNew = opt.clickWithDotsNumber||5
  document.addEventListener('click',createDot)
  function createDot(e){
    var tx=e.pageX
    var ty=e.pageY
    if(tx>0&&tx<canvas.width&&ty>0&&ty<canvas.height){
      for(var i=0;i<clickWithNew;i++){
        var dot = new Dots(opt.speed, opt.dotsAlpha)
        dotsArr.push(dot)
        dotsNum+=1
        dot.init(canvas,tx,ty)
      }
    }
  }
  document.addEventListener('mousemove',mouseDotMove)

  function mouseDotMove(e) {
      var tx = e.pageX,
          ty = e.pageY;
      if ((tx > 0 && tx < width) && (ty > 0 && ty < height)) {
          dot.mouseDots(tx, ty);
      }
  };

  //动画事件
  var requestAnimFrame = requestAnimationFrame || webkitRequestAnimationFrame || oRequestAnimationFrame || msRequestAnimationFrame;
  function animateUpdate(){
    ctx.clearRect(0,0,canvas.width,canvas.height)
    if(dotsNum>maxDotsNum){
      overNum=dotsNum-maxDotsNum
    }

    for(var i = overNum; i < dotsNum; i ++){
      if (dotsArr[i]) dotsArr[i].update();
    }
    // 连线
    for(var i = overNum; i < dotsNum; i ++){
      for(var j = i+1; j < dotsNum; j ++){
        var tx=dotsArr[i].x-dotsArr[j].x,
            ty=dotsArr[i].y-dotsArr[j].y,
            s=Math.sqrt(Math.pow(tx,2)+Math.pow(ty,2))
        if(s<dotsDistance){
          ctx.beginPath()
          ctx.moveTo(dotsArr[i].x,dotsArr[i].y)
          ctx.lineTo(dotsArr[j].x,dotsArr[j].y)
          ctx.strokeStyle=`rgba(255,255,255,${(dotsDistance-s)/dotsDistance})`
          ctx.strokeLength=1
          ctx.stroke()
          ctx.closePath()
        }
      }
    }
    requestAnimFrame(animateUpdate)

  }
  requestAnimFrame(animateUpdate)
}