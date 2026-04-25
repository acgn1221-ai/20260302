let input, button, toggleBtn, slider, selectMode, iframeBtn, selectWeb;
let isMoving = true; // 控制是否移動
let xOffset = 0; // 文字的水平位移量
let petals = []; // 花瓣物件陣列
let angle = 0; // 用於控制動畫的時間變數
let petalColor; // 花瓣顏色

function setup() {
  createCanvas(windowWidth, windowHeight);//全螢幕畫布
  input = createInput('1234567890');
  input.position(10, 10);//框在左上角的位置
  input.style('font-size', '35px');
  input.style('width', '400px');
  input.style('padding', '10px');
  input.style('border', '5px solid #778da9');
  input.style('border-radius', '10px');
  input.style('color', '#1b263b');

  button = createButton('清除');
  button.position(450, 28);
  button.size(80, 35);
  button.style('font-size', '20px');
  button.style('background-color', '#fff');
  button.style('border', '5px solid #415a77');
  button.style('border-radius', '10px');
  button.mousePressed(() => input.value(''));

  toggleBtn = createButton('暫停');
  toggleBtn.position(540, 28);
  toggleBtn.size(80, 35);
  toggleBtn.style('font-size', '20px');
  toggleBtn.style('background-color', '#fff');
  toggleBtn.style('border', '5px solid #415a77');
  toggleBtn.style('border-radius', '10px');
  toggleBtn.mousePressed(() => {
    isMoving = !isMoving;
    toggleBtn.html(isMoving ? '暫停' : '開始');
  });

  slider = createSlider(15, 75, 30); // 最小值 15, 最大值 75, 預設值 30
  slider.position(640, 28);
  slider.size(200);

  selectMode = createSelect();
  selectMode.position(860, 28);
  selectMode.option('跑馬燈');
  selectMode.option('波浪');
  selectMode.option('跳動');
  selectMode.style('font-size', '18px');

  // 新增網頁選擇選單
  selectWeb = createSelect();
  selectWeb.position(960, 28);
  selectWeb.option('淡江大學');
  selectWeb.option('淡江大學教科系');
  selectWeb.option('遊戲');
  selectWeb.style('font-size', '18px');
  selectWeb.changed(() => {
    if (selectWeb.value() === '淡江大學') iframe.attribute('src', 'https://www.tku.edu.tw');
    if (selectWeb.value() === '淡江大學教科系') iframe.attribute('src', 'https://www.et.tku.edu.tw/');
    if (selectWeb.value() === '遊戲') iframe.attribute('src', 'https://acgn1221-ai.github.io/20251225/');
  });

  // 初始化花瓣
  for (let i = 0; i < 100; i++) {
    petals.push({
      x: random(width),
      y: random(-height, height),
      size: random(8, 16),
      speed: random(1, 3),
      xOffset: random(100) // 用於左右飄動的隨機偏移
    });
  }

  petalColor = color('#ffb7b2'); // 初始花瓣顏色

  iframeBtn = createButton('隱藏網頁');
  iframeBtn.position(1150, 28);
  iframeBtn.size(120, 35);
  iframeBtn.style('font-size', '20px');
  iframeBtn.style('background-color', '#fff');
  iframeBtn.style('border', '5px solid #415a77');
  iframeBtn.style('border-radius', '10px');

  // 產生一個 DIV，位於視窗中間，四周保留 200px 內距
  let div = createDiv();
  div.position(100, 100);
  div.size(windowWidth - 200, windowHeight - 200);
  div.style('z-index', '100'); // 確保浮在畫布上方
  div.style('background-color', 'rgba(255, 255, 255, 0.5)'); // 半透明背景
  div.style('box-shadow', '0px 0px 20px rgba(0, 0, 0, 0.5)'); // 陰影效果

  let iframe = createElement('iframe');
  iframe.attribute('src', 'https://www.tku.edu.tw');
  iframe.style('width', '100%');
  iframe.style('height', '100%');
  iframe.style('opacity', '0.9'); // 網頁透明度 90%
  iframe.parent(div); // 將 iframe 放入 div 中

  let isIframeOpen = true;
  iframeBtn.mousePressed(() => {
    isIframeOpen = !isIframeOpen;
    iframeBtn.html(isIframeOpen ? '隱藏網頁' : '顯示網頁');
    div.style('display', isIframeOpen ? 'block' : 'none');
  });
}

function draw() {
  background('#e0e1dd');
  
  if (isMoving) {
    angle += 0.05; // 只有在移動時才更新動畫時間
  }

  // 花瓣顏色漸變動畫 (依照 ffe5ec -> fb6f92 變化)
  let petalPalette = ['#ffe5ec', '#ffc2d1', '#ffb3c6', '#ff8fab', '#fb6f92'];
  let colorTick = angle * 20; // 使用 angle 作為時間基準
  let colorPeriod = 60;
  let pIdx = floor(colorTick / colorPeriod) % petalPalette.length;
  let nextPIdx = (pIdx + 1) % petalPalette.length;
  let pAmt = (colorTick % colorPeriod) / colorPeriod;
  let dynamicPetalColor = lerpColor(color(petalPalette[pIdx]), color(petalPalette[nextPIdx]), pAmt);

  // 繪製花瓣背景
  noStroke();
  fill(dynamicPetalColor); // 使用動態漸變顏色
  for (let p of petals) {
    // 花瓣的自然飄落動畫
    if (isMoving) {
      p.y += p.speed; // 往下落下
      p.x += sin(angle + p.xOffset) * 0.5; // 左右飄動 (使用 angle)

      // 如果花瓣超出邊界，重置位置到上方
      if (p.y > height + 10) {
        p.y = random(-100, -10);
        p.x = random(width);
      }
    }

    // 滑鼠互動效果 (排斥)
    let interactionRadius = 100;
    let d = dist(p.x, p.y, mouseX, mouseY);
    if (d < interactionRadius) {
      let force = createVector(p.x - mouseX, p.y - mouseY);
      let forceMagnitude = map(d, 0, interactionRadius, 5, 0); // 距離越近，力道越強
      force.setMag(forceMagnitude);
      p.x += force.x;
      p.y += force.y;
    }

    ellipse(p.x, p.y, p.size, p.size * 1.2); // 在最終位置繪製花瓣
  }

  let txt = input.value();

  // 文字顏色漸變動畫 (依照 03045e -> 48cae4 變化)
  let textPalette = ['#03045e', '#023e8a', '#0077b6', '#0096c7', '#00b4d8', '#48cae4'];
  // 這裡複用上面的 colorTick 和 colorPeriod 變數
  let cIdx = floor(colorTick / colorPeriod) % textPalette.length;
  let nextCIdx = (cIdx + 1) % textPalette.length;
  let cAmt = (colorTick % colorPeriod) / colorPeriod;
  let dynamicTextColor = lerpColor(color(textPalette[cIdx]), color(textPalette[nextCIdx]), cAmt);
  
  input.style('color', dynamicTextColor.toString()); // 同步改變輸入框文字顏色
  fill(dynamicTextColor); // 改變畫布文字顏色

  textSize(slider.value());
  textStyle(NORMAL); // 確保文字不歪斜
  textAlign(LEFT, CENTER);
  
  let w = textWidth(txt) + 50; // 文字寬度 + 50px 間距
  if (w > 0) {
    let mode = selectMode.value();
    
    // 跑馬燈位移邏輯
    if (isMoving && mode === '跑馬燈') {
      xOffset -= 2; // 每幀向左移動 2 像素
    }
    
    let startX = xOffset % w; // 計算循環的起始位置

    // 外層迴圈：從 y=100 開始，每隔 "文字大小 + 25px" 換行
    for (let y = 100; y < height; y += slider.value() + 25) {
      // 內層迴圈：水平重複文字
      for (let x = startX; x < width; x += w) {
        let currentY = y;
        let currentX = x;
        // 只有在移動(isMoving)時才應用波浪或上下移動效果，暫停時回歸直線
        if (isMoving) {
          if (mode === '波浪') {
            currentY += sin(angle + (x - xOffset) * 0.01) * 30; // 波浪狀起伏
          } else if (mode === '跳動') {
            // 果凍晃動效果 (讓 X 與 Y 軸依照不同相位和頻率晃動)
            currentX += sin(angle * 5 + y * 0.05) * 15;
            currentY += cos(angle * 5 + x * 0.05) * 15;
          }
        }
        text(txt, currentX, currentY);
      }
    }
  }
}
