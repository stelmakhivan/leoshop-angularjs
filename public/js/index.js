'use strict';
const app = angular.module("shopApp", ["ngRoute", "ngDialog", "ui.bootstrap", "firebase"]);
const socket = io.connect();

//Remove %2F and # from url of site
app.config(["$locationProvider", function
    ($locationProvider) {
    $locationProvider.hashPrefix("");
    $locationProvider.html5Mode(true);
}]);

//Create adresses
app.config(function ($routeProvider) {
    $routeProvider
        .otherwise({
            redirectTo: "/"
        });
});

app.controller("myCtrl", function ($scope, $http) {

});

app.filter('offset', function () {
    return function (input, start) {
        if (!input || !input.length) {
            return;
        }
        start = +start;
        return input.slice(start);
    };
});
app.directive("headerBlock", function () {
    return {
        replace: true,
        templateUrl: "../template/headerBlock.html",
        controller: function ($scope) {
            $("#login-btn").on("click", function () {
                $("#login-tab").addClass("in active");
                $("#sectionA").addClass("in active");
                $("#sectionB").removeClass("in active");
                $("#sign-tab").removeClass("in active");
            });
            $("#sign-btn").on("click", function () {
                $("#login-tab").removeClass("in active");
                $("#sectionB").addClass("in active");
                $("#sectionA").removeClass("in active");
                $("#sign-tab").addClass("in active");
            });
        }
    }
});
app.directive("loginformBlock", function () {
    return {
        replace: true,
        templateUrl: "../template/loginForm.html",
        controller: function ($scope, $http, ngDialog) {
            $scope.matchPattern = new RegExp("[a-z]");
            // $scope.phonePattern = new RegExp("^(\\+?\\d+)?\\d{11}");
            $scope.phonePattern = new RegExp("^((\\+3|8)+([0-9]){11})$");

            //user loged in
            if (localStorage.userName != 'default') {
                if (localStorage.userName != undefined) {
                    if(localStorage.userName=="admin"){
                        $scope.isAdmin = true;
                    };
                    $scope.loginBtn = false;
                    $scope.userIn = true;
                    $scope.signBtn = false;
                    $scope.userSuccess = localStorage.userName;
                    $scope.exitBtn = true;
                } else {
                    localStorage.userName = "default";
                    $scope.loginBtn = true;
                    $scope.signBtn = true;
                    $scope.exitBtn = false;
                    $scope.userIn = false;
                    $scope.isAdmin = false;
                }
                ;
            } else {
                $scope.loginBtn = true;
                $scope.signBtn = true;
            }
            socket.on('logIn', function (data) {
                if (data == "Wrong Password" || data == "Wrong Login") {
                    ngDialog.open({
                        template: '../template/welcome.html',
                        className: 'ngdialog-theme-default',
                        controller: function ($scope) {
                            $scope.statusBack = data;
                        }
                    });
                } else {
                    $('#form_enter').modal('hide');
                    $scope.userIn = true;
                    $scope.userSuccess = data;
                    $scope.loginBtn = false;
                    $scope.signBtn = false;
                    $scope.exitBtn = true;
                    localStorage.userName = $scope.login;
                    if(localStorage.userName=="admin"){
                        $scope.isAdmin = true;
                    };
                }
                $scope.$digest();
            });
            // verify login and password
            $scope.check = function () {
                socket.emit('logIn', {
                    login: $scope.login,
                    password: $scope.password
                });
                // $scope.login = '';
                // $scope.password = '';
                // $http.post('http://localhost:8000/users', obj)
                //     .then(function successCallback(response) {
                //         if (response.data=="Wrong Password"||response.data=="Wrong Login") {
                //             ngDialog.open({
                //                 template: '../template/welcome.html',
                //                 className: 'ngdialog-theme-default',
                //                 controller: function ($scope) {
                //                     $scope.statusBack =  response.data;
                //                 }
                //             });
                //         }else{
                //         $('#form_enter').modal('hide');
                //             $scope.userIn = true;
                //             $scope.userSuccess = response.data;
                //             $scope.loginBtn = false;
                //             $scope.signBtn = false;
                //             $scope.exitBtn = true;
                //             localStorage.userName = $scope.login;
                //         }
                //     }, function errorCallback(response) {
                //         console.log("Error!!!" + response.err);
                //     });
            };
            $scope.logOut = function () {
                localStorage.userName = "default";
                if (localStorage.userName == 'default' || localStorage.userName == undefined) {
                    $scope.userSuccess = "You"
                };
                $scope.userIn = false;
                $scope.loginBtn = true;
                $scope.signBtn = true;
                $scope.exitBtn = false;
                $scope.login = "";
                $scope.password = "";
                $scope.closeChat();
                $scope.isAdmin = false;
            };
            //remind forget password
            //open modal window
            $scope.forget = function () {
                ngDialog.open({
                    template: '/template/forget.html',
                    className: 'ngdialog-theme-default',
                });
            };

            $scope.getError = function (error) {
                if (angular.isDefined(error)) {
                    if (error.required) {
                        return "Input must be required"
                    } else if (error.email) {
                        return "Wrong email"
                    } else if (error.minlength) {
                        return "Must be more than 2 characters"
                    } else if (error.maxlength) {
                        return "Must be less than 15 characters"
                    } else if (error.pattern) {
                        return "Symbols a-z"
                    }
                }
            };
            $scope.getErrorPhone = function (error) {
                if (angular.isDefined(error)) {
                    if (error.required) {
                        return "Input must be required"
                    } else if (error.pattern) {
                        return "Enter the correct phone number, for example +380671234567"
                    }
                }
            };
            //Verify code send to phone number
            $scope.code = "";
            $scope.verification = function () {
                $scope.code = Math.floor(Math.random() * (9000 - 3000 + 1)) + 3000;
                let obj1 = {
                    code: $scope.code,
                    number: $scope.newPhone
                };
                $http.post('http://localhost:8000/testtwilio/', obj1)
                    .then(function successCallback(response) {

                    }, function errorCallback(response) {
                        console.log("Error!!!" + response.err);
                    });
            };
            //Registration
            $scope.signUp = function () {
                socket.emit('signUp', {
                    login: $scope.newLogin,
                    password: $scope.newPassword,
                    mail: $scope.newMail
                });
                $scope.login = '';
                $scope.password = '';
            };
            socket.on('signUp', function (data) {
                if ((data == "pls choose another login") || (data == "pls choose another mail")) {
                    alert(data);
                } else {
                    $('#form_enter').modal('hide');
                    alert("Registered " + $scope.newLogin);
                    $scope.userIn = true;
                    $scope.userSuccess = data;
                    $scope.loginBtn = false;
                    $scope.signBtn = false;
                    $scope.exitBtn = true;
                    localStorage.userName = $scope.newLogin;
                    $scope.newLogin = "";
                    $scope.newPassword = "";
                    $scope.newMail = "";
                    $scope.newPhone = "";
                    $scope.newVerCode = "";
                }
                $scope.$digest();
            });
            $scope.registration = function () {
                if ($scope.newVerCode == $scope.code) {
                    socket.emit('signUp', {
                        login: $scope.newLogin,
                        password: $scope.newPassword,
                        mail: $scope.newMail,
                    });
                    // let obj2 = {
                    //     login: $scope.newLogin,
                    //     password: $scope.newPassword,
                    //     mail: $scope.newMail,
                    // };
                    // $http.post('http://localhost:8000/signUp', obj2)
                    //     .then(function successCallback(response) {
                    //         if((response.data=="pls choose another login")||(response.data=="pls choose another mail")){
                    //             alert(response.data);
                    //         }else{
                    //             $('#form_enter').modal('hide');
                    //             alert("Registered " + $scope.newLogin);
                    //             $scope.userIn = true;
                    //             $scope.userSuccess = response.data;
                    //             $scope.loginBtn = false;
                    //             $scope.signBtn = false;
                    //             $scope.exitBtn = true;
                    //             localStorage.userName = $scope.newLogin;
                    //             $scope.newLogin = "";
                    //             $scope.newPassword = "";
                    //             $scope.newMail = "";
                    //             $scope.newPhone = "";
                    //             $scope.newVerCode = "";
                    //         }
                    //     }, function errorCallback(response) {
                    //         alert("Error!!!" + response.err);
                    //     });
                    ngDialog.closeAll();
                } else {
                    alert("Wrong Verification Code!");
                }
            };
        }
    }
});

//directive remind password
app.directive('forgetBlock', function () {
    return {
        replace: true,
        templateUrl: 'template/forget-block.html',
        controller: function ($scope, $http, ngDialog) {
            //send mail to the server for sending a forgotten password
            $scope.remind = function () {
                socket.emit('remind', {
                    mail: $scope.remindMail
                });
                // let obj = {
                //     mail: $scope.remindMail
                // };
                // $http.post('http://localhost:8000/remind', obj)
                //     .then(function successCallback(response) {
                //         alert(response.data);
                //     }, function errorCallback(response) {
                //         console.log("Error!!!" + response.err);
                //     });
                // $('#form_enter').modal('hide');
                // ngDialog.closeAll();
            };
            socket.on('remind', function (data) {
                alert(data);
                $('#form_enter').modal('hide');
                ngDialog.closeAll();
                $scope.$digest();
            });
        }
    }
});

app.directive("slidermainBlock", function () {
    return {
        replace: true,
        templateUrl: "../template/sliderMain.html",
        controller: function ($scope) {
            $(document).ready(function () {
                let mainSlider = new Swiper('.main-slider', {
                    direction: 'horizontal',
                    loop: true,
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev'
                    },
                    keyboard: true,
                    speed: 2000,
                    autoplay: {
                        delay: 2000
                    },
                    effect: 'coverflow'
                });
            })
        }
    }
});

app.directive("maincontentBlock", function () {
    return {
        replace: true,
        templateUrl: "../template/mainContent.html",
        controller: function ($scope, $http, ngDialog) {
            $(document).ready(function () {
                let asideSlider = new Swiper('.aside-slider', {
                    direction: 'horizontal',
                    loop: true,
                    effect: 'slide',
                    pagination: {
                        el: '.swiper-pagination',
                        type: "bullets",
                        clickable: true,
                        renderBullet: function (index, className) {
                            return '<span class="' + className + '">' + '</span>';
                        }
                    }
                })
            });
            //Receive list of items when document is ready
            // $scope.getItems = function() {
            //     socket.emit('getItems', { my: 'data' });
            // };
            // $scope.getItems = function() {
            //     return socket.emit('getItems', { my: 'data' });
            // };
            // $scope.getItems();
            socket.emit('getItems', {my: 'data'});
            socket.on('getItems', function (data) {
                $scope.items = data;
                // pagination
                $scope.currentPage = 0;
                $scope.itemsPerPage = 9;
                $scope.range = function () {
                    let rangeSize = Math.floor($scope.items.length / 9);
                    let ret = [];
                    let start;

                    start = $scope.currentPage;
                    if (start > $scope.pageCount() - rangeSize) {
                        start = $scope.pageCount() - rangeSize + 1;
                    }

                    for (let i = start; i < start + rangeSize; i++) {
                        ret.push(i);
                    }
                    return ret;
                };
                $scope.prevPage = function () {
                    if ($scope.currentPage > 0) {
                        $scope.currentPage--;
                    }
                };
                $scope.prevPageDisabled = function () {
                    return $scope.currentPage === 0 ? "disabled" : "";
                };
                $scope.pageCount = function () {
                    return Math.ceil($scope.items.length / $scope.itemsPerPage) - 1;
                };

                $scope.nextPage = function () {
                    if ($scope.currentPage < $scope.pageCount()) {
                        $scope.currentPage++;
                    }
                };

                $scope.nextPageDisabled = function () {
                    return $scope.currentPage === $scope.pageCount() ? "disabled" : "";
                };

                $scope.setPage = function (n) {
                    $scope.currentPage = n
                };
                $scope.$digest();
            });
            // $http.get('/items')
            //     .then(function successCallback(response) {
            //         $scope.items = response.data;
            //         // pagination
            //         $scope.currentPage = 0;
            //         $scope.itemsPerPage = 9;
            //         $scope.range = function() {
            //             let rangeSize = Math.floor($scope.items.length/9);
            //             let ret = [];
            //             let start;
            //
            //             start = $scope.currentPage;
            //             if ( start > $scope.pageCount()-rangeSize ) {
            //                 start = $scope.pageCount()-rangeSize+1;
            //             }
            //
            //             for (let i=start; i<start+rangeSize; i++) {
            //                 ret.push(i);
            //             }
            //             return ret;
            //         };
            //         $scope.prevPage = function() {
            //             if ($scope.currentPage > 0) {
            //                 $scope.currentPage--;
            //             }
            //         };
            //         $scope.prevPageDisabled = function() {
            //             return $scope.currentPage === 0 ? "disabled" : "";
            //         };
            //         $scope.pageCount = function() {
            //             return Math.ceil($scope.items.length/$scope.itemsPerPage)-1;
            //         };
            //
            //         $scope.nextPage = function() {
            //             if ($scope.currentPage < $scope.pageCount()) {
            //                 $scope.currentPage++;
            //             }
            //         };
            //
            //         $scope.nextPageDisabled = function() {
            //             return $scope.currentPage === $scope.pageCount() ? "disabled" : "";
            //         };
            //
            //         $scope.setPage = function(n) {
            //             $scope.currentPage = n
            //         };
            //     }, function errorCallback(response) {
            //         console.log("Error!!!" + response.err);
            //     });

            //add new item
            $scope.addNewItem = function () {
                //generation new file name after upload
                var imgNumberName = 0;
                if ($scope.items[0] == undefined) {
                    imgNumberName = 1;
                } else {
                    imgNumberName = $scope.items[$scope.items.length - 1].id + 1;
                };
                //upload image
                var fd = new FormData();
                fd.append(imgNumberName, $scope.myFile);
                $http.post('/images', fd, {
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined
                    }
                })
                    .then(function successCallback() {
                        console.log("Uploaded!");
                    }, function errorCallback(response) {
                        console.log("Error!!!" + response.err);
                    });
                //send info about item into .txt file
                let obj = {
                    text: $scope.aboutNewItem
                };
                $http.post('/items-info', obj)
                    .then(function successCallback() {
                        console.log("Text in txt file");
                    }, function errorCallback(response) {
                        console.log("Error!!!" + response.err);
                    });
                //write item into mysql db
                socket.emit('items', {
                    name: $scope.nameOfNewItem,
                    price: $scope.priceOfNewItem,
                    new: "true",
                    imgSrc: "../img/" + imgNumberName + ".jpg"
                });
            };
            socket.on('items', function (data) {
                ngDialog.open({
                    template: '../template/newItem.html',
                    className: 'ngdialog-theme-default',
                    controller: function($scope){
                        $scope.nameOfNewItemSuccess = data
                    }
                });
                $scope.nameOfNewItem = "";
                $scope.priceOfNewItem = "";
                $scope.aboutNewItem = "";
                $scope.myFile = "";
                console.log(data);
                $scope.$digest();
            });
        }
    }
});
//upload file directive
app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            element.bind('change', function () {
                scope.$apply(function () {
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

app.directive("footerBlock", function () {
    return {
        replace: true,
        templateUrl: "../template/footer.html",
        controller: function ($scope) {
        }
    }
});
app.directive("chatShow", function () {
    return {
        replace: true,
        templateUrl: "../template/chatShow.html",
        controller: function ($scope) {
            // $(document).ready(function () {
            // $(".chat-show").on('click', function (e) {
            //     e.preventDefault();
            //     e.stopPropagation();
            //     $(".chat-block").show(600);
            //     $(".chat-show").css({
            //         "display": "none"
            //     });
            // });
            // $('.chat-close').on('click', function (e) {
            //     e.preventDefault();
            //     $('.chat-block').fadeOut(600);
            //     $(".chat-show").css({
            //         "display": "block"
            //     });
            //     e.stopPropagation();
            // });
            // $('.chat-block header').on('click', function (e) {
            //     $('.chat').slideToggle(300, 'swing');
            //     e.stopPropagation();
            // });
            // });
            // $scope.statusChatWindow = false;
            $scope.showChat = function () {
                $(".chat-block").show(600);
                $(".chat-show").css({
                    "display": "none"
                });
                // $scope.statusChatWindow = true;
            };
            $scope.closeChat = function () {
                $('.chat-block').fadeOut(600);
                $(".chat-show").css({
                    "display": "block"
                });
            };
            $scope.hideChat = function () {
                $('.chat').slideToggle(300, 'swing');
            };
        }
    }
});
app.directive("mainChat", function () {
    return {
        replace: true,
        templateUrl: "../template/chat.html",
        controller: function ($scope, $firebaseArray) {
            $scope.arr = [];
            $scope.date = new Date();
            var ref = firebase.database().ref().child('messages');
            $scope.messages = $firebaseArray(ref);
            if (localStorage.userName == 'default' || localStorage.userName == undefined) {
                $scope.userSuccess = "You"
            }
            $scope.start = function () {
                if ($scope.enterText) {
                    $scope.date = new Date();
                    $scope.messages.$add({
                        name: $scope.userSuccess,
                        txt: $scope.enterText,
                        time: $scope.date.toLocaleTimeString(),
                    })
                    $scope.arr.push($scope.data);
                    $scope.enterText = "";

                    //Auto Scroll
                    var height = 0;
                    $('.chat-history .chat-message').each(function (i, value) {
                        height += parseInt($(this).height());
                    });

                    height += '';

                    $('.chat-history').animate({scrollTop: height});
                }
                else {
                    alert("Input some text");
                }
            };
        }
    }
});
//directive  click on enter
app.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.myEnter);
                });
                event.preventDefault();
            }
        });
    };
});

//  directives Home Women Men Other Purchase
app.directive("homeBlock", function () {
    return {
        replace: true,
        templateUrl: "../template/home.html",
        controller: function ($scope) {
            $scope.homeStatus = true;
            $scope.chooseHome = function () {
                $scope.homeStatus = true;
                $scope.womenStatus = false;
                $scope.menStatus = false;
                $scope.otherStatus = false;
                $scope.purchaseStatus = false;
            };
        }
    }
});
app.directive("womenBlock", function () {
    return {
        replace: true,
        templateUrl: "../template/women.html",
        controller: function ($scope) {
            $scope.womenStatus = false;
            $scope.chooseWomen = function () {
                $scope.homeStatus = false;
                $scope.womenStatus = true;
                $scope.menStatus = false;
                $scope.otherStatus = false;
                $scope.purchaseStatus = false;
            };
        }
    }
});
app.directive("menBlock", function () {
    return {
        replace: true,
        templateUrl: "../template/men.html",
        controller: function ($scope) {
            $scope.menStatus = false;
            $scope.chooseMen = function () {
                $scope.homeStatus = false;
                $scope.womenStatus = false;
                $scope.menStatus = true;
                $scope.otherStatus = false;
                $scope.purchaseStatus = false;
            };

        }
    }
});
app.directive("otherBlock", function () {
    return {
        replace: true,
        templateUrl: "../template/other.html",
        controller: function ($scope) {
            $scope.otherStatus = false;
            $scope.chooseOther = function () {
                $scope.homeStatus = false;
                $scope.womenStatus = false;
                $scope.menStatus = false;
                $scope.otherStatus = true;
                $scope.purchaseStatus = false;
            };
        }
    }
});
app.directive("purchaseBlock", function () {
    return {
        replace: true,
        templateUrl: "../template/purchase.html",
        controller: function ($scope) {
            $scope.purchaseStatus = false;
            $scope.choosePurchase = function () {
                $scope.homeStatus = false;
                $scope.womenStatus = false;
                $scope.menStatus = false;
                $scope.otherStatus = false;
                $scope.purchaseStatus = true;
            };
        }
    }
});