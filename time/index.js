function init(numWidth, numHeight, lineWidth) {
  let lines = {
    year: [[], [], [], []],//4
    month: [[], []],//2
    day: [[], []],//2
    hour: [[], []],//2
    minute: [[], []],//2
    second: [[], []]//2
  }
  let timeLabel = {
    year: '年',
    month: '月',
    day: '日',
    hour: '时',
    minute: '分',
    second: '秒'
  }
  const timeMap = {
    0: '1110111', // |-|_ |_|
    1: '0010001',
    2: '0111110',
    3: '0111011',
    4: '1011001',
    5: '1101011',
    6: '1101111',
    7: '0110001',
    8: '1111111',
    9: '1111011'
  }
  var time = document.getElementById('time');
  var front = document.createElement('canvas');
  var frontCtx = front.getContext('2d');
  var back = document.createElement('canvas');
  var backCtx = back.getContext('2d');
  var color = '#666';
  var ratio = window.devicePixelRatio || 1;//
  time.appendChild(back);
  time.appendChild(front);

  front.width = back.width = time.offsetWidth * ratio;
  front.height = back.height = time.offsetHeight * ratio;
  frontCtx.strokeStyle = color;
  backCtx.lineWidth = lineWidth;
  frontCtx.lineWidth = lineWidth;
  frontCtx.lineCap = 'round';
  frontCtx.lineJoin = 'round';

  numWidth *= ratio;
  numHeight *= ratio;
  lineWidth *= ratio;
  var halfNumHeight = numHeight / 2;
  var middleLinePosY = front.height / 2;
  class Line {
    constructor(pos1, pos2, frontLine) {
      // 前一个line在安定状态才可以当前line才可以移动
      this.value = '0'

      this.pos1 = pos1
      this.pos2 = pos2
      this.frontLine = frontLine

      this.start = pos1
      this.end = pos1

      this.moving = false
      this.shouldMove = false
      this.movingPos = null
      this.goalPos = null
      this.addPos = null
    }
    // 改变line状态 一秒一次
    move(type) {
      this.shouldMove = true;
      var newPos1 = { x: this.pos1.x, y: this.pos1.y };
      var newPos2 = { x: this.pos2.x, y: this.pos2.y };
      if (type === 1) {
        this.start = this.pos1;
        this.movingPos = this.end = newPos1;
        this.goalPos = newPos2;
      } else if (type === 2) {
        this.start = this.pos1;
        this.movingPos = this.end = newPos2;
        this.goalPos = newPos1;
      } else if (type === 3) {
        this.end = this.pos2;
        this.movingPos = this.start = newPos2;
        this.goalPos = newPos1;
      } else {
        this.end = this.pos2;
        this.movingPos = this.start = newPos1;
        this.goalPos = newPos2;
      }

      this.addPos = {
        x: (this.goalPos.x - this.movingPos.x) / 7,
        y: (this.goalPos.y - this.movingPos.y) / 7,
      };
    }
    // 动画调用 时刻
    update() {
      if (this.frontIsStatic()) {
        this.moving = this.shouldMove;
      }

      if (this.moving) {
        this.updateToGoal();

        if (this.equal(this.movingPos, this.goalPos)) {
          this.shouldMove = this.moving = false;
        }
      }

      if (!this.equal(this.start, this.end) || this.moving) {
        frontCtx.moveTo(this.start.x, this.start.y);
        frontCtx.lineTo(this.end.x, this.end.y);
      }
    }
    frontIsStatic() {
      return !this.frontLine || (this.frontLine && this.frontLine.isStatic());
    }
    isStatic() {
      return !this.moving && this.frontIsStatic();
    }
    updateToGoal() {
      if (this.movingPos.x !== this.goalPos.x) {
        this.movingPos.x += this.addPos.x;
        if (Math.abs(this.movingPos.x - this.goalPos.x) <= 0.1) {
          this.movingPos.x = this.goalPos.x;
        }
      }

      if (this.movingPos.y !== this.goalPos.y) {
        this.movingPos.y += this.addPos.y;
        if (Math.abs(this.movingPos.y - this.goalPos.y) <= 0.1) {
          this.movingPos.y = this.goalPos.y;
        }
      }
    }
    equal(pos1, pos2) {
      return pos1.x === pos2.x && pos1.y === pos2.y;
    }
  }
  function initLines() {
    backCtx.clearRect(0, 0, back.width, back.height);
    backCtx.lineWidth = frontCtx.lineWidth = lineWidth;
    backCtx.fillStyle = color;
    var startX = 50;
    var distance = 4;
    var y = middleLinePosY;
    var a = distance;
    var b = a + numWidth;
    var c = y - halfNumHeight;
    var d = y + halfNumHeight;

    let itemLines = Object.keys(lines)
    for (let j = 0; j < itemLines.length; j++) {
      let fingerList = lines[itemLines[j]]//4


      for (let k = 0; k < fingerList.length; k++) {
        var e = startX + a;
        var f = startX + b;
        var coors = [
          { x: e, y: y }, // left-mid
          { x: e, y: c }, // left-top
          { x: f, y: c }, // right-top
          { x: f, y: y }, // right-mid
          { x: e, y: y }, // left-mid
          { x: e, y: d }, // left-bottom
          { x: f, y: d }, // right-bottom
          { x: f, y: y }, // right-mid
        ];
        backCtx.beginPath();
        backCtx.moveTo(coors[0].x, coors[0].y);
        for (let y = 1; y < 8; y++) {
          backCtx.lineTo(coors[y].x, coors[y].y);
          var line = new Line(coors[y - 1], coors[y], lines[lines.length - 1]);
          fingerList[k].push(line);
        }
        backCtx.strokeStyle = '#eee';
        backCtx.stroke();
        startX += numWidth + distance * 2;
      }
      backCtx.fillText(timeLabel[itemLines[j]], startX, d);
      startX += 20
    }
  }
  function updateLines(date) {
    let newDate = {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      second: date.getSeconds(),
    }
    Object.keys(newDate).forEach(i => {
      newDate[i] = newDate[i] + ''
      if (i !== 'year' && newDate[i].length === 1) {
        newDate[i] = '0' + newDate[i]
      }
    })
    Object.keys(lines).forEach(i => {
      let numStr = newDate[i]//'2018'
      for (let j = 0; j < numStr.length; j++) {
        let newVals = timeMap[numStr[j]];//10111111
        let oldLines = lines[i][j]
        for (let k = 0; k < 7; k++) {
          var val = newVals[k];
          var line = oldLines[k];
          if (val === line.value) {
            continue
          }
          line.value = val;
          if (val === '1') {
            if (lines[k + 1] && lines[k + 1].value === '1') {
              line.move(3);
            } else {
              // 1 <- 2
              line.move(1);
            }
          } else {
            if (lines[k - 1] && lines[k - 1].value === '1') {
              // 1 -> 2
              line.move(2);
            } else {
              // 1 <- 2
              line.move(4);
            }
          }
        }
      }

    })
  }

  initLines()

  function animate() {
    frontCtx.clearRect(0, 0, front.width, front.height);
    frontCtx.beginPath();
    Object.keys(lines).forEach(function (key) {
      lines[key].forEach(function (fingerList) {
        fingerList.forEach(line => {
          line.update();
        })
      });
    });

    frontCtx.stroke();
    requestAnimationFrame(animate)
  }
  // 动画
  animate()

  return {
    render: function (time) {
      updateLines(time)
    }
  }
}

let renderer = init(20, 30, 4)
updateTime()
function updateTime() {
  renderer.render(new Date())
  setTimeout(updateTime, 1000);
}