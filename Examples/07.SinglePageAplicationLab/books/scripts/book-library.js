function startApp(){
    sessionStorage.clear();
    showHideMenuLinks();
    showView('viewHome');

    // BINDING NAVIGATION MENU ITEMS
    $('#linkHome').click(showHomeView);
    $('#linkLogin').click(showLoginView);
    $('#linkRegister').click(showRegisterView);
    $('#linkListBooks').click(listBooks);
    $('#linkCreateBook').click(showCreateBookView);
    $('#linkLogout').click(logoutUser);

    //BINDING FORM SUBMIT ACTIONS

    $('#buttonLoginUser').click(loginUser);
    $('#buttonRegisterUser').click(registerUser);
    $('#buttonCreateBook').click(createBook);
    $('#buttonEditBook').click(editBook);

    $('#infoBox, #errorBox').click(function(){
        $(this).fadeOut();
    });

    $(document).on({
        ajaxStart: function() {$('#loadingBox').show()},
        ajaxStop: function() {$('#loadingBox').hide()}
    });

    $('form').submit(function (event) {
        event.preventDefault();
    });

    //IMPLEMENTING CONSTANTS VARIABLES
    const baseUrl = 'https://baas.kinvey.com/';
    const appKey = 'kid_HJacbzG_W';
    const appSecret = '2253ceca673246039d68b2b3d2692521';
    const authorizationHeaders = {
        'Authorization': 'Basic ' + btoa(appKey + ':' + appSecret),
        'Content-Type': 'Application/json'
    };

    function showHideMenuLinks(){
        $('#linkHome').show();
        if(sessionStorage.getItem('authToken')){
            $('#linkLogin').hide();
            $('#linkRegister').hide();
            $('#linkListBooks').show();
            $('#linkCreateBook').show();
            $('#linkLogout').show();
        } else{
            $('#linkLogin').show();
            $('#linkRegister').show();
            $('#linkListBooks').hide();
            $('#linkCreateBook').hide();
            $('#linkLogout').hide();
        }
    }

    function showView(viewName){
        $('main > section').hide();
        $('#' + viewName).show();
    }

    function showHomeView(){
        showView('viewHome');
    }

    function showLoginView(){
        showView('viewLogin');
        $('#formLogin').trigger('reset');
    }

    function showRegisterView(){
        showView('viewRegister');
        $('#formRegister').trigger('reset');
    }

    function showCreateBookView(){
        showView('viewCreateBook');
        $('#formCreateBook').trigger('reset');
    }

    function loginUser(){
        let userData = {
            username: $('#formLogin input[name=username]').val(),
            password: $('#formLogin input[name=passwd]').val()
        };
        let request = {
            method: 'POST',
            url: baseUrl + 'user/' + appKey + '/login',
            headers: authorizationHeaders,
            data: JSON.stringify(userData),
            success: loginSuccess,
            error: handleAjaxError
        };

        $.ajax(request);

        function loginSuccess(userInfo){
            saveAuthInSession(userInfo);
            showHideMenuLinks();
            listBooks();
            showInfo('Login Successful.');
        }
    }

    function registerUser(){
        let userData = {
            username: $('#formRegister input[name=username]').val(),
            password: $('#formRegister input[name=passwd]').val()
        };

        let request = {
            method: 'POST',
            url: baseUrl + 'user/' + appKey + '/',
            headers: authorizationHeaders,
            data: JSON.stringify(userData),
            success: registerSuccess,
            error: handleAjaxError
        };

        $.ajax(request);

        function registerSuccess(userInfo){
            saveAuthInSession(userInfo);
            showHideMenuLinks();
            listBooks();
            showInfo('User registration successful.');
        }
    }

    function saveAuthInSession(userInfo){
        let userAuth = userInfo._kmd.authtoken;
        sessionStorage.setItem('authToken', userAuth);
        let userId = userInfo._id;
        sessionStorage.setItem('userId', userId);
        let username = userInfo.username;
        $('#loggedInUser').text('Welcome, ' + username + '!');
    }

    function handleAjaxError(response){
        let errorMsg = JSON.stringify(response);
        if(response.readyState === 0){
            errorMsg = "Cannot connect due to network error.";
        }
        if(response.responseJSON && response.responseJSON.description){
            errorMsg = response.responseJSON.description;
        }
        showError(errorMsg)
    }

    function showInfo(message){
        $('#infoBox').text(message);
        $('#infoBox').show();

        setTimeout(function(){
            $('#infoBox').fadeOut();
        }, 3000)
    }

    function showError(errorMsg){
        $('#errorBox').text('Error: ' + errorMsg);
        $('#errorBox').show()
    }

    function logoutUser(){
        sessionStorage.clear();
        $('#loggedInUser').text('');
        showHideMenuLinks();
        showView('viewHome');
        showInfo('Logout successful.');
    }

    function listBooks(){
        $('#books').empty();
        showView('viewBooks');

        let request = {
            url: baseUrl + 'appdata/' + appKey + '/books',
            method: 'GET',
            headers: getKinveyAuthHeaders(),
            success: loadBooksSuccess,
            error: handleAjaxError
        };

        $.ajax(request);

        function loadBooksSuccess(books){
            showInfo('Books loaded.');
            if(books.length === 0){
                $('#books').text('No books in the library');
            }else{
                let booksTable = $('<table>')
                    .append($('<tr>')
                    .append('<th>Title</th><th>Author</th>','<th>Description</th><th>Actions</th>'));

                for(let book of books){
                    appendBookRow(book, booksTable);
                    $('#books').append(booksTable);
                }
            }
        }
    }

    function appendBookRow(book, booksTable){
        let links = [];
        if(book._acl.creator == sessionStorage['userId']){
            let deleteLink = $('<a href="#">[Delete]</a>')
                    .click(deleteBook.bind(this, book));
            let editLink = $('<a href="#">[Edit]</a>')
                    .click(loadBookForEdit.bind(this, book));
            links = [deleteLink, ' ', editLink];
        }
        booksTable.append($('<tr>').append(
            $('<td>').text(book.title),
            $('<td>').text(book.author),
            $('<td>').text(book.description),
            $('<td>').append(links)
        ));
    }

    function getKinveyAuthHeaders(){
        return {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        };
    }

    function createBook(){
        let bookData = {
            title: $('#formCreateBook input[name=title]').val(),
            author: $('#formCreateBook input[name=author]').val(),
            description: $('#formCreateBook textarea[name=descr]').val()
        };

        let request = {
            method: 'POST',
            url: baseUrl + 'appdata/' + appKey + '/books',
            headers: getKinveyAuthHeaders(),
            data: bookData,
            success: createBooksSuccess,
            error: handleAjaxError
        };

        $.ajax(request);

        function createBooksSuccess(data){
            listBooks();
            showInfo('Book created.');
        }
    }

    function loadBookForEdit(book){
        let request = {
            method: 'GET',
            url: baseUrl + 'appdata/' + appKey + '/books/' + book._id,
            headers: getKinveyAuthHeaders(),
            success: loadBookForEditSuccess,
            error: handleAjaxError
        };

        $.ajax(request);

        function loadBookForEditSuccess(data){
            $('#formEditBook input[name=id]').val(data._id);
            $('#formEditBook input[name=title]').val(data.title);
            $('#formEditBook input[name=author]').val(data.author);
            $('#formEditBook textarea[name=descr]').val(data.description);

            showView('viewEditBook');
        }
    }

    function editBook(){
        let bookData = {
            title: $('#formEditBook input[name=title]').val(),
            author: $('#formEditBook input[name=author]').val(),
            description: $('#formEditBook textarea[name=descr]').val()
        };
        let request = {
            method: 'PUT',
            url: baseUrl + 'appdata/' + appKey + '/books/' + $('#formEditBook input[name=id]').val(),
            headers: getKinveyAuthHeaders(),
            data: bookData,
            success: editBookSuccess,
            error: handleAjaxError
        };
        $.ajax(request);

        function editBookSuccess(data){
            listBooks();
            showInfo('Book edited.');
        }
    }

    function deleteBook(book){
        let request = {
            method: 'DELETE',
            url: baseUrl + 'appdata/' + appKey + '/books/' + book._id,
            headers: getKinveyAuthHeaders(),
            success: deleteBookSuccess,
            error: handleAjaxError
        };

        $.ajax(request);

        function deleteBookSuccess(data){
            listBooks();
            showInfo('Book deleted.')
        }
    }

}