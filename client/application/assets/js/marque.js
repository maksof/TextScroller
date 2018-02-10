function objWidth(obj) {
  if(obj.offsetWidth) return  obj.offsetWidth;
  if (obj.clip) return obj.clip.width; return 0;
}

function changePageText(text) {

  var test = document.getElementById("Test");
      test.innerHTML = text;
  var width = (test.clientWidth + 1) + 'px';

  for (var i = 0; i < mqr[0].ary.length; i++) {
    var diffInWidth = parseInt(mqr[0].ary[0].style.width) - parseInt(width);
    mqr[0].ary[i].innerHTML = text;
    mqr[0].ary[i].innerText = text;
    mqr[0].ary[i].style.left = '1300px';
    mqr[0].ary[i].style.width = width;
  };
}

function restartMarque(text) {

  var test = document.getElementById("Test");
      test.innerHTML = text;
  var width = (test.clientWidth + 1) + 'px';

  for (var i = 0; i < mqr[0].ary.length; i++) {
    var diffInWidth = parseInt(mqr[0].ary[0].style.width) - parseInt(width);
    mqr[0].ary[i].innerHTML = text;
    mqr[0].ary[i].innerText = text;
    mqr[0].ary[i].style.left = '1300px';
    mqr[0].ary[i].style.width = width;
  };
}

var mqr = [];

function mq(id){


  var test = document.getElementById("Test");
  var width = (test.clientWidth + 1);

  this.mqo=document.getElementById(id); 
  var wid = objWidth(this.mqo.getElementsByTagName('span')[0])+ 5; 
  var fulwid = objWidth(this.mqo); 
  var txt = this.mqo.getElementsByTagName('span')[0].innerHTML; 
  this.mqo.innerHTML = '';
  this.mqo.ary=[]; 
  var maxw = Math.ceil(fulwid/wid)+1; 
  for (var i=0;i < maxw;i++){
    this.mqo.ary[i]=document.createElement('div');
    this.mqo.ary[i].innerHTML = txt;
    this.mqo.ary[i].style.position = 'relative';
    this.mqo.ary[i].style.margin = "20px 0% 0% 0%";
    this.mqo.ary[i].style.font = "22px open-dyslexic";
    this.mqo.ary[i].style.left = (wid*i)+'px';
    this.mqo.ary[i].style.width = parseInt(width + 2000 ) +'px';
    this.mqo.ary[i].style.height = '45px';
    this.mqo.appendChild(this.mqo.ary[i]);
  } 
  mqr.push(this.mqo);
}

function mqRotate(mqr, speed){
  if (!mqr) return;
  for (var j=mqr.length - 1; j > -1; j--) {
    maxa = mqr[j].ary.length;
    for (var i=0; i<maxa; i++){ 
      var x = mqr[j].ary[i].style;
      x.left=(parseInt(x.left,10)-1)+'px';
    } 
    var y = mqr[j].ary[0].style;
    if (parseInt(y.left,10)+parseInt(y.width,10)<0) {
      var z = mqr[j].ary.shift();
      z.style.left = (parseInt(z.style.left) + parseInt(z.style.width)*maxa) + 'px';
      mqr[j].ary.push(z);
    }
  }
  if (mqr[0] != undefined) {
    mqr[0].TO=setTimeout('mqRotate(mqr, '+speed+')',speed);  
  }  
}