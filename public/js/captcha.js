//provide support for safari and other ios & non-compliant browsers
function hasHtml5Validation () {
  return typeof document.createElement('input').checkValidity === 'function';
}

if (hasHtml5Validation()) {
  $('.validate-form').submit(function (e) {
    if (!this.checkValidity()) {
      e.preventDefault();
      $(this).addClass('invalid');
      $('#status').html('invalid');
    } else {
      $(this).removeClass('invalid');
      $('#status').html('submitted');
    }
  });
}
//math to text functions by Ian L. of Jafty.com
function makenumber(numb){
if(numb==1)return "one";
if(numb==2)return "two";
if(numb==3)return "three";
if(numb==4)return "four";
if(numb==5)return "five";
if(numb==6)return "six";
if(numb==7)return "seven";
if(numb==8)return "eight";
if(numb==9)return "nine";
if(numb==10)return "ten";
}//end makenumber function
function placenumber(){
var x = Math.floor((Math.random() * 10) + 1);
var y = Math.floor((Math.random() * 10) + 1);
var no1 = makenumber(x);
var no2 = makenumber(y);
var ans = x+y;
document.getElementById('answer').pattern=ans;
document.getElementById("no1").innerHTML = x;
document.getElementById("no2").innerHTML = y;
}//end placenumber function