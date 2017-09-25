function startApp() {

    // NEEDED FUNCTIONS FOR STARTING TH APP
    showHideMenuLinks();
    showView('viewHome');


    //IMPLEMENTING THE LINKS
    $('#linkHome').click(viewHome);
    $('#linkLogin').click(viewLogin);
    $('#linkRegister').click(viewRegister);
    $('#linkListAds').click(viewListAds);
    $('#linkCreateAd').click(viewCreateAd);
    $('#linkLogout').click(logout);

    //IMPLEMENTING BUTTON EVENTS

    $('#buttonLoginUser').click(login);
    $('#buttonRegisterUser').click(register);
    $('#buttonCreateAd').click(createAd);
    $('#buttonEditAd').click(editAd);

    //IMPLEMENT CONST LINKS
    const mainSection = $('main > section');
    const baseUrl = 'https://baas.kinvey.com/';
    const appId = 'kid_rJrh7ANOW';
    const appSecret = 'dd2a9beee0fc4472a1ce422b5b527a09';
    const logedInUser = $('#loggedInUser');
    const loadingBox = $('#loadingBox');
    const infoBox = $('#infoBox');

    const authorizationHeaders = {
        'Authorization': 'Basic ' + btoa(appId + ':' + appSecret),
        'Content-Type': 'application/json'
    };

    //IMPLEMENTING ALERT FUNCTIONS

    $(document).on({
        ajaxStart: function() {$('#loadingBox').show()},
        ajaxStop: function() {$('#loadingBox').hide()}
    });

    function showInfo(message){
        infoBox.text(message);
        infoBox.show();

        setTimeout(function(){
            infoBox.fadeOut();
        }, 3000)
    }

    //IMPLEMENT LINK FUNCTIONS
    function showView(viewName){
        $('main > section').hide();
        $('#' + viewName).show();
    }

    function viewHome(){
       showView('viewHome')
    }

    function viewLogin(){
        showView('viewLogin');
    }

    function viewRegister(){
        showView('viewRegister');
    }

    function viewListAds(){
        showView('viewAds');
        listAds();
    }

    function viewCreateAd(){
        showView('viewCreateAd');

    }

    function showHideMenuLinks(){
        $('#linkHome').show();
        if(sessionStorage.getItem('authToken')){
            $('#linkLogin').hide();
            $('#linkRegister').hide();
            $('#linkListAds').show();
            $('#linkCreateAd').show();
            $('#linkLogout').show();
        } else{
            $('#linkLogin').show();
            $('#linkRegister').show();
            $('#linkListAds').hide();
            $('#linkCreateAd').hide();
            $('#linkLogout').hide();
        }
    }

    //AJAX REQUESTS

    function register(){

        let username = $('#viewRegister input[name=username]');
        let password = $('#viewRegister input[name=passwd]');


       let regData = {
           username: username.val(),
           password: password.val()
       };

       let request = {
           url: baseUrl + 'user/' + appId + '/',
           method: 'POST',
           data: JSON.stringify(regData),
           headers: authorizationHeaders,
           success: registerSuccess,
           error: handleAjaxError
       };

       $.ajax(request);

        function registerSuccess(data){
            saveDataInSession(data);
            showHideMenuLinks();
            viewHome();
            showInfo('Register successful.')
        }

        username.val('');
        password.val('');
    }

    function saveDataInSession(data){
        let authToken = data._kmd.authtoken;
        sessionStorage.setItem('authToken', authToken);
        let userId = data._id;
        sessionStorage.setItem('userId', userId);
        let username = data.username;
        logedInUser.text('Welcome ' + username + '!');
        sessionStorage.setItem('username', username);
    }

    function login(){
        let username = $('#viewLogin input[name=username]');
        let password = $('#viewLogin input[name=passwd]');


        let regData = {
            username: username.val(),
            password: password.val()
        };

        let request = {
            url: baseUrl + 'user/' + appId + '/login',
            method: 'POST',
            data: JSON.stringify(regData),
            headers: authorizationHeaders,
            success: loginSuccess,
            error: handleAjaxError
        };

        $.ajax(request);

        function loginSuccess(data){
            saveDataInSession(data);
            showHideMenuLinks();
            viewListAds();
            showInfo('Login successful.');
        }
        username.val('');
        password.val('');
    }

    function logout(){
        logedInUser.empty();
        sessionStorage.clear();
        showHideMenuLinks();
        showView('viewHome');
    }

    function listAds(){

        let authToken = sessionStorage.getItem('authToken');

        let request = {
            url: baseUrl + 'appdata/' + appId + '/products',
            method: 'GET',
            headers:{
                'Authorization': 'Kinvey ' + authToken,
                'Content-Type': 'application/json'
            },
            success: showProducts,
            error: handleAjaxError
        };

        $.ajax(request);

        function showProducts(data){
            $('#ads').empty();
            let productsTable = $('<table>')
                .append($('<tr>')
                    .append('<th>Title</th><th>Publisher</th><th>Description</th><th>Price</th>' +
                        '<th>Date Published</th><th>Actions</th>'));

            for(let item of data){
                let title = item.title;
                let date = item.date;
                let desc = item.description;
                let price = item.price;
                let publisher = item.publisher;

                let row = $('<tr>')
                    .append(`<td>${title}</td>`)
                    .append(`<td>${publisher}</td>`)
                    .append(`<td>${desc}</td>`)
                    .append(`<td>${price}</td>`)
                    .append(`<td>${date}</td>`)
                    .append(`<td>actions</td>`);

                productsTable.append(row);
                $('#ads').append(productsTable);
            }
        }
    }

    function createAd(){
        let title = $('#formCreateAd input[name=title]');
        let publisher = sessionStorage.getItem('username');
        let description = $('#formCreateAd textarea[name=description]');
        let datePublished = $('#formCreateAd input[name=datePublished]');
        let price = $('#formCreateAd input[name=price]');
        let authToken = sessionStorage.getItem('authToken');

        let createData = {
            title: title.val(),
            publisher: publisher,
            description: description.val(),
            date: datePublished.val(),
            price: price.val()
        };

        let request = {
            url: baseUrl + 'appdata/' + appId + '/products',
            method: 'POST',
            headers:{
                'Authorization': 'Kinvey ' + authToken,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(createData),
            success: createProduct,
            error: handleAjaxError
        };

        $.ajax(request);

        function createProduct(data){
            listAds();
            showInfo('Product created');
            viewListAds();
        }
    }

    function editAd() {
        alert('4');
    }

    function handleAjaxError(reason){

    }
}