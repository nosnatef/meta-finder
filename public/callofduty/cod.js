function uploadForm(){
       var username = submitForm['name'].value;

       var request = new XMLHttpRequest();
       var requestURL = window.location.pathname + 'submit';
       requestURL = requestURL.replace('bo3.html','');
       console.log(requestURL);

       request.open('POST',requestURL);
       var userObj = {
         username:username
       };
       console.log(userObj);
       var requestBody = JSON.stringify(userObj);
       request.setRequestHeader(
         'Content-Type','application/json'
       );

       request.send(requestBody);
       console.log(requestBody);

       var url = window.location.href;
       url = url.replace('bo3.html','');
       window.location.href = url + "result/" + username;
}





var submitButton = document.getElementById('submit-button');
var submitForm = document.forms[0];
submitButton.addEventListener('click',uploadForm);
