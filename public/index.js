$('.dropdown-toggle').dropdown();

function postTest(){
  var request = new XMLHttpRequest();
  var requestURL = window.location.pathname + '/submit';
  console.log(requestURL);
  request.open('POST',requestURL);
  var userObj = {
    username:1,
    platform:2,
    title:'wwii',
    days:1,
    type:'core',
    time:'monthly',
    mode:'career'
  };
  var requestBody = JSON.stringify(userObj);
  request.setRequestHeader(
    'Content-Type','application/json'
  );
  request.send(requestBody);
}

function uploadForm(){
  var username = submitForm['name'].value;
  var platform;
  if(submitForm['platform-psn'].checked){
    platform = submitForm['platform-psn'].value;
  }
  else if(submitForm['platform-xbl'].checked){
    platform = submitForm['platform-xbl'].value;
  }
  else{
    platform = submitForm['platform-steam'].value;
  }

  var request = new XMLHttpRequest();
  var requestURL = window.location.pathname + '/submit';
  request.open('POST',requestURL);
  var userObj = {
    username:username,
    platform:platform,
    title:'wwii',
    days:1,
    type:'core',
    time:'monthly',
    mode:'career'
  };
  var requestBody = JSON.stringify(userObj);
  request.setRequestHeader(
    'Content-Type','application/json'
  );
  request.addEventListener('load',function(event){
    if(event.target.status!=200){
      alert("form submit failure");
    }
    else{
      request.open('GET','http://google.com');
    }
  });

  request.send(requestBody);
}

function utilityUpload(){

  var username = utilityForm['name'].value;

  var request = new XMLHttpRequest();
  var requestURL = window.location.pathname + 'submit';
  console.log(requestURL);

  request.open('POST',requestURL);
  var userObj = {
    username:username
  };
  var requestBody = JSON.stringify(userObj);
  request.setRequestHeader(
    'Content-Type','application/json'
  );

  request.send(requestBody);

  var url = window.location.href;
  window.location.href = url + "result/" + username;

}

/*
var submitButton = document.getElementById('submit-button');
var submitForm = document.forms[0];
submitButton.addEventListener('click',uploadForm);

var testButton = document.getElementById('test-button');
testButton.addEventListener('click',postTest);
*/
var utilityButton = document.getElementById('utility-submit-button');
var utilityForm = document.forms[0];
utilityButton.addEventListener('click',utilityUpload);
